---
type: decision
title: "First book: 'My Learnings from the Oriz Project family' \u2014 replaces Oriz\
  \ Me as first draft"
description: "User changed first-book pick on 2026-06-22 from Oriz Me (PWYW personal)\
  \ to 'My Learnings from the Oriz Project family' \u2014 a memoir + manual hybrid\
  \ documenting building the oriz family. Quality bar: 'good books, not bad books'.\
  \ Minimum publishing setup: KDP + Play Books Partner Center + Leanpub + Draft2Digital\
  \ (all free signup, all royalty-on-sale, no card). ISBN free from KDP/D2D; not required\
  \ for digital-only on Leanpub/Gumroad."
tags:
- decision
- books
- publishing
- first-book
- oriz-learnings
- kdp
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
supersedes: decisions/architecture/books-publishing-shape (the 'first book = Oriz
  Me' pick from 2026-06-21)
related:
- decisions/architecture/content/books-publishing-shape
- decisions/architecture/content/book-publish-pipeline
- rules/agent/confirm-knowledge-deltas
---



# First book: 'My Learnings from the Oriz Project family'

## Decision

The first book to draft fully is **"My Learnings from the Oriz Project family"** (working title; final TBD). Memoir + manual hybrid. Documents building the oriz family — the 17 packages, the 26 apps, the rules + decisions + tradeoffs encoded in `knowledge/`, the no-card-on-file discipline, the cross-post engine, the design-system journey.

This **replaces** the Oriz Me / Oriz Stack / Oriz Paisa picks from 2026-06-21 as the first book. The other 4 books in the catalog stay (chapter outlines only initially).

## Why this is a good book, not a bad book

User explicit request: "I want the books to be very good in nature." Quality bar:

- **Original lived material** — every chapter is something the author actually built or decided. No filler, no AI-generated chapter padding.
- **Specific** — names tools, prices, free-tier limits, real-world tradeoffs (e.g. "Firebase Functions need Blaze plan which requires card-on-file, so we use CF Pages Functions instead — here's why").
- **Reproducible** — every claim is backed by a real file in the `chirag127/oriz*` repos. The book reads like a guided tour of an actual codebase.
- **Honest** — failures, dead ends, supersession trail (per the `keep-knowledge-fresh` rule).
- **Useful immediately** — readers can clone the family templates and ship their own variant by chapter end.

## Outline (preliminary)

1. The 11 hard rules (and why each exists)
2. The no-card-on-file discipline (and what it costs)
3. The 17-package family (and how it shrank from 22)
4. The cross-post engine (and how it cost zero dollars)
5. PWA → native via PWABuilder (and why iOS is PWA-only)
6. The single env.example pattern (and how to keep 26 apps in sync)
7. The 4-host git mirror (and why GitHub isn't the SSoT)
8. MIT relicense (and what it unlocked)
9. The design-system journey (sweep #1 → #2 → #3)
10. India-specific gotchas (Telegram, Razorpay, no card discipline)

Final outline emerges from the actual knowledge bundle.

## Minimum publishing setup (no card)

Per the no-card-on-file rule, only free-signup-no-card platforms qualify:

| Platform | Royalty | ISBN? | Card at signup? | Best for |
|---|---|---|---|---|
| **KDP** (Amazon) | 70% on $2.99-$9.99 | ASIN free; ISBN optional (free from KDP for paperback) | NO | Kindle eBook + paperback POD |
| **Play Books Partner Center** | 52% (Google's cut is 48%) | NOT required for eBook | NO (bank only at payout) | Android-first audience, India |
| **Leanpub** | 80% (Leanpub takes 10% + Stripe fee) | NOT required | NO | Updates-as-you-write, dev audience |
| **Draft2Digital** | 60% (D2D takes 10% on top of retailer's cut) | Free ISBN provided by D2D | NO | Distributes to Apple Books / Kobo / B&N / Scribd in one upload |
| **Gumroad** | 90% (10% + payment fee) | NOT required | NO | Direct PDF/EPUB downloads, India-friendly |

ISBNs: D2D gives one free. KDP gives a free ASIN (Amazon's internal ID) and an optional free ISBN for paperback. Leanpub and Gumroad don't require ISBN for digital-only.

**Set up ALL 5 now.** Each one is a free account; user creates them in parallel today.

## Pricing for first book

- **Lifetime PDF/EPUB on Gumroad**: ₹399 (India) / $9 (ROW)
- **Kindle on KDP**: $4.99 (low to drive review count)
- **Paperback POD on KDP**: $12.99
- **Leanpub**: $9 minimum, $19 suggested
- **Play Books**: $4.99
- **D2D → Apple/Kobo/B&N/Scribd**: $4.99

## Distribution to readers

- Free chapter on Substack + @oriz_announcements TG channel as launch teaser
- Full book link on home-app `/books/oriz-learnings` page (catalog entry)
- Cross-posted launch announcement via omni-publish to dev.to / Hashnode / Bluesky / Mastodon / Threads / @oriz_announcements

## Status of the other 4 books

- **Oriz Stack** ($19/$39) — chapter outline only
- **Oriz Paisa** (₹499/₹999 India CC) — chapter outline only
- **Oriz Me** (PWYW $9 personal) — chapter outline only; lower priority now
- **Oriz PDF** ($14 PDF Tools manual) — chapter outline only
- **Oriz Janaushdhi** (₹299 generic-medicine guide) — chapter outline only

## Cross-refs

- The previous first-book pick (Oriz Me) → [[decisions/architecture/books-publishing-shape]]
- The book publish pipeline (Pandoc, Markua, Leanpub) → [[decisions/architecture/book-publish-pipeline]]
- The knowledge-delta rule that surfaced this change → [[rules/confirm-knowledge-deltas]]
