---
type: decision
title: "Revenue channels 2026 \u2014 every product fans out to every viable channel\
  \ via omni-publish"
description: "Every product surface in the chirag127/oriz family (26 apps + 17 packages\
  \ + 5 books + future browser-/VS-Code-extensions + CLIs + MCP servers) auto-publishes\
  \ to as many revenue channels as 2026's API reality allows. Orchestrated by @chirag127/omni-publish\
  \ on every tag push. AI copy via NVIDIA NIM primary + OpenRouter free-models fallback.\
  \ Drafts for manual-only platforms (X, Reddit, LinkedIn, Medium \u2014 all dead/closed\
  \ APIs in 2026) land in a single Telegram channel split into 4 sections. Rate-limit\
  \ ceiling: 1 auto-post per channel per day per repo."
tags:
- decision
- revenue
- monetisation
- distribution
- omni-publish
- ai-copy
- nvidia-nim
- openrouter
- automation
- channels
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- architecture/packages/the-23-packages
- decisions/architecture/general/mit-license-all-repos
- decisions/architecture/frontend/pwabuilder-as-primary-converter
- decisions/architecture/general/cross-post-engine
- decisions/architecture/packages/omni-publish-package
- decisions/architecture/packages/packages-oriz-in-catalog
- decisions/architecture/content/book-publish-pipeline
---



# Revenue channels 2026 — fan-out via omni-publish

## Decision summary

Every product the family ships — **26 apps + 17 packages + 5 books + future browser/VS Code extensions + CLIs + MCP servers** — auto-publishes to **as many revenue channels as 2026's API reality allows**. Generated and orchestrated by [`@chirag127/omni-publish`](../packages/omni-publish-package.md) on every tag push (`v*.*.*`) in every repo. AI-generated platform-specific copy uses **NVIDIA NIM** (primary, free 5K req/mo) with **OpenRouter free models** as quota-failure fallback. Channels with dead 2026 APIs (Reddit OAuth closed, X free-tier no public writes, LinkedIn /v2 sunset, Medium tokens deprecated) drop into a single Telegram drafts channel with 4 sections, not auto-posted.

## Channel matrix per surface type

### Web app (subdomain on `*.oriz.in`)

