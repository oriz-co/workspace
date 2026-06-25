---
type: decision
title: 'Footer column structure: 5 columns (4 standard + 1 per-app), 4/2/1 responsive,
  accordion default-closed mobile'
description: "Each app's footer (per-app visual per FINAL decision) has 5 columns:\
  \ 4 standard (Legal / Family / Connect / Brand) + 1 per-app-specific. Desktop \u2265\
  1024px = 5-column grid. Tablet 768-1023px = 2-column grid (pairs of 2-3 cols stacked).\
  \ Mobile <768px = single accordion (default-closed; tap to expand). Family column\
  \ shows individual links to other oriz apps + tools + books + packages (mini sitemap)."
tags:
- decision
- footer
- columns
- responsive
- accordion
- multi-column
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- decisions/architecture/frontend/final-per-app-visual-shared-behavior
- rules/design/per-app-distinctive-frontend-design
---



# Footer multi-column structure

## Locked structure (2026-06-22 evening)

Every app's footer = 5 columns total:

| # | Column | Content | Source |
|---|---|---|---|
| 1 | **Legal** | /privacy /terms /contact /about /refunds /disclaimer (6 standard links) | per-app file; same 6 link names everywhere |
| 2 | **Family** | Individual links to other oriz apps + tools + books + packages (mini sitemap) | per-app rendered from FAMILY_APPS/BOOKS/PACKAGES |
| 3 | **Connect** | Newsletter / RSS / GitHub / Sponsors / Telegram channels | per-app brand-specific |
| 4 | **Brand** | Wordmark + 1-line bio + © year + back-to-top | per-app brand-specific |
| 5 | **Per-app** | App-specific content: blog gets Categories/Recent/Tags; ncert gets Classes; janaushdhi gets Browse; tools get Tool categories; cs-me gets life-log; etc. | fully per-app |

## Responsive

| Breakpoint | Layout |
|---|---|
| `≥1024px` (desktop) | 5-column CSS grid |
| `768-1023px` (tablet) | 2-column grid (3 cols + 2 cols, OR 2-2-1) |
| `<768px` (mobile) | Single accordion; each column = `<details>` collapsed by default; tap to expand |

## Visual is per-app

Per `final-per-app-visual-shared-behavior.md`: each app draws its own footer component (`src/components/Footer.astro`) with its own palette + type + spacing. The 5-column STRUCTURE is the standard; everything else (typography, dividers, hover, animation, background, ordering, label style) is per-app.

## Family column rendering

The Family column on every app renders links to OTHER apps (mini sitemap). Data source: `@chirag127/astro-shell/family-data` (which exports `FAMILY_APPS`, `FAMILY_BOOKS`, `FAMILY_PACKAGES`, `FAMILY_TOOLS` arrays — kept shared per the FINAL decision because data is data, not visual). Each app's footer imports the data + renders it in its own visual treatment.

## Implementation

```astro
---
// app's own src/components/Footer.astro
import { FAMILY_APPS, FAMILY_BOOKS, FAMILY_PACKAGES, FAMILY_TOOLS } from '@chirag127/astro-shell/family-data';
---
<footer class="app-footer">
  <div class="footer-grid">
    <!-- Column 1: Legal -->
    <section><h3>Legal</h3>
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
      <a href="/contact">Contact</a>
      <a href="/about">About</a>
      <a href="/refunds">Refunds</a>
      <a href="/disclaimer">Disclaimer</a>
    </section>
    <!-- Column 2: Family -->
    <section><h3>Family</h3>
      {FAMILY_APPS.map(app => <a href={app.url}>{app.name}</a>)}
    </section>
    <!-- Column 3: Connect -->
    <section><h3>Connect</h3>
      <a href="/newsletter">Newsletter</a>
      <a href="/feed.xml">RSS</a>
      <a href="https://github.com/chirag127">GitHub</a>
      <a href="https://github.com/sponsors/chirag127">Sponsors</a>
      <a href="https://t.me/oriz_announcements">Telegram</a>
    </section>
    <!-- Column 4: Brand -->
    <section><h3>Oriz</h3>
      <p class="bio">A self-built family.</p>
      <p>© 2026</p>
      <a href="#top">↑ Top</a>
    </section>
    <!-- Column 5: Per-app -->
    <section><h3>This app</h3>
      <!-- e.g. for blog: -->
      <a href="/blog/category/engineering">Engineering</a>
      <a href="/blog/category/finance">Finance</a>
      ...
    </section>
  </div>
</footer>
<style>
  .footer-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 2rem; }
  @media (max-width: 1023px) { .footer-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 767px) {
    .footer-grid { display: block; }
    section { display: block; }
    section > h3 { /* tap target */ cursor: pointer; }
    /* Accordion: collapse via <details> wrapping in actual JSX */
  }
</style>
```

Mobile: replace `<section>` with `<details>` + `<summary>` for accordion.

## Cross-refs

- FINAL per-app visual policy → [[decisions/architecture/final-per-app-visual-shared-behavior]]
- Per-app distinctive design → [[rules/per-app-distinctive-frontend-design]]
