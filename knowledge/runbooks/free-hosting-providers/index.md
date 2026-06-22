---
type: runbook
title: "Free hosting providers catalog — no-card, large-fleet picks (2026-06-22)"
description: "Catalog of every free-tier hosting provider vetted for the oriz family. Hard rule: NO card-on-file at signup. Must support a 50+ project fleet, decent bandwidth, and commercial use. Each sub-file is one category with provider-by-provider numbers, sources, and a KEEP / EVALUATE / DROP verdict."
tags: [runbook, hosting, free-tier, no-card-on-file, catalog, cloudflare, render, supabase, neon, vercel, netlify]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
  - rules/no-card-on-file
  - services/free-tier-catalog
  - decisions/architecture/cloudflare-pages-hosts-every-website-and-app
  - runbooks/scaffold-a-new-site
---

# Free hosting providers — catalog (2026-06-22)

## Why this exists

The family runs on the [no-card-on-file rule](../../rules/no-card-on-file.md). Every paid line item is rejected at the signup form. This catalog answers, for each tier of the stack, **which provider can host 50+ projects, free, with no card, with commercial use allowed**.

Research date: **2026-06-22**. Re-verify on the quarterly audit — the 2024–2026 window killed `Fly.io` perma-free, `PlanetScale Hobby`, `Cyclic.sh`, `Glitch hosting`, `IDrive E2 free`, and `Xata free`. This page is a snapshot, not a forecast.

## Quick-pick — winners per need

| Need | Best free option (no card) | Project / quota cap | Card-free? | Sub-file |
|---|---|---|---|---|
| Static sites (many) | **Cloudflare Pages** (primary), GitHub Pages (mirror) | 100 projects soft / unlimited | Yes | [`static-sites.md`](./static-sites.md) |
| Web services / containers | **Koyeb** (1 nano always-on) OR **Render** (free w/ 15-min sleep) | 1 / 1 | Yes | [`web-services.md`](./web-services.md) |
| Edge functions | **Cloudflare Workers**, Deno Deploy | 100K req/day, 1M req/mo | Yes | [`serverless-functions.md`](./serverless-functions.md) |
| Postgres DB | **Neon** (10 projects) OR Supabase (2) | 10 / 2 | Yes | [`databases.md`](./databases.md) |
| Document DB | **Firebase Firestore Spark** | 1 GiB | Yes | [`databases.md`](./databases.md) |
| Edge SQL | **Cloudflare D1** | 5 GB total | Yes | [`databases.md`](./databases.md) |
| KV / Redis | **Cloudflare KV**, Upstash Redis | 1 GB / 256 MB | Yes | [`databases.md`](./databases.md) |
| Object storage | **Backblaze B2** (no card) OR Cloudflare R2 (card required) | 10 GB / 10 GB | B2: yes, R2: NO | [`object-storage.md`](./object-storage.md) |
| Image CDN | **ImageKit** (20 GB) OR Cloudinary (25 credits) | 20 GB / 25 GB | Yes | [`image-cdn.md`](./image-cdn.md) |
| Queues / pub-sub | **Cloudflare Queues** (2026 GA in free), Upstash QStash | 10K ops/day, 1K msg/day | Yes | [`queues-pubsub.md`](./queues-pubsub.md) |
| Uptime / monitoring | **Better Stack** (commercial OK), UptimeRobot (personal only) | 10 monitors / 50 monitors | Yes | [`monitoring.md`](./monitoring.md) |
| Error tracking / logs | **Sentry Developer**, Axiom Personal | 5K errors/mo, 500 GB ingest/mo | Yes | [`monitoring.md`](./monitoring.md) |
| AI inference | (see `oriz-ai-providers` data repo) | varies | Yes | n/a |

## The DROP list (lie about being free OR died)

These appeared in earlier scoping but are out as of 2026-06-22:

