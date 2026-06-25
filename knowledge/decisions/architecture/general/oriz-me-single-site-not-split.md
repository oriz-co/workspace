---
type: decision
title: "oriz-me-site stays a single site with sections \u2014 not split into now/uses/gear/cv\
  \ subdomains"
description: me.oriz.in stays one Astro site with internal URL sections (/now, /uses,
  /gear, /reading, /coding, /lifestream, /cv, /contact). Not split into now.oriz.in,
  uses.oriz.in, gear.oriz.in, etc.
tags:
- oriz-me
- branding
- architecture
- single-site
- sections
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- decisions/architecture/database/lifestream-jsonl-canonical
- decisions/architecture/general/lifestream-auto-event-sources
- decisions/architecture/general/lifestream-federation
- decisions/branding/oriz-me-added-to-family
- decisions/architecture/general/auto-tracking-everywhere
- rules/interaction/auto-only-tracking
---



# oriz-me-site stays a single site with sections — not split into now/uses/gear/cv subdomains

> **2026-06-21 — home/me role split sharpened (Q60-Q63).** This decision
> still stands: `me.oriz.in` remains a single site with internal
> sections. What changed in the second grill pass is the boundary with
> `home.oriz.in` / `oriz.in`:
>
> - **Q60.** `home-app` leads with personal bio FIRST + apps/tools grid
>   second. Overrides the older 12-section portfolio expansion.
> - **Q62.** Two sites, role split locked: `home` = brand + bio + grid;
>   `me` = lifelog (now / uses / gear / reading / coding / lifestream /
>   cv / contact, per the sections below).
> - **Q63.** Home hero carries an explicit "See my full work" CV button
>   linking to `me.oriz.in/cv`. The CV stays at `/cv` on `me` — Q63
>   just adds the cross-site entry point.
>
> Net effect: short bio + apps grid at apex, long-form lifelog + CV at
> `me`. No subdomain split on the `me` side; the apex side now leads
> with bio. See [multi-target-build § Q47-Q77 additions](../ops/multi-target-build.md#q47-q77-additions-2026-06-21-grill-round-2).

## Decision

`oriz-me-site` stays a single Astro site at `me.oriz.in` with multiple
URL sections (`/now`, `/uses`, `/gear`, `/reading`, `/coding`,
`/lifestream`, `/cv`, `/contact`). NOT split into `now.oriz.in`,
`uses.oriz.in`, `gear.oriz.in`, `resume.oriz.in`, `cv.oriz.in`, or any
other per-section subdomain.

## Why

1. **Personal-brand sites are facets of one person, not separate
   products.** Recruiters / visitors / collaborators want one page that
   answers "who is this person?", not 6 subdomains to navigate.
2. **Reference set agrees.** brianlovin.com, leerob.io, mxstbr.com,
   wesbos.com, kentcdodds.com, swyx.io — every well-known dev personal
   brand is a single-domain site with internal sections. None split
   into per-section subdomains.
3. **Locked architecture already assumes one store.** The lifestream
   JSONL canonical file (per [`lifestream-jsonl-canonical`](../database/lifestream-jsonl-canonical.md))
   is one file, sharded by year, in one repo. Splitting `me` into N
   sites would force either duplicated consent / analytics / Sentry
   setup × N or fragmented JSONL across N data repos — both fight the
   single-source posture.
4. **Single domain accumulates SEO equity faster.** Splitting dilutes
   it across N subdomains; backlinks to `me.oriz.in/uses` build
   `me.oriz.in`'s authority, backlinks to `uses.oriz.in` don't.
5. **Maintenance cost.** Each `-site` repo multiplies CI runs, env-key
   provisioning, deploy hooks, design-token sync, dependency upgrades,
   `.env.example` syncs (per [`env-and-secrets-single-source`](../../security/env-and-secrets-single-source.md)).
   [Auto-only-tracking](../../../rules/interaction/auto-only-tracking.md) +
   [lifestream JSONL](../database/lifestream-jsonl-canonical.md) drive most
   content auto-magically; splitting buys nothing and costs ~5x.
6. **Alphabet analogy does NOT apply.** Alphabet lists subsidiaries on
   abc.xyz because each is a separate company with its own P&L. `now` /
   `uses` / `gear` / `bio` / `cv` are facets of one person, not
   separate products. The right analogue is brianlovin.com (sections),
   not abc.xyz (subsidiaries).

## Implications

- Site URL plan locked:
  - `/` — Bio + photo + latest 5 lifestream events
  - `/now` — current month's focus (the [nownownow.com](https://nownownow.com) convention)
  - `/uses` — hardware, software, dotfiles (the [uses.tech](https://uses.tech) convention)
  - `/gear` — camera / desk / keyboard photos
  - `/reading` — currently reading + recent finishes (auto-fed from `oriz-books-site`)
  - `/coding` — Wakatime weekly summary (auto, per [`auto-tracking-everywhere`](./auto-tracking-everywhere.md))
  - `/lifestream` — full JSONL feed, paginated, filterable by event kind
  - `/cv` — CV / resume
  - `/contact` — email, GitHub, Bluesky, etc.
- All under one Astro project, one `me.oriz.in` domain, one design
  language, one analytics setup, one deploy.
- Resume / CV intentionally lives at `me.oriz.in/cv` not
  `resume.oriz.in` (decision: don't add `oriz-resume-site`).
- `/uses`, `/now`, `/gear` intentionally live at `me.oriz.in/*` not
  `uses.oriz.in` etc. (decision: don't add `oriz-uses-site`,
  `oriz-now-site`, `oriz-gear-site`).
- Subdomains stay reserved for separate **products** in the family
  (`blog.oriz.in`, `books.oriz.in`, `finance.oriz.in`, `home.oriz.in`,
  etc. per [`subdomains-under-oriz-in`](../../infrastructure/subdomains-under-oriz-in.md)),
  not for facets of one person.

## What we don't do

- DO NOT create separate `-site` repos for `/now`, `/uses`, `/gear`,
  `/resume`, `/cv`. Each is a route in `oriz-me-site`.
- DO NOT split the lifestream JSONL across multiple sites — one site,
  one canonical store, per [`lifestream-jsonl-canonical`](../database/lifestream-jsonl-canonical.md).
- DO NOT add subdomain-per-section under `me.oriz.in`. Subdomains stay
  reserved for separate products in the family
  (`oriz-blog-site` → `blog.oriz.in`, `oriz-books-site` → `books.oriz.in`,
  etc.).

## Cross-refs

- [Lifestream JSONL canonical](../database/lifestream-jsonl-canonical.md) — single canonical store across the site
- [Lifestream auto event sources](./lifestream-auto-event-sources.md) — 3 auto-event streams feed `me.oriz.in`
- [Lifestream federation](./lifestream-federation.md) — `me.oriz.in` mirrors to AT Protocol + ActivityPub
- [oriz-me added to family](../../branding/oriz-me-added-to-family.md) — original `me.oriz.in` lock
- [Auto-tracking everywhere](./auto-tracking-everywhere.md) — auto-only-tracking principle
- [`rules/auto-only-tracking`](../../../rules/interaction/auto-only-tracking.md)
- [Subdomains under oriz.in](../../infrastructure/subdomains-under-oriz-in.md) — subdomain-per-product convention
