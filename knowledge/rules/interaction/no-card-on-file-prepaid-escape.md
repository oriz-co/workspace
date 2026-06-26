---
type: rule
title: "No card on file — one-time prepaid OK"
description: "The family-wide \"no card on file\" rule has one official escape hatch — one-time prepaid fees paid via prepaid PayPal balance. Currently used for Chrome Web Store ($5) and now Play Store ($25). No recurring subscriptions, ever."
tags: [feedback, no-card, distribution, monetisation]
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
---

User direction 2026-06-21: when asked whether the Play Store $25 one-time fee violates [`no-card-on-file`](./no-card-on-file.md), user picked "Pay $25 once, prepaid" not "skip the store entirely." Reaffirmed for Chrome Web Store $5 ("ALREADY a precedent").

**Why:** Distribution reach matters more than fee purity. The rule was "no recurring card billing" not "no money ever." Prepaid PayPal balance preserves the no-recurring-charges spirit.

**How to apply:**
- One-time prepaid fees are OK when distribution channel reach justifies them (Play Store, Chrome Web Store).
- Recurring fees stay banned (Apple Developer Program $99/yr, Stripe Atlas $500/yr, AWS account-on-file, etc.).
- Free tiers with credit card required for verification: still banned (Vercel, Render, Fly, etc.).
- When proposing a paid service in a question, default-recommend the "skip if recurring, prepaid if one-time" stance, not blanket rejection.

Knowledge: [`no-card-on-file`](./no-card-on-file.md), and the new [`pwabuilder-as-primary-converter`](../../decisions/architecture/frontend/pwabuilder-as-primary-converter.md) which uses both Play + Microsoft + CWS.

Related: [`pwabuilder-primary-converter`](../agent/preferences/pwabuilder-primary-converter.md), [`ios-pwa-only-no-mac`](./ios-pwa-only-no-mac.md).
