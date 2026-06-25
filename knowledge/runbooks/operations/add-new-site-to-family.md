---
type: runbook
title: Add a new site to the family
description: Add a new oriz-<name> repo as a submodule under sites/, register it in
  the family list, scaffold its design brief, set up its CI + Cloudflare Pages deploy,
  and bump the master pointer.
tags:
- runbook
- site
- submodule
- scaffold
- family
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- runbooks/operations/bump-submodule-pointer
- runbooks/security/auth-setup
- policy/monetisation
---



# Add a new site to the family

> Run from the master `chirag127/oriz` repo root (`/c/D/oriz`).
> Most steps the agent can run unattended; steps marked **[user]** need
> human action (dashboard click, secret approval).

## Prerequisites

- Auth setup complete per [`auth-setup.md`](../security/auth-setup.md): `gh`,
  `wrangler`, envpact authenticated.
- Subdomain decided (`<name>.oriz.in`).
- Repo name decided (`chirag127/oriz-<name>`).
- A v2 design brief at least sketched — even one paragraph beats
  bootstrapping with no aesthetic direction.

## Steps

### 1. Create the GitHub repo

```bash
gh repo create chirag127/oriz-<name> \
  --public \
  --description "<one-line description>" \
  --add-readme=false
```

### 2. Add as a submodule under `sites/`

```bash
cd /c/D/oriz
git submodule add https://github.com/chirag127/oriz-<name>.git sites/oriz-<name>
```

This updates `.gitmodules` and creates the submodule tree.

### 3. Scaffold the site

```bash
cd sites/oriz-<name>
# pick the framework — Astro static is the default per AGENTS.md
pnpm create astro@latest . --template minimal --typescript strict --no-install
pnpm install
```

Set up:

- `wrangler.toml` per AGENTS.md "Hosting (per-site)" section
- `.env.example` listing required env vars (no secrets, just names)
- `.github/workflows/ci.yml` — typecheck + lint + build on PR
- `astro.config.mjs` with `site: 'https://<name>.oriz.in'`
- The `@chirag127/oriz-kit` import for shared primitives if any auth
  / contact-form / sidebar surface is needed

### 4. Add the v2 design brief

Create `knowledge/design/oriz-<name>.md` with full OKF frontmatter
(`type: design-brief`). Reference
`knowledge/design/_family-rules.md` for the cross-site contract.

### 5. Register in the family list

Update `@chirag127/oriz-family`:

```bash
cd /c/D/oriz/packages/oriz-family
# add the new site to FAMILY_SITES const
# bump the package version (patch)
# pnpm publish (after PUB2 unlocks publish flow)
```

Update `AGENTS.md` "The 11 current sites" section — add the new line
with the subdomain and a one-sentence description.

Update `knowledge/index.md` if it lists site count.

### 6. **[user]** Configure Cloudflare Pages project

1. Open <https://dash.cloudflare.com> → Workers & Pages → Create.
2. Connect to GitHub → pick `chirag127/oriz-<name>`.
3. Build command: `pnpm build`. Output dir: `dist`.
4. Set env vars from envpact (build-time):
   `pnpm dlx envpact-cli@latest --project oriz-<name>`.
5. Custom domain: `<name>.oriz.in`. Cloudflare will auto-provision
   the cert.

### 7. **[user]** Set up the Cloudflare Pages secret in envpact

```bash
envpact set --project oriz-<name> CLOUDFLARE_PAGES_PROJECT oriz-<name>
```

CI uses this for `wrangler pages deploy`.

### 8. Add the deploy job to the master matrix

Edit `chirag127/oriz/.github/workflows/deploy.yml`:

- Add `oriz-<name>` to the matrix's `site` array.
- The matrix step already handles per-site checkout, install, build,
  and `wrangler pages deploy`.

### 9. Bump the master pointer

Per [`bump-submodule-pointer.md`](./bump-submodule-pointer.md):

```bash
cd /c/D/oriz
git add sites/oriz-<name> .gitmodules
git add packages/oriz-family AGENTS.md knowledge/
git commit -m "feat(family): add oriz-<name> site"
# DO NOT push without user say-so
```

### 10. Smoke test

After the user gives the green light to push:

```bash
git push origin main
gh workflow run deploy.yml --repo chirag127/oriz
```

Check the deploy run; the new site should appear at `<name>.oriz.in`
within 2–3 minutes.

## Cross-links

- Submodule pointer flow: [`./bump-submodule-pointer.md`](./bump-submodule-pointer.md)
- Auth prerequisites: [`./auth-setup.md`](../security/auth-setup.md)
- Monetisation defaults: [`../policy/monetisation.md`](../../policy/monetisation.md)
- Family conventions: [`../../AGENTS.md`](../../AGENTS.md)
