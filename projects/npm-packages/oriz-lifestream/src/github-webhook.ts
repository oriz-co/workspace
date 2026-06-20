/**
 * Source 1 — GitHub webhook → Hookdeck → CF Worker → JSONL append.
 *
 * Hono handler intended to mount on `api.oriz.in/lifestream/git`. Hookdeck
 * sits in front for retries / replay / dead-letter. This handler:
 *
 *   1. Verifies the `X-Hub-Signature-256` HMAC against `GITHUB_WEBHOOK_SECRET`.
 *      (Hookdeck preserves the original signature header.)
 *   2. Switches on `X-GitHub-Event` (push, pull_request, release, workflow_run).
 *   3. Transforms the payload to a `GitEvent` JSONL line.
 *   4. Appends via `appendJsonl()` (the ingest endpoint owns the actual write).
 *
 * Idempotency keys per locked decision:
 *   - push          → (repo, sha)
 *   - pull_request  → (repo, pr_number)   (only `opened`)
 *   - release       → (repo, tag)         (only `published`)
 *   - workflow_run  → (repo, run_id)      (only `success`/`failure` terminal)
 *
 * Hookdeck replay-safe — the ingest worker dedupes on these keys.
 */

import { Hono } from 'hono'
import { appendJsonl } from './jsonl-append.ts'
import { GitEventSchema, type GitEvent } from './types.ts'

export interface GithubWebhookEnv {
  GITHUB_WEBHOOK_SECRET: string
  LIFESTREAM_INGEST_SECRET: string
  LIFESTREAM_INGEST_URL?: string
}

interface PushPayload {
  ref: string
  after: string
  head_commit: { id: string; message: string; author: { username?: string; name: string }; url: string } | null
  repository: { full_name: string }
  pusher: { name: string }
}

interface PullRequestPayload {
  action: string
  number: number
  pull_request: {
    title: string
    html_url: string
    user: { login: string }
  }
  repository: { full_name: string }
}

interface ReleasePayload {
  action: string
  release: {
    tag_name: string
    name: string | null
    html_url: string
    author: { login: string }
  }
  repository: { full_name: string }
}

interface WorkflowRunPayload {
  action: string
  workflow_run: {
    id: number
    name: string
    conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | null
    html_url: string
    head_sha: string
    actor: { login: string }
  }
  repository: { full_name: string }
}

/** Constant-time hex compare. */
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

async function hmacSha256Hex(secret: string, body: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Verify GitHub's `X-Hub-Signature-256: sha256=<hex>` header. */
export async function verifyGithubSignature(
  secret: string,
  body: string,
  signatureHeader: string | null,
): Promise<boolean> {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false
  const provided = signatureHeader.slice('sha256='.length)
  const expected = await hmacSha256Hex(secret, body)
  return timingSafeEqualHex(provided, expected)
}

/** ISO 8601 UTC `Z` timestamp for "now". */
function nowIsoUtc(): string {
  return new Date().toISOString().replace(/\.\d+Z$/, 'Z')
}

/**
 * Map a GitHub webhook payload to a `GitEvent`. Returns `null` when the event
 * is intentionally ignored (non-terminal workflow_run, non-`opened` PR, …).
 */
export function transformGithubEvent(
  eventName: string,
  payload: unknown,
): GitEvent | null {
  const ts = nowIsoUtc()
  if (eventName === 'push') {
    const p = payload as PushPayload
    if (!p.head_commit) return null
    return {
      ts,
      kind: 'git',
      repo: p.repository.full_name,
      event: 'push',
      sha: p.head_commit.id,
      message: p.head_commit.message,
      author: p.head_commit.author.username ?? p.head_commit.author.name,
      url: p.head_commit.url,
    }
  }
  if (eventName === 'pull_request') {
    const p = payload as PullRequestPayload
    if (p.action !== 'opened') return null
    return {
      ts,
      kind: 'git',
      repo: p.repository.full_name,
      event: 'pull_request',
      pr_number: p.number,
      message: p.pull_request.title,
      author: p.pull_request.user.login,
      url: p.pull_request.html_url,
    }
  }
  if (eventName === 'release') {
    const p = payload as ReleasePayload
    if (p.action !== 'published') return null
    return {
      ts,
      kind: 'git',
      repo: p.repository.full_name,
      event: 'release',
      tag: p.release.tag_name,
      message: p.release.name ?? p.release.tag_name,
      author: p.release.author.login,
      url: p.release.html_url,
    }
  }
  if (eventName === 'workflow_run') {
    const p = payload as WorkflowRunPayload
    if (p.action !== 'completed') return null
    const concl = p.workflow_run.conclusion
    if (concl !== 'success' && concl !== 'failure') return null
    return {
      ts,
      kind: 'git',
      repo: p.repository.full_name,
      event: 'workflow_run',
      run_id: p.workflow_run.id,
      conclusion: concl,
      sha: p.workflow_run.head_sha,
      message: `${p.workflow_run.name} → ${concl}`,
      author: p.workflow_run.actor.login,
      url: p.workflow_run.html_url,
    }
  }
  return null
}

/**
 * Build the Hono app for the GitHub webhook ingest worker. Mount under
 * `/lifestream/git` (or wherever the umbrella worker routes it). The handler
 * always responds 2xx after signature verification so Hookdeck does not retry
 * on legitimately-ignored event subtypes.
 */
export function createGithubWebhookApp(): Hono<{ Bindings: GithubWebhookEnv }> {
  const app = new Hono<{ Bindings: GithubWebhookEnv }>()

  app.post('/', async (c) => {
    const raw = await c.req.text()
    const signature = c.req.header('x-hub-signature-256') ?? null
    const eventName = c.req.header('x-github-event') ?? ''
    const delivery = c.req.header('x-github-delivery') ?? ''

    const ok = await verifyGithubSignature(c.env.GITHUB_WEBHOOK_SECRET, raw, signature)
    if (!ok) {
      return c.json({ error: 'invalid signature' }, 401)
    }

    let payload: unknown
    try {
      payload = JSON.parse(raw)
    } catch {
      return c.json({ error: 'invalid json' }, 400)
    }

    const event = transformGithubEvent(eventName, payload)
    if (!event) {
      return c.json({ ok: true, ignored: true, event: eventName, delivery })
    }

    const validated = GitEventSchema.parse(event)
    const result = await appendJsonl({
      event: validated,
      secret: c.env.LIFESTREAM_INGEST_SECRET,
      ...(c.env.LIFESTREAM_INGEST_URL ? { endpoint: c.env.LIFESTREAM_INGEST_URL } : {}),
    })
    return c.json({ ok: true, delivery, appended: true, status: result.status })
  })

  return app
}
