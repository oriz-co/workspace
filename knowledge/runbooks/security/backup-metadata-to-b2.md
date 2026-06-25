---
type: runbook
title: Backup metadata to Backblaze B2 (weekly, single umbrella workflow)
description: "Single .github/workflows/backup-metadata-b2.yml in oriz-org/workspace\
  \ enumerates all repos in oriz-org + chirag127, calls the GitHub Migration API to\
  \ capture issues/PRs/wiki/releases per repo, and uploads .tar.gz archives to a single\
  \ B2 bucket via S3-compatible CLI. Workspace is PUBLIC so Actions minutes are unlimited\
  \ free. Code is already mirrored 6 hosts via mirror-all.yml \u2014 this workflow\
  \ handles ONLY the metadata (which mirrors don't capture). Monthly restore test\
  \ verifies one random tarball is unpackable + readable."
tags:
- runbook
- backup
- backblaze-b2
- metadata
- github-migration-api
- weekly-cron
- restore-test
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
- decisions/architecture/ops/backup-channels-alternative
- decisions/architecture/ops/mirror-to-6-git-hosts
- rules/infrastructure/free-tier-with-cost-controls
- rules/interaction/no-card-on-file
---



# Backup metadata to Backblaze B2 (weekly)

## What this solves

The 6-host mirror cron (`mirror-all.yml`) preserves **git history** — code, branches, tags, commits — across GitLab/Codeberg/Bitbucket/GitFlic/Azure DevOps/AWS CodeCommit. It does NOT capture GitHub-only metadata: issues, PR conversations, wiki pages, release binaries, milestones, labels, projects. This runbook adds a second weekly cron that uses the GitHub Migration API to grab a `.tar.gz` per repo with all of that data + uploads to B2.

## What this is NOT

Not a code backup — code is in the 6-host mirrors. Don't conflate the two.

## Prerequisites

- B2 account (no card required — sign up at backblaze.com)
- B2 bucket created (e.g. `oriz-backups`) with private visibility
- B2 Application Key scoped to that bucket, with `listFiles + readFiles + writeFiles + deleteFiles` permissions
- Add to umbrella `.env` (and re-encrypt + commit `.env.enc`):
  ```
  # === Backblaze B2 (backup target) ===
  B2_APPLICATION_KEY_ID=<keyID>
  B2_APPLICATION_KEY=<the secret key>
  B2_BUCKET_NAME=oriz-backups
  B2_ENDPOINT=https://s3.<region>.backblazeb2.com   # e.g. s3.us-west-004.backblazeb2.com
  ```
- Doppler (or the sync-env workflow) propagates these to `oriz-org` org secrets so the workflow inherits them via `secrets.B2_*`

## Workflow file

Path: `.github/workflows/backup-metadata-b2.yml` in `oriz-org/workspace`.

```yaml
name: Backup metadata to B2 (weekly)
# Captures issues/PRs/wiki/releases via GitHub Migration API.
# Code is mirrored separately by mirror-all.yml.
# Workspace is PUBLIC so Actions minutes are free + unlimited.

on:
  schedule:
    - cron: '0 21 * * 6'   # Saturday 21:00 UTC = Sunday 02:30 IST
  workflow_dispatch:

permissions:
  contents: read

jobs:
  discover:
    runs-on: ubuntu-latest
    outputs:
      repos: ${{ steps.collect.outputs.repos }}
    steps:
      - name: Collect repos from oriz-org + chirag127
        id: collect
        env:
          GH_TOKEN: ${{ secrets.GH_ADMIN_PAT }}
        run: |
          ORG=$(gh repo list oriz-org --limit 500 --json nameWithOwner --jq '.[].nameWithOwner')
          USR=$(gh repo list chirag127 --limit 500 --json nameWithOwner --jq '.[].nameWithOwner')
          printf '%s\n%s\n' "$ORG" "$USR" | jq -Rn '[inputs | select(length > 0)]' > repos.json
          echo "repos=$(cat repos.json | jq -c '.')" >> "$GITHUB_OUTPUT"

  backup:
    needs: discover
    runs-on: ubuntu-latest
    strategy:
      matrix:
        repo: ${{ fromJson(needs.discover.outputs.repos) }}
      max-parallel: 4   # rate-limit-friendly
      fail-fast: false
    steps:
      - name: Start migration
        id: start
        env:
          GH_TOKEN: ${{ secrets.GH_ADMIN_PAT }}
          REPO: ${{ matrix.repo }}
        run: |
          OWNER="${REPO%%/*}"
          NAME="${REPO##*/}"
          # Org migration API path differs slightly for personal accounts:
          if [ "$OWNER" = "chirag127" ]; then
            ENDPOINT="user/migrations"
            BODY=$(jq -n --arg r "$NAME" '{repositories:[$r], exclude_attachments:false, lock_repositories:false}')
          else
            ENDPOINT="orgs/$OWNER/migrations"
            BODY=$(jq -n --arg r "$REPO" '{repositories:[$r], exclude_attachments:false, lock_repositories:false}')
          fi
          MIG=$(gh api "$ENDPOINT" -X POST --input - <<< "$BODY")
          MID=$(echo "$MIG" | jq -r .id)
          echo "migration_id=$MID" >> "$GITHUB_OUTPUT"
          echo "endpoint=$ENDPOINT" >> "$GITHUB_OUTPUT"

      - name: Poll until exported
        env:
          GH_TOKEN: ${{ secrets.GH_ADMIN_PAT }}
        run: |
          MID="${{ steps.start.outputs.migration_id }}"
          ENDPOINT="${{ steps.start.outputs.endpoint }}"
          for i in $(seq 1 60); do
            STATE=$(gh api "$ENDPOINT/$MID" --jq .state)
            echo "attempt $i: $STATE"
            [ "$STATE" = "exported" ] && exit 0
            [ "$STATE" = "failed" ] && { echo "::error::migration failed"; exit 1; }
            sleep 20
          done
          echo "::error::migration timeout after 20min"; exit 1

      - name: Download archive
        env:
          GH_TOKEN: ${{ secrets.GH_ADMIN_PAT }}
        run: |
          MID="${{ steps.start.outputs.migration_id }}"
          ENDPOINT="${{ steps.start.outputs.endpoint }}"
          gh api -H "Accept: application/vnd.github+json" \
            "$ENDPOINT/$MID/archive" \
            > backup.tar.gz

      - name: Upload to B2 (S3-compatible)
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.B2_APPLICATION_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.B2_APPLICATION_KEY }}
          BUCKET: ${{ secrets.B2_BUCKET_NAME }}
          ENDPOINT: ${{ secrets.B2_ENDPOINT }}
          REPO: ${{ matrix.repo }}
        run: |
          DATE=$(date -u +%Y-%m-%d)
          SAFE_REPO="${REPO//\//__}"
          aws s3 cp backup.tar.gz \
            "s3://${BUCKET}/metadata/${SAFE_REPO}/${DATE}.tar.gz" \
            --endpoint-url "${ENDPOINT}"

      - name: Cleanup migration on GitHub
        if: always()
        env:
          GH_TOKEN: ${{ secrets.GH_ADMIN_PAT }}
        run: |
          MID="${{ steps.start.outputs.migration_id }}"
          ENDPOINT="${{ steps.start.outputs.endpoint }}"
          gh api -X DELETE "$ENDPOINT/$MID/archive" || true
```

