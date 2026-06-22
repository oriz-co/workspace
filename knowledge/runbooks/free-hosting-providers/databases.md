---
type: runbook
title: "Free hosting — databases (Firestore, Supabase, Neon, Turso, Mongo, CockroachDB, Upstash, D1, KV)"
description: "Provider-by-provider free-tier numbers for relational + document + edge-SQL + KV databases. Family is heavy on Firebase Firestore (default), Cloudflare D1 + KV (edge), and Neon (Postgres when we need SQL). PlanetScale + Xata dropped after 2024–2025 free-tier kills."
tags: [runbook, hosting, free-tier, databases, firestore, neon, supabase, turso, cloudflare-d1, upstash]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
  - runbooks/free-hosting-providers/index
  - rules/no-card-on-file
---

# Databases — free tiers (2026-06-22)

The family pattern: **Firestore for app data, Cloudflare D1 + KV for edge state, Neon for ad-hoc Postgres**. Other providers in this table are validated fallbacks.

## The table

| # | Provider | Free tier | Card@signup | Card to use free | KYC | Verdict |
|---|---|---|---|---|---|---|
| 1 | **Firebase Firestore Spark** ⭐ | 1 GiB stored, 50K reads/day, 20K writes/day, 20K deletes/day, 10 GiB egress/mo | NO | NO | NO | **KEEP** (family default) |
| 2 | **Cloudflare D1** ⭐ | 5M rows read/day, 100K rows written/day, 5 GB storage | NO | NO | NO | **KEEP** (edge SQL) |
| 3 | **Cloudflare KV** ⭐ | 100K reads/day, 1K writes/list/delete each/day, 1 GB storage | NO | NO | NO | **KEEP** (edge KV) |
| 4 | **Neon Postgres** ⭐ | 10 projects, 0.5 GB/project, 100 CU-hrs/project/mo, 5 GB egress, unlimited branches, scale-to-zero | NO | NO | NO | **KEEP** (ad-hoc PG) |
| 5 | Supabase Free | 500 MB DB, 1 GB file storage, 50K MAU, **2 projects**, pauses after 7-day inactivity | NO | NO | NO | **KEEP** (2-project ceiling kills fan-out) |
| 6 | Turso libSQL | 100 DBs, 5 GB total storage, 500M row reads/mo, 10M row writes/mo | NO | NO | NO | **KEEP** |
| 7 | MongoDB Atlas M0 | 512 MB storage, shared CPU, 1 cluster/project, ~100 ops/sec, no expiry | NO | NO | NO | **KEEP** |
| 8 | CockroachDB Basic | 5 GiB storage + 50M RUs/mo, scale-to-zero | NO | NO | NO | **KEEP** |
| 9 | Upstash Redis | 256 MB data, **500K commands/mo** (was 10K/day until 2025-03-12), 10 GB bandwidth | NO | NO | NO | **KEEP** |
| 10 | Tembo Hobby | 0.25 vCPU, 1 GiB RAM, 10 GiB storage, no SLA/HA, free forever | NO | NO | NO | **EVALUATE** |
| 11 | Aiven Free PG | Single node, 1 GB storage (cut from 5 GB 2025-05-15), 20-conn cap, no time limit | NO | NO | NO | **EVALUATE** |
| 12 | PlanetScale | No free tier; Hobby killed Apr 8 2024 — cheapest now Scaler ~$39/mo | — | — | — | **DROP (killed)** |
| 13 | Xata | Free tier discontinued 2025 (enterprise pivot) | — | — | — | **DROP (killed)** |

## How the family picks per use case

