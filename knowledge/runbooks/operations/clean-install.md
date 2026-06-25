---
type: runbook
title: "Clean install \u2014 bootstrap the entire family on a fresh machine"
description: One git clone --recursive + one pnpm install loop and the whole family
  is running locally. New developers get a working dev environment in under 10 minutes;
  pnpm's global store keeps disk usage flat across 11+ sites.
tags:
- runbook
- install
- bootstrap
- pnpm
- submodules
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- rules/development/use-pnpm
- rules/development/always-latest-deps
- rules/development/repos-work-independently
---



# Clean install — bootstrap the entire family on a fresh machine

## Goal

A brand-new developer (or a fresh CI runner, or the user on a new
laptop) can get the full `oriz/` family running locally with one
recursive clone + one bootstrap loop. Everything pnpm-installable on
the system, no per-site manual setup.

## Prerequisites

- **git** ≥ 2.40 (for `--recursive` clone behaviour)
- **Node** ≥ 22 (LTS) — `node --version` to verify
- **pnpm** via Corepack (preferred over a global npm install):

  ```bash
  corepack enable
  corepack prepare pnpm@latest --activate
  pnpm --version   # should print the latest pnpm
  ```

- A populated `~/.pnpm-store/` is fine to keep across re-installs;
  this is the whole point of pnpm — see
  [`../rules/use-pnpm.md`](../../rules/development/use-pnpm.md).

## Steps

```bash
# 1. Clone the umbrella with every submodule populated in one shot
git clone --recursive https://github.com/chirag127/oriz.git
cd oriz

# 2. Install all dependencies. pnpm reuses ~/.pnpm-store globally,
#    so 11+ sites share one on-disk copy of each package version.

# Option A — when a root pnpm-workspace.yaml exists:
pnpm install --recursive

# Option B — when each submodule is its own pnpm root (no umbrella workspace):
for dir in sites/* packages/* apps/api; do
  if [ -f "$dir/package.json" ]; then
    (cd "$dir" && pnpm install --prefer-offline)
  fi
done
```

The `--prefer-offline` flag tells pnpm to use the local store first
and only hit the registry for missing entries. After the first site
installs, every subsequent site reuses ~80-90% of its deps from the
store.

## Verification

After install completes, every submodule should typecheck and build
in isolation:

```bash
# Typecheck every workspace
pnpm -r exec pnpm typecheck

# Or, if no root workspace, loop:
for dir in sites/* packages/*; do
  if [ -f "$dir/package.json" ]; then
    echo "=== $dir ==="
    (cd "$dir" && pnpm typecheck) || exit 1
  fi
done
```

A green run across every submodule confirms the bootstrap worked.
Spot-check by running `pnpm dev` in one site and opening the printed
localhost URL.

## Troubleshooting

**A submodule directory exists but is empty.**
The recursive clone didn't fully populate. Run:

```bash
git submodule update --init --recursive
```

then re-run the install loop. This is also the fix when someone
cloned without `--recursive` originally.

**`pnpm: command not found` after `corepack enable`.**
Corepack shims are in a path the current shell hasn't picked up.
Open a new terminal, or `hash -r` (bash/zsh), or run pnpm via
`corepack pnpm <args>` until the next shell.

**`ERR_PNPM_PEER_DEP_ISSUES` on a specific site.**
A peer dep is out of range. Check
[`../rules/always-latest-deps.md`](../../rules/development/always-latest-deps.md)
for the pin policy — the site may be in a documented exception
window during a major upgrade.

**Disk usage looks wrong (e.g. 11× Astro on disk).**
pnpm fell back to copy mode instead of hardlinks. Check the
filesystem — Windows on non-NTFS, or `~/.pnpm-store` on a different
volume from the project, both force copies. Move the store to the
same volume as the projects, or accept the cost.

**A submodule fails standalone but works from the umbrella.**
That's a violation of
[`../rules/repos-work-independently.md`](../../rules/development/repos-work-independently.md).
File-fix in the offending submodule, don't paper over it in the
umbrella.

## Cross-refs

- [`../rules/use-pnpm.md`](../../rules/development/use-pnpm.md) — why pnpm is mandatory
- [`../rules/always-latest-deps.md`](../../rules/development/always-latest-deps.md) — install policy this runbook presumes
- [`../rules/repos-work-independently.md`](../../rules/development/repos-work-independently.md) — every submodule passes the standalone-clone test
- [`./auth-setup.md`](../security/auth-setup.md) — what to run after install for full local dev with auth
- [`../_okf.md`](../../_okf.md) — OKF conventions
