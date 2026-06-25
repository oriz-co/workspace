---
type: service
title: "Azure DevOps Repos \u2014 push-mirror target for oriz-org + chirag127"
description: "Azure DevOps Repos is mirror host #5. Microsoft-managed, unlimited private\
  \ Git repos, 5 free users. No native pull-mirror; push via GitHub Actions. PAT-based\
  \ auth (NOTE: Global PATs retiring Dec 1 2026 \u2014 use org-scoped PATs). Rate\
  \ limit: 1,800 req/min \u2014 well within our usage."
tags:
- service
- git-host
- mirror
- backup
- azure-devops
- microsoft
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


# Azure DevOps Repos — push-mirror target

## Role

Azure DevOps Repos is **mirror host #5** in the 6-host DR strategy.
Provides Microsoft-backed corporate + geographic diversity. Unlimited
private Git repos, 5 free users, excellent API.

## ⚠️ Global PAT Retirement (December 1, 2026)

Azure DevOps "global" Personal Access Tokens (valid across all orgs) are
being retired on **December 1, 2026**. You must use **org-scoped PATs** instead.

When generating the token: on the "Organization" dropdown select your specific
org (e.g. `chirag127`), NOT "All accessible organizations".

## Free Tier

| Limit | Value |
|---|---|
| Repos | **Unlimited** private Git repos |
| Storage | <10 GB/repo recommended; 250 GB hard limit |
| Artifact storage | 2 GiB free per org |
| Users | 5 free Basic-access users |
| CI Pipelines | 1 MS-hosted job, 1,800 min/month |
| Pull mirroring | ❌ No native pull-from-GitHub mirror |

## Authentication

| Field | Value |
|---|---|
| Token type | **Personal Access Token (PAT)** — org-scoped |
| Token URL | `https://dev.azure.com/{org}/_usersSettings/tokens` |
| Required scope | `Code: Manage` (includes Read + Write + Create repos) |
| Env var names | `MIRROR_AZURE_DEVOPS_TOKEN`, `MIRROR_AZURE_DEVOPS_ORG`, `MIRROR_AZURE_DEVOPS_PROJECT` |
| Git URL format | `https://anything:TOKEN@dev.azure.com/org/project/_git/repo` |
| API auth | Base64-encode `:TOKEN` → `Authorization: Basic <base64>` |

### How to get the token

1. Log in at <https://dev.azure.com>
2. Create or use an existing organization (e.g. `chirag127`)
3. Create a default project (e.g. `mirrors` or `oriz`)
4. Click your avatar (top-right) → **Personal access tokens**
   URL: `https://dev.azure.com/{org}/_usersSettings/tokens`
5. Click **+ New Token**
6. Name: `oriz-mirror-bot`
7. **Organization: select your org specifically** (NOT "All accessible organizations")
8. Expiration: 1 year
9. Scope: **Code → Manage** (this includes read+write+create)
10. Click **Create** — copy immediately, shown once
11. Note your org name and project name
12. Store in Doppler:
    ```bash
    doppler secrets set MIRROR_AZURE_DEVOPS_TOKEN --config prd
    doppler secrets set MIRROR_AZURE_DEVOPS_ORG --config prd    # e.g. chirag127
    doppler secrets set MIRROR_AZURE_DEVOPS_PROJECT --config prd # e.g. mirrors
    ```

## API — Create Repo (idempotent)

```bash
# First get project ID
PROJECT_ID=$(curl -s \
  -u ":${MIRROR_AZURE_DEVOPS_TOKEN}" \
  "https://dev.azure.com/${MIRROR_AZURE_DEVOPS_ORG}/_apis/projects/${MIRROR_AZURE_DEVOPS_PROJECT}?api-version=7.1" \
  | jq -r '.id')

# Create repository
curl -s -X POST \
  -u ":${MIRROR_AZURE_DEVOPS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"${REPO_NAME}\",\"project\":{\"id\":\"${PROJECT_ID}\"}}" \
  "https://dev.azure.com/${MIRROR_AZURE_DEVOPS_ORG}/${MIRROR_AZURE_DEVOPS_PROJECT}/_apis/git/repositories?api-version=7.1" \
  || true  # 409 = exists — fine
```

Note: Azure DevOps uses Base64-encoded `:TOKEN` for Basic auth:
```bash
# Equivalent with -u flag (curl handles encoding automatically)
curl -u ":${MIRROR_AZURE_DEVOPS_TOKEN}" ...
```

## Rate Limits

- API: **1,800 requests/minute per user** — very generous
- Git push: part of general rate limiting; large mirrors may throttle

## Mirror URL pattern

```bash
https://anything:${MIRROR_AZURE_DEVOPS_TOKEN}@dev.azure.com/${MIRROR_AZURE_DEVOPS_ORG}/${MIRROR_AZURE_DEVOPS_PROJECT}/_git/${REPO_NAME}
```

## Pull Mirror — NOT available

Azure DevOps has no native pull-mirror-from-GitHub. Push-mirror via GitHub
Actions is the only automated option.

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| `401 Unauthorized` | PAT expired or wrong org | Regenerate org-scoped PAT |
| `403 Forbidden` | PAT missing `Code: Manage` scope | Regenerate with correct scope |
| `404 Not Found` | Repo/project doesn't exist | Run repo-creation script |
| `429 Too Many Requests` | Rate limit hit | Add `sleep 1` between API calls |
| Push fails on global PAT | Global PATs retired Dec 1 2026 | Use org-scoped PAT |

## Cross-refs

- Full setup → [`../../../runbooks/mirror-all-hosts-setup.md`](../../runbooks/hosting/mirror-all-hosts-setup.md)
- 6-host decision → [`../../decisions/architecture/mirror-to-6-git-hosts.md`](../../decisions/architecture/ops/mirror-to-6-git-hosts.md)
- Microsoft PAT docs: <https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate>
