---
type: runbook
title: "Free hosting — web services (Render, Fly, Railway, Koyeb, Replit, Cyclic, Glitch)"
description: "Provider-by-provider free-tier numbers for hosting always-on or sleep-tolerant web services and containers. Most providers in this category collapsed their free tiers in 2024–2026; the survivors are Render (with sleep) and Koyeb (1 nano)."
tags: [runbook, hosting, free-tier, web-services, render, koyeb, fly-io, railway]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
  - runbooks/free-hosting-providers/index
  - rules/no-card-on-file
---

# Web services + containers — free tiers (2026-06-22)

This is the most-eroded category. **Fly.io perma-free, Cyclic.sh, Glitch hosting all died 2024–2025.** Two no-card survivors remain.

## The table

| # | Provider | Free tier | Card@signup | Sleep / cold start | Custom domain | Commercial OK | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | **Render Free** ⭐ | Web service: 750 hrs/mo, 512 MB RAM, 100 GB egress, 500 build min/mo | **NO** | Sleep after 15-min idle, 30–60 s cold start | YES + free TLS | YES | **KEEP** |
| 2 | **Koyeb Free** ⭐ | 1 Nano Instance (0.1 vCPU / 256 MB) + 1 free Postgres, scale-to-zero | **Conditional** (only if anti-fraud can't auto-verify humanity) | Scale-to-zero | YES | YES (never expires) | **KEEP (with caveat)** |
| 3 | Fly.io | Trial only: ~2 VM-hrs OR 7 days, then card required | YES | n/a (trial) | YES | YES | **DROP** — perma-free killed Oct 2024 |
| 4 | Railway | $5 one-time trial credit (expires 30 days); then $1/mo Free plan | NO for trial | usage-based | YES | YES (trial) | **EVALUATE** — trial-only, not durable |
| 5 | Replit | Free: 512 MB–1 GB RAM, ~1 GB storage, shared CPU; **no custom domains** on free | NO | Sleep ~5 min idle; always-on requires paid | NO on free | restricted on free | **EVALUATE** — no custom domain = blocker for prod |
| 6 | Cyclic.sh | — | — | **SHUT DOWN** May 31 2024 | — | — | **DROP (dead)** |
| 7 | Glitch | — | — | **HOSTING DISCONTINUED** Jul 8 2025 (IDE only) | — | — | **DROP (dead)** |

## How the family uses this category today

We mostly avoid persistent web services. The pattern is:

- **Static + Pages Functions** for 95% of needs (covered in [`static-sites.md`](./static-sites.md) + [`serverless-functions.md`](./serverless-functions.md))
- **Render Free** for the 1-2 services that genuinely need a long-running process (e.g., a cron poller, a Discord bot, a webhook receiver that can't fit in Workers' 10 ms CPU budget)
- **Koyeb Free** as the second slot — 1 Nano always-on without the 15-min sleep

If we cross 2 services, the next slot goes to a Cloudflare Workers Cron Trigger or a GitHub Actions scheduled workflow before paying for a third Render instance.

## Quirks per provider

- **Render Free sleep.** 15-min idle → instance spins down; first request after sleep takes 30–60 s to wake. Acceptable for Discord bots, webhook receivers, cron pollers. Not acceptable for anything user-facing without a wake-up cron.
- **Render 2026-04-23 plan reshuffle.** Free tier survived but with tighter caps (25 services total across all tiers). Static bandwidth was the big cut, not the web service tier.
- **Koyeb anti-fraud.** Their signup may ask for a card if their humanity check is uncertain (Tor exit nodes, residential VPNs, freshly-created GitHub accounts). Use a clean residential IP + a GitHub account >6 months old to bypass.
- **Fly.io history.** Perma-free was 3 small VMs for years. Killed in Oct 2024 amid abuse cleanup. Card now required after the 2 VM-hour / 7-day trial. Was a beloved free option; gone.
- **Railway trial.** $5 expires in 30 days, then Free plan needs $1/mo to stay alive. Not card-required for trial, but durable use needs the card.
- **Replit no-custom-domain on free.** Was free's biggest perk; killed circa 2023. Without custom domains, prod use isn't viable. Educational sandbox only.
- **Cyclic.sh** announced shutdown Apr 2024, off May 31 2024. Don't link to it anywhere.
- **Glitch hosting** stopped Jul 8 2025. IDE remnants may persist but no app hosting.

## Recommendation for the family

1. **Slot 1 (Render Free):** Discord bot / webhook receiver / scheduled poller that needs to be always-listening.
2. **Slot 2 (Koyeb Free):** A second always-on tiny service (e.g., metrics scrape relay).
3. **Slot 3 onwards:** Re-architect as Cloudflare Workers Cron Trigger OR GitHub Actions scheduled workflow — both are free, both are durable. Don't pay for Render slot #3.

## Sources

- [Render Free tier 2026 guide](https://deploybase.app/blog/render-free-tier-complete-guide-2026)
- [Render — platforms with a real free tier 2026](https://render.com/articles/platforms-with-a-real-free-tier-for-developers-in-2026)
- [Render new workspace plans](https://render.com/docs/new-workspace-plans)
- [Fly.io pricing](https://fly.io/docs/about/pricing/) + [2026 post-cut writeup](https://www.saaspricepulse.com/blog/flyio-free-tier-2026)
- [Railway free trial docs](https://docs.railway.com/reference/pricing/free-trial)
- [Koyeb pricing FAQ](https://www.koyeb.com/docs/faqs/pricing)
- [Koyeb anti-fraud signup blog](https://www.koyeb.com/blog/sustaining-free-compute-in-a-hostile-environment)
- [Replit limitations 2026](https://p0stman.com/guides/replit-limitations)
- [Cyclic shutdown announcement](https://www.cyclic.sh/posts/cyclic-is-shutting-down/)
- [Glitch shutdown — talk.tiddlywiki.org](https://talk.tiddlywiki.org/t/glitch-is-stopping-the-free-hosting-july-8-2025/12581)
