---
type: runbook
title: Apply per-site CI templates to every oriz-* submodule
description: Copy the templates/per-site-ci/ scaffold into each of the 11 site submodules
  + 6 package submodules, substitute the <sitename> placeholder, commit conventionally,
  then bump the master pointer. Wires up CI lint/typecheck/build, Cloudflare Pages
  deploy, GitHub Pages mirror, Dependabot, CodeQL, CodeRabbit, SonarCloud, and Biome
  in one pass.
tags:
- runbook
- ci
- github-actions
- cloudflare-pages
- dependabot
- codeql
- coderabbit
- sonarcloud
- biome
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- rules/development/conventional-commits
- rules/no-push-without-say-so
- rules/development/use-pnpm
- rules/development/repos-work-independently
- decisions/infrastructure/cloudflare-pages-for-all-sites
- decisions/infrastructure/github-pages-mirror-per-site
- decisions/process/code-quality-stack
- runbooks/operations/bump-submodule-pointer
- runbooks/operations/clean-install
---



# Apply per-site CI templates to every oriz-* submodule

## Goal

Every `chirag127/oriz-*` repo (11 sites + 6 package submodules) has
the same CI scaffold landed in one pass: build CI on push/PR,
Cloudflare Pages deploy on `main`, GitHub Pages mirror, Dependabot,
CodeQL, CodeRabbit, SonarCloud, and a root `biome.json`. The
template lives at `templates/per-site-ci/` in master; this runbook
copies it into each submodule, substitutes the `<sitename>`
placeholder, commits, and bumps the master pointer.

## Scope (17 submodules)

11 sites:

| Submodule path | Repo |
|---|---|
| `sites/oriz-home` | `chirag127/home` |
| `sites/oriz-blog` | `chirag127/blog-site` |
| `sites/oriz-books` | `chirag127/ncert` |
| `sites/oriz-book-lore` | `chirag127/lore` |
| `sites/oriz-cards` | `chirag127/cards-site` |
| `sites/oriz-finance` | `chirag127/oriz-finance` |
| `sites/oriz-journal` | `chirag127/journal-site` |
| `sites/oriz-urls-to-md` | `chirag127/oriz-urls-to-md` |
| `sites/oriz-image-tools` | `chirag127/oriz-image-tools` |
| `sites/oriz-pdf-tools` | `chirag127/oriz-pdf-tools` |
| `repos/oriz/own/prod/apps/personal/oriz-cs-me-app` | `chirag127/oriz-cs-me-app` |

6 packages (CI without the Cloudflare Pages + GitHub Pages mirror jobs — see step 7):

| Submodule path | Repo |
|---|---|
| `packages/oriz-ui` | `chirag127/oriz-kit` |
| `packages/firebase-init` | `chirag127/firebase-init` |
| `packages/auth-ui` | `chirag127/auth-ui` |
| `packages/contact-form` | `chirag127/contact-form` |
| `packages/sidebar` | `chirag127/sidebar` |
| `packages/oriz-family` | `chirag127/oriz-family` |

> The repo-naming-suffix migration to `-site` / `-ext` (see
> [`runbooks/rename-all-sites-to-suffix.md`](../rename-all-sites-to-suffix.md))
> is a separate, prior step. If suffixes have already landed, swap
> `oriz-<name>` for `oriz-<name>-site` everywhere below.

## Pre-flight

Before applying the template to a submodule, confirm:

```bash
cd sites/oriz-<sitename>

# 1. There IS a pnpm-lock.yaml (the template assumes pnpm + frozen-lockfile).
test -f pnpm-lock.yaml || { echo "missing pnpm-lock.yaml"; exit 1; }

# 2. package.json exposes the scripts the template calls.
node -e "
  const pkg = require('./package.json');
  for (const s of ['build','typecheck']) {
    if (!pkg.scripts || !pkg.scripts[s]) {
      console.error('missing script: ' + s);
      process.exit(1);
    }
  }
"

# 3. There is no existing .github/workflows/ci.yml that would collide.
#    If there is, diff first and merge by hand instead of overwriting.
ls .github/workflows/ 2>/dev/null

# 4. Repo is on main, clean tree (per rules/one-branch-only).
git rev-parse --abbrev-ref HEAD   # expect "main"
git status --porcelain            # expect empty
```

