---
type: decision
title: 'Workspace layout: repos/<owner>/<own|forks>/<bucket>/<category>/<repo>'
description: "The workspace umbrella organizes submodules in a 5-level hierarchy:\
  \ GitHub owner (oriz/ for oriz-org or c127/ for chirag127) \u2192 own/ vs forks/\
  \ \u2192 4 artifact-type buckets (prod, svc, lib, content) \u2192 category folder\
  \ \u2192 repo. Shape B grouping (4 buckets) chosen over flat. Forks live under their\
  \ owner. Folder names shortened 2026-06-24 (prod/svc/lib/api/npm/mcp/bs-ext/ide-ext)\
  \ for shorter paths."
tags:
- layout
- monorepo
- submodules
- workspace
- hierarchy
- branding
timestamp: 2026-06-24
format_version: okf-v0.1
status: superseded
superseded_by: decisions/architecture/infrastructure/workspace-flat-repos-2026-06-25.md
related:
- decisions/architecture/infrastructure/workspace-flat-repos-2026-06-25
- decisions/branding/oriz-org-rename-from-co
- decisions/branding/repo-naming-suffixes
- rules/development/fork-discipline
- rules/interaction/profile-readme-cross-link
- rules/interaction/recruiter-strategy
- runbooks/hosting/migrate-to-oriz-org
---

> **Superseded 2026-06-25** — see [workspace-flat-repos-2026-06-25](../infrastructure/workspace-flat-repos-2026-06-25.md). Reasoning preserved below for audit.

# Workspace layout: owner → own/forks → bucket → category → repo

## Decision

The `oriz-org/workspace` umbrella organizes all 74 submodules in a
5-level path hierarchy. Top level partitions by **GitHub owner**, so
`oriz-org/*` repos and `chirag127/*` repos sit side-by-side on disk.
Second level partitions `own/` (we authored) from `forks/` (we
forked). Third level groups by **artifact type** (Shape B, 4 buckets).
Fourth level is the existing **category folder**. Fifth is the
**repo slug** itself.

Folder names use short forms (decided 2026-06-24 to keep paths
typeable):

| Folder | Short | What |
|---|---|---|
| `chirag127/` | `c127/` | Personal account owner |
| `oriz-org/` | `oriz/` | Brand org owner |
| `products/` | `prod/` | User-facing artifacts |
| `services/` | `svc/` | Server-side runtimes |
| `libraries/` | `lib/` | Reusable published code |
| `browser-extensions/` | `bs-ext/` | Browser extensions |
| `ide-extensions/` | `ide-ext/` | VS Code / IDE extensions |
| `mcp-servers/` | `mcp/` | MCP servers |
| `npm-packages/` | `npm/` | npm packages |
| `apis/` | `api/` | HTTP APIs |
| `content/`, `apps/`, `books/`, `data/`, `rules/`, `skills/`, `clis/`, `workers/`, `forks/`, `own/`, `hub/`, `tools/`, `personal/` | unchanged | Already short enough |

```
repos/
├── oriz/                              ← owner (oriz-org on GitHub)
│   ├── own/                           ← we authored
│   │   ├── prod/                      ← products: user-facing artifacts
│   │   │   ├── apps/                  ← Astro / SvelteKit / etc. sites
│   │   │   │   ├── content/<repo>/    ← (existing sub-bucket inside apps)
│   │   │   │   ├── hub/<repo>/
│   │   │   │   ├── personal/<repo>/
│   │   │   │   └── tools/<repo>/
│   │   │   ├── bs-ext/<repo>/         ← browser extensions
│   │   │   ├── ide-ext/<repo>/        ← VS Code / IDE extensions
│   │   │   └── clis/<repo>/           ← renamed from py-pkg-cli/
│   │   ├── svc/                       ← services: server-side runtimes
│   │   │   ├── api/<repo>/            ← HTTP APIs (CF Workers)
│   │   │   ├── workers/<repo>/        ← non-API workers
│   │   │   └── mcp/<repo>/            ← MCP servers
│   │   ├── lib/                       ← libraries: reusable published code
│   │   │   └── npm/<repo>/            ← npm packages
│   │   └── content/                   ← non-runnable assets
│   │       ├── books/<repo>/
│   │       ├── rules/<repo>/
│   │       ├── skills/<repo>/
│   │       └── data/<repo>/
│   └── frk/                              ← forks maintained for the brand
│       └── {prod,svc,lib,content}/<category>/<repo>/
└── c127/                              ← owner: chirag127 personal account
    ├── own/                           ← personal projects (cs-me-app, etc.)
    │   └── {prod,svc,lib,content}/<category>/<repo>/
    └── frk/                           ← drive-by forks (most forks land here)
        └── {prod,svc,lib,content}/<category>/<repo>/
```

