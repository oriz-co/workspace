---
type: decision
title: "Build cache \u2014 GitHub Actions cache + pnpm CAS (3-layer strategy)"
description: "Three-layer build cache strategy. Layer 1: pnpm content-addressable\
  \ global store dedupes deps cross-repo locally. Layer 2: GitHub Actions cache (10\
  \ GB/repo free) keyed by pnpm-lock.yaml hash + Astro build cache keyed by source\
  \ hash. Layer 3: Turbo Remote Cache + Bazel REJECTED \u2014 Vercel signup + card\
  \ / overengineering."
tags:
- decisions
- architecture
- build
- cache
- ci
- pnpm
- github-actions
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/compute/github-actions
- services/cron/github-actions-schedule
- rules/development/use-pnpm
- rules/development/always-latest-deps
- runbooks/operations/clean-install
- decisions/process/code-quality-stack
- decisions/process/per-repo-ci-workflows
- decisions/architecture/compute/cf-worker-quota-mitigation
- rules/interaction/no-card-on-file
- rules/infrastructure/no-subscriptions
---



# Build cache — GitHub Actions cache + pnpm CAS

## Decision

The family's build-cache strategy is **three layers, picked by
locality**:

### Layer 1 — pnpm content-addressable global store (per-developer-machine)

Already in use family-wide via [`rules/use-pnpm.md`](../../../rules/development/use-pnpm.md).
pnpm hard-links every package version exactly once into `~/.pnpm-store/`
(or `%LOCALAPPDATA%\pnpm` on Windows) and symlinks into each
`node_modules/`. Cross-repo dedup: one library version downloaded
once across all 11 sites + N packages on a developer's machine.
Cleared only when disk pressure (or via `pnpm store prune`).

### Layer 2 — GitHub Actions cache (per-repo, free 10 GB)

Two cache buckets per repo:

#### A) pnpm store cache

```yaml
- name: Cache pnpm store
  uses: actions/cache@v4
  with:
    path: ${{ steps.pnpm-store.outputs.path }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-store-
```

Exact-match by lockfile hash; fuzzy-fallback to most-recent
`pnpm-store-` cache when the lockfile changes (warm-start the new
hash bucket from the previous one).

#### B) Astro build cache

```yaml
- name: Cache Astro build
  uses: actions/cache@v4
  with:
    path: |
      node_modules/.astro
      .astro
    key: ${{ runner.os }}-astro-${{ hashFiles('astro.config.*', 'src/**/*', 'public/**/*') }}
    restore-keys: |
      ${{ runner.os }}-astro-
```

Keyed by config + source-tree hash so source edits invalidate but
unrelated repo changes don't.

### Layer 3 — REJECTED for now

- **Turbo Remote Cache** — requires Vercel signup + payment method
  even on the free tier; fights
  [`rules/no-card-on-file.md`](../../../rules/interaction/no-card-on-file.md). Each
  repo is sized that the GH Actions cache is sufficient on its own.
- **Bazel** — over-engineered for the family's surface (~11 sites + a
  handful of packages, all on Vite + Astro). Bazel makes sense at
  monorepo scales the family doesn't have.
- **Nx Cloud** — same Vercel-style signup + paid-past-trial issue as
  Turbo.

## Why

- **Cost is zero.** GH Actions cache is 10 GB / repo free; pnpm is
  OSS. Three layers covered without a paid vendor or card.
- **The pnpm CAS already exists family-wide.** Reusing it on developer
  machines is free, deterministic, and a strict superset of npm /
  yarn caching.
- **The lockfile-hash key is the right invalidation surface.** Most
  PRs don't touch `pnpm-lock.yaml`; those that do should warm-start
  from the most-recent prior cache via `restore-keys` (so the diff
  install is a few new packages, not a full cold install).
- **Astro cache is the second-biggest win after pnpm.** Astro's
  build output keys on the source tree + config; reusing
  `node_modules/.astro` between PRs gives the biggest single CI
  speedup after pnpm's package install.
