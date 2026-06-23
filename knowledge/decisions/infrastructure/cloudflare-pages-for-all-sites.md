---
type: decision
title: "Cloudflare Pages hosts every website and app; no other host"
description: "Every website and every app in the family — content sites, tool apps, hub apps, personal apps, the extensions catalog — deploys to Cloudflare Pages free. No exceptions. Firebase Hosting, Vercel, Netlify, GitHub Pages-as-primary all rejected. GitHub Pages stays only as the per-site survival mirror."
tags: [hosting, cloudflare, firebase, pages]
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
  - decisions/infrastructure/firebase-spark-forever
  - decisions/monetisation/no-subscriptions-anywhere
  - decisions/infrastructure/github-pages-mirror-per-site
  - services/hosting/cloudflare-pages
  - architecture/layer-1-static-hosting
---

# Cloudflare Pages hosts every website and app; no other host

## Decision

Every website and every app in the family deploys to Cloudflare Pages free. No exceptions. This covers content sites (`projects/oriz/own/prod/apps/content/*`), tool apps (`projects/oriz/own/prod/apps/tools/*`), hub apps (`projects/oriz/own/prod/apps/hub/*`), personal apps (`projects/oriz/own/prod/apps/personal/*`), the extensions catalog, and every per-extension subdomain. Firebase Hosting, Vercel, Netlify, Render, Fly, and GitHub Pages-as-primary are all REJECTED. GitHub Pages remains only as the per-site survival mirror per [github-pages-mirror-per-site](./github-pages-mirror-per-site.md).

## Why

Cloudflare Pages free has unlimited bandwidth, unlimited
static-asset requests, 100 projects/account (soft cap), 100 custom
domains/project, 500 builds/month — well above the family's needs
indefinitely. It fails closed with HTTP 1027 at quota, no card
required ever. Firebase Hosting offered no advantage over this and
came tied to the same Firebase project we're keeping on Spark —
running both was needless surface area.

## Implications

- Every site gets a `wrangler.toml` with `name = "oriz-<site>"`, `compatibility_date`, and `[assets] directory = "./dist"`.
- Deploy command: `pnpm wrangler pages deploy dist`.
- Master matrix workflow at `chirag127/oriz/.github/workflows/deploy.yml` runs deploys (one job per site) on master pointer-bump commits.
- Each site also builds a static GitHub Pages mirror per [github-pages-mirror-per-site](./github-pages-mirror-per-site.md) for survival fallback.
- Firebase project usage is now exclusively Auth + Firestore + App Check + (future) Storage — never Hosting.
- DNS: `*.oriz.in` subdomains resolve to Cloudflare Pages projects via Cloudflare DNS free.

## Cross-refs

- [Firebase Spark forever](./firebase-spark-forever.md)
- [No subscriptions anywhere](../monetisation/no-subscriptions-anywhere.md)
- [GitHub Pages mirror per site](./github-pages-mirror-per-site.md)
- [Cloudflare Pages service entry](../../services/hosting/cloudflare-pages.md)
- [Layer 1 — Static hosting architecture](../../architecture/layer-1-static-hosting.md)
