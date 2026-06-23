---
type: service
title: "Family inventory — canonical counts of apps, packages, books, APIs, submodules"
description: "Single source of truth for the oriz-org family count totals as of 2026-06-24. 27 apps, 23 npm packages, 5 books, 15 APIs, 74 submodules total. Every other knowledge file pointing at counts MUST cite this file to avoid drift. Repos migrated from chirag127/* → oriz-co/* on 2026-06-22; org renamed oriz-co → oriz-org on 2026-06-24 (GitHub auto-redirects)."
tags: [service, inventory, counts, family, canonical-source-of-truth]
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
  - architecture/the-23-packages
  - decisions/architecture/ship-order-2026q3
  - decisions/architecture/tools-shape-and-priority
  - decisions/architecture/first-book-oriz-learnings
  - decisions/architecture/book-publish-pipeline
  - decisions/architecture/market-data-apis
  - decisions/architecture/oriz-ai-providers-package
  - decisions/architecture/projects-owner-own-forks-layout
  - decisions/branding/oriz-org-rename-from-co
  - architecture/repo-layout
---

# Family inventory — canonical counts

This file is the **single source of truth** for every count claim ("N apps", "N packages", "N books", "N APIs", "N submodules") that appears anywhere else in the knowledge bundle. When a count changes on disk, update THIS file first, then sweep cross-references.

Run `git submodule status | wc -l` from `c:/D/oriz/` to verify the submodule total.

## Apps — 26 total

### Hub (1)

- `home-app` — `oriz.in` marketing landing + 5-section grid (apps / tools / books / packages / me)

### Personal (1)

- `oriz-cs-me-app` — `me.oriz.in` lifestream + 100-year strategy (richest per-app knowledge bundle in the family)

### Content (8)

- `oriz-janaushdhi-app` — `janaushdhi.oriz.in` daily price scrape + substitute finder
- `oriz-lore-app` — `lore.oriz.in` book / movie / show summaries
- `oriz-ncert-app` — `ncert.oriz.in` merged-PDF NCERT catalog
- `oriz-omni-post-app` — `omni-post.oriz.in` admin dashboard wrapping `omni-publish`
- `oriz-packages-catalog-app` — `packages.oriz.in` auto-discovery Starlight catalog
- `oriz-pages-blog-app` — `blog.oriz.in` daily post + cross-post fan-out
- `oriz-roam-journal-app` — `journal.oriz.in` Roam-style networked daily journal
- `oriz-financial-cards-app` — `financial-cards.oriz.in` India financial card intelligence (credit + debit + prepaid + travel + corporate)

### Tools (16)

Locked Wave-2 ship order — see [[decisions/architecture/tools-shape-and-priority]]:

1. `oriz-paisa-finance-tools-app` — `paisa.oriz.in` finance calculators
2. `oriz-slice-pdf-tools-app` — `slice.oriz.in` PDF tools
3. `oriz-scribe-text-tools-app` — `scribe.oriz.in` text tools
4. `oriz-pixie-image-tools-app` — `pixie.oriz.in` image tools
5. `oriz-grid-qr-tools-app` — `grid.oriz.in` QR tools
6. `oriz-forge-dev-tools-app` — `forge.oriz.in` developer tools
7. `oriz-shift-convert-tools-app` — `shift.oriz.in` unit / currency / TZ / base conversion
8. `oriz-dice-random-tools-app` — `dice.oriz.in` randomness tools
9. `oriz-cipher-crypto-tools-app` — `cipher.oriz.in` encoding / hashing
10. `oriz-paper-print-tools-app` — `paper.oriz.in` print tools
11. `oriz-vitals-health-tools-app` — `vitals.oriz.in` health tools (no affiliate)
12. `oriz-rank-seo-tools-app` — `rank.oriz.in` SEO tools
13. `oriz-reel-video-tools-app` — `reel.oriz.in` video tools
14. `oriz-echo-audio-tools-app` — `echo.oriz.in` audio tools
15. `oriz-pivot-data-tools-app` — `pivot.oriz.in` data tools
16. `oriz-<remainder>-tools-app` — the 16th slot (confirm slug on first ship)

## NPM packages — 23 total

Full enumeration + peer-dep hierarchy lives in [[architecture/the-23-packages]]:

1. `@chirag127/astro-shell`
2. `@chirag127/astro-chrome`
3. `@chirag127/astro-tools`
4. `@chirag127/astro-content`
5. `@chirag127/astro-data`
6. `@chirag127/astro-forms`
7. `@chirag127/astro-billing`
8. `@chirag127/astro-pwa`
9. `@chirag127/astro-distribute`
10. `@chirag127/astro-widgets`
11. `@chirag127/astro-test-utils`
12. `@chirag127/auth-core`
13. `@chirag127/auth-wxt`
14. `@chirag127/auth-vsc`
15. `@chirag127/auth-cli`
16. `@chirag127/omni-publish`
17. `@chirag127/oriz-book-build`
18. `@chirag127/oriz-ai-providers`
19. `@chirag127/oriz-rate-limit` *(NEW 2026-06-22)*
20. `@chirag127/oriz-analytics` *(NEW 2026-06-22)*
21. `@chirag127/oriz-seo` *(NEW 2026-06-22)*
22. `@chirag127/oriz-consent` *(NEW 2026-06-22)*
23. `@chirag127/oriz-kit` *(NEW 2026-06-22 — family barrel; `<SponsorButton />` Razorpay donation `pl_T4iEPIDcALKLPk`, `<MultiSearch />`, brand tokens)*

