---
type: runbook
title: "Set up the weekly restic \u2192 Backblaze B2 backup"
description: 'One-page setup for the family''s weekly encrypted backup: install restic
  in a GH Actions runner, init the repo against a Backblaze B2 bucket, schedule the
  weekly cron, set the retention policy. Secrets sourced from Doppler.'
tags:
- runbook
- backup
- restic
- backblaze
- b2
- github-actions
- doppler
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/storage/restic
- services/storage/backblaze-b2
- services/cron/github-actions-schedule
- decisions/architecture/ops/backup-restic-to-b2
- services/secrets/doppler
---



# Set up the weekly restic → Backblaze B2 backup

One-page procedure to land the family's weekly backup loop on a new
repo (or to re-create it after a rotation). Implements
[`decisions/architecture/backup-restic-to-b2.md`](../../decisions/architecture/ops/backup-restic-to-b2.md).

## Prerequisites

- A Backblaze B2 bucket already exists (see
  [`services/storage/backblaze-b2.md`](../../services/storage/backblaze-b2.md)).
- An app key scoped to that bucket exists. Capture `B2_KEY_ID` +
  `B2_APPLICATION_KEY` + `B2_BUCKET_NAME`.
- A strong `RESTIC_PASSWORD` is generated (`openssl rand -base64 48`).
  This is the repo-encryption key — losing it loses every snapshot.
- All four values live in [Doppler](../../services/secrets/doppler.md);
  the GH Actions sync is already wired per
  [`decisions/security/secrets-management-doppler.md`](../../decisions/security/secrets-management-doppler.md).

## Steps

### 1. Initialise the restic repo (one-shot, locally)

```bash
export RESTIC_REPOSITORY="s3:s3.us-west-002.backblazeb2.com/<bucket>"
export RESTIC_PASSWORD="$(doppler secrets get RESTIC_PASSWORD --plain)"
export AWS_ACCESS_KEY_ID="$(doppler secrets get B2_KEY_ID --plain)"
export AWS_SECRET_ACCESS_KEY="$(doppler secrets get B2_APPLICATION_KEY --plain)"

restic init
```

`restic init` writes the repo metadata (encrypted) into the bucket.
Run this **once** per bucket. Re-running on an initialised bucket
fails fast.

### 2. Add the weekly workflow

Drop this file at `.github/workflows/backup-weekly.yml` in the repo
that owns the data:

```yaml
name: weekly-backup
on:
  schedule:
    - cron: '0 3 * * 0'   # Sundays 03:00 UTC
  workflow_dispatch:       # manual trigger for first-run + recovery

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install restic
        run: |
          curl -L https://github.com/restic/restic/releases/latest/download/restic_linux_amd64.bz2 \
            | bunzip2 > restic
          chmod +x restic
          sudo mv restic /usr/local/bin/restic
          restic version

      - name: Snapshot
        env:
          RESTIC_REPOSITORY: s3:s3.us-west-002.backblazeb2.com/${{ secrets.B2_BUCKET_NAME }}
          RESTIC_PASSWORD: ${{ secrets.RESTIC_PASSWORD }}
          AWS_ACCESS_KEY_ID: ${{ secrets.B2_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.B2_APPLICATION_KEY }}
        run: |
          restic backup ./data --tag weekly
          restic forget \
            --keep-daily 7 \
            --keep-weekly 4 \
            --keep-monthly 12 \
            --prune
          restic check --read-data-subset=5%
```

The `forget --prune` step enforces the family retention policy in a
single pass; `check --read-data-subset=5%` rotates integrity sampling.

### 3. Verify the first run

Trigger manually:

```bash
gh workflow run backup-weekly.yml
gh run watch
```

Then, locally:

```bash
restic snapshots
restic stats latest
```

A populated snapshot list confirms B2 + key + password + bucket all
line up.

### 4. Restore drill (do this at least once)

```bash
mkdir /tmp/restore-test
restic restore latest --target /tmp/restore-test
diff -r ./data /tmp/restore-test/data
```

A clean diff confirms the round-trip works. Document the date of the
last successful drill in the repo's README.

## Retention policy

`--keep-daily 7 --keep-weekly 4 --keep-monthly 12` — 7 + 4 + 12 = 23
snapshots maximum at any time. Far below B2's 10 GB free tier even
for repos in the low-GB range, given restic's deduplication.

If a repo grows past the envelope, narrow the policy (e.g. drop
monthlies to 6) before the next prune cycle.

## Don'ts

- **Don't put `RESTIC_PASSWORD` in a `.env`** — only Doppler. Per
  [`rules/no-hardcoded-secrets.md`](../../rules/security/no-hardcoded-secrets.md).
- **Don't share the password across repos** — one bucket, one
  password; rotation of one repo's password is a re-encrypt of that
  repo only.
- **Don't skip the restore drill.** A backup never tested is a
  backup that doesn't work.

## Cross-refs

- [`../services/storage/restic.md`](../../services/storage/restic.md) — service entry
- [`../services/storage/backblaze-b2.md`](../../services/storage/backblaze-b2.md) — backup target
- [`../services/cron/github-actions-schedule.md`](../../services/cron/github-actions-schedule.md) — substrate
- [`../decisions/architecture/backup-restic-to-b2.md`](../../decisions/architecture/ops/backup-restic-to-b2.md) — the lock
- [`../services/secrets/doppler.md`](../../services/secrets/doppler.md) — secret source-of-truth
- [`./rotate-leaked-secret.md`](./rotate-leaked-secret.md) — when `RESTIC_PASSWORD` or B2 key leaks
