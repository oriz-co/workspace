/**
 * Source 2 — Wakatime daily-summary cron.
 *
 * GitHub Actions schedule `0 1 * * *` (01:00 IST = 19:30 UTC the previous day)
 * invokes `runWakatimeDailyCron(env)`. Fetches `summaries?range=yesterday`,
 * maps to ONE `CodingEvent` JSONL line, validates, appends.
 *
 * Day-grain only — keeps PII low and sidesteps Wakatime free-tier's rolling
 * 2-week history by exporting every day before it ages out (per the locked
 * `lifestream-auto-event-sources` + `wakatime` service decisions).
 *
 * Idempotent on `date`: re-runs replace, not duplicate (the ingest worker
 * dedupes on `(kind, date)` for `kind: "coding"`).
 */

import { appendJsonl } from './jsonl-append.ts'
import { CodingEventSchema, type CodingEvent } from './types.ts'

export interface WakatimeDailyEnv {
  WAKATIME_API_KEY: string
  LIFESTREAM_INGEST_SECRET: string
  LIFESTREAM_INGEST_URL?: string
  /** Optional explicit YYYY-MM-DD; defaults to `range=yesterday` (Wakatime's notion of "yesterday" in the user's configured timezone). */
  WAKATIME_DATE?: string
  /** Healthchecks.io ping URL — pinged on success per the family monitoring rule. */
  HEALTHCHECK_URL?: string
}

/** Wakatime API summary response (subset we use). */
interface WakatimeSummariesResponse {
  data: Array<{
    range: { date: string; start: string; end: string }
    grand_total: { total_seconds: number }
    languages: Array<{ name: string; total_seconds: number }>
    projects: Array<{ name: string; total_seconds: number }>
  }>
}

const WAKATIME_API = 'https://wakatime.com/api/v1/users/current/summaries'

function nowIsoUtc(): string {
  return new Date().toISOString().replace(/\.\d+Z$/, 'Z')
}

/** Fetch yesterday's (or specific date's) Wakatime summary. */
async function fetchWakatimeSummary(
  apiKey: string,
  date?: string,
  fetchImpl: typeof fetch = fetch,
): Promise<WakatimeSummariesResponse> {
  const url = new URL(WAKATIME_API)
  if (date) {
    url.searchParams.set('start', date)
    url.searchParams.set('end', date)
  } else {
    url.searchParams.set('range', 'yesterday')
  }
  const res = await fetchImpl(url.toString(), {
    headers: {
      authorization: `Basic ${btoa(apiKey)}`,
      accept: 'application/json',
    },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Wakatime API ${res.status}: ${body.slice(0, 200)}`)
  }
  return (await res.json()) as WakatimeSummariesResponse
}

/** Map a Wakatime daily summary entry to a `CodingEvent`. */
export function transformWakatimeSummary(
  summary: WakatimeSummariesResponse,
): CodingEvent | null {
  const day = summary.data[0]
  if (!day) return null
  return {
    ts: nowIsoUtc(),
    kind: 'coding',
    date: day.range.date,
    total_seconds: day.grand_total.total_seconds,
    languages: day.languages.map((l) => ({ name: l.name, seconds: l.total_seconds })),
    projects: day.projects.map((p) => ({ name: p.name, seconds: p.total_seconds })),
  }
}

export interface WakatimeDailyCronResult {
  ok: boolean
  date?: string
  appended: boolean
  status?: number
  reason?: string
}

/**
 * Entry point for the GH Actions cron. Wrap in try/catch at the call site so
 * a thrown error → non-zero exit → red workflow run → healthchecks miss.
 */
export async function runWakatimeDailyCron(
  env: WakatimeDailyEnv,
  fetchImpl: typeof fetch = fetch,
): Promise<WakatimeDailyCronResult> {
  const summary = await fetchWakatimeSummary(env.WAKATIME_API_KEY, env.WAKATIME_DATE, fetchImpl)
  const draft = transformWakatimeSummary(summary)
  if (!draft) {
    return { ok: true, appended: false, reason: 'no-data-for-day' }
  }
  const event = CodingEventSchema.parse(draft)
  const result = await appendJsonl({
    event,
    secret: env.LIFESTREAM_INGEST_SECRET,
    ...(env.LIFESTREAM_INGEST_URL ? { endpoint: env.LIFESTREAM_INGEST_URL } : {}),
    fetchImpl,
  })
  if (env.HEALTHCHECK_URL) {
    try {
      await fetchImpl(env.HEALTHCHECK_URL, { method: 'GET' })
    } catch {
      /* don't fail the cron over a healthcheck ping */
    }
  }
  return { ok: true, appended: true, date: event.date, status: result.status }
}

/**
 * CLI shim. Invoked by the GH Actions workflow as
 * `node packages/oriz-lifestream/dist/wakatime-daily.js`. Reads env, runs the
 * cron, exits non-zero on any error so the workflow goes red.
 */
export async function main(): Promise<void> {
  const env: WakatimeDailyEnv = {
    WAKATIME_API_KEY: requireEnv('WAKATIME_API_KEY'),
    LIFESTREAM_INGEST_SECRET: requireEnv('LIFESTREAM_INGEST_SECRET'),
    ...(process.env['LIFESTREAM_INGEST_URL']
      ? { LIFESTREAM_INGEST_URL: process.env['LIFESTREAM_INGEST_URL'] }
      : {}),
    ...(process.env['WAKATIME_DATE'] ? { WAKATIME_DATE: process.env['WAKATIME_DATE'] } : {}),
    ...(process.env['HEALTHCHECK_URL'] ? { HEALTHCHECK_URL: process.env['HEALTHCHECK_URL'] } : {}),
  }
  const result = await runWakatimeDailyCron(env)
  console.log(JSON.stringify(result))
}

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`missing required env: ${name}`)
  return v
}

// Run when invoked as a script (NodeNext ESM entry detection).
if (
  typeof process !== 'undefined' &&
  process.argv[1] &&
  /wakatime-daily(?:\.[jt]s)?$/.test(process.argv[1])
) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
