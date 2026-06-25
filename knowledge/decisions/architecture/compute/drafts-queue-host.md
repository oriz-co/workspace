---
type: decision
title: "Drafts queue host \u2014 private GitHub repo with Issues (replaces Telegram)"
description: Manual-post drafts queue lives in a private GitHub repo (chirag127/oriz-drafts)
  using GitHub Issues. omni-publish creates one issue per draft per platform with
  platform-labelled tags. Issue body is ready-to-paste copy + canonical URL + cover
  image URL. Close issue when manually posted; reopen if retry needed. Replaces Telegram
  (banned in India). Requires OMNI_DRAFTS_GH_PAT env var with repo scope.
tags:
- decision
- drafts
- queue
- github-issues
- replaces-telegram
- omni-publish
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/packages/omni-publish-package
- decisions/architecture/apps/omni-post-app-shape
- decisions/architecture/content/blog-cross-post-strategy
- rules/no-telegram-india-banned
---



# Drafts queue host

## The decision

The drafts queue for **manual-publish channels** (X, Reddit, LinkedIn, Medium) is a private GitHub repo `chirag127/oriz-drafts` using **GitHub Issues**. Replaces the previously-considered Telegram channel (banned in India per [[rules/no-telegram-india-banned]]).

## Mechanics

For every post `omni-publish` fans out:

1. Auto-channels (dev.to / Hashnode / Bluesky / Mastodon / Threads) → API call, done.
2. Manual-channels (X / Reddit / LinkedIn / Medium) → **one GH Issue per (post, platform)** in `chirag127/oriz-drafts`:
   - Title: `[platform:x] <post title>`
   - Labels: `platform:x` or `platform:reddit` or `platform:linkedin` or `platform:medium`
   - Body:
     - Ready-to-paste copy (AI-rewritten per platform conventions)
     - Canonical URL (`https://oriz.in/posts/...`)
     - Cover image URL
     - Hashtags / subreddit suggestions
     - Source post URL (for reference)
3. User opens the issue on phone or desktop, copies the body, pastes into the platform, closes the issue.
4. If a paste fails (rate limit, content policy, etc.) → reopen the issue with a comment explaining; `omni-publish` will retry on next tag if labelled `retry`.

## Why GH Issues not Telegram

Telegram is banned in India as of mid-2024. User cannot reliably receive Telegram bot messages.

GH Issues advantages:

- Already in the same auth context as the publishing workflow (chirag127 PAT)
- Mobile app + web UI both work in India
- Searchable history
- Labels = built-in per-platform filtering
- Closing an issue is the natural "I posted this" signal

## Env requirements

- `OMNI_DRAFTS_GH_PAT` — GitHub PAT with `repo` scope on the private `chirag127/oriz-drafts` repo. Stored at chirag127 org level secrets (`gh secret set OMNI_DRAFTS_GH_PAT --org chirag127 --visibility selected --repos oriz`).

## Read surface

The `omni-post-app` `/admin` dashboard reads this queue via the GH Issues API and renders it as a triage UI. See [[decisions/architecture/omni-post-app-shape]].

## Cross-refs

- Telegram-banned-India rule → [[rules/no-telegram-india-banned]]
- omni-publish package → [[decisions/architecture/omni-publish-package]]
- Dashboard reading this queue → [[decisions/architecture/omni-post-app-shape]]
- Cross-post strategy referencing this queue → [[decisions/architecture/blog-cross-post-strategy]]
