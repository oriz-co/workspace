/**
 * Source 3 — Cloudflare Web Analytics daily-summary cron.
 *
 * GitHub Actions schedule `0 1 * * *` invokes `runCfAnalyticsDailyCron(env)`.
 * Fetches CF's GraphQL Analytics API for each configured site domain,
 * computes `(date, site, pageviews, unique, top_paths)`, appends ONE
 * `VisitorsEvent` JSONL line per `(date, site)`.
 *
 * Eleven sites × 1 line/day = 11 events/day per the locked
 * `lifestream-auto-event-sources` decision.
 *
 * Idempotent on `(date, site)`: re-runs replace, not duplicate (ingest worker
 * dedupes on `(kind, date, site)` for `kind: "visitors"`).
 *
 * The CF API token must have **Account Analytics: Read** scope at minimum.
 */

import { appendJsonl } from './jsonl-append.ts'
import { VisitorsEventSchema, type VisitorsEvent } from './types.ts'

export interface CfAnalyticsDailyEnv {
  CF_API_TOKEN: string
  /** Cloudflare account tag (32-hex). */
  CF_ACCOUNT_TAG: string
  LIFESTREAM_INGEST_SECRET: string
  LIFESTREAM_INGEST_URL?: string
  /** JSON array of site hostnames to query, e.g. `["blog.oriz.in","books.oriz.in"]`. */
  CF_SITES_JSON: string
  /** Optional explicit YYYY-MM-DD; defaults to yesterday in UTC. */
  CF_ANALYTICS_DATE?: string
  /** Healthchecks.io ping URL. */
  HEALTHCHECK_URL?: string
}

const CF_GRAPHQL = 'https://api.cloudflare.com/client/v4/graphql'

interface CfGraphqlResponse {
  data?: {
    viewer?: {
      accounts?: Array<{
        rumPageviewsAdaptiveGroups?: Array<{
          sum?: { visits?: number; pageViews?: number }
          count?: number
          dimensions?: { siteHost?: string }
        }>
        topPaths?: Array<{
          count: number
          dimensions: { requestPath: string }
        }>
      }>
    }
  }
  errors?: Array<{ message: string }>
}

function nowIsoUtc(): string {
  return new Date().toISOString().replace(/\.\d+Z$/, 'Z')
}

/** Yesterday in UTC as YYYY-MM-DD. */
function yesterdayUtc(now: Date = new Date()): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1))
  const out = d.toISOString().slice(0, 10)
  return out
}

/**
 * Query CF GraphQL Analytics for one site, one day. Returns null on no data.
 *
 * The exact dataset / field names in Cloudflare's GraphQL schema have shifted
 * over time — the query below targets `rumPageviewsAdaptiveGroups` which is
 * the standard Web Analytics dataset for site-mode zones. The Worker-mode
 * dataset (`httpRequestsAdaptiveGroups`) is queried separately if the site
 * runs proxied through a worker; out of scope for this scaffold.
 */
async function fetchCfDailyForSite(
  env: CfAnalyticsDailyEnv,
  site: string,
  date: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ pageviews: number; unique: number; top_paths: VisitorsEvent['top_paths'] } | null> {
  const startISO = `${date}T00:00:00Z`
  const endISO = `${date}T23:59:59Z`
  const query = `
    query SiteDailySummary($accountTag: String!, $site: String!, $start: Time!, $end: Time!) {
      viewer {
        accounts(filter: { accountTag: $accountTag }) {
          rumPageviewsAdaptiveGroups(
            limit: 1
            filter: { siteHost: $site, datetime_geq: $start, datetime_leq: $end }
          ) {
            count
            sum { visits pageViews }
            dimensions { siteHost }
          }
          topPaths: rumPageviewsAdaptiveGroups(
            limit: 10
            orderBy: [count_DESC]
            filter: { siteHost: $site, datetime_geq: $start, datetime_leq: $end }
          ) {
            count
            dimensions { requestPath }
          }
        }
      }
    }
  `
  const res = await fetchImpl(CF_GRAPHQL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.CF_API_TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        accountTag: env.CF_ACCOUNT_TAG,
        site,
        start: startISO,
        end: endISO,
      },
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`CF GraphQL ${res.status} for ${site}: ${body.slice(0, 200)}`)
  }
  const json = (await res.json()) as CfGraphqlResponse
  if (json.errors && json.errors.length > 0) {
    throw new Error(`CF GraphQL errors for ${site}: ${json.errors.map((e) => e.message).join('; ')}`)
  }
  const account = json.data?.viewer?.accounts?.[0]
  if (!account) return null
  const summary = account.rumPageviewsAdaptiveGroups?.[0]
  if (!summary) return null
  const pageviews = summary.sum?.pageViews ?? summary.count ?? 0
  const unique = summary.sum?.visits ?? 0
  const top_paths: VisitorsEvent['top_paths'] = (account.topPaths ?? []).map((row) => ({
    path: row.dimensions.requestPath,
    pv: row.count,
  }))
  return { pageviews, unique, top_paths }
}

