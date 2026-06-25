---
type: decision
title: Per-app website briefs (2026-06-22 grill lock)
description: "Single source of truth for what each of the 26 apps does + sections\
  \ + features. Locked via grill 2026-06-22 (Q-APP-* + Q-NCERT-* + Q-TOOLS-*). Supersedes\
  \ per-app scope files where they conflict. Renames: oriz-lore-app \u2192 oriz-lore-app\
  \ (broader scope: book/course/documentary summaries, not just books)."
tags:
- decision
- apps
- briefs
- scope
- family-inventory
- supersedes
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- decisions/architecture/apps/ncert-combined-pdf-directory
- decisions/architecture/apps/ncert-dual-mode-download
- decisions/architecture/apps/janaushdhi-app-scope
- decisions/architecture/content/blog-cross-post-strategy
- decisions/architecture/apps/home-app-shape
- decisions/architecture/apps/content-apps-scope
- decisions/architecture/apps/cs-me-app-scope
- decisions/architecture/stack/tools-shape-and-priority
- services/family-inventory
---



# Per-app briefs (canonical, 2026-06-22)

## 1. home-app — oriz.in

- Marketing landing: hero + 5-section grid (/apps, /tools, /books, /packages, /me) + newsletter signup
- **Family-wide unified search bar** at top — searches across 26 apps + 5 books + 22 packages (Pagefind + Algolia hybrid)
- Footer mega-sitemap (package-served, identical everywhere)
- All 4 nav surfaces (Header per-app, Sidebar family-nav slot, BottomBar 5 actions, Footer consolidated)
- v0 priority: SHIP FIRST

## 2. oriz-janaushdhi-app — janaushdhi.oriz.in

- Browse all generic medicines from data.gov.in scrape (filterable table)
- Per-product page with price-history chart (ECharts lazy)
- NO substitute finder (deferred to v1)
- NO store locator (deferred to v1)
- NO ads (public-health ethics)
- v0 priority: SHIP FIRST

## 3. oriz-ncert-app — ncert.oriz.in

- **3-step picker:** Class → Subject → Language
- **Dual-mode download per book:** (1) pre-merged GH Release PDF; (2) client-side on-the-fly merger via pdf-lib; (3) individual chapter links
- Scope v0: ALL classes (Pre-K + 1-5 + 6-10 + 11-12) in English + Hindi
- Scraping phased: local playwright-cli for debugging → cheerio refactor → CI deployment
- Annual cron (June 1 IST) re-scrape
- v0 priority: SHIP FIRST

## 4. oriz-pages-blog-app — blog.oriz.in

- MDX daily posts at `src/content/blog/<YYYY-MM-DD-slug>/index.mdx`
- Series grouping via tag (`/series/<slug>`)
- Giscus comments + reactions per post
- omni-publish auto-cross-post on release to dev.to / Hashnode / Bluesky / Mastodon / Threads / @oriz_announcements
- RSS + Atom + JSON Feed
- v0 priority: SHIP FIRST

## 5. oriz-lore-app — lore.oriz.in (RENAMED from oriz-lore-app)

- **Renamed 2026-06-22.** User mandate: "change the name of the app to lore — it should contain the content only for this which are knowledgeable like documentary and all"
- **Broader scope:** book summaries + course summaries + documentary summaries + lecture series notes + podcast summaries + research-paper digests
- Each entry: type, title, source, key takeaways, my notes, rating, link to original
- Browse by: type / by-year / by-rating / by-topic / by-author
- Pagefind search across all entries
- v1 priority: ship AFTER the 4 priority apps

## 6. oriz-financial-cards-app — financial-cards.oriz.in

- India financial card intelligence (credit + debit + prepaid + travel/forex + corporate + business)
- 750+ credit card profiles live; debit/prepaid/travel/corporate seeded with sample data
- Public read; no auth required
- JSON-on-disk catalog at `data/cards/<type>/<bank>/<card>.json`
- v1 priority

## 7. oriz-roam-journal-app — journal.oriz.in

- Personal Roam-style journal with [[backlinks]]
- Tags + mood tracking
- Public-share specific entries via slug URL
- **RSS feed of public entries → consumed by oriz-cs-me-app /life-log section** (new cross-app integration)
- Auth required for write
- v1 priority

## 8. oriz-cs-me-app — me.oriz.in (a.k.a. cs.oriz.in alias)

- Standard portfolio: resume + projects + writing + contact
- Life log section: /now (monthly update), /uses (tech stack), /reading, /watching, /listening, /movies
- **Pulls from roam-journal RSS** for life-log entries
- "Whatever there can be told about me" — maximum canon
- v1 priority

