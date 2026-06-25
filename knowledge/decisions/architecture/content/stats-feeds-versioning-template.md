---
type: decision
title: stats.oriz.in family-wide-stats dashboard + per-app feeds + Changesets + single
  oriz-app-template
description: "Single dashboard app `oriz-stats-app` at stats.oriz.in shows family-wide\
  \ aggregate metrics (visits, npm downloads, GitHub stars, books sold, Sentry errors).\
  \ RSS published from blog app only (not all 26 apps \u2014 too noisy). Package versioning\
  \ via Changesets per-package; auto-bump on merge. Single `chirag127/oriz-app-template`\
  \ repo used for every new app via `gh repo create --template`."
tags:
- decision
- stats
- feeds
- versioning
- template
- ops
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- decisions/architecture/ops/backup-everywhere-weekly
- decisions/architecture/stack/stack-picks-2026-06-22
- rules/infrastructure/no-paid-self-hosting-only
---



# Family ops: stats + feeds + versioning + template

## stats.oriz.in family-wide stats dashboard

New app `oriz-stats-app` at `c:/D/oriz/repos/oriz/own/prod/apps/content/oriz-stats-app/`. Publicly accessible at `stats.oriz.in`. Read-only.

**Data sources** (all polled by GH Action daily and committed to `public/stats.json`):
- npm registry API → download counts per package (17 packages)
- GitHub API → stars/forks/issues per repo (51 repos)
- Cloudflare Web Analytics API → visits per `*.oriz.in` subdomain
- Substack RSS → newsletter subscriber count
- Gumroad/Leanpub/KDP CSV exports → book sales (manual upload weekly)
- Sentry API → error counts per project (51)
- UptimeRobot API → uptime % per monitor
- Backup status (from `oriz-backup-status-app`)

**Renders** via Apache ECharts + shadcn cards. Single index page. Mobile-responsive.

## RSS feeds scope

**v0: blog only.** RSS 2.0 + Atom 1.0 + JSON Feed 1.1 at `blog.oriz.in/feed.{xml,atom,json}`.

**Deferred to v1+:**
- All content apps (lore/ncert/janaushdhi/tabs/journal) — `+content` feed per app
- Tools changelog feeds (when version bumps via GH releases)
- Packages catalog feed (when new package published)

Reason for v0 narrow scope: blog is the only frequently-updated content surface. Other apps update content slowly; RSS becomes noise.

## Package versioning: Changesets

Every npm package uses **Changesets** (`@changesets/cli`).
- Conventional commit messages drive bump type: `feat` → minor, `fix` → patch, breaking → major
- PR opens a "Release PR" tracking pending bumps
- On merge: auto-publish to npm + tag GH release + cross-post via omni-publish to @oriz_announcements

**Per package, in `.github/workflows/release.yml`:**
```yaml
on:
  push:
    branches: [main]
jobs:
  release:
    uses: changesets/action@v1
    with:
      publish: pnpm publish
    env:
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Already in `astro-test-utils@0.1.1`; roll out to all 18 packages.

## Single oriz-app-template

New repo `chirag127/oriz-app-template`. Every new app scaffolds via:

```bash
gh repo create chirag127/<new-app-slug> --template chirag127/oriz-app-template --public --description "..."
```

Template ships with:
- Astro 6 + React 19 + Tailwind v4 + TypeScript strict
- `@chirag127/astro-shell` + `astro-chrome` + `astro-data` + `astro-pwa` + `astro-tools` (where applicable)
- `src/components/Header.astro` + `Wordmark.astro` (per-app starting points)
- `src/components/AppSidebarContent.astro` (sidebar slot starter)
- `src/data/bottombar-actions.ts` (BottomBar starter)
- `src/layouts/BaseLayout.astro` (wires all 4 nav surfaces)
- `.github/workflows/{ci,deploy,release}.yml`
- `wrangler.toml` (CF Pages config)
- `package.json` pre-configured for the family
- `.env.example` synced from master `templates/.env.example`
- `LICENSE` MIT
- `README.md` ~30-line shell with TODOs

After scaffolding, the developer fills in app-specific:
- Header design
- Sidebar nav tree
- BottomBar actions
- Pages + content

## Family-data SSoT (footer + sidebar shared data)

In `@chirag127/astro-shell/family-data` export:
```ts
export const FAMILY_APPS = [...26 entries...]
export const FAMILY_BOOKS = [...5 entries...]
export const FAMILY_PACKAGES = [...18 entries...]
export const FAMILY_APIS = [...2 entries...]
```

Update on each new app/book/package. Astro-shell version bump triggers all apps to rebuild on next deploy and pick up the new entry. Single SSoT for mega-sitemap footer.

## Cross-refs

- Backup everywhere → [[decisions/architecture/backup-everywhere-weekly]]
- Stack picks → [[decisions/architecture/stack-picks-2026-06-22]]
- No PAID self-hosting (free is fine) → [[rules/no-paid-self-hosting-only]]
