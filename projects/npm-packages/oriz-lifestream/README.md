# @chirag127/oriz-lifestream

> **Auto-event source pipelines for the oriz-me JSONL canonical store.**

Three event sources feed `chirag127/oriz-me-data/events-<YYYY>.jsonl`,
and only these three. No manual entry, no IDE-heartbeat raw stream,
no per-pageview hit capture.

| # | Source | Trigger | Grain | JSONL `kind` |
|---|---|---|---|---|
| 1 | GitHub webhooks | Real-time per-event | per-event | `git` |
| 2 | Wakatime daily summary | Daily cron 01:00 IST | per-day | `coding` |
| 3 | Cloudflare Web Analytics daily summary | Daily cron 01:00 IST | per-day per-site | `visitors` |

Locked in
[`knowledge/decisions/architecture/lifestream-auto-event-sources.md`](../../knowledge/decisions/architecture/lifestream-auto-event-sources.md)
in the master `oriz` repo. Reinforces
[`auto-only-tracking`](../../knowledge/rules/auto-only-tracking.md).

## Status

**Scaffold-stage.** Code is written but not yet wired to live cron
schedules or a deployed Worker. Deploy steps live in
[`knowledge/runbooks/lifestream-auto-sources-setup.md`](../../knowledge/runbooks/lifestream-auto-sources-setup.md).

## Pipelines

### 1. GitHub webhook → Hookdeck → CF Worker → JSONL append

`src/github-webhook.ts` exports `createGithubWebhookApp()`, a Hono app
intended to mount on `api.oriz.in/lifestream/git`. Hookdeck sits in
front for retries / replay / dead-letter. Subscribed events:

- `push` (idempotent on `(repo, sha)`)
- `pull_request` opened (idempotent on `(repo, pr_number)`)
- `release` published (idempotent on `(repo, tag)`)
- `workflow_run` completed → terminal `success`/`failure` only
  (idempotent on `(repo, run_id)`)

Signature verification: `X-Hub-Signature-256` HMAC-SHA256 with
`GITHUB_WEBHOOK_SECRET`. Rejects on mismatch with 401.

### 2. Wakatime daily-summary cron

`src/wakatime-daily.ts` exports `runWakatimeDailyCron(env)`. Fetches
`https://wakatime.com/api/v1/users/current/summaries?range=yesterday`,
maps to one `CodingEvent` JSONL line, validates, appends.

Day-grain only — keeps PII low and sidesteps Wakatime free-tier's
rolling 2-week history by exporting every day before it ages out.

### 3. Cloudflare Web Analytics daily-summary cron

`src/cf-analytics-daily.ts` exports `runCfAnalyticsDailyCron(env)`.
Fetches CF GraphQL Analytics for each configured site, maps to one
`VisitorsEvent` JSONL line per `(date, site)`, appends. Fans out
across sites in parallel per the parallel-by-default rule.

## Environment variables

### CF Worker (Source 1)

| Variable | Required | Description |
|---|---|---|
| `GITHUB_WEBHOOK_SECRET` | yes | Shared secret configured on the GitHub org webhook |
| `LIFESTREAM_INGEST_SECRET` | yes | HMAC key for posting to `me.oriz.in/lifestream/ingest` |
| `LIFESTREAM_INGEST_URL` | no | Override ingest endpoint (defaults to `https://me.oriz.in/lifestream/ingest`) |

### GH Actions cron — Wakatime (Source 2)

| Variable | Required | Description |
|---|---|---|
| `WAKATIME_API_KEY` | yes | Wakatime API key (Basic auth) |
| `LIFESTREAM_INGEST_SECRET` | yes | HMAC key for the ingest endpoint |
| `LIFESTREAM_INGEST_URL` | no | Override ingest endpoint |
| `WAKATIME_DATE` | no | Force a specific YYYY-MM-DD; defaults to `range=yesterday` |
| `HEALTHCHECK_URL` | no | healthchecks.io ping URL pinged on success |

### GH Actions cron — CF Analytics (Source 3)

| Variable | Required | Description |
|---|---|---|
| `CF_API_TOKEN` | yes | Cloudflare API token with **Account Analytics: Read** |
| `CF_ACCOUNT_TAG` | yes | 32-hex Cloudflare account tag |
| `CF_SITES_JSON` | yes | JSON array of site hostnames, e.g. `["blog.oriz.in","books.oriz.in"]` |
| `LIFESTREAM_INGEST_SECRET` | yes | HMAC key for the ingest endpoint |
| `LIFESTREAM_INGEST_URL` | no | Override ingest endpoint |
| `CF_ANALYTICS_DATE` | no | Force a specific YYYY-MM-DD; defaults to yesterday UTC |
| `HEALTHCHECK_URL` | no | healthchecks.io ping URL pinged on success |

## GH Actions cron setup

Workflow templates live in
[`templates/per-lifestream-cron/.github/workflows/`](../../templates/per-lifestream-cron/.github/workflows/)
in the master `oriz` repo. Copy them into `.github/workflows/` on
master and configure the listed secrets at repo or org scope.

Both crons run at `0 1 * * *` UTC. Per the locked decision the
intent is 01:00 IST (= 19:30 UTC previous day) — the current cron
expression matches the literal text of the decision file (`0 1 * * *`)
and can be re-tightened later without changing this package.

## Forward-looking deps

`hono`, `octokit`, and `zod` are listed in `package.json` but are
**not installed** at scaffold-stage. The package is published when
the deploy runbook lands and a real workspace `pnpm install` runs.

## Cross-refs

- [`knowledge/decisions/architecture/lifestream-auto-event-sources.md`](../../knowledge/decisions/architecture/lifestream-auto-event-sources.md)
- [`knowledge/decisions/architecture/lifestream-jsonl-canonical.md`](../../knowledge/decisions/architecture/lifestream-jsonl-canonical.md)
- [`knowledge/decisions/architecture/auto-tracking-everywhere.md`](../../knowledge/decisions/architecture/auto-tracking-everywhere.md)
- [`knowledge/rules/auto-only-tracking.md`](../../knowledge/rules/auto-only-tracking.md)
- [`knowledge/runbooks/lifestream-auto-sources-setup.md`](../../knowledge/runbooks/lifestream-auto-sources-setup.md)

## License

MIT © Chirag Singhal
