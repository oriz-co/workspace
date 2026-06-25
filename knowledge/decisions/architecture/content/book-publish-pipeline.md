---
type: decision
title: "Book publish pipeline \u2014 Markua .md \u2192 5 channels via @chirag127/oriz-book-build\
  \ + omni-publish"
description: "Books in the chirag127/oriz family are written as Markua-flavoured Markdown\
  \ (Leanpub-compatible), built by the new @chirag127/oriz-book-build npm package\
  \ (17th family package) which wraps Pandoc to emit EPUB3 + PDF + MOBI artefacts.\
  \ omni-publish takes those artefacts and fans out to 5 channels: Leanpub (Markua\
  \ git push, 80% royalty) + Draft2Digital aggregator (manual upload, documented)\
  \ + Gumroad (API auto, 10%) + LemonSqueezy (API auto, 5%+50\xA2 MoR) + Amazon KDP\
  \ (browser-uploader bot, no API). Plus Google Play Books Partner Center (manual\
  \ upload, ISBN-recommended). 5 first books locked, all brand-first naming. Prose\
  \ licensed CC-BY-NC-ND 4.0 + code samples MIT."
tags:
- decision
- books
- publishing
- markua
- pandoc
- oriz-book-build
- leanpub
- kdp
- gumroad
- lemonsqueezy
- draft2digital
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/general/revenue-channels-2026
- decisions/architecture/packages/omni-publish-package
- architecture/packages/the-23-packages
- decisions/architecture/general/mit-license-all-repos
---



# Book publish pipeline

## Decision

