---
type: service
title: "Codeberg.org \u2014 push-mirror target for oriz-org + chirag127"
description: "Codeberg.org (Forgejo) is mirror host #2. FOSS-mission non-profit git\
  \ host \u2014 free, no payment required. Push-mirror via GitHub Actions. Pull-mirror\
  \ is disabled on the public Codeberg instance (Forgejo supports it, but Codeberg\
  \ administrators have disabled it). Soft limit: 750 MiB git storage per user/org."
tags:
- service
- git-host
- mirror
- backup
- codeberg
- forgejo
- free-tier
- foss
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
- decisions/architecture/ops/mirror-to-6-git-hosts
- runbooks/hosting/mirror-all-hosts-setup
- runbooks/hosting/codeberg-mirror-2026-06-23
- rules/infrastructure/free-tier-with-cost-controls
- rules/interaction/no-card-on-file
---


# Codeberg.org — push-mirror target

## Role

Codeberg.org is **mirror host #2** in the 6-host DR strategy. It is also
the daily DR mirror for `oriz-org` via the separate
`codeberg-mirror.yml` workflow. Non-profit, FOSS-focused, Forgejo-based.
No payment, no credit card, completely free.

## Free Tier

| Limit | Value |
|---|---|
| Repos | 100 per user/org (increases available on request) |
| Git storage | **750 MiB** per user/org total |
| LFS + packages + releases | Additional **1.5 GiB** |
| Private repos | 100 MiB limit for "non-promoted" (proprietary) content |
| Organizations | Supported (own storage quota applies) |
| Pull mirroring | ❌ **Disabled** on Codeberg's public instance |

Our text-heavy repos are < 100 MB total; well within limits.

## Authentication

| Field | Value |
|---|---|
| Token type | **Access Token (Forgejo API token)** |
| Token URL | `https://codeberg.org/user/settings/applications` |
| Required scope | `write:repository` |
| Env var names | `MIRROR_CODEBERG_TOKEN`, `MIRROR_CODEBERG_USERNAME` |
| Git URL format | `https://USERNAME:TOKEN@codeberg.org/username/repo.git` |
| Auth header (API) | `Authorization: token TOKEN` |

### How to get the token

1. Log in at <https://codeberg.org>
2. Go to **Settings → Applications** (`/user/settings/applications`)
3. Under **Manage Access Tokens**, click **Generate Token**
4. Token name: `oriz-mirror-bot`
5. Scope: tick **`write:repository`**
6. Click **Generate Token** — copy immediately, shown once
7. Store in Doppler:
   ```bash
   doppler secrets set MIRROR_CODEBERG_TOKEN --config prd
   doppler secrets set MIRROR_CODEBERG_USERNAME --config prd  # your Codeberg username
   ```

## API — Create Repo (idempotent)

```bash
# For user namespace
curl -s -X POST "https://codeberg.org/api/v1/user/repos" \
  -H "Authorization: token ${MIRROR_CODEBERG_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"${REPO_NAME}\",\"private\":false,\"auto_init\":false,\"description\":\"Mirror of github.com/chirag127/${REPO_NAME}\"}" \
  || true  # 409 = exists — fine

# For org namespace
curl -s -X POST "https://codeberg.org/api/v1/org/oriz-org/repos" \
  -H "Authorization: token ${MIRROR_CODEBERG_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"${REPO_NAME}\",\"private\":false,\"auto_init\":false}"
```

API docs (Swagger): <https://codeberg.org/api/swagger>

## Rate Limits

No documented public rate limits; respect normal usage — `sleep 0.5` between
creation API calls in loops.

## Pull Mirror — DISABLED on Codeberg

Forgejo (the underlying software) supports pull mirroring natively, but
**Codeberg's administrators have explicitly disabled it** to reduce server
load. There is no workaround — you cannot have Codeberg auto-pull from GitHub.

Solution: GitHub Actions push to Codeberg on schedule (already implemented in
`codeberg-mirror.yml` and `mirror-all.yml`).

## Mirror URL patterns

```bash
# Personal repos
https://${MIRROR_CODEBERG_USERNAME}:${MIRROR_CODEBERG_TOKEN}@codeberg.org/${MIRROR_CODEBERG_USERNAME}/${REPO_NAME}.git

# Org repos (oriz-org)
https://oriz-org:${MIRROR_CODEBERG_TOKEN}@codeberg.org/oriz-org/${REPO_NAME}.git
```

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| `403 Forbidden` on push | Token missing `write:repository` scope | Regenerate token |
| `404 Not Found` on push | Mirror repo not pre-created | Run repo-creation script |
| `413 Payload Too Large` | Repo exceeds size limits | Use BFG to clean large blobs |
| Storage quota exceeded | 750 MiB total hit | Delete old repos or request increase |

## Cross-refs

- Full setup → [`../../../runbooks/mirror-all-hosts-setup.md`](../../runbooks/hosting/mirror-all-hosts-setup.md)
- Daily oriz-org Codeberg mirror → [`../../../runbooks/codeberg-mirror-2026-06-23.md`](../../runbooks/hosting/codeberg-mirror-2026-06-23.md)
- 6-host decision → [`../../decisions/architecture/mirror-to-6-git-hosts.md`](../../decisions/architecture/ops/mirror-to-6-git-hosts.md)
