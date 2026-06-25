---
type: runbook
title: Scaffold a new chirag127 site
description: Step-by-step to add a new Astro site to the family in <10 minutes. Clones
  starter, edits 4 config files, registers as workspace submodule, deploys to Cloudflare
  Pages.
tags:
- runbook
- scaffold
- astro
- site
- workspace
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/general/chrome-config-contract
- decisions/architecture/general/per-runtime-framework
- rules/development/astro-version-pin
---



# Scaffold a new chirag127 site

## When to use

You're adding a new entry to the chirag127 family — a new site, not a
tool, extension, or package. Examples: a new content site, a new
catalog, a new sub-product.

## Prerequisites

- Brand name decided (4-7 letter short word; see [decisions/branding/repo-naming-suffixes](../../decisions/branding/repo-naming-suffixes.md) for the suffix matrix)
- Subdomain decided (e.g. `<brand>.oriz.in`)
- Site role decided (longform / catalog / hub / tool — see [sidebar-4-tier](../../decisions/architecture/frontend/sidebar-4-tier.md))
- CF Pages token + CF account ID set as org-level GitHub secrets

## Steps

### 1. Create the GitHub repo

```bash
gh repo create chirag127/<brand>-site \
  --public \
  --description "<one-line description naming the tech: Astro 6 + React 19 islands + Tailwind v4. Lives at <subdomain>.oriz.in. Free, no card-on-file.>" \
  --homepage "https://<subdomain>.oriz.in"
```

### 2. Add as submodule to the workspace umbrella

```bash
cd C:/D/oriz
git submodule add --name "projects_websites_<brand>-site" \
  --force \
  "https://github.com/chirag127/<brand>-site.git" \
  "repos/websites/<brand>-site"
```

### 3. Clone the starter template

```bash
cd repos/websites/<brand>-site
git clone --depth=1 https://github.com/chirag127/me-site.git starter
cp -r starter/{astro.config.ts,tsconfig.json,biome.json,package.json,.gitignore,src,.github} .
rm -rf starter
```

### 4. Edit the 4 config files

```bash
# src/config/site.ts
export const site = {
  siteName: "<brand>-site",
  siteRole: "<one-line role>",
  subdomain: "<subdomain>.oriz.in",
  brand: { wordmark: "<brand>-site" },        // shows in Stamp signature
  jurisdiction: ["GDPR", "CCPA", "DPDP"],     // applicable jurisdictions
};

# src/config/nav.ts
export const nav = {
  headerActions: ["search", "auth"],
};

# src/config/sidebar.ts
export const sidebarTree = [
  { type: "section", label: "SECTION-A", children: [
    { type: "group", label: "Group 1", href: "/group-1/", children: [
      { type: "leaf", label: "Page", href: "/group-1/page" },
    ]},
  ]},
];

# src/config/footer.ts
export const footer = {
  columns: [
    { label: "Pages", links: [/* this site's pages */] },
    { label: "Family", links: [/* dynamically pulled from chirag127/family.ts */] },
  ],
};
```

### 5. Update package.json

```jsonc
{
  "name": "<brand>-site",
  "private": true,
  "type": "module",
  "dependencies": {
    "astro": "^6.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@chirag127/astro-shell": "workspace:*",
    "@chirag127/astro-chrome": "workspace:*",
    "@chirag127/astro-pwa": "workspace:*",
    "@chirag127/astro-distribute": "workspace:*"
  }
}
```

Typical `astro.config.ts` after the starter is copied:

```ts
import { defineConfig } from 'astro/config'
import { shell } from '@chirag127/astro-shell'
import { pwa } from '@chirag127/astro-pwa'

export default defineConfig(shell({
  site: 'https://<subdomain>.oriz.in',
  integrations: [pwa({ name: '<brand>' })],
}))
// ponytail: site config in ~4 lines. Per-app overrides only when shell can't cover it.
```

### 6. Install + dev

```bash
cd C:/D/oriz
pnpm install               # hoists shared deps across workspace
cd repos/websites/<brand>-site
pnpm dev                   # http://localhost:4321
```

### 7. Wire CI

The `.github/workflows/deploy.yml` from the starter uses
`uses: chirag127/astro-shell/.github/workflows/deploy.yml@main`.
Edit `project-name:` in the workflow to match `<brand>-site`.

### 8. Wire DNS

```bash
# CNAME <subdomain>.oriz.in → <brand>-site.pages.dev
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"type":"CNAME","name":"<subdomain>","content":"<brand>-site.pages.dev","proxied":true}'
```

### 9. Create CF Pages project

```bash
wrangler pages project create <brand>-site \
  --production-branch main \
  --compatibility-date 2026-06-21
```

### 10. Push

```bash
cd repos/websites/<brand>-site
git -c user.name="Chirag Singhal" -c user.email=chirag@oriz.in add .
git -c user.name="Chirag Singhal" -c user.email=chirag@oriz.in \
  commit -m "feat: initial scaffold via @chirag127/astro-shell + astro-chrome"
git push -u origin main
```

Then in the workspace umbrella:

```bash
cd C:/D/oriz
git add .gitmodules repos/websites/<brand>-site
git commit -m "feat: add <brand>-site as submodule"
git push origin main
```

## Verify

- `<subdomain>.oriz.in` resolves to the new site within 60 seconds
- GitHub Actions deployed without error
- Chrome (Header + Sidebar + BottomBar + Footer) shows the configured `<brand>-site` wordmark in the Stamp
- All 24 legal pages render at `/<brand>-site/privacy`, `/terms`, `/cookies`, etc.

## Time budget

- Repo + submodule: 2 min
- Edit 4 configs: 3 min
- Dev + visual check: 3 min
- DNS + CF Pages + push: 2 min

Total: **~10 minutes per new site.**

## Building distributables

To emit APK + EXE/dmg/AppImage alongside the PWA build, see
[build-distributable.md](./build-distributable.md). The starter ships
the workflow stub; signing keys come from org-level secrets.
