---
type: architecture
title: "Layer 4 \u2014 database, sharded by data shape"
description: Different data shapes go in different free tiers, deliberately spreading
  load so no single quota gets exhausted. Git for canonical, Firestore for user state,
  Turso for warm cache, browser for per-user search, R2 only when needed.
tags:
- architecture
- database
- firestore
- turso
- jsonl
- layer-4
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- architecture/security/layer-3-auth-firebase-spark
- architecture/database/canonical-store-jsonl
- architecture/database/cloud-dbs-as-caches
- architecture/database/events-table-schema
- rules/interaction/never-hit-quotas
---



# Layer 4 — database, sharded by data shape

## Concept

Different kinds of data live in different free tiers, on purpose. No
single quota gets exhausted because no single store carries everything.
Git is the canonical store; the cloud DBs are caches; the browser
holds per-user state when nothing else needs to see it.

## How it works

| Data shape | Where | Why |
|---|---|---|
| Public, append-only datasheet (lifestream events, blog MDX, books JSON, cards JSON) | **GitHub repos as JSON / JSONL / MDX**, read at build time, baked into static HTML | Truly free forever, version-controlled, survives every provider |
| User accounts, subscription state, entitlement flags | **Firestore Spark** | Auth lives here anyway; 50K reads/day covers 11+ sites + N extensions combined |
| Hot edge cache (last 24h of lifestream events for the live home feed) | **Turso libSQL — read-only token only** | Read-only token is browser-safe; writes happen in the cache-rebuild script |
| Per-user search index (journal full-text) | **`localStorage` / IndexedDB** in the browser | Zero cost to family infra |
| Public datasets (NCERT books, card catalog, finance calculator inputs) | **JSON in GitHub repo** | Read at build time; no DB hits |
| Image / file uploads | **Cloudflare R2 free** (10 GB, no egress) | Only when a feature requires it; defer until needed |

## Why this shape

A single store always has ONE quota. With one store, you either pick a
tier that covers your worst case (expensive) or accept hitting the
quota wall (loses data or service). Sharding by data shape means each
store sees a load it can absorb at the free tier. Auth state sees only
signed-in user activity. Public datasheet content sees zero runtime DB
load — it's compiled at build time. The warm cache only sees the small
sliver of "the last 24h" which fits inside any free tier.

## Cross-refs

- The canonical store rule → [canonical-store-jsonl.md](../database/canonical-store-jsonl.md)
- Why cloud DBs are caches not sources → [cloud-dbs-as-caches.md](../database/cloud-dbs-as-caches.md)
- The events SQL schema → [events-table-schema.md](../database/events-table-schema.md)
