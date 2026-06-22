---
type: rule
title: "Env vars live at GitHub ORG level only — per-repo secrets FORBIDDEN"
description: "User mandate 2026-06-22 evening: 'Don't hit the GitHub API so many times. Requests have to be made only on the organization level, not to the individual repositories. The CI/CD pipelines will use the global environment variables only.' Per-repo secret writes are forbidden (cause 2,730+ API calls per sync; hit 5K/hr rate limit). Path forward: migrate chirag127/* repos to a real GH Org (`oriz`) so org-level secrets become available. Until migration, env-sync cron is PAUSED."
tags: [rule, env, secrets, org-level, rate-limit, no-per-repo, github]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
supersedes_in_part: decisions/security/env-single-source-auto-push
related:
  - decisions/security/env-single-source-auto-push
  - rules/github-org-level-secrets
  - rules/never-hit-quotas
  - rules/no-card-on-file
---

# Org-level secrets only — no per-repo

## Rule

Env vars are pushed to **GitHub ORG-level secrets** with `--visibility all`. NEVER to per-repo secrets.

Per-repo `gh secret set --repo <name>` is **FORBIDDEN** because:

- A 65-env-var × 58-repo sweep = 3,770 API calls
- GitHub Free tier rate limit: 5,000 req/hr
- Single sync run hits the limit + fails on 12% of repos
- Per-repo secrets also create a fan-out maintenance burden (rotation = N×M API calls)

CI/CD pipelines in any chirag127 repo MUST inherit from org-level secrets, not local repo secrets.

## Pre-migration state (2026-06-22)

`chirag127` is currently a **User account**, not a GH Organization. User accounts can't have org-level secrets. The env-sync workflow was fanning out per-repo (3,068 calls/run, 88% success rate, 363 transient failures from rate limit).

**Cron is PAUSED** as of 2026-06-22 evening (see `.github/workflows/sync-env-to-org-secrets.yml` — `schedule:` block commented out).

## Path forward: org migration

1. Create new GH Organization `oriz` (free tier, no card)
2. Transfer all 58 `chirag127/*` repos under `oriz/` namespace
   - Each `gh repo transfer chirag127/<slug> oriz/<slug>` (~58 calls; one-time)
3. Set 65 secrets at `oriz` org level (`gh secret set <KEY> --org oriz --visibility all`) — 65 calls total
4. Workflows automatically inherit
5. Delete per-repo secrets via cleanup script (one-time, ~2,705 calls; can be paused/resumed)

## Migration runbook

See `c:/D/oriz/knowledge/runbooks/migrate-to-oriz-org.md` (TO BE WRITTEN — comprehensive step-by-step).

## What changes for the rule scope

| Before | After |
|---|---|
| `gh secret set <KEY> --repo chirag127/<slug>` | `gh secret set <KEY> --org oriz --visibility all` |
| 3,770 API calls per sync | 65 calls per sync |
| Hits 5K/hr rate limit | Well under limit |
| Per-repo cleanup needed on key rotation | One-shot org update |

## Why not "stay on user account"

User accounts work for ~10 repos. At 58 repos, the per-repo model is fundamentally broken (rate limit + maintenance + audit complexity). Migration is the correct fix.

## Org name decision

Picked `oriz` (matches family brand). NOT `chirag127-org` (would create branding split). The user's PERSONAL profile stays at `chirag127`; only the project repos move.

## Cross-refs

- Env single-source auto-push (decision, original) → [[decisions/security/env-single-source-auto-push]]
- GitHub org-level secrets rule → [[rules/github-org-level-secrets]]
- Never hit quotas → [[rules/never-hit-quotas]]
- No card on file → [[rules/no-card-on-file]]
