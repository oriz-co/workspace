---
type: decision
title: "books.oriz.in shape \u2014 static catalog, Oriz Me drafts first, others outlines"
description: 'books.oriz.in is a static catalog showing cover + price + buy-links
  per book. First book to draft fully: Oriz Me (PWYW $9, personal essays, biographical).
  Other 4 (Oriz Stack, Oriz Paisa, Oriz PDF, Oriz Janaushdhi) get chapter outlines
  initially. Per-book channels per book-publish-pipeline. Substack is the newsletter
  platform; free chapter drops via Substack.'
tags:
- decision
- books
- publishing
- catalog
- oriz-me
- draft-order
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/content/book-publish-pipeline
- decisions/architecture/stack/newsletter-substack
- decisions/architecture/general/ship-order-2026q3
---



# Books publishing shape

## The site shape

`books.oriz.in` = static catalog. Astro on CF Pages. One page per book.

Per-book page renders: cover image, title, subtitle, short blurb, price (per geo/format), buy-links per channel (Leanpub, Gumroad, LemonSqueezy, KDP, Google Play Books, D2D), sample chapter download, status badge ("draft" / "released" / "outline"), table of contents.

## First book to draft fully

**Oriz Me** — PWYW $9, personal essays, biographical. Status: drafts fully across Q3 2026.

Why Oriz Me first:

- Lowest research overhead — it's personal essays, the user is the source.
- PWYW from $0 — accessible reach, low conversion friction.
- Tests the publishing pipeline (Markua → Pandoc → EPUB/PDF/MOBI via [[decisions/architecture/book-publish-pipeline]]) on the lowest-stakes book.

## Other 4: chapter outlines only initially

- **Oriz Stack** — Astro + CF + Firebase architecture, $19 / $39 Pro
- **Oriz Paisa** — Credit Cards India 2026, ₹499 / ₹999
- **Oriz PDF** — From Browser to Native (PWABuilder), $14
- **Oriz Janaushdhi** — Generic Medicines India, ₹299

Each gets a 1-page chapter outline committed to its repo. Full drafting deferred to Q4 2026 once Oriz Me proves the pipeline.

## Channels per book

Locked in [[decisions/architecture/book-publish-pipeline]]. Summary: each book ships to 5 channels (Leanpub + Gumroad + LemonSqueezy + D2D-aggregator + KDP). Google Play Books Partner Center is manual. Per-book `book.json` toggles channels.

## Newsletter integration

Sample chapters drop via Substack — the family newsletter platform per [[decisions/architecture/newsletter-substack]]. Free chapter PDF + "buy the full book" CTA per drop.

## Cross-refs

- Pipeline tech (Markua + Pandoc + omni-publish) → [[decisions/architecture/book-publish-pipeline]]
- Single newsletter at Substack → [[decisions/architecture/newsletter-substack]]
- Q3 priority (books drafted parallel to Wave 1) → [[decisions/architecture/ship-order-2026q3]]
