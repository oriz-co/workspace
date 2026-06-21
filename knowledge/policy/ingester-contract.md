---
type: policy
title: "Ingester contract (family-wide)"
description: "Every lifestream / data ingester satisfies six properties: idempotent, backfill-capable, 7-day auto-pause, status-reporting, bounded execution, no inline secrets."
tags: [policy, ingester, lifestream, durability]
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
annual_review: true
related:
  - policy/secrets-handling
  - policy/data-canonical-store
  - decisions/content/100-year-strategy-locked
---

# Ingester contract (family-wide)

## The policy

Every ingester that writes into a family data store — lifestream,
content snapshots, cache rebuilds — satisfies all six properties below
or it does not ship.

## Scope

- All `functions/scheduled/ingest-*.ts` Cloudflare Worker crons.
- All `.github/workflows/*.yml` build-time fetchers that produce JSON /
  JSONL committed to a `chirag127/oriz-*-data` repo.
- Any future ingester anywhere in the family, regardless of host.

## Rules

- **(1) Idempotent writes.** Re-running an ingester against an
  overlapping window writes zero new rows. Each event carries a
  deterministic key on `(source, external_id, occurred_at)`; storage
  layers (`appendEvent`, `batchUpsert`) silently skip duplicates.
- **(2) Backfill-capable on first run after a gap.** The ingester
  reads `last_synced_at` from the `sources` table. If null or older
  than the upstream's recent-feed window, it switches to the paginated
  full-history endpoint. A 6-month silence followed by a wake-up
  catches the gap, not just the last hour.
- **(3) Auto-pause after 7 consecutive daily failures.** The `sources`
  table tracks `consecutive_failures`. At 7, the body short-circuits
  and writes `last_error = 'auto-paused after 7d failures'`. Cron keeps
  firing; the body returns immediately. `pnpm ingest:reset <source>`
  clears the pause.
- **(4) Status reporting on every run.** Every run ends — success or
  failure — with a call to `recordSyncStatus`. Success: `error: null`.
  Failure: `error: err.message` (truncated). Partial success: `error:
  null` plus `degraded: true` in metadata for the amber dot on
  `/status`.
- **(5) Bounded execution time.** Track elapsed time against a deadline
  10s under the platform cap (50s on Cloudflare Workers' 60s cron).
  When approaching the cap, break out of pagination, flush in-memory
  rows, and update `last_synced_at` to the latest persisted
  `occurred_at`. The next tick resumes from there.
- **(6) No secrets in code.** Every credential reads from the env
  binding. The required env vars are documented in a comment block at
  the top of every ingester file.

## The /status page contract

The public `/status` page mirrors the `sources` table — one row per
ingester with: source name (mono caps, fixed width), 8-day rolling
sparkline (green / red / amber / hollow), last-sync time (relative,
red when stale), last error (truncated to 80 chars). Public visibility
is the social pressure that keeps the SLA honest.

## Exceptions

- **Manual one-off backfills.** A `scripts/backfill-once.ts` invoked
  by hand may skip property (3) since it is not on cron — it must
  still satisfy (1), (2), (4), (5), (6).
- **Read-only health probes.** A pure read against an upstream that
  writes nothing is not an ingester and is exempt from this contract.

## Annual review

On every birthday, run `pnpm audit:ingesters`. Any ingester that
auto-paused 3+ times in the last 365 days gets a hard re-evaluation
with three legitimate outcomes: fix the root cause, replace the
upstream, or remove the source entirely.

## Cross-refs

- [`./secrets-handling.md`](./secrets-handling.md) — property (6) leans on the envpact rotation runbook
- [`./data-canonical-store.md`](./data-canonical-store.md) — where ingester writes land
- [`projects/apps/personal/oriz-cs-me-app/knowledge/decisions/ingester-contract.md`](../../projects/apps/personal/oriz-cs-me-app/knowledge/decisions/ingester-contract.md) — original app-scoped version (in the oriz-cs-me-app submodule) with reference implementation skeleton
