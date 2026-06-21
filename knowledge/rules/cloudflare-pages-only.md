---
name: cloudflare-pages-only
description: "Every website and every app in the chirag127/oriz family hosts on Cloudflare Pages free. No exceptions. GitHub Pages is the per-site survival mirror only; Firebase Hosting / Vercel / Netlify / Render / Fly all rejected."
tags: [hosting, cloudflare, non-negotiable]
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
  - decisions/infrastructure/cloudflare-pages-for-all-sites
  - rules/no-card-on-file
  - rules/never-hit-quotas
---

# Cloudflare Pages only — every website and every app

## The rule

Every website and every app in the family hosts on Cloudflare Pages. One host, no exceptions:

- Content sites (`projects/apps/content/*`)
- Tool apps (`projects/apps/tools/*`)
- Hub apps (`projects/apps/hub/*`)
- Personal apps (`projects/apps/personal/*`)
- Extensions catalog + every per-extension subdomain
- Any future site or app added to the family

GitHub Pages is the per-site survival mirror per [github-pages-mirror-per-site](../decisions/infrastructure/github-pages-mirror-per-site.md) — never primary. Firebase Hosting, Vercel, Netlify, Render, Fly, Surge, Pages-as-primary are all rejected.

## How to apply

- New site / app scaffold: `wrangler.toml` with `name = "<slug>"`, `compatibility_date`, `[assets] directory = "./dist"`.
- Deploy: `pnpm wrangler pages deploy dist` (or via the master matrix workflow).
- DNS: `*.oriz.in` subdomain → CNAME → `<slug>.pages.dev`, proxied through Cloudflare DNS free.
- If a new app needs server logic, it goes to `apps/api/` (the Hono Worker umbrella) — never to a second hosting provider.

## Why

One host = one quota model to track, one set of build/deploy logs, one DNS pattern, one secrets surface. Splitting hosts multiplies operational cost without any benefit Cloudflare Pages free doesn't already cover (unlimited bandwidth, 500 builds/mo, 100 projects/account, fails closed at quota, no card on file).

## Cross-refs

- The decision file → [decisions/infrastructure/cloudflare-pages-for-all-sites.md](../decisions/infrastructure/cloudflare-pages-for-all-sites.md)
- The free-tier discipline this supports → [no-card-on-file.md](./no-card-on-file.md) + [never-hit-quotas.md](./never-hit-quotas.md)
- The survival mirror → [decisions/infrastructure/github-pages-mirror-per-site.md](../decisions/infrastructure/github-pages-mirror-per-site.md)
