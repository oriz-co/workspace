---
type: decision
title: omni-publish v0.1.2 follow-ups (deferred from v0.1.1)
description: "Five follow-ups deferred from @chirag127/omni-publish v0.1.1 \u2192\
  \ v0.1.2: per-repo per-day rate-limit cache (high), retry on transient 5xx (medium),\
  \ compile TS \u2192 dist/ for non-bundler consumers (medium), Hashnode tag _id resolution\
  \ (low), Threads single-user-token assumption validation (low)."
tags:
- decision
- package
- omni-publish
- followups
- v0-1-2
- technical-debt
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/packages/omni-publish-package
- decisions/architecture/general/revenue-channels-2026
---



# omni-publish v0.1.2 follow-ups

## Decision

Five items deferred from [`@chirag127/omni-publish`](./omni-publish-package.md) v0.1.1 land in v0.1.2. Listed by severity, highest first.

## 1. Per-repo per-day rate-limit cache — HIGH

**Problem.** v0.1.1 has no dedup of outgoing posts. A workflow re-run (manual `workflow_dispatch`, or a tag re-push) re-fires every adapter and re-posts to every platform. dev.to / Hashnode / Bluesky flag the duplicate as spam.

**Fix.** fs-based cache keyed by `(repo, platform, YYYY-MM-DD)`. Before each adapter call, check `~/.cache/omni-publish/<repo>/<platform>/<date>` — if file exists, skip. After successful post, touch the file. In CI, mount the cache dir as a GH Actions cache step keyed by `${{ github.repository }}-${{ github.run_id }}` — survives within a workflow run but not across re-runs of the same tag (which is desired behaviour; re-runs should NOT re-post).

Threshold for the cache: **max 1 auto-post per channel per day per repo** per [`revenue-channels-2026`](../general/revenue-channels-2026.md).

## 2. Retry on transient 5xx — MEDIUM

**Problem.** Auto adapters (dev.to / Hashnode / Bluesky / Mastodon / Threads) fail silently after one attempt on transient 5xx. A momentary blip on Hashnode = post lost.

**Fix.** Exponential backoff with 3 attempts (1s, 5s, 25s) on 5xx + network errors. 4xx is NOT retried (auth / validation errors are deterministic). After 3 failures, log to stderr + post a Telegram "post failed: <platform> <error>" message to the same drafts channel.

## 3. Compile TS → `dist/` for non-bundler consumers — MEDIUM

**Problem.** v0.1.1 ships raw `.ts` in `src/`. Node's `--experimental-strip-types` works only on Node 22+ with a flag; bundler-less consumers (a raw `node script.js`) can't import. Only the `.mjs` bin entry (`bin/omni-publish.mjs`) works universally.

**Fix.** Add a `tsc --build` step to release.yml that emits `dist/*.js` + `dist/*.d.ts`. Update `package.json` `exports` to point `import` at `./dist/index.js` and `types` at `./dist/index.d.ts`. Keep `src/` in the package for source-map / debug. Bin entry stays as-is (already plain ESM).

## 4. Hashnode `tags` may need `_id` resolution — LOW

**Problem.** v0.1.1 passes free-form tag strings to Hashnode's `publishPost` mutation. For NEW tags this auto-creates. For EXISTING tags, Hashnode rejects unless the `_id` is supplied.

**Fix.** Add a `getTagsBySlug` GraphQL query before publish, resolve known slugs to `_id`, leave unknown slugs as free-form. Cache the slug→`_id` map in `~/.cache/omni-publish/hashnode-tags.json`.

## 5. Threads `me` endpoint assumes single-user token — LOW

**Problem.** v0.1.1's Threads adapter calls `GET /me?access_token=$TOKEN` then publishes to that user's account. Works for a single-user PAT but not for multi-tenant tokens (which `omni-publish` may add later for OSS users).

**Fix.** Validate token shape on init; if multi-tenant, require explicit `THREADS_USER_ID` env var instead of resolving via `/me`. Document in README.

## Cross-refs

- Parent package decision → [[decisions/architecture/omni-publish-package]]
- Channel matrix using the package → [[decisions/architecture/revenue-channels-2026]]
