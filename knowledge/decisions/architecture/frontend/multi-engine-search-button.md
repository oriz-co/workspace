---
type: decision
title: Multi-engine 'Search the web' button on every family site
description: Every site in the chirag127/oriz family ships a single 'Search the web'
  button (in the header or footer) that opens a popover with multiple search engines.
  Component lives in @chirag127/oriz-kit as <MultiSearch />.
tags:
- decisions
- architecture
- oriz-kit
- search
- ui
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- glossary/o-r/oriz-kit
- design/_family-rules
- services/search/algolia
- services/search/pagefind
---



# Multi-engine "Search the web" button on every family site

## Decision

Every site in the chirag127/oriz family ships a single **"Search the
web"** button — in the header OR footer per [the family design
rules](../../../design/_family-rules.md) — that opens a popover listing
multiple web search engines. Clicking an engine launches that engine's
search for the page's **contextual query** (page title, current
selection, or last-clicked card title) in a new tab.

The component lives in [`@chirag127/oriz-kit`](../../../glossary/o-r/oriz-kit.md)
as `<MultiSearch />` and is consumed by every site verbatim — no
per-site forks.

## Why

We don't want to pick one search engine for our visitors. Different
users prefer different engines for different reasons (Kagi for
quality, DuckDuckGo for privacy, Marginalia for indie web,
Bing/Google for breadth). A multi-engine launcher honours that
preference without us hosting search infrastructure or making a
political choice. It's also a low-cost UX win — visitors who land on
a long-tail page (an old book review, an extension's privacy page)
often want to follow up by searching the topic broadly.

This is **distinct from on-site search** — Algolia / Pagefind
(see [services/search/](../../../services/search/index.md)) handle the
in-site search box. `<MultiSearch />` handles the explicit "leave
this site and search the web" gesture.

## Implications

- **Component**: `<MultiSearch />` exported from `@chirag127/oriz-kit`. No styles — uses `[data-oriz-multisearch]` attribute hooks per [family design rules](../../../design/_family-rules.md), every site applies its own visual identity.
- **Default engine list** (configured in oriz-kit, overrideable per site via prop):
  - Google (`https://www.google.com/search?q={q}`)
  - DuckDuckGo (`https://duckduckgo.com/?q={q}`)
  - Bing (`https://www.bing.com/search?q={q}`)
  - Kagi public (`https://kagi.com/search?q={q}`)
  - Marginalia (`https://search.marginalia.nu/search?query={q}`)
  - Ecosia (`https://www.ecosia.org/search?q={q}`)
- **Per-engine entry**: URL template + favicon + display name. Sites override the list by passing `engines={[...]}` to the component.
- **Contextual query resolution** (in priority order):
  1. Current `window.getSelection().toString()` if non-empty
  2. Last-clicked card title (if site uses oriz-kit's card primitives, which set `data-oriz-card-title` on the wrapper)
  3. `document.title` minus the family suffix (e.g. " — oriz-blog")
- **Placement**: header on big-content sites (oriz-blog, oriz-books, oriz-book-lore, oriz-pdf-tools), footer on app-style sites (oriz-finance, oriz-cards, oriz-me, oriz-image-tools, oriz-urls-to-md, oriz-journal, oriz-home). Each site's design brief specifies which.
- **Accessibility**: button labelled "Search the web", popover is a Radix Popover, engines are `<a target="_blank" rel="noopener">` links. Keyboard navigable, screen-reader announced.
- **Analytics**: optional click event emitted via the family's existing analytics hook (Cloudflare Web Analytics + PostHog) — no per-engine tracking beyond a count.
- **No backend**: every engine link opens directly in a new tab; the family never proxies the search request.

## Cross-refs

- [oriz-kit glossary](../../../glossary/o-r/oriz-kit.md)
- [Family design rules](../../../design/_family-rules.md)
- [Algolia](../../../services/search/algolia.md) — on-site search, large corpora
- [Pagefind](../../../services/search/pagefind.md) — on-site search, small sites
- [AGENTS.md](../../../AGENTS.md) — referenced under "Where to look in knowledge"
