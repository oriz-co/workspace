---
type: index
title: Security
description: Index of concepts in decisions/architecture/security.
tags:
- index
- security
timestamp: '2026-06-24'
format_version: okf-v0.1
status: active
---

# Security

## Concepts

- [Auth + Billing + Polish + Webhook locks (2026-06-22 evening grill)](./auth-billing-polish-locks-2026-06-22-evening.md) — Final locks across auth providers (Google + GitHub + Email-link + Phone OTP + Apple + Twitter), Razorpay TEST mode first, wrangler dev for local webhooks, all polish items required (mobile-responsive + dark+light toggle + PWA + SEO + OG), discount stack (FOUNDER50 + LAUNCH30 + BLOG20 + STUDENT50), mutual 15% referral, 7-day money-back, no trial, GitHub Student Pack verification.
- [data.oriz.in aggregator app + centralized auth.oriz.in + Phone-Auth Pro-tier-only](./data-hub-and-central-auth.md) — Locked 2026-06-22 evening. (1) New CF Pages app `oriz-data-aggregator-app` at `data.oriz.in` renders ECharts dashboards + JSON browser for all 14+ API repos (separate from per-API GH Pages). (2) `auth.oriz.in` is the central Firebase Auth domain; all apps redirect there for sign-in; redirect back after success. (3) Firebase Phone Auth is enabled but UI-gated to Pro tier (Phone SMS costs $0.05/SMS ~ ₹4/SMS — not free; rate-limit free users to 0/day, Pro to 5/day, Max unlimited). (4) Authentication ONLY in apps, never APIs (APIs serve pure JSON, no auth).
- [Monetization centralized on oriz.in only — apps redirect for paid upgrades](./monetization-centralized-on-oriz-in.md) — Locked 2026-06-23. Razorpay checkout lives ONLY on oriz.in/pricing. Every app subdomain that shows an Upgrade CTA redirects to oriz.in/pricing?app=<slug>&return=<url>. Single domain for payment gateway compliance + zero manual work setting up checkout per app. Sign-in is encouraged everywhere but only REQUIRED for: (a) Pro/Max-tier features, (b) stateful apps that save user data.
- [Payment architecture — direct platform links via CF Worker click-tracker](./payment-architecture-direct-links.md) — Definition: 'direct platform link' = a button on our site that redirects to a provider's hosted checkout (Razorpay Payment Page, Gumroad URL, Paddle checkout link, Substack subscribe URL). Provider hosts the checkout; we host the button. User picked a small CF Worker proxy that logs the click anonymously to CF Analytics Engine and then 302s to the platform URL — ~1 Worker call per checkout, 20x headroom on the 100K/day free envelope. Zero payment secrets on our infra (no API keys); all payouts go to the creator's bank account after the platform's own KYC. Per-region routing: Razorpay (INR) + Paddle (USD/EUR/GBP/ROW) + Gumroad (digital downloads) + Substack (newsletters) + Play Billing (in-app).
- [Razorpay donation button — pl_T4iEPIDcALKLPk, one-click flow](./razorpay-donation-button.md) — Razorpay-hosted donation button (button ID pl_T4iEPIDcALKLPk) mounted on every app's /sponsors route + oriz-cs-me-app footer. One-click: opens Razorpay-hosted donation page; user picks amount; payment received. Separate from subscription flow (donations are one-time, not recurring). Integrated as shared <SponsorButton /> in @chirag127/astro-billing.
