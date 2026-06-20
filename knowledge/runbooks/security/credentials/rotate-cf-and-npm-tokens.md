---
type: runbook
title: "Rotate Cloudflare + npm tokens, set as org-level GH secrets"
description: "End-to-end: rotate CLOUDFLARE_API_TOKEN and NPM_TOKEN, choose between least-privilege and max-permission scopes, store at chirag127 org level via gh secret set --org."
tags: [security, credentials, cloudflare, npm, github-actions]
timestamp: 2026-06-20
related: [env-and-secrets-single-source]
---

# Rotate Cloudflare + npm tokens

## When to run

- Token leak detected (e.g. accidentally pasted in chat).
- Quarterly rotation cadence per `rules/security/token-rotation-cadence.md`.
- Initial setup of org-level secrets for a new GH Actions workflow.

## Prerequisites

- Logged in to dash.cloudflare.com as the account owner.
- Logged in to npmjs.com as `chirag127`.
- `gh` CLI authenticated (`gh auth status` shows green).
- Doppler CLI authenticated (optional — only if Doppler is the upstream
  source of truth per `decisions/security/secrets-management-doppler.md`).

## Step 1 — Cloudflare token

### Path A — Least-privilege (recommended)

Issue ONE token per concern. Less blast radius if any single token leaks.

1. Go to https://dash.cloudflare.com/profile/api-tokens.
2. Click **Create Token** → **Custom token**.
3. Add these permissions:

| For | Permission group | Resource |
|---|---|---|
| Pages deploys | `Account` → `Cloudflare Pages` → `Edit` | Account `chirag127` |
| DNS for *.oriz.in | `Zone` → `DNS` → `Edit` | Specific zone `oriz.in` |
| Workers (only if you publish workers) | `Account` → `Workers Scripts` → `Edit` | Account `chirag127` |

4. **Account Resources**: include `chirag127` only.
5. **Zone Resources**: include `oriz.in` only.
6. **Client IP Address Filtering**: leave blank (CI runners have rotating IPs).
7. **TTL**: 1 year.
8. Click **Continue to Summary** → **Create Token**. Copy the token.

### Path B — Max-permission single token (user-overridden)

Use this only if you accept that one leaked token = full account compromise.

1. Same flow as Path A, but at step 3 click **Use Template** → **Edit**:
   - `Account.Account Settings: Read`
   - `Account.Cloudflare Pages: Edit`
   - `Account.Workers Scripts: Edit`
   - `Account.Workers KV Storage: Edit`
   - `Account.Workers R2 Storage: Edit`
   - `Account.D1: Edit`
   - `Account.Cloudflare Tunnel: Edit`
   - `Zone.Zone: Read`
   - `Zone.DNS: Edit`
   - `Zone.Workers Routes: Edit`
   - `Zone.SSL and Certificates: Edit`
   - `Zone.Page Rules: Edit`
2. Same Account/Zone scoping as Path A.
3. **Document this token's broad scope** in the chirag127/workspace
   `.env.example` comment column so future-you remembers it's wide-scoped.

### Verify the token

```bash
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer $NEW_TOKEN" \
  -H "Content-Type: application/json"
```

Expect `"status":"active"` and the permissions you set. If it fails,
the token didn't activate — wait 30 seconds and retry.

## Step 2 — npm token

Granular tokens (introduced 2023) replace classic tokens. Use them.

1. Go to https://www.npmjs.com/settings/chirag127/tokens.
2. Click **Generate New Token** → **Granular Access Token**.
3. **Token name**: `gh-actions-publish-2026-Q3` (rotate quarterly).
4. **Expiration**: 90 days.
5. **Packages and scopes**: select scope `@chirag127/*`. (NOT all-packages.)
6. **Permissions**: `Read and write`.
7. **Allowed IP ranges**: leave blank.
8. Generate. Copy the token (starts with `npm_`).

## Step 3 — Set org-level GH secrets

Per `rules/github-org-level-secrets.md`, secrets are set ONCE at the
`chirag127` org level and cascade to every repo.

```bash
echo "$CF_TOKEN" | gh secret set CLOUDFLARE_API_TOKEN --org chirag127 --visibility all
echo "$CF_ACCOUNT_ID" | gh secret set CLOUDFLARE_ACCOUNT_ID --org chirag127 --visibility all
echo "$NPM_TOKEN" | gh secret set NPM_TOKEN --org chirag127 --visibility all
```

For repo-narrow secrets (e.g. extension store keys), use `--visibility selected --repos repo1,repo2`.

## Step 4 — Mirror to local `.env`

Local development needs the same vars. Per
`rules/security/no-hardcoded-secrets.md`, the actual values go in
`<repo>/.env` (git-ignored), NEVER in `.env.example` (committed,
key-names-only).

Workspace `.env`:

```env
# This file is git-ignored. Do not commit.
CLOUDFLARE_API_TOKEN=<the new token>
CLOUDFLARE_ACCOUNT_ID=<your account id>
NPM_TOKEN=<the new token>
```

`.env.example` stays comment-only; `scripts/sync-env-example.sh`
syncs it to every repo per `rules/env-example-synced-from-master.md`.

## Step 5 — Update Doppler (if upstream)

If you use Doppler as the upstream truth, update there first and let
`scripts/set-org-secrets-from-doppler.sh` push to GH org secrets.

```bash
doppler secrets set CLOUDFLARE_API_TOKEN="$CF_TOKEN" --project oriz --config prd
doppler secrets set NPM_TOKEN="$NPM_TOKEN" --project oriz --config prd
bash scripts/set-org-secrets-from-doppler.sh
```

## Step 6 — Revoke old tokens

After the new tokens are confirmed working in CI:

1. Cloudflare: revoke old token at the same dashboard URL.
2. npm: revoke old token at the same settings URL.
3. Doppler audit log: check for any unexpected access since last
   rotation.

## Step 7 — Trigger a CI run to confirm

Push any small commit to any of the 15 tool repos (or trigger
`workflow_dispatch` if you've added it). The CI logs should show
successful CF Pages deploy + (if applicable) npm publish.

## Compromised-token checklist

If a token leaked (chat paste, public commit, etc.):

1. **Revoke first.** Don't wait for the new token. Old one dies now.
2. Generate new per Step 1 / Step 2.
3. Set new at org level per Step 3.
4. Search for the leaked value across all repos:
   ```bash
   gh search code --owner chirag127 "$LEAKED_TOKEN"
   ```
5. If a public repo carries it, force-push history rewrite per
   `runbooks/security/incident/rotate-leaked-secret.md`.

(Updated 2026-06-20.)