- **Turbo / Nx Cloud / Bazel solve a problem the family doesn't have
  yet.** None of the 11 sites builds in more than ~30 s on a warm
  cache; cross-repo cache sharing isn't load-bearing.

## Implications

### CI workflow shape

The per-site CI template at
[`templates/per-site-ci/.github/workflows/ci.yml`](../../../templates/per-site-ci/.github/workflows/ci.yml)
already implements Layer 2 part A (pnpm store cache, lockfile-keyed,
fuzzy fallback). The template now also documents the strategy in a
header comment + adds Astro cache (Layer 2 part B) where the site
ships an Astro build.

The
[per-site CI runbook](../../../runbooks/operations/apply-per-site-ci.md) covers
applying the template to all 11 site repos + the package repos that
also need cache + the cross-link to this decision.

### Monorepo posture

The master `oriz/` repo is a polyrepo-as-submodules pattern
([`infrastructure/chrome-extensions-as-submodules.md`](../../infrastructure/chrome-extensions-as-submodules.md)
+ the same posture for sites). Each submodule has its own
`pnpm-lock.yaml` + its own GH Actions cache budget — meaning the
10 GB/repo limit is effectively N × 10 GB across the family, never
shared, never bottlenecked.

The `pnpm` workspace is per-repo (each site's repo + each package's
repo); there is NO master root `pnpm-workspace.yaml` covering the
whole family. This is intentional and aligns with
[`rules/repos-work-independently.md`](../../../rules/development/repos-work-independently.md).

### Cache hygiene

- `pnpm install --frozen-lockfile` in CI ensures the cache is the
  source of truth and lockfile changes trigger explicit refresh
  rather than silent drift.
- The
  [clean-install runbook](../../../runbooks/operations/clean-install.md) is the
  documented escape hatch when caches go bad: locally, blow
  `node_modules/` + `.pnpm-store/` + `.astro/`; in CI, bump the
  cache key prefix from `pnpm-store-` to `pnpm-store-v2-` to start
  fresh.
- Stale cache eviction is GitHub's job — entries unused for 7 days
  are auto-evicted. The 10 GB/repo limit pushes oldest first; we
  don't run a manual sweep.

### What we measure (light-touch)

- CI run wall-time on warm vs cold cache. If a repo's build climbs
  past ~5 min on warm cache, revisit (likely a missing
  Astro / Vite cache key, not a fundamental Layer-3 need).
- Cache hit rate from GH Actions' "Caches" tab. Lockfile-bump PRs
  should hit the `pnpm-store-` fuzzy key, not start cold.

### What we don't do

- **No Turbo Remote Cache / Vercel.** Card-on-file gate. Re-evaluate
  only if Layer 2 stops being enough AND a card-free remote-cache
  vendor surfaces.
- **No Bazel / Buck2 / Pants.** Family-scale doesn't need it.
- **No NX / Lerna**. Each repo is its own pnpm workspace.
- **No global package cache mounting** across repos in CI (e.g.
  via a `volume` in a self-hosted runner). The family runs on
  GitHub-hosted runners; per-repo caches are the right granularity.
- **No CI-level "post-build cache write" beyond what `actions/cache`
  already does.** That action writes after a successful job; nothing
  else to add.

## Cross-refs

- [pnpm rule](../../../rules/development/use-pnpm.md)
- [always-latest-deps rule](../../../rules/development/always-latest-deps.md)
- [clean-install runbook](../../../runbooks/operations/clean-install.md)
- [code-quality stack decision](../../process/code-quality-stack.md)
- [per-repo CI workflows decision](../../process/per-repo-ci-workflows.md)
- [per-site CI template](../../../templates/per-site-ci/.github/workflows/ci.yml)
- [apply-per-site-ci runbook](../../../runbooks/operations/apply-per-site-ci.md)
- [GitHub Actions service](../../../services/compute/github-actions.md)
- [GitHub Actions schedule (cron sibling)](../../../services/cron/github-actions-schedule.md)
- [CF Worker quota mitigation — sibling caching playbook](../compute/cf-worker-quota-mitigation.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
- [No subscriptions rule](../../../rules/infrastructure/no-subscriptions.md)
