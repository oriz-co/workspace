---
type: rule
title: Design divergence is NOT duplication
description: "Per-app design-brief variants (Header, Wordmark, blog's MultiSearch,\
  \ blog's astro.config) are intentionally divergent across apps and must NOT be forced\
  \ into generic slot-based components. Footer is the ONE exception: it's a family-wide\
  \ mega-sitemap and IS consolidated. The 25-lines \xD7 3-apps dedup threshold applies\
  \ to TRUE duplicates, not to components that share a name but implement different\
  \ design briefs."
tags:
- rules
- design-system
- dedup
- packages
- components
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/the-23-packages
- decisions/architecture/frontend/four-nav-surfaces-every-app
- decisions/design/datasheet-dark
- rules/interaction/match-surrounding-style
---



# Design divergence is NOT duplication

> **2026-06-22 update (sweep #5).** This rule was correct all along but was violated by sweep #3 (which deleted vendored `Header/Footer/Wordmark.astro` from 9 apps in favour of `@chirag127/astro-chrome` shared components) and sweep #4 (which extended the consolidation through `Layout.astro`). The user grilled the policy on 2026-06-22 (Q1-Q8) and locked the following:
>
> | Surface | Policy |
> |---|---|
> | Header | **Fully divergent per-app** — restore local `Header.astro` per app |
> | Wordmark | **Fully divergent per-app** — restore local `Wordmark.astro` per app |
> | Sidebar | **Same CSS/drawer structure from package**, **per-app slot content** |
> | Footer | **Identical mega-sitemap family-wide** — only true consolidation; keep package import |
> | BottomBar | **Same CSS structure from package**, **per-app `actions` prop** |
>
> Sweep #5 (2026-06-22) reverted the per-app chrome loss across 10 apps while keeping the Footer + BottomBar structural consolidation. Footer is the *only* surface that is fully consolidated; the others are *structurally* consolidated but *content-divergent*.

The dedup-sweep threshold for extracting shared code into an
`@chirag127/*` package is **≥25 lines duplicated across ≥3 consumers
AND no community library covers it** (see
[`the-23-packages`](../../architecture/packages/the-23-packages.md)).

That threshold applies to **TRUE duplicates** — byte-identical or
trivially-parameterisable code. It does NOT apply to components that
share a *name* but implement a different *design brief* per app.

## Components currently kept per-app on purpose

| Component | Why divergent |
|---|---|
| `Header` | Each app's nav, logo treatment, and mode (sticky / static / translucent) is part of its design brief. hub's broadsheet, blog's HeaderControls, tools' category tabs are all different. |
| `Wordmark` | Per-app brand stamp ("ORIZ · pdf", "ORIZ · paisa", etc.) per [datasheet-dark](../../decisions/design/datasheet-dark.md) |
| `AppSidebarContent` | The Sidebar drawer/CSS comes from the package, but the *content* slotted into it is per-app (finance nav, PDF tools list, hub family mega-nav, etc.) |
| `bottomBarActions` | The BottomBar shell comes from the package, but the 4-5 `actions` are per-app |
| blog's `MultiSearch` | Blog-specific search providers + result formatting; not a fit for the kit's generic `<MultiSearch />` |
| blog's `astro.config` | Blog uses `@astrojs/mdx` + RSS plugins others don't need |

## Components consolidated family-wide

| Component | Why identical |
|---|---|
| `Footer` | Mega-sitemap is identical across every app — same apps list, same books list, same packages list, same legal/support links. The single true consolidation. |
| `Sidebar.astro` (shell) | Drawer + responsive logic is the same; only the slotted content varies. |
| `BottomBar.astro` (shell) | 56px fixed-bottom mobile bar is the same; only the `actions` array varies. |

## When unification would cost more than divergence

A generic slot-based component (`<Header><slot name="logo"/><slot
name="nav"/></Header>`) with N apps each supplying a slot config can
easily be **larger** than the N variants combined — once you count
the slot wiring, prop drilling, and per-app config files. The unified
component "wins" only when the variants are mostly identical and the
divergence is data-shaped (text strings, link arrays). When the
divergence is layout-shaped (different DOM structure per app), keep
the variants.

## Heuristic before forcing consolidation

1. **Diff the candidates line-by-line.** If <25 lines repeat literally
   across <3 apps, do not consolidate.
2. **Estimate the slot-API line count.** If `(slot wiring + per-app
   configs) ≥ Σ(variants)`, the consolidation is a net loss.
3. **Check the design brief.** If the per-app design brief actually
   specifies a different layout, the divergence is the feature.

## See also

- [`the-23-packages`](../../architecture/packages/the-23-packages.md) — the 25 × 3 threshold for true duplicates
- [`datasheet-dark`](../../decisions/design/datasheet-dark.md) — family-wide tokens stay shared; per-app chrome stays per-app
- [`match-surrounding-style`](../interaction/match-surrounding-style.md) — sibling rule for style discipline per file
