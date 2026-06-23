---
type: rule
title: "Fork discipline — minimum diff, rebase-friendly, upstream-aligned"
description: "Forks live under projects/<owner>/forks/<original-upstream-name>/. <owner> is oriz-org for forks maintained for oriz.in brand work (kept on the brand org), chirag127 for drive-by forks (personal account). Repo slug on GitHub is NOT renamed (matches upstream for easier rebase). Submodule path on disk = upstream name. All changes must be minimum-diff with upstream so git rebase upstream/main applies cleanly."
tags: [rule, forks, git, rebase, submodule]
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
  - rules/repo-naming
  - decisions/architecture/projects-owner-own-forks-layout
  - decisions/architecture/submodule-pattern
---

# Fork discipline

## Rule

Forked repos in the family follow strict discipline so upstream
updates rebase cleanly. **NEVER apply this rule to non-fork repos.**

## Owner — which org / account holds the fork

A fork is **brand-maintained** if any of these apply:
- It's used by one or more `oriz-org/*` repos as a dependency / template
- We actively patch it (per the minimum-diff rule below)
- It hosts a customized version of upstream that the brand ships

Brand-maintained forks → **`oriz-org/<upstream-name>`**.
Drive-by forks (one-line PR forks, personal experiments, archived
exploration) → **`chirag127/<upstream-name>`**.

The on-disk submodule path mirrors the owner:
- Brand: `projects/oriz-org/forks/<upstream-name>/`
- Personal: `projects/chirag127/forks/<upstream-name>/`

## Layout

- **Disk path:** `projects/<owner>/forks/<original-upstream-name>/`
- **GitHub slug:** NOT renamed — matches upstream slug (`<owner>/<upstream-name>`)
- **Submodule path on disk:** matches upstream name (which matches GH slug)
- **Internal `package.json` `name`:** MAY be customized via additive override (e.g. `@chirag127/oriz-<upstream-name>-fork`) but only as a thin patch

## Minimum-diff principle

ALL changes must be minimum-diff with upstream:

- **No reformatting** the whole codebase to match family Prettier/Biome — keep upstream style
- **No renaming files / dirs** unless strictly necessary
- **Additive overrides preferred** over inline edits (e.g. config overlay file vs. modifying upstream config)
- **Patches applied as small isolated commits** with clear `fork:` prefix so cherry-pick is trivial
- **Pin to upstream tags**, not arbitrary commits — rebase target is `upstream/v1.2.3`, not `upstream/main` HEAD
- **Read upstream HEAD before any fork edit** to understand what's there; aim for changes that survive `git rebase upstream/<tag>` cleanly

## Per-fork knowledge folder

Every fork has `projects/oriz-org/forks/<name>/knowledge/`:

- `index.md` — what we changed + why
- `rebase.md` — how to pull upstream updates (commands + conflict-resolution notes)
- `divergence.md` — list of files we touched, why, and the upstream lines they patch

## Upstream remote pattern

Every fork's `.git/config` has TWO remotes:

```
[remote "origin"]
    url = https://github.com/<our-org>/<upstream-name>.git
[remote "upstream"]
    url = https://github.com/<upstream-owner>/<upstream-name>.git
```

Weekly cron fetches `upstream/main` + `upstream/<latest-tag>` and opens
a rebase PR if anything new lands.

## Fork detection + audit

GH API `GET /repos/<owner>/<name>` returns `fork: true` + `parent.full_name`.
A monthly audit job sweeps every repo in the family, flags mis-categorized
forks (e.g. a repo marked `fork: true` but not under `projects/oriz-org/forks/`),
and opens an issue.

## Cross-refs

- [`repo-naming.md`](./repo-naming.md) — non-fork naming rules
- [`decisions/architecture/submodule-pattern.md`](../decisions/architecture/submodule-pattern.md) — submodule discipline
