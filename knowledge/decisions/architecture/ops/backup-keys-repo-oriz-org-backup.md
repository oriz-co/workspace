---
type: decision
title: "Backup keys in private oriz-org/backup repo"
description: "Private `oriz-org/backup` repo holds restic config + recovery keys (git-crypt encrypted) + RECOVERY.md. Snapshot data lives in B2, not the repo."
tags: [backup, restic, secrets, ops]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
---

Private repo `oriz-org/backup` (not public) stores: restic repo config, recovery keys (git-crypt encrypted with a GPG key), and `RECOVERY.md` step-by-step restore runbook. Actual snapshot data is in Backblaze B2, not in the repo. Pairs with [`backup-restic-b2-plus-windows-builtin`](./backup-restic-b2-plus-windows-builtin.md). Locked 2026-06-25.
