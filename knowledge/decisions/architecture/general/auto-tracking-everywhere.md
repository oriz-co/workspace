---
type: decision
title: "Auto-tracking everywhere \u2014 every family-wide metric is captured automatically"
description: "Locked 2026-06-20: every tracked metric in the chirag127/oriz family\
  \ is auto-captured. The oriz-me lifestream specifically pulls from auto sources\
  \ only \u2014 GitHub commits via webhook, npm publishes via post-publish hook, VS\
  \ Code coding sessions via Wakatime API, site visits via CF Web Analytics, builds\
  \ via GH Actions webhook. No manual entry anywhere in the metric pipeline. Manual\
  \ = decay; auto = honest."
tags:
- decisions
- architecture
- tracking
- observability
- lifestream
- auto
- metrics
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- rules/interaction/auto-only-tracking
- decisions/architecture/database/lifestream-jsonl-canonical
- decisions/architecture/ops/time-tracking-wakatime-only
- services/productivity/wakatime
- services/analytics/cloudflare-web-analytics
- services/monitoring/sentry
- services/cron/github-actions-schedule
- decisions/branding/oriz-me-added-to-family
---



# Auto-tracking everywhere

## Decision

Every metric tracked anywhere in the `chirag127/oriz*` family is
captured **automatically**. No manual entry anywhere in the metric
pipeline.

This decision file locks the family-wide principle. The companion
[`rules/auto-only-tracking.md`](../../../rules/interaction/auto-only-tracking.md)
spells out the rule that every future tracking pick must pass.

For the `oriz-me` lifestream specifically, this decision pre-locks
the auto-event sources that feed canonical JSONL per
[`lifestream-jsonl-canonical`](../database/lifestream-jsonl-canonical.md):

| Event source | How it's captured (auto) | JSONL `type` (planned) |
|---|---|---|
| GitHub commits | GitHub webhook → Hookdeck → CF Worker → JSONL append | `git-commit` |
| npm publishes | npm post-publish hook in CI → CF Worker → JSONL append | `npm-publish` |
| VS Code coding sessions | [Wakatime](../../../services/productivity/wakatime.md) API → daily cron summary line | `code-summary-wakatime` |
| Site visits | [Cloudflare Web Analytics](../../../services/analytics/cloudflare-web-analytics.md) (already auto, cookie-less) | `pageview-cfwa` (aggregated) |
| Builds (success / fail) | [GitHub Actions](../../../services/cron/github-actions-schedule.md) workflow webhook → CF Worker → JSONL append | `build-status` |

User direction (verbatim, 2026-06-20): *"I want everything to be
automatically tracked no manual tracking."*

## Why

- **Manual tracking decays.** See
  [`rules/auto-only-tracking.md`](../../../rules/interaction/auto-only-tracking.md)
  §"Why" for the full argument.
- **Dishonest data is worse than no data.** A manually-fudged
  metric produces wrong decisions; an untracked gap is at least
  honest about being a gap.
- **Auto scales.** Adding a hook / SDK / webhook costs human
  attention once; manual tracking costs human attention forever.
- **Everything else in the stack is already auto.** Errors
  ([Sentry](../../../services/monitoring/sentry.md)), logs
  ([CF Workers Tail](../../../services/monitoring/cloudflare-workers-tail.md)
  + [Better Stack Logs](../../../services/monitoring/better-stack-logs.md)),
  uptime ([Better Stack](../../../services/monitoring/better-stack.md) +
  [Instatus](../../../services/monitoring/instatus.md)), analytics
  ([CF Web Analytics](../../../services/analytics/cloudflare-web-analytics.md)
  + GA4 + [PostHog](../../../services/analytics/posthog.md) +
  [Clarity](../../../services/analytics/microsoft-clarity.md)), CI
  status ([GitHub Actions](../../../services/cron/github-actions-schedule.md)).
  Time tracking was the only manual outlier — Toggl walk-back
  closes that gap. See
  [`time-tracking-wakatime-only`](../ops/time-tracking-wakatime-only.md).

## Implications

### For the lifestream pipeline (concrete auto sources)

Each event source has a designated auto-capture path. None
require the user to do anything beyond their normal work.

- **GitHub commits → JSONL line per commit.** Webhook configured
  on the `chirag127/oriz*` org → Hookdeck for retry-protected
  ingress (per
  [`hookdeck-for-webhook-reliability`](../../infrastructure/hookdeck-for-webhook-reliability.md))
  → CF Worker at `api.oriz.in/lifestream/ingest/github` →
  appends to `oriz-me-data/lifestream/YYYY-MM-DD.jsonl`.
  Idempotent on commit SHA.
