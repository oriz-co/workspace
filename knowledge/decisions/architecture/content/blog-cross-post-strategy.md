---
type: decision
title: "Blog cross-post strategy \u2014 daily post, omni-publish fan-out, GH Issues\
  \ drafts (not Telegram)"
description: "pages-blog-app posts daily to blog.oriz.in. omni-publish v0.1.1+ fans\
  \ out automatically to dev.to + Hashnode + Bluesky + Mastodon + Threads. Drafts\
  \ for manual channels (X, Reddit, LinkedIn, Medium) queue to GitHub Issues in private\
  \ chirag127/oriz-drafts repo \u2014 NOT Telegram (banned in India). Per-channel\
  \ AI rewrite via NVIDIA NIM primary + OpenRouter fallback. Canonical URL = oriz.in\
  \ on every channel for SEO."
tags:
- decision
- blog
- cross-post
- omni-publish
- seo
- ai-rewrite
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/packages/omni-publish-package
- decisions/architecture/general/revenue-channels-2026
- decisions/architecture/compute/drafts-queue-host
- decisions/policy/monetisation-channel-matrix
- rules/no-telegram-india-banned
---



# Blog cross-post strategy

## The flow

1. **Daily blog post** lands at `blog.oriz.in/posts/YYYY-MM-DD-slug` (Markdown commit to `pages-blog-app`).
2. Tag push (`v*`) fires `release.yml` → calls `@chirag127/omni-publish`.
3. Auto-publish to: **dev.to + Hashnode + Bluesky + Mastodon + Threads** (5 channels, all have working write APIs in 2026).
4. Manual-publish queue: **X (paid API) + Reddit (subreddit rules) + LinkedIn (weekly digest only) + Medium (deprecated tokens)** → drafts as GitHub Issues in private `chirag127/oriz-drafts` repo, labelled `platform:x` / `platform:reddit` / `platform:linkedin` / `platform:medium`.
5. Per-channel AI rewrite: title + body adapted per platform (length, tone, hashtag conventions) via [NVIDIA NIM](https://build.nvidia.com) primary + [OpenRouter free models](https://openrouter.ai) fallback on 429/5xx.

## Canonical URL discipline

**Every channel sets `canonical_url = https://oriz.in/posts/...`** (or whatever the original post URL is on the blog). dev.to, Hashnode, Medium all honour `<link rel="canonical">`. Bluesky/Mastodon/Threads include the canonical URL in the post body.

Why: Google de-dupes by canonical, attributes ranking to `oriz.in`, mirrors are "syndicated" not "duplicate content".

## Drafts queue replaces Telegram

Telegram is banned in India. User cannot reliably access Telegram bots. Drafts go to **GitHub Issues in a private repo** (`chirag127/oriz-drafts`). Full mechanics in [[decisions/architecture/drafts-queue-host]] + [[rules/no-telegram-india-banned]].

## Channel matrix link

The full monetisation + posting rules per channel live in [[decisions/policy/monetisation-channel-matrix]]. This file is the cross-post SHAPE; the matrix is the per-channel revenue + ethics rules.

## Cross-refs

- omni-publish parent → [[decisions/architecture/omni-publish-package]]
- Revenue channels 2026 → [[decisions/architecture/revenue-channels-2026]]
