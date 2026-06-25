---
type: decision
title: "Data lives in each app's own repo \u2014 no separate data repos for janaushdhi/ncert/financial-cards"
description: 'Locked 2026-06-22 evening. Reverses earlier proposal to create separate
  `oriz-*-data` repos for data-driven apps. Reason: ''I don''t want to increase the
  number of repositories just for the sake of it.'' Each app''s `data/` dir holds
  its own data. Per-app GH Action cron writes fresh data to that dir + commits. Push
  to app''s main branch triggers CF Pages redeploy automatically. Apps consume data
  via build-time import (static fastest). Where runtime freshness needed: lazy fetch
  + SWR + localStorage cache. Existing `oriz-flow-fii-dii-activity-api` + `oriz-mmi-tickertape-mmi-api`
  repos STAY (they''re API services, not data; data lives in their own data/ dir per-repo).'
tags:
- decision
- data
- mono-app-repos
- no-data-split
- cron
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
supersedes_in_part: decisions/architecture/market-data-per-repo (clarifies that "per
  repo" means the EXISTING fii-dii + mmi service repos, not new data repos)
related:
- decisions/architecture/general/market-data-per-repo
- decisions/architecture/apps/janaushdhi-app-scope
- decisions/architecture/apps/ncert-combined-pdf-directory
---



# Data lives in each app's own repo

## Decision

Each data-driven app (`oriz-janaushdhi-app`, `oriz-ncert-app`, `oriz-financial-cards-app`, etc.) keeps its own data in its own `data/` directory inside its own GitHub repo.

NO separate `oriz-*-data` repos created for any of them.

Existing API service repos (`oriz-flow-fii-dii-activity-api`, `oriz-mmi-tickertape-mmi-api`) stay — they're services with data/ dirs of their own, served via GH Pages.

## Why

User mandate verbatim: "None of them require a separate data repo. All data in the repo of their creation. We are moving to the monorepo. I don't want to increase the number of repositories just for the sake of it."

51 submodules is enough. Adding 3-5 more `-data` repos for the sake of architectural purity isn't worth the maintenance overhead.

## How data updates work

Per app, daily/weekly/monthly cron in `.github/workflows/scrape.yml`:

1. Scraper script runs (e.g. Playwright fetches the medicine CSV)
2. Output → `data/<YYYY-MM-DD>.json` + `data/latest.json` in the app repo
3. Workflow commits + pushes to main
4. CF Pages auto-redeploys on push
5. Site rebuilds with the fresh data baked in

App-level GH Action handles everything; zero external coordination.

## Runtime fetch for freshness

Where data MUST be live (intraday market data, live counters), apps lazy-fetch from raw URLs:

- `paisa-finance` fetches FII/DII + MMI from `raw.githubusercontent.com/chirag127/oriz-flow-fii-dii-activity-api/main/data/latest.json` + similar for MMI
- Lazy + SWR (stale-while-revalidate) + localStorage 1h TTL — shows cached immediately, fetches fresh in background

## Cross-refs

- Market data per-repo pattern → [[decisions/architecture/market-data-per-repo]]
- janaushdhi app scope → [[decisions/architecture/janaushdhi-app-scope]]
- ncert combined PDF directory → [[decisions/architecture/ncert-combined-pdf-directory]]
