---
type: rule
title: pnpm is the package manager for every JS repo in the family
description: pnpm is mandatory across the oriz family. Its content-addressable global
  store at ~/.pnpm-store is what makes the 'no duplication' goal achievable when 11+
  sites share dependencies.
tags:
- rule
- pnpm
- package-manager
- tooling
- no-duplication
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- rules/development/always-latest-deps
- rules/development/repos-work-independently
- runbooks/operations/clean-install
---



# pnpm is the package manager for every JS repo in the family

## The rule

Every JavaScript / TypeScript repo in the `chirag127/oriz*` family
uses **pnpm** as its package manager. Not npm, not yarn, not bun. No
exceptions, no per-repo opt-out. All 11+ existing sites already use
pnpm — keep it that way.

If a new repo lands without a `pnpm-lock.yaml`, that's a bug to fix
before merging.

## Why pnpm specifically

The hard requirement is **no duplication of packages on disk** when
11+ sites share dependencies (Astro, Tailwind, Firebase SDK,
oriz-kit, etc.). pnpm is the only manager that solves this cleanly.

| Manager | Disk model | Family fit |
|---|---|---|
| **npm** | Each `node_modules/` is a full copy. 11 sites with Astro = 11 × Astro on disk. | Bad — duplicates everywhere. |
| **yarn classic (v1)** | Same as npm. Hoisted but per-project. | Bad — same duplication problem. |
| **yarn berry (PnP)** | Single `.yarn/cache`, no `node_modules/`. | Compatibility issues — Astro plugins, Firebase SDK, and many TS toolchains break under PnP. |
| **bun** | Fast install, but uses bun's own store and runtime. | Bun runtime is fine for some things; **Astro 6 + Cloudflare Workers compatibility is the open question** and we don't want to be the test case. |
| **pnpm** | One global content-addressable store at `~/.pnpm-store`. Each `node_modules/` is symlinks/hardlinks into the store. | **Best fit.** Standard `node_modules/` shape (max compat), single on-disk copy of every package version (no duplication). |

## How pnpm satisfies "no duplication"

pnpm stores every package version exactly once at
`~/.pnpm-store/v3/files/...` (content-addressable by hash). When a
site does `pnpm install`, pnpm builds a `node_modules/` made of
hardlinks (or symlinks on Windows / non-CoW filesystems) pointing
into the store.

Mental model: it's **pip without venvs**. A package version exists
once on disk; every project that needs it gets a cheap reference,
not a copy.

For the family this means: cloning all 11+ sites and running
`pnpm install` in each leaves `~/.pnpm-store` roughly the size of a
single site's deps, not 11×.

## Cross-refs

- [`always-latest-deps.md`](./always-latest-deps.md) — install policy that pairs with this rule
- [`repos-work-independently.md`](./repos-work-independently.md) — each repo runs `pnpm install` standalone
- [`../runbooks/clean-install.md`](../../runbooks/operations/clean-install.md) — bootstrap procedure
- [`../_okf.md`](../../_okf.md) — OKF conventions
