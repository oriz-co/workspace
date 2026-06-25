---
type: decision
title: "Geocoding \u2014 deferred (no current need); CF-IPCountry covers geo-routing\
  \ today"
description: "No geocoding service adopted in 2026-06-20. None of the 11 current sites\
  \ need address\u2194coordinate translation. Cloudflare's free `CF-IPCountry` request\
  \ header covers all current geo-routing needs (consent banner geo, payment-route\
  \ geo). When a site lands a map feature, the swap target is OpenStreetMap Nominatim\
  \ or Mapbox \u2014 both free, no card."
tags:
- decisions
- architecture
- geocoding
- nominatim
- mapbox
- cf-ipcountry
- deferred
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- decisions/security/consent-management-multi-category
- rules/interaction/no-card-on-file
- rules/interaction/never-hit-quotas
---



# Geocoding — deferred (no current need); CF-IPCountry covers today

## Decision

The family adopts **no geocoding service** in 2026-06-20. No
account at OpenStreetMap Nominatim, no Mapbox account, no
Google Geocoding key. The `CF-IPCountry` header that Cloudflare
attaches to every request at the edge — free, included with the
existing [Cloudflare Pages](../../../services/hosting/cloudflare-pages.md)
zone, requires no third-party account — is sufficient for every
geo-shaped need the family has today.

When a future site lands a feature that needs **address ↔
coordinate** translation (forward or reverse geocoding), the
swap target is documented as **OpenStreetMap Nominatim** or
**Mapbox** — picked at adoption time based on volume, neither
requires a card on the free tier.

## Why

- **No current geocoding-shaped need.** None of the 11 sites
  have a map view, a "find nearby" feature, an address-input
  form, or a coordinate-display surface. The user direction was
  *"confused; recommend skip as deferred"* — the family
  takes that recommendation.
- **`CF-IPCountry` covers every current geo-routing need.** The
  consent-banner default is geo-routed by country code (per
  [consent-management-multi-category](../../security/consent-management-multi-category.md));
  payment routing splits Indian vs international buyers (per
  [max-payment-methods](../../monetisation/max-payment-methods.md));
  ad-network selection differs by region. All three read
  `CF-IPCountry`, none need a coordinate or street address.
- **Adopting today fights the [never-hit-quotas rule](../../../rules/interaction/never-hit-quotas.md).**
  Free tiers exist (Nominatim 1 req/sec OSS, Mapbox 100K
  loads/mo) but signing up before there's a feature to use it
  burns a swap-cost slot for no benefit.
- **Deferred is honest** — documents the swap targets and the
  trigger conditions so the next agent doesn't re-derive the
  shortlist when the feature lands.

## Implications

### What we don't do

- **No Nominatim account, no Mapbox key, no Google Geocoding
  account today.** Not in
  [`templates/.env.example`](../../../templates/.env.example).
- **No `<Map>` or `<Geocoder>` component** in
  [`@chirag127/oriz-kit`](../../../glossary/o-r/oriz-kit.md). When
  the first site needs one, it lands in the kit at adoption time.
- **No reverse-geocoding fallback** in any consent / payment /
  i18n path. `CF-IPCountry` is enough for country-level routing;
  city / coordinate-level routing is not a current need.

### When this flips — promote `deferred → active`

Promote when **any one** of these holds:

1. **`oriz-finance` lands a map view** (e.g. "where my brokers
   are" / "regional regulator map") that needs forward / reverse
   geocoding for office addresses.
2. **`oriz-me` lands a "visited cities" / "lifestream
   geo-tagging" feature** that needs reverse-geocoding GPS
   coordinates from JSONL events to city / country names.
3. **Any future site lands an "address input" form** that needs
   to validate and standardise addresses (e.g. shipping, event
   venues).
4. **A consent-banner surface needs sub-country geo-targeting**
   that `CF-IPCountry` cannot serve.

### Swap targets — pick at adoption time

| Provider | Free tier | Card | When to pick |
|---|---|---|---|
| OpenStreetMap Nominatim (public) | 1 req/sec, no auth | No | Low volume, OSS-friendly, attribution-on-page acceptable |
| Mapbox | 100K geocoding requests / month, 50K map loads / month | No | Moderate volume, polished map tiles, brand-mark acceptable |

The picked provider must:

- Not require a card on file at sign-up — keeps
  [no-card-on-file](../../../rules/interaction/no-card-on-file.md) intact.
- Have a documented swap path back to the other in this table —
  fail-closed parity per
  [never-hit-quotas](../../../rules/interaction/never-hit-quotas.md).
- Land in [`@chirag127/oriz-kit`](../../../glossary/o-r/oriz-kit.md)
  as `<Map>` / `<Geocoder>` so swapping providers is one prop
  flip across the family, not 11 fixes.

### What stays

- **`CF-IPCountry` header** — used by the consent banner geo
  defaults, payment-route gateway selection, and ad-network
  geo-switch. Free, edge-injected, no third-party.
- **No geo-IP city DB** — city-level GeoIP is a separate
  capability and not currently needed; if a feature lands, it
  comes through the same evaluation as geocoding.

## Cross-refs

- [Consent management uses CF-IPCountry for geo defaults](../../security/consent-management-multi-category.md)
- [Max payment methods — geo-routed by CF-IPCountry](../../monetisation/max-payment-methods.md)
- [Cloudflare Pages — provides CF-IPCountry header](../../../services/hosting/cloudflare-pages.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
- [Never hit quotas rule](../../../rules/interaction/never-hit-quotas.md)
- [Open Knowledge Format — `_okf.md`](../../../_okf.md)
