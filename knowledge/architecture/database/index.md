---
type: index
title: Database
description: Index of concepts in architecture/database.
tags:
- index
- database
timestamp: '2026-06-24'
format_version: okf-v0.1
status: active
---

# Database

## Concepts

- [Canonical store — JSONL in chirag127/oriz-me-data](./canonical-store-jsonl.md) — The chirag127/oriz-me-data git repo is the authoritative store for lifestream events. JSONL append-only files are the source of truth; everything else is derived.
- [Cloud DBs are caches, not sources](./cloud-dbs-as-caches.md) — Firestore, Turso, and R2 are caches. They are rebuilt from the canonical git store on every deploy. If any of them dies, the next deploy reconstructs it from JSONL.
- [Events table schema (Turso warm cache)](./events-table-schema.md) — The SQL shape the lifestream JSONL is normalised into for the Turso warm cache. Lives concretely in oriz-me but the contract is family-wide — any site reading lifestream events sees this shape.
