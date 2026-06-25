---
type: decision
title: "Lifestream auto-event sources \u2014 three streams (GitHub webhooks + Wakatime\
  \ daily + CF Web Analytics daily)"
description: "Locked 2026-06-20: the oriz-me JSONL canonical store is fed by THREE\
  \ auto-tracked event sources only \u2014 GitHub webhooks via Hookdeck, Wakatime\
  \ daily-summary cron, and Cloudflare Web Analytics daily-summary cron. No manual\
  \ entry, no minute-grain coding capture, no per-pageview visitor capture. Reinforces\
  \ the auto-only-tracking rule."
tags:
- lifestream
- jsonl
- auto-tracking
- github-webhooks
- wakatime
- cloudflare-web-analytics
- decisions
- architecture
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- decisions/architecture/database/lifestream-jsonl-canonical
- decisions/architecture/general/lifestream-federation
- decisions/architecture/compute/cron-split-cf-vs-gh
- services/productivity/wakatime
- services/analytics/cloudflare-web-analytics
- services/queue/hookdeck
- rules/interaction/auto-only-tracking
---



# Lifestream auto-event sources — three streams

## Decision

The [oriz-me JSONL canonical store](../database/lifestream-jsonl-canonical.md)
is fed by **three** auto-tracked event sources, and ONLY these three.
No manual entry, no IDE-heartbeat raw stream, no per-pageview hit
capture. Each source streams day-grain (or event-grain for git) JSONL
lines into `chirag127/oriz-me-data/events-<YYYY>.jsonl`.

