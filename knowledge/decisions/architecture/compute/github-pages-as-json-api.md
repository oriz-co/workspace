---
type: decision
title: GitHub Pages as canonical static JSON API host
description: Static, read-only JSON APIs live in <name>-api repos and serve via GitHub
  Pages with a custom subdomain. GH Actions cron updates the JSON. Cloudflare Worker
  only for dynamic / write / auth-gated endpoints. APIs are publishable to RapidAPI
  + other monetization marketplaces.
tags:
- architecture
- api
- json
- github-pages
- monetization
- rapidapi
- static
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/ops/multi-target-build
- decisions/branding/naming-policy-v6
- decisions/architecture/compute/hono-worker-api-umbrella
---



# GitHub Pages as canonical static JSON API host

## Decision

Static, read-only JSON APIs across the chirag127 family ship as
**GitHub Pages repos with the `-api` suffix**. GH Actions cron updates
the JSON. Cloudflare Worker (`api.oriz.in`) handles only the dynamic /
write / auth-gated endpoints.

## Why GitHub Pages over CF Worker for static APIs

| Aspect | GitHub Pages | CF Worker |
|---|---|---|
| Cost | Free, unlimited repos | Free 100K req/day account-wide |
| Per-repo isolation | Yes — each repo independent | No — shared account quota |
| Custom domain | Yes, one per repo | One per Worker (or via Pages) |
| Bandwidth | 100 GB/month soft cap | Unlimited |
| Build time | GH Actions cron, no limit | Build at request time |
| Cold start | Zero (static file) | Zero (Workers are fast) |
| Update path | Commit JSON, push | Deploy new Worker |
| Monetizable on RapidAPI | Yes, expose via HTTP endpoint | Yes |
| CORS | Wildcard on raw + Pages | Configurable |

The killer point: **GitHub Pages quota is per-repo + unlimited repos**.
Adding the 50th `-api` repo doesn't fight the existing 49 for quota.
CF Worker's 100K/day is shared across ALL family Workers.

## The `-api` suffix

Repos that serve static JSON datasets via GitHub Pages get the `-api`
suffix appended to the v6 family naming policy:

| Example | Subdomain | Endpoint |
|---|---|---|
| `oriz-mmi-tracker-api` | `mmi.oriz.in` | `/data.json` — market mood index time-series |
| `oriz-fii-dii-activity-api` | `fii-dii.oriz.in` | `/data.json` — FII/DII flow daily aggregate |
| `oriz-redirects-api` | `redirects.oriz.in` | `/map.json` — family-wide redirect map |
| `oriz-family-registry-api` | `family.oriz.in` | `/registry.json` — list of all oriz-* products |

## Architecture per `-api` repo

```
oriz-<name>-api/
├── .github/workflows/
│   ├── cron.yml         # scheduled: scrape source → produce JSON → commit
│   └── deploy.yml       # on push: deploy /public/ to GitHub Pages
├── src/
│   └── scraper.py       # or .ts — the data producer
├── public/
│   ├── data.json        # the API payload, committed
│   ├── meta.json        # schema, last-updated, version
│   ├── openapi.json     # spec for RapidAPI listing
│   └── index.html       # tiny landing page documenting the API
├── CNAME                # <subdomain>.oriz.in
├── README.md            # docs + RapidAPI link
└── LICENSE
```

`scraper.py` (or `.ts`) runs in GH Actions cron, fetches upstream data,
writes `public/data.json`, commits + pushes. GitHub Pages serves the
file at `https://<subdomain>.oriz.in/data.json`.

## Monetization via RapidAPI + others

Each `-api` repo lists on:
- **RapidAPI** (per `services/data-api/rapidapi.md` — TODO) — free tier
  + paid tiers monetized via stripe-on-rapidapi (no card on our side).
- **Apilayer / API Marketplace** as secondary listings.
- **Direct subdomain access** — free public read.

RapidAPI handles auth, rate-limiting, billing; we just expose the
public subdomain URL.

## When NOT to use GitHub Pages

- **Dynamic responses** (per-request computation, query params change output) → CF Worker.
- **Write operations** (POST / PUT / PATCH / DELETE) → CF Worker.
- **Auth-gated reads** (per-user data) → CF Worker + Firebase Auth.
- **Payload > 1 GB** (entire repo size) → CF Pages or R2.
- **Latency-critical** (need < 50ms response globally) → CF Worker at edge.

## Cross-refs

- [naming-policy-v6](../../branding/naming-policy-v6.md) — `-api` suffix added
- [hono-worker-api-umbrella](./hono-worker-api-umbrella.md) — the CF Worker side
- [multi-target-build](../ops/multi-target-build.md) — release cadence applies
- [data-canonical-store](../../../policy/data-canonical-store.md) — JSONL conventions
