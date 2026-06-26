---
type: decision
title: "Backup: Restic→B2 nightly + Windows built-in monthly"
description: "Nightly Restic→B2 (10 GB free, no card) for files. Monthly Windows built-in Backup-and-Restore for disk image. Macrium Free is gone."
tags: [backup, restic, b2, windows, ops]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
---

File-level backup: nightly Restic snapshot to Backblaze B2 (10 GB free tier, no card on file required). Disk-image backup: monthly Windows built-in Backup-and-Restore (Win11). Macrium Reflect Free was discontinued Jan 2024 — see [`macrium-reflect-free-discontinued`](../../../services/macrium-reflect-free-discontinued.md). Recovery keys stored encrypted in [`backup-keys-repo-oriz-org-backup`](./backup-keys-repo-oriz-org-backup.md). Locked 2026-06-25.
