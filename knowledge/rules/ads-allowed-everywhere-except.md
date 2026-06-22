---
type: rule
title: "Ads allowed everywhere except two ethics-locked apps"
description: "AdSense (web) and AdMob (Android AAB) are enabled on every app, tool, content site, book, and blog in the family — EXCEPT oriz-cs-me-app (me.oriz.in, personal canon) and oriz-janaushdhi-app (janaushdhi.oriz.in, public-health). Web format: AdSense responsive units, max 1 above-the-fold per page; more allowed below. AAB format: AdMob banner + interstitial; rewarded ads only for opt-in unlocks."
tags: [rule, monetisation, ads, adsense, admob, ethics]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
  - decisions/architecture/revenue-channels-2026
  - decisions/policy/monetisation-channel-matrix
  - decisions/architecture/janaushdhi-app-scope
  - decisions/architecture/cs-me-app-scope
  - rules/no-ad-slots-in-markup
---

# Ads allowed everywhere except two ethics-locked apps

## Rule

AdSense (web) and AdMob (Android AAB) are enabled on every app, tool,
content site, book site, and blog in the family — **except** two
apps that stay ad-free on ethics grounds:

| App | Subdomain | Why ad-free |
|---|---|---|
| `oriz-cs-me-app` | me.oriz.in | Personal canon / portfolio — ads cheapen brand |
| `oriz-janaushdhi-app` | janaushdhi.oriz.in | Public-health utility, ethics locked to no ads/affiliate/tracking |

Every other surface — 14 tool sites, content apps, blog, books,
catalog, hub — runs ads.

## Web (AdSense)

- Responsive AdSense units only
- **Max 1 ad unit above-the-fold per page**
- Additional units below the fold are fine
- Slots injected at runtime per [`no-ad-slots-in-markup.md`](./no-ad-slots-in-markup.md)

## AAB / Android (AdMob)

- **Banner** at bottom of main screens
- **Interstitial** between major navigation transitions (cap: 1 per
  user-flow)
- **Rewarded** only for opt-in unlocks (extra credits, premium export,
  ad-removed session)

## Cross-refs

- [`revenue-channels-2026.md`](../decisions/architecture/revenue-channels-2026.md) — full monetisation strategy
- [`monetisation-channel-matrix.md`](../decisions/policy/monetisation-channel-matrix.md) — per-channel rules
- [`janaushdhi-app-scope.md`](../decisions/architecture/janaushdhi-app-scope.md) — ethics carve-out for public-health
- [`cs-me-app-scope.md`](../decisions/architecture/cs-me-app-scope.md) — personal canon carve-out
- [`no-ad-slots-in-markup.md`](./no-ad-slots-in-markup.md) — runtime injection rule
