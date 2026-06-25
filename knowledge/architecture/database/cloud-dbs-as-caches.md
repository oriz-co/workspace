---
type: architecture
title: Cloud DBs are caches, not sources
description: Firestore, Turso, and R2 are caches. They are rebuilt from the canonical
  git store on every deploy. If any of them dies, the next deploy reconstructs it
  from JSONL.
tags:
- architecture
- data
- firestore
- turso
- r2
- caches
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- architecture/database/canonical-store-jsonl
- architecture/database/events-table-schema
- architecture/general/layer-4-database-by-shape
- architecture/general/layer-5-compute
---



# Cloud DBs are caches, not sources

## Concept

Firestore (user state), Turso (warm-cache lifestream events), and R2
(media uploads, when needed) are all treated as caches over the git
canonical. Their job is to make queries fast at the edge. Their job
is NOT to be the source of truth. Any one of them can be dropped and
rebuilt from `git clone` + the rebuild script.

## How it works

- Turso warm-cache: the GitHub Actions cron parses `oriz-me-data`
  JSONL, normalises into the events SQL schema, and writes via the
  `@tursodatabase/serverless` write client
- Firestore: holds account-shaped data that is itself canonical
  there (subscription state, preferences) — but those documents are
  derived from external systems (Razorpay webhook for subscription,
  client UI for preferences) which are themselves replayable
- R2: media uploads are addressed by content hash; the canonical
  index of "which hash is what" can live alongside the JSONL
- The rule: if any cache vanishes, the next CI run rebuilds it from
  the canonical without manual intervention

## Why this shape

A hosted DB as canonical is a single-point-of-failure with no migration
story. A git-canonical with hosted-DB caches inverts that: the canonical
is mirrorable everywhere, and the caches are disposable. The cost is
one `rebuild-cache.ts` script per cache — paid once, runs on every
deploy.

This also makes free-tier limits less stressful. If Firestore reads
spike one day, the cache can absorb it via Turso. If Turso is
saturated, the build-time JSON bake is always there. There is always
another tier underneath because git is at the bottom.

## Cross-refs

- The canonical store these caches mirror → [canonical-store-jsonl.md](./canonical-store-jsonl.md)
- The SQL shape Turso holds → [events-table-schema.md](./events-table-schema.md)
- The full data-shape sharding picture → [layer-4-database-by-shape.md](../general/layer-4-database-by-shape.md)
- What runs the rebuild scripts → [layer-5-compute.md](../general/layer-5-compute.md)
