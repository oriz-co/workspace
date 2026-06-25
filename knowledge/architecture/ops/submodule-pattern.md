---
type: architecture
title: "Submodule pattern \u2014 each site/package/extension is a separate GitHub\
  \ repo"
description: Every site, every package, and every extension is a standalone GitHub
  repo added as a git submodule under sites/, packages/, or extensions/. The submodule
  has its own commits, releases, CI, and main branch. The master oriz repo stores
  a SHA pointer per submodule.
tags:
- architecture
- git
- submodules
- repo
- workflow
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- architecture/ops/repo-layout
- architecture/general/master-pointer-as-production-sha
- rules/development/one-branch-only
---



# Submodule pattern — each site/package/extension is a separate GitHub repo

## Concept

The family is structured as one master repo (`chirag127/oriz`) plus
many independent GitHub repos (one per site, package, extension). The
master repo references each child repo as a git submodule, storing a
SHA pointer. Each child has its own issues, releases, CI, and main
branch.

## How it works

- Adding a new submodule:
  ```bash
  git submodule add https://github.com/chirag127/<name>.git sites/<name>
  ```
- Working on a child:
  ```bash
  cd sites/<name>
  # work here — full git repo on main (per the one-branch-only rule)
  git add -A && git commit -m "feat: ..."
  # DO NOT push without explicit user say-so. Later, when pushed:
  #   git push origin main
  ```
- Bumping the master pointer after the child is pushed:
  ```bash
  cd ../..  # back to master
  git add sites/<name>
  git commit -m "chore(submodule): bump <name> to <short-sha>"
  ```
- One-branch-only rule applies in master AND every submodule. Commit
  straight on `main`. No `feat/*`, `fix/*`, `chore/*` branches.
- Agents must NOT modify `.gitmodules` or remove submodule directories
  without explicit user instruction.

## Why this shape

Three properties matter:
1. **Each site / package / extension can be released independently.**
   A bug fix to oriz-blog doesn't need a master commit; the master
   commit happens when production should pin to that fix.
2. **Open-source visibility per repo.** Recruiters read `chirag127/blog-site`
   directly, with its own README, issues, and stars.
3. **Per-repo CI keeps blast radius small.** A failing extension
   build blocks only that extension's release, not the family.

The cost is workflow complexity: a change spans two commits (child +
master pointer bump). The rule "no push without say-so" applies at
every level, which keeps the workflow tractable even with many
moving submodules.

## Cross-refs

- The full directory layout → [repo-layout.md](./repo-layout.md)
- What the master pointer represents → [master-pointer-as-production-sha.md](../general/master-pointer-as-production-sha.md)
- The branching rule → [`../rules/one-branch-only.md`](../../rules/development/one-branch-only.md)
