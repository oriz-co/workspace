---
type: decision
title: 'FINAL: Every visual surface per-app; only behavior/utility packages stay shared'
description: 'Locked 2026-06-22 evening. Resolves the multi-reversal sequence on shared-vs-divergent
  chrome. FINAL POLICY: every VISUAL surface (Header / Footer / Sidebar / BottomBar
  / Wordmark / token CSS variable NAMES) is FULLY per-app. NOTHING visual shipped
  from packages. Only behavioral / utility / non-visual packages stay shared (auth-core,
  astro-billing, oriz-seo, oriz-analytics, oriz-consent, oriz-ai-providers, oriz-rate-limit,
  astro-data, astro-pwa, astro-content, astro-forms, astro-distribute, astro-test-utils,
  omni-publish, oriz-book-build, oriz-ui ContactForm). Legal pages per-app (no shared
  LegalFooter). Every footer includes 6 standard legal links (/privacy /terms /contact
  /about /refunds /disclaimer) with per-app visual treatment. Triple-supersedes the
  on-again/off-again shared-chrome reversals from earlier same-day.'
tags:
- decision
- FINAL
- shared
- divergent
- per-app
- scrap
- chrome
- visual
- behavior
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
supersedes:
- decisions/architecture/four-nav-surfaces-every-app
- decisions/architecture/shared-vs-divergent-matrix
- decisions/architecture/maximalist-footer-and-monetization-everywhere
- decisions/architecture/footer-per-app-with-universal-legal
- decisions/architecture/legal-pages-package-in-domain
related:
- rules/design/per-app-distinctive-frontend-design
- rules/design/frontend-design-skill-baked-in
- rules/agent/grill-on-loc-removal
---



# FINAL per-app visual, shared behavior

## Resolution

