---
type: navigation
title: "Knowledge navigation — where to look in knowledge/"
description: "Extracted from AGENTS.md 2026-06-22 to keep AGENTS.md tight. This file maps user-intent ('looking for X') to the right knowledge/ path. Includes the per-site knowledge convention."
tags: [navigation, index, meta]
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
---

# Knowledge navigation

## Where to look in `knowledge/`

| Looking for | Read |
|---|---|
| **How to OPERATE this knowledge bundle as an AI agent** (start here on every session) | [`rules/agent-minimum-context.md`](./rules/agent-minimum-context.md) |
| Why we do (or don't do) something | [`rules/`](./rules/) |
| When + why a specific decision was locked | [`decisions/`](./decisions/) |
| Which external services we use + free-tier limits + alternatives | [`services/`](./services/) |
| The 5-layer stack + API umbrella + canonical store | [`architecture/`](./architecture/) |
| Age-gating, monetisation, ingester contract, secrets handling | [`policy/`](./policy/) |
| Step-by-step actions (auth setup, add a site, rotate secrets) | [`runbooks/`](./runbooks/) |
| Per-site v2 design briefs + family design rules | [`design/`](./design/) |
| Family-specific term definitions | [`glossary/`](./glossary/) |
| Multi-engine "Search the web" button — every site ships one (in `@chirag127/oriz-kit` as `<MultiSearch />`) | [`decisions/architecture/multi-engine-search-button.md`](./decisions/architecture/multi-engine-search-button.md) |
| Repo naming — sites are `<subdomain-prefix>-site`; extensions `-ext`, VS Code extensions `-vsc-ext`, CLIs `-cli`, MCP servers `-mcp`, Workers `-worker`, Cloud Functions `-fn`, data repos `-data`, agent skills `-skill`, rule bundles `-rules`. NPM packages stay clean (no suffix). | [`decisions/branding/repo-naming-suffixes.md`](./decisions/branding/repo-naming-suffixes.md) |
| Workspace layout — `repos/<owner>/<own\|forks>/<bucket>/<category>/<repo>/` 5-level hierarchy. Owner is `oriz/` (oriz-org) or `c127/` (chirag127). Buckets are `prod` / `svc` / `lib` / `content`. Folder names shortened 2026-06-24 (bs-ext, ide-ext, mcp, npm, api). | [`decisions/architecture/projects-owner-own-forks-layout.md`](./decisions/architecture/projects-owner-own-forks-layout.md) |
| Org rename oriz-co → oriz-org (2026-06-24) — GitHub auto-redirects; supersedes the 2026-06-22 migrate-to-oriz-org runbook | [`decisions/branding/oriz-org-rename-from-co.md`](./decisions/branding/oriz-org-rename-from-co.md) |
| cs-me-app moved from oriz-org → chirag127 (personal, puter.js auth, no brand auth) | [`decisions/branding/cs-me-app-moved-to-chirag127.md`](./decisions/branding/cs-me-app-moved-to-chirag127.md) |
| Recruiter strategy — pinned repos + contribution graph carry the signal; repo list is a tiebreaker | [`rules/recruiter-strategy.md`](./rules/recruiter-strategy.md) |
| Profile README must cross-link — chirag127 ↔ oriz-org both surfaces lead to the other in one click | [`rules/profile-readme-cross-link.md`](./rules/profile-readme-cross-link.md) |
| Geo-routed payment matrix — Razorpay (India) + Lemon Squeezy (international, MoR) + keygen.sh (licenses) + six donation rails | [`decisions/monetisation/max-payment-methods.md`](./decisions/monetisation/max-payment-methods.md) |
| Razorpay donation button (one-time) — pl_T4iEPIDcALKLPk, mounted on every app's `/sponsors` route + oriz-cs-me-app footer | [`decisions/architecture/razorpay-donation-button.md`](./decisions/architecture/razorpay-donation-button.md) |
| RSS → every-platform cross-poster — `@chirag127/oriz-omnipost` watches `blog.oriz.in/rss.xml` | [`decisions/architecture/cross-post-engine.md`](./decisions/architecture/cross-post-engine.md) |
| Secrets management — Doppler upstream; GitHub Secrets / CF Worker secrets / Firebase config are runtime mirrors | [`decisions/security/secrets-management-doppler.md`](./decisions/security/secrets-management-doppler.md) |
| Three-env file split — `.env` (shared) + `.env.development` (TEST) + `.env.production` (LIVE), all SOPS-encrypted | [`decisions/security/env-three-file-split.md`](./decisions/security/env-three-file-split.md) |
| **Env files in submodules** — every submodule has `.env` (gitignored) + `.env.enc` (committed, sops) + `.env.example` (committed, placeholders); all use the SAME age key from Bitwarden | [`rules/submodule-env-files-three-file-pattern.md`](./rules/submodule-env-files-three-file-pattern.md) |
| Consent management — 5-category Klaro; geo-routed defaults | [`decisions/security/consent-management-multi-category.md`](./decisions/security/consent-management-multi-category.md) |
| Auto-only tracking — every metric auto-captured | [`rules/auto-only-tracking.md`](./rules/auto-only-tracking.md) |
| Env keys + GH Actions secrets — single source of truth, two delivery tracks | [`decisions/security/env-and-secrets-single-source.md`](./decisions/security/env-and-secrets-single-source.md) |
| packages.oriz.in catalog hub — auto-discovery catalog of every `@chirag127/*-npm-pkg` repo | [`decisions/architecture/packages-oriz-in-catalog.md`](./decisions/architecture/packages-oriz-in-catalog.md) |
| Brand capitalisation — Title-Case "Oriz" in user-facing copy; lowercase in identifiers | [`decisions/branding/title-case-oriz.md`](./decisions/branding/title-case-oriz.md) |
| Revenue channels 2026 — every product auto-publishes to as many channels as 2026 APIs allow | [`decisions/architecture/revenue-channels-2026.md`](./decisions/architecture/revenue-channels-2026.md) |
| Book publish pipeline — 5 books, Markua → Pandoc → EPUB+PDF+MOBI via `@chirag127/oriz-book-build` | [`decisions/architecture/book-publish-pipeline.md`](./decisions/architecture/book-publish-pipeline.md) |
| Design divergence is NOT duplication — per-app Header/Footer/Wordmark intentional | [`rules/design-divergence-vs-dedup.md`](./rules/design-divergence-vs-dedup.md) |
| Monetisation channel matrix — per-channel + per-app | [`decisions/policy/monetisation-channel-matrix.md`](./decisions/policy/monetisation-channel-matrix.md) |
| Drafts queue host — private GH repo `chirag127/oriz-drafts` with Issues (Telegram banned in India) | [`decisions/architecture/drafts-queue-host.md`](./decisions/architecture/drafts-queue-host.md) |
| Telegram is banned in India — drafts via GH Issues; no Telegram bots | [`rules/no-telegram-india-banned.md`](./rules/no-telegram-india-banned.md) |
| No PAID self-hosting — free providers (Supabase / Render / Fly / Oracle Always-Free / etc.) are FINE | [`rules/no-paid-self-hosting-only.md`](./rules/no-paid-self-hosting-only.md) |
| No Firebase Cloud Functions (Blaze required, card on file banned) | [`rules/no-firebase-functions-blaze.md`](./rules/no-firebase-functions-blaze.md) |
| Fork discipline — minimum-diff, rebase-friendly, `repos/<owner>/forks/<upstream-name>/` (owner = `oriz/` for brand-maintained, `c127/` for drive-by) | [`rules/fork-discipline.md`](./rules/fork-discipline.md) |
| CF Pages branch-deploys (100-project mitigation) | [`runbooks/cf-pages-branch-deploys.md`](./runbooks/cf-pages-branch-deploys.md) |
| Family inventory (canonical counts SSoT) — 27 apps + 23 npm packages + 5 books + 15 APIs + 2 browser-extension forks + 75 submodules | [`services/family-inventory.md`](./services/family-inventory.md) |

## Per-site knowledge

Per-app knowledge lives INSIDE each app submodule under its own
`knowledge/` folder (OKF-light: `index.md` + `decisions/` + `runbooks/` +
`services/`). The richest example is
[`repos/c127/own/prod/apps/personal/cs-me-app/knowledge/`](../repos/c127/own/prod/apps/personal/cs-me-app/knowledge/)
— lifestream architecture, age-gating, ingester contract, 100-year
strategy. Each per-app bundle follows the same OKF contract
([`_okf.md`](./_okf.md)). Master `knowledge/` holds family-wide rules /
decisions / architecture only; the deprecated `knowledge/sites/<app>/`
location is NOT used.
