---
type: decision
title: "Data APIs \u2014 Open-Meteo (weather) + Alpha Vantage (finance)"
description: 'Locked 2026-06-20: Open-Meteo for weather data, Alpha Vantage for finance
  / market data. Both free, no card. Both fronted by the umbrella Hono Worker with
  KV-backed cache (1h TTL on weather, 1d TTL on finance EOD) per the CF Worker quota
  mitigation playbook.'
tags:
- decisions
- architecture
- data-api
- weather
- finance
- open-meteo
- alpha-vantage
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/data-api/open-meteo
- services/data-api/alpha-vantage
- decisions/architecture/compute/cf-worker-quota-mitigation
- decisions/architecture/compute/hono-worker-api-umbrella
- decisions/architecture/general/geocoding-deferred
- rules/interaction/no-card-on-file
- rules/interaction/never-hit-quotas
---



# Data APIs — Open-Meteo (weather) + Alpha Vantage (finance)

## Decision

The family adopts two **read-only external data APIs**:

- **[Open-Meteo](../../../services/data-api/open-meteo.md)** —
  weather (forecast / current / historical). Unlimited free, no
  auth, no API key, no card.
- **[Alpha Vantage](../../../services/data-api/alpha-vantage.md)** —
  finance (stocks / forex / crypto / macro / technical
  indicators). 25 requests/day + 5 requests/minute free, free
  API key (email signup), no card.

Both are fronted by the
[umbrella Hono Worker](./hono-worker-api-umbrella.md) at
`api.oriz.in`. Browsers never call them directly — every request
goes through Worker routes that apply
[Workers KV](../../../services/compute/cloudflare-workers.md) caching
per the
[CF Worker quota mitigation playbook](./cf-worker-quota-mitigation.md):

| Surface | TTL | Why this TTL |
|---|---|---|
| Weather forecast | 1 hour | Forecasts update every ~3h upstream; 1h is fresh enough for UI, cuts load 60× |
| Weather historical | 24 hours | Historical data is immutable; 24h TTL is conservative |
| Finance EOD | 24 hours | End-of-day data is immutable post-close; 24h covers the trading day |
| Finance intraday | 5 minutes | Intraday data needs freshness, 5m balances UX vs the 25/day cap |

## Why

- **Open-Meteo unlimited free + no auth** is the lowest-friction
  weather API the family found — no key to rotate, no card,
  multi-model ensemble forecast. Beats OpenWeatherMap (1K/day,
  key required), WeatherAPI (1M/mo, key), Tomorrow.io (card
  past trial), Visual Crossing (card past trial).
- **Alpha Vantage broadest free coverage on one key** — stocks
  + forex + crypto + commodities + macro indicators + technical
  indicators. 25/day cap is tight, but mitigated by KV cache +
  cron-driven warm-cache for top tickers. Beats Twelve Data
  (card past free), Finnhub (card past trial), IEX Cloud (no
  free tier), Polygon.io (US-only + card).
- **Both no-card** — fits [no-card-on-file](../../../rules/interaction/no-card-on-file.md).
- **Both fronted by the umbrella Worker** — keeps the API key
  (Alpha Vantage) on the server, lets KV caching amortise
  burns, lets per-route quota alarms fire via
  [Axiom](../../../services/tooling/axiom.md) at 70% of cap (per
  the CF Worker quota mitigation playbook fail-safes).

## Implications

### Architecture

- **`api.oriz.in/weather/*`** route in the umbrella Worker
  proxies Open-Meteo. Anonymous fetch upstream; the Worker
  applies KV cache + edge `Cache-Control: public, max-age=3600`
  on the response. No API key in any environment.
- **`api.oriz.in/finance/*`** route proxies Alpha Vantage. API
  key sourced from
  [Doppler](../../../services/secrets/doppler.md) (per
  [secrets-management-doppler](../../security/secrets-management-doppler.md)),
  mirrored to the Worker via `wrangler secret put`. Browser
  callers never see the key.
- **Cron-driven warm-cache job** (CF Cron Trigger per
  [cron-split-cf-vs-gh](./cron-split-cf-vs-gh.md)) pre-populates
  KV with top-50 tickers at 18:00 UTC daily. Burns ~10–15 of
  the 25 daily Alpha Vantage requests on a deterministic
  schedule, leaving 10–15 for ad-hoc lookups.
- **Per-Worker quota alarm** at 20 of 25 daily Alpha Vantage
  requests (separate from the 100K Worker request cap) fires
  via Axiom + Better Stack incident — gives a 5-request buffer
  before fail-closed.

### Volume budget

- **Open-Meteo**: realistic family-wide load with 1h cache is
  in the low hundreds of fetches/day at the soft cap of 10K —
  ~2% of the envelope. Locked headroom for if a future site
  goes viral with a weather widget.
- **Alpha Vantage**: 25/day cap minus 10–15 warm-cache burns =
  10–15 ad-hoc lookups/day. Sufficient for the in-flight
  `oriz-finance` site at family scale; if usage outgrows this,
  the swap target is Twelve Data (800/day, also no card).

### Geocoding NOT in this decision

[Geocoding stays deferred](../general/geocoding-deferred.md) — separate
decision, separate concept file. None of the 11 sites need
address ↔ coordinate translation today. `CF-IPCountry` header
covers every current geo-routing need.

### What we don't do

- **No browser-side calls** to either API. All traffic flows
  through the umbrella Worker so KV caching applies and the
  Alpha Vantage key stays server-side.
- **No paid tiers** at either provider — fail-closed on quota
  is preferable to card-on-file.
- **No standalone weather / finance app** is in scope from this
  decision. The APIs are reusable infrastructure for whatever
  feature lands first.
- **No long-term archive** of either API's data — both
  upstreams keep history. The family caches at the edge for
  performance, not storage.

## Cross-refs

- [Open-Meteo service entry](../../../services/data-api/open-meteo.md)
- [Alpha Vantage service entry](../../../services/data-api/alpha-vantage.md)
- [Data APIs index](../../../services/data-api/index.md)
- [CF Worker quota mitigation playbook](./cf-worker-quota-mitigation.md)
- [Umbrella Hono Worker decision](./hono-worker-api-umbrella.md)
- [Cron split decision — drives the warm-cache job](./cron-split-cf-vs-gh.md)
- [Secrets management — Alpha Vantage key in Doppler](../../security/secrets-management-doppler.md)
- [Geocoding deferred decision](../general/geocoding-deferred.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
- [Never hit quotas rule](../../../rules/interaction/never-hit-quotas.md)
