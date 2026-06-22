---
type: decision
title: "Two-tier pricing: Ad-free + Pro (offline + sync + themes + support)"
description: "Oriz family ships with two paid tiers across all apps (family-wide, same on every app): (1) Ad-free for ₹49/mo / ₹399/yr / ₹999-lifetime; (2) Pro (ad-free + offline + cross-device sync + custom themes + priority support) for ₹99/mo / ₹799/yr / ₹1,999-lifetime. Both via Razorpay Payment Pages (INR) and Paddle Checkout Pages (ROW). First book 'My Learnings from Oriz Project family' ebook-only (no paperback), free ISBN from KDP/D2D/Leanpub."
tags: [decision, pricing, tiers, ad-free, pro, monetisation, razorpay, paddle]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
  - decisions/architecture/single-pricing-page-package
  - decisions/policy/monetisation-channel-matrix
  - decisions/architecture/payment-architecture-direct-links
  - rules/no-card-on-file
  - decisions/architecture/first-book-oriz-learnings
---

# Two-tier pricing: Ad-free + Pro

## 2026-06-22 pricing update

Tier 1 doubled (from ₹49/₹399/₹999) per user re-grill the same day. Tier 2 stays at the level it was; Tier 2 features list may expand (see [[decisions/pricing/tier-2-pro-features]]).

## Tier 1: Ad-free

| Duration | Price INR | Price USD |
|---|---|---|
| Monthly | ₹99 | ~$1.19 (Paddle converts) |
| Yearly | ₹799 | ~$9.59 (Paddle converts) |
| Lifetime | ₹1,999 | ~$24 (Paddle converts) |

**Feature:** Remove AdSense + AdMob ads from all apps. Single Firebase Auth flag (`isAdFree`) checked at render time.

## Tier 2: Pro

| Duration | Price INR | Price USD |
|---|---|---|
| Monthly | ₹199 | ~$2.39 (Paddle converts) |
| Yearly | ₹1,599 | ~$19 (Paddle converts) |
| Lifetime | ₹3,999 | ~$48 (Paddle converts) |

**Features:** Everything in Ad-free PLUS:
1. **Offline download** — current app content packaged as static assets, cached via service worker.
2. **Cross-device sync** — history, bookmarks, reading progress saved to Firestore, restored on login from another device.
3. **Custom themes** — light/dark/high-contrast + user-customizable color palette (CSS custom properties).
4. **Priority support** — email reply within 24h (support@oriz.in → internal queue).

## Architecture

**Pricing page:** single shared page at `/pricing` from `@chirag127/astro-billing` package (v0.1.2+), mounted on every app.

**Payment flow:**
- Razorpay Payment Pages (INR, India): link buttons to hosted checkout
- Paddle Checkout Pages (ROW): link buttons to hosted checkout
- Both POST webhooks to CF Pages Function `/api/billing-webhook` → Firestore `users/{userId}/subscription` update
- Every app reads `subscription.tier` from Firestore on load (client SDK, no Workers in hot path)

**App-side logic:**
- If `tier === 'ad-free'` OR `tier === 'pro'`: hide AdSense/AdMob snippet
- If `tier === 'pro'` AND `offlineMode === true`: load from cache (service worker)
- If `tier === 'pro'` AND `loggedIn === true`: fetch sync history from Firestore

## Family-wide policy

Same tiers on EVERY app:
- home-app: Ad-free + Pro
- paisa-finance-tools-app: Ad-free + Pro
- slice-pdf-tools-app: Ad-free + Pro
- janaushdhi-app: Ad-free only (public health ethics; Pro features don't apply)
- cs-me-app: neither (personal site, no ads)

No per-app variation. No per-app features.

## Books

**First book = "My Learnings from Oriz Project family"** (ebook-only, no paperback).

ISBN: Free from Leanpub (optional) + D2D (auto-generated) + KDP (ASIN for Kindle). NO purchase of ISBNs required. Publishing via:
- **Leanpub** ($9 minimum, 10% fee) — ebook EPUB + PDF + MOBI
- **Gumroad** ($19 USD / ₹399 INR lifetime) — direct PDF/EPUB, 10% fee
- **KDP** ($4.99 USD Kindle) — free ASIN (not ISBN, but sufficient)
- **D2D** (Draft2Digital, $0 activation, 10% fee) — distributes to Apple Books / Kobo / B&N / Scribd

No paperback = no manufacturing, no logistics, no "paper bag" workflow (user rejected paperback on 2026-06-22).

## Cross-refs

- Single pricing page package → [[decisions/architecture/single-pricing-page-package]]
- Payment architecture (direct links) → [[decisions/architecture/payment-architecture-direct-links]]
- First book → [[decisions/architecture/first-book-oriz-learnings]]
- Monetisation matrix → [[decisions/policy/monetisation-channel-matrix]]
- No card on file → [[rules/no-card-on-file]]
