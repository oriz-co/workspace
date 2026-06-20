---
type: log
title: "Session 2026-06-20 evening — brand rename + suffix policy pivot"
description: "Recap of decisions locked in the long evening session that's about to be /compacted. Future sessions resume from this file."
tags: [session-log, branding, naming, packages, pivot]
timestamp: 2026-06-20
related: [repo-naming-suffixes, family-naming-policy, packages-14-atomic]
---

# Session resume — 2026-06-20 evening

This file exists to preserve session state across `/compact`. Read this
before doing any further work in the family.

## Repo state after this session

### 9 sites renamed (gh repo rename, history preserved)

| Old | New | Subdomain | Has code |
|---|---|---|---|
| chirag127/oriz-blog-site | **chirag127/pages** | blog.oriz.in | yes |
| chirag127/oriz-book-lore-site | **chirag127/lore** | _(TBD)_ | yes (18MB) |
| chirag127/oriz-books-site | **chirag127/ncert** | ncert.oriz.in | small |
| chirag127/oriz-cards-site | **chirag127/tabs** | cards.oriz.in | yes |
| chirag127/oriz-home-site | **chirag127/home** | oriz.in | yes |
| chirag127/oriz-journal-site | **chirag127/roam** | journal.oriz.in | yes |
| chirag127/oriz-me-site | **chirag127/me** | me.oriz.in | yes (renamed from `cs` to `me` last) |
| chirag127/oriz-omnipost | **chirag127/echo** | post.oriz.in (planned) | yes |
| chirag127/oriz-janaushdhi | **chirag127/janaushdhi** | _(TBD)_ | empty stub |

### 15 tool repos already created earlier in session

`pdf-tools-site`, `image-tools-site`, `finance-tools-site`,
`dev-tools-site`, `text-tools-site`, `convert-tools-site`,
`qr-tools-site`, `data-tools-site`, `audio-tools-site`,
`video-tools-site`, `seo-tools-site`, `crypto-tools-site`,
`health-tools-site`, `random-tools-site`, `print-tools-site`.

These are still under `*-tools-site` slug because the **hybrid suffix
policy** (locked this session) keeps `-site` on tool sites that have
the descriptive function in the slug body. Brand-rename for these is
**deferred**.

### 8 npm packages exist

`astro-shell`, `astro-chrome`, `astro-tools`, `astro-config`,
`astro-icons`, `astro-ai`, `astro-forms`, `astro-data`.

All 14 prior atomic packages (firebase-init, auth-ui, contact-form,
sidebar, family, config, theme, multi-search, footer, header, seo,
analytics, consent, kit) — **deleted from GitHub this session**. Were
never published to npm.

### Subdomains

Subdomains stay descriptive. `blog.oriz.in` does NOT become
`pages.oriz.in`. Repo brand ≠ subdomain. The on-site wordmark uses
the brand name; the URL stays SEO-aligned.

## Policy locks made this session

| Rule | Lock |
|---|---|
| Suffix matrix | **Hybrid** — sites + npm packages drop suffix; extensions / CLIs / MCP / workers / fns / data keep suffix |
| Same-name rule | repo == npm package name (when both exist); subdomains independent |
| Brand pattern | Invented compound / short word, 4-7 chars |
| Auth | **Required on every site EXCEPT `me`** (latest user directive — overrides earlier "advanced tools only") |
| Monetization | Required on every site EXCEPT `me` |
| Theme | Strict no-toggle dark/AMOLED across every site, extension, CLI |
| GitHub repo metadata (mandatory on create/edit) | Description, topics (5-10), homepage URL, license, About website link |
| Web search fallback | Toolbox MCP (Brave first, then Tavily/Exa/DDG) when built-in WebSearch returns 400 |
| Per-project info sites | **Skipped** — central /projects page on home suffices |
| `/cs` slug | Renamed to `/me` (latest directive) |
| Rename approach | `gh repo rename` preserved history; **NOT** delete-and-reclone (latest directive accepted: keep results) |

## MCQ-learned tastes (now permanent rules)

- `user-prefers-atomic-split` — more-smaller > fewer-larger (with
  exception for solo-dev maintenance debt)
- `user-prefers-wider-coverage` — content/brand wider, tools narrower
- `user-prefers-pure-tool-brand` — per-product brand over family chrome
  on tool sites
- `user-prefers-strict-no-toggle` — strict reading of family rules,
  no opt-in toggles
- `user-prefers-same-name-repo-and-npm` — single name across both
- `user-prefers-deletion-over-archive` — same-day-migration exception
  to never-delete

## Open work blocked by tokens

- DNS for 15 subdomains (CLOUDFLARE_API_TOKEN required, treated compromised)
- CF Pages project create per repo (same)
- npm publishes (NPM_TOKEN required, same)
- Astro template scaffolding for each repo (separate session, ~180 file writes)

Per `runbooks/security/credentials/rotate-cf-and-npm-tokens.md`, user
needs to rotate both tokens manually and `gh secret set --org chirag127`
before any of the above can run.

## Cross-references

- [knowledge/decisions/branding/repo-naming-suffixes.md](../decisions/branding/repo-naming-suffixes.md) — hybrid suffix matrix (revised this session)
- [knowledge/decisions/branding/naming/policy/family-naming-policy.md](../decisions/branding/naming/policy/family-naming-policy.md) — same
- [knowledge/decisions/architecture/stack/family-stack-lock.md](../decisions/architecture/stack/family-stack-lock.md) — Astro everywhere, hybrid hosting
- [knowledge/decisions/architecture/packages-14-atomic.md](../decisions/architecture/packages-14-atomic.md) — needs revision; 14 → 8
- [knowledge/decisions/architecture/site-rename-matrix.md](../decisions/architecture/site-rename-matrix.md) — needs revision with new brand names