## Pruning (10 GB free-tier ceiling)

10 GB is generous but not infinite. A separate workflow keeps the bucket clean:

```yaml
# .github/workflows/backup-prune-b2.yml — runs after every backup-metadata-b2 successful run
# Keeps: last 4 weekly snapshots + last 1st-of-month for 12 months + last 1st-of-year forever
# Implemented as a small `aws s3 ls | awk` script — see knowledge bundle for full template.
```

## Restore test (monthly)

Separate workflow `.github/workflows/backup-restore-test.yml`:

```yaml
name: Backup restore test (monthly)
on:
  schedule:
    - cron: '0 4 1 * *'   # 1st of each month, 04:00 UTC
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Pick random repo + latest backup
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.B2_APPLICATION_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.B2_APPLICATION_KEY }}
          BUCKET: ${{ secrets.B2_BUCKET_NAME }}
          ENDPOINT: ${{ secrets.B2_ENDPOINT }}
        run: |
          # List repos under metadata/, pick one at random
          REPOS=$(aws s3 ls "s3://${BUCKET}/metadata/" --endpoint-url "${ENDPOINT}" | awk '/PRE/{gsub("/","",$2); print $2}')
          PICK=$(echo "$REPOS" | shuf -n 1)
          # Latest snapshot
          LATEST=$(aws s3 ls "s3://${BUCKET}/metadata/${PICK}/" --endpoint-url "${ENDPOINT}" | sort | tail -1 | awk '{print $NF}')
          aws s3 cp "s3://${BUCKET}/metadata/${PICK}/${LATEST}" backup.tar.gz --endpoint-url "${ENDPOINT}"
          echo "PICK=$PICK" >> "$GITHUB_ENV"

      - name: Unpack + smoke-test
        run: |
          mkdir -p restored && tar -xzf backup.tar.gz -C restored
          # Validate: should contain at least repositories/ + (issues_*.json OR pull_requests_*.json)
          [ -d restored/repositories ] || { echo "::error::no repositories/ in tarball"; exit 1; }
          # Count records present
          ISSUES=$(find restored -name 'issues_*.json' | xargs -r jq '.|length' 2>/dev/null | awk '{s+=$1} END {print s+0}')
          PRS=$(find restored -name 'pull_requests_*.json' | xargs -r jq '.|length' 2>/dev/null | awk '{s+=$1} END {print s+0}')
          echo "::notice::Restored ${{ env.PICK }}: ${ISSUES} issues, ${PRS} PRs"

      - name: Post status on failure
        if: failure()
        env:
          GH_TOKEN: ${{ secrets.GH_ADMIN_PAT }}
        run: gh issue create -R oriz-org/workspace -t "Backup restore test failed $(date -u +%F)" -b "See run ${{ github.run_id }}"
```

## Why not one workflow with code + metadata?

- Mirroring git history is FAST (a few seconds per repo, parallel-friendly, idempotent)
- Migration API is SLOW (often 30s–5min per repo, sequential per-org, rate-limited)
- They have different cron pressures (mirror more often, metadata less often)
- Different failure modes: mirror failure = network glitch retry; migration failure = often size/timeout, needs back-off
- Different bills against GitHub Actions (both free since workspace is public, but separation lets either be moved to a different runner later)

## Cross-refs

- backup channels catalog: [[decisions/architecture/backup-channels-alternative]]
- 6-host code mirror: [[decisions/architecture/mirror-to-6-git-hosts]]
- existing mirror workflow: `.github/workflows/mirror-all.yml`
- existing setup runbook: [[runbooks/mirror-all-hosts-setup]]
