---
type: decision
title: Auth + Billing + Polish + Webhook locks (2026-06-22 evening grill)
description: Final locks across auth providers (Google + GitHub + Email-link + Phone
  OTP + Apple + Twitter), Razorpay TEST mode first, wrangler dev for local webhooks,
  all polish items required (mobile-responsive + dark+light toggle + PWA + SEO + OG),
  discount stack (FOUNDER50 + LAUNCH30 + BLOG20 + STUDENT50), mutual 15% referral,
  7-day money-back, no trial, GitHub Student Pack verification.
tags:
- decision
- auth
- billing
- polish
- webhook
- promo
- referral
- refund
- v0-launch
timestamp: 2026-06-22
format_version: okf-v0.1
status: superseded
superseded_by: decisions/architecture/monetisation/donations-only-2026-06-25.md
related:
- decisions/architecture/monetisation/donations-only-2026-06-25
- decisions/architecture/security/auth-firebase-login-account-2026-06-25
- decisions/pricing/three-tier-free-pro-max
- decisions/architecture/compute/billing-webhook-cf-pages-function
- decisions/architecture/stack/stack-picks-2026-06-22
- runbooks/security/razorpay-paddle-subscriptions-setup
- rules/interaction/no-card-on-file
---

> **Superseded 2026-06-25** — split into [donations-only-2026-06-25](../monetisation/donations-only-2026-06-25.md) (billing/monetisation half) and [auth-firebase-login-account-2026-06-25](./auth-firebase-login-account-2026-06-25.md) (auth half). Reasoning preserved below for audit.

# Auth + Billing + Polish locks 2026-06-22 evening

## Firebase Auth providers (enable all)

| Provider | Use case | Friction |
|---|---|---|
| **Google OAuth** | Universal default; most-likely user already signed in | Low |
| **GitHub OAuth** | Developer audience; needed for Student Pack verification | Low |
| **Email magic-link** | No password; works for everyone | Medium (email check needed) |
| **Phone OTP** | India audience prefers phone | Medium (OTP delivery) |
| **Apple Sign-in** | Future App Store compliance + privacy-conscious users | Medium |
| **Twitter/X OAuth** | Social-savvy audience; reduces friction for blog cross-post engagement | Low |

User mandate: "what else can be there have it" — enable maximum signin paths. Each provider is a checkbox in Firebase Console; zero per-provider engineering.

## Razorpay TEST mode first

- API key generated as `rzp_test_*` (no real money even if leaked).
- Test card: `4111 1111 1111 1111` / any future expiry / any CVV / OTP `123456`.
- Full flow tested in test mode: subscription create → checkout → webhook → Firestore update.
- Switch to LIVE keys only after end-to-end test passes.

## Webhook local testing: wrangler dev

- `wrangler dev` emulates CF Pages Functions locally including the billing webhook endpoint.
- Use ngrok tunnel for Razorpay sandbox to reach localhost: `ngrok http 8788` (default wrangler port).
- Razorpay dashboard → webhook URL → ngrok URL → wrangler dev → Firestore (test project) writes verified locally.
- Once verified, switch webhook URL to `https://oriz.in/api/billing-webhook/razorpay` (production CF Pages).

## V0 polish: ALL items required

- **Mobile-first responsive** (320 / 768 / 1024 / 1440 breakpoints tested per page)
- **Dark + light theme toggle** (header chip; localStorage + Firestore sync for Pro+)
- **PWA manifest + service worker** per app (via `@chirag127/astro-pwa`)
- **SEO + OG image generator** per page (via `@chirag127/oriz-seo` + satori)
- **Lighthouse perf ≥85** + **a11y ≥95** (Pa11y CI + Lighthouse CI gates)
- **JSON-LD structured data** per page-type (per `seo-a11y-cdn-ssl` decision)
- **Klaro consent banner** (EU/UK/India DPDP/US GPC)
- **All 4 navigation surfaces** (Header per-app, Footer mega-sitemap, Sidebar content per-app, BottomBar actions per-app)

## Promo codes (all 4 active at launch)

| Code | Discount | Scope | Cap |
|---|---|---|---|
| `FOUNDER50` | 50% off first month | Pro + Max | 100 redemptions |
| `LAUNCH30` | 30% off yearly | Pro + Max yearly | Launch month only |
| `BLOG20` | 20% off | Any tier | Embedded in blog posts; unlimited |
| `STUDENT50` | 50% off | Pro tier only | Requires GitHub Student Pack verification |

Created in Razorpay dashboard → **Subscriptions → Coupons**. Each gets a coupon ID stored in our pricing-page config.

## Referral program: mutual 15%

- Every authenticated user gets a referral URL: `https://oriz.in/?ref=<user-handle>`
- Referee gets **15% off first month** when signing up via referral URL
- Referrer gets **15% off next month's billing** once referee completes first payment
- Tracked in Firestore: `users/{uid}/referrals/{referee_uid}` with timestamps
- No KYC needed; discount-only (no cash payouts)
- Caps: max 10 successful referrals per user per year (anti-abuse)

## Refund: 7-day money-back

- 7-day no-questions-asked refund policy on all paid tiers
- Refund processed via Razorpay/Paddle dashboard (manual click; ~2 min per refund)
- Auto-cancel subscription on refund issue
- Linked from `/pricing` + `/legal/refunds` page

## No trial period

- Pro / Max requires paid signup immediately
- Free tier IS the trial (offers ad-supported access to all 26 apps)
- Razorpay Subscriptions plans set `trial_period: 0`

## Student verification: GitHub Student Pack

- User signs in with GitHub OAuth (already enabled)
- We call GitHub API `GET /user/student` or check Student Developer Pack endpoint
- If verified student, `STUDENT50` coupon auto-applied at checkout
- Zero manual review; fully automated
- Fallback: if user has no GitHub or isn't on Student Pack, no discount (no `.edu` manual path; too much manual work per latest grill)

## Home page redesign (per Q-HOME-* grill)

- **Mutually exclusive themes** — dark + light cannot mix on one page; whole page is one or the other
- Auto-detect from inner-page theme on first visit
- Big dark hero (theme-locked dark)
- Animated wordmark via Motion One
- Featured-content carousel (latest blog post + latest book + latest package)
- Live stats counter (CSS only; no ECharts overhead)

## Cross-refs

- 3-tier pricing → [[decisions/pricing/three-tier-free-pro-max]]
- Billing webhook → [[decisions/architecture/billing-webhook-cf-pages-function]]
- Stack picks → [[decisions/architecture/stack-picks-2026-06-22]]
- Razorpay/Paddle setup runbook → [[runbooks/razorpay-paddle-subscriptions-setup]]
- No card on file → [[rules/no-card-on-file]]
