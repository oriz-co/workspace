---
type: decision
title: "Market-data APIs \u2014 FII/DII Activity + Tickertape MMI as standalone repos\
  \ (GH Actions + GH Pages)"
description: 'Two India-market data APIs in the family, each in its own GitHub repo:
  oriz-flow-fii-dii-activity-api (NSE/Moneycontrol FII/DII net activity) + oriz-mmi-tickertape-mmi-api
  (Tickertape Market Mood Index). GH Actions cron scrapes; GH Pages + raw.githubusercontent.com
  serve. The earlier CF Worker design (and the briefly-tried oriz-market-data aggregator)
  were both reverted on 2026-06-22; this file is now active again under the per-repo
  + GH-Pages shape.'
tags:
- decision
- architecture
- api
- market-data
- github-actions
- github-pages
- india
- free-tier
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- architecture/market-data-per-repo
- architecture/market-data-via-github
- architecture/hono-worker-api-umbrella
- architecture/cf-worker-quota-mitigation
- services/easy-free-tier
- rules/infrastructure/cloudflare-pages-only
- rules/interaction/linux-ci-only
---



> **Reactivated 2026-06-22** under a different mechanism. The original body below described two **Cloudflare Workers** (`flow-fii-dii.api.oriz.in`, `mmi.api.oriz.in`) backed by KV. That design was first replaced by an aggregator repo (`oriz-market-data`, see [`market-data-via-github`](../market-data-via-github.md)), then reverted same-day to the current shape: each API stays in its own repo, scraped by GH Actions, served via GitHub Pages + raw.githubusercontent.com. See [`market-data-per-repo`](../general/market-data-per-repo.md) for the current canonical decision. The CF Worker body below is preserved for audit trail and as the historical alternative — the repo slugs and product surfaces it locked are unchanged.

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

- 2 new submodules under `repos/oriz/own/svc/api/` — already wired into `.gitmodules`.
- DNS: 2 new CNAME records under `oriz.in` zone pointing at `*.workers.dev` — set via Cloudflare API on first deploy (handled by `wrangler deploy --custom-domain`).
- Both Workers fit the [easy-free-tier catalog](../../../services/easy-free-tier.md) — CF Workers free 100K req/day + KV 1K writes/day + 100K reads/day per namespace, no card on file.
- Upstream resilience: FII/DII has NSE → Moneycontrol fallback in-Worker; MMI is single-upstream (Tickertape) — if Tickertape drops, we serve stale-while-error from KV until manual intervention.
- Tests scaffolded with `@cloudflare/vitest-pool-workers`, one happy-path per endpoint, per the [tests-parallel rule](../../../rules/development/tests-parallel-and-master-install.md).
- License MIT per the [MIT relicense lock](../general/mit-license-all-repos.md).

## Cross-refs

- [`hono-worker-api-umbrella`](./hono-worker-api-umbrella.md) — the umbrella Worker pattern these deliberately do NOT join
- [`cf-worker-quota-mitigation`](./cf-worker-quota-mitigation.md) — the per-domain-split rule that motivates separate Workers
- [`../../services/easy-free-tier.md`](../../../services/easy-free-tier.md) — CF Workers + KV free-tier confirmation
