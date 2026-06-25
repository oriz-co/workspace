---
type: runbook
title: Migrate chirag127/* repos to oriz-org GitHub Organization (one-time)
description: 'Step-by-step: create the `oriz-org` GH Organization (both `oriz` and
  `oriz-in` were taken), transfer all 76 chirag127/* repos under it, set org-level
  secrets ONCE (61 keys), delete per-repo duplicates. Eliminates the 3,770-API-call
  sync storm and enables true org-level env management.'
tags:
- runbook
- github
- org
- migration
- secrets
- one-time
timestamp: 2026-06-22
format_version: okf-v0.1
status: "SUPERSEDED 2026-06-24 \u2014 org renamed oriz-co \u2192 oriz-org. See decisions/branding/oriz-org-rename-from-co.\
  \ The original migration (76 transfers, 61 org secrets, 0 failures) succeeded on\
  \ 2026-06-22; the rename in this superseding decision keeps all that work intact\
  \ via GitHub's auto-redirect."
related:
- rules/security/org-level-secrets-only-no-per-repo
- decisions/security/env-single-source-auto-push
- decisions/architecture/ops/mirror-to-4-git-hosts
- decisions/branding/oriz-org-rename-from-co
---



# Migrate chirag127/* → oriz-org Organization

**Status: COMPLETED 2026-06-22 evening.** 76 repos transferred (workspace + 75 oriz family submodules; the `Ai-rewrite` fork was excluded). 61 org-level secrets pushed to `oriz-org` with visibility=all. Per-repo cleanup script staged (`scripts/delete-per-repo-secrets.mjs`) but not yet run — schedule when convenient (~45 min wall clock).

One-time migration. Plain English checklist. Do these in order.

## Why

`chirag127` is a USER account, not an Organization. User accounts can't hold org-level secrets. Every env var must be set per-repo → 3,770 API calls per sync → hits 5K/hr rate limit → 88% success rate. Migrating to a real Org reduces that to 65 calls per sync.

## Pre-flight

- [ ] You have a GH PAT with `admin:org` + `repo` + `delete_repo` scopes (extend the existing `GH_ADMIN_PAT`)
- [ ] You're a member of the GH **Free** plan (Org is free for unlimited public repos)
- [ ] Disk space: every submodule's `.git/config` will need its remote URL updated (~58 entries)

## Step 1: Create the org

- [ ] Visit https://github.com/organizations/plan
- [ ] Select **Free** plan
- [ ] Org name: `oriz-org`
- [ ] Owner: `chirag127`
- [ ] Email: same as your GitHub email
- [ ] Visibility: Public (so repo URLs stay accessible)
- [ ] Click **Create organization**

## Step 2: Transfer repos (~58 repos, ~5 sec each)

For each `chirag127/<slug>` repo:

```bash
gh repo transfer chirag127/<slug> oriz-org
```

A 1-shot script `c:/D/oriz/scripts/migrate-to-oriz-org.mjs`:

```js
// Reads c:/D/oriz/.gitmodules → extracts every chirag127/<slug>
// For each: gh repo transfer chirag127/<slug> oriz-org --yes
// Logs success/skip/fail per repo
// Sleeps 200ms between calls to stay under rate limit
// Total: ~58 calls + 12 sec sleep = ~25 sec elapsed
```

Transfers are reversible within 24h. They preserve issues, stars, watchers, and forks (with fork redirects).

## Step 3: Update local submodule remotes

Every submodule URL in `.gitmodules` + `.git/modules/<sub>/config` references `chirag127/...`. After transfer, GH auto-redirects, but cleanest fix:

```bash
cd c:/D/oriz
# Update .gitmodules
sed -i 's|github.com/chirag127/|github.com/oriz-org/|g' .gitmodules
# Sync remotes
git submodule sync --recursive
# Also update each submodule's .git/config
git submodule foreach --recursive "git remote set-url origin \$(git remote get-url origin | sed 's|chirag127/|oriz-org/|')"
# Commit
git add .gitmodules
git commit -m "chore: migrate submodule URLs chirag127 → oriz-org org"
git push
```

## Step 4: Set 65 secrets at org level

Re-enable env-sync workflow (`.github/workflows/sync-env-to-org-secrets.yml`):

- Uncomment the `schedule:` block
- Change sync script: `gh secret set $KEY --org oriz-org --visibility all --body "$VAL"` (NOT `--repo`)
- Trigger one-time: `gh workflow run sync-env-to-org-secrets.yml --repo oriz-org/workspace`

This run is ~65 API calls + ~5 sec = done.

## Step 5: Delete per-repo duplicate secrets (optional cleanup)

A one-time script `c:/D/oriz/scripts/delete-per-repo-secrets.mjs`:

```js
// For each oriz-org/* repo, list per-repo secrets
// For each key that ALSO exists at org level: delete the per-repo copy
// Spreads ~2,705 deletes over ~6 hours (well under rate limit at 500/hr pace)
// Idempotent: skip if already deleted
```

Can run in background overnight. Doesn't block anything.

## Step 6: Update master config

In `c:/D/oriz/AGENTS.md` + `knowledge/`:

- [ ] Replace `chirag127/` references with `oriz-org/` where applicable (~150 files; do via sweep agent)
- [ ] Keep `chirag127` references where they document the user account (creator profile, GitHub Sponsors URL, etc.)

Sweep agent already exists for this kind of rename — reuse the lore-rename pattern.

## Step 7: Verify

- [ ] `gh repo view oriz-org/oriz-ncert-app` returns 200 (transfer succeeded)
- [ ] `gh secret list --org oriz-org` shows 65 secrets
- [ ] Any random workflow run in any oriz-org/* repo → check that it reads secrets correctly
- [ ] CF Pages auto-deploys (GH webhooks should follow the transfer automatically)
- [ ] npm packages — package.json `"repository"` field references chirag127/...; GH redirects work but for cleanliness, update + republish minor versions

## Rollback plan

If something breaks:

- [ ] `gh repo transfer oriz-org/<slug> chirag127` — reverses each transfer
- [ ] Restore `.gitmodules` from `git diff HEAD~1 -- .gitmodules`
- [ ] Re-enable per-repo secrets sync (worst case)

Reversal is fully supported by GitHub within 24h. After 24h, ownership-change becomes harder but not impossible.

## Cross-refs

- The rule this implements → [[rules/org-level-secrets-only-no-per-repo]]
- Env single-source decision → [[decisions/security/env-single-source-auto-push]]
- Mirror cron (4 hosts) updates with new URLs → [[decisions/architecture/mirror-to-4-git-hosts]]
