---
type: decision
title: "SEO \u2014 three pillars: sitemap + IndexNow + JSON-LD"
description: 'Every family site ships all three SEO pillars: @astrojs/sitemap (discovery),
  IndexNow (instant indexing), and JSON-LD structured data (semantic). Submitted to
  Google Search Console + Bing Webmaster Tools. All free, all no-card.'
tags:
- decisions
- architecture
- seo
- sitemap
- indexnow
- json-ld
- structured-data
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/seo/astrojs-sitemap
- services/seo/indexnow
- services/seo/json-ld-structured-data
- services/seo/google-search-console
- services/seo/bing-webmaster
- decisions/architecture/general/cross-post-engine
- glossary/o-r/oriz-kit
---



# SEO — three pillars: sitemap + IndexNow + JSON-LD

## Decision

Every chirag127/oriz family site ships **all three** SEO pillars,
not a subset:

1. **Sitemap** —
   [`@astrojs/sitemap`](../../../services/seo/astrojs-sitemap.md)
   generates `sitemap-index.xml` + `sitemap-0.xml` at `astro build`
   time. Submitted once per property to
   [Google Search Console](../../../services/seo/google-search-console.md)
   and [Bing Webmaster Tools](../../../services/seo/bing-webmaster.md).
2. **IndexNow** — [`/og`-style POST hook](../../../services/seo/indexnow.md)
   from [`oriz-omnipost`](../../../glossary/o-r/omnipost.md) fires the
   instant a new URL is published / edited / deleted. Notifies Bing
   + Yandex + Seznam + Naver in milliseconds.
3. **JSON-LD structured data** —
   [`<JsonLd type="..." data={{...}} />`](../../../services/seo/json-ld-structured-data.md)
   component in [`@chirag127/oriz-kit`](../../../glossary/o-r/oriz-kit.md)
   (forward reference — lands in oriz-kit's next release) emits
   schema.org markup for `Article`, `BreadcrumbList`,
   `Organization`, `WebSite`, and `Person`.

Submitted into both consoles —
[Google Search Console](../../../services/seo/google-search-console.md)
+ [Bing Webmaster Tools](../../../services/seo/bing-webmaster.md) —
which together cover Google + Bing + DuckDuckGo + Yandex.

## Why

Each pillar fixes a different failure mode; doing fewer than all
three leaves a known gap.

- **Without a sitemap**, deep pages hide behind crawl-graph hops
  and can sit unindexed for weeks.
- **Without IndexNow**, new URLs wait for the next crawl
  (hours-days on Bing, days on Google) before they're discoverable
  through search.
- **Without JSON-LD**, pages don't qualify for rich-result UIs
  (article cards, breadcrumb chips, sitelink search box,
  knowledge-panel author boxes) and AI crawlers can't reliably
  identify what a page *is*.

All three pillars are **free, no-card, and stack-cohesive** with
the family's existing setup:

- `@astrojs/sitemap` is a one-line addition to every site's
  `astro.config.mjs`.
- IndexNow is a single POST inside `oriz-omnipost`'s existing
  publish-hook loop.
- `<JsonLd>` lives in oriz-kit, so a schema fix lands family-wide
  in one kit version bump.

## Implications

- **Per-site sitemap config**: `astro.config.mjs` declares
  `site:` (canonical URL) + the sitemap integration. The
  `pages-mirror.yml` build mirrors the `dist/` output to GitHub
  Pages so the static-fallback mirror also has a sitemap.
- **Per-site IndexNow key**: generated once, stored in
  [Doppler](../../../services/secrets/doppler.md) as
  `INDEXNOW_KEY_<sitename>`, mirrored to GitHub Secrets +
  Cloudflare Worker secrets. The site hosts `<key>.txt` at the
  apex.
- **`oriz-omnipost` adds an `IndexNowAdapter`**: alongside the
  existing dev.to / hashnode / short-link adapters. Idempotent on
  RSS `<guid>` per
  [`decisions/architecture/cross-post-engine.md`](../general/cross-post-engine.md).
- **`<JsonLd>` ships in oriz-kit's next release** as a forward
  reference. Today, the component does not exist; the decision
  locks the contract so the kit PR is small and the sites can
  adopt without a contract negotiation.
- **Five schema types are the family-wide canon**: `Article`,
  `BreadcrumbList`, `Organization`, `WebSite`, `Person`. Any
  additional types (e.g. `Book` for `oriz-books`, `SoftwareApplication`
  for extensions) get added per site as one-off JSON-LD blocks
  using the same `<JsonLd>` component with custom `type=`.
- **Both consoles** verified at the apex `oriz.in` Domain
  property — one DNS TXT record covers every subdomain via
  [Cloudflare DNS](../../../services/domain/cloudflare-dns.md).
- **No card** anywhere across the five layers. All five fit the
  [no-card-on-file rule](../../../rules/interaction/no-card-on-file.md) and the
  no-paid-tier rule.

## Cross-refs

- [services/seo/astrojs-sitemap.md](../../../services/seo/astrojs-sitemap.md)
- [services/seo/indexnow.md](../../../services/seo/indexnow.md)
- [services/seo/json-ld-structured-data.md](../../../services/seo/json-ld-structured-data.md)
- [services/seo/google-search-console.md](../../../services/seo/google-search-console.md)
- [services/seo/bing-webmaster.md](../../../services/seo/bing-webmaster.md)
- [services/seo/index.md](../../../services/seo/index.md) — bucket overview
- [decisions/architecture/cross-post-engine.md](../general/cross-post-engine.md) — oriz-omnipost fires IndexNow
- [glossary/o-r/oriz-kit.md](../../../glossary/o-r/oriz-kit.md) — `<JsonLd>` component (forward reference)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
