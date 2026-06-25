---
type: decision
title: "OG card generation \u2014 Satori on api.oriz.in/og + ray.so for code"
description: Non-code posts get OG cards from Satori (@vercel/og) on a Hono Worker
  route at api.oriz.in/og. Code-heavy posts continue on ray.so. Static-cached via
  CF edge cache headers, no per-post PNGs in any site repo.
tags:
- decisions
- architecture
- og-image
- satori
- cloudflare-workers
- social
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/social/satori-og-cards
- services/social/ray-so
- services/compute/cloudflare-workers
- decisions/architecture/compute/hono-worker-api-umbrella
- decisions/architecture/general/cross-post-engine
- rules/interaction/no-card-on-file
---



# OG card generation — Satori on `api.oriz.in/og` + ray.so for code

## Decision

The family generates Open Graph card images via **two routes,
picked by post shape**:

1. **Non-code posts (default)** —
   [Satori on the api.oriz.in Hono Worker](../../../services/social/satori-og-cards.md)
   at `https://api.oriz.in/og?title=<...>&theme=<...>&site=<...>`.
   `@vercel/og` (MIT) renders JSX themes from
   [`@chirag127/oriz-kit`](../../../glossary/o-r/oriz-kit.md) to a
   1200×630 PNG. Free unlimited on the Cloudflare Workers free tier
   (100K req/day cap, well above family scale after edge caching).
2. **Code-heavy posts** — [Ray.so](../../../services/social/ray-so.md)
   continues to render syntax-highlighted code-screenshot PNGs.

Sites set `<meta property="og:image">` to the appropriate URL; the
PNG is cached at the Cloudflare edge for one year (`Cache-Control:
public, max-age=31536000, immutable`, ETag = parameter hash).

## Why

- **Templating wins for non-code posts.** Hand-drawn or
  per-post-baked OGs don't scale to 11+ sites worth of pages.
  Satori takes a JSX theme + post params and renders deterministic
  PNGs — same look across the family, no manual step per post.
- **Ray.so wins for code.** Syntax highlighting + window chrome is
  what ray.so already does for free; rebuilding it inside Satori
  would duplicate it.
- **Stack cohesion.** Satori runs on the existing api.oriz.in Hono
  umbrella Worker per
  [`hono-worker-api-umbrella.md`](../compute/hono-worker-api-umbrella.md) —
  no new deployment, no new credentials, billing surface stays one.
- **Free unlimited** at family scale. The CF Workers free tier
  is 100K req/day; static cache headers reduce real load to
  cold-first-render only. Fits the
  [no-card-on-file rule](../../../rules/interaction/no-card-on-file.md).
- **No per-post PNG commits.** Sites don't ship `og.png` files in
  their `public/`; they emit a single `<meta>` URL and the image
  renders on first social-platform crawl. Repo size stays flat.

## Implications

- **One Hono route owned**: `GET /og` on
  [`api.oriz.in`](../compute/hono-worker-api-umbrella.md). Handler validates
  query params, looks up the theme component from the
  `@chirag127/oriz-kit` themes registry, calls `@vercel/og`, returns
  PNG with the long cache headers + ETag.
- **Themes live in `@chirag127/oriz-kit`** as JSX components keyed
  by `theme` (e.g. `midnight`, `sunset`, `candy`) and parameterised
  by `site` (palette / accent / logo glyph per family member).
  Adding a theme is a kit PR, not a Worker PR.
- **Per-post toggle in each site's frontmatter**: a `og: code`
  flag (or detection on whether the post body is mostly a code
  block) routes to ray.so; default is Satori.
- **`<meta property="og:image">` URLs are fully qualified**
  `https://api.oriz.in/og?...` for Satori, and the ray.so PNG URL
  for code posts. No site renders OG markup with a relative URL.
- **Edge caching**: the Worker sets `Cache-Control: public,
  max-age=31536000, immutable` and a parameter-hash ETag. Cold
  renders bill against the 100K/day Workers cap; warm renders are
  served by CF's edge cache.
- **No card, no account.** `@vercel/og` is npm only; the Worker
  runs on the family's existing CF account.
- **Cross-poster awareness**: [`oriz-omnipost`](../general/cross-post-engine.md)
  forwards the canonical `<meta property="og:image">` URL to each
  cross-post target — no per-platform OG override.

## Cross-refs

- [services/social/satori-og-cards.md](../../../services/social/satori-og-cards.md) — the service entry
- [services/social/ray-so.md](../../../services/social/ray-so.md) — code-post path
- [decisions/architecture/hono-worker-api-umbrella.md](../compute/hono-worker-api-umbrella.md) — the Worker the route lives on
- [decisions/architecture/cross-post-engine.md](../general/cross-post-engine.md) — omnipost forwards canonical OG URL
- [glossary/o-r/oriz-kit.md](../../../glossary/o-r/oriz-kit.md) — themes live in the kit
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
