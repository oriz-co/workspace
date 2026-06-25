---
type: decision
title: "NCERT app: dual-mode downloads \u2014 GH Release pre-merged + client-side\
  \ on-the-fly merge"
description: "Both download modes offered: (1) Pre-merged combined PDFs as GitHub\
  \ Release artefacts (free GH bandwidth + CDN); (2) Client-side on-the-fly merger\
  \ using pdf-lib in browser \u2014 user clicks 'Build my book', browser fetches all\
  \ chapter PDFs from ncert.nic.in URLs, merges in browser via pdf-lib WASM, downloads.\
  \ Zero server storage for the on-the-fly path. (3) Individual chapter links also\
  \ exposed for users who want only a few chapters. Three options per book card."
tags:
- decision
- ncert
- pdf-merge
- client-side
- storage
- github-releases
- dual-mode
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
supersedes_in_part: decisions/architecture/ncert-combined-pdf-directory (download
  URL section)
related:
- decisions/architecture/apps/ncert-combined-pdf-directory
- rules/interaction/never-hit-quotas
- rules/interaction/no-card-on-file
---



# NCERT dual-mode download

## Decision

Each book card offers THREE download paths:

1. **Pre-merged PDF** (recommended) — links to GitHub Release asset `class-9-maths-en.pdf`. Fastest, single download, no compute on user device.
2. **Build-my-book on-the-fly** — JS button "Build PDF". Browser fetches all chapter PDFs from ncert.nic.in CORS-permitted URLs, merges client-side using **pdf-lib** (npm `pdf-lib`, MIT, ~200 KB gzip, WASM-backed). User gets a download blob. Zero server storage for this path.
3. **Individual chapters** — collapsible list of per-chapter ncert.nic.in URLs. Users wanting only Ch 5 can grab it.

## Why both pre-merged + on-the-fly

**Pre-merged from GH Releases:**
- Pros: instant, single click, optimized PDFs (qpdf compression on server), uniform filenames
- Cons: requires GH Action ran successfully (we maintain it); GH bandwidth on busy day

**Client-side on-the-fly:**
- Pros: ZERO server storage; always uses live NCERT URLs (auto-updates if NCERT republishes); doesn't depend on us
- Cons: ~30-60s in-browser (depending on book size + network); user needs >100 MB RAM browser; CORS must be permitted by ncert.nic.in for chapter URLs

If ncert.nic.in blocks CORS, fallback only to pre-merged path. We test on first visit and gracefully hide the on-the-fly button if CORS denies.

## Storage math (defends GH Release path)

- 12 classes × ~10 subjects × ~15 chapters × 2 languages ≈ 3,600 chapter PDFs upstream
- Average chapter PDF: 5 MB → 18 GB total upstream
- Merged books: ~600 books × ~50 MB avg = 30 GB
- **GitHub Releases: unlimited bandwidth, ~2 GB per file limit** — fits.
- CF R2 free 10 GB: doesn't fit.
- CF Pages 25 MB per file: doesn't fit.

GH Releases is the only no-card free tier that holds 30 GB.

## pdf-lib client-side merge

```ts
import { PDFDocument } from 'pdf-lib';

async function mergeOnTheFly(chapterUrls: string[]) {
  const merged = await PDFDocument.create();
  for (const url of chapterUrls) {
    const bytes = await fetch(url).then(r => r.arrayBuffer());
    const chap = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(chap, chap.getPageIndices());
    pages.forEach(p => merged.addPage(p));
  }
  const blob = new Blob([await merged.save()], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}
```

~80 LOC of code in `oriz-ncert-app/src/components/BuildMyBook.tsx`. Lazy-loaded only when user clicks "Build PDF" — pdf-lib's 200 KB gzip doesn't hit non-merge pages.

## Scraping mechanism phased rollout

- **Phase 0 (debugging):** local `playwright-cli` skill on user's machine. Verify selectors work, output looks right. Manual run.
- **Phase 1 (production):** replace Playwright with `node-fetch + cheerio` once we've confirmed the page is server-rendered (no JS-required content). Lighter, deterministic.
- **Phase 2 (CI):** GH Action runs cheerio-based scraper on schedule. Playwright remains as fallback if NCERT switches to client-rendered HTML.

User mandate (2026-06-22): "Run playwright-cli local skill for first-time debugging... in the later stage in GitHub Actions we can use cheerio... after verifying that our playwright script works properly after testing."

## Scope v0

ALL classes (Pre-K + 1-5 + 6-10 + 11-12) in English + Hindi. ~600 books. Full launch.

## Cross-refs

- Combined PDF directory decision → [[decisions/architecture/ncert-combined-pdf-directory]]
- Never hit quotas → [[rules/never-hit-quotas]]
- No card on file → [[rules/no-card-on-file]]
