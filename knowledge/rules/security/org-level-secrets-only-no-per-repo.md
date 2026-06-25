---
type: rule
title: "Env vars live at GitHub ORG level only \u2014 per-repo secrets FORBIDDEN"
description: 'User mandate 2026-06-22 evening: ''Don''t hit the GitHub API so many
  times. Requests have to be made only on the organization level, not to the individual
  repositories. The CI/CD pipelines will use the global environment variables only.''
  Per-repo secret writes are forbidden (cause 2,730+ API calls per sync; hit 5K/hr
  rate limit). Migration to GH Org `oriz-org` COMPLETED 2026-06-22 (76 repos transferred,
  61 org secrets pushed). Repository destination: github.com/oriz-org/<slug>.'
tags:
- rule
- env
- secrets
- org-level
- rate-limit
- no-per-repo
- github
timestamp: 2026-06-22
format_version: okf-v0.1
status: active (migration COMPLETED 2026-06-22)
supersedes_in_part: decisions/security/env-single-source-auto-push
related:
- decisions/security/env-single-source-auto-push
- rules/security/github-org-level-secrets
- rules/interaction/never-hit-quotas
- rules/interaction/no-card-on-file
---



# Org-level secrets only — no per-repo

## Rule

Env vars are pushed to **GitHub ORG-level secrets** with `--visibility all`. NEVER to per-repo secrets.

Per-repo `gh secret set --repo <name>` is **FORBIDDEN** because:

- A 65-env-var × 58-repo sweep = 3,770 API calls
- GitHub Free tier rate limit: 5,000 req/hr
- Single sync run hits the limit + fails on 12% of repos
- Per-repo secrets also create a fan-out maintenance burden (rotation = N×M API calls)

CI/CD pipelines in any oriz-org repo MUST inherit from org-level secrets, not local repo secrets.

## Migration status (COMPLETED 2026-06-22 evening)

- `oriz-org` GH Organization created (both `oriz` and `oriz-in` were taken)
- 76 repos transferred from `chirag127/*` → `oriz-org/*` (workspace + 75 family submodules; `Ai-rewrite` fork excluded)
- 61 org-level secrets pushed via `scripts/sync-env-to-org-secrets.mjs` (visibility=all)
- Cron re-enabled: `.github/workflows/sync-env-to-org-secrets.yml` now runs daily at 01:30 UTC
- Per-repo duplicate cleanup script staged: `scripts/delete-per-repo-secrets.mjs` (run when convenient; ~45 min wall clock for ~2,705 deletes; idempotent)

## Path forward: org migration

1. Create new GH Organization `oriz-org` (free tier, no card) — `oriz` + `oriz-in` were taken
2. Transfer all 58 `chirag127/*` repos under `oriz-org/` namespace
   - Each `gh repo transfer chirag127/<slug> oriz-org/<slug>` (~58 calls; one-time)
3. Set 65 secrets at `oriz-org` org level (`gh secret set <KEY> --org oriz-org --visibility all`) — 65 calls total
4. Workflows automatically inherit
5. Delete per-repo secrets via cleanup script (one-time, ~2,705 calls; can be paused/resumed)

## Migration runbook

See `c:/D/oriz/knowledge/runbooks/migrate-to-oriz-org.md` (TO BE WRITTEN — comprehensive step-by-step).

## What changes for the rule scope

| Before | After |
|---|---|
| `gh secret set <KEY> --repo chirag127/<slug>` | `gh secret set <KEY> --org oriz-org --visibility all` |
| 3,770 API calls per sync | 65 calls per sync |
| Hits 5K/hr rate limit | Well under limit |
| Per-repo cleanup needed on key rotation | One-shot org update |

## Why not "stay on user account"

User accounts work for ~10 repos. At 58 repos, the per-repo model is fundamentally broken (rate limit + maintenance + audit complexity). Migration is the correct fix.

## Org name decision

Picked `oriz-org` after `oriz` and `oriz-in` were both taken on 2026-06-22 evening. NOT `chirag127-org` (would create branding split). The user's PERSONAL profile stays at `chirag127`; only the project repos move. Repository transfer destination: `github.com/oriz-org/<slug>`.

## Cross-refs

- Env single-source auto-push (decision, original) → [[decisions/security/env-single-source-auto-push]]
- GitHub org-level secrets rule → [[rules/github-org-level-secrets]]
- Never hit quotas → [[rules/never-hit-quotas]]
- No card on file → [[rules/no-card-on-file]]
