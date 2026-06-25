---
type: decision
title: "Mirror every oriz-org + chirag127 repo to 6 git hosts \u2014 automated, weekly\
  \ + daily"
description: "Extends mirror-to-4-git-hosts (2026-06-21) to 6 hosts by adding Azure\
  \ DevOps and AWS CodeCommit. Also fixes Bitbucket from deprecated App Passwords\
  \ to API Tokens. Adds chirag127 personal repos (not just submodules from .gitmodules)\
  \ to the mirror scope. All automated via GitHub Actions \u2014 zero manual steps\
  \ after one-time setup."
tags:
- decision
- mirror
- insurance
- git-host
- backup
- multi-platform
- disaster-recovery
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
supersedes: decisions/architecture/mirror-to-4-git-hosts
related:
- rules/interaction/no-card-on-file
- rules/infrastructure/free-tier-with-cost-controls
- runbooks/hosting/mirror-all-hosts-setup
- services/hosting/gitlab-mirror
- services/hosting/codeberg-mirror
- services/hosting/bitbucket-mirror
- services/hosting/gitflic-mirror
- services/hosting/azure-devops-mirror
- services/hosting/codecommit-mirror
---



# Mirror every oriz-org + chirag127 repo to 6 git hosts

## Decision

**Two automated GitHub Actions workflows** push every repo to 6 mirror
hosts on schedule — fully automated, zero manual sync steps:

| Workflow | Schedule | Scope | Hosts |
|---|---|---|---|
| `mirror-all.yml` | Friday 03:30 IST (Thu 22:00 UTC) | oriz-org submodules + chirag127 personal repos | All 6 hosts |
| `codeberg-mirror.yml` | Daily 08:30 IST (03:00 UTC) | oriz-org repos | Codeberg only (extra daily DR) |

## The 6 Mirror Hosts

| # | Host | Free? | Token Type | Env Var | Diversity |
|---|---|---|---|---|---|
| 1 | **GitLab.com** | ✅ Unlimited repos, 10 GiB/project | PAT (`api` + `write_repository`) | `MIRROR_GITLAB_TOKEN` | Largest GH alternative, own CI |
| 2 | **Codeberg.org** | ✅ Free, non-profit, Forgejo | Access token (`write:repository`) | `MIRROR_CODEBERG_TOKEN` | FOSS-mission, no VC backing |
| 3 | **Bitbucket Cloud** | ✅ Unlimited repos, 1 GB ws | Workspace Access Token (⚠️ API Token, NOT App Password) | `MIRROR_BITBUCKET_API_TOKEN` | Atlassian-backed, enterprise |
| 4 | **GitFlic.ru** | ✅ Free + built-in pull mirror | Personal token | `MIRROR_GITFLIC_TOKEN` | Russian hosting, geopolitical diversity |
| 5 | **Azure DevOps** | ✅ Unlimited repos, 5 users free | PAT (org-scoped, Code: Manage) | `MIRROR_AZURE_DEVOPS_TOKEN` | Microsoft-backed |
| 6 | **AWS CodeCommit** | ✅ 5 users, 50 GB, 10K req/mo | IAM HTTPS Git Credentials | `MIRROR_CODECOMMIT_USERNAME` + `MIRROR_CODECOMMIT_PASSWORD` | AWS-backed, 20+ global regions |

## Changes from `mirror-to-4-git-hosts` (2026-06-21)

