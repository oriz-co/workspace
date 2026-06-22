---
type: decision
title: "Market-data via GitHub-as-JSON-database (FII/DII + MMI)"
description: "FII/DII activity + Tickertape MMI scraped by GitHub Actions cron into chirag127/oriz-market-data as JSON, served free via raw.githubusercontent.com + GH CDN. Apps cache 1h in localStorage. Replaces the two CF Worker APIs flow-fii-dii.api.oriz.in + mmi.api.oriz.in — both archived 2026-06-22."
tags: [decision, architecture, market-data, github-actions, github-as-database, json, india, free-tier, no-cf-workers]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
supersedes: architecture/market-data-apis
related:
  - architecture/market-data-apis
  - architecture/github-pages-as-json-api
  - architecture/cf-worker-quota-mitigation
  - services/easy-free-tier
  - rules/linux-ci-only
---

# Market-data via GitHub-as-JSON-database

## Decision

India market-data (FII/DII + MMI) is stored as JSON files in a public GitHub repo, refreshed by GitHub Actions cron, and consumed by every app via `raw.githubusercontent.com`. **Zero Cloudflare Workers**, zero KV, zero recurring cost — purely free GitHub tier.

| Data | Repo path | Refresh | URL pattern |
|---|---|---|---|
| FII/DII activity | `chirag127/oriz-market-data` → `data/fii-dii/{YYYY-MM-DD,latest}.json` | weekdays 13:00 UTC (post-NSE-close) | `https://raw.githubusercontent.com/chirag127/oriz-market-data/main/data/fii-dii/latest.json` |
| Tickertape MMI | `chirag127/oriz-market-data` → `data/mmi/{YYYY-MM-DD,latest}.json` | hourly | `https://raw.githubusercontent.com/chirag127/oriz-market-data/main/data/mmi/latest.json` |

Scrapers: Node 22 native `fetch` + `cheerio`, ~50 LOC each. FII/DII tries NSE official API first, falls back to Moneycontrol HTML scrape. MMI scrapes Tickertape's public `/market-mood-index` page (Next.js data + DOM fallback).

The repo is wired into the master as a submodule at `projects/data/oriz-market-data` and consumed in apps via URL constants — first user: `oriz-paisa-finance-tools-app/src/data/market-data-urls.ts`.

## Why GitHub-as-database, not CF Workers

The prior architecture ([`market-data-apis`](./market-data-apis.md)) provisioned two standalone CF Workers (`flow-fii-dii.api.oriz.in`, `mmi.api.oriz.in`) with KV caches. Neither was ever called in production. The replacement is free, simpler, and audit-friendly:

- **Free forever.** GitHub Actions: 2000 min/mo free on public repos (unused — we use a handful). Raw content: unlimited reads via GitHub's CDN. No card, no quota worry.
- **Audit trail built in.** Every scrape is a commit. `git log data/fii-dii/` is the time-series history; no need for a separate D1/KV/Postgres dump.
- **Lower blast radius.** A bad scrape = a bad commit, revertable in one click. A bad KV write is opaque.
- **One less moving piece.** No `wrangler deploy`, no DNS CNAME, no `CLOUDFLARE_API_TOKEN` rotation, no per-Worker rate-limit config.
- **Aligned with [`github-pages-as-json-api`](./github-pages-as-json-api.md).** Same pattern we already use for other static datasets.

The price we pay: a tiny eventual-consistency window (apps see data up to 1h stale for MMI, up to 24h for FII/DII), and reliance on GitHub Actions uptime. Both acceptable for non-trading, non-realtime UI surfaces.

## Implications

- 2 CF Worker submodules removed from master: `projects/apis/oriz-flow-fii-dii-activity-api` + `projects/apis/oriz-mmi-tickertape-mmi-api`. Both upstream repos `gh repo archive`d on 2026-06-22 (not deleted — kept for audit).
- 1 new submodule added: `projects/data/oriz-market-data`.
- Apps cache fetched JSON in `localStorage` with 1h TTL (FII/DII can use 12h; MMI 1h).
- License MIT per [`mit-license-all-repos`](./mit-license-all-repos.md).
- Linux-only CI per [`rules/linux-ci-only`](../../rules/linux-ci-only.md).

## Cross-refs

- [`market-data-apis`](./market-data-apis.md) — the superseded CF-Worker plan
- [`github-pages-as-json-api`](./github-pages-as-json-api.md) — sibling pattern for other datasets
- [`cf-worker-quota-mitigation`](./cf-worker-quota-mitigation.md) — quota-pressure context that motivated the switch
