---
type: rule
title: Every repo in the family must work independently when cloned alone
description: Cloning any single oriz submodule directly must give a fully working
  dev environment. The umbrella oriz repo orchestrates; it does not own the code.
  A solo clone of any site must pnpm install + pnpm build successfully without the
  master repo.
tags:
- rule
- repos
- submodules
- independence
- ci
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- rules/development/use-pnpm
- rules/development/one-branch-only
- runbooks/operations/clean-install
---



# Every repo in the family must work independently when cloned alone

## The rule

Cloning any single submodule of the family — `oriz-blog`,
`oriz-books`, `oriz-finance`, etc. — directly from GitHub must
yield a fully functional development environment. No dependency on
the umbrella `oriz/` repo being present on disk.

Concretely:

```bash
git clone https://github.com/chirag127/blog-site.git
cd oriz-blog
pnpm install
pnpm dev      # works — site comes up locally
pnpm build    # works — production bundle produced
pnpm test     # works — tests pass
```

If any of those four commands fails because the umbrella repo isn't
checked out alongside, the submodule is broken and must be fixed
before merging.

## What it means

The umbrella `chirag127/oriz` repo exists for **orchestration**, not
**ownership**:

- The matrix deploy workflow lives in master — but each site also
  has its own per-repo `ci.yml` that lints, typechecks, and builds
  in isolation.
- The master tracks the **production SHA** for each submodule via
  the gitlink pointer — but the submodule itself is the source of
  truth for its code.
- Family-wide knowledge (this `knowledge/` bundle) lives in master
  — but each site can carry its own per-site `knowledge/` with
  site-specific concepts.

A new contributor who has never cloned `oriz/` must still be able to
contribute to `oriz-blog` end-to-end.

## How to verify

Run the standalone-clone test before any structural change to a
submodule:

```bash
# In a scratch directory, far from any oriz/ checkout
cd /tmp
rm -rf oriz-blog
git clone https://github.com/chirag127/blog-site.git
cd oriz-blog
pnpm install --prefer-offline=false
pnpm typecheck && pnpm lint && pnpm build
```

If this fails, the submodule has accidentally taken a dependency on
the umbrella repo's filesystem layout. Fix forward.

## Implications

### No `file:../` local dependencies

```jsonc
// WRONG — only works when ../oriz-kit is checked out alongside
"dependencies": { "@chirag127/oriz-kit": "file:../oriz-kit" }

// RIGHT — published package or git tarball, resolves anywhere
"dependencies": { "@chirag127/oriz-kit": "^1.0.0" }
"dependencies": { "@chirag127/oriz-kit": "github:chirag127/oriz-kit#main" }
```

Workspace `workspace:*` protocol is allowed **only inside** a
monorepo that itself works standalone (e.g. master might have
workspaces, but a leaf submodule must not depend on a sibling via
`workspace:*` paths into the umbrella).

### Per-repo CI workflows

Every submodule ships its own `.github/workflows/ci.yml` that runs
on push and PR independently. It runs at minimum:

```yaml
- pnpm install
- pnpm lint
- pnpm typecheck
- pnpm build
- pnpm test
```

The umbrella's matrix workflow is **additional**, not a
replacement. A submodule's CI must be green on its own before the
umbrella picks it up.

### Per-repo knowledge bundles

Site-specific concepts live in each submodule's `knowledge/`
directory. They cross-link to family-wide concepts via relative
paths (`../../knowledge/rules/never-hit-quotas.md`) but are
self-contained for reading purposes — a site's `knowledge/index.md`
should make sense without the family bundle.

## Cross-refs

- [`use-pnpm.md`](./use-pnpm.md) — the install command this rule presumes
- [`one-branch-only.md`](./one-branch-only.md) — every submodule's `main` is the canonical branch
- [`../runbooks/clean-install.md`](../../runbooks/operations/clean-install.md) — full-family bootstrap that doesn't violate this rule
- [`../_okf.md`](../../_okf.md) — OKF conventions, including per-site bundle layout
