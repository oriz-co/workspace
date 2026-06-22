---
type: decision
title: "@chirag127/omni-publish package — auto-blog releases to 8+ platforms"
description: "New npm package @chirag127/omni-publish handles auto-publishing release notes / blog posts to dev.to + hashnode + medium + X + LinkedIn + Bluesky + Mastodon + Reddit on tag push or release create. Triggered by GitHub Actions reusable workflow per repo. Platforms are env-gated — if DEVTO_API_KEY isn't set globally, dev.to is skipped automatically. Lives alongside the existing oriz-omni-post-app (the orchestrator UI / catalog of cross-posts)."
tags: [decision, package, omni-publish, automation, blogging, cross-posting]
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
  - architecture/the-six-packages
  - decisions/architecture/cross-post-engine
  - decisions/architecture/mit-license-all-repos
---

# @chirag127/omni-publish — auto-blog package

## Decision

A new npm package `@chirag127/omni-publish` (v0.1.0 published 2026-06-21) handles auto-publishing release notes, blog posts, or changelog entries to multiple platforms on tag push or release create. Lives at:

- npm: <https://www.npmjs.com/package/@chirag127/omni-publish>
- GitHub: <https://github.com/chirag127/omni-publish-npm-pkg>
- Disk: `c:/D/oriz/projects/npm-packages/omni-publish-npm-pkg/`

The existing `oriz-omni-post-app` (`projects/apps/content/oriz-omni-post-app/`) stays — it's the orchestrator + UI + catalog of past cross-posts. The new package is the **engine** that the app (and any GitHub Actions workflow) calls.

## Platforms supported

In priority order:

1. **dev.to** — `DEVTO_API_KEY` env var; uses dev.to REST API (`/api/articles`)
2. **Hashnode** — `HASHNODE_API_KEY` + `HASHNODE_PUBLICATION_ID`
3. **X / Twitter** — `X_API_KEY` + `X_API_SECRET` + `X_ACCESS_TOKEN` + `X_ACCESS_SECRET`
4. **LinkedIn** — `LINKEDIN_ACCESS_TOKEN`
5. **Bluesky** — `BLUESKY_HANDLE` + `BLUESKY_APP_PASSWORD` (AT Protocol)
6. **Mastodon** — `MASTODON_INSTANCE` + `MASTODON_ACCESS_TOKEN`
7. **Reddit** — `REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET` + `REDDIT_USERNAME` + `REDDIT_PASSWORD`
8. **Medium** — `MEDIUM_INTEGRATION_TOKEN` (Medium deprecated integration tokens but the API still works for some accounts)

Platforms are env-gated: if a platform's env vars are not set, that platform is silently skipped. So adding a platform is just adding env vars at the chirag127 org level.

## How it triggers per repo

Each repo's `.github/workflows/release.yml` calls:

```yaml
- name: Cross-post release
  if: github.event_name == 'release'
  uses: chirag127/omni-publish-npm-pkg/.github/workflows/cross-post.yml@main
  with:
    title: "${{ github.event.release.name }}"
    body: "${{ github.event.release.body }}"
    canonical_url: "${{ github.event.release.html_url }}"
  secrets: inherit
```

Or directly via npm bin in a workflow step:

```yaml
- run: npx @chirag127/omni-publish --title "$TITLE" --body "$BODY" --canonical "$URL"
  env:
    DEVTO_API_KEY: ${{ secrets.DEVTO_API_KEY }}
    HASHNODE_API_KEY: ${{ secrets.HASHNODE_API_KEY }}
    # ... rest of platform tokens
```

## Why this shape (package + app)

Two artefacts because they do different things:

- **The package (`@chirag127/omni-publish`)** is a reusable engine. Any oriz repo, any chirag127 project, or any non-chirag user can install it from npm and call it. MIT licensed.
- **The app (`oriz-omni-post-app` at omni-post.oriz.in)** is the family-internal orchestrator: catalog of every cross-post, scheduled drafts, retry queue for failed posts, manual override UI. Has admin auth, isn't useful outside the family.

Per [[cross-post-engine]] the existing decision already named the family pattern. This decision adds the **package boundary** so the engine becomes reusable while the orchestrator stays family-internal.

## Versioning

- v0.1.0 — stub published 2026-06-21 (exports type + stub `publish()` function)
- v0.1.1 — **5 working adapters + Telegram drafts queue + reusable workflow** (2026-06-21)
- v0.1.2 — **telegram-announce adapter + dual-write drafts + 4-channel routes** (2026-06-22)
- v0.2.0 — retry queue / rate-limit cache (fs-based, per-repo per-day)
- v1.0.0 — all 5 auto + 4 drafts running in production for ≥1 month

Cross-platform retry + scheduling deferred to v0.2+. v0.x is fire-and-forget per platform.

## v0.1.1 shipped (2026-06-21)

### 5 auto-publish adapters (each env-gated)

