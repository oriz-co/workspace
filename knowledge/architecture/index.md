---
type: index
title: Architecture — the oriz family stack
description: Top-level map of the chirag127/oriz family architecture. Five hosting/runtime layers plus the API umbrella, the canonical store, the cross-cutting auth/billing flows, and the repo layout.
tags: [architecture, overview, index]
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
---

# Architecture — the oriz family stack

The family is one master repo (`chirag127/oriz`) that points at 26 app
submodules, an open-ended set of extension submodules, seventeen shared
`@chirag127/*` packages (see
[the-17-packages.md](the-17-packages.md)), and one inline Hono Worker. Everything is built on free tiers
of Cloudflare, GitHub, and Firebase Spark — no card on file anywhere.

This bundle breaks the architecture into five orthogonal axes:

## 1. The five-layer free-forever stack

Each layer fails-closed at quota, none has a card on file.

- [Layer 1 — static hosting (Cloudflare Pages)](layer-1-static-hosting.md)
- [Layer 2 — survival fallback (GitHub Pages mirror)](layer-2-survival-fallback.md)
- [Layer 3 — auth (Firebase Spark forever)](layer-3-auth-firebase-spark.md)
- [Layer 4 — database, sharded by data shape](layer-4-database-by-shape.md)
- [Layer 5 — compute (cron + Workers + browser)](layer-5-compute.md)

## 2. The API umbrella

ONE Hono Worker at `api.oriz.in` serving all sites + extensions.

- [The Hono Worker umbrella](api-umbrella-hono-worker.md)
- [Routes structure under apps/api/src/routes/](api-routes-structure.md)
- [Hono RPC for type-sharing across sites](hono-rpc-type-sharing.md)
- [Service Bindings for the future privileged-auth split](service-bindings-future.md)

## 3. The canonical store

Git is authoritative; cloud DBs are caches rebuilt from git on deploy.

- [JSONL in git is the canonical store](canonical-store-jsonl.md)
- [Cloud DBs (Firestore, Turso) are caches](cloud-dbs-as-caches.md)
- [Events table schema](events-table-schema.md)

## 4. Cross-cutting concerns

- [Cross-site auth via auth.oriz.in](cross-site-auth-via-auth-oriz-in.md)
- [Subscription flow (Razorpay → Firestore)](subscription-flow.md)
- [Extension distribution (Chrome + Firefox + Edge)](extension-distribution.md)
- [Package isolation rule](package-isolation-rule.md)
- [The 17 packages](the-17-packages.md)

## 5. Repository structure

- [Repository layout](repo-layout.md)
- [Submodule pattern](submodule-pattern.md)
- [The master pointer IS production state](master-pointer-as-production-sha.md)

## How to extend this bundle

Add a new file when a new architectural shape lands. Update `index.md`
to link it. Keep concepts to one file each — split rather than grow.
Cross-link via `related:` frontmatter and inline markdown links.
