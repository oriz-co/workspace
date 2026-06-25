---
type: rule
title: Tests in parallel + master `pnpm install -r` is THE install command
description: Vitest + Playwright + Storybook per app and per package; master CI matrix-fans
  all suites in parallel. Always work from c:/D/oriz/ (the umbrella). One install
  command from master covers every submodule.
tags:
- rule
- tests
- parallel
- install
- pnpm
- monorepo
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- rules/interaction/parallel-by-default
- rules/interaction/linux-ci-only
- runbooks/operations/install-and-bootstrap
---



# Tests in parallel + master \`pnpm install -r\` is THE install command

## The rule

Every app and every package gets:
- **Vitest** unit tests
- **Playwright** E2E tests
- **Storybook** for UI islands where applicable

Master CI matrix-fans all suites in parallel.

The user **always works from `c:/D/oriz/`** (the umbrella repo). Per-submodule `pnpm install` is forbidden — only `pnpm install -r` from master.

## Install commands

**Fresh clone:**

```bash
git clone --recurse-submodules https://github.com/chirag127/workspace c:/D/oriz
cd c:/D/oriz
pnpm install -r
```

**Update existing:**

```bash
cd c:/D/oriz
git submodule update --init --recursive --remote
pnpm install -r
```

## Why

Single source of truth for dependency graph + cross-package linking (workspace:* protocol). Per-submodule install creates parallel `node_modules` trees that drift. Always-master install keeps everything coherent.

## How to apply

- New submodule: scaffold its `package.json`, add it to `pnpm-workspace.yaml` glob, then `pnpm install -r` from master.
- New test: add Vitest config to the relevant submodule's `vitest.config.ts`. The master CI matrix auto-picks it up.

## Cross-refs

- Parallel-by-default sibling → [[rules/parallel-by-default]]
- Linux-only CI runners → [[rules/linux-ci-only]]
- Install runbook → [[runbooks/install-and-bootstrap]]
