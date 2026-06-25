---
type: decision
title: "Payment architecture \u2014 direct platform links via CF Worker click-tracker"
description: "Definition: 'direct platform link' = a button on our site that redirects\
  \ to a provider's hosted checkout (Razorpay Payment Page, Gumroad URL, Paddle checkout\
  \ link, Substack subscribe URL). Provider hosts the checkout; we host the button.\
  \ User picked a small CF Worker proxy that logs the click anonymously to CF Analytics\
  \ Engine and then 302s to the platform URL \u2014 ~1 Worker call per checkout, 20x\
  \ headroom on the 100K/day free envelope. Zero payment secrets on our infra (no\
  \ API keys); all payouts go to the creator's bank account after the platform's own\
  \ KYC. Per-region routing: Razorpay (INR) + Paddle (USD/EUR/GBP/ROW) + Gumroad (digital\
  \ downloads) + Substack (newsletters) + Play Billing (in-app)."
tags:
- decision
- architecture
- payments
- razorpay
- paddle
- gumroad
- substack
- cloudflare-workers
- no-card-on-file
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- rules/interaction/no-card-on-file
- decisions/architecture/general/no-firebase-functions
- decisions/architecture/compute/cf-worker-quota-mitigation
- decisions/monetisation/max-payment-methods
---



# Payment architecture — direct platform links via CF Worker click-tracker

## Decision

Checkout flows in the family use **direct platform links**: a button
on our site redirects the user to the payment provider's hosted
checkout. Provider hosts the checkout, we host the button. A tiny
Cloudflare Worker sits in the middle to log the click anonymously
before the 302.

## Definitions

- **Direct platform link** = button on `oriz.in` (or any sub-site) →
  redirect to provider-hosted checkout URL (Razorpay Payment Page,
  Gumroad product URL, Paddle checkout link, Substack subscribe URL).
- The provider hosts the form, takes the card, handles SCA / 3DS,
  emits the receipt. We never touch card data.

## Flow

```
button click
  → CF Worker  /track-checkout?dest=razorpay&plan=pro&ref=blog
  → log to CF Analytics Engine  (anonymous, no PII)
  → 302  https://rzp.io/l/oriz-pro
```

~1 Worker invocation per checkout click. With realistic checkout
volume the burn is ~5K/day at peak — **20x headroom** on the
100K/day free envelope ([`cf-worker-quota-mitigation.md`](../compute/cf-worker-quota-mitigation.md)).

## Per-region routing

| Region / use case | Provider | Why |
|---|---|---|
| India (INR) | Razorpay Payment Page | UPI + cards + netbanking, local KYC |
| International (USD/EUR/GBP/ROW) | Paddle | Merchant-of-Record, handles VAT/sales-tax globally |
| Digital downloads (PDFs, zips) | Gumroad | Hosts the file delivery + license keys |
| Newsletter subscriptions | Substack | Subscription billing built-in |
| Android in-app purchases | Play Billing | Required by Play Store policy |

## Why this shape

- **No payment secrets on our infra.** No API keys, no webhook
  secrets, no card data, no PCI scope. Compromise blast radius = a
  click-tracking log table.
- **No card on file required.** All providers above are free to use;
  fees come off each transaction. Payouts hit the creator's bank
  account after the provider's own KYC.
- **No Firebase Functions needed** (see
  [`no-firebase-functions.md`](../general/no-firebase-functions.md)). The CF
  Worker proxy is the only server-side hop.
- **Click-tracking is real.** Knowing which referrer / blog post /
  channel drives checkouts is required for the
  [`revenue-channels-2026.md`](../general/revenue-channels-2026.md) attribution
  model. Without the Worker hop we lose that signal.

## Cross-refs

- [`no-card-on-file.md`](../../../rules/interaction/no-card-on-file.md) — the funding constraint
- [`no-firebase-functions.md`](../general/no-firebase-functions.md) — why CF Workers, not Functions
- [`cf-worker-quota-mitigation.md`](../compute/cf-worker-quota-mitigation.md) — Worker free-tier headroom math
- [`max-payment-methods.md`](../../monetisation/max-payment-methods.md) — full payment-provider catalog
