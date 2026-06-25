---
type: rule
title: Always install the latest version of every dependency
description: "When adding or refreshing a dependency in any oriz repo, install the\
  \ latest published version. Old deps eventually reach end-of-life and may go paid\
  \ \u2014 staying current is a never-hit-quotas requirement, not a preference."
tags:
- rule
- pnpm
- dependencies
- versioning
- no-quotas
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- rules/development/use-pnpm
- rules/interaction/never-hit-quotas
- runbooks/operations/clean-install
---



# Always install the latest version of every dependency

## The rule

When you add a new dependency to any oriz repo, install **the latest
published version**. When you refresh existing deps, bump them to
**the latest minor / major** unless an explicit pin is documented.

This is a family-wide rule, not a per-repo opinion. Old deps
eventually reach end-of-life, lose security patches, or get migrated
to paid tiers — all of which conflict with the
[`never-hit-quotas`](../interaction/never-hit-quotas.md) and
[`no-card-on-file`](../interaction/no-card-on-file.md) stance. Stay current.

## Install commands

For new dependencies, **always** include the `@latest` tag:

```bash
# Correct
pnpm add astro@latest
pnpm add -D vitest@latest

# Wrong — pnpm may resolve to whatever the local cache thinks is current,
# which can be stale by months on a dev machine that hasn't refreshed in a while
pnpm add astro
```

The `@latest` tag forces pnpm to consult the registry and pick the
newest version, ignoring the local cache for resolution (it still
reuses cached tarballs once it knows the version).

## Update commands

Refresh dependencies on a regular cadence — weekly is the floor:

```bash
# Update every package in every workspace to the latest version,
# including major bumps
pnpm update --latest --recursive

# Inside a single repo (no workspace)
pnpm update --latest
```

Run the test suite + typecheck after every refresh. Major bumps
sometimes break — that's fine, fix forward, don't pin backward.

## Catalog dependencies (monorepos with pnpm-workspace.yaml)

When a monorepo has a `pnpm-workspace.yaml`, use the **catalog**
feature so every workspace package references the same version of a
shared dep:

```yaml
# pnpm-workspace.yaml
packages:
  - "sites/*"
  - "packages/*"
catalog:
  astro: ^6.0.0
  "@astrojs/tailwind": ^6.0.0
  firebase: ^11.0.0
```

```json
// sites/oriz-blog/package.json
{
  "dependencies": {
    "astro": "catalog:",
    "firebase": "catalog:"
  }
}
```

Single source of truth for the version. Bump it once in the catalog,
every site picks it up on the next install.

## Exceptions

A dep may be pinned to a specific version when (and only when):

1. **Astro 6** has known peer-dependency ranges for adapters and
   integrations — pin those explicitly when the latest minor breaks
   compatibility.
2. **Firebase major versions** occasionally break the JS SDK API in
   ways the family hasn't migrated to yet — pin the working major
   until migration is scheduled.
3. **A documented incompatibility** (link the issue in the
   `package.json` adjacent to the pin, or in a `decisions/` file).

Every pin is a temporary measure with a planned exit. No pin is
allowed without a comment explaining why and when it goes away.

## Why this is a family rule

- **Security patches** ship in newer versions; old majors stop
  getting them.
- **Free-tier providers** sometimes deprecate old SDK versions and
  force a migration that may include card-on-file requirements.
- **Compounding upgrade pain** is real — putting off a bump for 18
  months means rewriting code, not editing it.

Staying current is cheap when you do it weekly. It is brutal when
you do it yearly. Pick weekly.

## Cross-refs

- [`use-pnpm.md`](./use-pnpm.md) — the package manager that enforces this
- [`never-hit-quotas.md`](../interaction/never-hit-quotas.md) — the bigger constraint this serves
- [`no-card-on-file.md`](../interaction/no-card-on-file.md) — why deprecated free tiers are a real risk
- [`../runbooks/clean-install.md`](../../runbooks/operations/clean-install.md) — first-install procedure