| Channel | URL | 2026 API status | Revenue | Cut |
|---|---|---|---|---|
| oriz.in subdomain | own | Auto (CF Pages deploy) | AdSense + affiliate + Razorpay/LemonSqueezy | 0% platform |
| Google Play (PWA via PWABuilder TWA) | play.google.com | Auto via `r0adkll/upload-google-play` | In-app billing | 15% (small-biz tier) |
| Microsoft Store (PWA via PWABuilder MSIX) | apps.microsoft.com | Manual first publish; auto updates | Microsoft Commerce (where enabled) | 12% |
| Chrome Web Store (for PWA bookmarklet helpers if any) | chrome.google.com/webstore | Auto via `chrome-webstore-upload-cli` after first manual listing | Free / paid extension | 5% |
| Product Hunt | producthunt.com | [No public submit API since 2023](https://api.producthunt.com/v2/docs) | Indirect (traffic) | n/a |
| Hacker News (Show HN) | news.ycombinator.com | No API; manual post | Indirect | n/a |
| dev.to (release blog) | dev.to | Auto via REST API | Indirect | n/a |
| Hashnode (release blog) | hashnode.com | Auto via GraphQL | Indirect | n/a |
| Bluesky (announcement) | bsky.app | Auto via AT Protocol | Indirect | n/a |
| Mastodon (announcement) | mastodon.social et al | Auto via REST | Indirect | n/a |
| Telegram (channel post) | t.me | Auto via Bot API | Indirect | n/a |

### npm package

| Channel | URL | 2026 API status | Revenue | Cut |
|---|---|---|---|---|
| npm registry | npmjs.com | Auto via `npm publish` | None directly | 0% |
| GitHub Packages | ghcr.io / npm.pkg.github.com | Auto via `npm publish --registry` | None | 0% |
| jsr.io (Deno + universal) | jsr.io | Auto via `jsr publish` (free, no auth-card) | None | 0% |
| packages.oriz.in catalog | own | Auto rebuild on `repository_dispatch` | Indirect (traffic → app subdomains) | 0% |
| dev.to + Hashnode release post | as above | Auto | Indirect | n/a |
| Bluesky + Mastodon announcement | as above | Auto | Indirect | n/a |
| Awesome lists (manual PR) | github.com/sindresorhus/awesome | [No API — manual PR](https://github.com/sindresorhus/awesome/blob/main/contributing.md) | Indirect | n/a |

### Book

See full pipeline in [book-publish-pipeline.md](../content/book-publish-pipeline.md). Summary row here:

| Channel | URL | 2026 API status | Revenue | Cut |
|---|---|---|---|---|
| Leanpub (Markua git push) | leanpub.com | Auto via git push to manuscript branch | [80% royalty - 50¢/sale](https://leanpub.com/help/author_help#section-royalty) | 20% + 50¢ |
| Gumroad | gumroad.com | Auto via REST API | 10% flat (Gumroad fee) | 10% |
| LemonSqueezy | lemonsqueezy.com | Auto via REST API; MoR handles VAT | 5% + 50¢ | 5%+50¢ |
| Draft2Digital (aggregator → B&N/Kobo/Apple/Scribd) | draft2digital.com | [No API — manual upload](https://www.draft2digital.com/help/) | ~60% net royalty (channel-dependent) | varies |
| Amazon KDP | kdp.amazon.com | [No public API ever existed](https://kdp.amazon.com/community/help/topic-list) — browser-uploader bot or manual | 70% (in $2.99-$9.99 range) | 30% |
| Google Play Books Partner Center | play.google.com/books/publish | Manual upload (ISBN-recommended); [no automated publish API](https://support.google.com/books/partner) | 70% | 30% |

### Extension (browser + VS Code)

| Channel | URL | 2026 API status | Revenue | Cut |
|---|---|---|---|---|
| Chrome Web Store | chrome.google.com/webstore | Auto after first manual listing | Paid extension (5% Google fee where applicable) | 5% |
| Firefox Add-ons (AMO) | addons.mozilla.org | Auto via `web-ext sign` | Free only (no built-in payments) | n/a |
| Microsoft Edge Add-ons | microsoftedge.microsoft.com/addons | Auto via `edge-add-on-action` | Free only | n/a |
| VS Code Marketplace | marketplace.visualstudio.com | Auto via `vsce publish` | Free; sponsor link allowed | n/a |
| Open VSX (JetBrains, Cursor, etc.) | open-vsx.org | Auto via `ovsx publish` | Free | n/a |
| GitHub Releases (sideload installer) | github.com/<repo>/releases | Auto via `gh release create` | Direct purchase via Gumroad/LemonSqueezy link in README | 0% |

## Dead in 2026 — do NOT propose

Documented because earlier prompts kept suggesting these:

- **Reddit OAuth** — closed June 2026; the third-party API access tier was wound down after the [2023 API pricing war](https://www.theverge.com/2023/4/18/23688463/reddit-developer-api-terms-change-monetization-apollo) escalated to full closure for non-Reddit-app accounts.
- **X API free tier** — [no public writes for free accounts](https://developer.x.com/en/docs/x-api/getting-started/about-x-api) since 2023; "Basic" tier is $100+/mo (paid → fights `no-card-on-file`).
- **LinkedIn /v2** — sunset; restricted to Marketing Developer Platform partners only.
- **Medium integration tokens** — [deprecated 2023, still partly works but unreliable](https://github.com/Medium/medium-api-docs); ship-day surprises common.
- **Amazon KDP API** — [never existed publicly](https://kdp.amazon.com/community/help/topic-list); only Amazon Marketing Stream + KDP Publisher tools.
- **Apple iBooks Author** — replaced by Pages, Mac-only, no Linux path (per `linux-ci-only` rule).

These are listed so future prompts can recognise them as dead ends without re-grilling.

## Manual-platform queue → Telegram drafts channel

For X / Reddit / LinkedIn / Medium where automation is gone, omni-publish generates ready-to-paste drafts on every tag push and posts them to **one Telegram channel** (`TELEGRAM_DRAFTS_BOT_TOKEN` + `TELEGRAM_DRAFTS_CHAT_ID`) split into 4 sections by hashtag:

- `#draft-x` — 280-char teaser + URL + 2-3 hashtags
- `#draft-reddit` — title (≤300 chars) + body (markdown) + suggested subreddit list
- `#draft-linkedin` — long-form post (3-paragraph, line-broken) + URL
- `#draft-medium` — full canonical article with `<!-- canonical: <url> -->` first-line comment

User copy-pastes each to its platform when convenient. No automation lies = no shadow-ban risk = no broken-link claims.

## AI copy generation

Platform-specific copy (dev.to title vs Bluesky 300-char teaser vs LinkedIn 3-paragraph) is generated, not hand-written.

- **Primary**: [NVIDIA NIM](https://build.nvidia.com) — 5,000 requests/month free, no card required, models include `meta/llama-3.3-70b-instruct` + `nvidia/llama-3.1-nemotron-70b-instruct`. Env: `NVIDIA_NIM_API_KEY`.
- **Fallback**: [OpenRouter](https://openrouter.ai) free models — `meta-llama/llama-3.3-70b-instruct:free` + `deepseek/deepseek-r1:free`. Env: `OPENROUTER_API_KEY`. Free tier ~50 requests/day per model; aggregate ~100/day across both.

omni-publish picks NIM by default; falls back to OpenRouter on HTTP `429` or `5xx`. If both fail, the platform's row goes to the Telegram drafts channel with a `[ai-fallback-needed]` tag instead of being skipped silently.

## Rate limit ceiling

Max **1 auto-post per channel per day per repo**. Prevents:

- dev.to spam flag (their rule: ≤3 posts/24h per account; we stay well under)
- Hashnode flag (similar)
- Bluesky rate-limit (300 events/h account-wide)
- Mastodon instance soft-bans for new accounts

omni-publish keeps a JSON state file at `~/.config/oriz/omni-publish-state.json` (CI: artifact across runs via cache) tracking last-post timestamp per `(channel, repo)`. Tag pushes that violate the ceiling are deferred to next-day cron rerun.

## Trigger

Every repo's `.github/workflows/release.yml` calls the omni-publish reusable workflow on tag push matching `v*.*.*`:

```yaml
on:
  push:
    tags: ['v*.*.*']
jobs:
  cross-post:
    uses: chirag127/omni-publish-npm-pkg/.github/workflows/cross-post.yml@main
    with:
      title: "${{ github.event.head_commit.message }}"
      body_path: "RELEASE_NOTES.md"
      canonical_url: "https://github.com/${{ github.repository }}/releases/tag/${{ github.ref_name }}"
      type: "app"  # or package | book | extension
    secrets: inherit
```

## Trigger payload

| Field | Required | Used by |
|---|---|---|
| `title` | yes | All channels |
| `body` (or `body_path`) | yes | Long-form channels (dev.to, Hashnode, Medium draft) |
| `canonical_url` | yes | All channels (sets `<link rel="canonical">` where supported) |
| `type` | yes | `app` \| `package` \| `book` \| `extension` — selects which channel matrix applies |

The `type` field determines which row-set from the matrix above fires. A package release never tries Play Store; a book release never tries npm.

## The 5 first books

Status: **planning** (none have manuscripts yet). Locked names + scope in [book-publish-pipeline.md](../content/book-publish-pipeline.md):

1. **Oriz Stack** — Astro 6 + Cloudflare + Firebase Spark family architecture (technical, $19/$39)
2. **Oriz Paisa: Credit Cards India 2026** — cards-app companion (Indian finance, ₹499/₹999)
3. **Oriz PDF: From Browser to Native** — PWA → PWABuilder → Play Store walkthrough ($14)
4. **Oriz Janaushdhi: Generic Medicines India** — janaushdhi-app companion (public health, ₹299)
5. **Oriz Me: 100-Year Strategy** — personal essays from `oriz-cs-me-app` + 100-year-strategy doc ($9 PWYW)

## Cross-refs

- The 17 packages this catalog covers → [[architecture/the-23-packages]]
- The MIT relicense that unlocks free-for-OSS distribution perks → [[decisions/architecture/mit-license-all-repos]]
- The PWA → native pipeline behind Play / Microsoft Store rows → [[decisions/architecture/pwabuilder-as-primary-converter]]
- The blog-post fan-out engine → [[decisions/architecture/cross-post-engine]]
- The npm package that orchestrates this → [[decisions/architecture/omni-publish-package]]
- The catalog hub at packages.oriz.in → [[decisions/architecture/packages-oriz-in-catalog]]
- Full book pipeline → [[decisions/architecture/book-publish-pipeline]]
