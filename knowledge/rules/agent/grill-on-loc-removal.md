---
type: rule
title: Grill on LOC removal >= 50 lines per sweep (TIGHTENED 2026-06-22 evening)
description: "TIGHTENED 2026-06-22 evening: threshold dropped from 1000 LOC \u2192\
  \ 50 LOC. When a dedup/refactor/cleanup sweep removes \u226550 lines of code in\
  \ a single agent action, the agent MUST surface this as a delta, ask the user MCQs\
  \ about what was removed + why, offer restoration paths, and confirm before deleting.\
  \ Reason: 50-LOC sweeps can hide substantive functional removal (an entire component,\
  \ a route, a feature). Design pattern consolidation safe ONLY after grill; content/feature\
  \ deletion NEVER safe without grill."
tags:
- rule
- dedup
- refactoring
- loc-threshold
- content-vs-pattern
- grill
- tightened
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- rules/design/design-divergence-vs-dedup
- rules/agent/confirm-knowledge-deltas
- rules/agent/grill-to-knowledge
- rules/design/per-app-distinctive-frontend-design
---



# Grill on LOC removal >= 50 lines per sweep

## Rule

Before deleting ≥1000 lines of code in a dedup/consolidation sweep, the agent MUST:

1. Surface the delta explicitly — which files, which lines, what purpose.
2. Ask the user 20+ questions (split across rounds if needed) covering:
   - Per-app content (finance sidebar vs PDF sidebar vs tools sidebar — are they different?)
   - Design pattern vs content distinction (can this consolidate as a slot, or is it app-specific logic?)
   - LOC breakdown per app (user wants to see diffs before deciding)
   - Restoration paths (restore all? partial? selective?)
3. Get explicit user confirmation BEFORE deletion.
4. If user wants to see diffs, show `git show <commit>:<file>` for each app's changes.

## Why

Sweeps #3 + #4 consolidated chrome (Header/Footer/Sidebar/BottomBar) into `@chirag127/astro-chrome` assuming slot-based props would wire per-app content. But:

- Finance app sidebar should show only finance options (Credit Cards, FII/DII, Razorpay, Settings).
- PDF tools app sidebar should show only tools (Slice, Merge, Compress, Convert, Sign).
- Hub app sidebar should show family sites (all 26 apps + 5 books + 17 packages).

These are NOT content that can be passed via `isOpen` props or slots. They are structural differences in the navigation tree.

**Design patterns CAN consolidate** (all sidebars have the same CSS, drawer toggle at <768px, etc.). **Content CANNOT.**

## The distinction

- **Design pattern**: CSS, layout, responsive breakpoints, animation. Consolidate to a package.
- **Content**: Nav items, categories, app-specific links. Keep per-app.

## Threshold

≥1000 LOC = enough to hide substantive changes. <1000 LOC = probably safe, but still consider asking.

## Cross-refs

- Design divergence is not duplication → [[rules/design-divergence-vs-dedup]]
- Confirm knowledge deltas → [[rules/confirm-knowledge-deltas]]
- Grill-to-knowledge → [[rules/grill-to-knowledge]]
