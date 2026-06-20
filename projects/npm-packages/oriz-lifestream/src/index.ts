/**
 * @chirag127/oriz-lifestream — auto-event source pipelines for the oriz-me
 * JSONL canonical store. Three sources, no manual entry:
 *
 *   1. GitHub webhook → Hookdeck → CF Worker → JSONL append (per-event).
 *   2. Wakatime daily-summary cron (per-day).
 *   3. Cloudflare Web Analytics daily-summary cron (per-day per-site).
 *
 * See `knowledge/decisions/architecture/lifestream-auto-event-sources.md`
 * (locked 2026-06-20) and `knowledge/runbooks/lifestream-auto-sources-setup.md`
 * in the master `oriz` repo for the full design and deployment runbook.
 */

// Shared
export {
  appendJsonl,
  DEFAULT_INGEST_URL,
  JsonlAppendError,
  type AppendJsonlOptions,
  type AppendJsonlResult,
} from './jsonl-append.ts'

// Schemas + types
export {
  CodingEventSchema,
  GitEventSchema,
  LifestreamEventSchema,
  VisitorsEventSchema,
  type CodingEvent,
  type GitEvent,
  type LifestreamEvent,
  type VisitorsEvent,
} from './types.ts'

// Source 1 — GitHub webhook (CF Worker / Hono handler)
export {
  createGithubWebhookApp,
  transformGithubEvent,
  verifyGithubSignature,
  type GithubWebhookEnv,
} from './github-webhook.ts'

// Source 2 — Wakatime daily cron
export {
  runWakatimeDailyCron,
  transformWakatimeSummary,
  type WakatimeDailyCronResult,
  type WakatimeDailyEnv,
} from './wakatime-daily.ts'

// Source 3 — Cloudflare Web Analytics daily cron
export {
  CfAnalyticsCronError,
  runCfAnalyticsDailyCron,
  type CfAnalyticsDailyCronResult,
  type CfAnalyticsDailyEnv,
} from './cf-analytics-daily.ts'
