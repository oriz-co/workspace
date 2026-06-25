---
type: service
title: "GitFlic.ru \u2014 push-mirror + built-in pull-mirror for oriz repos"
description: 'GitFlic.ru is mirror host #4. Russian-hosted git platform with free
  tier and a built-in daily pull-mirror feature. Can also be push-mirrored via GitHub
  Actions. Geopolitical risk: geographic/sanctions restrictions may apply. Use as
  extra layer only, not sole backup.'
tags:
- service
- git-host
- mirror
- backup
- gitflic
- russia
- free-tier
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
- decisions/architecture/ops/mirror-to-6-git-hosts
- runbooks/hosting/mirror-all-hosts-setup
- rules/infrastructure/free-tier-with-cost-controls
- rules/interaction/no-card-on-file
---


# GitFlic.ru — push-mirror + built-in pull-mirror

## Role

GitFlic.ru is **mirror host #4** in the 6-host DR strategy. It provides
**geopolitical diversity** (Russian-hosted, independent of US/EU cloud
infrastructure). It also has a native **pull-mirror feature** (daily sync
from GitHub) — the only free-tier host in our stack with this capability.

## ⚠️ Geopolitical Risk

GitFlic.ru is hosted in Russia. Access may be restricted:
- Users in **sanctioned countries** may experience 451 (Unavailable for Legal Reasons)
- The platform may be blocked in some jurisdictions
- Treat as **supplementary** mirror only; do NOT rely on it as primary recovery source

## Free Tier

| Limit | Value |
|---|---|
| Repos | Free (public and private) |
| Storage | Not explicitly published; generous for typical repos |
| Built-in pull mirror | ✅ **Daily schedule** (free feature) |
| Organizations | Supported |

## Authentication

| Field | Value |
|---|---|
| Token type | **Personal Access Token** |
| Token URL | `https://gitflic.ru/user/settings/tokens` |
| Required scope | `repo:write` (shown in Cyrillic UI as "запись в репозиторий") |
| Env var name | `MIRROR_GITFLIC_TOKEN` |
| Git URL format | `https://chirag127:TOKEN@gitflic.ru/project/chirag127/repo.git` |
| API base | `https://api.gitflic.ru/` |

### How to get the token

1. Log in at <https://gitflic.ru>
2. Go to **Settings → API Tokens** (`/user/settings/tokens`)
3. Click **Create token**
4. Name: `oriz-mirror-bot`
5. Scope: `repo:write` (repository write access)
6. Click **Create** — copy immediately
7. Store in Doppler:
   ```bash
   doppler secrets set MIRROR_GITFLIC_TOKEN --config prd
   ```

## Built-in Pull Mirror (Bonus Feature)

GitFlic has a native "Mirror" feature that auto-pulls from GitHub daily:

1. Go to GitFlic → **+** menu → **New Mirror**
2. Strategy: **PULL** (GitFlic pulls from GitHub)
3. Enter GitHub repo URL
4. For private repos: provide GitHub PAT as auth
5. GitFlic syncs daily automatically — no GitHub Actions needed for this host

This means GitFlic can be used as a *passive* mirror with zero GitHub Actions
minutes, complementing the push-mirror approach.

## API — Create Repo (idempotent)

```bash
# Create project
curl -X POST "https://api.gitflic.ru/project" \
  -H "Authorization: token ${MIRROR_GITFLIC_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"${REPO_NAME}\",\"alias\":\"${REPO_NAME}\",\"private\":false}" \
  || true  # idempotent

# API docs: https://gitflic.ru/help/api
```

## Mirror URL pattern (push-based, via GH Actions)

```bash
https://chirag127:${MIRROR_GITFLIC_TOKEN}@gitflic.ru/project/chirag127/${REPO_NAME}.git
```

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| `451 Unavailable` | Geographic/sanction block | Accept loss; flag in Telegram digest |
| `403 Forbidden` | Token expired or wrong scope | Regenerate token |
| Push rejected | GitFlic URL format differs from standard | Check URL format; `gitflic.ru/project/username/repo` |
| API in Cyrillic | UI localization | Use API directly; English available in API responses |

## Cross-refs

- Full setup → [`../../../runbooks/mirror-all-hosts-setup.md`](../../runbooks/hosting/mirror-all-hosts-setup.md)
- 6-host decision → [`../../decisions/architecture/mirror-to-6-git-hosts.md`](../../decisions/architecture/ops/mirror-to-6-git-hosts.md)
- GitFlic API docs: <https://gitflic.ru/help/api/intro>
