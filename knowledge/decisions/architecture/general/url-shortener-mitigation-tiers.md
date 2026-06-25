---
type: decision
title: "URL shortener three-tier free stack \u2014 s.oriz.in primary, TinyURL fallback,\
  \ GitHub Gist redirect zero-infra"
description: 'Three-tier URL shortener stack, all free, no card. Tier 1: self-hosted
  s.oriz.in CF Worker (primary, edge-cached 301s). Tier 2: TinyURL API (fallback,
  unlimited free, no auth, no card). Tier 3: GitHub Gist HTML meta-refresh redirect
  (zero-infra, last-resort). Quota math shows the family sits at ~1-2% of the CF Worker
  free envelope.'
tags:
- architecture
- short-link
- cloudflare
- tinyurl
- github-gist
- quota
- mitigation
- fallback
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/short-link/cloudflare-worker
- services/short-link/tinyurl
- services/short-link/github-gist-redirect
- decisions/architecture/general/url-shortener-quota-mitigation
- decisions/architecture/general/cross-post-engine
- rules/interaction/never-hit-quotas
- rules/interaction/no-card-on-file
---



# URL shortener three-tier free stack — s.oriz.in primary, TinyURL fallback, GitHub Gist redirect zero-infra

## Decision

The family runs **three free URL-shortening tiers**, each with a
distinct role. All three are free, no card, no quota cliff at family
scale.

| Tier | Service | Role | When |
|---|---|---|---|
| 1 (primary) | [s.oriz.in CF Worker](../../../services/short-link/cloudflare-worker.md) | Self-hosted, branded, edge-cached | Default for everything family-owned |
| 2 (fallback) | [TinyURL API](../../../services/short-link/tinyurl.md) | Free unlimited, no auth, no card | Outside oriz.in, or s.oriz.in down |
| 3 (zero-infra) | [GitHub Gist redirect](../../../services/short-link/github-gist-redirect.md) | Meta-refresh HTML page, immortal | Both above unavailable, or critical immutable redirect |

This decision builds on
[`url-shortener-quota-mitigation.md`](./url-shortener-quota-mitigation.md)
(the cache-the-301 trick) — that decision keeps Tier 1 well inside
the free envelope; this decision adds two further-fallback tiers so
the surface is robust even if Cloudflare Workers itself is down.

## Tier 1 (primary): s.oriz.in self-hosted CF Worker

Already locked at
[`services/short-link/cloudflare-worker.md`](../../../services/short-link/cloudflare-worker.md).
Mitigation playbook (full detail in
[`url-shortener-quota-mitigation.md`](./url-shortener-quota-mitigation.md)):

1. **Edge-cache the 301 itself** — `Cache-Control: public,
   max-age=31536000, immutable` + `CDN-Cache-Control` header on the
   redirect response. CF's edge cache serves repeats; the Worker is
   not invoked.
2. **Hot keys cached in Workers KV** — ~1 ms lookup vs Worker
   compute path. KV free tier (100K reads/day, 1K writes/day, 1 GiB
   storage) has orders of magnitude of headroom.
3. **Per-edge POP cache miss math** — ~250 CF POPs × 1 cold-miss per
   slug per year = 250 Worker hits per URL per year. Negligible.
4. **Realistic upper bound at family-wide traffic:** ~1-2K Worker
   req/day (see Quota math below) vs 100K/day free quota — **50x
   headroom**.

When to use: anything `chirag127/oriz*` originates that benefits from
a branded short URL. Default mint surface for
[`oriz-omnipost`](./cross-post-engine.md) when a target platform
truncates content.

## Tier 2 (fallback): TinyURL API

Documented at
[`services/short-link/tinyurl.md`](../../../services/short-link/tinyurl.md).
Endpoint: `https://tinyurl.com/api-create.php?url=<urlencoded>`.

- **Truly free, unlimited, no auth, no card** — single GET that
  returns a `tinyurl.com/<slug>` plain-text body.
- **No account, no API key, no rate-limit signup wall.**

When to use:

