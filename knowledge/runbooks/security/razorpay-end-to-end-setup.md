---
type: runbook
title: "Razorpay end-to-end setup \u2014 TEST keys + 4 plans + 4 promos + webhook\
  \ + E2E test + LIVE"
description: 'Step-by-step checklist for wiring Razorpay subscriptions into the oriz
  family: generate TEST API keys, verify the 4 pre-created plans, add a webhook with
  the right event set, create 4 promo codes, integrate via @chirag127/astro-billing,
  test E2E with a test card + ngrok, and finally flip to LIVE. Plain English, checklist
  style; assumes signup is already done.'
tags:
- runbook
- billing
- razorpay
- subscriptions
- webhook
- env
- secrets
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
---



# Razorpay end-to-end setup

This runbook walks Chirag through every remaining Razorpay step after
initial signup. The Sole-Proprietor (PAN-only) account is already
created, KYC is in progress / done, and the **4 subscription plans
have already been created** — their IDs are already in
`c:/D/oriz/.env`. What's left is API keys, a webhook, 4 promo codes,
integration in `@chirag127/astro-billing`, and an end-to-end test
with the test card before flipping to LIVE.

**Plain English, checkbox style. Do these in order.**

---

## 0. Quick bootstrap (recommended)

Run `node scripts/razorpay-bootstrap.mjs` once. It does all of
sections 2-5 automatically: creates the 4 plans, the 4 offers, the
webhook (with the 9-event set), and 4 subscription links — all
idempotent (safe to re-run; skips what already exists, updates what
changed).

```bash
cd c:/D/oriz
node scripts/razorpay-bootstrap.mjs           # live, idempotent
node scripts/razorpay-bootstrap.mjs --dry     # preview, no writes
node scripts/razorpay-bootstrap.mjs --verbose # log every API call
```

After it succeeds, captured IDs / URLs are written back into `.env`
(`RAZORPAY_PLAN_*`, `RAZORPAY_OFFER_*`, `RAZORPAY_LINK_*`). The
script also tries to re-encrypt `.env.enc` via `sops`; if sops isn't
on PATH it prints the one-liner to run manually.

**Known limitation — Offers API**: the public `POST /v1/offers`
endpoint requires the Magic Checkout / Promotions add-on enabled by
Razorpay support. If it returns 404, the script prints a clear
fallback (create the 4 offers manually in Dashboard → Promotions →
Offers; re-run the script to pick them up — it matches by
`notes.oriz_offer_id` or by `name === CODE`). Bootstrap continues
through the remaining steps either way.

After running the script, you can **skip to section 7 (E2E test)**.
Sections 2-5 below are kept for reference / manual fallback.

---

## 1. Generate TEST mode API keys

