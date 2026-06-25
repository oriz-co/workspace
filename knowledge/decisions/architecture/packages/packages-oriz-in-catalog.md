---
type: decision
title: "Dual-location package surfacing \u2014 oriz.in overview + packages.oriz.in\
  \ catalog"
description: 'Packages are surfaced in TWO places: (1) oriz.in renders an /apps +
  /packages + /mobile + /desktop + /extensions overview with cards per app + store/channel
  badges (Play Store, Microsoft Store, Chrome Web Store, etc.) with ''Coming soon''
  for unreleased channels; (2) packages.oriz.in is a standalone Astro Starlight catalog
  that auto-discovers every chirag127/*-npm-pkg repo and renders the full README +
  npm/GH/bundlephobia metadata per package. Channels metadata lives in home-app/src/data/apps.ts
  (manual) + auto-discovery from GitHub Releases for native installer URLs.'
tags:
- decision
- docs
- catalog
- packages
- astro-starlight
- hub
- dual-location
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- architecture/packages/the-23-packages
- decisions/architecture/general/mit-license-all-repos
- decisions/architecture/frontend/pwabuilder-as-primary-converter
- rules/infrastructure/cloudflare-pages-only
- rules/interaction/linux-ci-only
---



# Dual-location package surfacing

## Decision

Packages and apps are surfaced to users in **TWO complementary locations**:

### Location 1 — `oriz.in` (home-app)

Marketing-flavoured overview. 5 new section routes added to `home-app`:

| Route | Content |
|---|---|
| `oriz.in/apps` | All 26 apps as cards (per category: hub / personal / content / tools). Each card: brand wordmark + 1-line purpose + subdomain link + 'View packages on packages.oriz.in/<name>' cross-link |
| `oriz.in/packages` | All 17 npm packages grouped by purpose (5 groups). Each card: name + 1-liner + 'Full docs → packages.oriz.in/<name>' button. Catalog-light. |
| `oriz.in/mobile` | Per-app rows showing Play Store + sideload-APK channel buttons. 'Coming soon — Android via PWABuilder' badge for unreleased apps. |
| `oriz.in/desktop` | Per-app rows showing Microsoft Store + direct-download MSIX/dmg/AppImage channel buttons. 'Coming soon' badges for unreleased channels. |
| `oriz.in/extensions` | Chrome Web Store + Firefox Add-ons + Edge Add-ons + VS Code Marketplace + Open VSX channel buttons per extension repo. |

### Location 2 — `packages.oriz.in` (standalone Astro Starlight)

Developer-facing technical catalog at a separate subdomain. Auto-discovers every `chirag127/*-npm-pkg` repo on GitHub. Per-package detail page embeds the live README + npm/GitHub/bundlephobia metadata. 5-group sidebar (Astro foundation / UI & widgets / Data & auth / Distribution / Testing). Standalone CF Pages project, separate submodule.

## Why this split

- **oriz.in** is for **users discovering products** (cards, brand wordmarks, store badges). Should look like a product portfolio.
- **packages.oriz.in** is for **developers consuming packages** (READMEs, version + downloads + bundle size, install command). Should look like a docs site.

Conflating the two would force one design to do both badly. Splitting respects the audience.

## Channels metadata

Single `home-app/src/data/apps.ts` TypeScript constant maintains the manual portion of per-app channel URLs (subdomain, store IDs, etc). Build-time auto-discovery from GitHub Releases API populates the dynamic portion (latest MSIX / APK / dmg / AppImage asset URLs).

`AppMeta` shape includes a `channels: Partial<Record<Channel, string>>` map. When a channel is undefined OR an empty string, the card shows a "Coming soon — via PWABuilder" badge instead of an active link.

## Realistic "publishable" channels

Not all stores can be fully automated. The realistic publish-status by channel:

| Channel | First publish | Subsequent updates |
|---|---|---|
| GitHub Releases | ✅ Auto | ✅ Auto |
| npm | ✅ Auto | ✅ Auto |
| Chrome Web Store | ⚠️ Manual listing form (1-3 day review) | ✅ Auto via `chrome-webstore-upload-cli` |
| Firefox Add-ons | ⚠️ Manual listing | ✅ Auto via `web-ext sign` |
| Microsoft Edge Add-ons | ⚠️ Manual | ✅ Auto via `edge-add-on-action` |
| VS Code Marketplace | ✅ Auto via `vsce publish` | ✅ Auto |
| Open VSX | ✅ Auto via `ovsx publish` | ✅ Auto |
| Google Play | ⚠️ Manual first review | ✅ Auto via `r0adkll/upload-google-play` |
| Microsoft Store (apps) | ❌ Manual; no reliable free API | ❌ Mostly manual |
| Mac App Store | ❌ Not in family scope (no Apple Dev Program per [[ios-pwa-only-no-mac]]) | n/a |
| F-Droid | ⚠️ Manual first listing | ✅ Auto via F-Droid build-bot once MIT + .fdroid.yml present |

So: every "Coming soon" channel on oriz.in will require some manual first-publish work even after we're MIT-licensed.

## What lives at master vs in each submodule

- **Master `knowledge/`** owns this decision file, the apps.ts shape spec, the channels enum.
- **`home-app` submodule** owns the runtime: `src/data/apps.ts`, `src/lib/discover-releases.ts`, the 5 new pages, the components (`AppCard.astro`, `ChannelBadge.astro`, `PackageCard.astro`).
- **`oriz-packages-catalog-app` submodule** owns the standalone catalog: Astro Starlight + `src/lib/discover-packages.ts` + the 5-group sidebar config.

## Rebuild triggers

Both sites rebuild on:

- **Daily cron** at 04:00 IST — picks up new package versions + new GitHub Releases
- **Push to master** of the respective submodule
- **`repository_dispatch`** type `package-published` — triggered from any chirag127/*-npm-pkg repo's `release.yml` after a new version publishes. Rebuilds both `oriz.in` AND `packages.oriz.in`.

## Why both, not just one

Tried earlier to do path-only under `oriz.in/packages` (no separate subdomain). The user revised: **want both**. Reason: the catalog is dense + technical (READMEs, metadata, search) — Starlight-friendly. The oriz.in overview is sparse + marketing-flavoured (cards, screenshots, store badges) — home-app's existing theme is the right wrapper. Different audiences, different design, two surfaces.

## Cross-refs

- The 18-package set both surfaces catalog → [[architecture/the-23-packages]]
- The MIT relicense that enables free-for-OSS perks both surfaces tout → [[decisions/architecture/mit-license-all-repos]]
- PWABuilder is the native-publish path the 'Coming soon' badges reference → [[decisions/architecture/pwabuilder-as-primary-converter]]
- iOS PWA-only context (no Mac App Store) → memory [[ios-pwa-only-no-mac]]
- The catalog's add-package workflow → [[runbooks/add-package-to-catalog]]
- The hosting lock → [[rules/cloudflare-pages-only]]
- The Linux-only CI rule → [[rules/linux-ci-only]]
