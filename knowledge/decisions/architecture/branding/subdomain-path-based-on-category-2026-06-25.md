---
type: decision
title: Subdomains — category-based with path routing per tool
description: Locked 2026-06-25. Per-tool function-based subdomains are abandoned. Tools live at <category>.oriz.in/<tool> (e.g. finance.oriz.in/emi, finance.oriz.in/sip). Topical SEO authority compounds on the category subdomain via internal cross-linking.
tags:
- decision
- branding
- subdomain
- seo
- category
- routing
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
related:
- decisions/architecture/apps/finance-one-repo-ten-routes-2026-06-25
- decisions/architecture/apps/fleet-strategy-build-gate-2026-06-25
- decisions/architecture/branding/repo-naming-drop-oriz-prefix-2026-06-25
- decisions/architecture/infrastructure/hosting-split-cf-and-gh-2026-06-25
---

# Subdomains — category-based with path routing

## Decision

Tools no longer get one-subdomain-each. Instead, tools live at `<category>.oriz.in/<tool>`. Example: `finance.oriz.in/emi`, `finance.oriz.in/sip`, `finance.oriz.in/tax-80c`. The category subdomain is the SEO anchor; the path identifies the specific tool. Function-based per-tool subdomains (e.g. `emi.oriz.in`, `sip.oriz.in`) are abandoned.

## Why

- **Topical authority compounds** — every internal link from `/emi` to `/sip` raises both for "finance.oriz.in" in Google's eyes. Per-tool subdomains fragment that signal.
- **One CF Pages project per category** — fewer projects, less build-quota pressure, simpler analytics rollup.
- **Better cross-tool UX** — users on the EMI calc see related calculators in the sidebar without crossing domains.
- **Aligned with category consolidation** — one finance repo serving ten routes is cheaper than ten repos serving one route each.
- **Subdomain real estate stays focused** — `<category>.oriz.in` reads as a destination ("the finance toolkit") rather than a single-purpose page.

## Implications

- Existing per-tool subdomains (e.g. `emi.oriz.in`) either get 301-redirected to `finance.oriz.in/emi` or freed entirely.
- The 11 archived tools (eleven-saturated-archived-2026-06-25) free their subdomains automatically.
- CF Pages DNS provisioning workflow targets `<category>.oriz.in`, not per-tool.
- Sitemap-of-sitemaps registers one entry per category subdomain instead of one per tool.
- Per-app knowledge bundles consolidate too — one knowledge/ folder inside the category repo covers every tool route.
- Where a tool deserves its own subdomain (a major standalone product, not a calculator), it can still claim one. The default is category routing.
