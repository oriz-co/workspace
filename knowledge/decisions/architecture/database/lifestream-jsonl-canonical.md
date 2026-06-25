---
type: decision
title: Lifestream JSONL in git is canonical; Turso is warm cache
description: The chirag127/oriz-me-data git repo holds canonical JSONL events sharded
  by year. Turso libSQL is a rebuilt warm cache for live edge reads, not a source
  of truth.
tags:
- lifestream
- jsonl
- turso
- canonical
- durability
timestamp: 2026-06-19
format_version: okf-v0.1
status: active
supersedes: why-firestore-not-turso
related:
- decisions/content/100-year-strategy-locked
- architecture/database/canonical-store-jsonl
- services/database/turso
---



# Lifestream JSONL in git is canonical; Turso is warm cache

## Decision

The lifestream's authoritative store is JSONL files in the
`chirag127/oriz-me-data` git repo, sharded one file per year
(`events-2026.jsonl`), with a year-file shardable into month-files
once it crosses 10 MB pre-compression. Turso libSQL is a warm cache
rebuilt from the JSONL on every deploy — it is NOT a source of
truth and may be wiped without data loss.

## Why

Per the 100-year strategy, vendor format risk is one of the top 3
failure modes. SQLite, Parquet, and Firestore exports all carry
vendor-specific quirks that may not parse cleanly in 2076. Plain
text JSONL in a git repo does: anyone with `git clone` and `jq` can
read every event, in any decade, on any platform. JSONL is also
git-pack-friendly (append-only text), which keeps `.git` size
bounded over decades. This decision explicitly supersedes the
earlier `why-firestore-not-turso.md` which made Turso the canonical
store.

## Implications

- Ingesters APPEND to the current year-file in `chirag127/oriz-me-data`. Idempotent writes via per-source dedup keys.
- A daily GitHub Action clones the data repo, validates each line against `schema.json`, rebuilds the Turso cache via `scripts/rebuild-cache.ts`.
- Astro builds read from Turso for static page generation. Live data on the home page hits Turso through the read-only token at request time, edge-cached 60s.
- Year-files declare their own schema-version field so a 2076 reader can parse a 2026 line correctly.
- If Turso dies: rebuild the cache from git on next deploy. If GitHub dies: `git clone` the data repo to a new host.
- Old `src/lib/lifestream/` files in oriz-me get rewritten — Turso becomes cache-only, `src/lib/lifestream/jsonl.ts` handles the canonical I/O.

## Cross-refs

- [100-year strategy locked](../../content/100-year-strategy-locked.md) — §10–§11 set the canonical-store contract
- [Canonical store JSONL architecture](../../../architecture/database/canonical-store-jsonl.md)
- [Turso service entry](../../../services/database/turso.md)
- Superseded predecessor: `oriz-me/knowledge/decisions/why-firestore-not-turso.md` (kept as historical context)
