---
type: decision
title: 'API hosting triple-rail: GH Pages per API + RapidAPI listing + data.oriz.in
  aggregator hub'
description: "Every oriz API repo serves data via THREE rails simultaneously. (1)\
  \ GitHub Pages per API with custom domain `<name>.api.oriz.in` (CNAME). (2) RapidAPI\
  \ marketplace listing (free + paid tiers for monetization). (3) Single `data.oriz.in`\
  \ aggregator app on Cloudflare Pages that catalogs all APIs + provides unified docs\
  \ + dashboard. NO Cloudflare Workers anywhere. Each API repo also ships native distributables\
  \ (APK/MSIX/EXE/PWA) via PWABuilder \u2014 even API repos get installable apps.\
  \ 14 APIs scaffolded: existing FII/DII + MMI + 12 new (NSE-BSE tickers, MF-NAV proxy\
  \ of api.mfapi.in, RBI rates, gold/silver, IRCTC PNR, CPCB AQI, global AQI proxy,\
  \ petrol/diesel, pincode, IFSC, India holidays, currency aggregator)."
tags:
- decision
- apis
- github-pages
- rapidapi
- data-aggregator
- hosting
- monetization
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- decisions/architecture/general/market-data-per-repo
- decisions/architecture/general/dynamic-family-data-registry
- decisions/architecture/frontend/pwabuilder-as-primary-converter
- rules/infrastructure/cloudflare-pages-only
---



# API hosting triple-rail

## Decision

Each oriz API is served via THREE rails simultaneously:

| Rail | Where | Purpose |
|---|---|---|
| **1. GitHub Pages** (per repo) | `<repo>.github.io/<repo>` with custom domain `<name>.api.oriz.in` | Primary fetchable endpoint. Free, unlimited bandwidth, GH CDN. |
| **2. RapidAPI** | Marketplace listing per API | Discovery + monetization (free + paid tiers). Aggregates billing for us. |
| **3. data.oriz.in aggregator** | CF Pages app | Single catalog page listing all 14+ APIs with docs / playground / status. |

**NO Cloudflare Workers used for any API.** Confirms the move-away from CF Workers locked earlier today.

## Domain pattern

Each API gets `<name>.api.oriz.in`:

| API repo | Domain | Status |
|---|---|---|
| `oriz-flow-fii-dii-activity-api` | `fii-dii.api.oriz.in` | LIVE (CNAME pending) |
| `oriz-mmi-tickertape-mmi-api` | `mmi.api.oriz.in` | LIVE (CNAME pending) |
| `oriz-nse-bse-tickers-api` | `tickers.api.oriz.in` | TO BUILD |
| `oriz-mf-nav-api` | `mf-nav.api.oriz.in` | TO BUILD (proxies api.mfapi.in/mf) |
| `oriz-rbi-rates-api` | `rbi-rates.api.oriz.in` | TO BUILD |
| `oriz-gold-silver-rates-api` | `gold-silver.api.oriz.in` | TO BUILD |
| `oriz-irctc-train-pnr-api` | `irctc.api.oriz.in` | TO BUILD |
| `oriz-air-quality-india-api` | `aqi-india.api.oriz.in` | TO BUILD |
| `oriz-aqi-cities-api` | `aqi.api.oriz.in` | TO BUILD |
| `oriz-india-petrol-diesel-api` | `fuel.api.oriz.in` | TO BUILD |
| `oriz-pincode-api` | `pincode.api.oriz.in` | TO BUILD |
| `oriz-ifsc-api` | `ifsc.api.oriz.in` | TO BUILD |
| `oriz-india-holidays-api` | `holidays.api.oriz.in` | TO BUILD |
| `oriz-currency-rates-api` | `currency.api.oriz.in` | TO BUILD |

CNAME setup at Cloudflare DNS (free tier) — points subdomain to `chirag127.github.io`. GH Pages "Custom domain" field receives the same.

## Per-API repo shape

```
chirag127/oriz-<name>-api/
├── .github/workflows/
│   ├── scrape.yml         # GH Action cron scrapes data → commits to data/
│   ├── pages.yml          # GH Pages deploy from /data on push to main
│   └── distribute.yml     # PWABuilder builds APK/MSIX/EXE on tag → GH Release
├── scripts/scrape.mjs     # ~50 LOC node-fetch + cheerio
├── data/
│   ├── 2026-06-22.json    # daily snapshot
│   └── latest.json        # always-current
├── docs/                  # GH Pages site (Astro static)
│   └── index.astro        # landing + docs + playground
├── manifest.webmanifest   # PWA manifest for PWABuilder
├── CNAME                  # custom domain
├── README.md
└── LICENSE                # MIT
```

## RapidAPI integration

Per API:

1. Manual one-time: list the API on rapidapi.com (free for us; their marketplace gets users)
2. RapidAPI proxies requests to `<name>.api.oriz.in/data/latest.json` (or specific endpoint)
3. Free tier: 100 req/day per user (their default). Paid tier: 10K/mo @ $5 (split: ~$3.50 to us)
4. Track via single `RAPIDAPI_KEY` in our .env (synced from master)

## data.oriz.in aggregator hub

New app `oriz-data-aggregator-app` at `c:/D/oriz/repos/oriz/own/prod/apps/content/oriz-data-aggregator-app/`:

- Hosted on Cloudflare Pages (NOT GH Pages — this is the catalog UI, not an API)
- Lists all 14+ APIs from `FAMILY_APIS` (dynamic registry)
- Per-API page: docs / schema / live playground / status badge
- Status check: server-side fetch each API's GH Pages URL daily; flag stale
- Per `dynamic-family-data-registry.md`: list auto-updates when new APIs come online

## Native distributables for APIs

Even though they're APIs, each repo also ships:

- **APK** (Android via PWABuilder + manifest pointing to docs page)
- **MSIX** (Microsoft Store via PWABuilder)
- **EXE** (Windows native via PWABuilder)
- **iOS XCode project** (PWABuilder; deferred unless we ship to App Store)

Per `pwabuilder-as-primary-converter.md`: PWABuilder reads the `manifest.webmanifest` + generates these on release tag push.

## Why GH Pages (not CF Pages)

User mandate (2026-06-22 evening): "Each of the API will have their own website also but it will be hosted on the GitHub pages instead of cloudflare pages."

Reason inferred: GH Pages is free + unlimited bandwidth + GH-CDN-cached. No CF Workers consumed. Custom domain works identically. CF Pages stays for full Astro apps; GH Pages is for static data + minimal docs sites.

This is a NARROW exception to the `cloudflare-pages-only.md` rule — applies ONLY to API repos.

## Cross-refs

- Market data per-repo (existing pattern) → [[decisions/architecture/market-data-per-repo]]
- Dynamic family-data registry → [[decisions/architecture/dynamic-family-data-registry]]
- PWABuilder as primary converter → [[decisions/architecture/pwabuilder-as-primary-converter]]
- Cloudflare Pages only (narrow API exception) → [[rules/cloudflare-pages-only]]
