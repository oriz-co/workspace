---
type: architecture
title: "Service Bindings \u2014 future privileged-Worker split"
description: Cloudflare Service Bindings give zero-cost, zero-network-hop RPC between
  Workers. Reserved for a future split where the Hono umbrella Worker delegates privileged
  auth/billing logic to a separate "auth-core" Worker.
tags:
- architecture
- api
- cloudflare-workers
- service-bindings
- future
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- architecture/compute/api-umbrella-hono-worker
- architecture/compute/api-routes-structure
- architecture/ops/subscription-flow
---



# Service Bindings — future privileged-Worker split

## Concept

Today the umbrella Hono Worker holds everything from contact-form
relay to Firestore service-account JWTs. If the privileged blast
radius gets uncomfortable, Cloudflare Service Bindings let us split
out a separate "auth-core" Worker that holds the secrets, with the
public Worker calling it via Service Binding RPC at zero cost.

## How it works

- A Service Binding is configured in `wrangler.jsonc` and gives the
  caller a typed `env.AUTH_CORE.fetch(...)` (or method-style RPC)
- The call doesn't leave Cloudflare's edge — no network latency, no
  request-quota double-counting, no public URL on the inner Worker
- The inner Worker holds the Firebase service-account key and the
  Razorpay webhook secret; the outer Worker holds nothing privileged
- Splitting the routes is mechanical: `routes/auth/`, `routes/firestore/`
  and `routes/razorpay/` move into the inner Worker; the outer Worker
  forwards calls via the binding

## Why this shape

Today's umbrella Worker is small enough that a single deploy is
fine. The risk-of-change calculus changes once external integrations
multiply: a bug in the contact-form route shouldn't be one deploy
away from the Razorpay signing key. Service Bindings are the
no-network-hop escape hatch that lets us do the split when we want
to without giving up the typed RPC pattern. It is documented now so
when the split is needed, the shape is already locked.

## Cross-refs

- The Worker that would split → [api-umbrella-hono-worker.md](./api-umbrella-hono-worker.md)
- The privileged routes that would move → [api-routes-structure.md](./api-routes-structure.md)
- The flow that needs the highest blast-radius isolation → [subscription-flow.md](../ops/subscription-flow.md)
