---
type: architecture
title: "Layer 3 \u2014 auth on Firebase Spark forever"
description: One Firebase project (oriz-app) on the Spark plan, never Blaze. Custom
  auth domain auth.oriz.in shared by every site and every extension.
tags:
- architecture
- auth
- firebase
- spark
- layer-3
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- architecture/security/cross-site-auth-via-auth-oriz-in
- architecture/general/layer-4-database-by-shape
- rules/interaction/never-hit-quotas
- rules/interaction/no-card-on-file
- services/auth/firebase-spark
- decisions/content/100-year-strategy-locked
---



# Layer 3 — auth on Firebase Spark forever

## Concept

The family runs ONE Firebase project (`oriz-app`) on the Spark plan,
forever. Never Blaze. Spark's failure mode is "service stops at quota"
— the only failure mode without a financial ceiling. Custom auth
domain `auth.oriz.in` lets the same Firebase user sign in across every
`*.oriz.in` site and every extension.

## How it works

- Single Firebase project: `oriz-app`
- Custom auth domain: `auth.oriz.in` (so OAuth redirects don't leak
  the firebaseapp.com URL to recruiters)
- Auth providers: Google (primary), GitHub, Email link (passwordless),
  Anonymous (guest), Email/password only when a feature requires it
- Spark caps we never hit: 50K MAU, 50K Firestore reads/day, 20K
  Firestore writes/day, 1 GB Firestore storage
- Defenses against bot abuse driving quota burn:
  - Firebase **App Check** enforced on every Firestore call
  - **reCAPTCHA Enterprise** as the App Check provider (10K free/mo,
    7-day token TTL minimises consumption)
  - Firestore security rules require `request.app != null` on every
    read/write, with default-deny on `match /{document=**}`
  - Cloudflare WAF in front of `*.oriz.in` for an extra rate-limit
    + bot-fight layer

## Why this shape

The 5-figure Firebase bill-shock incidents documented in 2025-2026
(simmer.io ~$98K, Tamara ~$70K, €54K Gemini key) all required Blaze.
Cloud Spend Caps from Cloud Next '26 are private preview AND don't
cover Firestore / Storage / Hosting. The Cyclenerd Terraform killswitch
lags hours-to-days behind actual spend. Spark is the only Firebase tier
where "card never on file" is enforced by Google itself.

## Cross-refs

- How auth flows across subdomains → [cross-site-auth-via-auth-oriz-in.md](./cross-site-auth-via-auth-oriz-in.md)
- Where user data lives → [layer-4-database-by-shape.md](../general/layer-4-database-by-shape.md)
- The non-negotiable rule → [`../rules/no-card-on-file.md`](../../rules/interaction/no-card-on-file.md)
