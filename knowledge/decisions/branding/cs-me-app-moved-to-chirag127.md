---
type: decision
title: "oriz-cs-me-app moved from oriz-org → chirag127, renamed cs-me-app"
description: "The personal-site app cs-me-app is moved out of the brand org to chirag127/* because it doesn't use the brand's central auth (only puter.js, not auth.oriz.in). Slug drops the oriz- prefix to clearly read as a personal repo. On-disk path becomes projects/c127/own/prod/apps/personal/cs-me-app/."
tags: [branding, github, transfer, personal, cs-me-app, identity]
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
  - decisions/architecture/projects-owner-own-forks-layout
  - decisions/architecture/cs-me-app-scope
  - decisions/branding/oriz-org-rename-from-co
  - rules/recruiter-strategy
---

# oriz-cs-me-app → chirag127/cs-me-app

## Decision

The personal-site app currently at `oriz-org/oriz-cs-me-app` is
transferred to the personal account as `chirag127/cs-me-app`. The
on-disk submodule path changes to
`projects/c127/own/prod/apps/personal/cs-me-app/`.

## Why move it off the brand org

The app is the user's personal homepage (`me.oriz.in` /
`cs.oriz.in`). It has none of the brand-app shared infrastructure:

- **No central auth** — uses only puter.js client-side auth, not
  the brand's `auth.oriz.in` flow
- **No shared org secrets dependency** — the org's 61 shared
  secrets aren't needed by this app
- **No `oriz-` brand prefix purpose** — the repo is one person's
  homepage, not a brand product

Keeping it under the brand org dilutes the org's signal ("these are
the oriz.in products") and confuses recruiters who land on the org
expecting to see only brand work.

## Why drop the `oriz-` prefix

The slug `oriz-cs-me-app` carries brand connotation. Once the repo
is owned by the personal account, the `oriz-` prefix is misleading.
New slug `cs-me-app` reads as "my (cs = chirag singhal) me-app" with
no brand claim.

## What changes

1. `gh repo transfer oriz-org/oriz-cs-me-app chirag127`
2. `gh repo rename chirag127/oriz-cs-me-app cs-me-app` (after transfer)
3. `.gitmodules` URL: `https://github.com/oriz-org/oriz-cs-me-app.git`
   → `https://github.com/chirag127/cs-me-app.git`
4. `.gitmodules` path: `projects/oriz/own/prod/apps/personal/oriz-cs-me-app` →
   `projects/c127/own/prod/apps/personal/cs-me-app`
5. The `me.oriz.in` and `cs.oriz.in` DNS records stay on Cloudflare
   Pages; the Pages project re-binds to the chirag127-owned repo
6. The per-app knowledge bundle at
   `projects/c127/own/prod/apps/personal/cs-me-app/knowledge/`
   travels with the repo (it's inside the submodule)

## What does NOT change

- The app's runtime — still Astro on Cloudflare Pages
- Auth — still puter.js (no migration to brand auth)
- Domain bindings — `me.oriz.in` + `cs.oriz.in` still both alias here
- The app's content, history, and stars
- The MIT license

## Why this is a one-way move (not a redirect-only)

Per the brand-vs-personal split (see
[`projects-owner-own-forks-layout`](../architecture/projects-owner-own-forks-layout.md)
and [`rules/recruiter-strategy`](../../rules/recruiter-strategy.md)),
the personal account needs ~5–10 real repos to look alive. This is
one of them. GitHub's transfer creates a redirect from the old org
URL automatically, so external links don't break.

## Pre-move sanity check

Before transferring, confirm:

- [ ] No CI workflow references `oriz-org/oriz-cs-me-app` by slug
  (search `.github/workflows/` across the family)
- [ ] No package.json `repository` field points to oriz-org for this app
- [ ] No knowledge file links to `oriz-org/oriz-cs-me-app` (sed-replace)
- [ ] No Cloudflare Pages project is bound by the old slug — re-bind
  after the rename