If any check fails, fix that submodule before proceeding. Don't apply
the template on top of a dirty tree.

## Steps

### 1. From the master repo root, copy the template

Single submodule:

```bash
SITE=oriz-blog                      # change per repo
SUBMODULE_PATH=sites/${SITE}

mkdir -p ${SUBMODULE_PATH}/.github/workflows
cp -R templates/per-site-ci/.github/. ${SUBMODULE_PATH}/.github/
cp templates/per-site-ci/.coderabbit.yaml ${SUBMODULE_PATH}/.coderabbit.yaml
cp templates/per-site-ci/sonar-project.properties ${SUBMODULE_PATH}/sonar-project.properties
cp templates/per-site-ci/biome.json ${SUBMODULE_PATH}/biome.json
```

Or fan out across every site + package via `git submodule foreach`
(per [`rules/parallel-fan-out-by-default.md`](../../rules/interaction/parallel-fan-out-by-default.md)):

```bash
git submodule foreach --quiet '
  case "$name" in
    sites/*|packages/*)
      mkdir -p .github/workflows
      cp -R "$toplevel/templates/per-site-ci/.github/." ".github/"
      cp "$toplevel/templates/per-site-ci/.coderabbit.yaml" ".coderabbit.yaml"
      cp "$toplevel/templates/per-site-ci/sonar-project.properties" "sonar-project.properties"
      cp "$toplevel/templates/per-site-ci/biome.json" "biome.json"
      ;;
  esac
'
```

### 2. Substitute the `<sitename>` placeholder per repo

The template ships `<sitename>` as a literal placeholder in three
files: `ci.yml`, `pages-mirror.yml`, `sonar-project.properties`.
Replace it with the repo's slug (the part after `oriz-`):

```bash
SITE=oriz-blog
NAME=${SITE#oriz-}                  # → "blog"

cd sites/${SITE}

# GNU sed (Linux / Git Bash on Windows / WSL):
sed -i "s/<sitename>/${NAME}/g" \
  .github/workflows/ci.yml \
  .github/workflows/pages-mirror.yml \
  sonar-project.properties

# macOS BSD sed: add ''
# sed -i '' "s/<sitename>/${NAME}/g" .github/workflows/ci.yml ...
```

Verify no placeholder remains:

```bash
grep -R "<sitename>" . && { echo "placeholders left"; exit 1; } || echo "clean"
```

### 3. Pick the right build output directory

`ci.yml` (deploy-cf step) and `pages-mirror.yml` (upload-pages-artifact)
both default to `dist`. If this site's framework emits elsewhere, edit
both:

| Framework | `directory` / `path` |
|---|---|
| Astro | `dist` |
| Vite | `dist` |
| Next.js (`output: export`) | `out` |
| Nuxt 3 | `.output/public` |
| SvelteKit (static) | `build` |

### 4. Verify locally

```bash
pnpm install --frozen-lockfile
pnpm exec biome check .
pnpm exec tsc --noEmit
pnpm build
```

A green local run is the gate before committing.

### 5. Commit inside the submodule

Per [`rules/conventional-commits.md`](../../rules/development/conventional-commits.md):

```bash
git add .github/ .coderabbit.yaml sonar-project.properties biome.json
git commit -m "ci(scaffold): add per-site CI from templates/per-site-ci"
```

### 6. Push the submodule (only when authorised)

Per [`rules/no-push-without-say-so.md`](../../rules/no-push-without-say-so.md),
do not push without explicit user say-so this turn.

```bash
git push origin main
```

### 7. Adjust packages (skip the deploy jobs)

Packages don't deploy to Cloudflare Pages or GitHub Pages — they
publish to npm. After step 1 inside a `packages/*` submodule:

```bash
rm .github/workflows/pages-mirror.yml
# Edit ci.yml: delete the entire `deploy-cf` job.
```

Keep `lint`, `typecheck`, `build`, plus `codeql.yml`, `dependabot.yml`,
`.coderabbit.yaml`, `sonar-project.properties`, `biome.json`. A
separate publish workflow is out of scope for this runbook.

### 8. Bump the master submodule pointer

Once each submodule has its CI commit landed, bump master per
[`runbooks/bump-submodule-pointer.md`](./bump-submodule-pointer.md):

