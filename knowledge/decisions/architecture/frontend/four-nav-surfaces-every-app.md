---
type: decision
title: 'Every app ships all 4 navigation surfaces: Header + Footer + Sidebar + BottomBar'
description: 'Every oriz app must include all 4 navigation surfaces (Header at top,
  Footer at bottom, Sidebar at side, BottomBar mobile-tab-bar at bottom-fixed) so
  users have maximum navigation options. The 4 surfaces share a family-wide STRUCTURE
  (CSS/responsive/breakpoints from @chirag127/astro-chrome) but content divergence
  is per-app: Header is fully divergent (per-app file), Sidebar + BottomBar use the
  package''s shell with per-app slot content / per-app actions, Footer is the single
  fully-consolidated surface (mega-sitemap).'
tags:
- decision
- navigation
- design-system
- package
- family-wide
- mobile-first
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- decisions/architecture/single-pricing-page-package.md
- rules/design/design-divergence-vs-dedup
- rules/agent/confirm-knowledge-deltas
---



# All 4 navigation surfaces on every app

## Decision

Every app in the oriz family ships ALL FOUR navigation surfaces. No app is allowed to drop any of them. The set:

1. **Header** (top of page) — narrow, very few buttons. Wordmark + login chip + 2-3 critical links only.
2. **Footer** (bottom of page, end of content) — mega-sitemap. Every app, every book, every package, support, newsletter.
3. **Sidebar** (left or right, collapsible) — per-app nav (sections, chapters, tools). On mobile: hidden under hamburger drawer.
4. **BottomBar** (bottom-fixed, mobile-only) — primary actions for the current app (4-5 icons). Hidden on desktop.

User mandate: "It doesn't matter just to include everything into every website. The header will be including only few buttons."

## Structure family-wide, content per-app (2026-06-22 clarification)

The 4 surfaces are *family-wide structure* but *content divergence is per-app*. Sweeps #3 + #4 over-consolidated by making Header itself a single shared component; user grilled the policy (Q1-Q8 on 2026-06-22) and sweep #5 reverted that. The correct mapping:

