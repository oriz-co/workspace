---
type: rule
title: "Repo slug `-npm-pkg` suffix for npm packages"
description: "GitHub repo slugs for npm packages get the `-npm-pkg` suffix even though the npm package name does not. Same-name rule resolves to slug+suffix vs scoped-name. 22 packages converged 2026-06-21."
tags: [feedback, agent-preferences, naming, npm, packaging]
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
---

User direction 2026-06-21 when shown the mismatch (8 existing repos `chirag127/astro-shell-npm-pkg` vs 14 new `chirag127/astro-shell`): pick "Rename 14 new to ADD -npm-pkg." All 22 now `chirag127/astro-<name>-npm-pkg` on GitHub, `@chirag127/astro-<name>` on npm.

**Why:** GitHub repo naming best-practices in knowledge already locked this convention for Astro npm packages (`astro-<role>-npm-pkg`). The 14 new repos were created without the suffix in error; user wanted convergence on the existing convention, not the other way. Conflicts apparently-with the same-name rule but the `-npm-pkg` suffix is treated as a category marker, not a name part — the "same slug" claim is `astro-<name>`.

**How to apply:**
- Creating a new shared npm package: `gh repo create chirag127/<role>-<name>-npm-pkg` (or `astro-<role>-npm-pkg` for Astro family).
- package.json: `"name": "@chirag127/astro-<name>"` (no suffix in the npm name).
- package.json `repository.url`, `homepage`, `bugs.url`: all use the `-npm-pkg` suffix slug.
- README badges + cross-refs: GitHub URLs include `-npm-pkg`; npm URLs don't.
- Sites are different — they use `-site` (not `-site-npm-pkg`). See the repo-naming-suffixes matrix for the full table.

Related: [`twenty-two-packages-on-npm`](../../../decisions/architecture/packaging/twenty-two-packages-on-npm.md).
