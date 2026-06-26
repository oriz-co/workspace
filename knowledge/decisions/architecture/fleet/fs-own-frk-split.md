---
type: decision
title: "Own/frk split — two buckets on top of flat repos/"
description: "repos split into repos/own/<slug>/ (originals) and repos/frk/<slug>/ (forks). Two-level structure on top of muscle-memory rule."
tags: [filesystem, fleet, forks]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
supersedes: fs-flat-always
---

Two-folder split: `repos/own/<slug>/` for repos I created, `repos/frk/<slug>/` for repos forked from upstream.

**Captured:** 2026-06-25, post-scope-cut, after the fleet shrunk to 20 submodules (15 own + 5 frk).

**Why this beats flat-always:**
- Forks have different release semantics (upstream sync, PRs back) that originals don't.
- Forks have different license-credit obligations.
- 15 own + 5 frk fits naturally; the categorize-once-per-repo rule isn't violated (fork-status is a hard binary, not a soft category).
- Muscle memory still works inside each bucket — `cd repos/own/<slug>/` and `cd repos/frk/<slug>/` are both predictable.

**Supersedes:** [`fs-flat-always`](../../../rules/agent/preferences/fs-flat-always.md) (locked 3h earlier same day).

**The 5 forks (2026-06-25):**
- ai-rewrite-bs-ext (parent: SupratimRK/Ai-rewrite)
- claude-notifications-cli (parent: 777genius/claude-notifications-go)
- dearrow-plus-bs-ext (parent: ajayyy/DeArrow)
- freellmapi (parent: tashfeenahmed/freellmapi)
- omniroute (parent: diegosouzapw/OmniRoute)

**How to apply:**
- New repo I create → `repos/own/<slug>/`
- New repo I fork → `repos/frk/<slug>/`
- Slug suffixes (`-api`, `-bs-ext`, etc.) still encode functional category.

**Related:** [`fs-flat-always`](../../../rules/agent/preferences/fs-flat-always.md) (superseded), [`github-repo-names-are-brand-identity`](../../../rules/agent/preferences/github-repo-names-are-brand-identity.md), [`scope-cut-2026-06-25`](./scope-cut-2026-06-25.md).
