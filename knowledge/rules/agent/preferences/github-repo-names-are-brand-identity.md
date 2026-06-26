---
type: rule
title: "GitHub repo names are brand identity"
description: "When forced to choose between renaming a GitHub repo vs renaming a local folder, rename the folder. GitHub repo names = brand identity."
tags: [feedback, agent-preferences, naming, branding]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
---

When a name collision forces a rename, prefer to rename the **local folder / category** over the GitHub repo.

**Captured:** 2026-06-25, during fleet nest-by-category. The `packages` repo (catalog app at packages.oriz.in) collided with `packages/` category dir holding 23 npm packages. Offered to rename the app's GitHub repo to `packages-catalog`; user picked rename-the-folder (`npm-packages/`) instead.

**Why this matters:**
- GitHub repo names appear in URLs (`github.com/oriz-org/<slug>`), badges, npm registries, redirect histories, package.json `repository` fields, and external references. Renaming creates legacy redirects forever.
- Local folder paths are private to the maintainer's machine. Verbose nesting (e.g. `repos/npm-packages/`) is cheap; renaming a public-facing slug is expensive.
- Subdomain (`packages.oriz.in`) is the brand for end users. Local folder layout is the brand for nobody.

**How to apply:**
- Collision between GitHub repo name and category folder name → rename folder, keep repo name.
- Tolerate verbose folder names (`npm-packages/`, not `npm/`).
- Avoid synonym-tax in repo names (don't rename `packages` → `packages-catalog` just to free a folder slot).

**Related:** [`fs-nested-when-large-flat-when-small`](./fs-nested-when-large-flat-when-small.md), [`repo-names-drop-oriz-prefix`](../../../decisions/architecture/branding/repo-names-drop-oriz-prefix.md), [`repo-slug-suffix-npm-pkg`](./repo-slug-suffix-npm-pkg.md).
