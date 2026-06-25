---
type: decision
title: "Q3 2026 ship order \u2014 home + janaushdhi + ncert + blog first, then 16\
  \ tools, books in parallel"
description: Priority order for shipping the oriz family across Q3 2026. Home-app
  + janaushdhi-app + ncert-app + pages-blog-app land FIRST. All 16 tool subdomains
  ship in a locked priority sequence behind them. 5 books drafted in parallel (Oriz
  Me first, full draft; other 4 chapter outlines only). Books-app stays a static catalog.
  Ships under per-channel monetisation matrix, STT-friendly grill rounds, and India-banned-Telegram
  constraint.
tags:
- decision
- roadmap
- q3-2026
- ship-order
- priority
timestamp: 2026-06-21
format_version: okf-v0.1
status: superseded
superseded_by: decisions/architecture/apps/fleet-strategy-build-gate-2026-06-25.md
related:
- decisions/architecture/apps/fleet-strategy-build-gate-2026-06-25
- decisions/architecture/apps/home-app-shape
- decisions/architecture/apps/janaushdhi-app-scope
- decisions/architecture/apps/ncert-app-scope
- decisions/architecture/content/blog-cross-post-strategy
- decisions/architecture/stack/tools-shape-and-priority
- decisions/architecture/content/books-publishing-shape
- decisions/policy/monetisation-channel-matrix
- rules/interaction/communication-stt-friendly
- rules/no-telegram-india-banned
---

> **Superseded 2026-06-25** — see [fleet-strategy-build-gate-2026-06-25](../apps/fleet-strategy-build-gate-2026-06-25.md). Reasoning preserved below for audit.

# Q3 2026 ship order

## The order

**Wave 1 — flagship four (block everything else):**

1. `home-app` — `oriz.in` marketing landing + 5-section grid
2. `janaushdhi-app` — `janaushdhi.oriz.in` daily price scrape + substitute finder
3. `ncert-app` — `ncert.oriz.in` merged-PDF catalog
4. `pages-blog-app` — `blog.oriz.in` daily post + omni-publish fan-out

**Wave 2 — 16 tools in this exact order:**

paisa-finance, slice-pdf, scribe-text, pixie-image, grid-qr, forge-dev, shift-convert, dice-random, cipher-crypto, paper-print, vitals-health, rank-seo, reel-video, echo-audio, pivot-data, then any remainder.

**Wave 3 — content apps (after Wave 1 + 2):**

tabs-cards-app, roam-journal-app, lore-book-summaries-app. See [[decisions/architecture/content-apps-scope]].

**Parallel track — 5 books drafted concurrently with Wave 1:**

Oriz Me drafts FULLY. Other 4 (Stack, Paisa, PDF, Janaushdhi) chapter outlines only. See [[decisions/architecture/books-publishing-shape]].

## Constraints baked into the order

- **Per-channel monetisation matrix** governs revenue everywhere → [[decisions/policy/monetisation-channel-matrix]]
- **STT-friendly question rounds** when grilling → [[rules/communication-stt-friendly]]
- **No Telegram for India-resident user** → drafts queue on GH Issues → [[rules/no-telegram-india-banned]] + [[decisions/architecture/drafts-queue-host]]

## Why this order

home + janaushdhi + ncert + blog are the four surfaces that anchor the brand publicly. Tools follow because each tool subdomain inherits the home-app chrome + analytics. Books drafted in parallel because writing is not blocked by code.

## Cross-refs

- Books-app stays static catalog → [[decisions/architecture/books-publishing-shape]]
- Tools shape + priority → [[decisions/architecture/tools-shape-and-priority]]
