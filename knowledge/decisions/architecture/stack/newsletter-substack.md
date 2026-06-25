---
type: decision
title: "Newsletter on Substack \u2014 single family newsletter, free tier, 10% if\
  \ paid"
description: Single newsletter for the whole oriz family at chirag127.substack.com
  (or brand-aligned name). Free tier; Substack takes 10% if a paid tier ever ships.
  ONE newsletter, NOT per-app. Daily blog feed + weekly digest + book drop announcements.
  Embed signup form on home-app + every content app footer. Replaces the earlier Buttondown
  + EmailOctopus split.
tags:
- decision
- newsletter
- substack
- single-newsletter
- family-wide
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/content/newsletter-split-buttondown-emailoctopus
- decisions/architecture/content/blog-cross-post-strategy
- decisions/architecture/content/books-publishing-shape
- decisions/policy/monetisation-channel-matrix
---



# Newsletter on Substack

## The decision

**ONE** newsletter for the entire family. On **Substack**. Free tier. URL: `chirag127.substack.com` initially; can move to a brand-aligned custom domain (`newsletter.oriz.in`) later — Substack supports custom domains on the free tier.

## Why single, not per-app

- Per-app newsletters fragment the audience
- Discovery: one signup, all content
- Maintenance: one ESM stack to keep healthy, one set of legal pages (unsubscribe + privacy)
- The family is one brand — Oriz — not 24 brands

## What it ships

- **Daily blog feed** — auto-cross-posted from `blog.oriz.in` RSS (Substack supports RSS-to-newsletter import on free)
- **Weekly digest** — manual write-up summarising the week
- **Book drop announcements** — when a new book or sample chapter ships per [[decisions/architecture/books-publishing-shape]]

## Why Substack (vs Buttondown + EmailOctopus split)

This decision **supersedes** [[decisions/architecture/newsletter-split-buttondown-emailoctopus]] (which split by audience: Buttondown for tech, EmailOctopus for marketing). Two ESPs = double the surface area for ~zero benefit at our scale.

Substack:

- **Free tier with 0 send limits** — Buttondown free caps at 100 subs, EmailOctopus at 2.5K
- **Discovery built-in** — Substack network surfaces newsletter to its audience
- **No card on file** for free tier; 10% only triggers if a paid tier is added in the future (accepted vs DIY-ESM cost)
- **Custom domain** supported on free
- **Authoring UX** — markdown-friendly, web editor, mobile app

Drawback accepted: 10% revenue cut if a paid tier ever ships. Mitigation: the bulk of family revenue is ad/affiliate/book/sponsorship, not newsletter-subscription.

## Embed locations

Signup form embedded on:

- `home-app` footer
- Every content-app footer (tabs, journal, lore, blog, books, cs-me)
- Per-book page on `books.oriz.in` ("Get notified when the next book ships")

## Cross-refs

- Supersedes the Buttondown/EmailOctopus split → [[decisions/architecture/newsletter-split-buttondown-emailoctopus]]
- Blog cross-post strategy (RSS feed → Substack) → [[decisions/architecture/blog-cross-post-strategy]]
- Book drops shipped via newsletter → [[decisions/architecture/books-publishing-shape]]
- Monetisation matrix slot → [[decisions/policy/monetisation-channel-matrix]]
