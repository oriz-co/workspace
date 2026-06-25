---
type: decision
title: Umbrella repo — oriz-org/oriz as the single clone entrypoint
description: Locked 2026-06-25. The oriz-org/oriz umbrella holds knowledge/, apps.ts registry, and every fleet repo as a git submodule. A single git clone --recurse-submodules pulls the entire fleet. No separate workspace repo, no manifest, no subtree.
tags:
- decision
- umbrella
- monorepo
- submodules
- workspace
- infrastructure
- clone
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
related:
- decisions/architecture/infrastructure/workspace-flat-repos-2026-06-25
- decisions/architecture/branding/repo-naming-drop-oriz-prefix-2026-06-25
- decisions/architecture/apps/fleet-strategy-build-gate-2026-06-25
---

# Umbrella — oriz-org/oriz as clone entrypoint

## Decision

The `oriz-org/oriz` repo is the umbrella. It holds:

- `knowledge/` — the family OKF bundle (this file lives there).
- `apps.ts` — the canonical registry of every fleet repo (slug, type, subdomain, status, donations URL).
- `repos/<slug>/` — every fleet repo as a git submodule, flat layout.
- Top-level config: workspace `package.json` / `pnpm-workspace.yaml`, root scripts, root README.

`git clone --recurse-submodules git@github.com:oriz-org/oriz` pulls the entire fleet in one command. No `workspace` repo, no Google `repo`-tool manifest, no git subtree.

## Why

- **Single clone command** — onboarding for any agent or contributor is one line.
- **submodules pin to SHAs** — reproducible "what was the family at commit X" snapshots come free.
- **`apps.ts` is the registry** — typed source of truth for which repos exist, their type, subdomain, and routing. CI matrices read from it.
- **knowledge/ lives at root** — agents traverse from `knowledge/index.md` without crossing submodule boundaries.
- **Subtree was considered and rejected** — submodules are noisier locally but keep each repo's history intact and independent, which matches the public-source posture.
- **Manifest tools (`repo`, `vcstool`) add a layer for no gain** — `.gitmodules` is plain text and every git client supports it.

## Implications

- The umbrella repo name is just `oriz` (no `-workspace` suffix), per repo-naming-drop-oriz-prefix-2026-06-25 the org namespace provides the brand.
- Every fleet repo's `.gitmodules` entry sits in the umbrella, `path = repos/<slug>`, `url = git@github.com:oriz-org/<slug>` (or chirag127 for personal repos).
- A weekly submodule-update workflow can bump every submodule pointer to its tip and open a single PR.
- `knowledge/` updates land in the umbrella directly; per-app knowledge bundles inside submodules cross-link back via relative paths.
- `apps.ts` regenerates from a single source on every umbrella commit; CI sanity-checks that every submodule has a matching `apps.ts` entry.
- Local size grows with the fleet — partial clone / sparse-checkout escape hatches stay available but are not the default.
