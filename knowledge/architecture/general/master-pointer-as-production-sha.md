---
type: architecture
title: Master pointer as production SHA
description: The chirag127/oriz master repo's submodule pointers IS the production
  state of the family. Bumping a submodule pointer + pushing master = deploying that
  submodule to production via the matrix workflow.
tags:
- architecture
- git
- submodules
- deploy
- production
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- architecture/ops/submodule-pattern
- architecture/ops/repo-layout
- architecture/compute/api-umbrella-hono-worker
- architecture/frontend/layer-1-static-hosting
---



# Master pointer as production SHA

## Concept

The master `chirag127/oriz` repo's submodule pointers ARE the
production state of the family. The set of SHAs stored in master at
any moment defines exactly what's deployed to every Cloudflare Pages
project, what's published to npm for every package, and what version
of the Hono Worker is live at `api.oriz.in`. Bumping a pointer and
pushing master is the deploy.

## How it works

- The matrix workflow at `chirag127/oriz/.github/workflows/deploy.yml`
  is triggered on push to master's `main`
- The workflow checks out master with `submodules: recursive` so it
  sees every site / package / extension at the SHA master points to
- It fans out across the matrix:
  - Each site → `pnpm wrangler pages deploy dist` to its Pages project
  - Each package → `pnpm publish` (when version bumped)
  - `apps/api/` → `pnpm wrangler deploy` to `api.oriz.in`
- Per-repo CI catches breakage at PR time inside each submodule.
  Master matrix is the production gate.
- Rolling back a single site = `git checkout` an older SHA inside the
  submodule, then bump the master pointer to that SHA, then push.
- `apps/api/` lives INLINE in master (not a submodule) precisely
  because its deploy must move in lockstep with master pointer bumps.

## Why this shape

A single SHA at the top of `chirag127/oriz` answers "what is in
production right now?" for the whole family. Bisecting a regression
becomes `git bisect` on master pointers. Pinning production while
exploring on submodules is free — the master pointer just doesn't
move. Atomic family-wide deploys are possible by bumping multiple
submodules in one master commit.

The same reason argues for keeping `apps/api/` inline: the Worker's
contract is shared by every site, and a Worker deploy that lags
behind a master pointer bump would leave sites calling routes that
don't exist yet.

## Cross-refs

- The submodule mechanics underneath → [submodule-pattern.md](../ops/submodule-pattern.md)
- The full repo layout → [repo-layout.md](../ops/repo-layout.md)
- Why the Worker is inline not submoduled → [api-umbrella-hono-worker.md](../compute/api-umbrella-hono-worker.md)
- The host the matrix deploys to → [layer-1-static-hosting.md](../frontend/layer-1-static-hosting.md)
