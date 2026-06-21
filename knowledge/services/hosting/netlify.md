---
type: service
title: "Netlify"
description: "Fallback static host — free starter tier."
tags: [hosting, netlify, fallback]
timestamp: 2026-06-20
format_version: okf-v0.1
status: fallback
role: static-hosting-fallback
provider: netlify
free_tier: "100 GB bandwidth/mo, 300 build minutes/mo, unlimited deploys (starter)"
swap_cost: low
related:
  - services/hosting/cloudflare-pages
  - services/hosting/github-pages
  - services/hosting/vercel
  - decisions/infrastructure/cloudflare-pages-for-all-sites
---

# Netlify

## Role

Documented fallback only — Cloudflare Pages is the primary host per
[cloudflare-pages-for-all-sites](../../decisions/infrastructure/cloudflare-pages-for-all-sites.md).
Netlify is reserved for the scenario where Cloudflare Pages, GitHub
Pages, and Vercel were all unavailable.

## Free tier

- 100 GB bandwidth / month
- 300 build minutes / month
- Unlimited deploys
- 1 concurrent build

## Card / subscription required?

**NO** for the starter plan. Netlify does not require a payment
method on file for starter.

## Alternatives

- [Cloudflare Pages](./cloudflare-pages.md), [GitHub Pages](./github-pages.md), [Vercel](./vercel.md)

## Swap cost

Low — `dist/` upload, `netlify.toml` for redirects.

## Why fallback only

Build minutes are tighter than Vercel and bandwidth is finite vs
Cloudflare's unlimited.

## Cross-refs

- [Cloudflare Pages](./cloudflare-pages.md) — primary
- [Vercel](./vercel.md)
- [Cloudflare Pages for all sites decision](../../decisions/infrastructure/cloudflare-pages-for-all-sites.md) — why Netlify stays fallback-only
