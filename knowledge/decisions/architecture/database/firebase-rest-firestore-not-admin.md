---
type: decision
title: firebase-rest-firestore (NOT firebase-admin) for Workers compatibility
description: The umbrella Hono Worker uses firebase-rest-firestore (REST + service-account
  JWT). The firebase-admin SDK is excluded because workerd only partially supports
  gRPC.
tags:
- firebase
- cloudflare
- workers
- dependency
- firestore
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- decisions/architecture/compute/hono-worker-api-umbrella
- decisions/infrastructure/firebase-spark-forever
- architecture/compute/api-umbrella-hono-worker
---



# firebase-rest-firestore (NOT firebase-admin) for Workers compatibility

## Decision

Server-side Firestore access from the umbrella Hono Worker uses
`firebase-rest-firestore` (REST + service-account JWT). The
`firebase-admin` SDK is excluded — it requires gRPC, which
Cloudflare's `workerd` runtime only partially supports, and which
inflates Worker bundle size past comfortable limits.

## Why

The umbrella Hono Worker at `api.oriz.in` runs on Cloudflare Workers
free, which uses `workerd`. `workerd` supports `fetch`-based REST
calls perfectly but breaks on `firebase-admin`'s gRPC code paths
under load. `firebase-rest-firestore` is a thin REST wrapper that
handles service-account JWT signing and document I/O via plain
`fetch` — exactly what Workers want.

## Implications

- The Firebase service account key (`FIREBASE_SERVICE_ACCOUNT_KEY`) lives in envpact and is injected as a Worker secret at deploy.
- Worker code imports from `firebase-rest-firestore`, not `firebase-admin`.
- Browser-side reads/writes use the regular Firebase Web SDK (`firebase/app`, `firebase/firestore`) — those have no Worker constraint.
- Documentation under `apps/api/` must clearly forbid `firebase-admin` so a future contributor doesn't accidentally add it to fix a "missing import".
- `@hono/firebase-auth` + `firebase-auth-cloudflare-workers` cover Auth verification under the same Worker-compatible constraint.

## Cross-refs

- [Hono Worker API umbrella](../compute/hono-worker-api-umbrella.md)
- [Firebase Spark forever](../../infrastructure/firebase-spark-forever.md)
- [API umbrella Hono Worker architecture](../../../architecture/compute/api-umbrella-hono-worker.md)
- [AGENTS.md edge-integrations section](../../../AGENTS.md)
