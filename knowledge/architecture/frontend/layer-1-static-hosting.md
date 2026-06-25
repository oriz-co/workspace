---
type: architecture
title: "Layer 1 \u2014 static hosting on Cloudflare Pages"
description: Cloudflare Pages free is the primary host for all 11+ sites and the extensions
  catalog. Unlimited bandwidth, no card required, fails-closed at quota.
tags:
- architecture
- hosting
- cloudflare
- layer-1
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- architecture/frontend/layer-2-survival-fallback
- architecture/ops/repo-layout
- rules/interaction/no-card-on-file
- services/hosting/cloudflare-pages
---



# Layer 1 — static hosting on Cloudflare Pages

## Concept

Cloudflare Pages free is the foundation host for every public surface
in the family. All 11 sites plus the future extensions catalog deploy
to Pages. The choice is dictated by the unlimited-bandwidth + no-card
combination — no other free tier matches both.

## How it works

- One Pages project per site, named `oriz-<site>` (e.g. `oriz-home`)
- Each site ships a `wrangler.toml` with `compatibility_date` and
  `[assets] directory = "./dist"`
- Deploy command: `pnpm wrangler pages deploy dist`
- Custom domains map `*.oriz.in` subdomains to their Pages projects
- The matrix workflow at `chirag127/oriz/.github/workflows/deploy.yml`
  fans out the deploy across every site
- Free-tier numbers we live within:
  - Unlimited bandwidth + unlimited static-asset requests
  - 100 projects per account (we use ~12)
  - 100 custom domains per project
  - 500 builds/month (well under usage at normal cadence)

## Why this shape

Cloudflare Pages is the only free static host with truly unlimited
bandwidth AND no-card-required onboarding. GitHub Pages has bandwidth
caps; Vercel and Netlify free have bandwidth caps and edge-function
metering; Render and Surge limit project count. Pages also fails-closed
at quota with a clean HTTP 1027 — no surprise bill, no card to charge.

## Cross-refs

- Survival fallback when Pages dies → [layer-2-survival-fallback.md](./layer-2-survival-fallback.md)
- The reason this choice is locked → [`../rules/no-card-on-file.md`](../../rules/interaction/no-card-on-file.md)
- Where each site lives → [repo-layout.md](../ops/repo-layout.md)
