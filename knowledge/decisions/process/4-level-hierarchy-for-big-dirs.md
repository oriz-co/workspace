---
type: decision
title: "4-level hierarchy for big knowledge directories"
description: "services/, decisions/, glossary/ adopt 4-level paths. Other dirs stay flat at 3 levels until they outgrow ~15 files."
tags: [decisions, process, okf, knowledge, hierarchy]
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
  - _okf
---

# 4-level hierarchy for big knowledge directories

## Decision

The `knowledge/` bundle now allows up to **4 levels** of nesting (`knowledge/<dir>/<sub>/<file>.md`) where the user's "no more than 4–5 files per folder" guidance demands it. As of 2026-06-20, three directories run at 4 levels:

- `services/` — 15 role subdirs (hosting, auth, database, compute, email, forms, monitoring, analytics, ai, domain, ads, payment, search, tooling, code-quality)
- `decisions/` — 7 topic subdirs (architecture, branding, content, infrastructure, monetisation, process, tooling)
- `glossary/` — 5 alphabetical subdirs (a-c, d-h, i-n, o-r, s-z)

The other directories (`rules/`, `architecture/`, `policy/`, `runbooks/`, `design/`) stay flat at 3 levels until they cross the ~15-file threshold.

## Why

Three pressures converged:

1. The user's "no more than 4–5 files per folder" guidance — 4–5 is the comfortable scan-list size.
2. `services/` had **41 files** in one flat directory. Unscannable; pickers and graph views were noise-heavy.
3. `decisions/` had **32 files** in one flat directory; `glossary/` had **28**. Both past the same threshold.

3-level was the OKF-conservative default. 4-level is the pragmatic upgrade for big dirs. Going past 4 levels would erode the "path is identity" property OKF relies on, so 4 is the cap.

## Implications

- `_okf.md` is updated to document the new max-depth rule and the "when to nest" criteria (a) flat list >15 files AND (b) categorisation genuinely helps navigation.
- Cross-link references that used `services/firebase-spark.md` now resolve to `services/auth/firebase-spark.md`. All in-bundle links updated in the same edit; the [self-update rule](../../rules/self-update-rule.md) carries the obligation.
- New service / decision / glossary files MUST land in the appropriate subdir, not at the root.
- Per-app `knowledge/` bundles (e.g. `projects/oriz/own/prod/apps/personal/oriz-cs-me-app/knowledge/`, inside each submodule) MAY adopt 4-level once they hit the same threshold. Until then, they stay flat.
- Adding a new role to `services/` is a new subdirectory + index.md + concept files; the top-level [services/index.md](../../services/index.md) gets a new row in the subdirectories table.

## Cross-refs

- [_okf](../../_okf.md) — convention doc updated in the same edit
- [services/index](../../services/index.md)
- [decisions/index](../index.md)
- [glossary/index](../../glossary/index.md)
- [rules/self-update-rule](../../rules/self-update-rule.md)
