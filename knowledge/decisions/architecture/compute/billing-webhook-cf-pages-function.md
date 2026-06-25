---
type: decision
title: "Billing webhook architecture: CF Pages Function \u2192 Firestore"
description: "Razorpay (INR) + Paddle (ROW) + Play Billing (Android) + MS Store (Windows)\
  \ webhook handlers all land on a single CF Pages Function endpoint per provider\
  \ (4 endpoints total). The function (1) verifies the provider's webhook signature,\
  \ (2) writes user subscription state to Firestore, (3) returns 200. Zero CF Workers\
  \ in the hot path of payments. Each provider's pricing page button is a direct platform\
  \ link \u2014 no proxy through our infra. ~1 Pages Function call per purchase."
tags:
- decision
- billing
- webhook
- razorpay
- paddle
- play-billing
- ms-store
- cf-pages-function
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- decisions/architecture/packages/single-pricing-page-package
- decisions/architecture/security/payment-architecture-direct-links
- decisions/pricing/two-tier-ad-free-plus-pro
- rules/infrastructure/no-firebase-functions-blaze
---



# Billing webhook architecture

## Decision

4 webhook endpoints (one per payment provider), each implemented as a Cloudflare Pages Function:

| Provider | Webhook URL | Auth check |
|---|---|---|
| Razorpay (INR) | `oriz.in/api/billing-webhook/razorpay` | HMAC-SHA256 via `X-Razorpay-Signature` header + shared secret |
| Paddle (ROW) | `oriz.in/api/billing-webhook/paddle` | HMAC-SHA256 via `Paddle-Signature` header + shared secret |
| Play Billing (Android) | `oriz.in/api/billing-webhook/play` | Service-account JWT verification via `Authorization: Bearer` |
| Microsoft Store (Windows) | `oriz.in/api/billing-webhook/ms-store` | OAuth2 service principal |

## Why CF Pages Functions (not Workers)

- CF Pages Functions: 100K req/day free, lives next to our static site, zero card.
- CF Workers: 100K req/day free but separate deployment + bindings.
- Firebase Cloud Functions: requires Blaze (card) → banned per `no-firebase-functions-blaze`.

Pages Function is the simplest no-card option. 1 function call per purchase → far below quota.

## Webhook payload contract

Each handler normalizes the provider's payload to a single internal shape before writing to Firestore:

```ts
type SubscriptionUpdate = {
  userId: string;          // looked up from provider's customer.email
  tier: 'ad-free' | 'pro';
  status: 'active' | 'expired' | 'cancelled';
  expiresAt: number;       // unix ms
  source: 'razorpay' | 'paddle' | 'play' | 'ms-store';
  externalRef: string;     // provider's subscription/order ID
};

// Write path:
firestore.doc(`users/${userId}/subscriptions/${source}`).set(update)
```

User lookup: provider passes customer email at checkout. Pages Function queries Firestore `users` collection by `email` to find `uid`. If user doesn't exist yet (first purchase), the Pages Function creates a pending `users/{tempId}` doc; account-link happens on first login via Firebase Auth.

## Firestore reads in apps

Each app's BaseLayout pulls `users/{uid}/subscriptions/*` on auth state change (Firestore client SDK, real-time listener). On change:
- If any `subscription.tier === 'pro'` AND `status === 'active'`: enable Pro features (offline / sync / themes / priority support badge)
- If any `subscription.tier === 'ad-free'` AND `status === 'active'`: hide AdSense/AdMob snippet
- Else: free tier — show ads, no Pro features

Cross-app SSO via Firebase Auth means a single subscription unlocks all apps.

## Pricing page architecture

Per `single-pricing-page-package.md`, the `/pricing` route is shipped from `@chirag127/astro-billing` and mounted on every app. Buttons on the page are direct links to the provider's hosted checkout (Razorpay Payment Page, Paddle Checkout Page, Play Billing flow, MS Store IAP).

On purchase: provider's hosted checkout completes → posts webhook → CF Pages Function writes Firestore → apps see the change live via Firestore listener.

## Webhook secrets

Stored at chirag127 GH org level (per `github-org-level-secrets.md`):
- `RAZORPAY_WEBHOOK_SECRET`
- `PADDLE_WEBHOOK_SECRET`
- `PLAY_BILLING_SERVICE_ACCOUNT_JSON`
- `MS_STORE_AAD_TENANT_ID` + `MS_STORE_CLIENT_ID` + `MS_STORE_CLIENT_SECRET`

Added to `templates/.env.example` as DOCUMENTED env vars (with comments explaining each provider's setup URL).

## Cross-refs

- Single pricing page → [[decisions/architecture/single-pricing-page-package]]
- Payment architecture → [[decisions/architecture/payment-architecture-direct-links]]
- Two-tier pricing → [[decisions/pricing/two-tier-ad-free-plus-pro]]
- No Firebase Functions → [[rules/no-firebase-functions-blaze]]
