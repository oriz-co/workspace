---
type: rule
title: 'Web search — 2-engine fallback: searxng → duckduckgo'
description: Always-on web-search MCPs are searxng + duckduckgo. If one rate-limits or fails, fall back to the other. Both are no-key.
tags: [mcp, search, fallback, no-card]
timestamp: 2026-06-27
format_version: okf-v0.1
status: active
related:
  - rules/agent/try-multiple-on-failure
  - rules/agent/dont-dup-smithery-tools
---

# Web search — 2-engine fallback chain

## Rule

Two web-search MCPs are always installed at user scope:
1. **searxng** (npx `mcp-searxng`, instance `https://baresearch.org`) — meta-search, aggregates Google/Bing/Wikipedia
2. **duckduckgo** (npx `duckduckgo-mcp-server`) — DDG direct

On any search call, try searxng first. If it fails (rate-limit, 403, 5xx), fall back to duckduckgo. Per `try-multiple-on-failure` rule.

## Paid/keyed alternatives (NOT installed, decision 2026-06-27)

- **Brave Search** (free 2k/mo, no card) — skipped: 2 free engines already
- **Tavily** (free 1k/mo, no card) — skipped
- **Exa** ($10 free credit, no card) — skipped
- **Kagi** (paid + card) — violates no-card-on-file

Revisit if both no-key engines start failing consistently OR a query needs LLM-optimized output that DDG/SearXNG can't deliver.
