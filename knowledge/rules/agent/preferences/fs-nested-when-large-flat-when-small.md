---
type: rule
title: "Nest by category when ≥30 repos"
description: "At ≥30 repos, nest by category (repos/<cat>/<slug>/); below 30, flat names + suffixes work. Supersedes fs-flat-over-nested."
tags: [feedback, agent-preferences, filesystem, superseded]
timestamp: 2026-06-25
format_version: okf-v0.1
status: superseded
superseded_by: fs-flat-always
---

At <30 repos, flat names with suffixes (`-api`, `-npm-pkg`, `-bs-ext`, `-cli`) are scannable. At 77+ in one dir, eyes lose the shape and category groupings disappear into the alphabet sort.

**Why:** the single-category rule (one repo, one category) makes nesting the canonical visual representation of categorisation. Suffix naming stays — it just lives inside the category folder. `repos/apis/oriz-ifsc-api/` not `repos/apis/ifsc/`.

**How to apply:**
- New repo created → place at `repos/<category>/<slug>/`
- Category folder names are plural nouns: `apis/`, `apps/`, `npm-packages/`, `books/`, `browser-extensions/`, etc.
- 13 canonical categories from this session: apis, apps, books, browser-extensions, cli-tools, data, ide-extensions, infra, mcp-servers, meta, npm-packages, templates, userscripts.
- Slug-naming convention from [`repo-slug-suffix-npm-pkg`](./repo-slug-suffix-npm-pkg.md) still applies (e.g. `-npm-pkg`, `-api`, `-bs-ext`).

**Reversal of:** [`fs-flat-over-nested`](../../interaction/fs-flat-over-nested.md) (locked 2026-06-21; reversed 2026-06-25 when count hit 77).

**SUPERSEDED 2026-06-25 (same-day reversal)** by [`fs-flat-always`](./fs-flat-always.md).
