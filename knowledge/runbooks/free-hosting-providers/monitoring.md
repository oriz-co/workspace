---
type: runbook
title: "Free hosting — monitoring (Better Stack, UptimeRobot, Healthchecks, Sentry, Axiom)"
description: "Provider-by-provider free-tier numbers for uptime monitoring, error tracking, logs, and traces. Better Stack is the commercial-OK winner (UptimeRobot's free is personal/OSS only since Oct 2024). Sentry Developer + Axiom Personal cover errors + logs."
tags: [runbook, hosting, free-tier, monitoring, uptime, sentry, better-stack, axiom]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
  - runbooks/free-hosting-providers/index
  - rules/no-card-on-file
---

# Monitoring + uptime + logs — free tiers (2026-06-22)

**Primary uptime in 2026 is the custom `oriz-status-app`** (CF Worker + KV cache, self-hosted on Cloudflare Pages). Third-party uptime tools are kept as secondary because no commercial-OK free tier scales to the family's 45+ endpoint count:

- **UptimeRobot** became personal/OSS-only in Oct 2024 → unusable for commercial endpoints.
- **Better Stack Uptime free is capped at 10 monitors** → covers only the top 10 endpoints, not the 45+ fleet.

For errors, Sentry Developer + Axiom Personal still cover the family at $0.

## The table

| # | Provider | Free tier | Card@signup | Card to use free | KYC | Verdict |
|---|---|---|---|---|---|---|
| 1 | **Better Stack (Uptime)** ⭐ | 10 monitors + heartbeats, 1 status page, Slack/email alerts, 100K exceptions/mo, 5K replays | NO | NO | NO | **KEEP** (commercial OK) |
| 2 | UptimeRobot | 50 monitors, 5-min interval, 1 status page, 3-mo retention. **Non-commercial only since Oct 2024** | NO | NO | NO | **KEEP** (personal/OSS only) |
| 3 | **Healthchecks.io** ⭐ | 20 checks, 100 log entries/check, 5 SMS credits/mo, unlimited team | NO | NO | NO | **KEEP** (cron monitoring) |
| 4 | **Sentry Developer** ⭐ | 5K errors, 50 replays, 5 GB logs, 5 GB app metrics, 5M spans, 1 uptime + 1 cron, 1 user | NO | NO | NO | **KEEP** |
| 5 | **Axiom Personal** ⭐ | 500 GB/mo ingest, 25 GB storage, 10 GB-hr query, 30-day retention, 3 datasets, 1 user | NO | NO | NO | **KEEP** |
| 6 | Better Stack Logs (was Logtail) | 3 GB logs/mo (3-day retention), 30 GB metrics, 3 GB traces, 3 GB warehouse events | NO | NO | NO | **KEEP** |

## How the family uses monitoring

Target end state (in progress, 2026-06):

| Layer | Provider | Cost | Status |
|---|---|---|---|
| Uptime (primary, all 45+ endpoints) | **`oriz-status-app`** (custom; CF Worker + KV cache, hosted on CF Pages) | $0 | In build |
| Uptime (secondary, top-10 commercial) | Better Stack | $0 (capped at 10 monitors → cannot cover full fleet) | Active |
| Uptime (tertiary, personal/OSS only) | UptimeRobot | $0 (commercial-use ban since Oct 2024) | Active for OSS sites only |
| Cron monitoring (restic backup, daily catalog rebuild, etc.) | Healthchecks.io | $0 (20 checks) | Active |
| Error tracking (frontend + Workers) | Sentry Developer | $0 (5K errors/mo, plenty of headroom) | Active |
| Log ingestion (Workers logs, Pages function logs) | Axiom Personal | $0 (500 GB/mo is huge) | Active |

### Why we're building `oriz-status-app`

- **Better Stack hard-caps free at 10 monitors.** The family runs 45+ endpoints (5 apps + 19 API surfaces + 21 content sites). Better Stack covers only the top 10 → 35+ endpoints uncovered.
- **UptimeRobot 2024 ToS change** banned commercial use on the free tier. Roughly half the family is commercial-adjacent (paid services, ads-enabled sites), so UptimeRobot is unsafe except on the strictly-OSS sites.
- **No third-party free tier scales to 45+ commercial monitors.** Conclusion: build our own.
- **`oriz-status-app` shape:** CF Worker hits each endpoint every 5 min via Cron Triggers, writes result to CF KV (`status:<endpoint>:<timestamp>` keys with TTL); CF Pages site reads KV and renders the status page. All within Workers Free quota (100K req/day budget; 45 endpoints × 12/hr × 24 = 12,960 checks/day → 13% of cap).

## Quirks per provider

- **UptimeRobot Oct 2024 ToS change.** Free is now "personal, OSS, non-profit" only — commercial use requires paid. Most family sites are personal/OSS so this is fine, but the catalog + paid services (when Razorpay goes live) need Better Stack.
- **Better Stack** = Better Uptime + Logtail merged. The "Uptime" free tier is 10 monitors; "Logs" tier is separate (3 GB/mo).
- **Healthchecks.io** is the killer for cron health. Each cron job pings a URL on success; if the ping doesn't arrive in time, you get alerted. 20 checks covers the family's restic, mirror cron, daily catalog rebuild, hourly auto-source ingest, etc.
- **Sentry Developer.** 5K errors/mo + 50 replays + 5M spans is genuinely generous. 1 user limit kills team use; for solo-maintainer family this is fine.
- **Axiom Personal 500 GB/mo ingest** is the most generous log tier in the table. Comparable to Datadog's $$$$$ — Axiom does it free.
- **Better Stack Logs (ex-Logtail).** Merged into Better Stack. 3 GB logs is smaller than Axiom; use Axiom if logs volume matters.

## Recommendation for the family

1. **Uptime (primary):** build + run `oriz-status-app` (CF Worker + KV + Pages). Only free path to cover 45+ commercial endpoints.
2. **Uptime (top-10 backup):** Better Stack — 10 monitors covers the top 10 commercial endpoints as a redundant rail (independent vendor in case our own Worker layer goes down).
3. **Uptime (OSS-only overflow):** UptimeRobot — 50 monitors free, personal/OSS sites only (commercial-use ban).
4. **Cron job health:** Healthchecks.io — 20 checks free.
5. **Frontend + Worker errors:** Sentry Developer — 5K errors/mo free.
6. **Logs + traces + metrics:** Axiom Personal — 500 GB/mo ingest free.
7. **Replace any of the above** with Cloudflare Analytics if the metric fits inside what CF already collects (most "page view + simple latency" metrics do).

## Sources

- [Better Stack pricing](https://betterstack.com/pricing) — 10 monitors free
- [UptimeRobot pricing](https://uptimerobot.com/pricing/) + [Oct 2024 ToS change](https://uptimerobot.com/blog/non-commercial-free-tier/)
- [Healthchecks.io pricing](https://healthchecks.io/pricing/) — 20 checks free
- [Sentry pricing — Developer plan](https://sentry.io/pricing/) — 5K errors free
- [Axiom pricing — Personal](https://axiom.co/pricing) — 500 GB/mo free
- [Better Stack Logs (Logtail) pricing](https://betterstack.com/logs)
