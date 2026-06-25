---
type: runbook
title: Install + bootstrap the umbrella workspace
description: The chirag127/oriz family is one umbrella git repo that submodules every
  site, app, package, API, extension, and skill. The user always works from `c:/D/oriz/`.
  This runbook is the canonical fresh-clone and existing-clone-update procedure.
tags:
- runbook
- install
- workspace
- pnpm
- submodule
- bootstrap
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- rules/development/use-pnpm
- architecture/ops/submodule-pattern
- architecture/ops/repo-layout
---



# Install + bootstrap the umbrella workspace

## When to use

You're a human or agent landing in this repo for the first time, OR your existing clone is out of date. The umbrella repo (`chirag127/workspace`, cloned at `c:/D/oriz/`) is a meta-repo containing dozens of git submodules — sites, apps, packages, APIs, extensions, skills.

**Golden rule:** the user always works from `c:/D/oriz/`. Never `cd` into a submodule for install / dev / test commands; always run them from master with `pnpm -F <name>` or `pnpm -r`.

## Fresh clone

```bash
git clone --recurse-submodules https://github.com/chirag127/workspace c:/D/oriz
cd c:/D/oriz
pnpm install -r
```

That's it. `--recurse-submodules` clones every submodule. `pnpm install -r` recursively installs every package in the pnpm workspace defined by [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml) with hoisted deps and a single shared `node_modules/`.

## Existing clone update

```bash
cd c:/D/oriz
git pull
git submodule update --init --recursive --remote
pnpm install -r
```

`--remote` pulls each submodule to its remote `main`'s latest, not just the SHA recorded in the master pointer. Use `git submodule update --init --recursive` (without `--remote`) to pin to the recorded master pointer SHAs instead. Default to `--remote` when picking up new work; pin to recorded SHAs only when you specifically want the master's frozen state.

## Run any app

```bash
# from c:/D/oriz/ — never from inside the submodule
pnpm -F <package.json#name> dev
pnpm -F <package.json#name> build
pnpm -F <package.json#name> test
```

The `<package.json#name>` is the `"name"` field of the app's `package.json` (e.g., `@chirag127/oriz-pdf-tools`). Use the npm name, NOT the folder slug.

## Run all apps or all packages in parallel

```bash
pnpm -r --parallel dev          # every app in dev mode (rare; usually one at a time)
pnpm -r build                   # build every workspace member
pnpm -r --parallel test         # test everything in parallel
pnpm -r --parallel typecheck    # typecheck everything in parallel
```

## After adding a new submodule

```bash
cd c:/D/oriz
git submodule add --name "projects_<category>_<slug>" \
  "https://github.com/chirag127/<slug>.git" \
  "repos/<category>/<slug>"
git commit -m "feat: add <slug> as submodule"
pnpm install -r
```

`pnpm-workspace.yaml` already includes glob patterns for every category dir, so a new submodule auto-joins the workspace if it sits in one of these:

- `repos/oriz/own/lib/npm/*`
- `repos/oriz/own/prod/apps/hub/*`, `apps/personal/*`, `apps/content/*`, `apps/tools/*`
- `repos/oriz/own/svc/api/*`
- `repos/oriz/own/prod/bs-ext/*`, `ide-extensions/*`, `mcp-servers/*`, `skills/*`

If you add a new category, also update [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml).

## After landing changes inside a submodule

```bash
cd c:/D/oriz/repos/<category>/<slug>
# ... make changes, commit, push to its own repo's main ...

# Back at master, bump the submodule pointer
cd c:/D/oriz
git add repos/<category>/<slug>
git commit -m "chore: bump <slug> submodule pointer"
git push
```

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `pnpm install` fails with `Cannot find module '@chirag127/<name>'` | Submodule not initialised | `git submodule update --init --recursive --remote` |
| Submodule folder is empty | `--recurse-submodules` not used during clone | Run the existing-clone update steps above |
| `Failed to resolve workspace dependency` | New submodule not in `pnpm-workspace.yaml` globs | Add the dir glob to `pnpm-workspace.yaml`, rerun `pnpm install -r` |
| `git status` shows uncommitted submodule changes | Working inside a submodule edited it | `cd <submodule> && git status` to see; commit there first, then bump pointer at master |
| Windows: `Device or resource busy` on `rm -rf <submodule-dir>` | VS Code / editor has a file handle open | Close the IDE on that dir, OR `git rm --cached <path>` + delete from disk next session |

## Cross-refs

- Why pnpm specifically → [[rules/use-pnpm]]
- Submodule semantics → [[architecture/submodule-pattern]]
- Repo layout → [[architecture/repo-layout]]
- Master pointer as production SHA → [[architecture/master-pointer-as-production-sha]]
