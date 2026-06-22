---
type: runbook
title: "Free hosting — queues + pub-sub (CF Queues, Upstash QStash, Inngest, Trigger.dev, Pusher)"
description: "Provider-by-provider free-tier numbers for async message queues, scheduled jobs, pub-sub, and durable execution. Cloudflare Queues went GA in Workers Free on 2026-02-04 — biggest 2026 unlock. Upstash QStash + Inngest are the durable-job picks."
tags: [runbook, hosting, free-tier, queues, pubsub, cloudflare-queues, upstash-qstash, inngest]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
  - runbooks/free-hosting-providers/index
  - rules/no-card-on-file
---

# Queues + pub-sub — free tiers (2026-06-22)

Until Feb 4 2026, Cloudflare Queues required the Workers Paid plan. Now it's in the Workers Free tier with a 10K ops/day cap — the biggest 2026 unlock in this category.

## The table

| # | Provider | Free tier | Card@signup | Card to use free | KYC | Verdict |
|---|---|---|---|---|---|---|
| 1 | **Cloudflare Queues** ⭐ | 10,000 ops/day on Workers Free (GA in free 2026-02-04), 24-hour retention | NO | NO | NO | **KEEP** |
| 2 | **Upstash QStash** ⭐ | 1,000 messages/day, 10 active schedules, 50 GB bandwidth, 1 MB msg, retries free | NO | NO | NO | **KEEP** |
| 3 | Inngest | 50,000 executions/mo, 100K events, 5 concurrent steps, 50 realtime conns, 24h traces | NO | NO | NO | **KEEP** |
| 4 | Trigger.dev | ~10,000 runs/mo, limited concurrency, 14-day history, 1 prod env. **Apache 2.0 self-host = unlimited** | NO | NO | NO | **KEEP** |
| 5 | Pusher Channels Sandbox | 200,000 messages/day, 100 concurrent connections | NO | NO | NO | **KEEP** |

## How the family uses queues

Today: very lightly. Most async work fits one of:

- **Cron Triggers** (Cloudflare Workers scheduled functions) — daily/hourly tasks
- **GitHub Actions scheduled workflows** — multi-step, depend-on-secrets tasks
- **Synchronous HTTP** — most user-triggered work fits in the 10–50 ms CPU budget

When this is not enough (long-running webhook processing, fan-out work, durable retries):

- **Cloudflare Queues** for producer → consumer Worker pipelines (now free!)
- **Upstash QStash** for "I have an HTTP endpoint and want it called with retry/delay/cron"
- **Inngest** for step-functions-style multi-step durable workflows
- **Trigger.dev** if we want self-hostable + Apache 2.0 (no vendor risk)

## Quirks per provider

- **Cloudflare Queues 10K ops/day.** 1 op = produce + 1 op per consumer. For burst-tolerant scheduling this is plenty; for high-traffic event pipelines it's the wall.
- **Upstash QStash 1K msg/day + 10 schedules.** "10 active schedules" is the under-the-radar cap — for cron-replacement use cases, 10 named schedules across the family is the real ceiling.
- **Inngest free is the most generous step-function plan** in the table. 50K executions/mo + 100K events/mo + 24h traces. Steps are the granularity (so a 5-step workflow = 5 executions).
- **Trigger.dev self-host trump card.** Apache 2.0, you can run it on Render Free or Koyeb Free and never pay them. Best fit if we ever build a long-running scheduling system.
- **Pusher Channels Sandbox.** Realtime websockets, not really a queue. 200K msgs/day is fine for chat/presence in a single app, not 50 apps.

## Recommendation for the family

1. **Pub-sub for Worker pipelines:** Cloudflare Queues (now free).
2. **HTTP cron / delay / retry:** Upstash QStash (10 schedules covers most of what we'd need).
3. **Multi-step durable workflows:** Inngest free tier.
4. **Reach for self-host:** Trigger.dev on Render Free, only if vendor risk worries us.
5. **Realtime websockets:** Pusher Sandbox for one app; Cloudflare Durable Objects for fleet-wide.

## Sources

- [Cloudflare Queues pricing](https://developers.cloudflare.com/queues/platform/pricing/) — Feb 2026 GA in free
- [Upstash QStash pricing](https://upstash.com/pricing/qstash) — 1K msgs/day
- [Inngest pricing](https://www.inngest.com/pricing) — 50K execs/mo
- [Trigger.dev pricing](https://trigger.dev/pricing) — free + self-host
- [Pusher pricing](https://pusher.com/channels/pricing/) — Sandbox tier