| Platform | Required env vars |
|---|---|
| **dev.to** | `DEVTO_API_KEY` |
| **Hashnode** | `HASHNODE_API_KEY` + `HASHNODE_PUBLICATION_ID` |
| **Bluesky** | `BLUESKY_HANDLE` + `BLUESKY_APP_PASSWORD` (uses `@atproto/api`) |
| **Mastodon** | `MASTODON_INSTANCE` + `MASTODON_ACCESS_TOKEN` |
| **Threads (Meta)** | `THREADS_ACCESS_TOKEN` (2-step create + publish) |

### 4 manual-platform drafts via Telegram

For X, Reddit, LinkedIn, Medium — `omni-publish` generates per-platform AI-rewritten drafts and posts them to a Telegram channel for the user to review + post by hand.

- **AI**: NVIDIA NIM (`meta/llama-3.3-70b-instruct`) primary, OpenRouter (`meta-llama/llama-3.3-70b-instruct:free`) fallback on 429/5xx.
- **Required env vars**: `TELEGRAM_DRAFTS_BOT_TOKEN` + `TELEGRAM_DRAFTS_CHAT_ID` + (`NVIDIA_NIM_API_KEY` or `OPENROUTER_API_KEY`).
- Per-platform prompts in `src/adapters/ai-draft.ts` (X = 280 char, Reddit = full body w/ TL;DR, LinkedIn = professional, Medium = 1-paragraph blurb).

### Reusable workflow

`chirag127/omni-publish-npm-pkg/.github/workflows/cross-post.yml@main` — any repo can call it with `secrets: inherit`.

### Bin entry

v0.1.1 fixes the v0.1.0 bin bug by shipping a plain ESM `bin/omni-publish.mjs` (no TypeScript at runtime). Requires Node 22+ for native `fetch`. `npx @chirag127/omni-publish` now works.

## v0.1.2 — 2026-06-22

Added **4-channel routing** and **dual-write drafts**.

### New adapters

- `src/adapters/telegram-announce.ts` — posts to public `@oriz_announcements` channel. Also exports a generic `publishToChat(chatId, input, channelHandle?)` helper used by the paisa route.
- `src/adapters/github-issues-drafts.ts` — mirrors drafts into `chirag127/oriz-drafts` Issues for searchable archival.

### New types — `PublishRoutes`

```ts
export type PublishRoutes = {
  announce?: boolean // default true  → @oriz_announcements
  drafts?: boolean   // default true  → @oriz_drafts + chirag127/oriz-drafts Issues (dual-write)
  paisa?: boolean    // default false → @oriz_paisa (also auto-on if tags include 'paisa' / 'finance')
}
```

Pass via `publish({ ..., routes: { ... } })`. The CLI also reads `OMNI_ANNOUNCE` / `OMNI_DRAFTS` / `OMNI_PAISA` env vars.

### Dual-write drafts

The drafts route now writes to BOTH Telegram (4 per-platform messages) AND a GitHub Issue in `chirag127/oriz-drafts`, in parallel via `Promise.all`. Either backend failing is logged but does not fail the overall publish.

### New env vars (v0.1.2)

| Env var                       | Purpose                                                                |
|-------------------------------|------------------------------------------------------------------------|
| `TELEGRAM_BOT_TOKEN`          | Bot token for all Telegram channels. Falls back to `TELEGRAM_DRAFTS_BOT_TOKEN` (legacy). |
| `TELEGRAM_ANNOUNCE_CHAT_ID`   | Public `@oriz_announcements` channel id.                               |
| `TELEGRAM_DRAFTS_CHAT_ID`     | Private `@oriz_drafts` channel id (manual-platform queue, unchanged).  |
| `TELEGRAM_OPS_CHAT_ID`        | Private `@oriz_ops` channel id (CI / mirror / health — reserved).      |
| `TELEGRAM_PAISA_CHAT_ID`      | Public `@oriz_paisa` channel id (finance content, opt-in).             |
| `OMNI_DRAFTS_GH_PAT`          | GitHub PAT for `chirag127/oriz-drafts` Issues dual-write.              |
| `OMNI_ANNOUNCE` / `OMNI_DRAFTS` / `OMNI_PAISA` | Workflow-level route toggles consumed by the CLI.     |

### Reusable workflow

`.github/workflows/cross-post.yml` now exposes `announce` / `drafts` / `paisa` boolean inputs and forwards every new Telegram chat id + `OMNI_DRAFTS_GH_PAT` secret.

## Cross-refs

- The original cross-post decision → [[decisions/architecture/cross-post-engine]]
- The MIT license decision that makes this freely usable → [[decisions/architecture/mit-license-all-repos]]
- The catalog of which env vars set which platforms → [[templates/.env.example]] + [[services/easy-free-tier]]
- The oriz-omni-post-app submodule → `projects/apps/content/oriz-omni-post-app/`