1. **+2 hosts added**: Azure DevOps (#5) and AWS CodeCommit (#6)
2. **Bitbucket auth fixed**: App Passwords retired July 28, 2026 → now using `MIRROR_BITBUCKET_API_TOKEN` (Workspace Access Token)
3. **Scope expanded**: `mirror-all.yml` now mirrors both oriz-org submodules AND `chirag127` personal repos (via `gh repo list chirag127`)
4. **AWS CodeCommit clarification**: Returned to full GA on November 24, 2025 (was briefly restricted mid-2024)

## Platform Research Outcomes — What Was Evaluated and Rejected

| Platform | Verdict | Reason |
|---|---|---|
| SourceHut (sr.ht) | ❌ Rejected | €4+/month, no free tier — violates `no-card-on-file` rule |
| Google Cloud Source Repos | ❌ Rejected | Closed to new users since June 17, 2024 |
| Gitee (gitee.com) | ❌ Rejected | Requires Chinese phone number for registration |
| Framagit (framagit.org) | ❌ Rejected | 42-project hard cap + manual moderation approval + mirroring may violate ToS |
| NotABug.org | ❌ Rejected | Outdated Gogs fork, chronic instability, unreliable API |
| Gitea Cloud (cloud.gitea.com) | ❌ Rejected | No free tier (30-day trial only) |
| GitVerse.ru | ⚠️ Optional extra | Unlimited free repos, 1 GB, Russian platform — lower priority geopolitical risk. Not in primary workflow. |
| Radicle | ⚠️ Experimental | Decentralized P2P, different paradigm, not traditional git host. Optional per-repo if needed. |
| Launchpad | ⚠️ Niche | Free for FOSS, automatic pull-mirror via Code Import, but Ubuntu-ecosystem focused. |

## How it Works

### `mirror-all.yml` — 6-host weekly cron

```
Friday 03:30 IST (Thursday 22:00 UTC)
├── Job: discover-repos (lists chirag127 personal + oriz-org repos via gh CLI)
├── Job: mirror-gitlab    ─────────────────────────────────────────────────── matrix: all repos
├── Job: mirror-codeberg  ─────────────────────────────────────────────────── matrix: all repos
├── Job: mirror-bitbucket ─────────────────────────────────────────────────── matrix: all repos
├── Job: mirror-gitflic   ─────────────────────────────────────────────────── matrix: all repos
├── Job: mirror-azure     ─────────────────────────────────────────────────── matrix: all repos
├── Job: mirror-codecommit ────────────────────────────────────────────────── matrix: all repos
└── Job: weekly-digest    (Telegram notification: 6-host summary)
```

Each mirror job:
1. Checks if mirror repo exists on target; creates it if missing (idempotent)
2. Clones source repo with `--mirror` flag (includes all branches/tags/refs)
3. Pushes to target with `git push --mirror --force-with-lease`
4. Reports ✓ or ✗ per repo to status file
5. Posts per-host count to Telegram

### `codeberg-mirror.yml` — Daily Codeberg DR mirror

```
Daily 03:00 UTC (08:30 IST)
└── Mirror all oriz-org repos to codeberg.org/oriz-org (idempotent, creates if missing)
```

This is the primary DR workflow — runs daily for faster recovery if GitHub
is unavailable. Codeberg is the first rescue host.

## Env Vars Required (all at chirag127 org-level GitHub Secrets)

```bash
# GitLab
MIRROR_GITLAB_TOKEN=             # PAT: api + write_repository scopes
MIRROR_GITLAB_USERNAME=          # gitlab.com username

# Codeberg
MIRROR_CODEBERG_TOKEN=           # Access token: write:repository scope
MIRROR_CODEBERG_USERNAME=        # codeberg.org username

# Bitbucket (API Token — NOT App Password)
MIRROR_BITBUCKET_API_TOKEN=      # Workspace Access Token: Repositories Write
MIRROR_BITBUCKET_USERNAME=       # bitbucket.org username / workspace slug

# GitFlic
MIRROR_GITFLIC_TOKEN=            # Personal token: repo:write scope

# Azure DevOps
MIRROR_AZURE_DEVOPS_TOKEN=       # PAT (org-scoped, Code: Manage)
MIRROR_AZURE_DEVOPS_ORG=         # Azure DevOps org name
MIRROR_AZURE_DEVOPS_PROJECT=     # Azure DevOps project name (e.g. mirrors)

# AWS CodeCommit
MIRROR_CODECOMMIT_USERNAME=      # IAM HTTPS Git Credentials username
MIRROR_CODECOMMIT_PASSWORD=      # IAM HTTPS Git Credentials password
MIRROR_CODECOMMIT_REGION=        # AWS region (e.g. us-east-1)
MIRROR_AWS_ACCESS_KEY_ID=        # For aws codecommit create-repository
MIRROR_AWS_SECRET_ACCESS_KEY=    # For aws codecommit create-repository

# GitHub (already set)
GH_ADMIN_PAT=                    # Classic PAT with repo + read:org scopes (for listing all repos)

# Notifications (already set)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

## RPO / RTO

- **RPO** (data loss tolerance): 7 days worst-case (weekly cron); 24h for Codeberg
- **RTO** (time to restore): ~45 min if GitHub is gone for good
  - Clone from Codeberg → point CF Pages at Codeberg via custom Git URL → redeploy

## Cost Ceiling

All 6 hosts have been verified as free-with-no-card (verified 2026-06-24):
- GitLab: free unlimited repos ✓
- Codeberg: free non-profit ✓
- Bitbucket: free 5 users ✓
- GitFlic: free ✓
- Azure DevOps: free 5 users ✓
- AWS CodeCommit: free 5 active users ✓

## What this is NOT

- **Not active development**: mirrors are read-only from a workflow perspective
- **Not CI failover yet**: separate concern — see [`migrate-ci-platform.md`](../../../runbooks/operations/migrate-ci-platform.md)
- **Not protection against credential compromise**: mirrors only protect against GitHub-the-platform failure

## Cross-refs

- Service files per host → [`services/hosting/`](../../../services/hosting)
- Setup runbook (one-time tokens + repo creation) → [`runbooks/mirror-all-hosts-setup.md`](../../../runbooks/hosting/mirror-all-hosts-setup.md)
- Migrate to fallback CI → [`runbooks/migrate-ci-platform.md`](../../../runbooks/operations/migrate-ci-platform.md)
- Backup everywhere (5 rails) → [`decisions/architecture/backup-everywhere-weekly.md`](./backup-everywhere-weekly.md)
- Superseded decision → [`decisions/architecture/mirror-to-4-git-hosts.md`](./mirror-to-4-git-hosts.md)
