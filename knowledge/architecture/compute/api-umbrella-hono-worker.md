---
type: architecture
title: "API umbrella \u2014 one Hono Worker at api.oriz.in"
description: Single Hono Worker at api.oriz.in serves every API route for the family.
  See the decision file for why.
tags:
- architecture
- api
- hono
- worker
- umbrella
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- decisions/architecture/compute/hono-worker-api-umbrella
- architecture/compute/hono-rpc-type-sharing
- architecture/compute/api-routes-structure
---



# API umbrella — one Hono Worker

## Shape

`api.oriz.in` is a single Cloudflare Worker running Hono, checked in at `apps/api/` (inline in the master repo, not a submodule). Every API route in the family lives there as `apps/api/src/routes/<service>/`. `wrangler.jsonc` declares `custom_domain: api.oriz.in`. The Worker exports `type AppType = typeof app` from `src/index.ts`.

## Routes layout

- `routes/contact.ts` — contact-form relay
- `routes/recaptcha.ts` — reCAPTCHA verify
- `routes/razorpay/` — Razorpay webhooks + order creation
- `routes/firestore/` — Firestore wrappers
- `routes/turso/` — Turso warm-cache reads
- `routes/auth/` — Firebase Auth verify, cross-site session check

## Edge-compatible libs (Worker-only)

- Firestore: `firebase-rest-firestore` (NOT `firebase-admin` — needs gRPC)
- Turso: `@tursodatabase/serverless`
- Firebase Auth verify: `firebase-auth-cloudflare-workers` + `@hono/firebase-auth`
- reCAPTCHA verify: plain `fetch`

## Cross-refs

- Why we picked this shape → [[decisions/architecture/hono-worker-api-umbrella]]
- Type-safe RPC clients → [[architecture/hono-rpc-type-sharing]]
- Routes-per-service convention → [[architecture/api-routes-structure]]
