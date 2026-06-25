---
type: index
title: Packages
description: Index of concepts in architecture/packages.
tags:
- index
- packages
timestamp: '2026-06-24'
format_version: okf-v0.1
status: active
---

# Packages

## Concepts

- [The twenty-three packages — the locked oriz family package set](./the-23-packages.md) — The chirag127/oriz family ships 23 npm packages — 10 Astro (shell, chrome, tools, content, data, forms, billing, pwa, distribute, widgets) + 1 shared test fixtures (astro-test-utils) + 4 cross-surface auth (auth-core, auth-wxt, auth-vsc, auth-cli) + 1 cross-post engine (omni-publish) + 1 book-build pipeline (oriz-book-build) + 1 AI-providers aggregator (oriz-ai-providers) + 5 cross-cutting concerns (oriz-rate-limit, oriz-analytics, oriz-seo, oriz-consent, oriz-kit). Threshold for being a package — ≥25 lines duplicated across ≥3 consumers AND no community library covers it. Anything below the threshold is inlined.
- [[REDIRECT] the-six-packages.md → the-23-packages.md](./the-six-packages.md) — Legacy filename. The canonical package set now lives in the-23-packages.md (18 packages locked 2026-06-22).
