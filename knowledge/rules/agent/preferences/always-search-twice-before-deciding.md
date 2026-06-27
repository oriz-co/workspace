---
type: rule
title: "Always search the web at least twice before any non-trivial decision"
description: "Two independent web searches MUST run before recommending a tool, hosting choice, library, API, or architectural decision. No memory-only answers."
tags: [research, web-search, decision-quality, agent-preferences, feedback]
timestamp: 2026-06-27
format_version: okf-v0.1
status: active
related:
  - rules/agent/preferences/always-grill-always-link
  - rules/agent/preferences/minimum-claude-settings
---

# Always search twice before deciding

## Rule

Before recommending any of the following, run **at least 2 independent web searches** to verify current state of the world:

- A library, framework, or tool to install
- A hosting provider or its limits/pricing
- An API to consume
- An architectural pattern
- "Whether X exists" — never answer from memory
- Cost/free-tier claims

Two searches because:
1. One search confirms the prior I'm carrying. Two searches stress-test it.
2. The world changes — a tool that was free last year may have a card-on-file requirement now.
3. Free APIs / repos may have shut down or pivoted.

## Why

User feedback, 2026-06-27 (verbatim):

> "Search the web properly, if the existing API are there, please these web properly, always search the web, include this rule into your agent.mb file also that we have two times before making any decision."

Concrete failures this session that this rule prevents:
- I claimed `extraheadroom.com` desktop app worked on Windows — wrong, only macOS. One search would have caught it.
- I missed that `vedicscriptures/bhagavad-gita-api` already exists as open-source — would have proposed building from scratch if user hadn't pushed back.
- I'd been answering hosting-cap questions from a stale prior ("Cloudflare Pages unlimited projects") — actual cap is **100 projects on free plan**.

## How to apply

For every non-trivial recommendation:

1. **Search 1** — direct claim ("Cloudflare Pages free project limit 2026")
2. **Search 2** — adversarial / inverse ("Cloudflare Pages free plan reached maximum project limit")
3. Cross-check the two. If they disagree → search 3.
4. Only then recommend.

**Skip the searches only for**:
- Mechanical edits ("rename this var")
- Facts already established in the same session ("we already confirmed RTK is installed")
- Trivial syntax lookups where a doc-page WebFetch is faster than a search

## Anti-patterns

- ❌ Answering "what's the limit on X" from training data
- ❌ Stopping at the first search result that confirms what I already think
- ❌ Searching only forward ("X is free") without also searching adversarial ("X paid 2026 changes")
- ❌ Skipping search because "the user asked a quick question"
