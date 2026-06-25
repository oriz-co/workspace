---
type: decision
title: "Health checks \u2014 split between healthchecks.io (cron heartbeats) and Better\
  \ Stack (HTTP uptime)"
description: "Locked 2026-06-20: cron-job liveness is verified by healthchecks.io\
  \ heartbeat pings (dead-man-switch on 20 free checks), HTTP endpoint uptime is verified\
  \ by Better Stack monitors (10 free monitors). Two distinct surfaces, two free tools,\
  \ no overlap. Reinforces the auto-only-tracking rule \u2014 both verify auto-tracked\
  \ surfaces without human polling."
tags:
- monitoring
- health-check
- heartbeat
- uptime
- cron
- decisions
- architecture
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/monitoring/healthchecks-io
- services/monitoring/better-stack
- services/monitoring/instatus
- decisions/architecture/compute/cron-split-cf-vs-gh
- decisions/architecture/general/lifestream-auto-event-sources
- decisions/infrastructure/monitor-apex-only
- rules/interaction/auto-only-tracking
- rules/interaction/never-hit-quotas
---



# Health checks — cron heartbeats + HTTP uptime, split

## Decision

Health-check coverage is split across two free tools, picked by what
they verify:

| Surface | Tool | Mode | Free tier |
|---|---|---|---|
| **Cron-job liveness** (did this run?) | [healthchecks.io](../../../services/monitoring/healthchecks-io.md) | Dead-man-switch heartbeat | 20 checks |
| **HTTP endpoint uptime** (is this URL serving?) | [Better Stack](../../../services/monitoring/better-stack.md) | Active probe (3-min interval) | 10 monitors |

Both are adopted as of 2026-06-20. They don't overlap: heartbeat
verifies *the runner ran*, uptime verifies *the URL responds*. A
silent cron failure produces no failed HTTP probe — only the
heartbeat misses. A live URL responding 500s produces a heartbeat
ping (the cron ran) — only the uptime probe fails.

## Why both, not one

The user direction was: *"BOTH — healthchecks.io + Better Stack
heartbeats."*

Different failure modes:

- A daily Wakatime → JSONL cron silently failing at the API call
  step would never trigger a Better Stack alert (no URL), but
  healthchecks.io alerts the moment the next ping is missing.
- A Cloudflare Worker route at `api.oriz.in/lifestream/git` failing
  gives no heartbeat to monitor (Hookdeck retries don't ping
  healthchecks), but Better Stack's HTTP probe catches the
  endpoint going down.

Vendor-redundancy posture also helps: if Better Stack itself is the
outage, healthchecks.io's heartbeat miss can post directly to
[Instatus](../../../services/monitoring/instatus.md) as a manual
incident — same fallback path documented in the
[two-status-page redundancy strategy](../../../services/monitoring/index.md#two-status-page-redundancy-strategy).

## Implications

- **Every scheduled cron pings healthchecks.io.** GitHub Actions
  schedule jobs and Cloudflare Cron Triggers per the
  [cron split](./cron-split-cf-vs-gh.md). Convention: `curl
  -fsS --retry 3 $HC_URL` as the LAST step of every cron workflow.
- **Cron coverage table** lives at
  [`services/monitoring/healthchecks-io.md`](../../../services/monitoring/healthchecks-io.md) —
  each scheduled job (Wakatime daily, CF Analytics daily, restic
  backup, oriz-omnipost cron, Raindrop linkroll re-deploy, etc.) has
  its own check URL.
- **Every public site + `api.oriz.in`** is a Better Stack monitor.
  Apex-only per
  [`monitor-apex-only`](../../infrastructure/monitor-apex-only.md);
  subdomains inherit via Cloudflare cert auto-rotation.
- **Quota math:** ~10 GH Actions cron jobs + ~3 CF Cron Triggers =
  13 of 20 free healthchecks slots = 35% headroom. ~12 active
  monitors envisioned (11 sites + `api.oriz.in`) at the 10-monitor
  Better Stack cap — apex-only keeps it at exactly 10. Per
  [`rules/never-hit-quotas`](../../../rules/interaction/never-hit-quotas.md), if
  Better Stack monitor count crosses 10 we add a second free
  account, not a paid plan.
- **Auto-only posture** — both tools verify auto-tracked surfaces
  without human polling, in line with
  [`auto-only-tracking`](../../../rules/interaction/auto-only-tracking.md). The
  alert routes (Slack / email) themselves are auto.
- **Better Stack heartbeat-monitor mode is also on** alongside the
  HTTP probes — the same Better Stack account already in use for
  uptime, status page, and Better Stack Logs (per the
  [logs-better-stack-plus-cf-tail decision](../ops/logs-better-stack-plus-cf-tail.md))
  — but healthchecks.io stays the **primary** for cron heartbeats
  (dedicated dead-man-switch UX, generous free tier, vendor split).

## Cross-refs

- [healthchecks.io service](../../../services/monitoring/healthchecks-io.md)
- [Better Stack service](../../../services/monitoring/better-stack.md)
- [Monitoring services index](../../../services/monitoring/index.md)
- [Cron split decision](./cron-split-cf-vs-gh.md)
- [Lifestream auto-event sources](../general/lifestream-auto-event-sources.md)
- [Logs — Better Stack + CF Tail](../ops/logs-better-stack-plus-cf-tail.md) — same Better Stack account
- [Apex-only monitoring decision](../../infrastructure/monitor-apex-only.md)
- [Auto-only-tracking rule](../../../rules/interaction/auto-only-tracking.md) (forward ref — being added in parallel)
- [Never hit quotas rule](../../../rules/interaction/never-hit-quotas.md)
