---
type: runbook
title: "Cloudflare Pages \u2014 branch deploys mitigation for 100-project limit"
description: "CF Pages caps free tier at 100 projects per account. Family has 26 apps\
  \ \u2192 26 projects, well under the limit. Use branch-based environments inside\
  \ each project (main = production, staging = staging.<project>.pages.dev, PR branches\
  \ = auto preview URLs) instead of creating separate projects per environment."
tags:
- runbook
- cloudflare-pages
- deploys
- limits
- environments
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- rules/infrastructure/cloudflare-pages-only
- rules/interaction/never-hit-quotas
- decisions/architecture/compute/cf-worker-quota-mitigation
---



# CF Pages branch deploys — 100-project mitigation

## Problem

Cloudflare Pages free tier caps at **100 projects per account**. If
each app × each environment got its own project, the family would
quickly blow past the limit (26 apps × 3 envs = 78 projects, plus
per-PR previews = explosion).

## Solution

**One CF Pages project per app.** All environments live inside that
single project as **branch deploys**. 26 apps → 26 projects, well
under the 100 ceiling, with infinite preview headroom.

## Branch → environment mapping

| Branch | Environment | URL |
|---|---|---|
| `main` | Production | Custom domain (`<app>.oriz.in`) |
| `staging` | Staging | `staging.<project>.pages.dev` |
| `pr/<number>` | Preview | Auto-generated `<hash>.<project>.pages.dev` |

## Per-project CF Pages config

For each app's CF Pages project:

### 1. Connect the repo

- Dashboard → Pages → Create project → Connect to Git
- Pick the app's GH repo
- Build command: `pnpm install && pnpm build`
- Build output directory: `dist/` (Astro) or `.next/` (Next) etc.

### 2. Production branch

- **Production branch:** `main`
- **Custom domain:** `<app>.oriz.in` (DNS configured via Cloudflare DNS API; see `cf-dns-add-api-subdomain.md`)

### 3. Preview branches

- Settings → Builds & deployments → **Preview deployments**
- Set to **All non-Production branches** — every branch push gets a preview URL
- Auto-PR comment posts the preview URL on each PR (built-in)

### 4. Staging alias

- Settings → Custom domains → add `staging.<project>.pages.dev` aliased to the `staging` branch
- Push to `staging` branch redeploys this alias

### 5. Environment variables per branch

- Settings → Environment variables
- **Production** scope: load from `.env.production.enc` (Razorpay LIVE keys, prod URLs)
- **Preview** scope: load from `.env.development.enc` (Razorpay TEST keys, dev URLs)
- See [[decisions/security/env-three-file-split]]

## Workflow per developer

```bash
# Local dev
git checkout -b feat/new-thing
git push origin feat/new-thing
# → auto-preview at https://<hash>.<project>.pages.dev

# Promote to staging
git push origin feat/new-thing:staging
# → staging.<project>.pages.dev

# Promote to prod
gh pr merge --merge --branch feat/new-thing
# → main branch deploys to <app>.oriz.in
```

## Capacity ledger

| Total apps | 26 |
| CF Pages projects used | 26 (1 per app) |
| Free tier ceiling | 100 |
| Headroom | 74 |

Headroom is enough for 74 more apps before we'd need to consolidate.
At current growth rate (~10 apps/year), that's ~7 years of runway.

## When to break the rule

If a single app needs **more than 3 active long-lived branches**
(e.g. main + staging + canary + beta), it gets its own preview-only
sub-project. Doesn't apply today for any app.

## Cross-refs

- [[rules/cloudflare-pages-only]] — the hosting lock
- [[rules/never-hit-quotas]] — the headroom rule
- [[decisions/security/env-three-file-split]] — env variable mapping per branch
- [[runbooks/cf-dns-add-api-subdomain]] — DNS for custom domains