Books are written in `.md` files using **Markua-flavoured Markdown** (a Leanpub-friendly Markdown superset). The new npm package [`@chirag127/oriz-book-build`](https://www.npmjs.com/package/@chirag127/oriz-book-build) (v0.1.0, 17th family package) wraps **Pandoc** to emit **EPUB3 + PDF + MOBI** from `manuscript/*.md` into `dist/`. On every tag push (`v*.*.*`) in a book repo, [`@chirag127/omni-publish`](../packages/omni-publish-package.md) takes the dist artefacts and fans out to 5 channels:

1. **Leanpub** — Markua git push to manuscript branch, [80% royalty - 50¢/sale](https://leanpub.com/help/author_help#section-royalty)
2. **Draft2Digital** — aggregator distributing to B&N / Kobo / Apple Books / Scribd; [no API — manual upload, documented in book.json](https://www.draft2digital.com/help/)
3. **Gumroad** — REST API automated, 10% flat fee
4. **LemonSqueezy** — REST API automated, 5% + 50¢ Merchant-of-Record (handles EU VAT)
5. **Amazon KDP** — [no public API ever existed](https://kdp.amazon.com/community/help/topic-list); browser-uploader bot via Playwright on Linux CI

Plus **Google Play Books Partner Center** (manual upload, ISBN-recommended; tracked in book.json but flagged as manual, not auto).

## Book repo layout

Standard layout for every `chirag127/<slug>-book` repo:

```
<slug>-book/
├── manuscript/
│   ├── 00-frontmatter.md
│   ├── 01-introduction.md
│   ├── 02-chapter-one.md
│   ├── ...
│   └── 99-backmatter.md
├── assets/
│   ├── cover-2560x1600.png
│   ├── cover-1600x2560.jpg     # KDP front cover
│   └── figures/
├── book.json                    # metadata + per-channel publish toggles
├── LICENSE                      # CC-BY-NC-ND 4.0 (prose) + MIT (code samples)
├── README.md                    # cover + sample chapter excerpt + buy links
└── .github/workflows/
    └── release.yml              # tag-push → oriz-book-build → omni-publish
```

`book.json` shape:

```json
{
  "title": "Oriz Stack",
  "subtitle": "Astro 6 + Cloudflare + Firebase Spark for the indie developer",
  "author": "Chirag Singhal",
  "isbn_print": null,
  "isbn_ebook": null,
  "price_base_usd": 19,
  "price_pro_usd": 39,
  "price_base_inr": null,
  "price_pro_inr": null,
  "channels": {
    "leanpub": { "enabled": true, "slug": "oriz-stack" },
    "gumroad": { "enabled": true, "product_id": null },
    "lemonsqueezy": { "enabled": true, "variant_id": null },
    "draft2digital": { "enabled": true, "manual": true, "note": "no API; upload EPUB+cover from dist/ after each release" },
    "kdp": { "enabled": true, "manual_bot": true, "asin": null },
    "google_play_books": { "enabled": false, "manual": true, "note": "ISBN required" }
  }
}
```

## Naming convention

**Mixed by audience.** Three patterns are valid:

1. **Brand-first (`Oriz <Topic>`)** — tool-companion and family-aligned books. The 5 locked first books all use this.
2. **Descriptive** — general SEO-bait books not tied to the Oriz brand. Reserved for future.
3. **Author-first** — personal essays. Currently unused; could surface in future.

For now: **all 5 locked books are brand-first.**

## Slug suffix

Repo slug: `chirag127/<slug>-book` (matches family `<role>-suffix` convention per [`repo-naming-suffixes`](../../branding/repo-naming-suffixes.md)). On-disk path: `repos/oriz/own/content/books/<slug>-book/`.

## Pricing

Tiered by category to match buyer purchasing power:

| Category | Base | Pro / extended | Examples |
|---|---|---|---|
| Technical (English-speaking audience) | $19 | $39 (Pro bundle = book + code repo access + Discord) | Oriz Stack, Oriz PWA Playbook |
| Indian-market finance/education | ₹499 | ₹999 (Pro = book + spreadsheet templates + 1-month support) | Oriz Paisa, Oriz NCERT, Oriz Janaushdhi |
| Personal essays | $9 PWYW from $0 floor | n/a | Oriz Me |
| Tool-companion (single-product walkthrough) | $14 | n/a | Oriz PDF |

PWYW handled by Gumroad's "pay what you want" toggle + LemonSqueezy custom pricing. Leanpub's variable-pricing minimum is set to $0 with suggested at the base price.

## The locked 5 books

### 1. Oriz Stack

- **Subject**: Astro 6 + Cloudflare Pages + Firebase Spark family architecture; how the 17 packages compose; the 5-tier analytics + payment matrix + omni-publish + book-build pipelines
- **Audience**: indie developers, hobbyist OSS authors, "$0/mo SaaS" builders
- **Pricing**: $19 base / $39 Pro
- **Channels**: Leanpub + Gumroad + LemonSqueezy + KDP + Google Play Books
- **Repo**: `chirag127/oriz-stack-book` → `repos/oriz/own/content/books/oriz-stack-book/`

### 2. Oriz Paisa: Credit Cards India 2026

- **Subject**: cards-app companion. Card reviews, reward optimisation, fee-waiver tactics, RBI rules, NCB / SBI / HDFC / Amex landscape
- **Audience**: Indian consumers
- **Pricing**: ₹499 base / ₹999 Pro (includes spreadsheet templates + monthly card-rec email)
- **Channels**: KDP (primary — Amazon India dominant) + Gumroad (UPI support) + D2D (international Indian-diaspora via B&N/Kobo/Apple) + Google Play Books (large in India)
- **Repo**: `chirag127/oriz-paisa-book` → `repos/oriz/own/content/books/oriz-paisa-book/`

### 3. Oriz PDF: From Browser to Native

- **Subject**: PWA → PWABuilder → Play Store walkthrough using the actual `oriz-pdf-tools-app` as the running example. Includes Bubblewrap TWA, asset-link verification, Play Console first-publish gotchas
- **Audience**: developers shipping their first PWA-as-native
- **Pricing**: $14 (single-tier; deliberately cheaper than Oriz Stack — narrower scope)
- **Channels**: Leanpub + Gumroad + LemonSqueezy + KDP
- **Repo**: `chirag127/oriz-pdf-book` → `repos/oriz/own/content/books/oriz-pdf-book/`

### 4. Oriz Janaushdhi: Generic Medicines India

- **Subject**: janaushdhi-app companion; PMBJP scheme, generic vs branded pricing, finding nearest Kendra, prescription-reading tips for substitution
- **Audience**: Indian patients / caregivers, particularly Tier-2/3 cities
- **Pricing**: ₹299 single-tier (deliberately cheap — public-health utility)
- **Channels**: KDP (Amazon India) + Gumroad (UPI) + Google Play Books
- **Repo**: `chirag127/oriz-janaushdhi-book` → `repos/oriz/own/content/books/oriz-janaushdhi-book/`

### 5. Oriz Me: 100-Year Strategy

- **Subject**: personal essays sourced from `oriz-cs-me-app` lifestream content + the 100-year-strategy decision doc. Tone: philosophical, archival, written to be read in 2126 as much as today
- **Audience**: longform-essay readers, lifestream-curious devs, friends + family
- **Pricing**: $9 PWYW from $0 floor (free if requested; suggested $9)
- **Channels**: Gumroad + LemonSqueezy + Leanpub + Substack (manual mirror — Substack has no automated publish API for paid posts)
- **Repo**: `chirag127/oriz-me-book` → `repos/oriz/own/content/books/oriz-me-book/`

## License

**Dual license — CC-BY-NC-ND 4.0 (prose) + MIT (code samples).** Source-available for transparency; commercial rights retained on prose. Code samples are MIT so readers can copy them into their own projects without further attribution beyond the standard MIT notice.

LICENSE file format:

```
# License

## Prose (manuscript/**)

Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International
(CC-BY-NC-ND 4.0).
<https://creativecommons.org/licenses/by-nc-nd/4.0/>

## Code samples (any fenced code block, plus examples/**)

MIT License — Copyright (c) 2026 Chirag Singhal
<https://opensource.org/licenses/MIT>
```

## Build CLI

[`@chirag127/oriz-book-build`](https://www.npmjs.com/package/@chirag127/oriz-book-build) v0.1.0 stub published 2026-06-21 alongside this decision.

- Bin entries:
  - `oriz-book build` — reads `manuscript/`, writes EPUB3 + PDF + MOBI to `dist/`
  - `oriz-book preview` — local dev with live-reload of HTML preview
- Wraps **Pandoc** with Markua-flavoured input + opinionated presets:
  - EPUB3: `--toc --toc-depth=2 --css=.../epub.css --embed-fonts`
  - PDF: LaTeX via `tectonic` (Linux-only, no MacTeX/MikTeX); A5 page, Iosevka body
  - MOBI: via `kindlegen` shim or Calibre's `ebook-convert` if `kindlegen` is gone
- Pandoc + tectonic + Calibre install lines documented in the package README. All Linux-only per [`rules/linux-ci-only`](../../../rules/interaction/linux-ci-only.md).

## omni-publish integration

Book repo's `.github/workflows/release.yml` on `v*.*.*` tag push:

```yaml
jobs:
  build-and-publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: pnpm install
      - run: pnpm oriz-book build
      - uses: chirag127/omni-publish-npm-pkg/.github/workflows/cross-post.yml@main
        with:
          title: "${{ github.event.head_commit.message }}"
          body_path: "RELEASE_NOTES.md"
          canonical_url: "https://github.com/${{ github.repository }}/releases/tag/${{ github.ref_name }}"
          type: "book"
          dist_dir: "dist"
        secrets: inherit
```

omni-publish reads `book.json` from repo root, then dispatches each channel's adapter with the relevant dist artefact (EPUB to Leanpub/D2D/KDP/Google, PDF to Gumroad/LemonSqueezy, MOBI optional). Channels marked `enabled: false` or `manual: true` skip auto-publish but log a Telegram drafts-channel message with the dist file path + upload-URL reminder.

## Cross-refs

- The fan-out matrix this pipeline plugs into → [[decisions/architecture/revenue-channels-2026]]
- The npm package that orchestrates publish → [[decisions/architecture/omni-publish-package]]
- The 18-package set (oriz-book-build is the 17th of 18) → [[architecture/the-23-packages]]
- The MIT relicense that allows code samples to ship MIT inside prose books → [[decisions/architecture/mit-license-all-repos]]
- Repo slug convention (`-book` suffix) → [[branding/repo-naming-suffixes]]
- Linux-only CI rule (Pandoc + tectonic stack) → [[rules/linux-ci-only]]
