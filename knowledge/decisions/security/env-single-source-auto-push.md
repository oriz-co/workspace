---
type: decision
title: "Single env source: c:/D/oriz/.env → auto-push to chirag127 GH Org Secrets → apps consume at build"
description: "User mandate 2026-06-22 evening: minimum manual env-var setting. Master `c:/D/oriz/.env` is the single source of truth for every env var used by every app, package, API, extension, CLI, MCP server, skill, book pipeline, and CI workflow in the chirag127/oriz family. A scheduled GH Action periodically (daily 06:30 IST) reads `templates/.env.example` keys from master + corresponding values from `c:/D/oriz/.env` and pushes them to chirag127 GitHub ORG Secrets (`--visibility all`) so every repo's workflows see them. Apps consume env vars via `process.env.*` at build time from GH Secrets. ZERO per-repo manual secret setting."
tags: [decision, env, secrets, single-source, automation, gh-org-secrets, minimum-manual]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
supersedes_in_part: decisions/security/env-and-secrets-single-source
related:
  - decisions/security/env-and-secrets-single-source
  - rules/github-org-level-secrets
  - rules/env-example-synced-from-master
  - rules/no-hardcoded-secrets
---

# Single env source: c:/D/oriz/.env → GH Org Secrets

## Decision

`c:/D/oriz/.env` (gitignored on master) is the **single, authoritative source** of every secret + config value used anywhere in the chirag127/oriz family.

A scheduled cron (`.github/workflows/sync-env-to-org-secrets.yml` on master) runs daily at 06:30 IST (or on-demand workflow_dispatch when `c:/D/oriz/.env` changes):

1. Reads `templates/.env.example` to enumerate canonical key names
2. For each key, reads the corresponding value from `c:/D/oriz/.env` (loaded via secure GH-Action secret OR encrypted file — see "Bootstrapping" below)
3. Pushes each value to chirag127 GH Org Secrets: `gh secret set <KEY> --org chirag127 --visibility all --body "<VALUE>"`
4. Every repo's workflows + builds inherit the org secret automatically (no per-repo setup)

User mandate verbatim (2026-06-22 evening): "I want to set the single token for all of the authentication and all of the monetization and all of the everything. I want minimum number of environment variable to be set. ... I will set them only one time. Throughout the organization of my GitHub. ... The builder will generate the website and deploy it on whatever server or this repository's .env file will also be served as a single source of truth for all of the environment variables. You will periodically push all of the environment variable from this repository to GitHub. ... I don't want to set environment variable manually for all of the apps and all of the websites."

## Bootstrap (one-time, manual — minimum manual work)

You manually populate `c:/D/oriz/.env` ONCE with the canonical values (~50-80 env vars total). Then never touch them per-repo again.

To run the sync script the first time:

1. Generate a chirag127 GH Personal Access Token with `admin:org` scope (one-time, 1-year expiry)
2. Add it to `c:/D/oriz/.env` as `GH_ADMIN_PAT=ghp_...`
3. Run `node scripts/sync-env-to-org-secrets.mjs` locally — this pushes all current keys to org-level secrets
4. After local verification, the GH Action takes over on the daily cron

## Sync script

`c:/D/oriz/scripts/sync-env-to-org-secrets.mjs`:

```js
// 1. Parse templates/.env.example for canonical key names
// 2. Parse c:/D/oriz/.env for values
// 3. For each key, call: gh secret set <KEY> --org chirag127 --visibility all
// 4. Report diff (keys added, updated, deleted)
```

## Bootstrapping the GH Action

The cron workflow needs access to `c:/D/oriz/.env` itself. Options:

A. **encrypted-file approach (RECOMMENDED):** encrypt `.env` with `age` or `sops`, commit the encrypted blob to master, decrypt in GH Action using a single bootstrap key stored as `SOPS_AGE_KEY` org secret. One bootstrap secret → unlimited derived secrets.

B. **manual-paste approach:** GH Action accepts the .env content as an input on workflow_dispatch; you paste it once + it pushes all keys. Re-paste only when keys rotate.

