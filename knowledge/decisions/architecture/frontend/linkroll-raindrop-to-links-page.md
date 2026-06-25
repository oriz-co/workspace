---
type: decision
title: "Linkroll \u2014 Raindrop.io is source of truth, blog.oriz.in/links built at\
  \ deploy time"
description: The family's curated linkroll lives in a public Raindrop.io collection.
  blog.oriz.in/links is built at deploy time from the Raindrop REST API. Cached via
  the Cloudflare edge with a 1-hour TTL on the build artifact; nightly cron re-deploys
  to surface new links.
tags:
- linkroll
- raindrop
- blog
- build-time
- deploy
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/social/raindrop-io
- services/short-link/cloudflare-worker
- services/hosting/cloudflare-pages
- services/cron/github-actions-schedule
- rules/interaction/no-card-on-file
---



# Linkroll — Raindrop.io is source of truth, blog.oriz.in/links built at deploy time

## Decision

The family's "things I've been reading" linkroll lives at
`blog.oriz.in/links`. Its source of truth is a public collection on
[Raindrop.io](../../../services/social/raindrop-io.md).

The page is **statically built** at deploy time from a
`fetch()` against the Raindrop REST API. No Worker call per
pageview; no client-side hydration. The build artifact is served by
[Cloudflare Pages](../../../services/hosting/cloudflare-pages.md), with
the page cached at the edge per the family `_headers` preset (1-hour
`s-maxage` on `/links` HTML so the next-deploy bump propagates fast).

A nightly [GitHub Actions schedule](../../../services/cron/github-actions-schedule.md)
trigger re-deploys `oriz-blog-site` so additions made in Raindrop
during the day surface without a manual push.

For each linkroll item, the build also mints (or reuses) an
`s.oriz.in/<slug>` short URL via the
[Cloudflare Worker shortener](../../../services/short-link/cloudflare-worker.md) —
that's the URL `oriz-omnipost` cross-posts when sharing links to
aggregator platforms.

## Why

- **Build-time fetch costs zero per pageview.** Pageviews hit the
  CF edge cache, never the Raindrop API. Quota anxiety on the
  Raindrop side is bounded by the cron cadence (≤24 builds/day
  worst case).
- **Static `/links` is the shape we already use.** Same Astro build
  produces it as the rest of the blog. No new runtime, no new
  Worker, no new infra surface.
- **Raindrop is the family's existing bookmark capture flow.**
  Browser extensions work, mobile apps work, the user's day-to-day
  bookmarking already lands there. Building the linkroll on top of
  that flow rather than introducing a parallel system means there's
  one place to add a link.
- **Free, no card.** Per
  [`services/social/raindrop-io.md`](../../../services/social/raindrop-io.md).

## Implications

- `oriz-blog-site` reads `RAINDROP_TOKEN` from
  [Doppler](../../../services/secrets/doppler.md). The token authorises
  a single read-only collection scope.
- Build step calls
  `GET https://api.raindrop.io/rest/v1/raindrops/<collection-id>?perpage=200`
  and persists the result as JSON for the page render step.
- A nightly GH Actions cron in `oriz-blog-site` triggers a Cloudflare
  Pages deploy (`gh workflow run` on the existing CI workflow with a
  `force-rebuild` input) so additions made during the day land
  without a manual push.
- For each item, the build looks up an existing
  [`s.oriz.in/<slug>`](../../../services/short-link/cloudflare-worker.md)
  mapping or creates one if absent (idempotent on the Raindrop item
  ID). This is the URL `oriz-omnipost` cross-posts.
- A daily JSON export of the collection lands in
  `oriz-me-data/exports/raindrop-<date>.json` as a backup —
  Raindrop is canonical operationally but the family keeps a
  rebuilt-from-git snapshot in case of vendor disappearance.

## What we don't do

- **No client-side fetch.** Hides the API surface from public
  scraping and avoids token-handling on the browser side.
- **No per-pageview Worker proxy.** Would burn CF Workers quota for
  zero readability benefit; the cron-on-build cadence is enough.
- **No vendor lock-in.** Cleartext JSON export to `oriz-me-data`
  means the linkroll survives Raindrop disappearing on a week's
  notice.

## Cross-refs

- [Raindrop.io service entry](../../../services/social/raindrop-io.md)
- [s.oriz.in shortener](../../../services/short-link/cloudflare-worker.md)
- [URL-shortener quota mitigation decision](../general/url-shortener-quota-mitigation.md)
- [Cloudflare Pages](../../../services/hosting/cloudflare-pages.md)
- [GitHub Actions schedule](../../../services/cron/github-actions-schedule.md)
- [Cross-post engine — consumer of the s.oriz.in mints](../general/cross-post-engine.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