| Use case | First pick | Second pick | Why |
|---|---|---|---|
| App database (users, sessions, content) | Firestore Spark | Supabase | Firestore = no-card default, generous reads/day. Supabase if you need real SQL and don't fan out past 2 projects. |
| Edge SQL (read at the edge) | Cloudflare D1 | Turso libSQL | D1 lives in the Cloudflare account already used for Pages + Workers. Turso for libSQL features (branching, embedded replicas). |
| Edge KV (session, feature flags, small lookups) | Cloudflare KV | Upstash Redis | KV is free + co-located with Workers. Upstash for Redis-API compatibility. |
| Ad-hoc Postgres (analytics, prototypes, branchable) | Neon | Aiven | Neon = 10 projects + branching is killer for branch-per-PR previews. Aiven for "I want a single PG and don't care about branches". |
| Document DB at scale | MongoDB Atlas M0 | Firestore | Mongo for genuine document-DB queries (aggregations). |
| Large-scale OLAP-leaning relational | CockroachDB Basic | Neon | Cockroach for distributed SQL semantics; Neon for plain PG. |
| Redis-API ephemeral cache | Upstash | Cloudflare KV | Upstash for true Redis API; KV for simpler reads. |

## Quirks per provider

- **Firestore Spark** = the family default. No card, no project cap, ample free reads. Hardest gotcha: writes are rate-limited (20K/day) and large fan-out writes can blow the cap fast.
- **Cloudflare D1** lives inside the Workers Free quota. Reads count against D1's own limit (5M/day), separate from Workers' 100K req/day. So a Worker that reads D1 10 times per request can serve 500K user requests/day before either cap bites.
- **Cloudflare KV writes are tiny (1K/day).** Reads are huge (100K/day). KV is read-heavy by design; if you write more than ~1K times per day, switch to D1.
- **Neon's 10 projects + unlimited branches** is the killer feature for branch-per-PR Postgres in CI. Use one project per app, branch per feature.
- **Supabase 2-project cap** is the wall. Beyond 2 apps needing distinct Postgres + auth + storage stacks, switch to Neon (DB only) + Firebase Auth.
- **Supabase 7-day pause.** If an app gets no traffic for 7 days, the DB pauses. Wake-up takes ~10 s. Mitigation: a Workers Cron Trigger that pings the DB once a week.
- **Turso libSQL** is the libSQL fork of SQLite, distributed at the edge. 100 DBs is enough for per-tenant isolation across the family.
- **MongoDB Atlas M0** does NOT auto-expire (unlike some "free trial" tiers from other providers). It just stays at 512 MB.
- **CockroachDB Basic** (was "Serverless") gives 5 GiB + 50M RUs/mo — plenty for prototypes; RU model takes a sec to grok.
- **Upstash 2025-03-12 model change.** Old: 10K commands/day. New: 500K/mo. Slightly more generous for bursty workloads.
- **PlanetScale Hobby killed Apr 8 2024.** Don't link anywhere; if you see PlanetScale in old runbooks, replace with Neon.
- **Xata free killed 2025** in their enterprise pivot. Replace with Neon for Postgres or Turso for SQLite-flavor.

## Recommendation for the family

1. **App data (every site + app):** Firestore Spark — already the default, no migration needed.
2. **Edge state (per-Worker / per-Pages-Function):** Cloudflare D1 + KV — same Cloudflare account.
3. **Prototype Postgres / branch-per-PR previews:** Neon — 10 projects covers 10 simultaneous projects, plenty of headroom.
4. **Redis cache:** Upstash Redis (500K commands/mo) until we genuinely outgrow the cap.
5. **Anything else:** see the use-case table above.

## Sources

- [Firebase pricing — Spark plan](https://firebase.google.com/pricing)
- [Cloudflare D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [Cloudflare KV pricing](https://developers.cloudflare.com/kv/platform/pricing/)
- [Neon pricing](https://neon.tech/pricing)
- [Supabase pricing](https://supabase.com/pricing) — 2 projects + 7d pause
- [Turso pricing](https://turso.tech/pricing)
- [MongoDB Atlas pricing — M0](https://www.mongodb.com/pricing)
- [CockroachDB pricing](https://www.cockroachlabs.com/pricing/)
- [Upstash Redis pricing](https://upstash.com/pricing/redis) — 2025 model change
- [PlanetScale Hobby killed announcement](https://planetscale.com/blog/planetscale-forever)
- [Tembo Hobby](https://tembo.io/pricing)
- [Aiven free PG](https://aiven.io/free-postgresql-database)