| Provider | Reason | Date killed |
|---|---|---|
| Fly.io | Perma-free killed; now trial-only, card required after trial | Oct 2024 |
| AWS Lambda | 1M req/mo is real but **card required at AWS signup** | — (always) |
| Google Cloud Run | 2M req/mo is real but **card required at GCP signup** | — (always) |
| Oracle Cloud Always Free | Genuinely best free compute but **card required at signup** | — (always) |
| Vercel Hobby | Commercial use **explicitly prohibited** (incl. AdSense, donations) | enforced 2025+ |
| Cyclic.sh | Shut down | May 31 2024 |
| Glitch hosting | App hosting discontinued (IDE remnants only) | Jul 8 2025 |
| Deno Deploy Classic | Migrate to new "Deno Deploy" platform | Jul 2025 |
| PlanetScale Hobby | Free tier killed; cheapest now ~$39/mo | Apr 8 2024 |
| Xata Free | Killed free tier in enterprise pivot | 2025 |
| IDrive E2 Free | 10 GB free killed; trial-only now | ~2023 |
| Wasabi | Trial-only (30 days), no perma-free | — (always) |
| Bunny Optimizer | 14-day trial only | — (always) |
| Imgix | 30-day trial only | — (always) |
| Cloudflare R2 | 10 GB free is real but **card required to activate R2 service** | EVALUATE not DROP |
| Cloudflare Pages — Vercel-like commercial limit | None; Pages stays open | — |

**Special case: Render.** Their Apr 23 2026 plan reshuffle cut static-site bandwidth from 100 GB to 5 GB and capped services at 25. Render stays on the KEEP list for the rare web-service-with-sleep use case, but it's **no longer competitive for static sites** vs Cloudflare Pages / GitHub Pages.

**Special case: Netlify.** Sep 4 2025 moved Netlify Free to credit-based pricing. The credit pool is hard-capped (no surprise overages), but the model is unpredictable across a 50-project fleet. KEEP as a tertiary mirror for one or two highlight sites, not for the whole catalog.

## Sub-files in this runbook

| File | Category | Provider count |
|---|---|---|
| [`static-sites.md`](./static-sites.md) | Static site hosting | 9 |
| [`web-services.md`](./web-services.md) | Web services / containers | 7 |
| [`serverless-functions.md`](./serverless-functions.md) | Edge + functions | 7 |
| [`databases.md`](./databases.md) | Relational + document + edge SQL + KV | 12 |
| [`object-storage.md`](./object-storage.md) | S3-compat + IPFS storage | 6 |
| [`image-cdn.md`](./image-cdn.md) | Image CDN + transforms | 5 |
| [`queues-pubsub.md`](./queues-pubsub.md) | Async messaging / scheduled jobs | 5 |
| [`monitoring.md`](./monitoring.md) | Uptime + errors + logs | 6 |

Total: **8 sub-files**, ~57 providers vetted, ~30 keep / ~5 evaluate / ~22 drop.

## How to use this catalog

1. **New service needed?** Look up the category in the quick-pick table, click through to the sub-file, copy the winner's signup URL.
2. **Provider being onboarded?** Confirm against the sub-file's "Card at signup?" column before you click the signup button. If the answer is YES, stop — find an alternative.
3. **Quarterly audit?** Re-run each provider's free-tier page; update the "Verdict" column. The 2024–2026 window proved these tiers shift fast.
4. **Adding a provider not in the catalog?** Add a row to the right sub-file. Mark verdict + cite the source URL. Bump `timestamp` on the changed file.

## Source-of-truth links per provider

Each sub-file ends with a `## Sources` section listing the official pricing page + one third-party confirmation per provider. Always trust the official page when in doubt — third-party trackers lag the killed-free-tier announcements by weeks.

## Cross-links

- The no-card-on-file rule: [`../../rules/no-card-on-file.md`](../../rules/no-card-on-file.md)
- Where each oriz site currently runs: [`../../services/free-tier-catalog.md`](../../services/free-tier-catalog.md)
- Why Cloudflare Pages hosts the website fleet: [`../../decisions/architecture/cloudflare-pages-hosts-every-website-and-app.md`](../../decisions/architecture/cloudflare-pages-hosts-every-website-and-app.md)
- Adding a new site: [`../scaffold-a-new-site.md`](../scaffold-a-new-site.md)