```bash
cd /path/to/oriz                    # master repo root
git add sites/oriz-<name> packages/<pkg>     # all bumped paths
git commit -m "chore(submodule): bump $(git diff --cached --name-only | tr '\n' ' ') to per-site CI scaffold"
git push origin main                # only when authorised
```

### 9. Enable Cloudflare Pages project per repo (one-time)

For each site repo, go to the Cloudflare Pages dashboard and create a
project named exactly `oriz-<sitename>` (matching the `projectName`
field in `ci.yml`). Use **Direct Upload** mode — the CI does the upload,
so the Pages-managed Git integration is **not** used (avoids the
double-deploy race).

Then add the two repo-level secrets in
GitHub → Settings → Secrets and variables → Actions:

- `CF_API_TOKEN` — a Cloudflare API token scoped to `Account.Cloudflare Pages.Edit`
- `CF_ACCOUNT_ID` — the Cloudflare account id (top-right of any CF page)

> Family-wide secret rotation policy:
> [`policy/secrets-handling.md`](../../policy/secrets-handling.md).

### 10. Enable the failover GitHub Pages site (one-time)

In GitHub → Settings → Pages, set source = "GitHub Actions". The
`pages-mirror.yml` workflow will publish on next `main` push. Visit
`https://chirag127.github.io/oriz-<sitename>/` once to confirm.

### 11. Enable CodeRabbit + SonarCloud (one-time per repo)

- **CodeRabbit:** install the GitHub App on `chirag127/oriz-<sitename>`.
  The committed `.coderabbit.yaml` takes effect on the next PR.
- **SonarCloud:** create a project at `https://sonarcloud.io/` with
  key `chirag127_oriz-<sitename>` (matches `sonar.projectKey`). Add
  `SONAR_TOKEN` as a repo secret. (A SonarCloud-uploading workflow is
  out of scope for this runbook — wire one in later if/when local
  coverage is generated.)

## Verification

Per repo, confirm:

```bash
gh workflow run ci.yml -R chirag127/oriz-<sitename> --ref main
gh run watch --exit-status -R chirag127/oriz-<sitename>
```

A green run on `ci.yml` proves lint + typecheck + build + Pages deploy
all work. Then trigger `pages-mirror.yml` the same way and wait for
green. A green CodeQL run on a fresh PR closes the loop.

Spot-check the deployed sites:

```bash
curl -fsSI https://oriz-<sitename>.pages.dev | head -1   # CF Pages preview
curl -fsSI https://<sitename>.oriz.in | head -1          # apex via CF DNS
curl -fsSI https://chirag127.github.io/oriz-<sitename>/ | head -1   # mirror
```

All three should return `HTTP/2 200`.

## Rollback

If the new workflows break a repo:

```bash
cd sites/oriz-<sitename>
git revert HEAD                     # the ci(scaffold) commit
git push origin main                # only when authorised
cd ../..
git add sites/oriz-<sitename>
git commit -m "chore(submodule): revert oriz-<sitename> CI scaffold"
```

Cloudflare Pages keeps prior deploys live; the apex domain stays up.

## Cross-refs

- [`./bump-submodule-pointer.md`](./bump-submodule-pointer.md) — the
  two-commit pointer-bump workflow this runbook calls into at step 8.
- [`./clean-install.md`](./clean-install.md) — pnpm-lock.yaml + scripts
  pre-flight assumes a clean-installed repo.
- [`../decisions/infrastructure/cloudflare-pages-for-all-sites.md`](../../decisions/infrastructure/cloudflare-pages-for-all-sites.md)
  — why CF Pages is primary.
- [`../decisions/infrastructure/github-pages-mirror-per-site.md`](../../decisions/infrastructure/github-pages-mirror-per-site.md)
  — why every site also publishes to GH Pages as failover.
- [`../decisions/process/code-quality-stack.md`](../../decisions/process/code-quality-stack.md)
  — Dependabot + Biome + CodeRabbit + SonarCloud as the family-wide stack.
- [`../rules/parallel-fan-out-by-default.md`](../../rules/interaction/parallel-fan-out-by-default.md)
  — fan-out shape for applying this runbook across 17 repos in one turn.
