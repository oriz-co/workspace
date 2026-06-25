---
type: runbook
title: Add a new chirag127/*-npm-pkg repo to packages.oriz.in catalog
description: "Auto-discovery means there's almost nothing to do \u2014 publish the\
  \ new -npm-pkg repo on GitHub and it appears in the catalog within 24h. This runbook\
  \ documents the FEW manual steps required for tight integration (on-tag rebuild\
  \ trigger + group keyword) so the new package shows up in the right sidebar group\
  \ immediately."
tags:
- runbook
- catalog
- packages
- oss
- automation
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/packages/packages-oriz-in-catalog
- architecture/packages/the-23-packages
---



# Add a new chirag127/*-npm-pkg repo to packages.oriz.in catalog

## When to run

You just created a new chirag127/*-npm-pkg GitHub repo (or relocated an existing repo to follow the `-npm-pkg` suffix convention) and want it to show up in `packages.oriz.in`.

## The short version (auto-discovery handles 95%)

After the standard scaffold:

- Repo MUST be **public** on GitHub
- Repo name MUST end with `-npm-pkg`
- Repo MUST NOT be archived
- Package MUST be published on npm under `@chirag127/<short-name>` (matching the repo prefix)
- `LICENSE` MUST be valid (MIT per [[decisions/architecture/mit-license-all-repos]])

**That's it.** The catalog's daily cron (04:00 IST) auto-discovers via GitHub API and rebuilds. Within 24h, the new package appears on `packages.oriz.in` in the appropriate sidebar group.

## Speeding it up (immediate appearance)

Add this step to the new package's `.github/workflows/release.yml`:

```yaml
- name: Trigger catalog rebuild
  if: github.event_name == 'release'
  run: |
    curl -X POST \
      -H "Authorization: token ${{ secrets.GITHUB_PAT_REPO_DISPATCH }}" \
      -H "Accept: application/vnd.github+json" \
      https://api.github.com/repos/chirag127/oriz-packages-catalog-app/dispatches \
      -d '{"event_type":"package-published","client_payload":{"package":"${{ github.repository }}","version":"${{ github.event.release.tag_name }}"}}'
```

This dispatches `package-published` to the catalog repo. Catalog's `rebuild-on-tag.yml` workflow picks it up immediately and triggers a fresh build (~30s on CF Pages). The new package is live on `packages.oriz.in` within 1 minute.

The `GITHUB_PAT_REPO_DISPATCH` secret is a fine-grained GitHub PAT with `actions:write` scope on `chirag127/oriz-packages-catalog-app` — set at chirag127 org level so it auto-applies to every repo.

## Sidebar group assignment

The new package falls into a sidebar group based on its slug. Group keywords are in [`src/lib/groups.ts`](https://github.com/chirag127/oriz-packages-catalog-app/blob/main/src/lib/groups.ts) of the catalog repo:

| Prefix / keyword | Group |
|---|---|
| `astro-shell` / `astro-chrome` / `astro-config` / `astro-content` | Astro foundation |
| `auth-*` / `astro-data` / `astro-billing` | Data & auth |
| `astro-distribute` / `omni-*` | Distribution |
| `astro-test-utils` / `astro-ai` | Testing |
| Everything else `astro-*` | UI & widgets (default bucket) |

If your new package needs a custom group or a different bucket assignment, PR the keyword map in `src/lib/groups.ts` of the catalog repo.

## What renders on the new package's catalog page

After auto-discovery, the catalog page at `packages.oriz.in/packages/<short-name>` shows:

1. **Hero**: name + 1-line purpose (extracted from package.json `description`) + 5 badges (npm version + weekly downloads + bundle size + license + GH stars)
2. **Install**: `pnpm add @chirag127/<short-name>`
3. **Body**: the full README from `raw.githubusercontent.com/chirag127/<repo>/main/README.md`
4. **Sister packages**: links to the other packages in the same group
5. **Metadata footer**: last-publish date · contributors · open issues · last-commit · dependency count
6. **Footer**: GitHub · npm · Sponsor

The README is THE content. Iterate on the README to iterate on the catalog page.

## Manual override

If you need a curated page that's NOT the README (e.g., a deeper guide), add a `docs/catalog-override.md` in the package's repo. The catalog's discovery script checks for that file and uses it INSTEAD of the README. Same metadata footer + badges still apply.

## Removing a package from the catalog

Three options, in increasing order of effort:

1. **Archive** the repo on GitHub. Catalog skips archived repos.
2. **Rename** the repo away from the `-npm-pkg` suffix. Catalog skips.
3. **Make the repo private**. Catalog skips. (Don't use this for OSS family repos.)

If a published-on-npm package is unpublished, the catalog page renders with stale npm data until the next discovery run.

## Cross-refs

- The catalog decision → [[decisions/architecture/packages-oriz-in-catalog]]
- The 17-package family list → [[architecture/the-23-packages]]
- The catalog repo → [`chirag127/oriz-packages-catalog-app`](https://github.com/chirag127/oriz-packages-catalog-app)
