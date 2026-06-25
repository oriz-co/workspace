---
type: decision
title: Cloudflare Worker quota mitigation playbook
description: 'Locked 2026-06-20: 8-step playbook for staying under the CF Workers
  free-tier quota (100K req/day per Worker, 10ms CPU/req). Cache aggressively at the
  edge, split Workers by domain, and prefer `_headers`/`_redirects` over Worker logic
  when possible. Generalises the URL-shortener cache trick to every Worker in the
  family.'
tags:
- cloudflare
- workers
- quotas
- caching
- performance
- decisions
- architecture
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/compute/cloudflare-workers
- services/short-link/cloudflare-worker
- services/social/satori-og-cards
- decisions/architecture/compute/hono-worker-api-umbrella
- rules/interaction/never-hit-quotas
- rules/interaction/no-card-on-file
- architecture/general/layer-5-compute
---



# Cloudflare Worker quota mitigation playbook

## Decision

Every Cloudflare Worker in the family follows a documented
mitigation playbook to stay safely under the free tier. The user's
concern was: *"I'm using software workers for many more things, so I
might outrun it."* This decision codifies the techniques that keep
the [api.oriz.in umbrella Worker](./hono-worker-api-umbrella.md), the
[s.oriz.in short-link Worker](../../../services/short-link/cloudflare-worker.md),
the [Satori OG Worker route](../../../services/social/satori-og-cards.md),
and any future Worker safely below quota.

## Free-tier limits to respect

- **100,000 requests / day per Worker** (rolling 24h)
- **10ms CPU per request** (wall-time can be longer; CPU is the metered axis)
- **Workers KV: 100k reads / day, 1k writes / day, 1 GiB** (per namespace)
- **Cron Triggers: 1,000 / day** (separate quota, does **not** count
  against request quota)

## The 8-step playbook

### 1. Cache the response with long `Cache-Control`

Set `Cache-Control: public, max-age=31536000, immutable` (or whatever
freshness fits the resource) so the Cloudflare edge cache serves
repeat requests **without invoking the Worker**. The Worker
handles only the first request per cache key per edge node; every
subsequent hit is served from cache and does not count.

Used by: Satori OG cards (parameter-hash key), short-link 302s
(per-slug), any idempotent GET.

### 2. Use the Cloudflare Cache API inside the Worker

For dynamic responses where `Cache-Control` alone isn't enough:

```ts
const cache = caches.default;
const cacheKey = new Request(request.url, request);
let response = await cache.match(cacheKey);
if (!response) {
  response = await computeFreshResponse();
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
}
return response;
```

Cache hits return early before any compute → CPU stays near zero
on hot keys. The `waitUntil` writes back asynchronously so the user
gets the response immediately.

### 3. Move static logic to `_headers` / `_redirects`

Cloudflare Pages reads `_headers` and `_redirects` files at the edge
**without invoking a Worker**. Anything that can be expressed as a
static header (CSP, HSTS, CORS for known origins) or a static
redirect (apex → www, old paths → new) belongs there, not in a
Worker.

The [security headers strategy](../../security/security-headers-strategy.md)
already uses `_headers`. Apply the same posture to redirects.

### 4. Split Workers by domain — each gets its own 100K/day quota

The free-tier quota is **per Worker**, not per account. Splitting a
single monolithic Worker into per-domain Workers multiplies the
effective family-wide quota:

- `api.oriz.in/og` → one Worker, 100K/day
- `s.oriz.in` → another Worker, 100K/day
- `api.oriz.in/*` (excluding `/og`) → another Worker, 100K/day
- per-extension Worker subdomains → 100K/day each

The [umbrella Hono Worker decision](./hono-worker-api-umbrella.md)
keeps the API surface single — but routes that have their own
domain (OG, short-link) are deployed as separate Workers and
inherit independent quotas.

### 5. Use HTML Rewriter for cheap edge transforms

The `HTMLRewriter` API streams the upstream response through one or
more transformers and counts as a **single** request — not
"upstream + transform" billed separately. Use it for header
injection, content rewrites, A/B variant swaps, and feature-flag
gating instead of fetching, parsing, and re-emitting in Worker
JavaScript (which would burn CPU).

### 6. CDN-cache OG images at the edge

The Satori OG endpoint returns a 1200×630 PNG keyed by parameter
hash. Combined with #1 and #2, the Worker generates each unique
title/theme combination **once**; every other request from any edge
node is served from cache. With `immutable` cache headers, the
realistic burn for a year of OG-card serving stays in the low
thousands of generations even at million-pageview scale.

### 7. Use Workers KV for hot-path lookups

KV reads are faster than [D1](../../../services/database/turso.md) /
[Neon](../../../services/database/neon-postgres.md) and use less CPU.
For per-request lookups (slug → URL, license-key → state, feature
flag → variant), KV is the right substrate. The 100k reads/day cap
is per namespace; split namespaces per domain (same logic as #4).

### 8. Cron Triggers don't count against request quota

CF Cron Triggers run a Worker on a schedule and consume from a
**separate** 1,000/day quota. Background work — RSS poll, idempotency
sweep, cache rebuild, federation outbox flush — belongs on Cron
Triggers, not on user-request handlers. The
[cron split decision](./cron-split-cf-vs-gh.md) already routes long /
build-shaped jobs to GitHub Actions; CF Cron Triggers handle in-Worker
periodic tasks.

## Fail-safes (apply on top of the playbook)

- **Per-Worker request budget alarm** — Worker emits a metric to
  [Axiom](../../../services/tooling/axiom.md) on every request; alert
  fires at 70K/day (70% of cap), giving 24h headroom before the
  quota actually trips.
- **Quota-trip fallback** — when a Worker fails-closed, the
  consumer (oriz-kit `<Image>` chain, short-link consumer, etc.)
  has a documented swap target. Worker quota cliffs are recoverable
  per-site, not catastrophic.
- **No card-on-file** — quota fail-closed is a feature; the family
  never enables CF Workers Paid plan because that would put a card
  on the account in violation of
  [`rules/no-card-on-file.md`](../../../rules/interaction/no-card-on-file.md).

## Cross-refs

- [Cloudflare Workers service](../../../services/compute/cloudflare-workers.md)
- [URL shortener Worker (s.oriz.in)](../../../services/short-link/cloudflare-worker.md) — original cache-trick example this generalises
- [Satori OG Worker (api.oriz.in/og)](../../../services/social/satori-og-cards.md)
- [Umbrella Hono Worker decision](./hono-worker-api-umbrella.md)
- [Cron split decision](./cron-split-cf-vs-gh.md)
- [Security headers strategy — uses `_headers`](../../security/security-headers-strategy.md)
- [Never hit quotas rule](../../../rules/interaction/never-hit-quotas.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
- [Layer 5 — compute architecture (Tier 2 = CF Workers)](../../../architecture/general/layer-5-compute.md)
