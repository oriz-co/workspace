---
type: rule
title: "Direct commit to main on own repos; branches only for upstream contributions"
description: "Don't create feature branches on chirag127/* or oriz-org/* repos. Commit directly to main. Branches exist only for PRs to upstream forks."
tags: [git, workflow, branches, agent-preferences, feedback]
timestamp: 2026-06-27
format_version: okf-v0.1
status: active
related:
  - rules/development/conventional-commits
  - rules/agent/preferences/spare-forks-with-downstream-forkers
---

# Direct commit on own repos — branches only for upstream

## Rule

On any repo we **own** (under `chirag127/*` or `oriz-org/*`), commit directly to `main` and push. No feature branches. No PRs to ourselves.

Branches exist **only** for one purpose: filing a PR to an upstream repository we don't own (e.g. our fork's `upstream` remote).

## Why

User feedback, 2026-06-27 (verbatim):

> "Don't create feature branches, only create branch only create the feature branches and other branches if we want to contribute to the upstream. We don't need to create the branches, other branches on repository"

The 3 PRs filed this session (`oriz-org/userscripts#1`, `#2`, `#3`) were all self-merged squash-PRs against my own main — pure ceremony, no review, no value. They added round-trip latency (push branch → open PR → merge PR → delete branch → pull main → bump submodule) compared to direct commit + push + submodule bump.

## When to use a branch

| Scenario | Branch? |
|---|---|
| Editing `oriz-org/userscripts`, `oriz-org/workspace`, `oriz-org/<anything>` | **No.** Commit to main, push. |
| Editing `chirag127/<personal-repo>` | **No.** Commit to main, push. |
| Editing `repos/frk/<fork>` for a feature staying in the fork | **No.** Commit to `main` of the fork. |
| Editing `repos/frk/<fork>` for a PR upstream | **Yes.** Branch on the fork, push branch, open PR from `chirag127:branch` → `upstream:main`. |

## How

```bash
# Own repo flow
cd repos/own/<repo>
# ... edit ...
git add -A
git commit -m "feat: ..."
git push origin main

# Upstream contribution flow (rare)
cd repos/frk/<fork>
git checkout -b feature-name
# ... edit ...
git push -u origin feature-name
gh pr create --repo <upstream-owner>/<upstream-repo> --head chirag127:feature-name
```

## Anti-patterns

- ❌ `git checkout -b feat/x` on own repo → `gh pr create` → `gh pr merge --squash` for code only you will review
- ❌ Self-approving PRs as a "process gate"
- ❌ Treating squash-merge as a substitute for a clean commit message (write the clean message at commit time instead)
