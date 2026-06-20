---
type: decision
title: "14 atomic packages — drop oriz- prefix, maximum logical split"
description: "Replace the @chirag127/oriz-* package family with 14 atomic packages without the oriz- prefix. Each package has a single responsibility. /kit is a meta re-export. /config holds the one place to change oriz.in. Picked over 5 / 8 / 24 package counts."
tags: [architecture, packages, npm, monorepo, branding]
timestamp: 2026-06-20
status: superseded
superseded_by: decisions/architecture/packages-12-astro
---

# 14 atomic packages — drop oriz- prefix, maximum logical split

> **SUPERSEDED 2026-06-20 evening.** All 14 atomic packages
> (firebase-init, auth-ui, contact-form, sidebar, family, config, theme,
> multi-search, footer, header, seo, analytics, consent, kit) were
> deleted from GitHub same day. None were published to npm.
>
> Replaced by **8 atomic Astro-prefixed packages** (locked count, with
> WASM-category packages added if/when needed for a max of 12):
>
> | Package | Role |
> |---|---|
> | `@chirag127/astro-shell` | Astro 6 build + integrations + layouts |
> | `@chirag127/astro-chrome` | Header + Footer + SEO + Analytics + Consent + Privacy templates |
> | `@chirag127/astro-tools` | ToolGrid + tools.ts type for tool sites |
> | `@chirag127/astro-config` | tsconfig + biome + tailwind preset + reusable workflow |
> | `@chirag127/astro-icons` | Lucide subset re-export |
> | `@chirag127/astro-ai` | Puter.js + token counting + auth flow |
> | `@chirag127/astro-forms` | RHF + Zod + shadcn form wrappers |
> | `@chirag127/astro-data` | TanStack Query + Firestore helpers |
>
> Future expansion (deferred until first consumer needs them):
> `@chirag127/astro-pdf`, `@chirag127/astro-image`, `@chirag127/astro-video`.
> Total cap: 12.
>
> See [`knowledge/log/session-2026-06-20-evening.md`](../../log/session-2026-06-20-evening.md)
> for the rationale (solo-dev maintenance burden + same-name rule).
>
> The original 14-package design below is preserved for audit trail.

---

# 14 atomic packages — drop oriz- prefix, maximum logical split

## The decision

Collapse-then-explode the package family: drop the `oriz-` prefix from every package name, split aggressively into **14 atomic packages**, each with a single responsibility. One meta-package (`@chirag127/kit`) re-exports everything for sites that don't care about tree-shake granularity.

This is the "maximum number of packages that look good and logical" the user asked for, after rejecting both the conservative (5-pkg) and very aggressive (24-pkg) ends of the range.

## The 14 packages

| # | Package | Single responsibility |
|---|---|---|
| 1 | `@chirag127/firebase-init` | Init Firebase from env vars; return typed `{auth, db, storage, functions}`. Zero React. Zero UI. |
| 2 | `@chirag127/auth-ui` | `<AccountPanel>`, `<FinishSignIn>`, sign-in / sign-out flows. Takes `auth` as a required prop. |
| 3 | `@chirag127/contact-form` | `<ContactForm>` backed by web3forms |
| 4 | `@chirag127/sidebar` | `<Sidebar>` component, generic. Takes a config matching the 4 tier shapes. |
| 5 | `@chirag127/family` | Site registry — the source-of-truth table of all site repos (name, subdomain, role, status). |
| 6 | `@chirag127/config` | Base URL (`oriz.in`), brand string (`Oriz`), env-var schema, derived URLs (`api.oriz.in`, `s.oriz.in`, `cdn.oriz.in`, `auth.oriz.in`). **The "one place to change oriz.in".** |
| 7 | `@chirag127/theme` | Dark theme tokens (CSS vars + Tailwind v4 preset), font stack, color palette. Near-black `#0a0a0a`–`#121212` per the dark-only rule. |
| 8 | `@chirag127/multi-search` | `<MultiSearch>` button — the multi-engine "search the web" component shipped on every page. See [multi-engine-search-button.md](./multi-engine-search-button.md). |
| 9 | `@chirag127/footer` | `<OrizFooter>` shared chrome footer with family directory + status link |
| 10 | `@chirag127/header` | `<OrizHeader>` shared chrome header with search + account-menu slots |
| 11 | `@chirag127/seo` | `<SEO>` head tags, OG image config, Twitter card, JSON-LD schema |
| 12 | `@chirag127/analytics` | CF Web Analytics + PostHog + Sentry init wired to consent state |
| 13 | `@chirag127/consent` | Klaro 5-category integration, geo-routed defaults. See [consent-management-multi-category.md](../security/consent-management-multi-category.md). |
| 14 | `@chirag127/kit` | Meta-package: re-exports the 13 above. One-stop import for sites that don't care about tree-shake granularity. |

## What each site imports

Most sites import only `@chirag127/kit` and let tree-shaking handle the rest. Sites with strict bundle budgets (the 15 tool sites) import the granular packages directly to skip e.g. `@chirag127/auth-ui` if they don't need account.

## Migration from the current 5-package + shim setup

The current state (as of 2026-06-19):

- `@chirag127/oriz-ui` — v2 deprecation shim re-exporting from the 5-package split
- `@chirag127/firebase-init`, `/auth-ui`, `/contact-form`, `/sidebar`, `/oriz-family` — the 5 split packages

Migration:

1. **Rename** `@chirag127/oriz-family` → `@chirag127/family`. Other 4 packages already without `oriz-` prefix; keep names.
2. **Create** the 9 new packages: `/config`, `/theme`, `/multi-search`, `/footer`, `/header`, `/seo`, `/analytics`, `/consent`, `/kit`.
3. **Move** the multi-search button code from `oriz-kit` (where it lives now per [multi-engine-search-button.md](./multi-engine-search-button.md)) into `@chirag127/multi-search`. Update the cross-reference in that decision.
4. **Repurpose** `@chirag127/oriz-ui` v3.0.0 — change the deprecation shim to re-export from the new 14-package family for one more cycle. Then delete in v4.
5. **`@chirag127/kit`** becomes the new "if in doubt, import from here" package. The old `oriz-kit` namespace gets re-pointed.

## Why 14, not 5/8/24

Default recommendation was `firebase-init, auth-ui, sidebar, family, config` (5). User picked 14 — "maximum number that look good and logical." Reasoning:

- **24+** starts shipping packages like `@chirag127/forms-honeypot` and `@chirag127/og-fonts` — splits that earn nothing. Each version bump cascades. Diminishing returns.
- **5** keeps too much in `family` (registry + config + theme tokens all rolled together) — violates "each does one thing".
- **8** gets the obvious wins (config, theme, multi-search) but leaves `header`/`footer`/`seo`/`analytics`/`consent` rolled into `kit`, where they can't be reused without pulling in the whole bundle.
- **14** is the level at which every package answers "what's in here?" with one short sentence. Past 14 the answers start needing examples; before 14 the answers cover too much.

## The "user wants maximum packages" taste rule

This decision plus the override on tools (15 separate repos vs 1 monorepo) pattern: **user prefers atomic split over consolidation**. Captured as a meta-preference in [user-prefers-atomic-split.md](../../rules/user-prefers-atomic-split.md).

## Related

- [multi-engine-search-button.md](./multi-engine-search-button.md) — moved into `@chirag127/multi-search`
- [tools-site-15-repos.md](./tools-site-15-repos.md) — the 15 tool repos consume this package family
- [user-prefers-atomic-split.md](../../rules/user-prefers-atomic-split.md) — taste rule learned from this decision