Concrete example: the `cs-me-app` submodule lives at
`repos/c127/own/prod/apps/personal/cs-me-app/`.

## Why two top-level owner folders

Every submodule's GitHub owner is either `oriz-org` or `chirag127`.
Putting that in the on-disk path makes the owner unambiguous without
opening `.gitmodules`. It also lets `git grep`, find-in-files, and CI
matrices scope by owner trivially.

The brand-owned repos cluster under `oriz-org/`. Personal experiments
and drive-by forks cluster under `chirag127/`. Recruiter strategy
(see [rules/recruiter-strategy](../../../rules/interaction/recruiter-strategy.md)):
chirag127 stays populated so the personal account doesn't look dead.

## Why 4 buckets (products / services / libraries / content)

Shape B grouping chosen over Shape A (flat 12 categories). The 4
buckets are the standard industry partition:

- **products/** — anything a user opens. Apps, browser extensions,
  IDE extensions, CLIs. Stuff with a UX surface.
- **services/** — server-side runtimes. APIs, workers, MCP servers.
  No UX of their own; consumed by products.
- **libraries/** — reusable code we publish. npm packages.
- **content/** — non-runnable assets. Books, rules, skills, data.

If a new category arrives (e.g. mobile apps), it slots into one of
these 4 buckets without rethinking the hierarchy.

## Why fork hierarchy mirrors own hierarchy

Forks get the same `{products,services,libraries,content}/<category>/`
sub-structure as `own/` so the layout is symmetric and a fork's
on-disk path matches its `own/` sibling's pattern. A fork of an Astro
app sits at `forks/products/apps/<bucket>/<repo>/`, never at the root
of `forks/`.

## Renames in this migration

- `repos/py-pkg-cli/` → `repos/oriz/own/prod/clis/`
  (`py-pkg-cli/` was empty; the name conflated language + format +
  role; pluralised to match other category folders)
- `repos/forks/` → `repos/oriz/frk/` (existing forks
  under oriz-org) and `repos/c127/frk/` (drive-bys go here
  going forward)

## What this replaces

- The single-level `repos/<category>/` layout from before
  2026-06-24
- The implicit "everything is mine, except forks/" assumption
- The empty `repos/own/` directory created accidentally on
  2026-06-23 (cleaned up)

## What this does NOT change

- Repo slug naming — still follows [`repo-naming-suffixes`](../../branding/repo-naming-suffixes.md)
- Submodule discipline — still 74 submodules pinned to commits in
  the umbrella; no switch to subtree or manifest
- Fork discipline — still minimum-diff, see [`rules/fork-discipline`](../../../rules/development/fork-discipline.md)

## Migration cost

- ~74 `.gitmodules` `path =` entries rewritten
- `git submodule sync` to propagate new paths to `.git/config`
- ~243 hardcoded `repos/<cat>/` refs in `scripts/`, `knowledge/`,
  root `*.md` files — sed-rewritten in one pass
- Windows file locks on `apis/`, `apps/`, `npm-packages/` from VS
  Code watchers and dev servers — close watchers before migration
