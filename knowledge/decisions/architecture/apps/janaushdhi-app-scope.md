---
type: decision
title: "janaushdhi-app scope \u2014 daily Jan Aushadhi scrape, substitutes, stores,\
  \ savings"
description: "janaushdhi.oriz.in scrapes the Pradhan Mantri Bhartiya Janaushadhi Pariyojana\
  \ product portfolio daily via GH Action, commits CSV + JSON snapshots, renders per-product\
  \ price-history graphs, brand \u2192 generic substitute finder, per-state store\
  \ locator, and savings calculator. Free + sponsor footer ONLY \u2014 public health\
  \ ethics forbid ads, affiliate, third-party tracking."
tags:
- decision
- app
- janaushdhi
- health
- india
- public-data
- scraping
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/general/ship-order-2026q3
- decisions/policy/monetisation-channel-matrix
- decisions/architecture/compute/cf-worker-quota-mitigation
---



# janaushdhi-app scope

## Data sources

- **Primary scrape:** `https://www.janaushadhi.gov.in/productportfolio/ProductmrpList` — daily GH Action, 04:00 IST.
- **Output:** `data/YYYY-MM-DD.csv` + `data/YYYY-MM-DD.json` committed to the app repo each run. Daily-history is the canonical store; CSV for spreadsheets, JSON for the site build.
- **Store locator data:** `data.gov.in` state-wise Jan Aushadhi Kendra dataset, fetched separately, refreshed weekly.

## Features

| Feature | What it does |
|---|---|
| Daily price snapshot | Latest MRP per product, diffs vs yesterday |
| Per-product price-history graph | Sparkline + full-history chart from committed snapshots |
| Substitute finder | Brand-name input → matching generic Jan Aushadhi product(s); editorial mapping with source citations |
| Store locator | Map of Kendras per state, filterable by district + pincode |
| Savings calculator | "I take X mg of Y daily" → annual ₹ saved switching brand → generic |

## Monetisation — strict

- **Free + sponsor footer ONLY.** Public health ethics override revenue.
- **NO** ads (no AdSense, Ezoic, Mediavine slots).
- **NO** affiliate links (no pharmacy, no Amazon, nothing).
- **NO** third-party analytics that ship cookies or persist identifiers. CF Web Analytics only (cookie-less, no PII).

See [[decisions/policy/monetisation-channel-matrix]] for the family-wide matrix that locks this in.

## License + legal

- Government data: open by default (Government Open Data License – India 1.0).
- Brand → generic substitute mapping is editorial — every mapping cites its source (CDSCO list, manufacturer disclosure, etc.). Disclaimer banner: "Consult a licensed physician before switching medications. This site is informational, not medical advice."
- App code: MIT (per family rule).

## Tech

- Astro + CF Pages (per family hosting rule).
- GH Action does the scrape (not a CF Worker — scrape uses `node-fetch` + `cheerio`, runs once a day, no quota concern).
- Per-state store map via Leaflet + OpenStreetMap tiles (no Mapbox token — see [[decisions/architecture/geocoding-deferred]]).

## Cross-refs

- Q3 priority → [[decisions/architecture/ship-order-2026q3]]
- Monetisation lock → [[decisions/policy/monetisation-channel-matrix]]
