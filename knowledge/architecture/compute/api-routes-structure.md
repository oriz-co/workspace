---
type: architecture
title: "API routes \u2014 apps/api/src/routes/ structure"
description: "The Hono Worker splits routes by concern under apps/api/src/routes/\
  \ \u2014 contact, recaptcha, razorpay, firestore, turso, auth. Each folder owns\
  \ the integration with one external service."
tags:
- architecture
- api
- hono
- routes
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- architecture/compute/api-umbrella-hono-worker
- architecture/compute/hono-rpc-type-sharing
- architecture/ops/subscription-flow
- architecture/security/cross-site-auth-via-auth-oriz-in
---



# API routes — apps/api/src/routes/ structure

## Concept

Inside the umbrella Worker, routes are organised by external service /
concern. Each folder owns one integration so an integration swap is
contained to one folder, not threaded through the whole Worker.

## How it works

```
apps/api/
├── src/
│   ├── routes/
│   │   ├── contact.ts        ← relay to Web3Forms / EmailJS
│   │   ├── recaptcha.ts      ← verify reCAPTCHA Enterprise tokens
│   │   ├── razorpay/         ← subscription webhook + signature verify
│   │   ├── firestore/        ← firebase-rest-firestore wrappers
│   │   ├── turso/            ← lifestream warm-cache reads
│   │   └── auth/             ← firebase-auth-cloudflare-workers verify
│   └── index.ts              ← composes routes; export type AppType = typeof app
└── wrangler.jsonc            ← custom_domain: api.oriz.in
```

- `contact.ts` — proxies submissions to the email backend (Resend or
  the chosen alternative). Web3Forms stays browser-only.
- `recaptcha.ts` — server-side verification of reCAPTCHA Enterprise
  tokens before any privileged action runs.
- `razorpay/` — webhook signature validation + write to
  `users/{uid}/subscription` in Firestore. See [subscription-flow.md](../ops/subscription-flow.md).
- `firestore/` — server-side reads/writes that need the service-account
  identity (anything App Check can't cover from the browser).
- `turso/` — read endpoints for the lifestream warm cache.
- `auth/` — verifies Firebase ID tokens on incoming requests; used as
  middleware for all the privileged route folders above.

## Why this shape

Each external service eventually gets swapped — Web3Forms could become
Formspree, Razorpay could become Stripe, reCAPTCHA could become
Turnstile. Folder-per-service means a swap is one folder edit, not a
search-and-replace across a 5,000-line Worker. It also matches the
package isolation rule on the client side — see [package-isolation-rule.md](../security/package-isolation-rule.md).

## Cross-refs

- The Worker hosting these routes → [api-umbrella-hono-worker.md](./api-umbrella-hono-worker.md)
- How the Razorpay webhook reaches Firestore → [subscription-flow.md](../ops/subscription-flow.md)
- How auth verification works → [cross-site-auth-via-auth-oriz-in.md](../security/cross-site-auth-via-auth-oriz-in.md)
