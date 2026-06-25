---
type: decision
title: SEO + A11y + CDN + SSL + multi-engine indexing (Q3 2026)
description: "Multi-engine SEO (Google + Bing + Yandex + IndexNow auto-submission)\
  \ + JSON-LD structured data per page + WCAG 2.2 AA + Pa11y CI gate + Lighthouse\
  \ a11y \u226595 required + CF Pages tight cache rules (HTML 1h, assets 1yr, API\
  \ 0) + Brotli + HTTP/3 + CF Universal SSL + HSTS preload submission for oriz.in\
  \ + robots.txt allow-all (including AI scrapers) + single family-wide GA4 property\
  \ with `app` custom dimension."
tags:
- decision
- seo
- accessibility
- cdn
- ssl
- indexnow
- ga4
- structured-data
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- decisions/architecture/stack/stack-picks-2026-06-22
- decisions/architecture/frontend/four-nav-surfaces-every-app
- rules/interaction/match-surrounding-style
---



# SEO + A11y + CDN + SSL

## SEO

**Per-app `sitemap.xml`** (auto via `@astrojs/sitemap`).
**Family-wide `sitemap-index.xml`** at `oriz.in/sitemap-index.xml` lists all per-app sitemaps. Submit ONCE to GSC + BWT + Yandex Webmaster.
**IndexNow auto-submission:** on every Astro build, ping `api.indexnow.org` with new/updated URLs. Covers Bing + Yandex automatically; no per-engine setup. Free.
**JSON-LD structured data** per page type:
- `BlogPosting` for blog
- `Product` for packages.oriz.in entries
- `Book` for books.oriz.in
- `WebSite` + `Organization` family-wide on home-app
- `BreadcrumbList` on deep pages
- `Article` for content apps (ncert/lore/janaushdhi)
**Open Graph + Twitter Cards** per page via `<SEO />` from astro-chrome. 1200×630 cover image auto-generated per page (satori OG image gen, MIT, free).

## A11y

**WCAG 2.2 AA** target on every page. Enforced via:
- **Pa11y CI** GH Action that fails build on violations
- **Lighthouse CI** that fails build if a11y score <95
- **axe-core** in dev mode (console warnings)
- **Manual screen-reader pass** for each app's first release (NVDA on Windows; the user's stack)

Components:
- Lucide/Iconify icons all carry `aria-label` per Iconify schema
- Forms via React Hook Form + Zod with auto-generated `aria-describedby`
- Color contrast: 4.5:1 minimum (tokens already meet this in `astro-shell/tokens.css`)
- Keyboard navigation: every interactive surface tabbable; skip-link at top of every page

## CDN cache rules (Cloudflare Pages)

Tight cache per surface:
- HTML (`*.html`, `/`, `/<slug>/`): `Cache-Control: public, max-age=3600, s-maxage=3600`
- Static assets (`*.{js,css,svg,png,woff2,webp}`): `public, max-age=31536000, immutable` (1-year + hashed filenames)
- API responses (`/api/*`): `no-store` (always fresh)
- Sitemap, robots, feeds: `public, max-age=3600`

Brotli compression ON family-wide. HTTP/3 + 0-RTT enabled. Early Hints ON.

## SSL + HSTS

**Cloudflare Universal SSL** (free, auto-renewed). Always-on full-strict mode.
**HSTS preload submission** for `oriz.in` once production is stable:
- Header: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- Submit to `hstspreload.org` after 30 days of clean deployment

## Robots.txt

**Allow all** including AI scrapers (GPTBot, CCBot, anthropic-bot, PerplexityBot, Google-Extended). Goal: maximum reach into AI training data + standard search engines.

```
User-agent: *
Allow: /
Sitemap: https://oriz.in/sitemap-index.xml
```

## Analytics (GA4 + CF Web Analytics + Clarity)

Per `stack-picks-2026-06-22`:
- **Single GA4 property family-wide.** Custom dimension `app` per app. Cross-app funnel analysis works.
- **CF Web Analytics:** free, cookieless. Per `*.oriz.in` subdomain.
- **Microsoft Clarity:** free heatmaps + session replay. Per subdomain.

All three loaded via Klaro consent gating in EU/UK; default-on elsewhere.

## Cross-refs

- Stack picks → [[decisions/architecture/stack-picks-2026-06-22]]
- 4-nav-surfaces → [[decisions/architecture/four-nav-surfaces-every-app]]
- Consent (Klaro) → [[decisions/security/consent-management-multi-category]]
