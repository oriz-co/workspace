---
type: decision
title: "Logs \u2014 Better Stack Logs (aggregation) + Cloudflare Workers Tail (live)"
description: 'Two-layer log strategy. Cloudflare Workers Tail for live in-Worker debugging
  (5-min retention, 0 cost, wrangler tail). Better Stack Logs for cross-Worker aggregation
  + alerts + searchable retention (3 GB/mo free, same vendor as our status page +
  uptime monitors). Quota math: ~30 MB/mo realistic load vs 3 GB/mo cap = ~100x headroom.'
tags:
- decisions
- architecture
- logs
- observability
- better-stack
- cloudflare
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/monitoring/cloudflare-workers-tail
- services/monitoring/better-stack-logs
- services/monitoring/better-stack
- services/monitoring/instatus
- services/monitoring/sentry
- services/monitoring/healthchecks-io
- services/tooling/axiom
- architecture/compute/api-umbrella-hono-worker
- decisions/architecture/compute/cf-worker-quota-mitigation
- rules/interaction/never-hit-quotas
- rules/interaction/no-card-on-file
---



# Logs — Better Stack Logs + CF Workers Tail

## Decision

The family runs **two log layers**, picked by retention horizon:

1. **Live tail (≤ 5 min)** —
   [Cloudflare Workers Tail](../../../services/monitoring/cloudflare-workers-tail.md).
   Free, included with Cloudflare Workers. Streams every Worker
   `console.log` / `console.error` over WebSocket via
   `wrangler tail <worker>`. Used during active debugging — "what
   does this Worker actually log when I curl it?"
2. **Aggregation + alerts (≥ 30 days)** —
   [Better Stack Logs](../../../services/monitoring/better-stack-logs.md).
   Free 3 GB/mo + 30-day retention + searchable + alertable.
   Same vendor as our existing
   [status page](../../../services/monitoring/better-stack.md) + uptime
   monitors — three Better Stack products on one account.

Errors continue to flow through
[Sentry](../../../services/monitoring/sentry.md). Logs and errors are
**different observability planes** — exceptions go to Sentry; structured
operational logs go to Better Stack Logs.

## Why

- **The 5-min "what's it doing right now?" question.** Every Worker
  in the family — `s.oriz.in`, `api.oriz.in`, the OG card route, the
  cross-post engine endpoints — needs a way to see live `console.log`
  output during debugging. Cloudflare ships this for free as
  `wrangler tail`. No log sink to configure, no aggregation cost,
  no retention tradeoff. It's also the *only* tool that gives sub-100ms
  delivery from a Worker request to a developer's terminal.
- **The "what happened yesterday at 03:14 UTC?" question.** Workers
  Tail's retention is effectively the WebSocket session — once you
  disconnect, the data is gone. Better Stack Logs answers the
  retroactive question: HTTP-pushed log lines, 30-day retention,
  search-by-field, alert-on-pattern. Free 3 GB/mo is a 100x buffer
  over the family's realistic load.
