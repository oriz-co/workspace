---
type: runbook
title: Add a new Chrome / Firefox / Edge extension
description: Add a new extension repo as a submodule under extensions/, set up the
  cross-store publish workflow (Chrome Web Store + Firefox Add-ons + Edge Add-ons),
  wire its landing-page slot on extensions.oriz.in, and bump the master pointer.
tags:
- runbook
- extension
- submodule
- chrome
- firefox
- edge
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- runbooks/operations/bump-submodule-pointer
- runbooks/security/auth-setup
- policy/monetisation
---



# Add a new extension

> Run from the master `chirag127/oriz` repo root (`/c/D/oriz`).
> Most steps the agent can run unattended; steps marked **[user]** need
> human action (developer-account approvals, store-publish credentials).

## Prerequisites

- Auth setup complete per [`auth-setup.md`](../security/auth-setup.md).
- Chrome Web Store developer account ($5 one-time).
- Firefox Add-ons developer account (free).
- Edge Add-ons developer account (free; merges with Microsoft account).
- Extension slug decided (e.g. `oriz-tab-saver`).

## Steps

### 1. Create the GitHub repo

```bash
gh repo create chirag127/<extension-name> \
  --public \
  --description "<one-line description>" \
  --add-readme=false
```

### 2. Add as submodule under `extensions/`

```bash
cd /c/D/oriz
git submodule add https://github.com/chirag127/<extension-name>.git extensions/<extension-name>
```

### 3. Scaffold the extension

```bash
cd extensions/<extension-name>
pnpm create vite . --template vanilla-ts
pnpm install
# add manifest.json (MV3), background.ts / content.ts / popup.html as needed
# add icons in the four MV3 sizes (16/32/48/128)
```

Wire `@chirag127/auth-ui` if the extension needs Firebase auth via
`chrome.identity.launchWebAuthFlow()` bouncing through `auth.oriz.in`
(per AGENTS.md Chrome extensions section).

### 4. Add the cross-store publish workflow

Create `.github/workflows/publish.yml` with three jobs:

- **chrome-web-store**: uses `mnao305/chrome-extension-upload@v5`
  (or current). Inputs: `file-path`, `extension-id`, `client-id`,
  `client-secret`, `refresh-token`. All from envpact:
  `CHROME_EXTENSION_ID_<SLUG>`, `CHROME_CLIENT_ID`,
  `CHROME_CLIENT_SECRET`, `CHROME_REFRESH_TOKEN`.
- **firefox-addons**: uses `wdzeng/firefox-addon@v1` (or current).
  Inputs: `addon-guid`, `xpi-path`, `jwt-issuer`, `jwt-secret`. From
  envpact: `FIREFOX_ADDON_GUID_<SLUG>`, `FIREFOX_JWT_ISSUER`,
  `FIREFOX_JWT_SECRET`.
- **edge-addons**: uses `wdzeng/edge-addon@v1` (or current). Inputs:
  `product-id`, `zip-path`, `client-id`, `client-secret`,
  `access-token-url`. From envpact: `EDGE_PRODUCT_ID_<SLUG>`,
  `EDGE_CLIENT_ID`, `EDGE_CLIENT_SECRET`, `EDGE_ACCESS_TOKEN_URL`.

Trigger: `on: push: tags: ['v*']`.

### 5. **[user]** Submit initial review to each store

Initial review submission CANNOT be automated — each store wants a
human-clicked submission with the listing screenshots, description,
permissions justification, and category selection.

For each store:

1. Build the extension once (`pnpm build && pnpm zip`).
2. Upload via the dashboard UI manually.
3. Fill the listing fields. Category, screenshots, privacy policy
   URL (`https://extensions.oriz.in/<slug>/privacy`), description.
4. Submit for review. Wait 1–7 days.
5. Once approved, copy the IDs back into envpact:
   ```bash
   envpact set CHROME_EXTENSION_ID_<SLUG> <id>
   envpact set FIREFOX_ADDON_GUID_<SLUG> <guid>
   envpact set EDGE_PRODUCT_ID_<SLUG> <product-id>
   ```

### 6. Add the landing page on `extensions.oriz.in`

Inside `sites/oriz-extensions/` (or, until that site exists, on
`oriz.in/extensions/`):

```bash
cd /c/D/oriz/sites/oriz-extensions   # or oriz-home for the cross-promo
# add a new route at /<slug>/index.astro
# pull metadata from the extension's package.json or manifest.json at build time
# render install CTAs to all three stores
```

The landing page uses the same `@chirag127/oriz-kit` shared
primitives as everything else.

Per [`../policy/monetisation.md`](../../policy/monetisation.md): NO
ads on extension landing pages.

### 7. Register in the family list

Update `@chirag127/oriz-family`:

- Add to a `FAMILY_EXTENSIONS` array (parallel to `FAMILY_SITES`).
- Bump version, prepare for publish.

Update `AGENTS.md` if the extension count line is maintained.

### 8. Bump the master pointer

```bash
cd /c/D/oriz
git add extensions/<extension-name> .gitmodules
git add packages/oriz-family
git commit -m "feat(family): add <extension-name> extension"
# DO NOT push without user say-so
```

### 9. Tag the first release inside the submodule

```bash
cd extensions/<extension-name>
git tag v0.1.0
# DO NOT push the tag without user say-so
# When pushed, the publish workflow runs all three store-uploads
```

## Cross-links

- Submodule pointer flow: [`./bump-submodule-pointer.md`](./bump-submodule-pointer.md)
- Auth prerequisites: [`./auth-setup.md`](../security/auth-setup.md)
- Monetisation policy (no ads on extension pages): [`../policy/monetisation.md`](../../policy/monetisation.md)
- Family conventions: [`../../AGENTS.md`](../../AGENTS.md)
