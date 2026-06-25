---
type: index
title: Compute
description: Index of concepts in architecture/compute.
tags:
- index
- compute
timestamp: '2026-06-24'
format_version: okf-v0.1
status: active
---

# Compute

## Concepts

- [API routes — apps/api/src/routes/ structure](./api-routes-structure.md) — The Hono Worker splits routes by concern under apps/api/src/routes/ — contact, recaptcha, razorpay, firestore, turso, auth. Each folder owns the integration with one external service.
- [API umbrella — one Hono Worker at api.oriz.in](./api-umbrella-hono-worker.md) — Single Hono Worker at api.oriz.in serves every API route for the family. See the decision file for why.
- [Hono RPC type-sharing — `hc<typeof app>` client across sites](./hono-rpc-type-sharing.md) — API consumers get full type inference from the Hono Worker via the rpc client. See the decision file for why.
- [Service Bindings — future privileged-Worker split](./service-bindings-future.md) — Cloudflare Service Bindings give zero-cost, zero-network-hop RPC between Workers. Reserved for a future split where the Hono umbrella Worker delegates privileged auth/billing logic to a separate "auth-core" Worker.
