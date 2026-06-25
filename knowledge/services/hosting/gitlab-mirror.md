---
type: service
title: "GitLab.com \u2014 push-mirror target for oriz-org + chirag127"
description: "GitLab.com is mirror host #1. Every repo in oriz-org and chirag127 is\
  \ pushed via git push --mirror from the Friday/daily GitHub Actions cron. Free tier:\
  \ unlimited repos, 10 GiB/project. Pull-mirror from GitHub is Premium-only \u2014\
  \ we use push-mirror via GH Actions instead."
tags:
- service
- git-host
- mirror
- backup
- gitlab
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


# GitLab.com — push-mirror target

## Role

GitLab.com is **mirror host #1** in the 6-host DR strategy. Every repo in
`oriz-org` and `chirag127` is pushed here via `git push --mirror` from
the weekly Friday cron in `.github/workflows/mirror-all.yml`.

## Free Tier

| Limit | Value |
|---|---|
| Repos | **Unlimited** (personal namespace) |
| Storage per project | **10 GiB** (Git + LFS); read-only state if exceeded |
| Top-level groups | 3 per account (accounts created after Jan 27 2026) |
| CI/CD Minutes | 400 min/month |
| Private namespace users | 5 max |
| Pull mirroring | ❌ **Premium/Ultimate only** — not free |

Our repos are all < 100 MB; 100× headroom on the 10 GiB limit.

## Authentication

| Field | Value |
|---|---|
| Token type | **Personal Access Token (PAT)** |
| Token URL | `https://gitlab.com/-/user_settings/personal_access_tokens` |
| Required scopes | `api` + `write_repository` |
| Env var name | `MIRROR_GITLAB_TOKEN` |
| Git URL format | `https://oauth2:TOKEN@gitlab.com/username/repo.git` |
| Auth header (API) | `PRIVATE-TOKEN: TOKEN` |

### How to get the token

1. Log in at <https://gitlab.com>
2. Go to **User Settings → Access Tokens** (`/-/user_settings/personal_access_tokens`)
3. Click **Add new token**
4. Name: `oriz-mirror-bot`
5. Expiration: set to 1 year from today (GitLab now requires expiry)
6. Scopes: tick `api` and `write_repository`
7. Click **Create personal access token** — copy immediately, shown once
8. Store in Doppler: `doppler secrets set MIRROR_GITLAB_TOKEN --config prd`
9. Store username: `doppler secrets set MIRROR_GITLAB_USERNAME --config prd`

## API — Create Repo (idempotent)

```bash
# Create project under personal namespace
curl -s -X POST "https://gitlab.com/api/v4/projects" \
  -H "PRIVATE-TOKEN: ${MIRROR_GITLAB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"${REPO_NAME}\",\"visibility\":\"public\"}" \
  || true  # 409 = already exists — fine

# Create project under a group namespace
# First get group ID:
# GET https://gitlab.com/api/v4/groups?search=chirag127
curl -s -X POST "https://gitlab.com/api/v4/projects" \
  -H "PRIVATE-TOKEN: ${MIRROR_GITLAB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"${REPO_NAME}\",\"namespace_id\":${GROUP_ID},\"visibility\":\"public\"}"
```

## Rate Limits

- API: per-user rate limits enforced (HTTP 429 on excess)
- Git push: no documented hard limit; large batches should sleep between pushes
- Concurrent push throttle: stay at `max-parallel: 5` or lower in matrix jobs

## Pull Mirror (NOT available on Free)

GitLab's native pull mirror feature (Settings → Repository → Mirroring
repositories) requires **Premium or Ultimate** tier. On Free, we use
**push mirroring** — GitHub Actions runs `git push --mirror` to GitLab.

## Mirror URL pattern

```
https://oauth2:${MIRROR_GITLAB_TOKEN}@gitlab.com/${MIRROR_GITLAB_USERNAME}/${REPO_NAME}.git
```

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| `403 Forbidden` on push | Token missing `write_repository` scope | Regenerate token |
| `404 Not Found` on push | Mirror repo not pre-created | Run repo-creation script in setup runbook |
| `429 Too Many Requests` | API rate limit hit | Add `sleep 1` between API calls in loop |
| Push rejected: `read-only namespace` | Project exceeded 10 GiB | Delete old LFS objects or request increase |

## Cross-refs

- Full setup → [`../../../runbooks/mirror-all-hosts-setup.md`](../../runbooks/hosting/mirror-all-hosts-setup.md)
- 6-host mirror decision → [`../../decisions/architecture/mirror-to-6-git-hosts.md`](../../decisions/architecture/ops/mirror-to-6-git-hosts.md)
- Workflow → [`../../../.github/workflows/mirror-all.yml`](../../.github/workflows/mirror-all.yml)
