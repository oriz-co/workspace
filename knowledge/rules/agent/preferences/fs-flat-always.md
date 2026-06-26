---
type: rule
title: "Filesystem: flat always — muscle memory wins"
description: "All repos live at repos/<slug>/. Always flat, no category subdirs, regardless of count. Muscle memory wins over organization."
tags: [feedback, agent-preferences, filesystem, superseded]
timestamp: 2026-06-25
format_version: okf-v0.1
status: superseded
supersedes: [fs-flat-over-nested, fs-nested-when-large-flat-when-small]
superseded_by: fs-own-frk-split
---

The 13-category nest was an organizing fiction. In day-to-day work you `cd repos/<slug>/` from muscle memory; you don't think about which category the slug belongs to. Categories live in GitHub topics and on `home.oriz.in/explore`, not in the filesystem.

**Captured:** 2026-06-25, after flip-flopping between flat → nested → flat in one session. Locking the rule to stop the loop.

**The rule:** every submodule lives at `repos/<slug>/`. No `repos/<category>/<slug>/`. No `repos/<category>-flat-shadow/`. Just flat.

**Why this beats both prior rules:**
- `fs-flat-over-nested` (2026-06-21): correct intuition, wrong rationale ("flat at <30 repos"). True reason is muscle memory, not count.
- `fs-nested-when-large-flat-when-small` (2026-06-25 morning): wrong from the start. Nesting created collisions (`packages/` app vs `npm-packages/` category) and forced awkward double-names (`userscripts/bundle`). 30 minutes after locking, reversed.

**Supersedes BOTH:**
- [`fs-flat-over-nested`](../../interaction/fs-flat-over-nested.md)
- [`fs-nested-when-large-flat-when-small`](./fs-nested-when-large-flat-when-small.md)

**How to apply:**
- New repo → `repos/<slug>/`. Period.
- Category metadata lives in GitHub topics + `apps.ts` + future `explore` page. Not on disk.
- Slug naming still follows [`repo-slug-suffix-npm-pkg`](./repo-slug-suffix-npm-pkg.md) (`-api`, `-npm-pkg`, `-bs-ext`, `-cli`, etc.) — suffixes encode category, filesystem doesn't.

**SUPERSEDED 2026-06-25 (3h later)** by [`fs-own-frk-split`](../../../decisions/architecture/fleet/fs-own-frk-split.md) — added own/ and frk/ buckets.

**Related:** [`polyrepo-with-category-consolidation`](../../../decisions/architecture/fleet/polyrepo-with-category-consolidation.md), [`github-repo-names-are-brand-identity`](./github-repo-names-are-brand-identity.md), [`knowledge-deletion-not-supersession`](./knowledge-deletion-not-supersession.md).