Choosing (A): encrypted-file. Use `sops` + `age`. The unencrypted .env stays gitignored locally; the encrypted `.env.enc` is committed to master.

## Consuming env vars in app builds

Every app's CF Pages build inherits chirag127 org secrets automatically. Apps reference `process.env.RAZORPAY_KEY_ID` etc. — no per-app setup needed.

For client-side env vars (PUBLIC_*), Astro embeds them at build time via `import.meta.env.PUBLIC_*`. Same single source.

## Implications

- **Secret rotation**: change once in `c:/D/oriz/.env` + commit the new encrypted file → wait for daily cron OR trigger workflow_dispatch → all 51+ repos rotated simultaneously
- **New secret**: add to `templates/.env.example` (key + comment) + add value to `c:/D/oriz/.env` + sync → instantly available org-wide
- **Audit**: master commit log = secret rotation history
- **No drift**: per-repo manual secret writes are FORBIDDEN per `rules/github-org-level-secrets.md` (already locked)

## Supersedes-in-part

`decisions/security/env-and-secrets-single-source.md` — that file describes the two-track delivery (`.env.example` synced + GH Actions secrets set once). This file extends it with the AUTOMATED periodic-sync mechanism (was implicit; now explicit).

## Cross-refs

- Env+secrets two-track decision → [[decisions/security/env-and-secrets-single-source]]
- GH org-level secrets rule → [[rules/github-org-level-secrets]]
- .env.example synced rule → [[rules/env-example-synced-from-master]]
- No hardcoded secrets → [[rules/no-hardcoded-secrets]]

## Status: deployed 2026-06-22

First-run results (local bootstrap, 2026-06-22):

- `sops` 3.12.2 installed via winget `SecretsOPerationS.SOPS` at `C:\Users\C5420321\AppData\Local\Microsoft\WinGet\Packages\SecretsOPerationS.SOPS_*\sops.exe`
- `age` 1.3.1 installed via winget `FiloSottile.age` at `C:\Users\C5420321\AppData\Local\Microsoft\WinGet\Packages\FiloSottile.age_*\age\age.exe`
- Age keypair generated at `c:/D/oriz/.sops-age-key.txt` (gitignored). Public key: `age1c40qjamejzrp9cajle9g0dss25mmsmyaq6uaa2pgmyr3pflsy4qspgw5c4`
- `c:/D/oriz/.env` (128 lines, 65 key=value pairs) encrypted → `c:/D/oriz/.env.enc` (committed)
- `SOPS_AGE_KEY` pushed to `chirag127/workspace` as a **repo-level** bootstrap secret (CI reads it from there)
- **Scope correction**: `chirag127` is a GitHub **User** account, not an Organization. Org-level secrets unavailable. Pivoted to **per-repo Actions secrets** across the oriz family (workspace + every `oriz-*` repo = 42 repos). The script `scripts/sync-env-to-org-secrets.mjs` fans out automatically.
- First sync pushed **31 secrets × 42 repos = 1302 repo-level secrets** plus 1 bootstrap = **1335 total**, 0 failures.
- One canonical key skipped automatically: `GITHUB_TOKEN` (reserved name; GitHub auto-injects per workflow run). The script now hard-rejects `GITHUB_TOKEN` and any `GITHUB_*` / `ACTIONS_*` prefix.
- Cron: `30 1 * * *` UTC (06:30 IST) daily, plus `workflow_dispatch` and push triggers on `.env.enc` / `templates/.env.example` / sync script changes.
- Manual user step **still required**: generate a PAT with `repo` scope at https://github.com/settings/tokens and run `gh secret set GH_ADMIN_PAT --repo chirag127/workspace --body "ghp_..."`. The workflow fails fast with a clear error until that PAT is set.
- 21 keys exist in `.env.enc` but are **not** in `templates/.env.example` (e.g. `BING_SEARCH_API_KEY`, `APPWRITE_*`, `SSH_PRIVATE_KEY`). They are listed by the script as warnings and **not pushed** until added to `.env.example`. Reconciling this drift is a follow-up task.
