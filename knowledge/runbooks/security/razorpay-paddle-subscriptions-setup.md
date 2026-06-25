---
type: runbook
title: Set up Razorpay Subscriptions + Paddle Checkout (Pro Monthly/Yearly + Max Monthly/Yearly)
description: "Step-by-step guide to set up Razorpay Subscriptions (India INR rail)\
  \ and Paddle Checkout (rest-of-world USD rail) for the 4 oriz subscription tiers:\
  \ Pro Monthly \u20B999/$1.19, Pro Yearly \u20B9799/$9.59, Max Monthly \u20B9299/$3.59,\
  \ Max Yearly \u20B92499/$30. Both go through monthly+yearly only (no lifetime).\
  \ Razorpay: Sole-proprietor PAN-only KYC. Paddle: Vendor signup with W-8BEN."
tags:
- runbook
- setup
- razorpay
- paddle
- subscriptions
- billing
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- decisions/pricing/three-tier-free-pro-max
- decisions/architecture/security/payment-architecture-direct-links
- decisions/architecture/compute/billing-webhook-cf-pages-function
- rules/interaction/no-card-on-file
---



# Razorpay + Paddle setup runbook

## Razorpay Subscriptions (India INR)

### Step 1: Account signup (Sole proprietor PAN-only)

1. Go to <https://razorpay.com/payments/signup>
2. Sign up with email + phone (OTP verification)
3. Choose **Sole Proprietor** business type
4. KYC documents (have ready):
   - PAN card (yours)
   - Aadhaar (with phone-linked OTP)
   - Bank account (cancelled cheque OR bank statement)
   - Business proof: invoice/utility bill at your address (optional but speeds approval)
5. Approval typically 1–3 business days

### Step 2: Create Subscription Plans

Once approved, login to <https://dashboard.razorpay.com>:

1. Sidebar → **Subscriptions** → **Plans** → **+ Create Plan**

Create these 4 plans (one at a time):

| Plan | Interval | Amount | Plan name |
|---|---|---|---|
| **Pro Monthly** | Monthly | ₹99 | `oriz-pro-monthly` |
| **Pro Yearly** | Yearly | ₹799 | `oriz-pro-yearly` |
| **Max Monthly** | Monthly | ₹299 | `oriz-max-monthly` |
| **Max Yearly** | Yearly | ₹2,499 | `oriz-max-yearly` |

For each plan:
- Period: Monthly / Yearly (as appropriate)
- Interval: 1 (every 1 month / every 1 year)
- Amount: in paise (multiply rupees by 100 — ₹99 = 9900 paise)
- Trial period: 0 days
- Currency: INR

Capture each plan's **Plan ID** (looks like `plan_XXXXX`). Save in `c:/D/oriz/.env`:

```
RAZORPAY_PLAN_PRO_MONTHLY=plan_XXXXXXXXXXXX
RAZORPAY_PLAN_PRO_YEARLY=plan_XXXXXXXXXXXX
RAZORPAY_PLAN_MAX_MONTHLY=plan_XXXXXXXXXXXX
RAZORPAY_PLAN_MAX_YEARLY=plan_XXXXXXXXXXXX
```

### Step 3: Get API keys

1. Sidebar → **Account & Settings** → **API Keys** → **Generate Test Keys**
2. Capture `KEY_ID` and `KEY_SECRET`. Save in `.env`:

```
RAZORPAY_KEY_ID=rzp_test_XXXXXXX     # for testing; replace with live after going live
RAZORPAY_KEY_SECRET=XXXXXXXXXXXX
```

3. Same screen — generate **Webhook Secret** (used to verify webhook signatures). Save:

```
RAZORPAY_WEBHOOK_SECRET=XXXXXXXXXXXX
```

### Step 4: Configure webhook URL

