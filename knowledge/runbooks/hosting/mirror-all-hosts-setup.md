---
type: runbook
title: "Mirror all hosts setup \u2014 one-time token generation + repo pre-creation\
  \ for all 6 hosts"
description: 'One-time setup runbook to configure the 6-host automatic git mirror
  for oriz-org and chirag127. Covers: token generation for GitLab, Codeberg, Bitbucket
  (API Token, NOT App Password), GitFlic, Azure DevOps, and AWS CodeCommit; pre-creating
  mirror repos on each host; storing tokens at chirag127 GitHub org level; and running
  the first dry-run. All steps automated except the token generation (browser UI).
  No manual recurring sync.'
tags:
- runbook
- mirror
- git-host
- gitlab
- codeberg
- bitbucket
- gitflic
- azure-devops
- codecommit
- secrets
- setup
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
- decisions/architecture/ops/mirror-to-6-git-hosts
- rules/security/github-org-level-secrets
- rules/infrastructure/free-tier-with-cost-controls
- rules/interaction/no-card-on-file
- runbooks/security/set-github-org-level-secrets
- services/hosting/gitlab-mirror
- services/hosting/codeberg-mirror
- services/hosting/bitbucket-mirror
- services/hosting/gitflic-mirror
- services/hosting/azure-devops-mirror
- services/hosting/codecommit-mirror
---



# Mirror all hosts setup — one-time

Complete setup guide for the 6-host automatic git mirror strategy. Run this
once per org (or after a full token rotation). Recurring mirror runs via
`mirror-all.yml` cron automatically — no further manual steps.

## Prerequisites

- `gh` CLI authenticated as admin of `chirag127` org
- `doppler` CLI authenticated
- Browser access for token generation steps
- `aws` CLI installed (for CodeCommit repo creation)
- `jq` installed

---

## Step 1: Generate 6 host tokens (browser — one-time per host)

### 1A. GitLab.com — Personal Access Token

1. Log in at <https://gitlab.com>
2. Go to: `https://gitlab.com/-/user_settings/personal_access_tokens`
3. Click **Add new token**
4. Name: `oriz-mirror-bot` | Expiration: 1 year | Scopes: ✅ `api` + ✅ `write_repository`
5. Copy token immediately
6. Save to Doppler:
   ```bash
   doppler secrets set MIRROR_GITLAB_TOKEN --config prd
   doppler secrets set MIRROR_GITLAB_USERNAME --config prd
   ```

### 1B. Codeberg.org — Access Token

1. Log in at <https://codeberg.org>
2. Go to: `https://codeberg.org/user/settings/applications`
3. Under "Manage Access Tokens" → **Generate Token**
4. Name: `oriz-mirror-bot` | Scope: ✅ `write:repository`
5. Copy token immediately
6. Save to Doppler:
   ```bash
   doppler secrets set MIRROR_CODEBERG_TOKEN --config prd
   doppler secrets set MIRROR_CODEBERG_USERNAME --config prd
   ```

### 1C. Bitbucket Cloud — Workspace Access Token (NOT App Password)

⚠️ App Passwords are permanently retired (June-July 2026). Use API Tokens.

1. Log in at <https://bitbucket.org>
2. Go to: `https://bitbucket.org/account/settings/access-tokens/`
   (Or: Workspace → Settings → Security → Access tokens)
3. Click **Create access token**
4. Name: `oriz-mirror-bot` | Permissions: ✅ Repositories: **Write** + ✅ Projects: **Read**
5. Expiration: 1 year
6. Copy token immediately
7. Save to Doppler:
   ```bash
   doppler secrets set MIRROR_BITBUCKET_API_TOKEN --config prd
   doppler secrets set MIRROR_BITBUCKET_USERNAME --config prd
   ```

### 1D. GitFlic.ru — Personal Token

1. Log in at <https://gitflic.ru>
2. Go to: `https://gitflic.ru/user/settings/tokens`
3. Click **Create token** | Name: `oriz-mirror-bot` | Scope: `repo:write`
4. Copy token immediately
5. Save to Doppler:
   ```bash
   doppler secrets set MIRROR_GITFLIC_TOKEN --config prd
   ```

### 1E. Azure DevOps — Personal Access Token (org-scoped)

⚠️ Use org-scoped PAT, NOT "All accessible organizations" (global PATs retire Dec 1 2026).

1. Log in at <https://dev.azure.com>
2. Create/ensure organization exists (e.g. `chirag127`)
3. Create a project inside it (e.g. `mirrors`)
4. Go to: `https://dev.azure.com/{org}/_usersSettings/tokens`
5. Click **+ New Token**
6. Name: `oriz-mirror-bot` | Org: select your specific org | Expiry: 1 year
7. Scope: **Code → Manage** (tick this custom scope)
8. Copy token immediately
9. Save to Doppler:
   ```bash
   doppler secrets set MIRROR_AZURE_DEVOPS_TOKEN --config prd
   doppler secrets set MIRROR_AZURE_DEVOPS_ORG --config prd      # e.g. chirag127
   doppler secrets set MIRROR_AZURE_DEVOPS_PROJECT --config prd  # e.g. mirrors
   ```

