---
type: runbook
title: "Free hosting — serverless functions + edge (CF Workers, Deno Deploy, AWS Lambda, Cloud Run, Vercel/Netlify Fns)"
description: "Provider-by-provider free-tier numbers for serverless functions and edge runtimes. Big-three clouds (AWS Lambda, GCP Cloud Run, Oracle) have genuinely generous free tiers but ALL require a card at signup, so they DROP. Cloudflare Workers + Deno Deploy win for the family."
tags: [runbook, hosting, free-tier, serverless, edge, cloudflare-workers, deno-deploy, aws-lambda]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
  - runbooks/free-hosting-providers/index
  - rules/no-card-on-file
---

# Serverless functions + edge — free tiers (2026-06-22)

Everything in this category is a function-of-request runtime. The big three clouds (AWS, GCP, Oracle) have the most generous quotas but all require a card at signup — they DROP regardless of how good the quota looks. Cloudflare Workers and Deno Deploy are the family-grade picks.

## The table

| # | Provider | Free tier | Card@signup | Cold start | Custom domain | Commercial OK | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | **Cloudflare Workers** ⭐ | 100K req/day, 10 ms CPU/invocation, KV 1 GB + 100K reads/day, D1 5 GB | NO | None (edge) | YES (workers.dev free + bring-your-own free) | YES | **KEEP** |
| 2 | **Deno Deploy** ⭐ | 1M req/mo, 100 GB egress, 50 ms CPU/req, 50 custom domains, 1 GiB KV | NO | None (edge) | YES (50!) | YES | **KEEP** (note: Classic killed Jul 2025, use new platform) |
| 3 | Netlify Functions | 125K invocations/mo, 1M edge function invocations, included in Netlify Free credit pool | NO | Cold start | YES | YES | **KEEP** |
| 4 | Vercel Hobby Functions | 1M invocations/mo, 4 hrs active CPU/mo, 100 GB data transfer | NO | Cold start | YES | **NO** (Hobby commercial-use ban) | **EVALUATE** — personal/portfolio only |
| 5 | AWS Lambda | 1M req/mo + 400K GB-sec + 100 GiB response streaming **FOREVER** | YES (AWS account) | Cold start | YES (API Gateway / Function URL) | YES | **DROP** — card-at-signup |
| 6 | Google Cloud Run | 2M req/mo, 360K vCPU-sec, 180K GiB-sec, 1 GB egress | YES (GCP signup) | Scale-to-zero cold start | YES | YES | **DROP** — card-at-signup |
| 7 | Cloudflare Pages Functions | Shares Workers Free quota (100K req/day) | NO | None (edge) | YES | YES | **KEEP** (bundled with Pages) |

## Where the family runs functions today

- **API endpoints under `*.api.oriz.in`** → Cloudflare Workers (DNS CNAME → workers.dev, custom domain on the Worker)
- **Per-site dynamic endpoints** → Cloudflare Pages Functions (`functions/` dir in each Pages project)
- **Cron / scheduled jobs** → Cloudflare Workers Cron Triggers
- **Anything that needs >10 ms CPU or longer-running work** → Deno Deploy (50 ms budget) OR fall back to Render Free with sleep

## Quota math for a 50-site fleet

100K req/day is the Workers Free shared cap. For 50 sites:

- If each site needs 1 cron-style call/hour: 50 × 24 = 1,200 req/day → 1.2% of cap
- If each site needs 100 user requests/day: 50 × 100 = 5,000 req/day → 5% of cap
- If each site averages 1 request/second (busy): 50 × 86,400 = 4.3M req/day → **43× over cap**

Conclusion: cap holds for sparse / cron / lightweight-API traffic. Sites with sustained user traffic should serve as static + only reach for a function on rare paths (auth, checkout, search).

## Quirks per provider

- **Cloudflare Workers 10 ms CPU limit.** Hard. Anything heavier (image processing, AI inference, big JSON crunching) trips it. Mitigation: offload to Pages Functions (longer budget) or Deno Deploy (50 ms).
- **Deno Deploy Classic killed Jul 2025.** New platform ("Deno Deploy" without the Classic suffix) is the current product. Existing projects had to migrate.
- **Netlify Functions in credit model.** Sept 2025 moved Netlify Free to credit-pooled quota. Function invocations come out of the same pool as bandwidth and build minutes. Harder to reason about with 50 sites.
- **Vercel Hobby Functions commercial-use ban.** Personal portfolio only. The function quota is generous (1M/mo) but the ban makes it unusable for anything monetized.
- **AWS Lambda forever-free.** Genuinely 1M req/mo permanently free — the most generous in this table. But AWS account creation requires a card for identity verification (charged $0 if you stay in free tier). Hard DROP under the no-card rule.
- **GCP Cloud Run.** 2M req/mo free is excellent, but GCP signup requires a card. Same DROP logic as Lambda.
- **Pages Functions = Workers under the hood.** They share the Workers Free quota. Don't double-count.

## Recommendation for the family

1. **Primary:** Cloudflare Workers + Pages Functions for all edge-grade work.
2. **Secondary:** Deno Deploy for anything that exceeds the 10 ms CPU budget (image transforms, JSON aggregation, light AI inference under 50 ms).
3. **Tertiary:** Render Free (with sleep) for anything that needs >50 ms CPU and isn't user-facing.
4. **Never reach for:** AWS Lambda, Cloud Run, Oracle Functions — until / unless the no-card rule changes.

## Sources

- [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Cloudflare Workers free 2026 deals](https://agentdeals.dev/vendor/cloudflare-workers)
- [Deno Deploy pricing](https://deno.com/deploy/pricing)
- [Deno Deploy pricing 2026 — srvrlss.io](https://www.srvrlss.io/provider/deno-deploy/)
- [Netlify pricing](https://www.netlify.com/pricing/) (credit-based since Sep 2025)
- [Vercel Hobby — commercial-use ban](https://vercel.com/docs/plans/hobby)
- [AWS Lambda pricing — forever-free](https://aws.amazon.com/lambda/pricing/)
- [AWS Free Tier 2025 explainer](https://cloudwithalon.com/aws-free-tier-2025-whats-free-and-for-how-long)
- [Google Cloud Free Program docs](https://docs.cloud.google.com/free/docs/free-cloud-features)
- [GCP signup card requirement](https://gturanker.org/articles/google-cloud-for-beginners/)
