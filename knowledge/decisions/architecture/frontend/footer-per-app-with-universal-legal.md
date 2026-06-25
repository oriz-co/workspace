---
type: decision
title: Footer per-app design + universal legal section (refines maximalist-footer)
description: "Refines the maximalist-footer decision from earlier same day. Each app\
  \ draws its own footer (per-app visual design, per-app content links related to\
  \ that app's surface area) BUT every footer INCLUDES the universal legal section\
  \ (links to /privacy /terms /contact /about /refunds /disclaimer /sitemap /security.txt\
  \ \u2014 all in-domain). Pattern: each app's footer is its own component; the legal\
  \ section is a shared sub-component `<LegalFooter />` from astro-chrome that drops\
  \ in. Per-app legal pages content is also CUSTOMIZED per app (the app's own copy,\
  \ not generic boilerplate from astro-chrome/legal/*)."
tags:
- decision
- footer
- legal
- per-app
- refinement
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
supersedes_in_part: decisions/architecture/legal-pages-package-in-domain (per-app
  customization)
related:
- decisions/architecture/frontend/maximalist-footer-and-monetization-everywhere
- decisions/architecture/packages/legal-pages-package-in-domain
- rules/design/per-app-distinctive-frontend-design
---



# Footer per-app + universal legal section

## Pattern

Each app's footer = `<AppFooter>` (per-app component, drawn to that app's design brief) + `<LegalFooter>` (shared sub-component from `@chirag127/astro-chrome/legal/LegalFooter.astro`).

```astro
<!-- per-app Footer.astro -->
<footer class="janaushdhi-footer">
  <!-- per-app links: Browse / Find substitute / Stores / etc -->
  <section class="app-section">...</section>
  <!-- per-app brand block: wordmark, tagline, social -->
  <section class="brand-section">...</section>
  <!-- universal legal section (shared sub-component) -->
  <LegalFooter />
</footer>
```

## What's per-app

- Visual design (palette, type, layout)
- Links specific to that app's surface area (e.g. janaushdhi: Browse / Find substitute / Stores; blog: Categories / Recent / Tags; tools: Tool categories)
- Brand block (wordmark, app-specific tagline)

## What's universal (via `<LegalFooter />`)

- /privacy
- /terms
- /contact
- /about (per-app /about content but link is universal)
- /refunds
- /disclaimer
- /sitemap-index.xml
- /security.txt

## Legal pages CONTENT is customized per app

User mandate: "But the legal pages will also be specified specifically for all of them, and made specifically for all of them."

`@chirag127/astro-chrome/legal/Privacy.astro` provides the GENERIC scaffold; each app overrides per-app legal content. Mechanism:

1. Each app has its own `src/pages/privacy.astro` (already exists per legal-pages-package decision)
2. The page imports `Privacy` from astro-chrome BUT passes app-specific props (appName, appDomain, jurisdiction, specific-data-collected, third-parties, contact email)
3. The Privacy.astro component renders the boilerplate text + injects app-specific sections via props
4. Customization: each app can OVERRIDE the entire `<Privacy />` with its own page if the standard template doesn't fit (e.g. janaushdhi has medical-data-specific clauses)

## Supersedes-in-part

- `maximalist-footer-and-monetization-everywhere.md` (the "all apps same footer" wording) — footer is now per-app design + universal legal section
- `legal-pages-package-in-domain.md` — per-app legal content customization clarified

## Cross-refs

- Maximalist-footer reversal → [[decisions/architecture/maximalist-footer-and-monetization-everywhere]]
- Legal pages package → [[decisions/architecture/legal-pages-package-in-domain]]
- Per-app distinctive design → [[rules/per-app-distinctive-frontend-design]]