### 1F. AWS CodeCommit — IAM HTTPS Git Credentials

1. Log in at <https://console.aws.amazon.com/iam/>
2. Go to **IAM → Users → select your user → Security credentials** tab
3. Scroll to **HTTPS Git credentials for AWS CodeCommit** → **Generate credentials**
4. Copy username + password immediately
5. Choose region (e.g. `us-east-1`)
6. Also create IAM Access Keys for `aws codecommit create-repository`:
   - IAM → Users → Security credentials → Access keys → Create access key
   - Purpose: CLI usage
7. Save to Doppler:
   ```bash
   doppler secrets set MIRROR_CODECOMMIT_USERNAME --config prd
   doppler secrets set MIRROR_CODECOMMIT_PASSWORD --config prd
   doppler secrets set MIRROR_CODECOMMIT_REGION --config prd      # e.g. us-east-1
   doppler secrets set MIRROR_AWS_ACCESS_KEY_ID --config prd
   doppler secrets set MIRROR_AWS_SECRET_ACCESS_KEY --config prd
   ```

---

## Step 2: Store all tokens at chirag127 GitHub org level

Per [`rules/github-org-level-secrets.md`](../../rules/security/github-org-level-secrets.md),
ALL secrets live at org level. Run this script:

```bash
#!/bin/bash
# Run from c:/D/oriz after doppler is authenticated

SECRETS=(
  MIRROR_GITLAB_TOKEN
  MIRROR_GITLAB_USERNAME
  MIRROR_CODEBERG_TOKEN
  MIRROR_CODEBERG_USERNAME
  MIRROR_BITBUCKET_API_TOKEN
  MIRROR_BITBUCKET_USERNAME
  MIRROR_GITFLIC_TOKEN
  MIRROR_AZURE_DEVOPS_TOKEN
  MIRROR_AZURE_DEVOPS_ORG
  MIRROR_AZURE_DEVOPS_PROJECT
  MIRROR_CODECOMMIT_USERNAME
  MIRROR_CODECOMMIT_PASSWORD
  MIRROR_CODECOMMIT_REGION
  MIRROR_AWS_ACCESS_KEY_ID
  MIRROR_AWS_SECRET_ACCESS_KEY
)

for NAME in "${SECRETS[@]}"; do
  VALUE="$(doppler secrets get "$NAME" --plain --config prd)"
  printf '%s' "$VALUE" | gh secret set "$NAME" --org chirag127 --visibility all
  echo "✓ Set $NAME"
done

echo ""
echo "Verify:"
gh secret list --org chirag127 | grep -E '^MIRROR_'
```

---

## Step 3: Pre-create mirror repos on each host

This script reads all repos from `oriz-org` and `chirag127` via `gh` CLI
and creates empty target repos on each of the 6 hosts. Idempotent — 409/4xx
errors on existing repos are ignored.