- **npm publishes → JSONL line per publish.** A
  `postpublish` script in each package's CI (or a GH Actions
  step in `npm-publish.yml`) POSTs to
  `api.oriz.in/lifestream/ingest/npm` after a successful
  `npm publish`. Idempotent on `(package, version)`.
- **VS Code coding sessions → daily summary line.** A
  [GitHub Actions cron](../../../services/cron/github-actions-schedule.md)
  runs daily at 02:00 UTC, calls
  `wakatime.com/api/v1/users/current/summaries?start=yesterday&end=yesterday`,
  maps each language / project bucket to a JSONL row, appends to
  yesterday's file. Idempotent on `(date, project, language)`
  via dedup key. The Wakatime IDE plugin is the only piece the
  user installs once; from there it's automatic.
- **Site visits → already auto via CF Web Analytics.** No
  additional ingest path needed for the per-visit signal — CF
  Web Analytics' dashboard already aggregates server-side. A
  daily cron pulls the previous day's aggregates from CF's
  GraphQL Analytics API (free tier) and appends a single
  daily-rollup JSONL row per site (count, top paths, top
  countries) — this gives the lifestream visibility into "the
  site got visits" without burning JSONL volume on per-pageview
  rows. Idempotent on `(date, site)`.
- **Builds → JSONL line per workflow run.** GitHub Actions
  `workflow_run` webhook → Hookdeck → CF Worker at
  `api.oriz.in/lifestream/ingest/build` → appends. Captures
  `(repo, workflow, run_id, conclusion, duration_s)`. Idempotent
  on `run_id`.

All five sources push to the same canonical JSONL store per
[`lifestream-jsonl-canonical`](../database/lifestream-jsonl-canonical.md).
[Turso libSQL](../../../services/database/turso.md) warm cache rebuilds
from JSONL nightly.

### For non-lifestream metrics

The rule still applies. If a future feature wants to track
something the family doesn't already auto-capture, the
acceptance gate is: **show the auto-capture path before
adopting**. If there isn't one, the metric isn't tracked. No
manual fallback.

### What this excludes

- **Journal / thoughts entries on `oriz-journal-site`** are
  CONTENT, not metrics. Manual writing is intentional and
  expected. See
  [`rules/auto-only-tracking.md`](../../../rules/interaction/auto-only-tracking.md)
  §"When NOT to apply this rule".
- **Markdown blog posts, design briefs, knowledge bundle
  entries** — also content. Not subject to this decision.
- **Code itself** is content.

### Walk-backs locked alongside this decision

- **[Toggl Track REJECTED](../../../services/productivity/toggl-track.md)** —
  manual timer violates this principle. Walked back same day
  it was adopted. See
  [`time-tracking-wakatime-only`](../ops/time-tracking-wakatime-only.md).
- **No future "manual fallback for non-coding time" tool.**
  If a non-coding-time signal becomes valuable, the answer is
  to find an auto source for it (e.g. Google Calendar API
  ingest), not to add a manual tracker.

### Failure modes covered

- **Hookdeck quota** (50K events/mo free, per
  [`distribution-and-queues-locked`](../compute/distribution-and-queues-locked.md))
  — at family scale, commits + builds + npm publishes total
  well under 1K events/mo, ~50× headroom.
- **CF Worker 100K req/day** — every ingest endpoint sits
  behind the [CF Worker quota mitigation playbook](../compute/cf-worker-quota-mitigation.md);
  ingest is write-shaped (no caching) but well under the cap.
- **Wakatime API rate limit** — daily cron pulls a single
  summary endpoint per day; no concern.
- **CF Web Analytics GraphQL** — also free; daily pull only.
- **Webhook delivery failures** — Hookdeck retries with
  exponential backoff + manual replay surface; same posture as
  Razorpay webhook flow.

## Cross-refs

- [Auto-only-tracking rule](../../../rules/interaction/auto-only-tracking.md) — the rule version of this principle
- [Time-tracking — Wakatime only](../ops/time-tracking-wakatime-only.md) — Toggl walk-back driven by this decision
- [Lifestream JSONL canonical](../database/lifestream-jsonl-canonical.md) — the durable store the auto sources feed
- [oriz-me added to family](../../branding/oriz-me-added-to-family.md) — the lifestream-bearing site
- [Hookdeck for webhook reliability](../../infrastructure/hookdeck-for-webhook-reliability.md) — webhook ingress layer
- [CF Worker quota mitigation playbook](../compute/cf-worker-quota-mitigation.md)
- [Wakatime — sole time-tracking pick](../../../services/productivity/wakatime.md)
- [Cloudflare Web Analytics](../../../services/analytics/cloudflare-web-analytics.md)
- [Sentry — auto error capture](../../../services/monitoring/sentry.md)
- [GitHub Actions cron schedule](../../../services/cron/github-actions-schedule.md)
- [Future overrides past rule](../../../rules/interaction/future-overrides-past.md)
