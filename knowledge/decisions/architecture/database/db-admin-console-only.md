---
type: decision
title: "DB admin \u2014 console-only, no desktop DB tool"
description: "Every database in the family is administered through its vendor's browser\
  \ console (Firebase Console, Neon Console) or its first-party CLI (Turso CLI, libSQL\
  \ CLI). NO desktop DB tool \u2014 Drizzle Studio / Outerbase / Beekeeper Studio\
  \ / TablePlus all REJECTED. Zero install footprint, every team member can access\
  \ via browser, no per-user license."
tags:
- decisions
- architecture
- db
- admin
- console
- firebase
- neon
- turso
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/auth/firebase-spark
- services/database/turso
- services/database/neon-postgres
- decisions/architecture/database/db-add-neon-postgres
- decisions/architecture/database/firebase-rest-firestore-not-admin
- rules/interaction/no-card-on-file
- rules/infrastructure/no-subscriptions
---



# DB admin — console-only, no desktop DB tool

## Decision

Every database in the family's
[4-tier DB stack](./db-add-neon-postgres.md) is administered
**through its vendor's browser console** (or, for libSQL, its
first-party CLI). NO desktop DB tool of any kind installed
family-wide.

| Tier | Admin surface |
|---|---|
| [Firestore on Firebase Spark](../../../services/auth/firebase-spark.md) | [console.firebase.google.com](https://console.firebase.google.com/) — browser |
| JSONL canonical (in `oriz-me-data`) | A text editor — `git` is the admin layer |
| [Turso libSQL](../../../services/database/turso.md) | `turso db shell <name>` (Turso CLI) + `libsql-client` SQL prompts |
| [Neon Postgres](../../../services/database/neon-postgres.md) | [console.neon.tech](https://console.neon.tech/) — browser SQL editor |

REJECTED desktop tools:

- **Drizzle Studio** — bundles its own electron-ish runtime; per-machine install; no value-add over Neon Console for ad-hoc queries
- **Outerbase** — SaaS DB UI; free tier exists but signup adds another vendor surface; capability already covered by vendor consoles
- **Beekeeper Studio** — desktop OSS GUI; would need to be installed + auth-configured on every dev machine
- **TablePlus / DataGrip / DBeaver** — paid or per-seat or large install; fights [`rules/no-subscriptions.md`](../../../rules/infrastructure/no-subscriptions.md)

## Why

- **Zero install footprint.** Every team member already has a
  browser; nobody needs to install + auth-configure a new tool to
  poke at a table. The same posture as
  [markdown-in-repo authoring](../general/cms-markdown-in-repo-only.md):
  the lightest possible tool that does the job is the right tool.
- **No per-user license / no card.** Neon Console and Firebase
  Console are bundled with the existing free accounts. A separate
  GUI tool would either be paid (TablePlus / DataGrip) or add
  another vendor surface that needs ongoing
  permission/billing attention (Outerbase) — both cut against
  [`rules/no-card-on-file.md`](../../../rules/interaction/no-card-on-file.md) +
  [`rules/no-subscriptions.md`](../../../rules/infrastructure/no-subscriptions.md).
- **Browsers are the family-default surface anyway.** All 11+ sites
  are static SPAs deploying through browser-side dashboards (CF
  Pages, GitHub, Better Stack, Sentry, PostHog). Adding ONE more
  browser tab for DB admin is zero friction; adding a desktop tool
  is a meaningful new capability surface.
- **Read-only browsing is rare.** The hot-path dev surface is the
  Hono Worker handlers + the Drizzle / `@neon/serverless` queries
  in `apps/<app>/src/db/`. Ad-hoc inspection lives in the Neon
  Console SQL editor or `turso db shell` — both fit "I want to
  poke at a row" workflows.

## Implications

### Day-to-day admin

- **Firestore writes / rule edits** — Firebase Console (browser).
- **Neon ad-hoc SQL / migrations / branch management** — Neon
  Console SQL editor (browser) for one-off queries; programmatic
  migrations live in the app's `apps/<app>/migrations/` folder
  driven by the app's chosen migration tool (e.g. `drizzle-kit`,
  `node-pg-migrate`).
- **Turso libSQL** — `turso db shell <name>` for ad-hoc; the
  warm-cache rebuild job runs from a [GitHub Actions
  schedule](../../../services/cron/github-actions-schedule.md) per the
  [JSONL canonical decision](./lifestream-jsonl-canonical.md).
- **JSONL canonical** — `git log` + a text editor. The store IS
  source-controlled.

### Tooling that stays even though we don't use desktop GUIs

- Drizzle ORM stays in app code as the type-safe query layer for
  Neon / libSQL. **Drizzle Studio specifically (the optional UI) is
  REJECTED** — Drizzle ORM's CLI (`drizzle-kit`) for migrations
  stays.
- `psql` and `sqlite3` CLIs are fine to install ad-hoc on a dev
  machine for one-off scripting, but neither is required tooling
  family-wide.

### Security

- Admin auth follows each vendor's existing flow:
  - Firebase Console — Google account on the `oriz-app` Firebase project
  - Neon Console — Google account / GitHub account
  - Turso CLI — `turso auth login` (browser-redirect OAuth)
- No DB credentials live on developer machines beyond the dev
  `.env` for `pnpm dev`. The umbrella Hono Worker reads connection
  strings from
  [Doppler](../../../services/secrets/doppler.md) per
  [secrets-management-doppler](../../security/secrets-management-doppler.md).

### What we don't do

- **No desktop GUI tool installed on any dev machine** — see the
  REJECTED list above.
- **No web-hosted DB GUI added** to the stack on top of vendor
  consoles (Outerbase / Arctype-style tools).
- **No "admin" subdomain / Hono Worker route** that exposes DB
  admin in the browser. The vendor's own console is always the
  right surface.

## Cross-refs

- [4-tier DB stack decision](./db-add-neon-postgres.md)
- [Neon Postgres service](../../../services/database/neon-postgres.md)
- [Turso libSQL service](../../../services/database/turso.md)
- [Firebase Spark — Auth + Firestore](../../../services/auth/firebase-spark.md)
- [firebase-rest-firestore decision (Worker compat)](./firebase-rest-firestore-not-admin.md)
- [Lifestream JSONL canonical](./lifestream-jsonl-canonical.md)
- [Markdown-in-repo only — same minimal-tool posture](../general/cms-markdown-in-repo-only.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
- [No subscriptions rule](../../../rules/infrastructure/no-subscriptions.md)