- [ ] Login to [dashboard.razorpay.com](https://dashboard.razorpay.com)
- [ ] Top-right **Mode** toggle → switch to **TEST**
- [ ] Left nav: **Account & Settings** → **Website and app settings** → **API Keys**
- [ ] Click **"Generate Test Keys"** (or "Regenerate" if one already exists)
- [ ] Copy:
  - **KEY_ID** — starts with `rzp_test_`
  - **KEY_SECRET** — long random string (only shown once — copy now)
- [ ] Paste into `c:/D/oriz/.env`:
  ```dotenv
  RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
  RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
  ```
- [ ] Re-encrypt and push (one-liner):
  ```bash
  cd c:/D/oriz \
    && sops --encrypt --input-type dotenv --output-type dotenv .env > .env.enc \
    && git add .env.enc \
    && git commit -m "chore(secrets): add Razorpay test keys" \
    && git push
  ```
- [ ] The push triggers the sync workflow → 23+ keys propagate to all
  42 repos via the org-level secret sync. No manual per-repo step.

> Why TEST first: a wrong webhook URL or signature-verification bug
> in LIVE means real card auths fail. TEST mode has zero risk and
> uses the same code path.

---

## 2. Verify the 4 plans

The plans are **already created**. Verify each is present and
correct before wiring buttons.

- [ ] Dashboard → **Subscriptions** → **Plans**
- [ ] Confirm all 4 are listed:

| Plan | Interval | Amount (INR) | Amount (paise) | Plan ID |
|---|---|---|---|---|
| Pro Monthly | Monthly | ₹99 | 9900 | `plan_T4amiZh5BGgR5g` |
| Pro Yearly | Yearly | ₹799 | 79900 | `plan_T4anE3HWceQDua` |
| Max Monthly | Monthly | ₹299 | 29900 | `plan_T4aoFpRlVnSh4s` |
| Max Yearly | Yearly | ₹2,499 | 249900 | `plan_T4and1y3RYyO64` |

- [ ] Click each plan → verify the **interval** (monthly vs yearly)
  and the **amount in paise** (₹99 = 9900, not 99).
- [ ] If any plan is missing or wrong, recreate it per step 2 of
  [`razorpay-paddle-subscriptions-setup.md`](./razorpay-paddle-subscriptions-setup.md)
  and **update the env var** with the new plan ID.

---

## 3. Generate Test Webhook secret

- [ ] Dashboard → **Account & Settings** → **Webhooks**
- [ ] Click **"+ Add new webhook"**
- [ ] **Webhook URL:** `https://oriz.in/api/billing-webhook/razorpay`
  - (For local testing you'll temporarily swap this for an ngrok URL
    — see section 7. Razorpay only allows one URL per webhook entry
    in TEST mode, so it's fine to point this at ngrok during dev.)
- [ ] **Alert Email:** your email (Razorpay emails you on webhook
  failures)
- [ ] **Active:** ON
- [ ] **Events to subscribe** — check all 9:
  - [ ] `subscription.activated`
  - [ ] `subscription.charged`
  - [ ] `subscription.cancelled`
  - [ ] `subscription.completed`
  - [ ] `subscription.expired`
  - [ ] `subscription.halted`
  - [ ] `subscription.pending`
  - [ ] `subscription.updated`
  - [ ] `payment.failed`
- [ ] **Webhook Secret** — Razorpay shows a field to enter your own
  secret. Generate one locally and paste it in:
  ```bash
  openssl rand -hex 32
  ```
  (Or let Razorpay auto-generate, then copy what it shows.)
- [ ] Click **Create Webhook**
- [ ] Paste secret into `c:/D/oriz/.env`:
  ```dotenv
  RAZORPAY_WEBHOOK_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  ```
- [ ] Re-encrypt + commit + push (same one-liner as step 1).

> Why these 9 events: covers the full subscription lifecycle —
> activation, every successful recurring charge, cancel paths,
> halts (auto-debit failure), and one-off `payment.failed` for
> first-time payment failures that don't yet have a subscription
> entity. We don't subscribe to invoice-level events because
> Razorpay's subscription events already carry the invoice context.

---

## 4. Create 4 promo codes

- [ ] Dashboard → **Subscriptions** → **Offers** (or **Coupons** —
  Razorpay renamed this; either works).
- [ ] Click **"+ Create new offer"** four times — once per row below.

| Code | Type | Discount | Plans | Cap | Expiry | Use case |
|---|---|---|---|---|---|---|
| `FOUNDER50` | Percent | 50% off first month | All 4 plans | 100 redemptions total | None (run until cap hit) | Launch promo for early supporters |
| `LAUNCH30` | Percent | 30% off | Pro Yearly + Max Yearly only | Unlimited | 2026-07-31 23:59 IST | Push yearly upgrades in launch month |
| `BLOG20` | Percent | 20% off | All 4 plans | Unlimited | None | Generic blog / social media code |
| `STUDENT50` | Percent | 50% off | Pro Monthly + Pro Yearly only | Unlimited | None | Verified via GitHub Student Pack at checkout |

For each offer:
- [ ] **Code**: exactly as listed (uppercase, no spaces)
- [ ] **Discount type**: Percentage
- [ ] **Discount value**: as listed
- [ ] **Applicable plans**: select only the plans listed
- [ ] **Max redemptions** (or "Total usage limit"): set per row
- [ ] **Validity / Expiry**: per row
- [ ] **First charge only?** — `FOUNDER50` = YES; rest = NO
- [ ] Save → copy the resulting **Offer ID** (Razorpay returns one).

Optional: capture all 4 offer IDs in `.env` if the integration
needs to reference them programmatically:

```dotenv
RAZORPAY_OFFER_FOUNDER50=offer_XXXXXXXXXXXX
RAZORPAY_OFFER_LAUNCH30=offer_XXXXXXXXXXXX
RAZORPAY_OFFER_BLOG20=offer_XXXXXXXXXXXX
RAZORPAY_OFFER_STUDENT50=offer_XXXXXXXXXXXX
```

(If `astro-billing` lets the user type the code at checkout and
Razorpay validates it server-side, the offer IDs aren't strictly
needed — but having them in env makes promo analytics easier.)

---

## 5. Implement in `@chirag127/astro-billing`

Library code lives at:
`c:/D/oriz/repos/oriz/own/lib/npm/astro-billing-npm-pkg/src/`

This runbook **doesn't write the code** — that's a separate task.
The expected file layout is:

| File | Purpose |
|---|---|
| `src/lib/razorpay-client.ts` | Thin wrapper over the Razorpay Node SDK; reads `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` from env; exposes `createSubscription({ planId, customerId, offerId? })` |
| `src/components/Pricing.astro` | Renders the 3-tier table (Free / Pro / Max) with monthly/yearly toggle and 4 Checkout buttons |
| `src/components/CheckoutButton.astro` | Single button bound to a plan ID; on click → calls `/api/billing-create-subscription` → opens Razorpay Checkout JS modal |
| `src/pages/api/billing-create-subscription.ts` | CF Pages Function: POST `{ planId, userId, offerId? }` → calls Razorpay → returns `{ subscription_id }` |
| `src/pages/api/billing-webhook/razorpay.ts` | CF Pages Function: receives Razorpay POST, verifies HMAC, updates Firestore (see section 6) |

**Button flow (end-user perspective):**

1. User on `/pricing` clicks **"Subscribe Pro Monthly"**.
2. Frontend POSTs to `/api/billing-create-subscription` with
   `{ planId: 'plan_T4amiZh5BGgR5g', userId: <firebase uid> }`.
3. The function calls Razorpay's `subscriptions.create()` API and
   returns the resulting `subscription_id`.
4. Frontend opens **Razorpay Checkout JS modal** with that
   `subscription_id` and the user's prefilled email/name.
5. User enters card → Razorpay handles 3DS OTP.
6. On success, Razorpay closes the modal and triggers the **webhook**.
7. Webhook handler verifies signature, looks up the user, writes
   `users/{uid}/subscriptions/razorpay` in Firestore:
   ```json
   { "tier": "pro", "interval": "monthly", "status": "active",
     "subscription_id": "sub_…", "plan_id": "plan_…",
     "current_period_end": 1750000000 }
   ```
8. The frontend's Firestore listener on that doc fires → React/Astro
   re-renders → ads disappear, Pro features unlock.

---

## 6. Webhook handler — sketch

`c:/D/oriz/repos/oriz/own/lib/npm/astro-billing-npm-pkg/src/pages/api/billing-webhook/razorpay.ts`

```ts
import type { APIRoute } from 'astro';
import { createHmac } from 'node:crypto';
// import { getFirestore } from 'firebase-admin/firestore';

export const POST: APIRoute = async ({ request }) => {
  // 1. Read RAW body (signature is computed over the raw bytes)
  const body = await request.text();
  const signature = request.headers.get('x-razorpay-signature') ?? '';

  // 2. Verify HMAC SHA256
  const expected = createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  if (signature !== expected) {
    return new Response('Invalid signature', { status: 401 });
  }

  // 3. Parse and route
  const event = JSON.parse(body);
  const sub = event.payload?.subscription?.entity;
  const payment = event.payload?.payment?.entity;

  // 4. Map event → Firestore update
  // event.event ∈ { subscription.activated | subscription.charged |
  //                 subscription.cancelled | … | payment.failed }
  // sub.id            → subscriptionId
  // sub.customer_id   → look up our userId via users-by-razorpay-customer
  // sub.plan_id       → which tier (lookup PLAN_ID_TO_TIER map)
  // sub.current_end   → unix seconds when current period ends
  //
  // Write: users/{uid}/subscriptions/razorpay
  //   { tier, interval, status, subscription_id, plan_id,
  //     current_period_end, updated_at: serverTimestamp() }

  return new Response('OK', { status: 200 });
};
```

**Things this sketch deliberately leaves out** (future task):
- The PLAN_ID → tier/interval lookup table (hardcode or env-driven).
- The Razorpay-customer → Firebase-uid mapping (one Firestore
  collection: `razorpay_customers/{customerId}` → `{ uid }`).
- Idempotency (event re-delivery): keep a `processed_events/{eventId}`
  doc and short-circuit if already present.
- Email-on-failure (subscription.halted → grace-period email).

---

## 7. Test E2E with the Razorpay test card

**Test cards** (all on TEST mode):

| Card | Number | CVV | Expiry | 3DS OTP |
|---|---|---|---|---|
| Domestic success | `4111 1111 1111 1111` | any 3 digits | any future date | `123456` |
| Domestic failure | `5104 0600 0000 0008` | any | any future | n/a (declines at auth) |
| International success | `5267 3181 8797 5449` | any | any future | `123456` |

Full list: [razorpay.com/docs/payments/payments/test-card-details](https://razorpay.com/docs/payments/payments/test-card-details).

**Local E2E flow:**

- [ ] Start the dev server in any app that mounts `<Pricing />`
  (e.g. home-app):
  ```bash
  cd c:/D/oriz/repos/oriz/own/prod/apps/hub/home-app && pnpm dev
  ```
  Default Astro port is `4321`.

- [ ] Start ngrok in another terminal:
  ```bash
  ngrok http 4321
  ```
  Copy the `https://abc123.ngrok.io` URL.

- [ ] **Temporarily** update the Razorpay webhook URL to the ngrok
  URL: Dashboard → Webhooks → edit the one from step 3 →
  `https://abc123.ngrok.io/api/billing-webhook/razorpay` → Save.

- [ ] Visit `http://localhost:4321/pricing`.

- [ ] Click **"Subscribe Pro Monthly"**.

- [ ] Razorpay Checkout modal opens.

- [ ] Enter test card `4111 1111 1111 1111`, any future expiry,
  any CVV.

- [ ] On the 3DS step, enter OTP `123456`.

- [ ] Modal closes → "Payment successful" toast.

- [ ] **Verify on Razorpay dashboard:**
  - [ ] Subscriptions → see a new subscription with status `active`
  - [ ] Payments → see a successful payment of ₹99
  - [ ] Webhooks → "Recent deliveries" tab → see the
    `subscription.activated` and `subscription.charged` events,
    both returning **200 OK** to your ngrok URL.

- [ ] **Verify Firestore:**
  - [ ] `users/{uid}/subscriptions/razorpay` →
    `{ tier: 'pro', status: 'active', interval: 'monthly', … }`.

- [ ] **Verify app:**
  - [ ] Refresh `localhost:4321` → ads gone, "Pro" badge in header.

- [ ] **Restore webhook URL** in Razorpay back to
  `https://oriz.in/api/billing-webhook/razorpay` before closing.

**Debug guide if any step fails:**

| Symptom | Likely cause | Fix |
|---|---|---|
| Modal never opens | Frontend JS error in browser console | Check `/api/billing-create-subscription` returned 200 with a `subscription_id` |
| 401 on webhook | Signature mismatch | Ensure handler uses **raw request body**, not `JSON.stringify(parsed)`. Check `RAZORPAY_WEBHOOK_SECRET` matches what's saved in dashboard |
| Webhook never fires | ngrok URL not saved in dashboard, or webhook disabled | Dashboard → Webhooks → Active toggle |
| Webhook fires, returns 500 | Firebase Admin not initialized in CF Pages Function | Service-account JSON env var present? CF Pages secret bound correctly? |
| Subscription active in Razorpay but Firestore doc empty | Customer-ID → UID mapping missing | Pre-create the `razorpay_customers/{customer_id}` doc during `createSubscription` |
| Firestore updates but UI doesn't | Listener on subscription doc not wired | Add `onSnapshot(users/{uid}/subscriptions/razorpay)` in the header component |

---

## 8. Go LIVE

Once **TEST mode has run E2E successfully for at least 1 week** with
multiple test transactions:

- [ ] Razorpay account is **KYC-approved** (check
  Dashboard → Home banner; mandatory before LIVE keys work).
- [ ] Top-right Mode toggle → switch to **LIVE**.
- [ ] Account & Settings → API Keys → **"Generate Live Keys"**.
- [ ] **The 4 plan IDs from TEST mode do NOT carry over** — Razorpay
  treats TEST and LIVE as separate ledgers. Re-create the 4 plans
  in LIVE mode (same names + amounts) and capture the new plan IDs:
  ```dotenv
  RAZORPAY_PLAN_PRO_MONTHLY=plan_LIVE_xxxxxxx
  RAZORPAY_PLAN_PRO_YEARLY=plan_LIVE_xxxxxxx
  RAZORPAY_PLAN_MAX_MONTHLY=plan_LIVE_xxxxxxx
  RAZORPAY_PLAN_MAX_YEARLY=plan_LIVE_xxxxxxx
  ```
- [ ] Re-create the **4 promo codes** in LIVE mode too (same codes,
  same rules).
- [ ] Re-create the **webhook** in LIVE mode:
  - URL: `https://oriz.in/api/billing-webhook/razorpay` (no ngrok)
  - Same 9 events
  - New `RAZORPAY_WEBHOOK_SECRET` (will differ from TEST one)
- [ ] Replace in `c:/D/oriz/.env`:
  ```dotenv
  RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXX
  RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXX
  RAZORPAY_WEBHOOK_SECRET=XXXXXXXXXXXXXXXXXXX
  ```
- [ ] Re-encrypt + commit + push (sync workflow propagates).
- [ ] **Smoke test with a real ₹1 throwaway plan first** (create a
  ₹1 plan, subscribe yourself, verify webhook + Firestore, then
  cancel + delete the plan). This catches real-card edge cases
  TEST mode misses (issuer 3DS variants, RBI tokenisation prompts).
- [ ] Only after the ₹1 test succeeds: enable the real ₹99 / ₹299
  / etc. pricing on the production `/pricing` page.

---

## 9. Common pitfalls

- **Razorpay fee + GST ≈ 2.36% effective** on every charge (2%
  base + 18% GST on the fee). Factor into pricing math — ₹99 nets
  you ~₹96.66.
- **Indian-issued cards work out of the box.** International cards
  go through 3DS2 step-up and have higher decline rates. For a
  non-INR audience, route to Paddle instead — see
  [`razorpay-paddle-subscriptions-setup.md`](./razorpay-paddle-subscriptions-setup.md).
- **RBI subscription mandate cap**: recurring auto-debit on Indian
  cards is capped at ₹15,000 per transaction without additional
  factor authentication. All 4 plans are well under this.
- **Auto-debit failures** trigger `subscription.halted` — send a
  polite "update your card" email + give a 5-day grace before
  cancelling (Razorpay retries automatically during the grace).
- **Subscription pause/resume** is supported via API but **not in
  the dashboard UI** as of 2026. If you need it for v1, expose it
  in `astro-billing` directly via the SDK.
- **Refunds** are processed manually: Dashboard → Payments →
  click payment → **Refund** button. Partial refunds supported.
- **GST invoicing**: as a Sole Prop without GSTIN, you can't issue
  GST invoices — only plain receipts. Add a GSTIN later (₹0 to
  register, optional below ₹20L/yr turnover) to issue GST invoices
  that B2B customers can claim ITC against.
- **Test mode webhook deliveries are kept for 30 days** in the
  dashboard — handy for retroactive debugging. LIVE mode keeps 90
  days.
- **Idempotency**: webhook events can be redelivered. Always
  short-circuit on a duplicate `event.id` (see section 6 note).

---

## 10. Quick reference — TEST plan IDs

| Plan | INR | Plan ID (TEST) | Env var |
|---|---|---|---|
| Pro Monthly | ₹99 | `plan_T4amiZh5BGgR5g` | `RAZORPAY_PLAN_PRO_MONTHLY` |
| Pro Yearly | ₹799 | `plan_T4anE3HWceQDua` | `RAZORPAY_PLAN_PRO_YEARLY` |
| Max Monthly | ₹299 | `plan_T4aoFpRlVnSh4s` | `RAZORPAY_PLAN_MAX_MONTHLY` |
| Max Yearly | ₹2,499 | `plan_T4and1y3RYyO64` | `RAZORPAY_PLAN_MAX_YEARLY` |

LIVE plan IDs will replace these after step 8.

---

## Cross-refs

- 3-tier pricing decision → [`../decisions/pricing/three-tier-free-pro-max.md`](../../decisions/pricing/three-tier-free-pro-max.md)
- Billing webhook architecture → [`../decisions/architecture/billing-webhook-cf-pages-function.md`](../../decisions/architecture/compute/billing-webhook-cf-pages-function.md)
- Earlier setup runbook (covers both Razorpay + Paddle) → [`./razorpay-paddle-subscriptions-setup.md`](./razorpay-paddle-subscriptions-setup.md)
- Env management → [`./env-management.md`](../operations/env-management.md)
- Secrets policy → [`../policy/secrets-handling.md`](../../policy/secrets-handling.md)
- Rotation runbook (for if a key leaks) → [`./rotate-leaked-secret.md`](./rotate-leaked-secret.md)