## Books — 5 total (Oriz Learnings first)

Per [[decisions/architecture/first-book-oriz-learnings.md]] — the first book to draft FULLY is `oriz-learnings` (memoir + manual hybrid documenting the build). The other 4 are chapter outlines only.

1. **Oriz Learnings** (new first; full draft in progress) — *My Learnings from the Oriz Project family*
2. **Oriz Stack** (outline) — Astro + Cloudflare + Firebase architecture
3. **Oriz Paisa** (outline) — Credit Cards India 2026
4. **Oriz PDF** (outline) — From Browser to Native (PWABuilder walkthrough)
5. **Oriz Janaushdhi** (outline) — Generic Medicines India

Note: earlier docs reference *Oriz Me* as the first-to-draft full book; that was superseded on 2026-06-22 — `oriz-learnings` is now first. Confirm with the user before changing the ordering.

## APIs — 15 deployed (free, on Cloudflare Workers + Pages)

Indian-data APIs. Each is a submodule under `projects/oriz-org/own/services/apis/`:

- `oriz-air-quality-india-api`
- `oriz-currency-rates-api`
- `oriz-flow-fii-dii-activity-api` — daily FII/DII net activity
- `oriz-gold-silver-rates-api`
- `oriz-ifsc-api`
- `oriz-india-budget-numbers-api`
- `oriz-india-holidays-api`
- `oriz-india-petrol-diesel-api`
- `oriz-india-train-schedules-api`
- `oriz-india-weather-api`
- `oriz-mf-nav-api` — Indian mutual fund NAV snapshots (proxies api.mfapi.in)
- `oriz-mmi-tickertape-mmi-api` — Tickertape Market Mood Index mirror
- `oriz-nse-bse-tickers-api` — Sensex / Nifty / sector indices daily 18:30 IST
- `oriz-pincode-api` — Indian PIN → district + state
- `oriz-rbi-rates-api` — RBI policy rates (repo, reverse-repo, bank rate, WACR, MCLR)

The umbrella `api.oriz.in` Hono Worker is the inline (non-submodule) API and is not counted here.

## Browser extensions — 1 total

- `Ai-rewrite` — Chrome extension, AI-powered text rewriting. **Fork** of `SupratimRK/Ai-rewrite` (verified 2026-06-22 via `gh api`). Submodule under `projects/oriz-org/forks/Ai-rewrite/` (moved 2026-06-22 from `projects/oriz-org/own/products/browser-extensions/`; further moved 2026-06-24 from `projects/forks/` to `projects/oriz-org/forks/` per [`projects-owner-own-forks-layout`](../decisions/architecture/projects-owner-own-forks-layout.md)). Repo: `oriz-org/Ai-rewrite` (renamed from `oriz-co/Ai-rewrite` 2026-06-24).

## Submodules — 74 total

`git submodule status | wc -l` from `c:/D/oriz/` should return 74. Composition:

- 26 app submodules under `projects/oriz-org/own/products/apps/{content,hub,personal,tools}/`
- 1 personal app under `projects/chirag127/own/products/apps/personal/cs-me-app/` (moved from oriz-org 2026-06-24)
- 23 npm-package submodules under `projects/oriz-org/own/libraries/npm-packages/`
- 15 API submodules under `projects/oriz-org/own/services/apis/`
- 1 worker submodule under `projects/oriz-org/own/services/workers/` (oriz-flags-worker; folder exists but no GitHub repo yet, so NOT actually in `.gitmodules`)
- 5 book submodules under `projects/oriz-org/own/content/books/`
- 2 skill submodules under `projects/oriz-org/own/content/skills/`
- 1 data submodule under `projects/oriz-org/own/content/data/` — `oriz-ai-providers-data`
- 1 fork submodule under `projects/oriz-org/forks/` — `Ai-rewrite`

Re-verify on each count change with: `cd /c/D/oriz && git submodule status | wc -l`.

## Update protocol

When any count changes on disk:

1. Update THIS file first.
2. Sweep cross-references (`grep -rn '<old-count>' c:/D/oriz/knowledge c:/D/oriz/AGENTS.md c:/D/oriz/README.md`).
3. Update `architecture/the-23-packages.md` if package count changed (and rename the file if the integer rolls).
4. Commit with `docs(knowledge): bump family inventory counts`.

## Cross-refs

- The 23 packages enumerated → [[architecture/the-23-packages]]
- 16 tools order → [[decisions/architecture/tools-shape-and-priority]]
- 26 apps ship order → [[decisions/architecture/ship-order-2026q3]]
- First book → [[decisions/architecture/first-book-oriz-learnings]]
- Book pipeline (5 books) → [[decisions/architecture/book-publish-pipeline]]
- Market data APIs (2 scaffolded) → [[decisions/architecture/market-data-apis]]
- Repo layout → [[architecture/repo-layout]]
