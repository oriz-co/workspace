---
type: decision
title: "Backups \u2014 restic CLI in GH Actions cron, target Backblaze B2"
description: Weekly encrypted, deduplicated backups via restic running on a GitHub
  Actions schedule, targeting a Backblaze B2 bucket. Locks the restic + B2 + GH Actions
  triple.
tags:
- backup
- restic
- backblaze
- b2
- github-actions
- cron
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/storage/restic
- services/storage/backblaze-b2
- services/cron/github-actions-schedule
- runbooks/security/restic-backup-setup
- rules/interaction/no-card-on-file
---



# Backups — restic CLI in GH Actions cron, target Backblaze B2

## Decision

The family's backup architecture is the triple:

| Layer | Pick |
|---|---|
| Backup engine | [restic](../../../services/storage/restic.md) (OSS, BSD-2-Clause) |
| Backup target | [Backblaze B2](../../../services/storage/backblaze-b2.md) (free 10 GB + 3x egress) |
| Scheduler | [GitHub Actions schedule](../../../services/cron/github-actions-schedule.md) (weekly Sunday 03:00 UTC) |

The full setup — workflow YAML, repo init, restore drill — is the
[`runbooks/restic-backup-setup.md`](../../../runbooks/security/restic-backup-setup.md)
runbook. Retention policy is `--keep-daily 7 --keep-weekly 4
--keep-monthly 12` (max 23 snapshots).

## Why

- **restic gives encryption + dedup + integrity check in one binary.**
  AES-256 + Poly1305-AES + content-addressed chunks. No plugin
  surface to maintain. Single static binary drops into the runner.
- **B2 is the only no-card S3-compatible target the family already
  picked.** Locked at
  [`object-storage-split.md`](../database/object-storage-split.md). 10 GB free
  + 3x stored egress covers many weeks of family-scale dedup'd
  backups.
- **GH Actions schedule fits the job shape per
  [`cron-split-cf-vs-gh.md`](../compute/cron-split-cf-vs-gh.md).** Build env,
  secrets surface, repo checkout — all already wired. Cloudflare
  Cron Triggers can't run a static binary on disk.
- **All three layers are no-card / free-tier.** Restic is OSS, B2 is
  free at our scale, GH Actions is unlimited on public repos. No
  exception to [`rules/no-card-on-file.md`](../../../rules/interaction/no-card-on-file.md).

## Implications

- **Each data-bearing repo carries its own** `.github/workflows/backup-weekly.yml`
  per the [per-repo CI rule](../../process/per-repo-ci-workflows.md).
  No central backup orchestrator.
- **Secrets** — `RESTIC_PASSWORD`, `B2_KEY_ID`, `B2_APPLICATION_KEY`,
  `B2_BUCKET_NAME` — all live in
  [Doppler](../../../services/secrets/doppler.md) and sync to GitHub
  Secrets per
  [`decisions/security/secrets-management-doppler.md`](../../security/secrets-management-doppler.md).
- **One bucket per repo** to keep blast radius small; one password
  per bucket to keep rotation cost bounded.
- **Restore drill is mandatory** before declaring a repo's backup
  loop "done" — see runbook step 4.
- **`restic check --read-data-subset=5%`** runs in the same workflow
  so silent corruption surfaces by week 20 at latest.

## Cross-refs

- [restic service entry](../../../services/storage/restic.md)
- [Backblaze B2 service entry](../../../services/storage/backblaze-b2.md)
- [GitHub Actions schedule](../../../services/cron/github-actions-schedule.md)
- [Restic backup setup runbook](../../../runbooks/security/restic-backup-setup.md)
- [Object storage split decision](../database/object-storage-split.md)
- [Cron split decision](../compute/cron-split-cf-vs-gh.md)
- [Doppler — secrets source-of-truth](../../security/secrets-management-doppler.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
