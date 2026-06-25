---
type: runbook
title: Migrate CI/CD from GitHub Actions to GitLab CI or CircleCI
description: 'Plan-B runbook for the day GitHub Actions becomes unusable (account
  suspension, regional ban, ToS dispute, billing change). Translates the family''s
  standard CI workflow into GitLab CI + CircleCI equivalents. Each repo already has
  its source mirrored to GitLab via the weekly master cron, so the migration is: enable
  CI on the mirror, push a translated config, switch DNS/CNAME if hosting moved too.
  Linux/Ubuntu runners only per [[linux-ci-only]].'
tags:
- runbook
- ci
- migration
- gitlab-ci
- circleci
- plan-b
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- rules/interaction/linux-ci-only
- decisions/architecture/ops/mirror-to-4-git-hosts
- services/easy-free-tier
---



# Migrate CI/CD from GitHub Actions to GitLab CI or CircleCI

## When to run

GitHub Actions is the family's primary CI/CD (already free + unlimited public-repo minutes on Linux). Trigger this runbook when one of:

- GitHub account suspended / region-banned / ToS dispute
- GitHub Actions free public-repo minutes changes meaningfully (e.g. capped)
- GitHub's API or Actions runners have a multi-day outage
- We hit a quota wall on GH Actions (shouldn't happen — Linux is unlimited for public — but documented for completeness)

If only the FREE TIER changes (e.g. capped), the migration may be partial — heavy jobs move; cheap ones stay.

## Pre-requisites

- The weekly mirror cron at `c:/D/oriz/.github/workflows/mirror-all.yml` has already been running (see [[decisions/architecture/mirror-to-4-git-hosts]]). Every repo's history is on **GitLab.com / Codeberg.org / Bitbucket / GitFlic.ru** already.
- Org-level GH secrets are mirrored to the new platform's secret store (separate one-time setup per platform).
- The fallback CI platform account is set up in advance (don't wait for the emergency):
  - GitLab.com — free signup, no card
  - CircleCI — free signup, no card

## Translation table: GitHub Actions → GitLab CI → CircleCI

| Concept | GitHub Actions | GitLab CI | CircleCI |
|---|---|---|---|
| Config file | `.github/workflows/<name>.yml` | `.gitlab-ci.yml` | `.circleci/config.yml` |
| Linux runner | `runs-on: ubuntu-latest` | `image: node:22` + default runner | `executor: docker:cimg/node:22.0` |
| Trigger on push | `on: push: branches: [main]` | `workflow: rules: - if: $CI_COMMIT_BRANCH == "main"` | `workflows: build: jobs: - check: filters: branches: only: main` |
| Trigger on tag | `on: push: tags: ['v*']` | `rules: - if: $CI_COMMIT_TAG` | `filters: tags: only: /^v.*/` |
| Trigger on PR | `on: pull_request` | `rules: - if: $CI_PIPELINE_SOURCE == "merge_request_event"` | `filters: branches: ignore: main` (approximation) |
| Cron schedule | `on: schedule: - cron: '...'` | GitLab Pipelines → Schedules UI | `triggers: schedule: cron: '...'` |
| Secret | `${{ secrets.NPM_TOKEN }}` | `$NPM_TOKEN` (set in Settings → CI/CD → Variables) | `$NPM_TOKEN` (set in Project Settings → Environment Variables) |
| OIDC for npm provenance | `permissions: id-token: write` | GitLab ID Tokens via `id_tokens:` field | OIDC supported via cloud-config-only flow |
| Artifact upload | `actions/upload-artifact@v4` | `artifacts: paths: [...]` | `store_artifacts: path: ...` |
| Cache deps | `actions/setup-node@v4 with: cache: pnpm` | `cache: paths: [.pnpm-store/]` | `restore_cache: keys: [...]` + `save_cache:` |
| Re-usable workflow | `uses: <org>/<repo>/.github/workflows/X.yml@main` | `include: project: <path> file: <yml>` | `orbs: <orb>@<ver>` |
| Matrix | `strategy: matrix:` | `parallel: matrix: -` | `parallelism: N` + `matrix:` (limited) |
| Marketplace action | `uses: <org>/<action>@v1` | run binary directly (no marketplace) | orb or run binary |

## Standard family CI workflow translated

Source GH Actions (`.github/workflows/ci.yml`):

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile=false
      - run: pnpm typecheck
      - run: pnpm test
```

Equivalent GitLab CI (`.gitlab-ci.yml`):

```yaml
default:
  image: node:22
  cache:
    paths:
      - .pnpm-store/

check:
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
  before_script:
    - corepack enable
    - corepack prepare pnpm@10 --activate
    - pnpm config set store-dir .pnpm-store
  script:
    - pnpm install --frozen-lockfile=false
    - pnpm typecheck
    - pnpm test
```

Equivalent CircleCI (`.circleci/config.yml`):

```yaml
version: 2.1
jobs:
  check:
    docker:
      - image: cimg/node:22.0
    steps:
      - checkout
      - restore_cache:
          keys:
            - pnpm-{{ checksum "pnpm-lock.yaml" }}
            - pnpm-
      - run: corepack enable && corepack prepare pnpm@10 --activate
      - run: pnpm config set store-dir ~/.pnpm-store
      - run: pnpm install --frozen-lockfile=false
      - save_cache:
          paths:
            - ~/.pnpm-store
          key: pnpm-{{ checksum "pnpm-lock.yaml" }}
      - run: pnpm typecheck
      - run: pnpm test

workflows:
  build:
    jobs:
      - check
```

## Standard release workflow translated

Source GH Actions (`.github/workflows/release.yml`):

```yaml
name: Release
on:
  push: { tags: ['v*.*.*'] }
jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, registry-url: 'https://registry.npmjs.org' }
      - run: pnpm install --frozen-lockfile=false
      - run: npm publish --access public --provenance
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

GitLab CI equivalent:

```yaml
publish:
  image: node:22
  rules:
    - if: $CI_COMMIT_TAG =~ /^v.*/
  before_script:
    - corepack enable
    - corepack prepare pnpm@10 --activate
    - echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc
  script:
    - pnpm install --frozen-lockfile=false
    - npm publish --access public
  # NOTE: --provenance only works with GitHub Actions OIDC right now.
  # GitLab OIDC support for npm provenance is on npm's roadmap but not GA.
  # Until then, releases from GitLab CI are unsigned but functionally identical.
```

CircleCI equivalent: similar `cimg/node` image + npm publish step gated by `filters: tags: only: /^v.*/`.

## Step-by-step emergency migration

1. **Verify mirror is current** — check master cron's last successful run. If it ran <7 days ago, the GitLab/Codeberg/Bitbucket/GitFlic mirror is fresh.

2. **Pick primary fallback** — GitLab.com by default (broadest ecosystem). Fall back to CircleCI if GitLab is also affected.

3. **For each repo that needs CI today**:
   - Visit GitLab.com mirror URL (e.g. `gitlab.com/chirag127/<repo>`)
   - Create `.gitlab-ci.yml` mirroring the local `.github/workflows/ci.yml`
   - Settings → CI/CD → Variables → add `NPM_TOKEN`, `CODECOV_TOKEN`, etc. (mirror from GH org secrets)
   - Push → pipeline runs

4. **For deployment workflows** (CF Pages, npm publish, etc.):
   - CF Pages: deploy from GitLab via `cloudflare/wrangler-action@v3` doesn't exist on GitLab — use `npx wrangler pages deploy dist` directly with `CF_API_TOKEN` env var
   - npm publish: same `npm publish --access public` works — bump `NPM_TOKEN`

5. **Update master umbrella** — write a `.gitlab-ci.yml` for the master itself that runs the matrix deploy + mirror cron (translated from GH Actions).

6. **Communicate**:
   - Telegram channel: "GH Actions unusable, primary CI moved to GitLab.com"
   - Update README badges from `github.com/.../actions/.../badge.svg` to GitLab equivalents

## Things that DON'T translate cleanly

| GH Actions feature | Issue elsewhere |
|---|---|
| `--provenance` for npm | Only works with GH OIDC; GitLab/CircleCI in flight |
| GitHub Marketplace actions | No equivalent registry on GitLab/CircleCI — run binaries directly |
| Free macOS / Windows runners | We don't use them per [[linux-ci-only]] — no impact |
| `${{ github.event.pull_request.head.sha }}` etc. | Different env var names (`$CI_MERGE_REQUEST_SOURCE_BRANCH_SHA` on GitLab) |
| `repository_dispatch` | GitLab has `trigger_pipeline` API; CircleCI has API trigger |
| Reusable workflows | GitLab uses `include:`; CircleCI uses `orbs:` |
| GitHub App-installed bots (CodeRabbit, Mergify, etc.) | All GitHub-only. No replacement on GitLab. Accept loss + use built-in MR features |

## Long-term plan

If GitHub Actions becomes unusable for >2 weeks, **make GitLab CI the primary** and run a reverse mirror (GitLab → GitHub) instead. Update [[decisions/architecture/mirror-to-4-git-hosts]] accordingly.

## Cross-refs

- The mirror decision → [[decisions/architecture/mirror-to-4-git-hosts]]
- The Linux-runner rule → [[rules/linux-ci-only]]
- The catalog of CI platforms → [[services/easy-free-tier]] §"CI/CD platforms"
