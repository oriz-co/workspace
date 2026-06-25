---
type: decision
title: Mirror every chirag127/oriz* repo to 4 git hosts weekly
description: Insurance against GitHub becoming unusable. Master umbrella runs a Friday-4am-IST
  cron that pushes every submodule's HEAD to GitLab.com + Codeberg.org + Bitbucket
  + GitFlic.ru. Each mirror is push-only (read-from-GH-write-to-mirror). If a mirror
  fails, others still succeed.
tags:
- decision
- mirror
- insurance
- git-host
- backup
- multi-platform
timestamp: 2026-06-21
format_version: okf-v0.1
status: superseded
superseded_by: decisions/architecture/mirror-to-6-git-hosts
related:
- rules/interaction/no-card-on-file
- runbooks/master-mirror-cron
- runbooks/migrate-from-github
---



# Mirror every chirag127/oriz* repo to 4 git hosts weekly

## Decision

**Master umbrella runs ONE weekly cron workflow that pushes every submodule's HEAD to 4 mirror hosts**: GitLab.com, Codeberg.org, Bitbucket, GitFlic.ru. Submodules don't carry the mirror workflow individually — master owns it for simplicity (1 workflow vs 41).

## Why

GitHub is the family's primary git host. If GitHub becomes unusable (account suspension, regional ban, ToS dispute, acquisition, outage), the family loses 41 repos worth of work unless they're mirrored elsewhere. The 4-host mirror is **insurance, not active use** — the mirrors are write-only from GitHub; pulls + reviews + Actions still happen on GitHub.

4 hosts chosen because:

1. **GitLab.com** — biggest GitHub alternative, has its own CI runners as failover ([[runbooks/migrate-ci-platform]])
2. **Codeberg.org** — FOSS-mission backup (Forgejo), independent of corporate ownership
3. **Bitbucket** — Atlassian-backed, geographic + corporate diversity
4. **GitFlic.ru** — Russian-hosted, geopolitical diversity. NOTE: sanctions risk if user is in a sanctioned country; verify access from chirag127's location.

## How it works

`c:/D/oriz/.github/workflows/mirror-all.yml` runs on cron `0 22 * * 4` (Thursday 22:00 UTC = Friday 03:30 IST). Steps per run:

1. Checkout master with `submodules: recursive`
2. For each of the 4 mirror hosts:
   - For each submodule path:
     - Add mirror as remote: `git remote add <host> <url>`
     - Push: `git push <host> --mirror --force-with-lease`
   - Aggregate success/failure per host
3. Post a single Telegram message to the family channel: "Mirror cron: GH→GitLab ✓, GH→Codeberg ✓, GH→Bitbucket ✓, GH→GitFlic ✗ (rate limit)"

Idempotent — if HEAD hasn't changed, push is a no-op.

If a host returns 4xx/5xx repeatedly (3 consecutive Fridays), an issue is opened in master automatically with the host name + error.

## Env vars (all at chirag127 org-level GH Actions secrets)

| Var | Source | Used by |
|---|---|---|
| `GITLAB_TOKEN` | Personal Access Token from gitlab.com → Settings → Access Tokens → write_repository scope | Mirror push to GitLab |
| `CODEBERG_TOKEN` | App password from codeberg.org → Settings → Applications → write:repository | Mirror push to Codeberg |
| `BITBUCKET_APP_PASSWORD` | App Password from bitbucket.org → Personal settings → App passwords → Repositories write | Mirror push to Bitbucket |
| `GITFLIC_TOKEN` | Personal token from gitflic.ru → Settings → Tokens → repo:write | Mirror push to GitFlic |

Sync to `c:/D/oriz/templates/.env.example` per [[env-and-secrets-single-source]].

## Mirror repo URLs (pre-create these once)

For each chirag127/oriz* repo, create the matching repo on each host with name `<repo>`. Bulk-creation script:

- GitLab: `glab repo create chirag127/<repo> --public --description "Mirror of github.com/chirag127/<repo>"`
- Codeberg: web UI (no CLI as of 2026); or via Forgejo API
- Bitbucket: web UI or `curl -X POST -u USER:APP_PWD ...`
- GitFlic: web UI (Russian Cyrillic interface)

After all 4 mirrors exist for a repo, the cron does the actual pushing.

## What this is NOT

- **Not active development**: mirrors are read-only from a workflow perspective. Don't edit there.
- **Not a CI failover yet**: separate concern — see [[runbooks/migrate-ci-platform]].
- **Not protection against credential compromise**: if your GitHub token is leaked, the leaker can also push malicious commits to GitHub which the cron mirrors. Mirrors only protect against GitHub-the-platform failure, not authenticated-actor failure.

## Cross-refs

- Migrate to fallback CI when GH Actions becomes unusable → [[runbooks/migrate-ci-platform]]
- The runbook for the cron itself → [[runbooks/master-mirror-cron]]
- Migrate AWAY FROM GitHub entirely if needed (full plan B) → [[runbooks/migrate-from-github]]
- Env-vars + GH secrets pattern → [[env-and-secrets-single-source]]
