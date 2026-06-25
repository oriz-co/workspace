---
type: decision
title: "Sidebar \u2014 4 tiers based on site shape"
description: 'Every site ships a sidebar via @chirag127/sidebar, but the sidebar config
  differs by site type. Four tiers: A) auto-generated for tools, B) curated TOC for
  longform, C) browse + search for catalogs, D) family directory for the brand hub.'
tags:
- architecture
- sidebar
- ui
- design
timestamp: 2026-06-20
---



# Sidebar — 4 tiers based on site shape

## The decision

Every site in the family ships a sidebar (no exceptions), but the **sidebar config** comes in 4 tiers matching the 4 site shapes. Same `<Sidebar>` component from `@chirag127/sidebar`, four different config presets.

## The 4 tiers

### Tier A — Auto-generated tool index

**Sites:** the 15 tool sites (pdf-site, image-site, finance-site, dev-site, text-site, convert-site, qr-site, data-site, audio-site, video-site, seo-site, crypto-site, health-site, random-site, print-site).

**Behaviour:** the sidebar lists every tool route in the current site as a flat or grouped list (auto-generated from the routes manifest at build time). At the bottom: "Other Oriz tools" section with links to the other 14 subdomains.

**Why:** tools sites have 10–80 routes that all look similar. Manual curation would be a maintenance burden and would drift. Auto-generation guarantees the sidebar is never stale.

### Tier B — Curated TOC + recent

**Sites:** `blog-site`, `me-site`, `journal-site`.

**Behaviour:** sidebar shows the curated TOC of the current section, plus a "recent posts" or "recently updated" block at the bottom. No auto-generation — content order is intentional.

**Why:** longform content has a deliberate reading order and importance hierarchy. Auto-listing every post drowns the signal.

### Tier C — Browse-by-section + search

**Sites:** `books-site`, `ncert-site`, `cards-site`.

**Behaviour:** sidebar has a category tree (e.g. for `cards-site`: Credit Cards / Debit Cards / Forex Cards / Prepaid / Travel; under Credit Cards: by-bank, by-network, by-feature) plus a prominent search box at the top. The user navigates via the category tree OR jumps via search.

**Why:** these sites have hundreds-to-thousands of items where pure auto-listing is overwhelming and curated TOCs don't fit. Browse + search is the standard catalog pattern (Amazon, IMDb, Goodreads).

### Tier D — Family directory only

**Sites:** `oriz-site` (the brand hub at oriz.in apex).

**Behaviour:** sidebar shows the family directory — the 16-row site list (oriz-site itself + 15 tool sites + blog/me/journal/books/ncert/cards) — plus the multi-search button. No per-route listing because the brand hub is mostly the index page.

**Why:** the apex page is the entry point to the family. Its sidebar IS the family directory; that's its job.

## Configuration shape

Every site exports a `sidebar.config.ts` that picks one of the 4 tier presets:

```ts
import { tierA, tierB, tierC, tierD } from '@chirag127/sidebar/tiers'

export default tierA({
  // tool-site config: routes manifest, "other tools" section
})
```

The `<Sidebar>` component itself is identical across all sites. Tier configs differ.

## Mobile behaviour

All four tiers collapse the sidebar to a hamburger drawer below 768px. The drawer animation, focus-trap, and ESC-to-close behaviour live in `@chirag127/sidebar` and don't differ per tier.

## Why 4 tiers, not 2 or 3

User picked **4 tiers** over the recommended 4-tier shape (yes, the user agreed with the recommendation). Reasoning:

- **2-shape** (auto vs curated) lumped catalogs with longform — wrong, they need different navigation patterns (catalog needs search, longform needs TOC).
- **3-tier** (auto / curated / hub) lumped catalogs into curated — same problem.
- **4-tier** is the level at which each shape gets its own optimised navigation. More than 4 starts splitting hairs (e.g. "newsletter sidebar" vs "blog sidebar").

## What ships in `@chirag127/sidebar`

- `<Sidebar>` component — the visual chrome
- `tierA(config)`, `tierB(config)`, `tierC(config)`, `tierD(config)` — preset factories
- Mobile drawer behaviour
- Focus management, keyboard shortcuts (`/` to focus search in Tier C)
- Theme tokens consumed from `@chirag127/theme`

## Related

- [packages-14-atomic.md](../packages-14-atomic.md) — `@chirag127/sidebar` is package #4
- [tools-site-15-repos.md](../stack/tools-site-15-repos.md) — Tier A consumers
- [cards-site-scope.md](../apps/cards-site-scope.md) — Tier C consumer (financial cards)
- [journal-site-sources.md](../content/journal-site-sources.md) — Tier B consumer
