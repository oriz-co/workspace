---
type: rule
title: "One branch only \u2014 main"
description: Only the main branch exists, in the master oriz repo and in every submodule
  under sites/, packages/, extensions/.
tags:
- rules
- git
- branches
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- rules/no-push-without-say-so
- rules/development/no-force-push-to-main
- rules/development/conventional-commits
---



# One branch only — main

Every repo in the `chirag127/oriz*` family has exactly one branch:
`main`. No `feat/*`, `fix/*`, `chore/*`, `release/*`, `develop`,
`staging`, or any other long-lived branch.

## Why

The user is solo. There is no parallel work to merge, no integration
hell, no "can I cherry-pick this back". Branches add ceremony without
benefit at this team size.

Conventional-commits ([`conventional-commits.md`](./conventional-commits.md))
on `main` give every change a structured history; the commit message
is the changelog. PR review is replaced by code review at commit
authorship time (the user reviews before commit).

## What this means concretely

- Commit straight on `main` in every repo.
- No PRs against the user's own repos. (PRs against external open-source
  projects, when contributing, are a different story.)
- The git workflow is: edit → `git add -A` → `git commit -m "feat: ..."` →
  (only on user say-so) `git push origin main`.
- Submodule pointer bumps are committed on the master's `main` after
  the submodule's own `main` is at the desired commit.

## Exceptions

If a complex multi-step refactor needs an in-progress branch for
checkpointing, that's fine — but it must be deleted (merged or
discarded) before the conversation ends. No long-lived branches.

## See also

- [`no-push-without-say-so.md`](../no-push-without-say-so.md)
- [`no-force-push-to-main.md`](./no-force-push-to-main.md)
- [`conventional-commits.md`](./conventional-commits.md)
- AGENTS.md "Git" section
