---
type: index
title: Database
description: Index of concepts in decisions/architecture/database.
tags:
- index
- database
timestamp: '2026-06-24'
format_version: okf-v0.1
status: active
---

# Database

## Concepts

- [Build cache — GitHub Actions cache + pnpm CAS (3-layer strategy)](./build-cache-gh-actions-plus-pnpm.md) — Three-layer build cache strategy. Layer 1: pnpm content-addressable global store dedupes deps cross-repo locally. Layer 2: GitHub Actions cache (10 GB/repo free) keyed by pnpm-lock.yaml hash + Astro build cache keyed by source hash. Layer 3: Turbo Remote Cache + Bazel REJECTED — Vercel signup + card / overengineering.
- [Add Neon Postgres as the relational tier of the DB stack](./db-add-neon-postgres.md) — Neon Postgres is added as the family's relational database. Free plan, no card, scale-to-zero, branching for previews. Sits alongside Firestore (documents/auth), Turso libSQL (warm cache), and JSONL canonical (archive) — the 4-tier DB stack is now picked-by-shape.
- [DB admin — console-only, no desktop DB tool](./db-admin-console-only.md) — Every database in the family is administered through its vendor's browser console (Firebase Console, Neon Console) or its first-party CLI (Turso CLI, libSQL CLI). NO desktop DB tool — Drizzle Studio / Outerbase / Beekeeper Studio / TablePlus all REJECTED. Zero install footprint, every team member can access via browser, no per-user license.
- [firebase-rest-firestore (NOT firebase-admin) for Workers compatibility](./firebase-rest-firestore-not-admin.md) — The umbrella Hono Worker uses firebase-rest-firestore (REST + service-account JWT). The firebase-admin SDK is excluded because workerd only partially supports gRPC.
- [Lifestream JSONL in git is canonical; Turso is warm cache](./lifestream-jsonl-canonical.md) — The chirag127/oriz-me-data git repo holds canonical JSONL events sharded by year. Turso libSQL is a rebuilt warm cache for live edge reads, not a source of truth.
- [Object storage split — GitHub Releases for binaries, Backblaze B2 for blobs; Cloudflare R2 rejected](./object-storage-split.md) — Versioned binaries live in GitHub Releases. Unversioned blobs live in Backblaze B2. Cloudflare R2 is rejected because adjacent paid features pull in a card-on-file requirement.
