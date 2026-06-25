---
type: rule
title: "Fork discipline \u2014 minimum diff, rebase-friendly, upstream-aligned"
description: "All forks live under oriz-org/<upstream-name> on GitHub and repos/oriz/frk/<bucket>/<category>/<upstream-name>/\
  \ on disk. Reason: org-level secrets only propagate within the org; forks on personal\
  \ accounts can't inherit them. Slug + disk folder = upstream name by default, unless\
  \ the fork ships as a distinct product (CWS / store / npm) \u2014 then rename to\
  \ a `<purpose>-bs-ext` / `-cli` / etc. compliant slug. All code changes minimum-diff,\
  \ marked with per-fork `<slug>:` comments, documented in per-fork knowledge/divergence.md."
tags:
- rule
- forks
- git
- rebase
- submodule
- minimum-diff
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
- rules/development/repo-naming
- decisions/architecture/general/projects-owner-own-forks-layout
- decisions/architecture/submodule-pattern
---



# Fork discipline

## Rule

Forked repos in the family follow strict discipline so upstream
updates rebase cleanly. **NEVER apply this rule to non-fork repos.**

## Owner — which org / account holds the fork

**All forks live on `oriz-org`** by default. Reason: GitHub org-level secrets only propagate within the org. A fork on a personal account can't inherit oriz-org's 61 shared secrets, which means any CI in the fork must duplicate-manage credentials. Solo dev = same person, so the "brand vs personal" distinction was about recruiter signal — pinned-repo placement covers that without splitting the secrets pool.

The on-disk submodule path is `repos/oriz/frk/<bucket>/<category>/<upstream-name>/`. Personal experiments that never see CI can live on `chirag127` if they aren't planned as oriz-family work (the `c127/` disk tree is reserved for that case; today it's empty).
Drive-by forks (one-line PR forks, personal experiments, archived
exploration) → **`chirag127/<upstream-name>`**.

## Layout

- **Disk path:** `repos/oriz/frk/<bucket>/<category>/<upstream-name>/` (default; everything lives in oriz-org)
- **GitHub slug:** NOT renamed — matches upstream slug (`oriz-org/<upstream-name>`)
- **Submodule path on disk:** matches upstream name (which matches GH slug)
- **Internal `package.json` `name`:** MAY be customized via additive override (e.g. `@chirag127/oriz-<upstream-name>-fork`) but only as a thin patch

### Exception: shipping the fork as a distinct product

If the fork is published as its own product (Chrome Web Store listing,
App Store entry, separate npm package), or if we patch it materially
enough to want a distinct identity, the GitHub slug + disk folder
SHOULD be renamed to a convention-compliant slug (e.g.
`dearrow-plus-bs-ext`, not `DeArrow`). Reasons:

- Store listings reject duplicate names anyway.
- A distinct slug communicates "this is our shipped variant" to anyone
  landing on the GitHub repo or store page.
- The family naming convention ([`repo-naming-suffixes`](../../decisions/branding/repo-naming-suffixes.md))
  applies to forks too: browser extensions get `-bs-ext`, CLIs get
  `-cli`, etc. Lowercase, hyphenated, role-suffixed.
- Upstream rebase still works — set `upstream` to the original repo
  and rebase as usual; the slug doesn't affect `git rebase`.

When you rename, keep the on-disk folder, GitHub slug, and CWS/store
name aligned to one another. The internal `package.json` `name` can
match the new slug. Document the rename in the per-fork
`knowledge/divergence.md`.

## Minimum-diff principle

ALL changes must be minimum-diff with upstream:

- **No reformatting** the whole codebase to match family Prettier/Biome — keep upstream style
- **No renaming files / dirs** unless strictly necessary
- **Additive overrides preferred** over inline edits (e.g. config overlay file vs. modifying upstream config)
- **Patches applied as small isolated commits** with clear `fork:` prefix so cherry-pick is trivial
- **Pin to upstream tags**, not arbitrary commits — rebase target is `upstream/v1.2.3`, not `upstream/main` HEAD
- **Read upstream HEAD before any fork edit** to understand what's there; aim for changes that survive `git rebase upstream/<tag>` cleanly

## Minimize future merge conflicts

When you DO need to edit upstream files (because an additive overlay
isn't practical — e.g. you're adding a UI toggle that has to live in
upstream's settings UI files), write the patch to survive future
upstream evolution:

- **Mark every inserted line with a `<fork-slug>:` comment** (e.g.
  `// oriz-fork:`, `<!-- oriz-fork: -->`) so `git grep oriz-fork`
  locates every divergence point during rebase.
- **Insert lines adjacent to stable anchors** (a long-lived nearby
  symbol / element). Conflicts trigger when upstream changes the
  anchor; pick an anchor that's stable across releases.
- **Insert, don't modify**, where possible. If you must touch an
  upstream line, prefer to add a new local variable that wraps the
  old behavior rather than rewriting the call site:
  ```ts
  // upstream:
  setCustomTitle(formattedTitle, ...);
  // fork:
  const displayTitle = flag ? `${formattedTitle} (...)` : formattedTitle;
  setCustomTitle(displayTitle, ...);
  ```
  This keeps the call site signature identical; future upstream edits
  to the call arguments don't always conflict.
- **No drive-by reformatting** of the touched file. Leave indentation,
  spacing, and line breaks of unmodified upstream lines exactly as
  they were.
- **Document the divergence** in `knowledge/divergence.md` (per-fork
  knowledge folder, see below). List every file + the conflict-risk
  level so the next rebase has a roadmap.

## Per-fork knowledge folder

Every fork has `repos/oriz/frk/<name>/knowledge/`:

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
forks (e.g. a repo marked `fork: true` but not under `repos/oriz/frk/`),
and opens an issue.

## Cross-refs

- [`repo-naming.md`](./repo-naming.md) — non-fork naming rules
- [`decisions/architecture/submodule-pattern.md`](../../architecture/ops/submodule-pattern.md) — submodule discipline
