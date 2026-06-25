---
type: runbook
title: "Feature-flag storage \u2014 Firestore vs CF KV vs D1 vs hybrid (with redundancy)"
description: Audit of database choice for the family's feature-flag system. Locks
  in CF D1 (source-of-truth, SQL audit + LD-style targeting rules) + CF KV (edge cache
  for 50ms reads) + daily GitHub JSON snapshot (disaster recovery), all on the free
  tier. Addresses user concern that Firestore has poor performance and isn't a good
  fit. Includes per-option grilling, free-tier ceilings, backup strategy, and the
  exact reasons we did NOT pick the alternatives.
tags:
- runbook
- feature-flags
- storage
- database
- cloudflare
- firestore
- d1
- kv
- redundancy
- free-tier
timestamp: 2026-06-23
format_version: okf-v0.1
status: "SUPERSEDED 2026-06-24 \u2014 feature-flag system deleted (oriz-flags-worker\
  \ folder + CF resources to be cleaned up separately). Final decision is `[[feature-flags-deferred]]`.\
  \ This runbook is kept as a historical record of the storage-choice analysis in\
  \ case feature flags are revisited."
related:
- decisions/architecture/general/feature-flags-deferred
- rules/infrastructure/free-tier-with-cost-controls
- rules/development/community-packages-first
---



# Feature-flag storage — the database decision, audited

## TL;DR

**Use: CF D1 (source-of-truth) + CF KV (read cache) + daily GitHub JSON snapshot (DR).**

Three layers, all free, full redundancy. Writes go to D1 first (SQL audit table + targeting rules); a Worker mirrors the resolved flag tree to KV so every page-render reads from the 50ms edge cache. A scheduled Worker dumps the full D1 state to a private GitHub gist nightly as a tarpit JSON file. If CF D1 dies, KV still serves the last-known-good state. If both die, the gist has yesterday's truth.

Do NOT use: Firestore (free-tier read ceiling too low, no native SQL for LD-style targeting rules, NoSQL audit trail awkward), KV-only (no schema for variants + segments — disqualified by the LD-style scope you chose), Gist-only (no concurrency safety on writes), Postgres on Supabase (project pause-on-inactivity breaks the "phone-flip at 2am" requirement).

## The user concern, addressed first

You said you've heard NoSQL databases like Firestore have poor performance for user data. Let's audit that claim directly because it's the reason you wanted a grill.

**Where the claim is half-right:**

- Firestore prices PER DOCUMENT READ. Free tier = 50k reads/day. If every page-render of every app reads the flag doc, you burn that on day one of any real traffic. CF KV is 100k reads/day AND its reads are 50ms at the edge vs Firestore's ~200ms cold reads from `asia-south1`.
- Firestore has NO joins. If a flag needs to know "is this user's tier Pro?", you do a second read. CF D1 does it in one SQL query.
- Firestore documents max at 1MB. Not a problem for flags but a real ceiling.
- Firestore real-time listeners (`onSnapshot`) burn reads continuously — fine for chat apps, expensive for a flag store.

**Where the claim is wrong:**

- Firestore is FINE for user PROFILES (a doc per user, infrequent reads). That's literally how Razorpay subscription mirrors work today and the cost is fine.
- "NoSQL is slow" as a blanket statement is folk wisdom from 2014. Firestore reads from the right region are sub-200ms, which is fine.

**Bottom line:** Firestore isn't BAD; it's just the WRONG tool for this specific job. Flags are a read-heavy, write-rare, small-dataset, latency-sensitive workload. That's a perfect fit for KV + D1, not Firestore.

## All four options, gridded

