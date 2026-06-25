---
type: architecture
title: "Canonical store \u2014 JSONL in chirag127/oriz-me-data"
description: The chirag127/oriz-me-data git repo is the authoritative store for lifestream
  events. JSONL append-only files are the source of truth; everything else is derived.
tags:
- architecture
- data
- jsonl
- git
- canonical
- lifestream
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- architecture/database/cloud-dbs-as-caches
- architecture/database/events-table-schema
- architecture/frontend/layer-2-survival-fallback
- architecture/general/layer-4-database-by-shape
---



# Canonical store — JSONL in chirag127/oriz-me-data

## Concept

The lifestream — every listen, watch, read, commit, run — is stored
as JSONL files in the `chirag127/oriz-me-data` git repo. That repo is
the authoritative store. Firestore, Turso, R2 are caches. If they
disappear, you `git clone` the canonical and rebuild. If git
disappears, civilisation has bigger problems.

## How it works

- One JSONL file per source / period (e.g. `lastfm/2026.jsonl`,
  `github/2026.jsonl`)
- Each line is a single immutable event with a timestamp, source, and
  type-specific payload
- GitHub Actions cron jobs append new lines daily by polling external
  APIs (Last.fm, GitHub, Lichess, Hardcover, simkl, AniList, etc.)
- The cache-rebuild script reads the JSONL, normalises into the
  events SQL schema (see [events-table-schema.md](./events-table-schema.md)), and
  pushes to Turso
- Sites read from Turso (warm cache) or directly from the bundled
  JSON snapshot (build-time bake)

## Why this shape

Three reasons git wins over a hosted DB as canonical:
1. **Survival.** Per the §16 100-year strategy, primary providers
   die. Git is mirrorable to anywhere with one command.
2. **Cost.** A lifestream of decades of events fits comfortably under
   GitHub's free-repo-size limits as JSONL.
3. **Auditability.** Every change is a commit. There is no "who
   updated this row?" — the answer is `git blame`.

Cloud DBs are great for query latency. Canonical-via-git plus
caches-rebuilt-on-deploy gets the latency without giving up the
durability story.

## Cross-refs

- Caches built from this → [cloud-dbs-as-caches.md](./cloud-dbs-as-caches.md)
- The SQL shape they're built into → [events-table-schema.md](./events-table-schema.md)
- The same survival logic at the host layer → [layer-2-survival-fallback.md](../frontend/layer-2-survival-fallback.md)
