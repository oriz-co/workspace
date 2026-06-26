---
type: decision
title: "Fleet owner = oriz-org"
description: "All fleet repos live under `oriz-org`. `chirag127` keeps personal-only repos. Use `gh repo transfer` to migrate fleet items found on chirag127."
tags: [fleet, github, ownership]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
---

Canonical owner for every fleet repo is the `oriz-org` GitHub org. The `chirag127` personal account retains only personal-only repos (dotfiles, experiments, non-fleet). When a fleet repo is found on `chirag127`, run `gh repo transfer chirag127/<name> oriz-org` to migrate. Locked 2026-06-25.
