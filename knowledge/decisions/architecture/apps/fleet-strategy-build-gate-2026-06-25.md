---
type: decision
title: Fleet strategy — build only when top-3 Google results show a real defect
description: Locked 2026-06-25. A tool gets built only when the top three Google results for its core query reveal a concrete defect (paywall, broken UX, ad-spam, missing feature, data staleness). The defect is documented in the tool's README. No fixed category cap — consolidate sibling tools by category into a single repo with path-based routing.
tags:
- decision
- strategy
- fleet
- build-gate
- product
- competitive-analysis
- consolidation
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
related:
- decisions/architecture/general/ship-order-2026q3
- decisions/architecture/apps/finance-one-repo-ten-routes-2026-06-25
- decisions/architecture/apps/eleven-saturated-archived-2026-06-25
- decisions/architecture/branding/subdomain-path-based-on-category-2026-06-25
supersedes: decisions/architecture/general/ship-order-2026q3
---

# Fleet strategy — build-gate + category consolidation

## Decision

Build a tool only if the top three Google results for its primary query each carry a documented defect (paywall, intrusive ads, broken mobile UX, missing feature, stale data, dark patterns, accessibility failures). Capture the defect summary in the new tool's README as the rationale for existing. No fixed cap on category size — when tools share a category, they consolidate into a single repo with path-based routing (`<category>.oriz.in/<tool>`).

## Why

- **No-defect → no build** — if the existing top 3 results serve the user, we'd be adding to noise. Time goes elsewhere.
- **README documents the defect** — gives every visitor (and future-Chirag) the "why does this exist" answer in one place. Doubles as SEO copy.
- **Category consolidation > 10 tiny repos** — finance calculators that share UI primitives, donate widget, account widget, and SEO posture are one repo with 10 routes, not 10 repos with one route each.
- **Topical authority compounds** on the category subdomain — every internal link from `/emi` to `/sip` strengthens both for `finance.oriz.in`.
- **Ship order is now defect-driven, not roadmap-driven** — the old Q3 2026 ship order is superseded.
- **Maintenance scales with repo count** — fewer repos = fewer CI matrices, fewer deploy workflows, fewer dependency bumps.

## Implications

- Every new repo proposal must cite the top-3 Google defect audit before the slug is reserved.
- Each tool README has a "Why this exists" section listing the three observed defects.
- Existing repos that don't pass the defect bar get archived (see eleven-saturated-archived-2026-06-25).
- Consolidate finance calculators into one `finance` repo (see finance-one-repo-ten-routes-2026-06-25). Same shape applies to any sibling category that emerges.
- The 2026-Q3 wave-1/wave-2/wave-3 ship order is no longer authoritative; rebuild from the defect audit.
- Tool subdomains now mean category subdomains (e.g. `finance.oriz.in`), not per-tool subdomains.
