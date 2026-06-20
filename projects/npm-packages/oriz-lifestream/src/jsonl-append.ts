/**
 * Shared JSONL append helper — every auto-event source funnels through here.
 *
 * Posts a single validated event to the lifestream ingest endpoint
 * (`https://me.oriz.in/lifestream/ingest` by default). The ingest worker is
 * the only writer to the `chirag127/oriz-me-data/events-<YYYY>.jsonl` file —
 * pipelines never write directly. Auth is HMAC-SHA256 over the raw JSON body,
 * keyed by `LIFESTREAM_INGEST_SECRET`.
 *
 * R2 was rejected (requires a card on file) per the locked
 * `lifestream-jsonl-canonical` decision; the canonical store lives as a
 * versioned file in `chirag127/oriz-me-data` and the ingest worker handles
 * the append + commit. This helper is provider-agnostic on the storage end.
 */

import { LifestreamEventSchema, type LifestreamEvent } from './types.ts'

/** Default ingest endpoint. Override via `endpoint` parameter or `LIFESTREAM_INGEST_URL` env. */
export const DEFAULT_INGEST_URL = 'https://me.oriz.in/lifestream/ingest'

export interface AppendJsonlOptions {
  /** Pre-validated lifestream event. Will be re-validated defensively. */
  event: LifestreamEvent
  /** HMAC-SHA256 key. Pulled from `LIFESTREAM_INGEST_SECRET`. */
  secret: string
  /** Override ingest endpoint (defaults to `DEFAULT_INGEST_URL`). */
  endpoint?: string
  /** Override fetch implementation (for tests / Workers). */
  fetchImpl?: typeof fetch
}

export interface AppendJsonlResult {
  ok: true
  status: number
  /** Server-assigned line offset, when returned. */
  offset?: number
}

export class JsonlAppendError extends Error {
  readonly status: number
  readonly body: string
  constructor(status: number, body: string) {
    super(`Lifestream ingest rejected line: ${status} ${body.slice(0, 200)}`)
    this.name = 'JsonlAppendError'
    this.status = status
    this.body = body
  }
}

/** HMAC-SHA256 hex digest using Web Crypto (works in Node 20+ and Workers). */
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

/**
 * Validate-and-append a single JSONL event. Returns on 2xx, throws
 * `JsonlAppendError` on any non-2xx so the calling cron / worker can surface
 * the failure to healthchecks.io.
 */
export async function appendJsonl(opts: AppendJsonlOptions): Promise<AppendJsonlResult> {
  const event = LifestreamEventSchema.parse(opts.event)
  const body = `${JSON.stringify(event)}\n`
  const sig = await hmacSha256Hex(opts.secret, body)
  const url = opts.endpoint ?? DEFAULT_INGEST_URL
  const fetchFn = opts.fetchImpl ?? fetch
  const res = await fetchFn(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-ndjson',
      'x-lifestream-sig': `sha256=${sig}`,
      'x-lifestream-kind': event.kind,
    },
    body,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new JsonlAppendError(res.status, text)
  }
  let offset: number | undefined
  try {
    const json = (await res.clone().json()) as { offset?: number }
    if (typeof json.offset === 'number') offset = json.offset
  } catch {
    /* ingest does not have to return JSON */
  }
  return offset !== undefined
    ? { ok: true, status: res.status, offset }
    : { ok: true, status: res.status }
}
