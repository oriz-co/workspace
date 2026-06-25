---
type: decision
title: "Razorpay donation button \u2014 pl_T4iEPIDcALKLPk, one-click flow"
description: 'Razorpay-hosted donation button (button ID pl_T4iEPIDcALKLPk) mounted
  on every app''s /sponsors route + oriz-cs-me-app footer. One-click: opens Razorpay-hosted
  donation page; user picks amount; payment received. Separate from subscription flow
  (donations are one-time, not recurring). Integrated as shared <SponsorButton />
  in @chirag127/astro-billing.'
tags:
- decision
- razorpay
- donation
- sponsor
- billing
- button
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- decisions/architecture/subscription-flow
- decisions/monetisation/max-payment-methods
- architecture/packages/the-23-packages
- runbooks/security/razorpay-end-to-end-setup
---



# Razorpay donation button

## Decision

Mount a Razorpay-hosted donation button (button ID `pl_T4iEPIDcALKLPk`)
across the family as a one-click donation primitive. Separate from the
subscription flow — donations are **one-time**, not recurring.

## Button ID

```
pl_T4iEPIDcALKLPk
```

This is the Razorpay payment-button ID provisioned in the Razorpay
dashboard. The button script + form HTML embeds this ID and Razorpay
handles the hosted donation page.

## Mount points

| Surface | Where |
|---|---|
| Every app | `/sponsors` route (universal — every app exposes this) |
| `oriz-cs-me-app` | Footer (personal lifestream gets a permanent footer mount) |
| `chirag127.github.io` profile README | Embedded as a link to `oriz.in/sponsors` |

## Flow

1. User clicks the button
2. Razorpay-hosted donation page opens (no redirect to oriz.in needed)
3. User picks amount (Razorpay UI handles tier picker / custom amount)
4. Payment completes on Razorpay's side
5. Webhook fires to our `razorpay-webhook-worker` for analytics + receipt

## Implementation — shared component

Lives in `@chirag127/astro-billing` package as `SponsorButton.astro`:

```astro
---
// @chirag127/astro-billing/SponsorButton.astro
const BUTTON_ID = 'pl_T4iEPIDcALKLPk';
---
<form>
  <script
    src="https://checkout.razorpay.com/v1/payment-button.js"
    data-payment_button_id={BUTTON_ID}
    async
  ></script>
</form>
```

Consumers import + drop:

```astro
---
import { SponsorButton } from '@chirag127/astro-billing';
---
<SponsorButton />
```

## Why separate from subscription flow

- **One-time vs recurring** — donations are gift-shaped, subs are
  service-shaped. Different mental model + different Razorpay product
  IDs.
- **No paywall lift** — donating doesn't unlock features. Subscription
  does ([[decisions/architecture/subscription-flow]]).
- **Independent abuse surface** — donation fraud (chargebacks) has
  different mitigation than subscription fraud (card-testing).

## Geo

Razorpay = India-only. International donations route via the donation
rails in [[decisions/monetisation/max-payment-methods]] (Ko-fi /
Buy Me a Coffee / GitHub Sponsors / PayPal.me).

`<SponsorButton />` accepts a `geo` prop and renders the right rail:

```astro
<SponsorButton geo="IN" /> {/* Razorpay button */}
<SponsorButton geo="US" /> {/* Ko-fi embed */}
```

Geo auto-detected via CF `cf-ipcountry` header by default.

## Cross-refs

- [[decisions/architecture/subscription-flow]] — the recurring billing path
- [[decisions/monetisation/max-payment-methods]] — the full international rail
- [[architecture/the-23-packages]] — `astro-billing` is package #7
- [[runbooks/razorpay-end-to-end-setup]] — Razorpay account setup + key management
