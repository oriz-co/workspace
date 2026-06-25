---
type: decision
title: 'Dynamic family-data registry: @chirag127/astro-shell/family-data + auto-discovery
  cron'
description: 'User mandate 2026-06-22 evening (final): family inventory changes constantly;
  every app must read from a SINGLE dynamic registry instead of hardcoding the list.
  Registry lives in `@chirag127/astro-shell/family-data.ts` (TS module). A daily GH
  Action scans `chirag127/*` repos via the GH API, classifies each by slug suffix
  (-app / -npm-pkg / -api / -book / -ext / etc.), regenerates family-data.ts, commits
  + bumps astro-shell version, triggers Renovate auto-PR across all consuming apps.
  Zero manual edit. Surfaces consuming this registry: footer Family column / sidebar
  ''other apps'' / home-app index pages / packages-catalog auto-discovery / API hub
  aggregator at data.oriz.in.'
tags:
- decision
- family-data
- registry
- dynamic
- auto-discovery
- single-source
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- decisions/architecture/frontend/final-per-app-visual-shared-behavior
- decisions/architecture/frontend/footer-5-columns-responsive
- decisions/architecture/content/stats-feeds-versioning-template
- rules/interaction/never-hit-quotas
---



# Dynamic family-data registry

## Decision

`@chirag127/astro-shell/family-data.ts` is the **single dynamic registry** for every entity in the chirag127/oriz family. Apps import + render from this module; never hardcode the list.

Entity types tracked:

- `FAMILY_APPS` — every `*-app` (with category: hub / personal / content / tools)
- `FAMILY_PACKAGES` — every `*-npm-pkg` (with category: astro-* / auth-* / oriz-*)
- `FAMILY_APIS` — every `*-api` (with subdomain + RapidAPI link + GH Pages URL)
- `FAMILY_BOOKS` — every `*-book` (with channels + prices)
- `FAMILY_EXTENSIONS` — every `*-ext` / `*-vsc-ext` / `*-mcp` / `*-cli`
- `FAMILY_SKILLS` — every `*-skill`

## Auto-discovery cron

`scripts/discover-family.mjs` (in astro-shell-npm-pkg repo OR master repo) runs on schedule:

1. GH Action workflow daily at 06:00 IST OR on `repository_dispatch` from any `chirag127/*` repo's create-trigger
2. Calls `gh api 'users/chirag127/repos?per_page=100' --paginate` to enumerate all chirag127 repos
3. Classifies each repo by slug suffix:
   - `-app` → `FAMILY_APPS`
   - `-npm-pkg` → `FAMILY_PACKAGES`
   - `-api` → `FAMILY_APIS`
   - `-book` → `FAMILY_BOOKS`
   - `-ext` / `-vsc-ext` / `-mcp` → `FAMILY_EXTENSIONS`
   - `-skill` → `FAMILY_SKILLS`
   - `-cli` → `FAMILY_CLIS`
4. Extracts metadata from each repo's `package.json` (or README frontmatter): name, tagline, version, last-publish
5. Regenerates `family-data.ts` if diff vs current
6. If changed: bumps astro-shell minor version + commits + publishes to npm
7. Renovate Bot then opens a PR in every consuming app to bump astro-shell dep

## Surfaces consuming the registry

- **Every app's footer**: Family column links to other oriz apps (mini sitemap)
- **Every app's sidebar**: "Browse other oriz apps" link block (where sidebar applies)
- **home-app**: `/apps`, `/tools`, `/books`, `/packages`, `/extensions`, `/apis` index pages
- **packages-catalog-app**: auto-discovery (already wired; switches to read from this registry)
- **data.oriz.in aggregator**: lists all APIs (NEW app per `apis-hosting-triple-rail.md`)
- **stats.oriz.in** (planned): counts entities from this registry

## Future-proofing

When you create a new repo:

1. `gh repo create chirag127/<slug>-<suffix>` (already in the scaffolding scripts)
2. Discovery cron picks it up within 24h
3. astro-shell bumps + Renovate cascades dep updates
4. Every app's footer/sidebar/index pages show the new entity

ZERO manual edits to update the family list anywhere.

## Apply-everywhere principle

User mandate: "Apply this concept everywhere wherever many things are same across many apps and keep on changing."

Other dynamic registries that follow this same pattern:

- **Pricing tiers** → already shared via `@chirag127/astro-billing`
- **Auth providers** → shared via `@chirag127/auth-core` config
- **AI provider chain** → shared via `@chirag127/oriz-ai-providers` (with data-repo split)
- **Legal page content variables** → per-app props passed to per-app legal pages
- **AdSense client ID** → from env (PUBLIC_ADSENSE_CLIENT) — single env var
- **Substack newsletter URL** → from FAMILY_DATA newsletter field
- **GitHub Sponsors / Ko-fi URLs** → from FAMILY_DATA sponsor field

If a value changes frequently AND lives in multiple apps → it goes in family-data.ts (or its respective shared package).

## Cross-refs

- FINAL per-app visual policy → [[decisions/architecture/final-per-app-visual-shared-behavior]]
- Footer 5-column structure → [[decisions/architecture/footer-5-columns-responsive]]
- Stats + feeds + versioning + template → [[decisions/architecture/stats-feeds-versioning-template]]
- Never hit quotas → [[rules/never-hit-quotas]]
