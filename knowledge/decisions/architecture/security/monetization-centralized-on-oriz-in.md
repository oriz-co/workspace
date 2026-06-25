---
type: decision
title: "Monetization centralized on oriz.in only \u2014 apps redirect for paid upgrades"
description: 'Locked 2026-06-23. Razorpay checkout lives ONLY on oriz.in/pricing.
  Every app subdomain that shows an Upgrade CTA redirects to oriz.in/pricing?app=<slug>&return=<url>.
  Single domain for payment gateway compliance + zero manual work setting up checkout
  per app. Sign-in is encouraged everywhere but only REQUIRED for: (a) Pro/Max-tier
  features, (b) stateful apps that save user data.'
tags:
- decision
- monetization
- razorpay
- auth
- centralized
- checkout
timestamp: 2026-06-23
format_version: okf-v0.1
status: superseded
superseded_by: decisions/architecture/monetisation/donations-only-2026-06-25.md
related:
- decisions/architecture/security/data-hub-and-central-auth
- decisions/pricing/three-tier-free-pro-max
- rules/infrastructure/shared-tenant-by-default
---

> **Superseded 2026-06-25** — see [donations-only-2026-06-25](../monetisation/donations-only-2026-06-25.md). Reasoning preserved below for audit.

# Monetization on oriz.in only — apps redirect for upgrades

## Rule

All paid-tier upgrades happen at **oriz.in/pricing** only. No app subdomain has its own Razorpay checkout. When a user clicks "Upgrade to Pro" or "Upgrade to Max" on any app (e.g. journal.oriz.in, finance.oriz.in), the app issues a redirect to:

```
https://oriz.in/pricing?app=<slug>&return=<encoded-return-url>
```

The user completes payment on oriz.in. Razorpay webhook fires on oriz.in. Firestore is updated (single source of truth). The user is then redirected back to `<return-url>` with the new tier reflected in their auth token next refresh.

## Why centralize

1. **Single Razorpay merchant ID** — one merchant for the whole family per Rule 15 (shared-tenant-by-default). Razorpay structurally forbids multiple merchant accounts on the same business PAN, so this is the only legal shape.
2. **One checkout flow to maintain** — when promo codes, plan changes, subscription upgrades happen, we change one codebase not 25.
3. **Webhook security** — one webhook endpoint (`oriz.in/api/billing-webhook/razorpay`) means one secret to rotate, one place to validate signatures.
4. **Compliance simplicity** — Razorpay KYC, GST invoicing, refund flows all happen on one domain. No legal ambiguity about which entity owns the transaction.
5. **Single Pro/Max upsell experience** — users see consistent pricing UI no matter which app they came from.

## Why NOT per-app checkout

- Each app subdomain would need its own Razorpay merchant credentials → forbidden by Razorpay
- 25× duplicate checkout code → 25× maintenance
- 25× test environments → 25× ways to break
- The "where do I upgrade?" question gets confusing across subdomains

## Auth scope per app

Sign-in **encouraged everywhere** to capture user data (analytics, retention, upsell opportunity), but only **strictly required** for:

| Trigger | Required? | Why |
|---|---|---|
| Free tier, anonymous, stateless tool (dice roller, PDF converter, QR generator, currency lookup) | Optional | No data to save; no Pro feature to unlock |
| User wants to save preferences / settings on a stateless tool | Required | Persistence requires identity |
| User wants Pro/Max-tier feature on ANY app | Required | Tier check needs identity |
| User opens a stateful app (journal, financial-cards, omni-post, packages-catalog) | Required | App is useless without identity-scoped data |
| User checks out for Pro/Max upgrade | Required | Razorpay needs customer identity |

## Implementation pattern

Every app's "Upgrade" button:

```astro
---
const APP_SLUG = 'roam-journal' // per app
const returnUrl = encodeURIComponent(Astro.url.href)
---
<a href={`https://oriz.in/pricing?app=${APP_SLUG}&return=${returnUrl}`}>
  Upgrade to Pro
</a>
```

Inside `oriz.in/pricing.astro`:
1. Read `app` + `return` query params
2. Show pricing table (3-tier: Free, Pro, Max)
3. On "Buy", open Razorpay checkout (subscription share-link or `rzp.subscriptions.create()`)
4. On webhook, write `users/{uid}.tier = 'pro'` to Firestore
5. On checkout success, redirect to `<return>` (or fallback to the app's home)

## Auth flow stays unchanged

Sign-in still happens at `auth.oriz.in` per the existing central auth decision. The cookie domain `.oriz.in` makes the Firebase ID token available to all subdomains. The Pro/Max tier claim is added to the token via a Firebase Custom Claims write on webhook receipt. Next token refresh (within 1 hour) the app subdomain sees the upgraded tier.

## What this kills

- Per-app Razorpay credential env vars (already moot — there's only one merchant)
- Per-app `<RazorpayCheckout />` components (kept as a thin wrapper that just redirects)
- Per-app webhook configuration (one webhook on oriz.in is the only one we need)

## Cross-refs

- Central auth → [[decisions/architecture/data-hub-and-central-auth]]
- 3-tier pricing → [[decisions/pricing/three-tier-free-pro-max]]
- Shared-tenant rule → [[rules/shared-tenant-by-default]]
- Razorpay end-to-end → [[runbooks/razorpay-end-to-end-setup]]
