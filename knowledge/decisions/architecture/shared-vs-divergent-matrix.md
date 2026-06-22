---
type: decision
title: "Shared-vs-divergent matrix family-wide (FINAL 2026-06-22 evening)"
description: "Definitive matrix of what is shared via packages vs what diverges per-app. Auth FULLY shared. Pricing FULLY shared. Theme tokens API shared, but hex colors + type stack PER-APP. Footer DATA shared (FAMILY_APPS/BOOKS/PACKAGES from astro-shell), but footer VISUAL per-app per content. Theme: ONE forced theme per app (NO dark/light toggle). NOT every app needs all 4 nav surfaces — only what's needed for AdSense + Play Store + MS Store approval gates."
tags: [decision, shared, divergent, family-wide, theme, no-toggle, matrix]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
supersedes_in_part: decisions/architecture/four-nav-surfaces-every-app
supersedes_in_part: decisions/architecture/auth-billing-polish-locks-2026-06-22-evening (theme-toggle section)
related:
  - rules/per-app-distinctive-frontend-design
  - decisions/architecture/single-pricing-page-package
  - decisions/architecture/payment-architecture-direct-links
  - rules/no-card-on-file
---

# Shared vs divergent — definitive family matrix

## Fully shared (via packages)

| Surface | Package | Why same |
|---|---|---|
| **Auth flow + chip** | `@chirag127/auth-core` | Cross-app SSO needs identical token handling |
| **Pricing page** | `@chirag127/astro-billing` | Same prices everywhere; same buttons |
| **Billing webhook handlers** | `@chirag127/astro-billing` (CF Pages Functions) | One signature-verify path per provider |
| **Firestore schema** | `@chirag127/astro-data` | Cross-app sync needs identical shape |
| **SEO meta + JSON-LD generators** | `@chirag127/oriz-seo` | Same `<SEO />` API everywhere |
| **Consent banner** | `@chirag127/oriz-consent` | Klaro EU/IN/US identical |
| **Analytics wrapper** | `@chirag127/oriz-analytics` | One init call per app |
| **Rate limit checks** | `@chirag127/oriz-rate-limit` | Same Free/Pro/Max caps |
| **AI provider chain** | `@chirag127/oriz-ai-providers` | Same fallback ladder |
| **Token API (CSS custom property NAMES)** | `@chirag127/astro-shell/tokens.css` | Same semantic tokens (`--color-bg`, `--color-fg`, `--space-1` … `--space-8`, `--motion-fast/medium/slow`, `--type-display/body/utility`) |
| **Footer DATA** | `@chirag127/astro-shell/family-data` | `FAMILY_APPS`/`BOOKS`/`PACKAGES` arrays |

## Divergent per-app (each app's own)

| Surface | What differs | Why |
|---|---|---|
| **Theme** | ONE forced theme per app (no toggle) | Per `per-app-distinctive-frontend-design` |
| **Color palette** | 4–6 hex per app (overrides token VALUES; keeps token NAMES) | Per content domain |
| **Type stack** | Display + body + utility chosen per-app | Per content domain |
| **Header design** | Per-app composition | Per content domain |
| **Wordmark** | Per-app typographic treatment | Per content domain |
| **Sidebar visual** | Per-app, OR absent if not needed | Per content domain |
| **BottomBar visual** | Per-app, OR absent if not needed | Per content domain |
| **Footer visual** | Per-app design; same data | Per content domain |
| **Hero composition** | Per-app "thesis" | Per content domain |
| **Signature element** | One memorable thing per app | Per content domain |
| **Motion** | Orchestrated per app | Per content domain |
| **Copy voice** | Per-app | Per content domain |

## Theme rule: ONE forced theme, NO toggle

User mandate (2026-06-22 evening): "We should not have a theme toggle. There should be only one theme forced upon everyone, so that everyone needs only one team. Choose the best theme according to the frontend-design skill, and only one theme will be there."

Each app picks its single best theme via frontend-design analysis. App ships with that theme locked. No `prefers-color-scheme` switching. No user toggle. No localStorage persistence.

This SUPERSEDES the earlier dark+light toggle decision from `auth-billing-polish-locks-2026-06-22-evening.md`.

## Nav surfaces are conditional, not mandatory

Not every app needs Header + Footer + Sidebar + BottomBar. Each app picks the surfaces appropriate for its content. Minimum required:

| Required for | Why |
|---|---|
| **Header with wordmark** | Brand identity |
| **Footer with privacy/terms/contact links** | AdSense approval requires these |
| **Privacy policy + ToS pages** | AdSense + Play Store + MS Store approval |
| **Contact form / contact info** | AdSense approval |
| **About page** | AdSense approval |

Optional per content domain:
- Sidebar (content apps yes; minimal tool apps no)
- BottomBar (mobile-heavy tools yes; reading-heavy content no)
- Search bar (content-rich apps yes; single-purpose tools no)
- Mega-sitemap footer (only home + packages-catalog; other apps minimal footer)

## SUPERSEDES

- `decisions/architecture/four-nav-surfaces-every-app.md` — the "all 4 surfaces required" mandate is reversed; surfaces are now conditional
- `decisions/architecture/auth-billing-polish-locks-2026-06-22-evening.md` — the dark+light theme toggle section is reversed; ONE forced theme per app

## Cross-refs

- Per-app distinctive frontend design rule → [[rules/per-app-distinctive-frontend-design]]
- Single pricing page package → [[decisions/architecture/single-pricing-page-package]]
- Payment architecture → [[decisions/architecture/payment-architecture-direct-links]]
- No card on file → [[rules/no-card-on-file]]
