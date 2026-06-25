---
type: decision
title: "oriz-status-app \u2014 self-hosted status page replaces UptimeRobot + Better\
  \ Stack"
description: 'Locked 2026-06-22 (evening): in-house status page at status.oriz.in.
  CF Worker cron every 5 min probes every URL in FAMILY_* registries, writes to KV,
  served by sibling read-only Worker behind 60-sec edge cache. Replaces UptimeRobot
  (commercial-use ban Oct 2024) and supersedes the 10-monitor Better Stack ceiling.
  Telegram alerts on transition. RSS feed for incidents. 30/90-day uptime rollups.'
tags:
- status
- monitoring
- uptime
- cloudflare
- workers
- kv
- telegram
- rss
- decisions
- architecture
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- decisions/architecture/compute/health-check-cron-plus-uptime
- decisions/architecture/frontend/status-banner-on-every-site
- decisions/architecture/compute/cf-worker-quota-mitigation
- rules/interaction/never-hit-quotas
- rules/interaction/no-card-on-file
- rules/infrastructure/one-level-subdomain-only
---



# oriz-status-app — self-hosted status page

## Decision

The oriz.in family's status surface is now a self-hosted app at
[`status.oriz.in`](https://status.oriz.in), backed by two Cloudflare
Workers and one KV namespace. UptimeRobot is dropped (commercial-use
clause added Oct 2024 — incompatible with the family's free-tier
rule). Better Stack remains optional as a "second opinion" probe
during the transition but is no longer the source of truth.

## Architecture

```
                       ┌─ status.oriz.in (CF Pages, Astro static)
                       │      │ fetch /api/status every 60 s
                       │      ▼
  ┌─ oriz-status-ping ─┴─► STATUS_KV ◄── oriz-status-api ◄─ status-api.oriz.in
  │   (cron */5 min)      (KV namespace)   (read-only)
  │                          │
  │                          ├── latest          (current snapshot, no TTL)
  │                          ├── previous        (snapshot from prior tick)
  │                          ├── history:YYYY-MM-DD (per-day rollup, 90d TTL)
  │                          └── incidents        (last 50 transitions, capped)
  │
  └── on transition → Telegram bot (TELEGRAM_BOT_TOKEN + TELEGRAM_OPS_CHAT_ID)
```

- **Frontend** — Astro static, deployed to CF Pages. SSR placeholders
  for every target; client-side JS hydrates the dots from the API.
- **`oriz-status-ping`** — cron Worker, `*/5 * * * *`. Probes every
  target in `workers/targets.ts` (mirrors `FAMILY_*` from
  `@chirag127/astro-shell`). HEAD-first with GET fallback on 405/501.
  Treats >3000 ms as `degraded`. Writes `latest`, rolls `history:`
  for the day, appends to `incidents` on transitions, fires Telegram.
- **`oriz-status-api`** — read-only Worker. Serves `/api/status`,
  `/api/uptime?slug=&days=`, `/api/incidents`, `/feed.xml`. 60-sec
  `Cache-Control` and matching `s-maxage` for edge caching.

## Free-tier headroom math

| Quota | Limit | Our usage | Headroom |
|---|---|---|---|
| Workers Free invocations | 100,000 / day | 288 cron + ~1,440 API reads = ~1,728 | ~58× |
| Workers Free outbound subrequests | 50 per invocation | 24 targets, batched 25 at a time | OK |
| KV read | 100,000 / day | ~1,440 API reads × 1-2 KV reads = ~2,880 | ~35× |
| KV write | 1,000 / day | 288 ticks × ~4 writes = ~1,150 | tight — see note |
| KV storage | 1 GB | ~10 KB per day rollup × 90 = ~900 KB | massive |

KV write headroom note: 1,152 writes/day uses 115% of the 1,000/day
free quota. Mitigation: batch the four writes into one `latest` blob
that embeds `previous`, `incidents`, and the per-day rollup keyed
inside the same JSON — collapses to ~288 writes/day. Implement
*before* we cross the limit (we have a 4-day window of headroom).
Logged as a TODO in `oriz-status-app#issues`.

## Telegram alerts

On every status transition (`up` ↔ `degraded` ↔ `down`), the cron
Worker POSTs a Markdown message to the ops chat. Token + chat-id are
set via `wrangler secret put` on `oriz-status-ping`; both are
optional — if missing the alert no-ops. The same Telegram bot serves
the wider auto-tracking pipeline.

## RSS feed

`status-api.oriz.in/feed.xml` emits an RFC RSS 2.0 document built
from the `incidents` KV blob (last 50 transitions). `/feed.xml` on
the Pages domain redirects to the canonical worker route via
`public/_redirects`.

## Why not UptimeRobot

UptimeRobot revised its TOS October 2024 to prohibit use by any
entity engaging in commercial activity, "even tangentially". The
oriz.in family runs ads, affiliate links, and Razorpay payments in
parallel; tangential commercial activity is undeniable. Tool exited.

## Why not Better Stack alone

Better Stack's free tier is capped at 10 monitors. The family
already exceeds 24 targets (live) and is growing toward 50+ as
the APIs spin up. Capping monitoring at 10 means flying blind on
~80% of surfaces. Self-hosting on CF Free has comfortable headroom
to 50+ targets without paying.

## Surfaces probed (as of 2026-06-22)

- 1 master apex (`oriz.in`)
- 18 app subdomains (one-level only, per Rule 16)
- 5 live API subdomains (`-api` form, also one-level per Rule 16)

Future additions: as `*-api.oriz.in` and `book-*.oriz.in` go live,
append to `workers/targets.ts` and `src/data/targets.ts` (until the
codegen script that pulls from `@chirag127/astro-shell` lands).

## Status banner integration

The existing per-site `<StatusBanner />` (see
[status-banner-on-every-site](../frontend/status-banner-on-every-site.md))
switches its feed source from Better Stack's RSS to
`https://status-api.oriz.in/feed.xml`. One-line change in
`@chirag127/oriz-ui` once the worker is live and a few incidents
have published.
