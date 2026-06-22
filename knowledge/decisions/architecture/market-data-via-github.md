---
type: decision
title: "Market-data via GitHub-as-JSON-database (FII/DII + MMI in a shared repo)"
description: "Briefly: FII/DII + MMI were going to live in a shared chirag127/oriz-market-data repo, scraped by GH Actions, served via raw.githubusercontent.com. Reverted same day — each API stays in its own repo. See market-data-per-repo."
tags: [decision, architecture, market-data, github-actions, github-as-database, json, india, free-tier, superseded]
timestamp: 2026-06-22
format_version: okf-v0.1
status: superseded
superseded_by: architecture/market-data-per-repo
related:
  - architecture/market-data-per-repo
  - architecture/market-data-apis
  - architecture/github-pages-as-json-api
---

> **SUPERSEDED 2026-06-22 (same-day revert).** User reversed the aggregator decision: each market-data API stays in its own repo (`oriz-flow-fii-dii-activity-api` + `oriz-mmi-tickertape-mmi-api`) with a GH Actions cron + GitHub Pages serve. The shared `chirag127/oriz-market-data` aggregator repo was created in this slot, then deleted within hours; both per-API repos were unarchived and restored as submodules. The new canonical decision is [`market-data-per-repo`](./market-data-per-repo.md). The historical body below describes the rejected aggregator pattern — kept for audit trail only.

# Market-data via GitHub-as-JSON-database (rejected aggregator pattern)

## Decision (rejected)

India market-data (FII/DII + MMI) was briefly planned to live as JSON files in a single public GitHub repo `chirag127/oriz-market-data`, refreshed by GitHub Actions cron, consumed via `raw.githubusercontent.com`. Both prior CF Worker API submodules were removed from the master.

## Why reverted

The aggregator pattern fused two unrelated upstreams (NSE FII/DII vs Tickertape MMI) into one repo for no real benefit — the scrapers don't share code, the schedules differ (weekday-only post-close vs hourly), and the per-API repo slugs were already published. Keeping each API in its own repo:

- Preserves slug-as-product-surface (`flow-fii-dii.api.oriz.in`, `mmi.api.oriz.in` brand mapping is 1:1 with a repo).
- Lets each repo's GH Pages serve its own JSON without a `data/<topic>/` subdirectory namespace.
- Simpler `gh repo archive` blast radius if one upstream dies — no co-tenant to drag along.
- Matches the rest of the family (one slug = one product = one repo).

## Cross-refs

- [`market-data-per-repo`](./market-data-per-repo.md) — the active replacement
- [`market-data-apis`](./market-data-apis.md) — the original CF Worker design, now also active again