- **Same Better Stack account = no new vendor surface.** Better Stack
  hosts our [primary status page](../../../services/monitoring/better-stack.md),
  our 10 uptime monitors, AND our log aggregation — three products,
  one account, one
  [Doppler](../../../services/secrets/doppler.md) source token. The
  redundant status page mirror at
  [Instatus](../../../services/monitoring/instatus.md) intentionally lives
  on a different vendor for status-page redundancy; logs do not need
  the same redundancy posture (logs go to Workers Tail in a vendor
  outage; live tail is independent of Better Stack's edge).
- **Quota math fits comfortably.** Realistic family-wide load:
  - ~1 KB per request log line (status, latency, path, route, geo)
  - ~1K Worker requests / day at family scale across all Workers
  - = **~30 MB / month** versus the 3 GB/mo free cap → ~100x headroom
  - Even a 10x error spike on one Worker would still fit comfortably

## Implications

### Architecture

```text
Worker (Hono umbrella, s.oriz.in, og-card, etc.)
   ├── console.log()   ──── live ────► wrangler tail <name>   (CF Workers Tail, dev terminal)
   └── waitUntil(      ──── aggregate ► Better Stack Logs HTTP source
         logToBetterStack({ level, msg, fields })
       )
```

A thin `log()` helper ships in
`@chirag127/oriz-kit/server/logging` (forward reference) that:

1. Always calls `console.log(...)` (so Workers Tail sees it).
2. Always calls `ctx.waitUntil(fetch(BETTER_STACK_INGEST_URL, ...))`
   with the same payload (so Better Stack Logs sees it) when
   `ENABLE_BETTER_STACK_LOGS=true`.
3. Includes structured fields:
   `{ level, msg, request_id, ray, route, status, latency_ms, geo, ua, env }`.
4. Drops noisy paths via an opt-in allow-list (e.g. healthcheck routes never pushed to Better Stack).

### The `ENABLE_BETTER_STACK_LOGS=true` toggle

Same per-site env-var pattern as
[Sentry](../../../services/monitoring/sentry.md). Default is `false` for
low-traffic sites; flip to `true` only on Workers / sites currently
being debugged or recently deployed. Combined with the 3 GB/mo cap,
this prevents a runaway log loop on one Worker from burning the
family-wide budget. Documented under
[`rules/never-hit-quotas.md`](../../../rules/interaction/never-hit-quotas.md).

### Three observability planes — distinct, not stacked

| Plane | Tool | Free tier | What goes here |
|---|---|---|---|
| Errors / exceptions / traces | [Sentry](../../../services/monitoring/sentry.md) | 5K events/mo | Uncaught exceptions, hand-instrumented `Sentry.captureException`, performance traces |
| Operational / structured logs | [Better Stack Logs](../../../services/monitoring/better-stack-logs.md) | 3 GB/mo, 30-day retention | `log({ level: 'info', msg: 'razorpay webhook received', payment_id })` — the kind of thing you'd `tail -f` on a server |
| Live console (active debugging) | [Cloudflare Workers Tail](../../../services/monitoring/cloudflare-workers-tail.md) | Unlimited, ~5 min retention | `console.log` from a Worker; visible only while `wrangler tail` is connected |

The earlier
[Axiom service entry](../../../services/tooling/axiom.md) stays in the
catalog; quota alarms keep posting there per the
[CF Worker quota mitigation playbook](../compute/cf-worker-quota-mitigation.md).
Axiom and Better Stack Logs are not redundant — Axiom is metrics-shaped
event ingest with dashboards; Better Stack Logs is log-line-shaped
text search + alerts. Different shapes, different destinations.

### Status-page redundancy carries to logs only weakly

The
[two-status-page redundancy](../../../services/monitoring/instatus.md)
exists because the status page IS the comms channel for an outage —
it must survive its own vendor going down. Logs don't have that
property: if Better Stack Logs is down, we still have Workers Tail
and Sentry; we lose a few minutes of historical aggregation, not a
critical comms channel. So we don't run a redundant log sink.

### What we don't add

- **No Logtail / Datadog / Loggly / Papertrail.** All require card on
  file at family scale (or are paid past trial — fights
  [`rules/no-card-on-file.md`](../../../rules/interaction/no-card-on-file.md) +
  [`rules/no-subscriptions.md`](../../../rules/infrastructure/no-subscriptions.md)).
- **No self-hosted log stack** (Loki / Promtail, ELK). Self-host fights
  the family's no-self-host posture.
- **No R2 fallback log sink.** R2 was rejected family-wide on
  card-on-file grounds per
  [`object-storage-split.md`](../database/object-storage-split.md). Logs that
  don't fit Better Stack's free tier are dropped at the source via
  the allow-list, not spilled to a paid sink.

## Cross-refs

- [Cloudflare Workers Tail service](../../../services/monitoring/cloudflare-workers-tail.md)
- [Better Stack Logs service](../../../services/monitoring/better-stack-logs.md)
- [Better Stack — status page + uptime (same account)](../../../services/monitoring/better-stack.md)
- [Instatus — redundant status page mirror](../../../services/monitoring/instatus.md)
- [Sentry — error / exception plane](../../../services/monitoring/sentry.md)
- [healthchecks.io — heartbeat plane](../../../services/monitoring/healthchecks-io.md)
- [Axiom — metrics-shaped events](../../../services/tooling/axiom.md)
- [API umbrella Hono Worker](../../../architecture/compute/api-umbrella-hono-worker.md)
- [CF Worker quota mitigation playbook](../compute/cf-worker-quota-mitigation.md)
- [Never hit quotas rule](../../../rules/interaction/never-hit-quotas.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
