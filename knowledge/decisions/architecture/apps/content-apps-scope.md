---
type: decision
title: "Content apps scope \u2014 tabs / journal / lore-summaries, ship after Wave\
  \ 1"
description: 'Three Wave 3 content apps. tabs-cards-app at tabs.oriz.in (visual bookmark
  cards, Notion/Tabby style). roam-journal-app at journal.oriz.in (networked daily
  journal, Roam-style backlinks). lore-book-summaries-app at lore.oriz.in (book +
  movie + show summaries). All three: anonymous-first, free + sponsor footer. Ship
  after janaushdhi + ncert + blog land.'
tags:
- decision
- app
- content-apps
- tabs
- journal
- lore
- wave-3
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/general/ship-order-2026q3
- decisions/architecture/content/journal-site-sources
- decisions/policy/monetisation-channel-matrix
---



# Content apps scope

## The three Wave-3 apps

| Subdomain | Repo | Shape | Inspiration |
|---|---|---|---|
| `tabs.oriz.in` | `tabs-cards-app` | Visual bookmark cards. Per-tab metadata (title, OG image, domain, tags). Grid view. | Notion bookmark blocks, Tabby (browser), Raindrop.io card view |
| `journal.oriz.in` | `roam-journal-app` | Networked daily journal. Markdown + `[[wikilinks]]`. Per-day note. Backlinks panel. Graph view (optional). | Roam Research, Logseq, Obsidian |
| `lore.oriz.in` | `lore-book-summaries-app` | Book / movie / show summaries. One page per work. Spoiler-tagged. Watch-status badges. | LitCharts, MyAnimeList, SuperSummary |

## Shared shape

All three:

- **Anonymous-first auth** per family default. No sign-in required to read.
- **Free + opt-in sponsor footer.** Per [[decisions/policy/monetisation-channel-matrix]].
- **Astro on CF Pages** per family hosting rule.
- **Markdown-in-repo content** per [[decisions/architecture/cms-markdown-in-repo-only]]. No CMS.

## Ship after Wave 1

These ship AFTER janaushdhi + ncert + blog + home-app land (per [[decisions/architecture/ship-order-2026q3]]). Reason: Wave 1 has measurable public utility (price scrape, textbook merge, daily blog). Wave 3 is personal-creative — landing them first would feel like a personal site stretched too thin.

## journal sub-decisions

The Roam-style mining of references (Day One + Bear + Notion + Obsidian + Logseq) was locked separately in [[decisions/architecture/journal-site-sources]]. That file's reference-app analysis applies here.

## Cross-refs

- Q3 priority → [[decisions/architecture/ship-order-2026q3]]
- Monetisation default for content apps → [[decisions/policy/monetisation-channel-matrix]]
- Journal reference apps → [[decisions/architecture/journal-site-sources]]
