---
type: decision
title: "Three-tier pricing: Free / Pro / Max — single package, minimum manual work, community-support only"
description: "Replaces the two-tier (Ad-free + Pro) decision the same day. User mandate (2026-06-22): 3 tiers (Free / Pro / Max), agent decides the feature split, manual work is MINIMUM, everything controlled from a single package (`@chirag127/astro-billing`), websites differ but billing/auth/tier-checks are identical across apps. Community support only (Giscus + Discord) — no email tier. Free books bundled with Lifetime Max. Heavy features (high AI rate limits, all books, all early-access) gated to Max."
tags: [decision, pricing, tiers, free, pro, max, single-package, minimum-manual]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
supersedes: decisions/pricing/two-tier-ad-free-plus-pro
related:
  - decisions/architecture/single-pricing-page-package
  - decisions/architecture/payment-architecture-direct-links
  - decisions/architecture/billing-webhook-cf-pages-function
  - rules/no-card-on-file
  - decisions/architecture/oriz-ai-providers-package
---

# Three-tier pricing: Free / Pro / Max

## Tier matrix

| Feature | Free | Pro | Max |
|---|---|---|---|
| **Use all 26 apps** | ✓ | ✓ | ✓ |
| **Ads (AdSense + AdMob)** | shown | hidden | hidden |
| **PWA install / offline static content** | ✓ | ✓ | ✓ |
| **Family SSO across all 26 apps** | ✓ | ✓ | ✓ |
| **Cross-device sync** (history, bookmarks, theme) | — | ✓ | ✓ |
| **Custom themes** (light/dark/HC + custom palette) | — | ✓ | ✓ |
| **Multi-format export** (PDF / CSV / JSON / XLSX) | limited | full | full |
| **Usage caps on tools** (PDF merges, image converts, etc.) | 10/day | 100/day | unlimited |
| **AI features in apps** (chatbot, summarize, rewrite) | 10/day free-providers only | 50/day free-providers | unlimited + premium models |
| **AI rate limit** | shared free-provider pool | dedicated free-provider quota | premium models + dedicated quota |
| **Early access to new tools** | — | — | ✓ (30 days before Free) |
| **API access to oriz services** (REST) | — | — | ✓ |
| **Pro badge in community** (Giscus comments) | — | ✓ | ✓ (Max badge) |
| **Free books bundle** | — | — | ✓ (5 books on Lifetime; 1 book/yr on Yearly) |
| **Support** | community (Giscus/Discord) | community + GH issue priority | community + GH issue priority + direct DM |

## Pricing

| Tier | Monthly INR | Yearly INR | Lifetime INR |
|---|---|---|---|
| **Free** | ₹0 | ₹0 | ₹0 |
| **Pro** | ₹99 | ₹799 | ₹1,999 |
| **Max** | ₹299 | ₹2,499 | ₹5,999 |

USD via Paddle (auto-converted): Pro ~$1.19 / $9.59 / $24 · Max ~$3.59 / $30 / $72.

## Cross-refs

- Replaces two-tier → [[decisions/pricing/two-tier-ad-free-plus-pro]]
- Single pricing page → [[decisions/architecture/single-pricing-page-package]]
- Payment architecture → [[decisions/architecture/payment-architecture-direct-links]]
- Billing webhooks → [[decisions/architecture/billing-webhook-cf-pages-function]]
- AI providers → [[decisions/architecture/oriz-ai-providers-package]]
- No card on file → [[rules/no-card-on-file]]
