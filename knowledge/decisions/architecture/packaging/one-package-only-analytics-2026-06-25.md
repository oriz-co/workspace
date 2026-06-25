---
type: decision
title: One in-house npm package only — oriz-analytics
description: 22 of 23 in-house npm packages archived to oriz-archive 2026-06-25. Sole survivor is oriz-analytics-npm-pkg (analytics + tracking + ads, uniform across every app). Future packages are lazy — built only when forced.
tags: [npm, packages, monorepo, analytics, build-gate]
timestamp: 2026-06-25
format_version: okf-v0.1
status: superseded
superseded_by: decisions/architecture/packaging/zero-in-house-packages-inline-analytics-2026-06-25.md
supersedes:
  - architecture/packages/the-23-packages
  - decisions/architecture/packages/five-shared-npm-packages-2026-06-25
  - decisions/architecture/packages/four-more-packages-22-total
related:
  - decisions/architecture/apps/fleet-strategy-build-gate-2026-06-25
  - decisions/architecture/monetisation/donations-only-2026-06-25
---

> **Superseded 2026-06-25 (same day)** — see [zero-in-house-packages decision](./zero-in-house-packages-inline-analytics-2026-06-25.md). Inline analytics scripts don't need a wrapping package.

# One in-house npm package only — oriz-analytics

## Decision

Only ONE in-house npm package survives: `oriz-analytics-npm-pkg`, published as `@oriz/analytics`. It owns analytics + tracking + ads, applied uniformly to every app. The other 22 packages are archived to `oriz-archive` on 2026-06-25 because each was built before any app demanded it — a self-violation of the [[rules/build-gate-top3-must-have-defect]]. Apps now use community deps by default; new in-house packages get built only when forced by a real, multi-app need.

## What survives

- **`oriz-analytics-npm-pkg`** — npm-published as `@oriz/analytics`. The analytics + tracking + ads layer. One init call per app. Wraps Cloudflare Web Analytics + GA4 + Microsoft Clarity + Sentry + AdSense/AdMob slots. Klaro consent gating built in. Applied uniformly to every app — that uniformity is intentional and is the reason this package exists at all.

## What got archived

All 22 below moved to `oriz-archive` on 2026-06-25.

| Package | Why this didn't survive |
|---|---|
| `astro-shell-npm-pkg` | Never imported by 2+ apps — each app's astro.config diverged anyway. |
| `astro-chrome-npm-pkg` | Header/sidebar/footer/SEO inline per app; each app's frontend-design pass makes shared chrome a misfit. |
| `astro-tools-npm-pkg` | Tools consolidated into category repos; no cross-repo `<ToolGrid>` consumer. |
| `astro-content-npm-pkg` | Zod schemas and RSS/Atom emit fit in each app's `src/lib/`; reused 0 times across apps. |
| `astro-data-npm-pkg` | Firebase init / Firestore helpers orphaned by no-auth + no-firebase-in-apps. |
| `astro-forms-npm-pkg` | react-hook-form + zod + shadcn Form — community deps cover this directly. |
| `astro-billing-npm-pkg` | Orphaned by donations-only (Razorpay killed; no paywall). |
| `astro-pwa-npm-pkg` | `@vite-pwa/astro` directly + 30 lines per app — no wrapper earns its keep. |
| `astro-distribute-npm-pkg` | PWABuilder is a CLI; thin wrapper added nothing. |
| `astro-widgets-npm-pkg` | `<MultiSearch>` / `<StatusBanner>` inline per app; no cross-repo consumer. |
| `astro-test-utils-npm-pkg` | Test fixtures copied per repo; the wrapper drift cost > the dedup payoff. |
| `auth-core-npm-pkg` | Orphaned by [[decisions/architecture/security/no-auth-in-apps-or-apis-2026-06-25]] — login lives separately. |
| `auth-wxt-npm-pkg` | Same — no auth in extensions either. |
| `auth-vsc-npm-pkg` | Same — no auth in VS Code extensions. |
| `auth-cli-npm-pkg` | Same — no auth in CLIs. |
| `omni-publish-npm-pkg` | Cross-poster is a GH Action + Worker, not a client lib. |
| `oriz-book-build-npm-pkg` | Markua→Pandoc pipeline lives in the books repo; no second consumer. |
| `oriz-ai-providers-npm-pkg` | Narrowed to 2-shim experiment (freellmapi + omniroute); not a published lib. |
| `oriz-rate-limit-npm-pkg` | Orphaned by donations-only — no Free/Pro/Max tiers to enforce. |
| `oriz-seo-npm-pkg` | Per-app SEO inline; each frontend-design pass takes ownership of its head/meta. |
| `oriz-consent-npm-pkg` | Folded into `@oriz/analytics` — Klaro gating belongs with the trackers it gates. |
| `oriz-kit-npm-pkg` | Wordmark + brand tokens copied per repo; the kit umbrella never had a consumer. |

The 22 npm slug reservations on the `@oriz/*` namespace stay (v0.1.0 stubs cost nothing and prevent squatters); the repos are archived but the slugs remain claimed.

## Future rule: lazy in-house

- Apps use community deps by default (astro, react, tailwind, shadcn, date-fns, fuse.js, zod, react-hook-form, @vite-pwa/astro, etc.).
- Inline / vendor-copy small helpers into each app's `src/lib/`.
- Build a new in-house package ONLY when ALL three hold:
  1. ≥3 apps need the same logic, AND
  2. no community equivalent exists or fits, AND
  3. maintenance cost (deps + security patches + version coordination) is justified by use count.

No more pre-built SDK packages. No more "this will be useful when we have 10 apps."

## Why this matters

- **Saves 22 maintenance threads** — deps to patch, security advisories to chase, semver to coordinate, dist builds to debug.
- **Apps stay independently shippable** — no cross-repo version coordination, no peer-dep DAGs, no "bump astro-chrome then bump every consumer."
- **Honors the build-gate rule applied to packages themselves** — the rule says "build only when a real defect forces it"; 22 stub packages built before any defect was a self-violation.
- **Per-app frontend-design divergence stays cheap** — shared chrome/UI packages fight against the per-app design pass; inlining lets each app diverge without rebasing a package.

## Cross-refs

- Build-gate rule (now applied to packages too) → [[decisions/architecture/apps/fleet-strategy-build-gate-2026-06-25]]
- Donations-only (killed billing/rate-limit packages) → [[decisions/architecture/monetisation/donations-only-2026-06-25]]
- No-auth (killed the 4 auth packages) → [[decisions/architecture/security/no-auth-in-apps-or-apis-2026-06-25]]
- Per-app frontend-design (killed the shared chrome/UI packages) → [[rules/design/per-app-distinctive-frontend-design]]
- Prior 23-package set (superseded) → [[architecture/packages/the-23-packages]]
- Prior 5-package set (superseded) → [[decisions/architecture/packages/five-shared-npm-packages-2026-06-25]]
- Memory pointer → `~/.claude/projects/c--D-oriz/memory/one-package-only-analytics.md`
