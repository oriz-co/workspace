---
type: service
title: "Bitbucket Cloud \u2014 push-mirror target for oriz-org + chirag127"
description: "Bitbucket Cloud (Atlassian) is mirror host #3. Free: unlimited private\
  \ repos, 1 GB workspace storage. CRITICAL: App Passwords deprecated permanently\
  \ July 28 2026 \u2014 migrate to Workspace Access Tokens (HTTP Bearer). Push-mirror\
  \ via GitHub Actions only; no native pull-mirror."
tags:
- service
- git-host
- mirror
- backup
- bitbucket
- atlassian
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


# Bitbucket Cloud — push-mirror target

## Role

Bitbucket Cloud (Atlassian) is **mirror host #3** in the 6-host DR strategy.
Provides Atlassian-backed geographic + corporate diversity. Free, unlimited
private repos, 1 GB workspace total storage.

## ⚠️ CRITICAL: App Passwords DEPRECATED July 28 2026

**Bitbucket App Passwords are being permanently removed.**

- June 9, 2026: Brownout periods began (App Passwords intermittently stop working)
- July 28, 2026: Permanent removal — App Passwords completely stop working

**Any existing `BITBUCKET_APP_PASSWORD` entries in `mirror-all.yml` MUST be
replaced with `MIRROR_BITBUCKET_API_TOKEN` (Workspace Access Token).**

See setup steps below for the new token type.

## Free Tier

| Limit | Value |
|---|---|
| Repos | **Unlimited** private repos |
| Workspace storage | **1 GB total** (all repos combined; read-only if exceeded) |
| Users | 5 per workspace (Free) |
| CI Pipelines | 50 min/month |
| Inactive repos | May be archived after 3 months of no push activity |
| Snippets | Removed from Free tier |
| Pull mirroring | ❌ No native pull-mirror from GitHub |

Our repos are < 10 MB each; 1 GB workspace is ample for 60+ repos.

## Authentication (NEW — Workspace Access Token)

| Field | Value |
|---|---|
| Token type | **Workspace Access Token** (formerly App Password — deprecated) |
| Token URL | Workspace settings → Security → Access tokens |
| Direct URL | `https://bitbucket.org/account/settings/access-tokens/` |
| Required permissions | `Repositories: Write`, `Projects: Read` |
| Env var names | `MIRROR_BITBUCKET_API_TOKEN`, `MIRROR_BITBUCKET_USERNAME` |
| Git URL format | `https://USERNAME:TOKEN@bitbucket.org/workspace/repo.git` |
| API Auth header | `Authorization: Bearer TOKEN` |

### How to get a Workspace Access Token

1. Log in at <https://bitbucket.org>
2. Go to your workspace settings:
   `https://bitbucket.org/account/settings/access-tokens/`
   (Or: Workspace → Settings → Security → Access tokens)
3. Click **Create access token**
4. Name: `oriz-mirror-bot`
5. Permissions: **Repositories — Write** + **Projects — Read**
6. Expiry: set 1 year from today
7. Click **Create** — copy immediately, shown once
8. Store in Doppler:
   ```bash
   doppler secrets set MIRROR_BITBUCKET_API_TOKEN --config prd
   doppler secrets set MIRROR_BITBUCKET_USERNAME --config prd  # bitbucket username
   ```

## API — Create Repo (idempotent)

```bash
# Create repo in workspace
curl -s -X POST \
  -H "Authorization: Bearer ${MIRROR_BITBUCKET_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"scm\":\"git\",\"is_private\":true,\"description\":\"Mirror of github.com/chirag127/${REPO_NAME}\"}" \
  "https://api.bitbucket.org/2.0/repositories/${MIRROR_BITBUCKET_USERNAME}/${REPO_NAME}" \
  || true  # 400/409 = already exists — fine
```

API docs: <https://developer.atlassian.com/cloud/bitbucket/rest/api-group-repositories/>

## Rate Limits

No documented hard rate limit for the API; standard Atlassian fair-use applies.
Add `sleep 0.5` between creation calls in loops to be safe.

## Pull Mirror — NOT available

Bitbucket has no native pull-mirror feature for importing from GitHub.
We use GitHub Actions push-mirror only.

## Mirror URL pattern

```bash
https://${MIRROR_BITBUCKET_USERNAME}:${MIRROR_BITBUCKET_API_TOKEN}@bitbucket.org/${MIRROR_BITBUCKET_USERNAME}/${REPO_NAME}.git
```

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| `401 Unauthorized` | Old App Password used | Generate Workspace Access Token |
| `403 Forbidden` | Token missing `Repositories: Write` scope | Regenerate with correct permissions |
| `404 Not Found` on push | Mirror repo not pre-created | Run repo-creation script |
| Workspace storage > 1 GB | Too many large repos | Remove LFS objects or upgrade plan |
| Repo archived (inactivity) | No push for 3+ months | Push a dummy commit to un-archive |

## Cross-refs

- Full setup → [`../../../runbooks/mirror-all-hosts-setup.md`](../../runbooks/hosting/mirror-all-hosts-setup.md)
- 6-host decision → [`../../decisions/architecture/mirror-to-6-git-hosts.md`](../../decisions/architecture/ops/mirror-to-6-git-hosts.md)
- Official Bitbucket API token migration guide: <https://support.atlassian.com/bitbucket-cloud/docs/api-tokens/>