| # | Source | Trigger | Grain | JSONL `kind` |
|---|---|---|---|---|
| 1 | [GitHub webhooks](..#source-1-github-webhooks) | Real-time per-event | per-event | `git` |
| 2 | [Wakatime daily summary](..#source-2-wakatime-daily-summary-cron) | Daily cron 01:00 IST | per-day | `coding` |
| 3 | [CF Web Analytics daily summary](..#source-3-cf-web-analytics-daily-summary-cron) | Daily cron 01:00 IST | per-day per-site | `visitors` |

This locks in the
[`auto-only-tracking`](../../../rules/interaction/auto-only-tracking.md) posture for
the lifestream itself — every event in oriz-me arrives without a
human pressing "log this".

## Source 1: GitHub webhooks

GitHub repo webhook → [Hookdeck](../../../services/queue/hookdeck.md)
ingress (retries + replay + dead-letter) → CF Worker route at
`api.oriz.in/lifestream/git` → JSONL append.

Subscribed events:

- `push` (any branch — but family is `main`-only per
  [`one-branch-only`](../../../rules/development/one-branch-only.md))
- `pull_request` opened
- `release` published
- `workflow_run` completed (only `success`/`failure` terminal states)

JSONL line shape:

```jsonl
{"ts": "2026-06-20T11:42:13Z", "kind": "git", "repo": "chirag127/blog-site", "sha": "abc1234", "message": "feat: ship", "author": "chirag127", "url": "https://github.com/chirag127/blog-site/commit/abc1234"}
```

Idempotent on `(repo, sha)` for push, `(repo, pr_number)` for PR,
`(repo, tag)` for release, `(repo, run_id)` for workflow_run. Hookdeck
replay-safe.

## Source 2: Wakatime daily-summary cron

[GitHub Actions schedule](../../../services/cron/github-actions-schedule.md)
`0 1 * * *` (01:00 IST = 19:30 UTC previous day) fetches
`https://wakatime.com/api/v1/users/current/summaries?start=YYYY-MM-DD&end=YYYY-MM-DD`,
maps to one JSONL line per day, appends.

Stored only at **day-grain**, not minute-grain — keeps PII low and
sidesteps Wakatime's rolling 2-week free history (per the
[wakatime service file](../../../services/productivity/wakatime.md)) by
exporting every day before it ages out.

JSONL line shape:

```jsonl
{"ts": "2026-06-20T18:30:00Z", "kind": "coding", "date": "2026-06-20", "total_seconds": 14823, "languages": [{"name": "TypeScript", "seconds": 9120}, {"name": "Markdown", "seconds": 3201}], "projects": [{"name": "oriz-blog-site", "seconds": 6044}, {"name": "oriz", "seconds": 8779}]}
```

Wakatime API token in
[Doppler](../../../services/secrets/doppler.md) → GH Secrets per
[`secrets-management-doppler`](../../security/secrets-management-doppler.md).

## Source 3: CF Web Analytics daily-summary cron

GitHub Actions schedule `0 1 * * *` fetches Cloudflare's GraphQL
Analytics API (`https://api.cloudflare.com/client/v4/graphql`) for
each site zone, maps to one JSONL line per `(date, site)`, appends.

JSONL line shape:

```jsonl
{"ts": "2026-06-20T18:30:00Z", "kind": "visitors", "date": "2026-06-20", "site": "blog.oriz.in", "pageviews": 1142, "unique": 318, "top_paths": [{"path": "/post/foo", "pv": 412}, {"path": "/", "pv": 287}]}
```

Eleven sites × one line per day = 11 JSONL events / day. Negligible
file growth at the [JSONL canonical](../database/lifestream-jsonl-canonical.md)
"~10 MB/year" envelope.

CF API token (read-only Analytics scope) in Doppler.

## Why these three only

The user direction was: *"ALL THREE — GitHub webhooks + Wakatime
daily-summary + CF Web Analytics summary all stream to JSONL"* — and
nothing else. Each source covers a distinct surface:

- **Git** = what code changed and when (the family's primary durable
  artefact)
- **Coding time** = how long was spent coding, in what language, on
  what project (the activity behind the commits)
- **Visitors** = who read the output (the receiving end of the work)

Together they answer "what was I doing yesterday?" without any tool
that requires a human to press "start timer" or "log this". Manual
non-coding time tracking lives separately in
[Toggl Track](../../../services/productivity/toggl-track.md) per
[`time-tracking-toggl-plus-wakatime`](../time-tracking-toggl-plus-wakatime.md);
that source is **explicitly NOT** wired into the auto-only lifestream
JSONL because it requires a human action.

## Implications

- **Hookdeck connection** for GitHub webhooks rides on the existing
  free 50K events/mo tier — current family commit volume is
  ~thousands/mo, well inside envelope.
- **Two daily GH Actions cron jobs** (Wakatime + CF Analytics) at
  01:00 IST. Idempotent on `(date, source)` — re-runs replace, not
  duplicate.
- **Health-check coverage** — both daily crons ping
  [healthchecks.io](../../../services/monitoring/healthchecks-io.md) on
  success per
  [`health-check-cron-plus-uptime`](../compute/health-check-cron-plus-uptime.md);
  miss → alert.
- **No card** required across all three sources (GitHub webhooks
  free, Wakatime free tier, Cloudflare Web Analytics free).
- **JSONL idempotency keys** documented per source above so replay
  is safe.
- **Schema** lives in `chirag127/oriz-me-data/schema.json`; the
  [JSONL canonical decision](../database/lifestream-jsonl-canonical.md) covers
  the validation flow.
- **Forward refs**: ingest workers under `api.oriz.in/lifestream/*`
  belong to the [umbrella Hono Worker](../compute/hono-worker-api-umbrella.md)
  by default; if quota mitigation per the
  [CF Worker quota mitigation playbook](../compute/cf-worker-quota-mitigation.md)
  warrants splitting `api.oriz.in/lifestream/*` into its own Worker,
  do it then.

## Cross-refs

- [Lifestream JSONL canonical decision](../database/lifestream-jsonl-canonical.md)
- [Lifestream federation (AT Protocol + ActivityPub mirrors)](./lifestream-federation.md)
- [Cron split — CF Cron vs GH Actions](../compute/cron-split-cf-vs-gh.md)
- [Hookdeck (queue ingress)](../../../services/queue/hookdeck.md)
- [Wakatime service](../../../services/productivity/wakatime.md)
- [Cloudflare Web Analytics service](../../../services/analytics/cloudflare-web-analytics.md)
- [healthchecks.io — heartbeat coverage](../../../services/monitoring/healthchecks-io.md)
- [Auto-only-tracking rule](../../../rules/interaction/auto-only-tracking.md) (forward ref — being added in parallel)
- [Auto-tracking everywhere decision](./auto-tracking-everywhere.md) (forward ref — being added in parallel)
- [Time-tracking split (Toggl manual + Wakatime auto)](../time-tracking-toggl-plus-wakatime.md) — Toggl's manual stream is intentionally NOT a lifestream source