- Need a short link **outside `oriz.in`** — e.g. embedded in a tweet
  or DM that points to a third-party URL where minting an
  `s.oriz.in/<slug>` would be misleading branding (the destination
  isn't ours).
- `s.oriz.in` Worker is down (highly unlikely — Cloudflare Workers
  uptime is consistently 4-nines+).
- Rapidly testing without configuring a Worker route or adding a KV
  entry.
- An ephemeral short link the family doesn't want to track in KV
  long-term.

## Tier 3 (zero-infrastructure): GitHub Gist redirect HTML page

Documented at
[`services/short-link/github-gist-redirect.md`](../../../services/short-link/github-gist-redirect.md).
A Gist hosted at `gist.github.com/chirag127/<hash>` containing a
single HTML file:

```html
<!doctype html>
<meta charset="utf-8">
<title>Redirecting…</title>
<meta http-equiv="refresh" content="0; url=<TARGET>">
<link rel="canonical" href="<TARGET>">
<script>location.replace('<TARGET>')</script>
<p>Redirecting to <a href="<TARGET>"><TARGET></a>…</p>
```

Rendered via `gist.githubusercontent.com/.../raw/<file>.html` (the
raw URL is served as `text/html` by GitHub's gist raw endpoint when
the file extension is `.html`).

- **Zero cost, zero infra.** GitHub free tier hosts unlimited gists.
- **No card, no Worker, no DNS.** Survives a complete Cloudflare
  outage.
- **Permanent + immutable** — the gist URL never expires; the gist
  history is auditable.

When to use:

- Both `s.oriz.in` AND TinyURL are down at the same time (~never).
- Need a **permanent, immutable redirect** for a critical link
  (talk URL, conference QR code, paper citation) where even a 1%
  long-tail uptime risk on a third-party shortener is too much.
- An archival redirect that must outlive the family's Cloudflare
  account if that ever transfers.

## Quota math

Back-of-envelope Tier-1 load at projected family scale:

```
DAU (family-wide)                : ~1,000
Avg short-link clicks per visit  : ~5
                                  ----
Click events per day              : ~5,000

CF edge cache miss rate (per slug per POP per year):
  Slugs are immutable. After first miss, cached for 1 year.
  Active slugs at family scale: ~500-1,000
  CF POPs (geographic):         ~250
  Cold misses per active slug:   1 per POP per year

  → ~250 misses × 1,000 slugs / 365 days = ~685 Worker req/day from cold-miss
  → Add ~500/day from new-slug mints + KV writes
  → Total: ~1,200 Worker req/day

Free quota                        : 100,000 Worker req/day
                                   ----
Headroom                          : ~83x
% of free envelope used           : ~1.2%
```

Sits comfortably inside
[`rules/never-hit-quotas.md`](../../../rules/interaction/never-hit-quotas.md) even
with 10x growth.

## Why this layering

- **Tier 1 covers ~99.9% of clicks.** Fast, branded, cheap, audited.
- **Tier 2 adds breadth without infra.** TinyURL fills the
  cross-domain branding case and the "Worker down" outage case
  without any extra account or card.
- **Tier 3 adds depth without dependency.** Even if Cloudflare and
  TinyURL both vanish, GitHub gists still resolve.
- **No tier requires a card.** The
  [`no-card-on-file rule`](../../../rules/interaction/no-card-on-file.md) holds
  across the entire stack.
- **No tier requires a subscription.** The
  [`no-subscriptions rule`](../../../rules/infrastructure/no-subscriptions.md) holds
  too.
- **The decision explicitly rejects Bit.ly, Rebrandly, Short.io, T.ly
  paid tiers** — see the alternatives table in
  [`services/short-link/cloudflare-worker.md`](../../../services/short-link/cloudflare-worker.md).

## Implications

- **`oriz-omnipost` short-link adapter** stays pointed at Tier 1 for
  default mints; gains a `--fallback=tinyurl` flag for the cross-
  domain case; never hardcodes Tier 3 (manual-only).
- **Tier 2 calls are server-to-server** from the
  [`api.oriz.in` Hono Worker](../compute/hono-worker-api-umbrella.md). No
  client-side calls to `tinyurl.com` (CSP keeps `connect-src` clean).
- **Tier 3 gists are hand-minted** — no automation. Adding automation
  would create a write-frequent path and risk gist-list churn.
- **All three tiers preserve the canonical URL** — the destination
  page receives the original target unchanged. UTM tagging stays per
  [`utm-attribution-strategy.md`](./utm-attribution-strategy.md).
- **No analytics on Tier 2 or Tier 3.** Click attribution stays at
  the destination via UTMs + Cloudflare Web Analytics —
  authoritative click source per
  [`utm-attribution-strategy.md`](./utm-attribution-strategy.md).
- **DO NOT consolidate tiers.** Each tier solves a distinct failure
  mode; collapsing to one removes the redundancy this decision
  exists to provide.

## Cross-refs

- [s.oriz.in Cloudflare Worker — Tier 1 service](../../../services/short-link/cloudflare-worker.md)
- [TinyURL — Tier 2 service](../../../services/short-link/tinyurl.md)
- [GitHub Gist redirect — Tier 3 service](../../../services/short-link/github-gist-redirect.md)
- [URL shortener quota mitigation (cache-the-301)](./url-shortener-quota-mitigation.md)
- [Cross-post engine — primary Tier 1 consumer](./cross-post-engine.md)
- [UTM attribution strategy — authoritative click source](./utm-attribution-strategy.md)
- [Never hit quotas rule](../../../rules/interaction/never-hit-quotas.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
