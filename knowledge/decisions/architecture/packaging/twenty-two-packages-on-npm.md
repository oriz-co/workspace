---
type: decision
title: "22 packages on npm as v0.1.0 stubs"
description: "22 `@chirag127/astro-*` packages locked and published to npm as v0.1.0 stubs on 2026-06-21. 8 had real code restored after stub publish; 14 are slug-reservation only. Future drift checks should compare against this list."
tags: [packaging, npm, superseded]
timestamp: 2026-06-21
format_version: okf-v0.1
status: superseded
superseded_by: one-package-only-analytics
---

The 22 packages (alphabetical):

| # | Package | Has real code on disk |
|---|---|---|
| 1 | `@chirag127/astro-affiliate` | no (stub) |
| 2 | `@chirag127/astro-ai` | yes |
| 3 | `@chirag127/astro-billing` | no (stub) |
| 4 | `@chirag127/astro-chrome` | yes |
| 5 | `@chirag127/astro-comments` | no (stub) |
| 6 | `@chirag127/astro-config` | yes (config files at root, no src/) |
| 7 | `@chirag127/astro-content` | no (stub) |
| 8 | `@chirag127/astro-data` | yes |
| 9 | `@chirag127/astro-distribute` | no (stub) |
| 10 | `@chirag127/astro-feedback` | no (stub) |
| 11 | `@chirag127/astro-forms` | yes |
| 12 | `@chirag127/astro-icons` | yes |
| 13 | `@chirag127/astro-keyboard` | no (stub) |
| 14 | `@chirag127/astro-mdx` | no (stub) |
| 15 | `@chirag127/astro-newsletter` | no (stub) |
| 16 | `@chirag127/astro-pwa` | no (stub) |
| 17 | `@chirag127/astro-search` | no (stub) |
| 18 | `@chirag127/astro-share` | no (stub) |
| 19 | `@chirag127/astro-shell` | yes |
| 20 | `@chirag127/astro-test-utils` | no (stub) |
| 21 | `@chirag127/astro-toc` | no (stub) |
| 22 | `@chirag127/astro-tools` | yes |

**Why this list is durable:** Drift from this set should trigger a knowledge update + a memory revision. Don't add a 23rd package without re-asking "does this fold into one of the 22?" first.

**Folded in (deliberately NOT separate packages):**
- SEO meta / JSON-LD → `astro-chrome`
- Auth UI / AccountPanel / FinishSignIn → `astro-chrome`
- 24 legal pages → `astro-chrome`
- Header / Sidebar / Footer / Stamp / StatusBanner / Image wrapper → `astro-chrome`
- firebase-init standalone → `astro-data`
- newsletter server-side / omnipost → `apps/api/` (Worker), not a client package
- "kit umbrella" — `astro-shell` IS the base layer; no second umbrella

**Build pipeline gap:** The 8 packages with real code currently ship raw `.ts` and have no tsc emit. npm consumers can't `import` them. v0.1.1+ ships proper `dist/` from tsc.

Related: [`pwabuilder-primary-converter`](../../../rules/agent/preferences/pwabuilder-primary-converter.md), [`repo-slug-suffix-npm-pkg`](../../../rules/agent/preferences/repo-slug-suffix-npm-pkg.md).

**SUPERSEDED 2026-06-25** by [`one-package-only-analytics`](./one-package-only-analytics.md). 22 of 23 packages archived to oriz-archive on the build-gate-violates-itself grounds.
