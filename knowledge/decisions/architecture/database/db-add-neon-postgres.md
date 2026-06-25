---
type: decision
title: Add Neon Postgres as the relational tier of the DB stack
description: "Neon Postgres is added as the family's relational database. Free plan,\
  \ no card, scale-to-zero, branching for previews. Sits alongside Firestore (documents/auth),\
  \ Turso libSQL (warm cache), and JSONL canonical (archive) \u2014 the 4-tier DB\
  \ stack is now picked-by-shape."
tags:
- database
- neon
- postgres
- relational
- four-tier
- stack
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/database/neon-postgres
- services/database/turso
- services/auth/firebase-spark
- decisions/architecture/database/firebase-rest-firestore-not-admin
- decisions/architecture/database/lifestream-jsonl-canonical
- rules/interaction/no-card-on-file
- rules/interaction/never-hit-quotas
---



# Add Neon Postgres as the relational tier of the DB stack

## Decision

The family's database stack is now four tiers, picked by data
**shape**:

1. **Documents + auth** — [Firestore on Firebase Spark](../../../services/auth/firebase-spark.md)
2. **Canonical archive** — JSONL in [`chirag127/oriz-me-data`](../../../glossary/i-n/master-repo.md)
3. **Warm read cache** — [Turso libSQL](../../../services/database/turso.md)
4. **Relational** — [Neon Postgres](../../../services/database/neon-postgres.md) (NEW)

Neon's Free plan is **confirmed no card** (verified from Neon's
pricing page on 2026-06-20): 100 projects, 100 CU-hours per project
per month, 0.5 GB storage per project, 5 GB egress / month,
scale-to-zero after 5 min idle, 6 h instant restore window, branching
for previews, up to 60K Neon Auth MAU (we don't use Neon Auth — we
stay on Firebase Auth).

## Why

The previous 3-tier stack (Firestore + Turso libSQL + JSONL) handles
document-shaped + event-stream-shaped data well, but **relational
joins are painful in Firestore and structurally lossy when flattened
to libSQL**. Concrete near-term workloads need real Postgres:

- `oriz-finance` ledger — joins across accounts / transactions /
  categories / budgets, with reconciliation queries that need foreign
  keys + transactions across multiple rows.
- `oriz-cards` relational tags — many-to-many between cards / decks /
  tags / sessions, with set-difference queries.

Neon's free plan covers those workloads with no card, scale-to-zero
(idle compute mathematically free), and branching for previews — and
its wire-protocol-Postgres surface is portable to any other Postgres
provider if the cliff hits. Adding it as the 4th tier is cheaper than
forcing relational shape into Firestore or building denormalized
read-models in libSQL.

## Implications

- **Compute autoscaling capped at 2 CU per project** on every Neon
  project, per [`rules/never-hit-quotas.md`](../../../rules/interaction/never-hit-quotas.md).
  Higher burst would burn the 100 CU-hours / month / project budget
  in days.
- **One Neon project per relational app** — `oriz-finance`,
  `oriz-cards`, etc. — so each gets its own 0.5 GB + 100 CU-hours
  envelope. Free plan allows 100 projects; we have plenty of
  headroom.
- **Branching for preview deploys** — Cloudflare Pages preview jobs
  create a Neon branch from `main` at deploy, run migrations on the
  branch, tear it down on merge. Zero risk to the main DB.
- **Connection-management posture** — relational adapters live behind
  `apps/<app>/src/db/` so the swap surface is one file per app. The
  Hono umbrella Worker uses connection pooling (Neon's `@neon/serverless` driver
  handles this natively over HTTP, so it works inside `workerd`,
  consistent with [`firebase-rest-firestore-not-admin.md`](./firebase-rest-firestore-not-admin.md)).
- **Firestore stays document-only.** Adding Neon does NOT shift any
  existing document-shaped workload (auth, app config, lifestream
  events, journal documents).
- **JSONL stays canonical.** Neon is a cache like libSQL — torn down
  and rebuilt from migrations + JSONL/CSV imports if needed. The
  canonical-store rule from [`lifestream-jsonl-canonical.md`](./lifestream-jsonl-canonical.md)
  is unchanged.
- **Neon Auth NOT used.** We stay on Firebase Auth per
  [`security/multi-provider-auth.md`](../../security/multi-provider-auth.md).
  Neon Auth's 60K MAU allowance is an unused free-tier headroom we
  document but don't lean on.
- Per-project monitoring trip: alert at 50% of CU-hours / storage /
  egress on each project to surface approach to quotas, not hits.

## Cross-refs

- [Neon Postgres service](../../../services/database/neon-postgres.md)
- [Database services index](../../../services/database/index.md)
- [Turso (libSQL) — sibling, warm cache](../../../services/database/turso.md)
- [Firebase Spark — Auth + Firestore](../../../services/auth/firebase-spark.md)
- [firebase-rest-firestore decision (Worker compat)](./firebase-rest-firestore-not-admin.md)
- [Lifestream JSONL canonical](./lifestream-jsonl-canonical.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
- [Never hit quotas rule](../../../rules/interaction/never-hit-quotas.md)
