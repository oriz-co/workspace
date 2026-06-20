---
type: decision
title: "Family stack lock — Astro 6 + React 19 islands + Tailwind v4 + pnpm + Biome"
description: "Same stack on every site (longform / catalog / hub / tool). Static output. CF Pages for monetised sites; GH Pages for info-only sites where the product is monetised elsewhere."
tags: [architecture, stack, hosting, astro, tailwind]
timestamp: 2026-06-20
related: [tools-site-15-repos, packages-14-atomic, sidebar-4-tier]
---

# Family stack lock

## Stack

| Layer | Pick | Why |
|---|---|---|
| Framework | **Astro 6** (`output: 'static'`) | Zero JS by default, islands only where needed, fast builds, ecosystem mature |
| UI islands | **React 19** | Largest lib ecosystem (FFmpeg.wasm wrappers, PDF.js, react-pdf, OCR.js, etc.) |
| Styling | **Tailwind v4** | Already-locked across family, dark theme tokens in `@chirag127/theme` |
| Package mgr | **pnpm 10** | Family-wide, content-addressable global store |
| Linter | **Biome 2** | One tool replaces eslint + prettier, faster CI |
| TS | **TypeScript 5.7+** | Strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |

No Next.js, no SvelteKit, no Vue family-wide for new repos. Existing
React-only Vite repos (extensions) keep their stack.

## Hosting split

Driven by the user's monetisation rule: **the host where the money is
made deserves the better SLA + bandwidth**.

| Site type | Primary host | Why |
|---|---|---|
| **Tool sites** (15) — pdf, image, finance, dev, text, convert, qr, data, audio, video, seo, crypto, health, random, print | Cloudflare Pages **only** | On-page monetisation (AdSense, affiliate). Need unlimited bandwidth + lowest TTFB. NO GH Pages mirror — divided traffic dilutes ad RPM. |
| **Catalog sites** — books, ncert, cards | Cloudflare Pages | On-page affiliate / ad monetisation. CF only. |
| **Longform sites** — blog, journal, me | Cloudflare Pages | On-page ads / affiliate. CF only. |
| **Hub site** — oriz-site (apex) | Cloudflare Pages | Front door of the brand. CF only. |
| **Info / legal sites** for products monetised elsewhere — extension landing pages, package landing pages, status, archived 301-redirect sites | GitHub Pages | Free 100GB/mo bandwidth is plenty for traffic that's already converted; no ads on the page; cheaper to run. |

## Cost ceiling

CF Pages free tier (per project, no card):
- Unlimited static requests + bandwidth
- 500 builds / month
- 100 custom domains
- 25MB / file, 20K files / deployment
- 1 concurrent build (org-wide)

GH Pages free tier (per repo):
- 100GB / month soft bandwidth cap
- 1GB repo size, 10 builds / hour
- Public repos only

Per `rules/never-hit-a-free-tier-quota.md`: builds budget allows 500/30 ≈
16 deploys per project per day. Over 15 tool sites that's 240 deploys/day
ceiling — more than enough since deploys are gated by main-branch pushes.

## Tooling per site

Every Astro site ships:
- `astro.config.mjs` with `output: 'static'`, sitemap integration, MDX
- `tailwind.config` extends `@chirag127/theme`
- `biome.json` extends shared family config
- `tsconfig.json` extends shared family config
- `.env.example` synced from master per `rules/env-example-synced-from-master.md`
- CI: typecheck + lint + build per `runbooks/apply-per-site-ci.md`

(Decided 2026-06-20.)
