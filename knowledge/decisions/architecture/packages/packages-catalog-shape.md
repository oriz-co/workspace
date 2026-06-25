---
type: decision
title: "packages.oriz.in shape \u2014 auto-discovery Starlight catalog with showcase\
  \ pages"
description: packages.oriz.in is the auto-discovery Starlight catalog. A GitHub Action
  lists every chirag127/*-npm-pkg repo, fetches README + version + bundle metadata,
  and renders per-package showcase pages with live demo iframe, copy-paste install
  snippet, badge wall, and StackBlitz playground link. Rebuilds daily via cron + on
  tag push from any package repo.
tags:
- decision
- app
- packages-catalog
- starlight
- auto-discovery
- showcase
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/packages/packages-oriz-in-catalog
- decisions/architecture/apps/home-app-shape
- rules/infrastructure/cloudflare-pages-only
---



# packages.oriz.in shape

## The shape

Auto-discovery Starlight catalog. Lives in `oriz-packages-catalog-app` submodule, deployed to CF Pages at `packages.oriz.in`.

This file is the SHOWCASE-PAGE shape companion to [[decisions/architecture/packages-oriz-in-catalog]] (which locked the dual-surface split between `oriz.in/packages` overview and `packages.oriz.in` deep catalog).

## Per-package showcase page

Each `chirag127/*-npm-pkg` repo gets a detail page with:

| Block | Source |
|---|---|
| Live demo iframe | `https://stackblitz.com/edit/<slug>?embed=1&file=index.tsx` — pre-seeded with a minimal usage example pulled from the package's `examples/basic.tsx` if present |
| Copy-paste install snippet | `pnpm add @chirag127/<slug>` (with copy-button) |
| Badge wall | npm version + downloads + bundle size (bundlephobia) + license + GH stars + last commit (Shields.io) |
| README embed | GitHub README live-fetched at build time, MDX-rendered, 24h cache |
| StackBlitz playground link | "Open in StackBlitz" button → full editor |
| Versions table | Recent npm versions + release notes from GH Releases |

## Auto-discovery

GH Action runs daily at 04:00 IST + on `repository_dispatch` from any `*-npm-pkg` repo's `release.yml`:

1. `gh repo list chirag127 --json name,description,topics --jq '[.[]|select(.name|test("-npm-pkg$"))]'`
2. For each: fetch README, latest version, bundle size.
3. Regenerate the catalog content collection.
4. Trigger CF Pages rebuild.

## Why Starlight not custom

Starlight (Astro's docs theme) gives sidebar nav + search + dark mode + breadcrumbs for free. Customising for catalog use means swapping the home page hero + the per-page top section to embed the showcase blocks — everything else stays default.

## Cross-refs

- Dual-location decision (this catalog vs oriz.in/packages overview) → [[decisions/architecture/packages-oriz-in-catalog]]
- home-app links to this catalog → [[decisions/architecture/home-app-shape]]
- Hosting lock → [[rules/cloudflare-pages-only]]
