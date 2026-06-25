---
type: decision
title: "Market-data per repo \u2014 GH Actions cron + GH Pages JSON serve, one repo\
  \ per API"
description: FII/DII activity and Tickertape MMI each live in their own GitHub repo.
  GH Actions scrapes (weekdays post-NSE-close for FII/DII, hourly for MMI) and commits
  JSON back into the repo's data/ directory. GitHub Pages + raw.githubusercontent.com
  serve the JSON publicly. Zero Cloudflare Workers, zero shared aggregator repo.
tags:
- decision
- architecture
- market-data
- github-actions
- github-pages
- json
- india
- free-tier
- no-cf-workers
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
supersedes: architecture/market-data-via-github
related:
- architecture/market-data-via-github
- architecture/market-data-apis
- architecture/github-pages-as-json-api
- architecture/cf-worker-quota-mitigation
- services/easy-free-tier
- rules/interaction/linux-ci-only
---



# Market-data per repo

## Decision

Each India-market data feed lives in its own GitHub repo. GitHub Actions cron runs the scraper, commits the resulting JSON back to that repo's `data/` directory, and GitHub Pages publishes the same directory at a stable HTTPS URL. Apps fetch via Pages or `raw.githubusercontent.com`. Zero Cloudflare Workers, zero shared aggregator, zero recurring cost.

| API repo | Refresh | Pages URL (latest) | Raw URL (latest) |
|---|---|---|---|
| `chirag127/oriz-flow-fii-dii-activity-api` | weekdays 13:00 UTC (post-NSE-close) | `https://chirag127.github.io/oriz-flow-fii-dii-activity-api/latest.json` | `https://raw.githubusercontent.com/chirag127/oriz-flow-fii-dii-activity-api/main/data/latest.json` |
| `chirag127/oriz-mmi-tickertape-mmi-api` | hourly (`0 * * * *`) | `https://chirag127.github.io/oriz-mmi-tickertape-mmi-api/latest.json` | `https://raw.githubusercontent.com/chirag127/oriz-mmi-tickertape-mmi-api/main/data/latest.json` |

Scrapers are Node 22 native `fetch` + `cheerio`, ~55 LOC each, in `scripts/scrape.mjs`. FII/DII tries NSE official API first, falls back to Moneycontrol HTML scrape. MMI scrapes Tickertape's public `/market-mood-index` page (Next.js `__NEXT_DATA__` regex with DOM-text fallback).

Each repo has two workflows:

- `.github/workflows/scrape.yml` — cron + `workflow_dispatch`, runs the scraper, commits + pushes `data/`.
- `.github/workflows/pages.yml` — on push to `data/**`, deploys the `data/` directory to GitHub Pages (Actions source, not legacy branch source).

## Why per-repo, not the aggregator we tried briefly

The aggregator [`market-data-via-github`](../market-data-via-github.md) fused two unrelated upstreams into one repo for no real benefit:

- **Slug stays 1:1 with product.** `flow-fii-dii.api.oriz.in` and `mmi.api.oriz.in` were already mapped to per-API slugs; mashing them under a third slug broke that mapping.
- **No shared scraper code.** NSE FII/DII and Tickertape MMI scrapers have nothing in common beyond `fetch` + `cheerio`. Co-locating them shaved no LOC.
- **Independent cadence.** Weekday post-close vs hourly cron are different ops shapes; a shared repo would have run two unrelated GH Actions back-to-back.
- **Cleaner blast radius.** If Tickertape changes shape and MMI scraper breaks, FII/DII commits stay clean (and vice-versa). With a shared repo, one bad scrape could pollute the `git log` of the other.

## Why GitHub Pages + raw, not CF Workers

Same rationale as the original [`market-data-via-github`](../market-data-via-github.md) draft:

- **Free forever.** GH Actions: 2000 min/mo free on public repos. Pages + raw: unlimited reads via GitHub's CDN. No card, no quota worry.
- **Audit trail built in.** Every scrape is a commit. `git log data/` is the time-series history.
- **Lower blast radius.** A bad scrape is a revertable commit. A bad KV write is opaque.
- **One less moving piece.** No `wrangler deploy`, no DNS CNAME, no `CLOUDFLARE_API_TOKEN` rotation.

Trade-off accepted: a small eventual-consistency window (apps see data up to 1h stale for MMI, up to 24h for FII/DII) and reliance on GH Actions uptime. Both acceptable for non-trading UI.

## Implications

- **Submodules restored.** `repos/oriz/own/svc/api/oriz-flow-fii-dii-activity-api` + `repos/oriz/own/svc/api/oriz-mmi-tickertape-mmi-api` are wired back into master `.gitmodules`. The shared `repos/oriz/own/content/data/oriz-market-data` submodule and its upstream repo were deleted on 2026-06-22.
- **CF Worker code removed.** `src/index.ts` (Hono routes) + `wrangler.toml` + `tsconfig.json` + `vitest.config.ts` + `test/` were deleted from both repos. Subdomains `flow-fii-dii.api.oriz.in` and `mmi.api.oriz.in` are unused; the canonical fetch URL is now the GH Pages URL above.
- **Apps consume via URL constants.** First user: `oriz-paisa-finance-tools-app/src/data/market-data-urls.ts` — both `FII_DII_LATEST_URL` and `MMI_LATEST_URL` point at `raw.githubusercontent.com` per-repo URLs.
- **GH Pages enabled** on both repos via REST API (`build_type=workflow`).
- **License MIT** per [`mit-license-all-repos`](./mit-license-all-repos.md).
- **Linux-only CI** per [`rules/linux-ci-only`](../../../rules/interaction/linux-ci-only.md).

## Cross-refs

- [`market-data-apis`](../compute/market-data-apis.md) — the original CF-Worker design, now archived as a historical alternative
- [`market-data-via-github`](../market-data-via-github.md) — the rejected aggregator pattern (same-day revert)
- [`github-pages-as-json-api`](../compute/github-pages-as-json-api.md) — the sibling pattern this generalises
- [`cf-worker-quota-mitigation`](../compute/cf-worker-quota-mitigation.md) — quota-pressure context that motivated moving off Workers
