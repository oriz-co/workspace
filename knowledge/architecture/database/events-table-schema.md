---
type: architecture
title: Events table schema (Turso warm cache)
description: "The SQL shape the lifestream JSONL is normalised into for the Turso\
  \ warm cache. Lives concretely in oriz-me but the contract is family-wide \u2014\
  \ any site reading lifestream events sees this shape."
tags:
- architecture
- schema
- turso
- sqlite
- events
- lifestream
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- architecture/database/canonical-store-jsonl
- architecture/database/cloud-dbs-as-caches
- architecture/general/layer-4-database-by-shape
---



# Events table schema (Turso warm cache)

## Concept

The lifestream JSONL gets normalised into a single wide `events`
table on Turso. The SQL schema lives concretely inside `oriz-me`'s
codebase (because that's the site that owns the rebuild script) but
the contract is family-wide: any site or extension that reads
lifestream events reads through this schema.

## How it works

The canonical event row carries the following columns. Field-level
detail and indexes belong in the per-app `knowledge/` bundle inside the cs-me-app submodule (`repos/c127/own/prod/apps/personal/cs-me-app/knowledge/`) — this file
captures the family-wide contract.

| Column | Type | Purpose |
|---|---|---|
| `id` | TEXT primary key | Stable hash of source + source_id |
| `ts` | INTEGER (unix seconds) | Event timestamp; primary sort key |
| `source` | TEXT | `lastfm` / `github` / `lichess` / `simkl` / `anilist` / etc. |
| `type` | TEXT | Source-specific verb: `listen`, `commit`, `game`, `watch`, `read` |
| `payload_json` | TEXT (JSON) | Source-specific payload, kept verbatim from the JSONL line |
| `entity_key` | TEXT | Optional dedupe key (album+track for listens; repo+sha for commits) |
| `inserted_at` | INTEGER | When the rebuild script wrote the row |

- Indexes: `(ts DESC)` for the live feed; `(source, ts DESC)` for
  per-source views
- The schema is **append-only at the JSONL layer**. The cache table is
  rebuildable; rows can be deleted-and-reinserted on every rebuild
  without losing data, because the JSONL is the source.
- Read access from the browser uses a Turso read-only token; writes
  only happen from the rebuild script via a server-side write token

## Why this shape

A wide `events` table with a JSON payload column trades query
ergonomics for schema flexibility. Lifestream sources change —
Last.fm adds a field, AniList changes a verb name, a new source
shows up — and a single normalised table absorbs that without
migrations. The few queries that need structured access read the
JSON via SQLite's JSON functions or denormalise specific columns
when a source matures.

The "warm cache" framing is what keeps this schema cheap to evolve:
breaking changes are absorbed by re-running the rebuild script.

## Cross-refs

- Where the JSONL lives → [canonical-store-jsonl.md](./canonical-store-jsonl.md)
- The rebuild contract → [cloud-dbs-as-caches.md](./cloud-dbs-as-caches.md)
- The full data sharding picture → [layer-4-database-by-shape.md](../general/layer-4-database-by-shape.md)
