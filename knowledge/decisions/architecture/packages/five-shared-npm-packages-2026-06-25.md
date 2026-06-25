---
type: decision
title: Five shared npm packages — account-widget, finance, ui, seo, donate
description: Locked 2026-06-25. App-shared concerns collapse into five packages — @oriz/account-widget, @oriz/finance, @oriz/ui, @oriz/seo, @oriz/donate. The older 22-package roadmap is dropped for shared-app concerns; the 22 reserved-slug v0.1.0 stubs stay reserved and can be repurposed.
tags:
- decision
- packages
- npm
- shared
- account-widget
- finance
- ui
- seo
- donate
timestamp: 2026-06-25
format_version: okf-v0.1
status: superseded
superseded_by: decisions/architecture/packaging/one-package-only-analytics-2026-06-25
related:
- decisions/architecture/packages/four-more-packages-22-total
- decisions/architecture/frontend/framework-astro-react-tailwind-shadcn-2026-06-25
- decisions/architecture/security/auth-firebase-login-account-2026-06-25
- decisions/architecture/monetisation/donations-only-2026-06-25
---

# Five shared npm packages

**SUPERSEDED 2026-06-25** by [[decisions/architecture/packaging/one-package-only-analytics-2026-06-25]]. Five-package set retired the same day it was locked; only `oriz-analytics-npm-pkg` survives.

## Decision

Five packages own all app-shared concerns:

| Package | Owns |
|---|---|
| `@oriz/account-widget` | Universal optional auth widget mounted in every app header |
| `@oriz/finance` | Finance calculator primitives (EMI, SIP, tax, PPF, NPS, FD, lumpsum, GST, HRA, retirement) |
| `@oriz/ui` | shadcn-based UI primitives with family defaults (theme toggle, layout shell, chrome) |
| `@oriz/seo` | Per-page SEO + JSON-LD + Satori OG image generation |
| `@oriz/donate` | Donations widget (BuyMeACoffee + GitHub Sponsors + UPI) |

The older "22 packages by suffix" roadmap is retired for shared-app concerns. The 22 reserved-slug v0.1.0 stubs on npm stay reserved (no cost, prevents squatters) and can be repurposed if a new shared concern emerges.

## Why

- **App-shared concerns are five clusters, not twenty-two** — most of the 22 were speculative slot-fillers.
- **Each of the five has a real consumer right now** — the widget is used by every app, finance is used by the consolidated finance repo, UI is used everywhere, SEO is used by every public page, donate is used by every app under donations-only.
- **Smaller surface = faster bumps** — five changesets vs twenty-two when shadcn or Astro releases breaking changes.
- **Reserved slugs stay free** — npm v0.1.0 stubs cost nothing and keep namespace squatters out.
- **Composition over fragmentation** — `@oriz/account-widget` internally uses `@oriz/ui`; `@oriz/donate` is composed inside `@oriz/account-widget`'s popover. Five packages, not a constellation of one-export packages.

## Implications

- Existing on-disk packages outside this set (e.g. `@oriz/astro-pwa`, `@oriz/oriz-seo` if differently named) need a rename pass to converge.
- Apps drop ad-hoc copies of donate / widget / SEO code in favour of the package imports.
- The "22 packages on npm" memory note still holds for slug reservation; only the active development set shrinks.
- pnpm workspace remains; the five live in the umbrella's `packages/` (or remain as their own submodules with `-npm-pkg` suffix per the flat repo layout).
- Per-repo bundle size shrinks because tree-shakable packages replace inlined-everywhere snippets.
