---
type: decision
title: Maximalist mega-sitemap footer everywhere + monetization on EVERY app (reversals)
description: 'Two reversals locked 2026-06-22 evening. (1) Footer = MAXIMALIST mega-sitemap
  on every app (reverses per-app-divergent footer from shared-vs-divergent-matrix).
  Reason: AdSense + Play Store + MS Store + Razorpay approval gates all require visible
  legal links + family-nav + contact. Mega-sitemap satisfies all gates uniformly.
  (2) Monetization on EVERY app including janaushdhi (reverses the ''no ads on public-health''
  carve-out from ads-allowed-everywhere-except.md). Reason: ''every app should have
  monetization regardless of category''.'
tags:
- decision
- footer
- mega-sitemap
- monetization
- ads
- approval
- reversal
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
supersedes_in_part: decisions/architecture/shared-vs-divergent-matrix (footer row)
supersedes: rules/ads-allowed-everywhere-except
related:
- decisions/architecture/general/shared-vs-divergent-matrix
- decisions/pricing/three-tier-free-pro-max
- decisions/architecture/packages/legal-pages-package-in-domain
---



# Maximalist footer + monetization-everywhere (reversals)

## Reversal 1: Footer = MAXIMALIST mega-sitemap on EVERY app

**Earlier (same day):** "Footer is DIFFERENT per app (not shared). Each app draws its own footer."

**REVERSED 2026-06-22 evening:** Every app ships the same maximalist mega-sitemap footer, served from `@chirag127/astro-chrome/Footer.astro`. Same component, same data (`FAMILY_APPS` + `FAMILY_BOOKS` + `FAMILY_PACKAGES`), same visual treatment.

**User mandate verbatim:** "I add maximalist footer because many of the approval requires the footer having legal pages and many more."

## Footer content

| Section | Content |
|---|---|
| **Apps** | All 25 apps grouped by category (Hub / Content / Tools / Personal) |
| **Books** | All 5 books |
| **Packages** | All 22 packages |
| **Legal** | Privacy / Terms / Contact / About / Refunds / Disclaimer / Security.txt / Sitemap |
| **Family** | Newsletter / Status / Changelog / Sponsors / Feedback |
| **Brand** | Oriz wordmark + 1-line bio + © year |

Mobile: collapses into accordion sections.

## Reversal 2: Monetization on EVERY app

**Earlier (`rules/ads-allowed-everywhere-except.md`):** "AdSense + AdMob on every app EXCEPT oriz-cs-me-app (personal site) and oriz-janaushdhi-app (public-health ethics)."

**REVERSED 2026-06-22 evening:** Every app shows ads + pricing tiers — including janaushdhi (public-health) and cs-me (personal).

**User mandate verbatim:** "Every app we are making should have proper monetization. It doesn't matter that it is a medical website or something like that, it should have proper monetization. Like just like how you did with the Janoji website that you remove the monetization, it should not be the case. Every app should have the monetization."

## What every app shows

- **Free tier:** AdSense web ads + AdMob in AAB (per `ads-allowed-everywhere-except` formerly-rule, now generalized). Standard ad placements: 1 above-the-fold + 1 inline + 1 sticky footer.
- **Ad-free tier:** `Pro` or `Max` subscription removes ads.
- **Pricing page** mounted at `/pricing` on every app (via `@chirag127/astro-billing` Pricing component).
- **Tier 1 Pro:** ₹99/mo · ₹799/yr (no lifetime)
- **Tier 2 Max:** ₹299/mo · ₹2,499/yr

## Specific app updates

| App | Old policy | New policy (locked) |
|---|---|---|
| `oriz-janaushdhi-app` | NO ads (public-health) | Ads enabled + /pricing mounted |
| `oriz-cs-me-app` | NO ads (personal) | Ads enabled + /pricing mounted |
| All other 23 apps | Ads enabled | UNCHANGED — ads enabled |

## SUPERSEDES

- `rules/ads-allowed-everywhere-except.md` — fully reversed. The "except" carve-out is removed.
- `decisions/architecture/shared-vs-divergent-matrix.md` (Footer row) — footer is now SHARED, not divergent.

## Cross-refs

- Shared-vs-divergent matrix → [[decisions/architecture/shared-vs-divergent-matrix]]
- 3-tier pricing → [[decisions/pricing/three-tier-free-pro-max]]
- Legal pages package → [[decisions/architecture/legal-pages-package-in-domain]]
