---
type: decision
title: Single family-wide pricing page (ad-free is the only paid feature)
description: "One pricing page shared across all oriz apps, served from a package\
  \ so it's identical everywhere. The ONLY paid feature family-wide is 'ad-free' \u2014\
  \ remove AdSense + AdMob. Same price tier across web + Play + MS Store. Single Razorpay/Paddle/Play-Billing\
  \ link. No per-app paywall complexity."
tags:
- decision
- pricing
- paywall
- package
- ad-free
- family-wide
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- decisions/policy/monetisation-channel-matrix
- decisions/architecture/security/payment-architecture-direct-links
- rules/ads-allowed-everywhere-except
- decisions/architecture/general/no-firebase-functions
---



# Single family-wide pricing page

## Decision

There is **ONE** pricing page across the entire oriz family. Same content, same layout, same prices, served from a shared package so every app renders the identical page at `/pricing` (or `/upgrade`).

**Package:** add `Pricing.astro` + `PricingTable.astro` to `@chirag127/astro-billing` (existing) — bump to v0.1.1 or higher. Each app imports and mounts at its own `/pricing` route. Per-app override = button labels only (e.g. "Upgrade Oriz Slice" vs "Upgrade Oriz Paisa").

## The only paid feature: ad-free

Family-wide, the **only** thing the paid tier unlocks is **ad removal** (AdSense on web, AdMob in Play AAB). No "Pro features", no "extra tools", no "higher limits". Removing ads is enough.

Why this is enough:
- Simplest mental model — "pay to remove ads" is universally understood
- No engineering cost per app — the ad-rendering layer reads a single `isAdFree` flag from auth state
- Aligns with the per-app divergence philosophy (apps stay simple, monetisation stays out of the way)
- Honors `oriz-cs-me-app` + `oriz-janaushdhi-app` which have no ads anyway (paid tier has nothing to offer there → those apps don't show the pricing page)

## Pricing tiers (single matrix)

| Tier | Price (INR) | Price (USD) | Channel | Recurrence |
|---|---|---|---|---|
| **Free** | ₹0 | $0 | — | — |
| **Ad-free monthly** | ₹49 / mo | $0.99 / mo | Razorpay (IN) · Paddle (ROW) · Play Billing (Android AAB) · MS Store (Windows MSIX) | Monthly |
| **Ad-free yearly** | ₹399 / yr | $9 / yr | Same as above | Yearly (≈40% off) |
| **Ad-free lifetime** | ₹999 once | $19 once | Razorpay · Paddle · Gumroad | One-time |

Same prices everywhere — no per-app skew.

## Architecture (no Workers in hot path)

1. User clicks "Remove ads" on `/pricing` of any app
2. Button = direct platform link → Razorpay Payment Page (IN) OR Paddle Checkout (ROW) OR Play Billing (Android) OR MS Store IAP (Windows)
3. Provider webhook posts to a **single** CF Pages Function endpoint (`/api/billing-webhook`) that writes `{userId, isAdFree, until}` to Firestore
4. Every app's ad-rendering layer reads `isAdFree` from Firestore client SDK (no Workers, no Functions Blaze)
5. If `isAdFree === true`, skip the AdSense/AdMob snippet entirely

CF Workers usage: ZERO in the purchase flow. CF Pages Functions: 1 call per purchase (webhook). Firestore: client SDK only.

## Cross-app SSO for ad-free state

The `isAdFree` flag travels with the Firebase Auth user — sign in once across `*.oriz.in`, ad-free works everywhere. Powered by `auth.oriz.in` (existing decision).

## Apps with no pricing page

- `oriz-cs-me-app` — personal site, no ads, no pricing
- `oriz-janaushdhi-app` — public-health ethics, no ads, no pricing

Every other app mounts the package-served `/pricing` route.

## Cross-refs

- Channel monetisation matrix → [[decisions/policy/monetisation-channel-matrix]]
- Payment architecture (direct links) → [[decisions/architecture/payment-architecture-direct-links]]
- Ads rule → [[rules/ads-allowed-everywhere-except]]
- No Firebase Functions → [[decisions/architecture/no-firebase-functions]]
