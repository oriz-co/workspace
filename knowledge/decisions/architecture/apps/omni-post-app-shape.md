---
type: decision
title: "omni-post-app shape \u2014 admin dashboard for the omni-publish package"
description: omni-post.oriz.in wraps the @chirag127/omni-publish package with an admin
  dashboard. /admin shows the pending GH Issues drafts queue, cross-post history per
  platform, retry-per-platform controls, and edit-before-publish UI. Public root (/)
  is a read-only 'where I post' catalog. /admin is Firebase Auth + admin-email allowlist
  gated.
tags:
- decision
- app
- omni-post
- omni-publish
- admin-dashboard
- auth-gated
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/packages/omni-publish-package
- decisions/architecture/content/blog-cross-post-strategy
- decisions/architecture/compute/drafts-queue-host
- decisions/architecture/apps/cs-me-app-scope
---



# omni-post-app shape

## Two surfaces, one app

### `omni-post.oriz.in/` — public

Read-only catalog. "Where I post" list: every channel the oriz family auto-publishes to (dev.to / Hashnode / Bluesky / Mastodon / Threads / Medium / X / Reddit / LinkedIn / Substack). One card per channel: handle, last-post timestamp, post count, profile URL. Useful for readers who want to follow on their preferred platform.

### `omni-post.oriz.in/admin` — auth-gated dashboard

| Panel | What it does |
|---|---|
| Pending drafts queue | Reads GH Issues from `chirag127/oriz-drafts` (per [[decisions/architecture/drafts-queue-host]]); lists by label `platform:*` |
| Cross-post history | Per platform: last N posts, success/failure status, response URLs |
| Retry per platform | Manual re-fire of a failed adapter (after rate-limit cache cleared) |
| Edit-before-publish UI | For drafts (manual channels): rewrite copy, attach image, mark "posted" → closes the GH issue |

## Auth

`/admin` requires Firebase Auth sign-in + admin-email allowlist. Allowlist is a constant in `src/lib/admins.ts` (single source: the user's primary email + one backup). No multi-tenant — this is a single-user tool.

## Wraps `@chirag127/omni-publish`

The app is a UI shell; all platform logic lives in the package. The app calls the package's adapter functions for retry and history-fetch.

## Why an app at all (not just CLI)

The package alone covers automated publishing. The dashboard exists for:

- Surfacing the **manual-channel drafts queue** (otherwise GH Issues is the only UI, which is fine for occasional use but bad for daily triage)
- Edit-before-publish — better as a rich textarea + image picker than as `gh issue edit`
- At-a-glance health check ("did anything fail in the last day?")

## Cross-refs

- The package being wrapped → [[decisions/architecture/omni-publish-package]]
- The drafts queue read source → [[decisions/architecture/drafts-queue-host]]
- Personal site uses similar Firebase Auth + admin allowlist → [[decisions/architecture/cs-me-app-scope]]
