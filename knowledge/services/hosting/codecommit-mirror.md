---
type: service
title: "AWS CodeCommit \u2014 push-mirror target for oriz-org + chirag127"
description: 'AWS CodeCommit returned to full GA on November 24, 2025 (was briefly
  restricted mid-2024). Mirror host #6. Free: 5 active users/month, 50 GB storage,
  10,000 Git requests/month. Push-mirror via GitHub Actions using IAM HTTPS static
  credentials. No native pull-mirror.'
tags:
- service
- git-host
- mirror
- backup
- aws
- codecommit
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


# AWS CodeCommit — push-mirror target

## Role

AWS CodeCommit is **mirror host #6** in the 6-host DR strategy.
AWS-backed, geographically distributed (multiple AWS regions), completely
independent of GitHub/Atlassian/Microsoft infrastructure.

## ✅ CodeCommit is Active Again (Nov 24, 2025)

AWS CodeCommit briefly entered a restricted period mid-2024 (no new
users/repos). It returned to **full General Availability on November 24, 2025**
— open to all new users and new repo creation again.

## Free Tier (Always-Free, non-expiring)

| Limit | Value |
|---|---|
| Active users | **5 per month** free |
| Storage | **50 GB/month** total account |
| Git requests | **10,000/month** |
| Repos | 5,000 (increase to 25,000 on request) |
| Overage | $1/additional user, $0.06/GB, $0.001/1,000 requests |
| Pull mirroring | ❌ No native pull-from-GitHub mirror |

Our usage (1 bot user, ~50 repos, weekly pushes) stays well within free tier.

## Authentication

CodeCommit has a unique auth model — NOT username+password. Two options:

### Option A: IAM HTTPS Git Credentials (Recommended for GitHub Actions)

| Field | Value |
|---|---|
| Token type | **IAM HTTPS Git Credentials** (username + password generated in IAM console) |
| How to generate | IAM Console → Users → Your user → Security credentials → HTTPS Git credentials for AWS CodeCommit → Generate credentials |
| Env var names | `MIRROR_CODECOMMIT_USERNAME`, `MIRROR_CODECOMMIT_PASSWORD`, `MIRROR_CODECOMMIT_REGION` |
| Git URL format | `https://USERNAME:PASSWORD@git.codecommit.REGION.amazonaws.com/v1/repos/REPO_NAME` |

### Option B: git-remote-codecommit (for SSO/federated users)

```bash
pip install git-remote-codecommit
# Then use URL format: codecommit::region://repo-name
git clone codecommit::us-east-1://repo-name
```

⚠️ IAM Identity Center (SSO) users CANNOT use static Git credentials. They
must use `git-remote-codecommit`. For GitHub Actions, static credentials are
simpler and recommended.

### How to get IAM HTTPS Git Credentials

1. Log in at <https://console.aws.amazon.com/iam/>
2. Go to **IAM → Users → your-user → Security credentials** tab
3. Scroll to **HTTPS Git credentials for AWS CodeCommit**
4. Click **Generate credentials**
5. Copy the **username** and **password** immediately (password shown once)
6. Choose your AWS region (e.g. `us-east-1`)
7. Store in Doppler:
   ```bash
   doppler secrets set MIRROR_CODECOMMIT_USERNAME --config prd
   doppler secrets set MIRROR_CODECOMMIT_PASSWORD --config prd
   doppler secrets set MIRROR_CODECOMMIT_REGION --config prd  # e.g. us-east-1
   ```

## API — Create Repo (idempotent)

```bash
# Using AWS CLI (must have AWS credentials configured)
aws codecommit create-repository \
  --repository-name "${REPO_NAME}" \
  --repository-description "Mirror of github.com/chirag127/${REPO_NAME}" \
  --region "${MIRROR_CODECOMMIT_REGION}" \
  || true  # exits non-zero if exists — pipe to true

# In GitHub Actions: configure AWS credentials first
# - uses: aws-actions/configure-aws-credentials@v4
#   with:
#     aws-access-key-id: ${{ secrets.MIRROR_AWS_ACCESS_KEY_ID }}
#     aws-secret-access-key: ${{ secrets.MIRROR_AWS_SECRET_ACCESS_KEY }}
#     aws-region: ${{ secrets.MIRROR_CODECOMMIT_REGION }}
```

Additional env vars needed for API repo creation:
- `MIRROR_AWS_ACCESS_KEY_ID` — IAM Access Key (for `aws codecommit create-repository`)
- `MIRROR_AWS_SECRET_ACCESS_KEY` — IAM Secret Key

## Rate Limits

- Git requests: 10,000/month on free tier (each push = multiple requests)
- API: Standard AWS SDK throttling

## Mirror URL pattern

```bash
https://${MIRROR_CODECOMMIT_USERNAME}:${MIRROR_CODECOMMIT_PASSWORD}@git.codecommit.${MIRROR_CODECOMMIT_REGION}.amazonaws.com/v1/repos/${REPO_NAME}
```

Note: URL-encode special characters in username/password (especially `+`).

## Pull Mirror — NOT available

AWS CodeCommit has no native pull-mirror from external sources. Push-mirror
via GitHub Actions is the only automated option.

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| `403 Forbidden` | IAM credentials wrong or expired | Regenerate HTTPS Git Credentials in IAM |
| `404 Not Found` | Repo doesn't exist | Run `aws codecommit create-repository` |
| Monthly quota exceeded | >10,000 git requests | Upgrade or reduce mirror frequency |
| SSO user auth fails | IAM SSO can't use static creds | Use `git-remote-codecommit` instead |
| `+` in password | URL encoding issue | URL-encode: replace `+` with `%2B` |

## Cross-refs

- Full setup → [`../../../runbooks/mirror-all-hosts-setup.md`](../../runbooks/hosting/mirror-all-hosts-setup.md)
- 6-host decision → [`../../decisions/architecture/mirror-to-6-git-hosts.md`](../../decisions/architecture/ops/mirror-to-6-git-hosts.md)
- AWS CodeCommit docs: <https://docs.aws.amazon.com/codecommit/>
- git-remote-codecommit: <https://pypi.org/project/git-remote-codecommit/>
