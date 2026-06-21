---
type: decision
title: "[SUPERSEDED] Zero @chirag127/* packages — replaced by 14-package locked set"
status: superseded
superseded_by: architecture/the-six-packages
description: "All 22 @chirag127/astro-* packages and the 3 planned auth-* packages are deleted. Every concern (auth, billing, analytics, logger, config, api-client, flags, storage, notifications, test-utils, UI chrome, content collections, PWA, ...) uses existing community libraries directly. Apps duplicate ~30-50 lines of glue each; that cost is accepted. New @chirag127/* packages are only carved when: (a) no community package covers the surface, AND (b) the package would be genuinely useful to other devs (publishable as a standalone OSS lib)."
tags: [architecture, packages, deletion, community, yagni]
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
supersedes:
  - architecture/the-six-packages
  - decisions/architecture/cross-surface-package-set
related:
  - architecture/package-isolation-rule
  - rules/no-card-on-file
---

# Zero @chirag127/* packages — use community libraries directly

## Decision

The family ships **zero** `@chirag127/*` packages going forward. Every cross-cutting concern uses an existing community / industry package directly. Apps duplicate small amounts of glue per surface; that cost is explicitly accepted to keep the package count at zero.

A new `@chirag127/*` package is only carved when BOTH conditions hold:
1. No existing npm package covers the surface
2. The package is genuinely useful to developers outside oriz (i.e., would survive as a standalone OSS library)

If only (1) holds but (2) doesn't — the code inlines into the consuming app. Family-specific glue is not a package.

## What was deleted

All 22 packages published earlier on 2026-06-21:

- `@chirag127/astro-shell`, `astro-chrome`, `astro-config`, `astro-data`, `astro-forms`, `astro-icons`, `astro-tools`, `astro-ai`
- `@chirag127/astro-distribute`, `astro-pwa`, `astro-content`, `astro-billing`, `astro-search`
- `@chirag127/astro-mdx`, `astro-toc`, `astro-comments`, `astro-share`, `astro-newsletter`, `astro-affiliate`, `astro-keyboard`, `astro-feedback`, `astro-test-utils`

The 3 planned `auth-wxt` / `auth-vsc` / `auth-cli` wrappers were never created — also dropped. The `chrome.identity.launchWebAuthFlow` and `vscode.authentication.getSession` and Firebase device-code flows inline directly into each consuming extension / CLI (~20 lines each).

## Replacement map (legacy → community / inline)

| Removed package | Replaced by |
|---|---|
| `astro-shell` | vanilla `defineConfig` + per-app integration list |
| `astro-chrome` | inline `<header>`/`<footer>` per-app + `@fontsource/*` + small CSS-var set |
| `astro-config` | `astro/tsconfigs/strict` + `biome init` + `@tailwindcss/vite` |
| `astro-data` | `firebase` + `@tanstack/react-query` directly |
| `astro-forms` | `react-hook-form` + `zod` + direct `fetch` to Web3Forms |
| `astro-icons` | `lucide-react` directly |
| `astro-tools` | inline per tool-app or use `astro:components` |
| `astro-ai` | `puter` SDK directly |
| `astro-distribute` | PWABuilder CLI directly (`pwabuilder package`) |
| `astro-pwa` | `@vite-pwa/astro` directly |
| `astro-content` | `astro:content` + `@astrojs/rss` (built-in) |
| `astro-billing` | `razorpay` SDK directly |
| `astro-search` | `pagefind` directly |
| `astro-mdx` | `rehype-callouts` + `rehype-shiki` directly |
| `astro-toc` | `rehype-toc` directly |
| `astro-comments` | `@giscus/react` directly |
| `astro-share` | inline `<a>` tags (~20 lines) |
| `astro-newsletter` | direct `fetch` to Buttondown / EmailOctopus API |
| `astro-affiliate` | inline `<a rel="nofollow sponsored">` |
| `astro-keyboard` | `cmdk` directly |
| `astro-feedback` | inline `<form>` to Web3Forms |
| `astro-test-utils` | `vitest` + `msw` + `@playwright/test` directly |

## Why this shape

User direction 2026-06-21, verbatim: *"if the … I'm ready to sacrifice the flexibility … websites in all of the apps in everything or if I want. Screen packages. I don't care about number of packages, I just want maximum [community packages]. … The packages made by me should be minimum number of packages so that everything is minimum in them. And minimum line of code is there."*

This sharpens the ladder in the family's ponytail rule: stdlib / native / installed-dep before custom code. The 22 packages were wrappers around community libs, adding a version + an audit surface without saving meaningfully fewer lines than `npm install <community>` + a 30-line inline file.

The community libs are also **better-supported**: they have other consumers, issue trackers, security patches landing without our intervention. A `@chirag127/*` wrapper inherits none of that.

## How to apply

- New app scaffold: `npm create astro@latest`, add the integrations the app actually uses, write inline glue.
- Auth flow: every surface reads [[cross-site-auth-via-auth-oriz-in]] for the protocol; inline the Firebase / `chrome.identity` / `vscode.authentication` calls per app.
- Tempted to extract a 30-line helper to a package? Don't — duplicate it across the 3-4 apps that need it. Re-evaluate when 6+ apps duplicate the same 60+ lines.
- Need a community lib that doesn't exist? FIRST audit npm + unjs + community Astro plugins. ONLY then consider carving one — and only if the package would stand alone as a useful OSS lib outside oriz.

## Cross-refs

- Sharpens → [[package-isolation-rule]] (still valid; the bar is just higher)
- Supersedes → [[the-six-packages]] (the 22-package list — kept for audit trail with `status: superseded`)
- Supersedes → [[cross-surface-package-set]] (the 3-auth-wrapper plan — never built)