After multiple same-day reversals on shared-vs-divergent chrome (sweeps #3, #4, #5 + 6+ knowledge supersessions), user locked the FINAL policy 2026-06-22 evening:

> "Everything should be unique according to the [design]. Only combine them if there are really so everything is same into the everything. According to the design brief everything is same. If it is really same everything is same then only make a fully combined component. But I think that they are completely different for all of the apps or even if they are same, they are very less same."

Translation: NOTHING visual is shipped from a shared package. Each app draws everything fresh per its design brief. Shared packages are utility/behavior only.

## What's SHARED (via npm packages, every app imports)

| Package | Purpose | Why shared |
|---|---|---|
| `@chirag127/auth-core` (+ auth-wxt, auth-vsc, auth-cli) | Firebase Auth config + sign-in flow | Cross-app SSO REQUIRES identical token handling |
| `@chirag127/astro-billing` | Pricing page component + Razorpay/Paddle integration | Single payment ledger; same prices everywhere |
| `@chirag127/oriz-seo` | sitemap + IndexNow + JSON-LD + OG image gen | Same SEO semantics across family |
| `@chirag127/oriz-analytics` | CF Web Analytics + GA4 + Clarity + Sentry wrapper | One init call per app |
| `@chirag127/oriz-consent` | Klaro consent banner (EU + India DPDP + US GPC) | Approval-gate uniformity |
| `@chirag127/oriz-ai-providers` | 20-provider LLM fallback chain | Single calling convention |
| `@chirag127/oriz-rate-limit` | Free/Pro/Max tier usage caps | Same caps everywhere |
| `@chirag127/astro-data` | Firebase + Firestore client + TanStack Query | Same data shape |
| `@chirag127/astro-pwa` | PWA manifest + service worker helper | Same offline pattern |
| `@chirag127/astro-content` | RSS / Atom / JSON Feed helpers | Same feed semantics |
| `@chirag127/astro-forms` | RHF + Zod + Web3Forms wrapper | Same form validation |
| `@chirag127/astro-distribute` | PWABuilder CLI wrapper | Same native distribution |
| `@chirag127/astro-test-utils` | Vitest + MSW + Playwright fixtures | Same testing surface |
| `@chirag127/omni-publish` | Cross-post engine | Same release fan-out |
| `@chirag127/oriz-book-build` | Pandoc wrapper | Same book pipeline |
| `@chirag127/oriz-ui` | `<ContactForm />` stub component | Single contact form |

## What's PER-APP (zero sharing)

| Surface | Each app owns its... |
|---|---|
| Header | own `src/components/Header.astro` (or .tsx) |
| Footer | own `src/components/Footer.astro` with 6 legal links inline |
| Sidebar | own `src/components/Sidebar.astro` (or omit if app doesn't need one) |
| BottomBar | own `src/components/BottomBar.astro` (or omit if not mobile-heavy) |
| Wordmark | own `src/components/Wordmark.astro` |
| Layout wrapper | own `src/layouts/BaseLayout.astro` |
| CSS tokens | own `src/styles/tokens.css` (NAMES can differ — `--paper` here / `--bg` there) |
| Color palette | own |
| Type stack | own |
| Hero composition | own |
| Signature element | own |
| Motion language | own |
| /privacy /terms /contact /about /refunds /disclaimer pages | own `src/pages/<page>.astro` with app-specific copy |

## Footer requirements (universal but visual-per-app)

Every app's footer MUST include links to the 6 standard legal routes:

- `/privacy`
- `/terms`
- `/contact`
- `/about`
- `/refunds`
- `/disclaimer`

Each app's footer designs these 6 links however fits its brief. The 6 routes themselves are per-app pages.

## Packages reduced or deprecated

- **`@chirag127/astro-chrome`** — was the Header/Footer/Wordmark/Sidebar/BottomBar/legal home. **Deprecated**: future v0.1.8 strips out visual exports; package becomes empty (or absorbed into astro-shell). Existing v0.1.0–0.1.7 versions remain on npm for audit but no app should import from them after migration.
- **`@chirag127/astro-shell`** — was tokens.css + shell() config + family-data + react integration. **Reduced**: drops tokens.css export; keeps shell() Astro defineConfig helper + family-data (FAMILY_APPS arrays) + types. The family-data arrays are data, not visual.

## Migration sweep

Once the 5 in-flight agents land (env-sync + maximalist-footer + home-redesign + blog-layout + 16-tools-build), spawn the SCRAP-AND-MIGRATE agent:

For each of 5 priority apps (home, blog, ncert, janaushdhi, packages-catalog):

1. Identify every import from `@chirag127/astro-chrome` for visual components
2. Inline the equivalent into the app's `src/components/`
3. Customize per its design brief
4. Remove the `@chirag127/astro-chrome` import (or downgrade to ContactForm-only)
5. Move shared `astro-shell/tokens.css` into the app's own `src/styles/tokens.css`
6. Same migration for the 16 tools apps (once their v0 lands)

Total LOC migrated: roughly equal to the 4,000 LOC dedup'd in earlier sweeps. Per Rule 12 (≥50 LOC threshold), grill BEFORE migrating — this decision file IS that grill.

## Why this final shape

The shared-package experiment failed three times because the apps are genuinely different products, not skins of one product. Trying to share visual code FORCED the apps to look the same OR forced complex slot APIs that became LARGER than per-app code. Per the frontend-design Rule 13: each app needs its own distinctive identity — the brief calls for differentiation.

Shared utility/behavior packages remain because they encode TRUE family contracts (one Firebase project, one pricing model, one analytics stack, one AI fallback ladder). Those contracts don't fight the visual brief.

## Supersedes

This decision SUPERSEDES (entirely or in critical part):

- `decisions/architecture/four-nav-surfaces-every-app.md` — all 4 surfaces still required, but each PER-APP (not from package)
- `decisions/architecture/shared-vs-divergent-matrix.md` — the SHARED column shrinks; visual columns all move to DIVERGENT
- `decisions/architecture/maximalist-footer-and-monetization-everywhere.md` — footer was "same visual"; now "same legal link semantics, per-app visual"
- `decisions/architecture/footer-per-app-with-universal-legal.md` — the `<LegalFooter />` shared sub-component is dropped; each app's footer is fully its own
- `decisions/architecture/legal-pages-package-in-domain.md` — `astro-chrome/legal/*` package is deprecated; each app owns its legal pages

## Cross-refs

- Per-app distinctive design rule → [[rules/per-app-distinctive-frontend-design]]
- Frontend-design baked-in (Rule 13) → [[rules/frontend-design-skill-baked-in]]
- Grill on LOC removal (Rule 12, 50-line threshold) → [[rules/grill-on-loc-removal]]
