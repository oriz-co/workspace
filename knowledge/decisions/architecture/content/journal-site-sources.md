---
type: decision
title: "journal-site \u2014 best features of all five journal apps"
description: journal-site (journal.oriz.in) mines the best features of Day One, Bear,
  Notion, Obsidian, and Logseq into one journaling experience. Big scope chosen knowingly;
  flagship-grade polish target.
tags:
- architecture
- sites
- journal
timestamp: 2026-06-20
---



# journal-site — best features of all five journal apps

## The decision

`journal-site` at `journal.oriz.in` mines the best features of **all five major journaling apps**: Day One, Bear, Notion, Obsidian, Logseq. Scope chosen over the recommended "Day One + Bear + Notion only" — user wants the full feature soup.

This makes journal-site a flagship project, not a side site.

## What to take from each

### Day One
- **Daily prompts** — rotating "what's one thing you learned today?", "what made you smile?"
- **On-this-day** — show entries from this date in past years
- **Auto-capture** — weather, location, step count, music playing, photos taken today (auto-import from device)
- **Streaks** — gentle gamification (without becoming Duolingo-pushy)
- **End-to-end encryption** — entries encrypted client-side before sync

### Bear
- **Gorgeous typography** — serif body font, careful line-height, narrow column width
- **Hashtags as folders** — `#travel/japan` auto-creates a tag tree
- **Markdown with live preview** — typing `# heading` instantly renders, no separate edit/preview mode
- **Polished mobile experience** — feels like a native iOS app, not a web app

### Notion
- **Databases** — entries can be filtered/sorted/grouped by custom properties (mood, location, weather)
- **Templates** — "morning pages", "weekly review", "trip log" — one-click new entry from template
- **Embeds** — videos, tweets, code blocks render inline

### Obsidian
- **Backlinks** — every mention of `[[Person]]` auto-creates a back-reference
- **Graph view** — visual map of how entries connect via tags + backlinks
- **Plain-markdown files** — local-first, future-proof, exportable

### Logseq
- **Daily-notes structure** — every day is a page, you don't have to title entries
- **Block-level references** — link to a specific paragraph, not just a page
- **Outliner mode** — bullets/indents as the primary structure, not paragraphs

## What ties them together

The synthesis is bigger than the parts:

- **Storage:** plain markdown files (Obsidian/Logseq) PLUS structured metadata (Notion). Markdown body + YAML frontmatter for properties + auto-captured fields.
- **Editor:** Bear's typography + Notion's slash menu + Logseq's outliner toggle.
- **Discovery:** Day One's on-this-day + Obsidian's backlinks + Notion's filter/sort.
- **Privacy:** Day One's E2E encryption (entries encrypted client-side; the Hono Worker at api.oriz.in stores ciphertext only).
- **Templates:** Notion's template gallery, Day One's daily prompts.
- **Auto-capture:** Day One's full set, gated behind explicit user opt-in per data type.

## Tension with the auto-only-tracking rule

The existing [auto-only-tracking.md](../../../rules/interaction/auto-only-tracking.md) rule says metrics must be auto-captured, not manually entered. Journal entries are **content**, not metrics — explicitly carved out in that rule. So journal-site is allowed.

But the *metadata* on each entry (mood, location, weather) should be **auto-captured by default** to stay consistent with the spirit of that rule. Manual override allowed; manual-only not allowed.

## Sidebar tier

Tier B — curated TOC + recent. See [sidebar-4-tier.md](../frontend/sidebar-4-tier.md). The curated TOC is the templates list + section navigation; "recent" is the last 5 entries.

## Why scope-creep is OK here

User picked "all five apps" over the recommended 3-app subset. Reasoning that survived:

- Journal sites are inherently long-tail features — every app I respect (Day One, Notion) got there by accreting features over years. The right time to pick all the features is at the start; iteration removes, it doesn't add.
- Risk is "feature soup" if shipped poorly, but that's a *design* problem, not a *scope* problem. Designing it right with all features in scope from day 1 is easier than retrofitting them.

The risk-mitigation: ship in vertical slices. Don't try to ship everything at once. Phase 1 = Bear's typography + Day One's daily prompts + Obsidian's plain-markdown storage; Phase 2 = Notion's databases + templates; Phase 3 = backlinks + graph; Phase 4 = E2E encryption + auto-capture.

## Related

- [auto-only-tracking.md](../../../rules/interaction/auto-only-tracking.md) — metrics vs content carve-out
- [sidebar-4-tier.md](../frontend/sidebar-4-tier.md) — Tier B
- [branding/repo-naming-suffixes.md](../../branding/repo-naming-suffixes.md) — current slug is `chirag127/journal-site` (fourth-pass naming; renamed from `oriz-journal` → `roam` → `journal-site`)
