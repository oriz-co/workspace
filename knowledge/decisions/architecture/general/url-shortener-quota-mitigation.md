---
type: decision
title: "URL shortener quota mitigation \u2014 cache the 301 itself at the CF edge"
description: "s.oriz.in is a Cloudflare Worker. Free tier is 100K requests/day per\
  \ script. We send `Cache-Control: public, max-age=31536000, immutable` on every\
  \ 301 redirect so CF's edge caches the redirect itself; subsequent visitors hit\
  \ the cache, not the Worker. With caching, only the first visitor per URL per edge\
  \ POP per year burns a Worker request. Realistic upper bound at family-wide traffic\
  \ is ~1-2K requests/day \u2014 well under 100K. No external shortener required."
tags:
- short-link
- cloudflare
- worker
- quota
- caching
- mitigation
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/short-link/cloudflare-worker
- services/compute/cloudflare-workers
- decisions/architecture/general/cross-post-engine
- decisions/architecture/frontend/linkroll-raindrop-to-links-page
- rules/interaction/never-hit-quotas
- rules/interaction/no-card-on-file
---



# URL shortener quota mitigation — cache the 301 itself at the CF edge

## Decision

The family's [s.oriz.in shortener](../../../services/short-link/cloudflare-worker.md)
is a Cloudflare Worker. The free tier is **100,000 Worker
requests/day per script**. The user asked: *"Is in there any
completely free service ... I will overpower the overrun the cloud
player workers limit if I use this. How to mitigate?"*

The mitigation is a **single trick**: cache the 301 redirect itself
at the Cloudflare edge.

```ts
// sketch — actual Worker is ~30 LoC
return new Response(null, {
  status: 301,
  headers: {
    Location: target,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'CDN-Cache-Control': 'public, max-age=31536000, immutable',
  },
});
```

With this header set:

- The **first** visitor through a given edge POP for a given slug
  triggers the Worker (1 request burned, KV hit, 301 written).
- **Every subsequent visitor** through the same POP for that slug
  for the next year hits the CF edge cache and the Worker is never
  invoked.
- The slug TTL effectively becomes **1 year per slug per edge POP**.

No external shortener is added. No card. No Bitly. No paid tier.

## Why this works

- A 301 is **cacheable HTTP per RFC 7231 §6.4.2** — any CDN may
  cache it indefinitely. CF respects `Cache-Control` on Worker
  responses by default.
- The Worker emits **only** a 301 — minimal CPU, minimal memory.
  Even uncached, each request is well under the per-request CPU
  budget.
- The KV mapping is read **once per POP per slug per year**, well
  inside KV's free 100K reads/day envelope.
- Slug invalidation (rare — short-links are immutable by design) is
  handled by purging that one URL via the CF API on the rare retire
  case.

## Realistic upper bound at family scale

Back-of-envelope:

- ~30 active platforms × ~10 cross-posts/day × 1.5 click avg
  ≈ **450 clicks/day** for `oriz-omnipost`-minted slugs.
- Linkroll click volume — well under 1K/day even on a viral day.
- QR / talk slugs — sporadic, bursty, low.

Add a 2× safety margin for cold-cache spread across CF's ~300+
edge POPs (each POP misses cache once per slug per year): worst
case ~1-2K Worker requests/day. The free tier is 100,000/day. We
sit at **1-2% of headroom**, comfortably inside
[`rules/never-hit-quotas.md`](../../../rules/interaction/never-hit-quotas.md).

## Implications

- **The s.oriz.in Worker MUST emit `Cache-Control: public,
  max-age=31536000, immutable` on every 301.** This is now part of
  the Worker contract and is documented in
  [`services/short-link/cloudflare-worker.md`](../../../services/short-link/cloudflare-worker.md).
- **Slugs are immutable by design.** Once minted, the
  `slug → target URL` mapping does not change. If a target URL
  needs to retire, mint a NEW slug rather than re-pointing the old
  one (which would require a CF cache purge and create a window of
  inconsistency).
- **No analytics from the Worker for cached visits.** The cache
  hits never reach the Worker, so per-slug click analytics undercount.
  The family accepts this — Cloudflare Web Analytics + UTM
  parameters captured on the destination page are the source of
  truth for click attribution per
  [`decisions/architecture/utm-attribution-strategy.md`](./utm-attribution-strategy.md).
  The Worker's `/_stats/<slug>` endpoint reports KV-stored mint
  counts and last-click guesstimate, not authoritative traffic.
- **DO NOT add Bitly / TinyURL / external shorteners.** This
  decision explicitly closes the door on that path: the cache trick
  pushes us so far inside the free envelope that reaching for a
  third-party would only add fragility (vendor disappearance, custom
  domain loss, rate-limit surprises).
- **DO NOT enable Workers Paid** to "increase headroom" — violates
  [`rules/no-card-on-file.md`](../../../rules/interaction/no-card-on-file.md) and
  is unnecessary given the cache math above.

## Cross-refs

- [s.oriz.in service entry](../../../services/short-link/cloudflare-worker.md)
- [Cloudflare Workers — substrate](../../../services/compute/cloudflare-workers.md)
- [Cross-post engine — primary consumer](./cross-post-engine.md)
- [Linkroll → s.oriz.in mints](../frontend/linkroll-raindrop-to-links-page.md)
- [UTM attribution strategy — authoritative click source](./utm-attribution-strategy.md)
- [Never hit quotas rule](../../../rules/interaction/never-hit-quotas.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
