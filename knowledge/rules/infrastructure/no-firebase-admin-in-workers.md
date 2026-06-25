---
type: rule
title: No firebase-admin inside Cloudflare Workers
description: Cloudflare's workerd runtime does not fully support gRPC, which firebase-admin
  requires. Use firebase-rest-firestore (REST + Web SDK) instead inside any Worker.
tags:
- rules
- cloudflare
- workers
- firebase
- gRPC
- runtime
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- architecture/compute/api-umbrella-hono-worker
- services/auth/firebase-spark
- rules/interaction/never-hit-quotas
---



# No firebase-admin inside Cloudflare Workers

Never `import { ... } from "firebase-admin"` (or any of its sub-packages)
from code that runs inside a Cloudflare Worker. It will appear to bundle,
then fail at runtime — usually as a vague gRPC / `http2` / `net` polyfill
error that wastes hours.

## Why

`firebase-admin` is built on gRPC over HTTP/2 with a node-native
transport. Cloudflare's `workerd` runtime intentionally does not
support the full Node `net`, `http2`, or `dns` surfaces that gRPC
needs. The Workers compatibility flags get close but never close
enough; even when the bundler succeeds, requests time out or hang.

The family runs its single API surface
([api-umbrella-hono-worker](../../architecture/compute/api-umbrella-hono-worker.md))
as a Cloudflare Worker. That means the rule is enforced everywhere
shared backend code lives.

## What to use instead

- **`firebase-rest-firestore`** — talks Firestore over plain HTTPS REST.
  Works in any fetch-capable runtime, including workerd, Deno, Bun.
- **The Firebase Web SDK (`firebase`)** — for read paths that can run
  with a user's ID token; works in Workers via fetch.
- **Custom REST calls to `firestore.googleapis.com`** when neither of
  the above fits — Firestore's REST API is stable and well-documented.

For auth verification, use a JWKS-backed verifier (e.g. `jose`) against
Firebase's public keys — not `firebase-admin.auth().verifyIdToken()`.

## Exceptions

None inside Workers. `firebase-admin` is fine in Node-runtime contexts
(GitHub Actions, local scripts, future build-time ingest jobs).

## See also

- [`api-umbrella-hono-worker.md`](../../architecture/compute/api-umbrella-hono-worker.md)
- [`firebase-spark.md`](../../services/auth/firebase-spark.md)
