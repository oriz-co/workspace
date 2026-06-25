---
type: runbook
title: Rename a repo to its role-suffixed slug
description: Step-by-step procedure to rename a chirag127/oriz* repo to its correct
  role-suffixed slug (-site / -ext / -vsc-ext / -cli / -worker / -fn / -data). Updates
  .gitmodules, syncs submodules, bumps the master pointer, and refreshes package.json
  + README badges.
tags:
- runbook
- git
- submodule
- rename
- naming
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- decisions/branding/repo-naming-suffixes
- rules/development/repo-naming
- rules/no-push-without-say-so
- runbooks/operations/bump-submodule-pointer
---



# Rename a repo to its role-suffixed slug

> Run from the master `chirag127/oriz` repo root (`/c/D/oriz`).
> The user must authorise the push at step 8 — see
> [`no-push-without-say-so.md`](../../rules/no-push-without-say-so.md).

## Prerequisites

- `gh` CLI authenticated against `chirag127`.
- The target name follows the suffix table in
  [`decisions/branding/repo-naming-suffixes.md`](../../decisions/branding/repo-naming-suffixes.md)
  (e.g. `oriz-blog` → `oriz-blog-site`).
- Working tree clean in master and in the submodule.

## Steps

### 1. Rename the repo on GitHub

```bash
gh repo rename <new-name> --repo chirag127/<old-name>
```

`gh repo rename` automatically sets up the GitHub redirect from the
old URL to the new one, so existing clones keep working — but only
after this command runs. Do not push commits to the *old* URL after
the rename: they'll redirect to the new URL but the local remote
still says the old name until step 3.

### 2. Update `.gitmodules` in master

Edit `/c/D/oriz/.gitmodules`. Change the `url` line for the renamed
submodule to the new GitHub URL. Leave the `path` unchanged — it
stays `sites/oriz-<name>` (no `-site` suffix on the local path) per
[`decisions/branding/repo-naming-suffixes.md`](../../decisions/branding/repo-naming-suffixes.md).

```ini
[submodule "sites/oriz-<name>"]
    path = sites/oriz-<name>
    url = https://github.com/chirag127/oriz-<name>-site.git
```

### 3. Sync the submodule's git config

```bash
cd /c/D/oriz
git submodule sync sites/oriz-<name>
```

This rewrites `sites/oriz-<name>/.git/config` so the submodule's
`origin` remote points at the new URL.

Verify:

```bash
git -C sites/oriz-<name> remote -v
# origin  https://github.com/chirag127/oriz-<name>-site.git (fetch)
# origin  https://github.com/chirag127/oriz-<name>-site.git (push)
```

### 4. Update `package.json` `repository.url`

Inside the submodule:

```bash
cd sites/oriz-<name>
# edit package.json — set "repository": { "type": "git", "url": "https://github.com/chirag127/oriz-<name>-site.git" }
# bump version (patch) so the rename ships in a release
pnpm version patch --no-git-tag-version
```

### 5. Update README badges

Open `sites/oriz-<name>/README.md` and replace any `chirag127/oriz-<name>`
references with `chirag127/oriz-<name>-site`:

- shields.io badges (CI, license, last commit)
- "Clone" / "Fork" instruction lines
- Any direct GitHub permalinks

```bash
# sanity check — should print zero hits after edit
grep -n "chirag127/oriz-<name>\b" sites/oriz-<name>/README.md
```

### 6. Commit inside the submodule

```bash
cd /c/D/oriz/sites/oriz-<name>
git add package.json README.md
git commit -m "chore(rename): repo renamed to oriz-<name>-site"
```

### 7. Bump the master pointer

Per [`bump-submodule-pointer.md`](./bump-submodule-pointer.md):

```bash
cd /c/D/oriz
git add .gitmodules sites/oriz-<name>
git commit -m "chore(submodule): bump oriz-<name> after rename to -site suffix"
```

### 8. Push (user say-so required)

After the user explicitly authorises the push:

```bash
# push the submodule first
git -C sites/oriz-<name> push origin main

# then master
git push origin main
```

### 9. Update the Cloudflare Pages project (if site repo)

The Cloudflare Pages project's GitHub link still points at the old
repo name. Cloudflare auto-follows the GitHub redirect, but to keep
the dashboard tidy:

1. Open <https://dash.cloudflare.com> → Workers & Pages → the project.
2. Settings → Build & deployments → Disconnect.
3. Reconnect to `chirag127/oriz-<name>-site`.
4. Verify the next deploy still hits `<name>.oriz.in`.

### 10. Smoke test

```bash
gh repo view chirag127/oriz-<name>-site         # confirms new URL resolves
gh repo view chirag127/oriz-<name>              # should redirect / show new URL
```

## Why this order

`gh repo rename` first establishes the GitHub redirect; if you
`.gitmodules` first then push, the push goes to a URL that doesn't
exist yet. The submodule sync (step 3) rewrites *only* git config —
it does not touch the working tree, so it's safe to run before the
inner-repo edits in step 4.

## See also

- [`decisions/branding/repo-naming-suffixes.md`](../../decisions/branding/repo-naming-suffixes.md) — what name to pick
- [`rules/repo-naming.md`](../../rules/development/repo-naming.md) — the audit-before-publish rule
- [`bump-submodule-pointer.md`](./bump-submodule-pointer.md) — the underlying pointer-bump flow
- [`../rules/no-push-without-say-so.md`](../../rules/no-push-without-say-so.md)
