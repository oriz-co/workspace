---
type: decision
title: "ncert.oriz.in app \u2014 combined PDF directory (scrape + merge + release)"
description: "ncert.nic.in only offers per-chapter PDFs. ncert.oriz.in's reason-to-exist\
  \ is to provide COMBINED whole-book PDFs that don't exist anywhere else. GH Action\
  \ scrapes https://ncert.nic.in/textbook.php via Playwright (using the playwright-cli\
  \ skill or playwright-mcp), enumerates every Class \xD7 Subject \xD7 Language combination,\
  \ downloads each chapter PDF, merges them in correct order using pdftk/qpdf, names\
  \ the output {class}-{subject}-{lang}.pdf, releases on GitHub as artefacts. Website\
  \ is the catalog UI that links to GH release URLs. Sorted properly so downloads\
  \ are obvious. Languages: English + Hindi (other regional NCERTs deferred to v1)."
tags:
- decision
- ncert
- app
- scraping
- pdf-merge
- github-releases
- education
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- decisions/architecture/apps/ncert-app-scope
- rules/interaction/no-card-on-file
- decisions/architecture/frontend/four-nav-surfaces-every-app
---



# ncert.oriz.in — combined PDF directory

## Why it exists

User explicit (2026-06-22): "I wanted to read the books but there was no combined book, no site that provided the combined books in a combined format. There were individual chapters available on the NCERT website but not the complete books."

ncert.nic.in publishes free official textbooks, but ONLY as per-chapter PDFs. To get a "whole book" you'd download 10-15 PDFs per class-subject-language and merge them yourself. This app removes that friction.

## Pipeline

1. **Scrape** `https://ncert.nic.in/textbook.php` via Playwright (use `playwright-cli` skill — signed binaries; survives Defender ASR). Enumerate every Class × Subject × Language combination.
2. **Download** each chapter PDF to a temp dir. Names follow ncert.nic.in's own convention.
3. **Sort** chapters in correct order (chapter index from the catalog page, not filename).
4. **Merge** using `qpdf --empty --pages <chap1.pdf> <chap2.pdf> ... -- out.pdf` (qpdf preserves PDF integrity; pdftk has Java dep issues on CI).
5. **Name output** `{class}-{subject}-{language}.pdf` (e.g. `class-9-mathematics-en.pdf`, `class-10-vigyan-hi.pdf`).
6. **Release** to GitHub Releases at `chirag127/oriz-ncert-app` with tag `books-YYYY-MM-DD`. Each release has all merged PDFs as assets.

## Cron cadence

Once a year (June 1 IST cron) re-scrape to pick up any new chapter or new edition. NCERT updates books rarely; we don't need monthly polling.

## Website surface

The catalog UI at ncert.oriz.in:

- **Landing** — class picker (Pre-K + 1-12) → subject → language → "Download PDF" button linking to GH release asset URL
- **Per-book page** — `/class-9/mathematics/en` — book cover image (auto-generated via satori from NCERT cover scrape) + download button + file size + chapter count + table of contents (per-chapter PDF still linked if user wants individual chapters)
- **Search** — Pagefind across book titles + chapter titles + subject names. (NOT full-text-of-PDF — too heavy. Defer.)
- **Sort** — by class (ascending) → by subject (alphabetical) → English first then Hindi
- **About** — copyright disclaimer: "NCERT textbooks are freely redistributable per Government of India open-content policy. We don't host the PDFs on our domain; downloads come from our GitHub releases. Original source: ncert.nic.in."

## What we DON'T do

- No full-text search inside PDFs (too heavy for v0)
- No quizzes from NCERT Exemplar (deferred to v1)
- No hosting PDFs on Cloudflare Pages (25 MB per-file limit; some books exceed)
- No store/sell — entirely free, ad-supported (per AdSense everywhere except cs-me + janaushdhi rule — ncert IS ad-eligible)
- No Devanagari OCR (text already extractable from NCERT PDFs)

## Languages in v0

- **English** + **Hindi** (the two NCERT publishes everywhere)

Deferred to v1: Urdu (some books), Sanskrit (some books), regional translations.

## GitHub Action

`.github/workflows/scrape-and-release.yml`:
- Trigger: schedule cron + workflow_dispatch
- Runs on `ubuntu-latest` per linux-CI-only rule
- Steps: playwright scrape → qpdf merge → upload artefacts → gh release create

## Cross-refs

- Original scope file → [[decisions/architecture/ncert-app-scope]]
- 4-nav surfaces (this app has all 4) → [[decisions/architecture/four-nav-surfaces-every-app]]
- No card on file → [[rules/no-card-on-file]]