export interface CfAnalyticsDailyCronResult {
  ok: boolean
  date: string
  results: Array<
    | { site: string; appended: true; status: number }
    | { site: string; appended: false; reason: string }
    | { site: string; appended: false; error: string }
  >
}

/** GH Actions cron entry. Throws on any per-site failure aggregated at the end. */
export async function runCfAnalyticsDailyCron(
  env: CfAnalyticsDailyEnv,
  fetchImpl: typeof fetch = fetch,
): Promise<CfAnalyticsDailyCronResult> {
  const sites = parseSites(env.CF_SITES_JSON)
  const date = env.CF_ANALYTICS_DATE ?? yesterdayUtc()
  const results: CfAnalyticsDailyCronResult['results'] = []

  // Sites are independent — fan out in parallel per the parallel-by-default rule.
  const settled = await Promise.allSettled(
    sites.map(async (site) => {
      const summary = await fetchCfDailyForSite(env, site, date, fetchImpl)
      if (!summary) return { site, appended: false as const, reason: 'no-data' }
      const draft: VisitorsEvent = {
        ts: nowIsoUtc(),
        kind: 'visitors',
        date,
        site,
        pageviews: summary.pageviews,
        unique: summary.unique,
        top_paths: summary.top_paths,
      }
      const event = VisitorsEventSchema.parse(draft)
      const r = await appendJsonl({
        event,
        secret: env.LIFESTREAM_INGEST_SECRET,
        ...(env.LIFESTREAM_INGEST_URL ? { endpoint: env.LIFESTREAM_INGEST_URL } : {}),
        fetchImpl,
      })
      return { site, appended: true as const, status: r.status }
    }),
  )

  let anyError = false
  for (let i = 0; i < settled.length; i++) {
    const s = settled[i]
    const site = sites[i] ?? '<unknown>'
    if (!s) continue
    if (s.status === 'fulfilled') {
      results.push(s.value)
    } else {
      anyError = true
      const msg = s.reason instanceof Error ? s.reason.message : String(s.reason)
      results.push({ site, appended: false, error: msg })
    }
  }

  if (!anyError && env.HEALTHCHECK_URL) {
    try {
      await fetchImpl(env.HEALTHCHECK_URL, { method: 'GET' })
    } catch {
      /* never fail the cron over a healthcheck ping */
    }
  }

  if (anyError) {
    throw new CfAnalyticsCronError(date, results)
  }
  return { ok: true, date, results }
}

export class CfAnalyticsCronError extends Error {
  readonly date: string
  readonly results: CfAnalyticsDailyCronResult['results']
  constructor(date: string, results: CfAnalyticsDailyCronResult['results']) {
    super(`CF Analytics cron had per-site failures on ${date}`)
    this.name = 'CfAnalyticsCronError'
    this.date = date
    this.results = results
  }
}

function parseSites(json: string): string[] {
  const parsed: unknown = JSON.parse(json)
  if (!Array.isArray(parsed) || !parsed.every((s): s is string => typeof s === 'string')) {
    throw new Error('CF_SITES_JSON must be a JSON array of strings')
  }
  return parsed
}

/** CLI shim for `node packages/oriz-lifestream/dist/cf-analytics-daily.js`. */
export async function main(): Promise<void> {
  const env: CfAnalyticsDailyEnv = {
    CF_API_TOKEN: requireEnv('CF_API_TOKEN'),
    CF_ACCOUNT_TAG: requireEnv('CF_ACCOUNT_TAG'),
    CF_SITES_JSON: requireEnv('CF_SITES_JSON'),
    LIFESTREAM_INGEST_SECRET: requireEnv('LIFESTREAM_INGEST_SECRET'),
    ...(process.env['LIFESTREAM_INGEST_URL']
      ? { LIFESTREAM_INGEST_URL: process.env['LIFESTREAM_INGEST_URL'] }
      : {}),
    ...(process.env['CF_ANALYTICS_DATE']
      ? { CF_ANALYTICS_DATE: process.env['CF_ANALYTICS_DATE'] }
      : {}),
    ...(process.env['HEALTHCHECK_URL'] ? { HEALTHCHECK_URL: process.env['HEALTHCHECK_URL'] } : {}),
  }
  const result = await runCfAnalyticsDailyCron(env)
  console.log(JSON.stringify(result))
}

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`missing required env: ${name}`)
  return v
}

if (
  typeof process !== 'undefined' &&
  process.argv[1] &&
  /cf-analytics-daily(?:\.[jt]s)?$/.test(process.argv[1])
) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