| Surface | Structural source | Content source | Divergence level |
|---|---|---|---|
| **Header** | none — fully per-app | `<app>/src/components/Header.astro` | FULLY DIVERGENT (hub's broadsheet, blog's HeaderControls, tools' tabs all unique) |
| **Wordmark** | none — fully per-app | `<app>/src/components/Wordmark.astro` | FULLY DIVERGENT |
| **Sidebar** | `@chirag127/astro-chrome/Sidebar.astro` (drawer + responsive CSS) | `<app>/src/components/AppSidebarContent.astro` (slotted in) | structure identical, content per-app |
| **Footer** | `@chirag127/astro-chrome/Footer.astro` | same component | FULLY CONSOLIDATED (mega-sitemap is identical everywhere) |
| **BottomBar** | `@chirag127/astro-chrome/BottomBar.astro` (56px mobile shell) | `<app>/src/data/bottombar-actions.ts` (4-5 actions) | structure identical, actions per-app |

Footer is the only surface where *both* structure and content are shared. The other three share at most their CSS shell.

## Per-app content registry

The per-app content for each app (from sweep #5):

| App | Header design | Sidebar content groups | BottomBar actions |
|---|---|---|---|
| home-app | broadsheet meta-row + FAMILY_SITES nav | apps (by group) + books + packages | Home / Apps / Books / Me / Menu |
| oriz-pages-blog-app | HeaderControls + active-series spine | post categories + recent posts | Home / Latest / Series / Search / Menu |
| oriz-ncert-app | class/subject filter rail | Pre-K + 1-5 + 6-10 + 11-12 + subjects | Home / Classes / Search / Downloads / Menu |
| oriz-lore-app | book search bar | by-genre / by-rating / by-year / by-author | Home / Browse / Latest / Search / Menu |
| oriz-paisa-finance-tools-app | tool category tabs | Calculators / Markets / Guides / Account | Home / Tools / News / Saved / Menu |
| oriz-slice-pdf-tools-app | tool tabs | Slice / Merge / Compress / Convert / Sign + Workspace | Home / Tools / Recent / Saved / Menu |
| oriz-pixie-image-tools-app | tool tabs | Resize / Convert / Compress / Bg-remove + Workspace | Home / Tools / Recent / Saved / Menu |
| oriz-roam-journal-app | section nav drawer | Browse / Views / Account | Home / Today / Tags / Search / Menu |
| oriz-financial-cards-app | terminal bar + sign-in | Credit / Debit / Prepaid / Travel / Corporate / Account | Home / Cards / Compare / Search / Menu |
| oriz-cs-me-app | tab bar (Home/Now/Uses/CV/Contact) | Profile / Work / Interests / Contact | Home / About / Projects / Writing / Menu |

## Why

Maximum navigation paths. Users can reach every surface from any page via any of the 4 surfaces. Different users prefer different navigation styles (top-nav, sidebar, mobile tab-bar) — give them all.

## Architecture (post sweep #5)

Apps compose chrome **explicitly** in `BaseLayout.astro` rather than mounting a single `<Layout>` wrapper from the package — that single wrapper forced the Header to also be shared, which broke the per-app divergence rule.

Per-app BaseLayout pattern:

```astro
---
import Header from '~/components/Header.astro'            // local, fully divergent
import AppSidebarContent from '~/components/AppSidebarContent.astro'  // local slot
import { bottomBarActions } from '~/data/bottombar-actions'           // local
import Sidebar from '@chirag127/astro-chrome/Sidebar.astro'  // shared shell
import Footer from '@chirag127/astro-chrome/Footer.astro'    // fully shared
import BottomBar from '@chirag127/astro-chrome/BottomBar.astro'  // shared shell
import ConsentBanner from '@chirag127/astro-chrome/ConsentBanner.astro'
---
<body>
  <Header />
  <div class="layout-body">
    <Sidebar><AppSidebarContent /></Sidebar>
    <main id="main"><slot /></main>
  </div>
  <Footer />
  <BottomBar actions={bottomBarActions} />
  <ConsentBanner />
</body>
```

Total BaseLayout file: ~100-160 lines per app (head section + chrome composition).

Package exports (`@chirag127/astro-chrome@0.1.5`):
- `./Header.astro` — exists but **NOT used by apps after sweep #5** (kept for potential micro-sites that opt-in to a generic header)
- `./Footer.astro` — used by every app
- `./Sidebar.astro` — used as shell by every app; slot filled with per-app content
- `./BottomBar.astro` — used as shell by every app; `actions` prop is per-app
- `./Layout.astro` — exists but **NOT used by apps after sweep #5** (it implicitly mounts the package Header)
- `./MultiSearch`, `./StatusBanner`, `./AccountPanel`, `./FinishSignIn`, `./ConsentBanner.astro` — React-island / dialog primitives, opt-in per app

## Responsive behaviour

| Surface | Mobile (<768px) | Tablet (768-1024px) | Desktop (>1024px) |
|---|---|---|---|
| Header | 56px sticky, hamburger button | 60px sticky, mini nav | 60px sticky, full nav |
| Footer | Stacked single col | 2 col | 4 col mega-sitemap |
| Sidebar | Hidden, opens via hamburger | Hidden by default, expandable | Visible 240px wide |
| BottomBar | Visible 56px fixed-bottom | Hidden | Hidden |

## Apps with reduced chrome

None. Even `oriz-cs-me-app` and `oriz-janaushdhi-app` (no ads) get all 4 surfaces.

## Cross-refs

- Single pricing page package → [[decisions/architecture/single-pricing-page-package]]
- Design divergence rule (NOT applicable here — chrome is family-wide consolidated, per-app divergence is for in-content design) → [[rules/design-divergence-vs-dedup]]
- Confirmed via knowledge-delta rule in 2026-06-22 conversation → [[rules/confirm-knowledge-deltas]]