1. Sidebar → **Account & Settings** → **Webhooks** → **+ Add new webhook**
2. URL: `https://oriz.in/api/billing-webhook/razorpay` (this is our CF Pages Function)
3. Subscribe to events:
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.cancelled`
   - `subscription.completed`
   - `subscription.expired`
   - `payment.failed`

### Step 5: Pricing page integration

On `/pricing` page (rendered by `@chirag127/astro-billing`):

```js
// On "Subscribe Pro Monthly" click:
const resp = await fetch('https://api.razorpay.com/v1/subscriptions', {
  method: 'POST',
  headers: {
    Authorization: 'Basic ' + btoa(`${KEY_ID}:${KEY_SECRET}`),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    plan_id: PLAN_PRO_MONTHLY,
    customer_notify: 1,
    total_count: 120, // = 10 years monthly (effectively indefinite until cancel)
    notes: { userId: firebaseUid, tier: 'pro', billing: 'monthly' },
  }),
});
const sub = await resp.json();
// Open Razorpay Checkout
const rzp = new Razorpay({
  key: KEY_ID,
  subscription_id: sub.id,
  name: 'Oriz',
  description: 'Pro Monthly Subscription',
  prefill: { email: user.email },
  handler: (response) => {
    // success — webhook will activate the sub in Firestore
  },
});
rzp.open();
```

Need to include `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>` on the pricing page.

### Step 6: Test mode → Live mode

1. Use **Test mode** API keys + a test card (4111 1111 1111 1111 / any future expiry / any CVV)
2. Confirm webhook fires, Firestore updates correctly
3. Once verified, switch to **Live mode** keys (same `dashboard.razorpay.com` → Mode toggle top-right)
4. Generate new Live API keys; update `.env`

---

## Paddle Checkout (Rest-of-World USD)

### Step 1: Vendor signup

1. Go to <https://paddle.com/signup>
2. Choose **Self-Service Plan** (free; takes 5% + $0.50 per transaction)
3. KYC required:
   - Company OR individual seller
   - For individual non-US seller: W-8BEN form (online, auto-generated)
   - Bank account in payout currency (USD/EUR/INR convertible)
   - Government ID
4. Approval: 5–7 business days

### Step 2: Create Catalog → Products

Once approved, login to <https://vendors.paddle.com>:

1. Sidebar → **Catalog** → **Products** → **+ New product**

Create 2 products:
- **Oriz Pro** (tax category: SaaS)
- **Oriz Max** (tax category: SaaS)

### Step 3: Create Prices per product

For **Oriz Pro**:
- Monthly: $1.19 USD / Monthly recurring
- Yearly: $9.59 USD / Yearly recurring

For **Oriz Max**:
- Monthly: $3.59 USD / Monthly recurring
- Yearly: $30 USD / Yearly recurring

Each Price has a **Price ID** (`pri_XXXXX`). Save in `.env`:

```
PADDLE_PRICE_PRO_MONTHLY=pri_XXXXX
PADDLE_PRICE_PRO_YEARLY=pri_XXXXX
PADDLE_PRICE_MAX_MONTHLY=pri_XXXXX
PADDLE_PRICE_MAX_YEARLY=pri_XXXXX
```

### Step 4: Get API + Webhook secret

1. Sidebar → **Developer Tools** → **Authentication** → **Generate API Key**
2. Save:

```
PADDLE_API_KEY=pdl_XXXXX
PADDLE_WEBHOOK_SECRET=pdl_XXXXX
```

### Step 5: Webhook URL

1. **Developer Tools** → **Notifications** → **+ New endpoint**
2. URL: `https://oriz.in/api/billing-webhook/paddle`
3. Subscribe to events:
   - `subscription.activated`
   - `subscription.updated`
   - `subscription.canceled`
   - `transaction.completed`
   - `transaction.payment_failed`

### Step 6: Hosted checkout URL per price

Each Price has a public Checkout URL like:

```
https://buy.paddle.com/<price_id>?customer_email=<email>&user_id=<firebase_uid>
```

Embed as button on pricing page:

```html
<a href="https://buy.paddle.com/pri_XXX?user_id={{firebaseUid}}" target="_blank">
  Subscribe Pro Monthly
</a>
```

Paddle handles VAT/tax globally; we just receive the payout.

### Step 7: Geo-routing on pricing page

`@chirag127/astro-billing` detects user country via Cloudflare's `cf-ipcountry` header:
- India → Razorpay buttons
- Rest of world → Paddle buttons

Single page; different buttons based on geo.

---

## Verification checklist

After completing both setups:

- [ ] Razorpay test subscription created via test card; webhook fires
- [ ] Firestore `users/{uid}/subscriptions/razorpay` doc updated correctly
- [ ] Paddle test checkout completed via Paddle test cards; webhook fires
- [ ] Firestore `users/{uid}/subscriptions/paddle` doc updated correctly
- [ ] Pricing page shows correct buttons based on `cf-ipcountry`
- [ ] App's `isPro` / `isMax` flags update live on Firestore listener

---

## Common pitfalls

- **Razorpay Subscriptions only accept Indian-issued cards reliably.** International cards via 3DS2 step-up; OK but lower conversion. For non-INR audience, route to Paddle.
- **Paddle KYC takes longer than Razorpay.** Expect ~1 week. Start signup early.
- **Test mode webhooks** in Razorpay need a public URL to hit. Use ngrok during local dev or deploy to a staging CF Pages first.
- **Free tier limits:** Razorpay has no monthly fee; takes 2% + GST per transaction (Indian cards). Paddle takes 5% + $0.50 per transaction.

## Cross-refs

- 3-tier pricing → [[decisions/pricing/three-tier-free-pro-max]]
- Payment architecture → [[decisions/architecture/payment-architecture-direct-links]]
- Billing webhook → [[decisions/architecture/billing-webhook-cf-pages-function]]
- No card on file (paying customers, not us) → [[rules/no-card-on-file]]