| Property | CF KV | CF D1 (SQLite at edge) | Firestore | GitHub gist |
|---|---|---|---|---|
| **Free tier reads** | 100k/day | 5M/day | 50k/day | unbounded |
| **Free tier writes** | 1k/day | 100k/day | 20k/day | unbounded (rate-limited) |
| **Read latency p50** | ~30ms edge | ~50ms primary region | ~150ms cold | ~200ms |
| **Strong consistency** | No (~60s) | Yes (per-region) | Yes | No (cache propagation) |
| **Schema / SQL** | No, KV only | Yes, SQLite | No, document store | No, raw JSON |
| **Targeting rules** | Hand-rolled | `WHERE` clauses | Hand-rolled | Hand-rolled |
| **Audit trail** | Not native | `flag_changes` table | Firestore audit logs (paid) | Gist commit history |
| **Built-in backups** | No | Time Travel 30d | Paid (~$0.18/GB-mo) | No |
| **Concurrency-safe writes** | Last-write-wins | Yes (txn) | Yes (txn) | No |
| **In our stack already** | Yes | Yes | Yes (auth + Razorpay) | Yes (gh CLI) |
| **Fits LD-style scope** | NO (KV is flat) | YES | Awkward | NO |

## Why D1 + KV + Gist (in that order)

**D1 as source-of-truth** because LD-style flags need SQL:

```sql
CREATE TABLE flags (
  key TEXT PRIMARY KEY,
  variant_type TEXT NOT NULL,          -- 'bool' | 'string' | 'number'
  default_variant TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  updated_by TEXT NOT NULL
);

CREATE TABLE flag_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  flag_key TEXT NOT NULL,
  priority INTEGER NOT NULL,
  segment_key TEXT NOT NULL,           -- 'tier:pro', 'uid_hash<5'
  variant TEXT NOT NULL,
  FOREIGN KEY (flag_key) REFERENCES flags(key) ON DELETE CASCADE
);

CREATE TABLE segments (
  key TEXT PRIMARY KEY,                -- 'tier:pro', 'beta-testers'
  rule_json TEXT NOT NULL              -- predicate spec
);

CREATE TABLE flag_changes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  flag_key TEXT NOT NULL,
  before_json TEXT NOT NULL,
  after_json TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  changed_at INTEGER NOT NULL
);
```

Targeting like "Pro users in India see variant A" is one SQL query in D1, three round-trips of Firestore reads, or hand-rolled JS for KV.

**KV as edge cache** because page renders need sub-100ms reads everywhere on Earth:

- Admin write → Worker updates D1 → Worker projects flags+rules into a single resolved tree → writes to KV at key `flags:tree:v1` with edge-cache TTL 60s.
- App page render reads `flags:tree:v1` from the closest CF PoP, evaluates the tree against `{uid, tier}` server-side, returns booleans/strings to HTML.
- KV is eventually-consistent globally (~60s), which is acceptable: a kill-switch flip propagates to all edges within a minute. Faster than CI builds, slower than D1 alone, but the latency saving for every page render is worth it.

**Gist as DR snapshot** because cloud providers fail and we promised redundancy:

- Scheduled Worker runs nightly at 02:30 UTC (07:30 IST), reads the full D1 state, writes JSON to a private gist.
- If CF KV dies: app code falls back to D1 directly (slower but works).
- If CF D1 dies: app code reads gist `https://gist.githubusercontent.com/.../flags-latest.json` (24h stale max, fine for a DR event).
- If both die: import gist into a new CF D1 with one CLI command and re-mirror to KV. RTO < 10 min.

## What we did NOT pick and why

**Firestore-only:** disqualified for source-of-truth role because LD-style targeting needs JOIN-shaped queries Firestore can't express. We already use Firestore for auth+billing; mixing flag concerns there would burn the 50k read/day on flag traffic alone.

**KV-only:** disqualified by the LD-style scope you chose. KV is a flat string-to-string map. Variants + segments + targeting rules need structure KV can't give without serializing/deserializing big JSON blobs on every read, which negates the latency advantage.

**Postgres on Supabase or Neon free tier:** both pause projects on inactivity (Supabase: 7 days no activity → cold-start; Neon: similar). Cold-start takes 5–30s. The whole point of runtime flags is the phone-flip-at-2am path. A 5-second cold-start on the flag service is acceptable for the FIRST flip but terrible for the page-render hot path. Disqualified.

**Cloudflare Durable Objects:** way overkill for this. DOs are for multi-actor coordination (chatrooms, locks). Flags don't need actors. Free tier exists but D1 is the cleaner shape.