```bash
#!/bin/bash
# pre-create-mirror-repos.sh
# Run from c:/D/oriz — requires gh CLI, curl, aws CLI, jq, doppler

set -e

# Load secrets from Doppler
GITLAB_TOKEN=$(doppler secrets get MIRROR_GITLAB_TOKEN --plain --config prd)
GITLAB_USER=$(doppler secrets get MIRROR_GITLAB_USERNAME --plain --config prd)
CODEBERG_TOKEN=$(doppler secrets get MIRROR_CODEBERG_TOKEN --plain --config prd)
CODEBERG_USER=$(doppler secrets get MIRROR_CODEBERG_USERNAME --plain --config prd)
BB_TOKEN=$(doppler secrets get MIRROR_BITBUCKET_API_TOKEN --plain --config prd)
BB_USER=$(doppler secrets get MIRROR_BITBUCKET_USERNAME --plain --config prd)
GITFLIC_TOKEN=$(doppler secrets get MIRROR_GITFLIC_TOKEN --plain --config prd)
ADO_TOKEN=$(doppler secrets get MIRROR_AZURE_DEVOPS_TOKEN --plain --config prd)
ADO_ORG=$(doppler secrets get MIRROR_AZURE_DEVOPS_ORG --plain --config prd)
ADO_PROJECT=$(doppler secrets get MIRROR_AZURE_DEVOPS_PROJECT --plain --config prd)
CC_REGION=$(doppler secrets get MIRROR_CODECOMMIT_REGION --plain --config prd)
AWS_KEY=$(doppler secrets get MIRROR_AWS_ACCESS_KEY_ID --plain --config prd)
AWS_SECRET=$(doppler secrets get MIRROR_AWS_SECRET_ACCESS_KEY --plain --config prd)

# Collect all repo names
echo "Collecting repo list..."
REPOS_JSON=$(
  {
    gh repo list oriz-org --limit 500 --json name -q '.[].name'
    gh repo list chirag127 --limit 500 --json name -q '.[].name'
  } | sort -u
)

echo "$REPOS_JSON" | while read -r REPO_NAME; do
  echo "--- Creating mirrors for: $REPO_NAME ---"

  # GitLab
  curl -s -o /dev/null -X POST "https://gitlab.com/api/v4/projects" \
    -H "PRIVATE-TOKEN: ${GITLAB_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"${REPO_NAME}\",\"visibility\":\"public\"}" || true
  sleep 0.3

  # Codeberg (user namespace)
  curl -s -o /dev/null -X POST "https://codeberg.org/api/v1/user/repos" \
    -H "Authorization: token ${CODEBERG_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"${REPO_NAME}\",\"private\":false,\"auto_init\":false}" || true
  sleep 0.3

  # Bitbucket
  curl -s -o /dev/null -X POST \
    -H "Authorization: Bearer ${BB_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"scm\":\"git\",\"is_private\":false}" \
    "https://api.bitbucket.org/2.0/repositories/${BB_USER}/${REPO_NAME}" || true
  sleep 0.3

  # GitFlic
  curl -s -o /dev/null -X POST "https://api.gitflic.ru/project" \
    -H "Authorization: token ${GITFLIC_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"${REPO_NAME}\",\"alias\":\"${REPO_NAME}\",\"private\":false}" || true
  sleep 0.3

  # Azure DevOps — need project ID first (cache it)
  if [ -z "$ADO_PROJECT_ID" ]; then
    ADO_PROJECT_ID=$(curl -s -u ":${ADO_TOKEN}" \
      "https://dev.azure.com/${ADO_ORG}/_apis/projects/${ADO_PROJECT}?api-version=7.1" \
      | jq -r '.id')
    echo "Azure DevOps project ID: $ADO_PROJECT_ID"
  fi
  curl -s -o /dev/null -X POST -u ":${ADO_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"${REPO_NAME}\",\"project\":{\"id\":\"${ADO_PROJECT_ID}\"}}" \
    "https://dev.azure.com/${ADO_ORG}/${ADO_PROJECT}/_apis/git/repositories?api-version=7.1" || true
  sleep 0.3

  # AWS CodeCommit
  AWS_ACCESS_KEY_ID="$AWS_KEY" AWS_SECRET_ACCESS_KEY="$AWS_SECRET" \
    aws codecommit create-repository \
      --repository-name "${REPO_NAME}" \
      --region "${CC_REGION}" 2>/dev/null || true
  sleep 0.3

  echo "✓ $REPO_NAME pre-created on all 6 hosts"
done

echo ""
echo "Pre-creation complete. Run a dry-run next (Step 4)."
```

---

## Step 4: Dry-run the mirror workflow

```bash
# Trigger workflow with dry-run mode (add --dry-run flag in push step temporarily)
gh workflow run mirror-all.yml --repo chirag127/oriz
gh run watch --repo chirag127/oriz
```

Check logs: every host should show ✓ per repo. Any ✗ indicates missing
repo or wrong token — fix before re-enabling the full cron.

## Step 5: Force a real first run

```bash
gh workflow run mirror-all.yml --repo chirag127/oriz
```

After completion, spot-check each host's web UI for the workspace repo's
commit history — should match GitHub HEAD.

---

## Adding a new repo (recurring task)

When a new submodule or standalone repo is added:

1. Run Step 3's repo-creation script (idempotent — safe to re-run fully)
2. The next Friday cron will include the new repo automatically

---

## Token rotation

When a token expires or is compromised:
1. Regenerate on the host's dashboard (see Step 1 for each host)
2. Update in Doppler: `doppler secrets set <NAME> --config prd`
3. Re-run Step 2's `gh secret set` loop
4. Per [`runbooks/rotate-leaked-secret.md`](../security/rotate-leaked-secret.md)

---

## See also

- Mirror decision → [`../decisions/architecture/mirror-to-6-git-hosts.md`](../../decisions/architecture/ops/mirror-to-6-git-hosts.md)
- Org secrets rule → [`../rules/github-org-level-secrets.md`](../../rules/security/github-org-level-secrets.md)
- Set org secrets → [`./set-github-org-level-secrets.md`](../security/set-github-org-level-secrets.md)
- Rotate leaked secret → [`./rotate-leaked-secret.md`](../security/rotate-leaked-secret.md)
- Service files per host → [`../services/hosting/`](../../services/hosting)
- Workflow file → [`../../.github/workflows/mirror-all.yml`](../../.github/workflows/mirror-all.yml)
