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

UptimeRobot's free tier became personal/OSS-only in Oct 2024. For commercial monitoring, Better Stack is now the go-to. Sentry + Axiom round out the observability stack.

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

Today: lightly. Cloudflare Pages + Workers analytics cover the "is the site up" question for the static fleet. We don't yet have a unified status page or error tracker.

Target end state:

| Layer | Provider | Cost |
|---|---|---|
| Uptime + status page (commercial) | Better Stack | $0 (10 monitors covers the top 10 sites) |
| Uptime overflow (personal/OSS sites) | UptimeRobot | $0 (50 monitors) |
| Cron monitoring (restic backup, daily catalog rebuild, etc.) | Healthchecks.io | $0 (20 checks) |
| Error tracking (frontend + Workers) | Sentry Developer | $0 (5K errors/mo, plenty of headroom) |
| Log ingestion (Workers logs, Pages function logs) | Axiom Personal | $0 (500 GB/mo is huge) |

## Quirks per provider

- **UptimeRobot Oct 2024 ToS change.** Free is now "personal, OSS, non-profit" only — commercial use requires paid. Most family sites are personal/OSS so this is fine, but the catalog + paid services (when Razorpay goes live) need Better Stack.
- **Better Stack** = Better Uptime + Logtail merged. The "Uptime" free tier is 10 monitors; "Logs" tier is separate (3 GB/mo).
- **Healthchecks.io** is the killer for cron health. Each cron job pings a URL on success; if the ping doesn't arrive in time, you get alerted. 20 checks covers the family's restic, mirror cron, daily catalog rebuild, hourly auto-source ingest, etc.
- **Sentry Developer.** 5K errors/mo + 50 replays + 5M spans is genuinely generous. 1 user limit kills team use; for solo-maintainer family this is fine.
- **Axiom Personal 500 GB/mo ingest** is the most generous log tier in the table. Comparable to Datadog's $$$$$ — Axiom does it free.
- **Better Stack Logs (ex-Logtail).** Merged into Better Stack. 3 GB logs is smaller than Axiom; use Axiom if logs volume matters.

## Recommendation for the family

1. **Uptime (commercial sites):** Better Stack — 10 monitors free.
2. **Uptime (personal + OSS overflow):** UptimeRobot — 50 monitors free.
3. **Cron job health:** Healthchecks.io — 20 checks free.
4. **Frontend + Worker errors:** Sentry Developer — 5K errors/mo free.
5. **Logs + traces + metrics:** Axiom Personal — 500 GB/mo ingest free.
6. **Replace any of the above** with Cloudflare Analytics if the metric fits inside what CF already collects (most "page view + simple latency" metrics do).

## Sources

- [Better Stack pricing](https://betterstack.com/pricing) — 10 monitors free
- [UptimeRobot pricing](https://uptimerobot.com/pricing/) + [Oct 2024 ToS change](https://uptimerobot.com/blog/non-commercial-free-tier/)
- [Healthchecks.io pricing](https://healthchecks.io/pricing/) — 20 checks free
- [Sentry pricing — Developer plan](https://sentry.io/pricing/) — 5K errors free
- [Axiom pricing — Personal](https://axiom.co/pricing) — 500 GB/mo free
- [Better Stack Logs (Logtail) pricing](https://betterstack.com/logs)