## 9. oriz-omni-post-app — omni-post.oriz.in

- Admin dashboard for the omni-publish package
- Read-only public catalog of cross-posts at root
- /admin (auth-gated) for retry / edit / queue management
- v1 priority

## 10. oriz-packages-catalog-app — packages.oriz.in

- Auto-discovery of every `chirag127/*-npm-pkg` GitHub repo
- Embed each README + npm + GH + bundlephobia metadata
- Live demo iframes + stackblitz playgrounds + install snippets + badges
- Daily cron + on-tag rebuild
- v0 priority: SHIP FIRST (alongside the 4)

## 11-26. Tools apps (16 total) — *.oriz.in

Per `tools-shape-and-priority.md`: 16 separate subdomains, each is its own repo + CF Pages project.

**Confirmed v0 ship of ALL 16 tools** (2026-06-22 grill):

| Slug | Domain | Core features |
|---|---|---|
| **slice-pdf** | pdf.oriz.in | Slice/merge/compress/convert/sign via pdf-lib (client-side) |
| **pixie-image** | image.oriz.in | Resize/convert/compress/bg-remove (client-side Squoosh-style) |
| **scribe-text** | text.oriz.in | Case convert/counter/diff/encode-decode/lorem/regex tester |
| **grid-qr** | qr.oriz.in | QR generate/scan/bulk/styled/logo embed |
| **paisa-finance** | paisa.oriz.in | FII/DII chart (ECharts) + MMI gauge + credit-card-compare + EMI/tax calc |
| **forge-dev** | dev.oriz.in | JSON tools/JWT decoder/regex/SQL formatter/curl-to-fetch/base64 |
| **shift-convert** | convert.oriz.in | Unit/currency/timezone/number-base converters |
| **dice-random** | random.oriz.in | Random number/dice/password/UUID/coin |
| **cipher-crypto** | crypto.oriz.in | Hash/encrypt/decrypt/HMAC/cert decoder |
| **paper-print** | print.oriz.in | Print preview/PDF-to-printable/page layout/barcode print |
| **vitals-health** | vitals.oriz.in | BMI/BMR/TDEE/nutrition/step calculator |
| **rank-seo** | seo.oriz.in | Keyword density/SERP preview/sitemap validator/robots tester/structured-data validator |
| **reel-video** | video.oriz.in | Video trim/convert/extract-audio/compress/GIF (ffmpeg.wasm) |
| **echo-audio** | audio.oriz.in | Audio convert/trim/extract/pitch/speed |
| **pivot-data** | data.oriz.in | CSV/JSON/Excel converter + sort/filter/group/pivot |
| **\<one more\>** | TBD | TBD — 16th slot pending name |

## Apps NOT shipping in v0 (slug-reservation only)

- oriz-lore-app (was lore-book-summaries) — v1
- oriz-financial-cards-app — v1
- oriz-roam-journal-app — v1
- oriz-cs-me-app — v1
- oriz-omni-post-app — v1

## Total

- v0 ship: home + janaushdhi + ncert + blog + packages-catalog + 16 tools = **21 apps**
- v1 deferred: lore + tabs + roam + cs-me + omni-post = **5 apps**
- **Total: 26 apps**

## Renames + slug changes

Rename `oriz-lore-app` → `oriz-lore-app`:
1. `gh repo rename chirag127/oriz-lore-app oriz-lore-app`
2. Update submodule URL in `.gitmodules`
3. Update submodule path: `git mv repos/oriz/own/prod/apps/content/oriz-lore-app repos/oriz/own/prod/apps/content/oriz-lore-app`
4. Update CNAME from lore.oriz.in → lore.oriz.in (if any DNS exists)
5. Update knowledge cross-refs (10+ files)
6. Update FAMILY_APPS list in astro-shell

## Cross-refs

- ncert combined directory → [[decisions/architecture/ncert-combined-pdf-directory]]
- ncert dual-mode download → [[decisions/architecture/ncert-dual-mode-download]]
- janaushdhi scope → [[decisions/architecture/janaushdhi-app-scope]]
- blog cross-post → [[decisions/architecture/blog-cross-post-strategy]]
- home-app shape → [[decisions/architecture/home-app-shape]]
- content apps scope → [[decisions/architecture/content-apps-scope]]
- cs-me scope → [[decisions/architecture/cs-me-app-scope]]
- tools shape → [[decisions/architecture/tools-shape-and-priority]]
- family inventory (counts) → [[services/family-inventory]]