**GitHub gist-only:** no concurrency-safe writes (last writer wins silently), no real query, no per-user targeting. Fine as a DR backup, not as the truth source.

## Free-tier headroom math

Worst case for v1 of oriz family: 30 apps × 100 page renders/day = 3,000 page renders/day, each reading the flag tree from KV once. = 3k KV reads/day. Free ceiling = 100k. Headroom: 33x.

Writes are admin-only: maybe 10 per week. Free D1 write ceiling: 100k/day. Free KV write ceiling: 1k/day. Both effectively infinite for this workload.

When traffic grows: at 100k page renders/day across the family, KV reads = 100k = the ceiling. The fix at that point is the Cache-Control header on the resolved tree (5-min edge cache) which drops Worker reads ~95%. That tweak is a one-line change. Not premature.

## Backup and redundancy summary

| Tier | What | Where | RPO | RTO |
|---|---|---|---|---|
| 1 | Source-of-truth | D1 | 0 (sync writes) | — |
| 2 | Read cache | KV | ~60s (TTL) | seconds (cache miss → D1) |
| 3 | DR snapshot | Private gist | 24h (nightly cron) | <10 min (import to new D1) |
| 4 | Code | git (this repo) | minutes | minutes (re-run setup script) |

The setup script lives at `scripts/cf-feature-flags-init.mjs` (to-build) and idempotently provisions D1 + KV + Worker from scratch. So even if the entire CF account is lost, we can re-create the flag service in under 5 minutes from any laptop.

## Operating runbook

**Daily check (manual, ~10s):**
- `https://account.oriz.in/admin/flags` opens — admin sees toggle list.
- Bottom of page shows: `Last DR snapshot: 02:30:42 IST (5h ago)`. If >36h, KV→D1→gist chain is broken; see "Diagnose stale snapshot" below.

**Phone-flip at 2am (THE use case):**
1. Open `account.oriz.in/admin/flags` on phone.
2. Sign in with Google (Firebase Auth checks `admin: true` custom claim).
3. Toggle `razorpay-checkout-enabled` → off.
4. Worker writes D1 + KV in <500ms.
5. All apps see the kill switch within ~60s.

**Diagnose stale DR snapshot:**
1. Check Worker logs: `wrangler tail flag-snapshot`.
2. If `403` from GitHub: rotate `FLAGS_SNAPSHOT_GIST_PAT` in CF Worker secrets.
3. If `D1: not found`: D1 connection broken; check binding in `wrangler.toml`.
4. Manual rebuild: `wrangler d1 export flags --output /tmp/flags.json && gh gist edit <id> /tmp/flags.json`.

**Recover from D1 loss:**
```bash
# 1. Re-create D1
wrangler d1 create flags
# 2. Re-create schema
wrangler d1 execute flags --file schema.sql
# 3. Import last snapshot
curl https://gist.githubusercontent.com/<USER>/<ID>/raw/flags-latest.json > flags.json
node scripts/cf-feature-flags-import.mjs flags.json
# 4. Force KV re-mirror
curl -X POST https://flags.oriz.in/admin/rebuild-kv \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Migration path (if we ever outgrow this)

Migrate to LaunchDarkly or Flagsmith ONLY when:
1. We have >100k DAU AND
2. We need cross-team flag management (we don't, single-developer family) AND
3. The savings in dev time > $400/mo (LD's cheapest paid tier).

Until all three are true, this stays the right shape. The `flag()` API we expose to apps is identical to what LD/Flagsmith expose, so the migration is a one-day swap of the implementation file in `astro-shell`. Documented in [[feature-flags-deferred]] as the original locked decision.

## Cross-refs

- Originally deferred (YAGNI) here → [[decisions/architecture/feature-flags-deferred]]; this runbook supersedes that decision now that the kill-switch + tier-gating use cases became live.
- Free-tier-with-cost-controls rule → [[rules/free-tier-with-cost-controls]] (D1+KV+Gist all stay under free tier even at 10x current traffic).
- Community-packages-first → [[rules/community-packages-first]] (we are NOT installing the OpenFeature SDK; ~200 lines of our own code is simpler than the OF abstraction).
