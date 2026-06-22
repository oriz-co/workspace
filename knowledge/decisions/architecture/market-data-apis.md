---
type: decision
title: "Market-data APIs — FII/DII Activity + Tickertape MMI as Cloudflare Workers"
description: "Two new India-market data APIs in the family, each a single Cloudflare Worker scraping/mirroring one upstream and serving cached JSON: flow-fii-dii.api.oriz.in (NSE/Moneycontrol FII/DII net activity) + mmi.api.oriz.in (Tickertape Market Mood Index). Hono router, KV cache per API, public CORS, no auth, free tier."
tags: [decision, architecture, api, cloudflare-workers, hono, kv-cache, market-data, india, free-tier, superseded]
timestamp: 2026-06-21
format_version: okf-v0.1
status: superseded
superseded_by: architecture/market-data-via-github
related:
  - architecture/market-data-via-github
  - architecture/hono-worker-api-umbrella
  - architecture/cf-worker-quota-mitigation
  - services/easy-free-tier
  - rules/cloudflare-pages-only
  - rules/linux-ci-only
---

> **SUPERSEDED 2026-06-22** by [`market-data-via-github`](./market-data-via-github.md). The two CF Worker APIs `flow-fii-dii.api.oriz.in` + `mmi.api.oriz.in` were never used in production; they are replaced by GitHub Actions scraping into `chirag127/oriz-market-data` and apps fetching `raw.githubusercontent.com` JSON. Both upstream repos are GitHub-archived (kept for audit trail) and unlinked from the master submodule set.

# Market-data APIs — FII/DII Activity + Tickertape MMI

## Decision

Two new India-market data APIs land as **standalone Cloudflare Workers** (not folded into the `api.oriz.in` umbrella) — each per its own subdomain, each with its own KV cache binding, each serving public JSON with CORS `*`:

| API | Subdomain | Upstream | Cache TTL |
|---|---|---|---|
| FII/DII net activity | `flow-fii-dii.api.oriz.in` | NSE India (primary) + Moneycontrol (fallback) | 24h per date / range |
| Market Mood Index mirror | `mmi.api.oriz.in` | Tickertape (`api.tickertape.in/mmi/now`) | 1h on `/current`, 24h on `/history` |

Both use Hono router, single `CACHE` KV binding, Linux-only CI, `wrangler deploy` on push to `main` via `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` org secrets. No auth, 60 req/min/IP via Cloudflare built-in rate-limit.

## Why standalone Workers, not folded into `api.oriz.in`

Each gets its own 100K req/day free envelope per [cf-worker-quota-mitigation](./cf-worker-quota-mitigation.md) step 4 ("split Workers by domain") — adding these to the umbrella Worker would burn a single shared envelope on third-party-data routes that aren't directly tied to oriz product code. Separate subdomain keeps them addressable, separately rate-limitable, and independently redeployable. KV gets its own namespace per Worker — clean blast radius if one upstream changes shape.

## Implications

- 2 new submodules under `projects/apis/` — already wired into `.gitmodules`.
- DNS: 2 new CNAME records under `oriz.in` zone pointing at `*.workers.dev` — set via Cloudflare API on first deploy (handled by `wrangler deploy --custom-domain`).
- Both Workers fit the [easy-free-tier catalog](../../services/easy-free-tier.md) — CF Workers free 100K req/day + KV 1K writes/day + 100K reads/day per namespace, no card on file.
- Upstream resilience: FII/DII has NSE → Moneycontrol fallback in-Worker; MMI is single-upstream (Tickertape) — if Tickertape drops, we serve stale-while-error from KV until manual intervention.
- Tests scaffolded with `@cloudflare/vitest-pool-workers`, one happy-path per endpoint, per the [tests-parallel rule](../../rules/tests-parallel-and-master-install.md).
- License MIT per the [MIT relicense lock](./mit-license-all-repos.md).

## Cross-refs

- [`hono-worker-api-umbrella`](./hono-worker-api-umbrella.md) — the umbrella Worker pattern these deliberately do NOT join
- [`cf-worker-quota-mitigation`](./cf-worker-quota-mitigation.md) — the per-domain-split rule that motivates separate Workers
- [`../../services/easy-free-tier.md`](../../services/easy-free-tier.md) — CF Workers + KV free-tier confirmation
