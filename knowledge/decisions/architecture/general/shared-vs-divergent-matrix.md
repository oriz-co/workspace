---
type: decision
title: Shared-vs-divergent matrix family-wide (FINAL 2026-06-22 evening)
description: "Definitive matrix of what is shared via packages vs what diverges per-app.\
  \ Auth FULLY shared. Pricing FULLY shared. Theme tokens API shared, but hex colors\
  \ + type stack PER-APP. Footer DATA shared (FAMILY_APPS/BOOKS/PACKAGES from astro-shell),\
  \ but footer VISUAL per-app per content. Theme: ONE forced theme per app (NO dark/light\
  \ toggle). NOT every app needs all 4 nav surfaces \u2014 only what's needed for\
  \ AdSense + Play Store + MS Store approval gates."
tags:
- decision
- shared
- divergent
- family-wide
- theme
- no-toggle
- matrix
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
supersedes_in_part: decisions/architecture/auth-billing-polish-locks-2026-06-22-evening
  (theme-toggle section)
related:
- rules/design/per-app-distinctive-frontend-design
- decisions/architecture/packages/single-pricing-page-package
- decisions/architecture/security/payment-architecture-direct-links
- rules/interaction/no-card-on-file
---



# Shared vs divergent — definitive family matrix

## Fully shared (via packages)

### SHARED ROUTES (every app must have these at the same path)

Required:
- `/` — each app's home page (route same; content per-app)
- `/privacy` — `@chirag127/astro-chrome/legal/Privacy.astro`
- `/terms` — `@chirag127/astro-chrome/legal/Terms.astro`
- `/contact` — `@chirag127/astro-chrome/legal/Contact.astro`
- `/about` — `@chirag127/astro-chrome/legal/About.astro` (slot for app-specific copy)
- `/refunds` — `@chirag127/astro-chrome/legal/Refunds.astro`
- `/disclaimer` — `@chirag127/astro-chrome/legal/Disclaimer.astro`
- `/pricing` — `@chirag127/astro-billing/Pricing.astro` (3-tier table, same prices)
- `/sign-in` — `@chirag127/auth-core/SignIn.astro`
- `/sign-out` — `@chirag127/auth-core/SignOut.astro`
- `/account` — `@chirag127/auth-core/Account.astro` (subscription state, profile)

Optional but recommended (same code everywhere when present):
- `/changelog` — auto from git tags + GH releases
- `/status` — embedded UptimeRobot status badge
- `/feedback` — form → posts to GH Issues
- `/sponsors` — Ko-fi / GH Sponsors / BMC links

### SHARED SHELL + INFRASTRUCTURE

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

User caveat (2026-06-22 evening): "Only the things that don't make the experience of the app or website worse should be kept divergent." If divergence harms UX, keep it same instead.

## Nav surfaces ARE mandatory everywhere (re-instated 2026-06-22 evening)

User clarified (final, 2026-06-22 evening): every app has all 4 nav surfaces (Header + Footer + Sidebar + BottomBar). This reverses the "conditional" wording from earlier in this file. The 4-nav-surfaces decision STANDS, with the per-app visual design caveat.

| Surface | Required? | Visual treatment |
|---|---|---|
| Header | YES | DIFFERENT per app (bespoke design) |
| Footer | YES | DIFFERENT per app (bespoke design) |
| Sidebar | YES | DIFFERENT per app (drawer/column/dock — per content) |
| BottomBar | YES | DIFFERENT per app (icons + style per content) |

The legal pages, /pricing, /sign-in etc. routes are mounted on every app per the SAME-routes list above. The 4 surfaces wrap all of them.

## Footer is DIFFERENT per app (not shared)

Reversal: footer is NOT shared. Each app draws its own footer with its own theme. The `FAMILY_APPS`/`BOOKS`/`PACKAGES` arrays are still available from `@chirag127/astro-shell/family-data` for apps that want to surface family-wide links — but the visual is each app's own choice.

## Theme tokens: NAMES same, VALUES per-app

CSS custom property names locked family-wide (via `@chirag127/astro-shell/tokens.css`):

```css
:root {
  --color-bg: ...;
  --color-fg: ...;
  --color-accent: ...;
  --color-muted: ...;
  --color-border: ...;
  --space-1 ... --space-8;
  --motion-fast / --motion-medium / --motion-slow;
  --font-display / --font-body / --font-utility;
  --radius-sm / --radius-md / --radius-lg;
}
```

Each app OVERRIDES the values per its design brief (subject-driven palette + type). The semantic NAMES never change, so components from packages work in every app.

---


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
