---
type: rule
title: "No card-on-file with any pay-as-you-go provider"
description: "Cloudflare Free / Firebase Spark / GitHub Free only. Never put a credit card on file with any pay-as-you-go cloud provider, even at zero usage."
tags: [rules, billing, security, free-tier]
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
  - rules/never-hit-quotas
  - rules/no-subscriptions
  - architecture/layer-3-auth-firebase-spark
  - services/auth/firebase-spark
---

# No card-on-file with any pay-as-you-go provider

Never add a credit card or any pay-as-you-go billing method to any
cloud account in the family — even when current usage is zero, even
"just to enable a feature", even "just for headroom".

## Why

This is the asymmetry rule:

- **Failure mode of "card not on file":** service stops at quota. Acceptable.
- **Failure mode of "card on file":** card gets charged thousands. Unacceptable.

Documented 5-figure bill-shock incidents in 2025-2026:

- simmer.io ~$98K (Firebase Blaze runaway)
- Tamara ~$70K (Firestore read loop)
- €54K Gemini API key leak

Cloud Spend Caps from Cloud Next '26 are private preview AND don't
cover Firestore / Storage / Hosting. The only real defense is "no card
on file at all". A card on file means a single bug, leaked key, or
abuse pattern can become a four-to-five-figure bill before any human
notices.

## What this means concretely

- **Firebase: Spark plan only, NEVER Blaze.** Even to enable a single
  Cloud Function. The cost of "just upgrading temporarily" is the same
  as the cost of an attacker discovering it.
- **Cloudflare: Free plan only.** No Workers Paid, no Pages Functions
  paid tier, no R2 paid storage.
- **GitHub: Free plan only** for personal repos. (Education / Pro
  features that don't bill are fine.)
- **Domain registrar (Cloudflare Registrar) is the one card exception** —
  it's at-cost, no overages possible, and renewal is opt-in.

## Exceptions

The Cloudflare Registrar exception above. Plus one narrow user-approved compute exception:

- **AWS Lambda** as the 4th-rail fallback in the serverless chain. AWS account creation requires a card for identity verification, charged $0 if you stay in the forever-free 1M req/mo + 400K GB-sec quota. Lambda ONLY — no S3, EC2, RDS, DynamoDB, CloudFront, or any other AWS service. Full rule + hardening: [`aws-lambda-exception.md`](./aws-lambda-exception.md). Locked 2026-06-22 evening.

No others.

## One-time fees exception

The rule covers **recurring** card-on-file billing (monthly, quarterly,
yearly subscriptions, pay-as-you-go with stored payment method).
**One-time fees** are allowed when:

- Payment is single-charge with no stored payment method retained
- Cost < $100 USD lifetime
- Charge is for a one-time enrollment / signing / publishing fee
  (not ongoing consumption)
- Decision logged in this file's "One-time fees paid" table below

### One-time fees paid

| Fee | Cost | Why | Card kept on file? |
|---|---|---|---|
| Google Play Developer enrollment | $25 USD | Publish family `-app` + `-game` + `-kids-game` repos to Play Store alongside F-Droid + direct download. | No — card removed immediately after charge cleared. |

### One-time fees approved (not yet paid)

| Fee | Cost | Why |
|---|---|---|
| (none pending — Play Store paid above) | — | — |

The card is REMOVED from the payment method on file immediately after
each one-time charge clears. Never leave a card stored anywhere.

## See also

- [`no-subscriptions.md`](./no-subscriptions.md) — the stricter cousin
- [`never-hit-quotas.md`](./never-hit-quotas.md) — paired rule
- AGENTS.md "five non-negotiable rules" §2
