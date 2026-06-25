---
type: architecture
title: "Repository layout — sites, packages, apps, extensions, knowledge"
description: "The master chirag127/oriz repo layout: sites/ for public websites, packages/ for shared npm packages, apps/ for the inline Hono Worker, extensions/ for browser extensions, knowledge/ for the OKF bundle, design/ for v2 design briefs (now under knowledge/design/), runbooks under knowledge/runbooks/."
tags: [architecture, repo, layout, structure]
timestamp: 2026-06-20
format_version: okf-v0.1
status: "SUPERSEDED 2026-06-24 — repo is now oriz-org/workspace with repos/<owner>/<own|forks>/<bucket>/<category>/<repo>/ hierarchy. See decisions/architecture/ops/projects-owner-own-forks-layout.md for the current layout. This file is kept as historical record of the pre-migration shape."
superseded_by: "decisions/architecture/ops/projects-owner-own-forks-layout"
related:
  - architecture/ops/submodule-pattern
  - architecture/security/master-pointer-as-production-sha
  - architecture/compute/api-umbrella-hono-worker
  - architecture/packages/the-23-packages
  - decisions/architecture/ops/projects-owner-own-forks-layout
  - decisions/branding/naming/policy/index
---

> **⚠️ SUPERSEDED 2026-06-24.** The repo's structure has changed materially since this doc was written:
> - The umbrella repo is now `oriz-org/workspace` (not `chirag127/oriz`)
> - Submodules sit at `repos/<owner>/<own|forks>/<bucket>/<category>/<repo>/`, not `sites/`, `packages/`, etc.
> - There are 74 submodules across 27 apps, 23 npm packages, 15 APIs, 5 books, 2 skills, 1 data, 1 worker placeholder, 2 forks, and 1 personal app on chirag127.
>
> For the current layout, read [`decisions/architecture/ops/projects-owner-own-forks-layout`](../../decisions/architecture/general/projects-owner-own-forks-layout.md).
>
> The content below is kept as historical record of the pre-migration shape.

---

# Repository layout — sites, packages, apps, extensions, knowledge

## Concept

The master hub `chirag127/oriz` is a meta-repo that points at every
sub-site, package, and extension as a git submodule, plus a small
amount of inline content (the Hono Worker, the OKF knowledge bundle,
the matrix deploy workflow).

## How it works

```
chirag127/oriz/
├── sites/
│   ├── oriz-home/             ← submodule per site (11 sites today)
│   ├── oriz-blog/
│   ├── oriz-books/
│   └── ...
├── packages/
│   ├── astro-shell/            ← submodule per shared @chirag127/astro-* npm package
│   ├── astro-chrome/           ← (18 packages total — see the-23-packages.md)
│   ├── astro-config/
│   └── ...
├── apps/
│   └── api/                   ← INLINE (not a submodule). Hono Worker → api.oriz.in
├── extensions/
│   └── <name>/                ← submodule per Chrome / Firefox / Edge extension
├── knowledge/                 ← OKF bundle (this directory's parent)
│   ├── _okf.md
│   ├── index.md
│   ├── log.md
│   ├── architecture/
│   ├── decisions/
│   ├── design/                ← v2 design briefs live here now
│   ├── policy/
│   ├── rules/
│   ├── runbooks/
│   └── services/
├── .github/workflows/         ← matrix deploy across every site
├── AGENTS.md
└── CLAUDE.md
```

- `sites/<name>/` — one per public website; each is a separate
  GitHub repo added as a submodule
- `packages/<name>/` — one per shared npm package; each is a separate
  GitHub repo added as a submodule
- `apps/api/` — the umbrella Hono Worker. INLINE so the Worker deploy
  ships with master pointer bumps in lockstep — see [master-pointer-as-production-sha.md](../general/master-pointer-as-production-sha.md)
- `extensions/<name>/` — one per browser extension; submodule
- `knowledge/` — OKF v0.1 bundle of decisions, rules, runbooks, design
  briefs, and architecture concepts (see `knowledge/_okf.md`)

## Why this shape

Submodules let each site / package / extension be a self-contained
repo with its own issues, releases, and CI, while the master repo
gives a single SHA that pins production state across the whole
family. Inlining `apps/api/` is a deliberate exception: the Worker's
contract is shared by every site, so its deploy must move in
lockstep with the master pointer, not lag behind in its own repo.

## Cross-refs

- How submodule SHAs become production state → [master-pointer-as-production-sha.md](../general/master-pointer-as-production-sha.md)
- Day-to-day submodule mechanics → [submodule-pattern.md](./submodule-pattern.md)
- Why apps/api/ is inline → [api-umbrella-hono-worker.md](../compute/api-umbrella-hono-worker.md)
- The packages list → [the-23-packages.md](../packages/the-23-packages.md) (18 packages locked)
