---
type: decision
title: One Hono Worker at api.oriz.in is the entire API layer
description: All 11+ sites and all extensions share a single Hono Worker deployed
  at api.oriz.in, NOT per-site Pages Functions.
tags:
- api
- cloudflare
- hono
- workers
- architecture
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- decisions/architecture/compute/hono-rpc-for-type-sharing
- decisions/architecture/database/firebase-rest-firestore-not-admin
- architecture/compute/api-umbrella-hono-worker
- architecture/general/layer-5-compute
---



# One Hono Worker at api.oriz.in is the entire API layer

## Decision

The family runs ONE Cloudflare Hono Worker at `api.oriz.in`,
checked in at `apps/api/` in the master repo. All 11+ sites and
every extension hit it for: Razorpay webhooks, contact-form relay,
reCAPTCHA verify, cross-site session check, Firestore wrappers,
Turso warm-cache reads, Firebase Auth verify.

## Why

Cloudflare's own docs say: "if the logic is used by more than one
application, Pages Functions would not be a good use case." Pages
Functions can't use Cloudflare Secrets Store, and splitting the
same auth / CORS / reCAPTCHA verification across 11 sites' Functions
would 11× duplicate the code without buying any quota relief
(100K req/day is per-account regardless). One umbrella Worker is
the obvious centralisation.

## Implications

- `apps/api/` lives inline in the master repo (NOT a submodule) so a Worker deploy ships with master pointer bumps in one workflow.
- Every site/extension imports `@chirag127/api-client` (re-exports `hc<AppType>`) for type-safe RPC against the Worker.
- The Worker uses edge-compatible libs only: `firebase-rest-firestore` (NOT `firebase-admin`), `@tursodatabase/serverless`, `firebase-auth-cloudflare-workers`, `@hono/firebase-auth`, plain `fetch` for reCAPTCHA.
- Route layout: `routes/contact.ts`, `routes/recaptcha.ts`, `routes/razorpay/`, `routes/firestore/`, `routes/turso/`, `routes/auth/`.
- Deploy via `pnpm wrangler deploy` from `apps/api/`.
- Future split-off: a privileged "auth-core" Worker via Cloudflare Service Bindings (zero-cost zero-network-hop RPC) if scope grows.

## Cross-refs

- [Hono RPC for type sharing](./hono-rpc-for-type-sharing.md)
- [firebase-rest-firestore not admin](../database/firebase-rest-firestore-not-admin.md)
- [API umbrella Hono Worker architecture](../../../architecture/compute/api-umbrella-hono-worker.md)
- [Layer 5 — Compute architecture](../../../architecture/general/layer-5-compute.md)
- [AGENTS.md API layer section](../../../AGENTS.md)
