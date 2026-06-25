---
type: decision
title: "Chrome contract \u2014 @chirag127/astro-chrome v0.1"
description: "Locked: generic components driven by 4 per-site config files; 3-level\
  \ sidebar (Section \u2192 Group \u2192 Leaf); shared Datasheet Dark tokens across\
  \ every site (no per-site accent); Iosevka wordmark stamp (slug-only, no ORIZ prefix);\
  \ 24 auto-generated legal pages; pnpm workspace at the workspace umbrella root."
tags:
- architecture
- chrome
- components
- config
- design
- legal
- pnpm
- workspace
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/general/per-runtime-framework
- decisions/architecture/frontend/sidebar-4-tier
- decisions/design/datasheet-dark
- decisions/architecture/stack/a11y-three-tools
- decisions/architecture/frontend/multi-engine-search-button
- rules/development/astro-version-pin
---



# Chrome contract — @chirag127/astro-chrome v0.1

## Decision

The shared visual chrome (Header, Sidebar, BottomBar, Footer, Stamp,
SEO, Auth, Analytics, Consent, 24 legal pages) lives in
`@chirag127/astro-chrome`. Every site shares the SAME components.
Per-site differences come from 4 config files in `src/config/`. Zero
component duplication across the family.

## Component model — GENERIC + CONFIG-driven

Components in `astro-chrome/src/components/`:
- `Stamp.astro` — plain Iosevka Etoile wordmark of the full repo slug. NO SVG stamp. NO `ORIZ ·` prefix. Color `--stamp` on `--ink-0`.
- `Header.astro` — slim 60px bar. Stamp on left; MultiSearch + AuthButton on right.
- `Sidebar.astro` — 260px desktop, hamburger drawer below 768px. 3-level tree.
- `BottomBar.astro` — 32px hairline strip. "// updated YYYY-MM-DD" left · §toc center · ↩ top right.
- `Footer.astro` — 2-col (this site pages + family directory) + bottom strip "Built with Astro · 2026".
- `SEO.astro` — Open Graph + Twitter card + JSON-LD article schema.
- `Analytics.astro` — 5-tier stack (CFWA + Sentry + PostHog + Clarity + GA4) consent-gated.
- `Consent.astro` — Klaro 5-category banner, geo-routed.
- `AuthButton.tsx` — React island. Modal dialog (NOT route) with Email-link + Google + GitHub + Apple visible; Anonymous/Microsoft/Passkeys behind "More options".
- `MultiSearch.tsx` — React island. Popover + 7 engines.
- `Layouts/FamilyLayout.astro` — composes Header + Sidebar + BottomBar + Footer with slots for `head`, `sidebar`, `main`, `bottom`.

Components read everything from `import { site, nav, sidebar, footer } from '~/config'`.
**Every site has identical chrome at the component level.** Differences
are content, not code.

## 3-level sidebar shape

```
SECTION (uppercase eyebrow label, non-clickable)
  GROUP (clickable title → /<group>/ overview page; chevron → collapse)
    LEAF (link to sub-page)
```

- Group has two affordances: title navigates, chevron collapses (industry standard — GitHub, Linear, Notion).
- Collapse state persists in localStorage per site.
- Mobile (<768px): sidebar disappears; hamburger in header → full-screen drawer.
- Tree comes from `src/config/sidebar.ts` in each site.

## 4 per-site config files

Each site has 4 small config files in `src/config/`:

| File | Exports | Purpose |
|---|---|---|
| `site.ts` | `siteName`, `siteRole`, `subdomain`, `brand`, `jurisdiction` | Identity, used by Stamp + legal pages |
| `nav.ts` | `headerActions[]` | Header right-side actions (search, auth) |
| `sidebar.ts` | `sidebarTree: SidebarNode[]` | 3-level sidebar tree |
| `footer.ts` | `columns[]`, `familyDirectory[]` | Footer two-column content |
| `index.ts` | barrel re-export | One-import for components |

Total per-site config: ~40 lines. New site = clone starter + edit
config + run `pnpm build`.

## Shared theme — Datasheet Dark family-wide

Tokens locked in `@chirag127/astro-chrome/src/tokens.css`. NO per-site
accent. Every site uses the same `--ink-*`, `--paper-*`, `--stamp`
values. Family identity comes from the shared visual language; per-site
identity comes from CONTENT (wordmark text, sidebar tree, footer
columns). See [`decisions/design/datasheet-dark.md`](../../design/datasheet-dark.md).

## Auth UX

- **Modal dialog**, not route. Triggered from avatar button. No `/signin` route.
- Default visible providers: Email-link + Google + GitHub + Apple.
- Hidden behind "More options": Anonymous + Microsoft + Passkeys.
- Sign-in and sign-up are the same flow (Firebase auto-creates).
- **Logged-out behavior**: sites are FULLY USABLE without auth. Soft paywall after 5 conversions per device (tracked in localStorage, no server cost). Banner reads: "Sign in to keep converting — free, unlocks history + cross-device save."

## Analytics defaults

ALL 5 tools ON in production: CFWA + Sentry + PostHog + Clarity + GA4.
ALL 5 OFF in `pnpm dev` (devmode). Kill-switch per-tool via
`ENABLE_<TOOL>=false` env var. CFWA always-on regardless (it's
cookieless + GDPR-safe).

## Error handling

- Every React island wrapped in `<ErrorBoundary>` that logs to Sentry + renders minimal fallback ("Something went wrong. Try refresh.").
- Astro routes wrap top-level renders in try/catch.
- Sentry replay link attached to error reports.

## JS-disabled fallback

- **Content pages** (blog, legal, about) work no-JS — Astro default.
- **Tool islands** gracefully degrade: form visible + banner "This tool runs in your browser; enable JavaScript to use it."
- SEO-friendly: content stays readable, only tools become unusable.

## Motion budget

- Page-load fade-in: 150ms opacity 0→1
- Scroll-triggered reveal on hero (subtle slide-up + opacity)
- Hover micro-interactions (color shift on links, border highlight on chips)
- Sidebar collapse: 120ms slide
- `prefers-reduced-motion: reduce` respected family-wide
- NO confetti, NO Lottie, NO parallax, NO scroll-jacking

## Microcopy voice

- Plain English + active voice + sentence case
- No exclamation marks, no "awesome / amazing / unlock"
- Labels match action: button "Save changes" produces toast "Changes saved"
- Errors say what went wrong + how to fix it — never apologize, never vague
- Empty states are invitations to act

Per the frontend-design skill's writing section. Authored copy is design
material, not decoration.

## Accessibility floor — WCAG 2.2 AA

- Lighthouse Accessibility score ≥ 95 in CI (PR fails below 95)
- Keyboard navigation for every interactive element, visible focus rings
- `prefers-reduced-motion` respected (see Motion budget)
- 3-tool CI: axe-core + Pa11y + Lighthouse (per `architecture/a11y-three-tools.md`)
- WCAG 2.2 AA, NOT 2.1 (current spec)

## Performance budget

No fixed bundle-size budget (per latest user direction). Lighthouse
Performance score ≥ 80 in CI is the floor. Sites that need more JS
budget for heavy WASM (pdf-tools, image-tools, video-tools, audio-tools)
are not blocked by an absolute KB cap.

## Search — hybrid Algolia + Pagefind + MultiSearch

- **MultiSearch** (always) — popover in Header, 7 engines (Google/Bing/DDG/Kagi/Brave/Marginalia/Ecosia), runs site-scoped query externally. Already built in `astro-chrome/src/components/MultiSearch.tsx`.
- **Pagefind** (static index) — for small content sites (lore, ncert, roam, me, janaushdhi). Build-time index, no runtime infra.
- **Algolia** (hosted) — for big content sites (pages, tabs). Indexed via Crawler add-on, free InstantSearch UI.

Two surfaces in the search popover: "this site" (Pagefind/Algolia) and
"the web" (MultiSearch).

## 24 legal pages

All 24 ship in `astro-chrome/src/legal/` as Astro components with
`{site.brand}` / `{site.subdomain}` / `{site.jurisdiction}` placeholders.
Hand-written templates (NOT paid Termly/iubenda). Text references
analytics + auth + monetization SDKs auto-fetched from
`<site>/package.json`.

Slugs: privacy, terms, cookies, imprint, refund, sub-processors, dpa,
gdpr-rights, ccpa-rights, dpdp-rights, accessibility, security,
vulnerability, dmca, trademark, attribution, community, takedown,
age-gating, affiliate-disclosure, ad-disclosure, sponsored, changelog,
status.

Privacy text auto-updates when site `package.json` deps change. Updates
require a chrome version bump + family-wide `pnpm update --recursive`.

## Shared package consumption — pnpm workspace

`pnpm-workspace.yaml` lives at the existing `chirag127/workspace`
umbrella root. Workspace members:
- `repos/oriz/own/lib/npm/*` (8 astro-* packages)
- `repos/websites/*` (9 single-name sites)
- `repos/websites/tools/*` (15 tool sites)

`pnpm install` from workspace root installs everything with hoisted
deps. Edit a shared package → changes hot-reload in every consumer
site. Published to npm on tag.

## Cross-refs

- [decisions/architecture/per-runtime-framework](./per-runtime-framework.md)
- [decisions/design/datasheet-dark](../../design/datasheet-dark.md)
- [decisions/architecture/sidebar-4-tier](../frontend/sidebar-4-tier.md) — predecessor (4-tier preset categories, refined here to 3-level depth per node)
- [decisions/architecture/a11y-three-tools](../stack/a11y-three-tools.md)
- [decisions/architecture/multi-engine-search-button](../frontend/multi-engine-search-button.md) — MultiSearch component spec
- [decisions/architecture/analytics-five-tier-stack](../ops/analytics-five-tier-stack.md)
- [decisions/security/multi-provider-auth](../../security/multi-provider-auth.md) — 6-provider Firebase Auth stack
- [decisions/security/consent-management-multi-category](../../security/consent-management-multi-category.md) — Klaro 5-category
- [rules/astro-version-pin](../../../rules/development/astro-version-pin.md)
- [runbooks/scaffold-a-new-site](../../../runbooks/operations/scaffold-a-new-site.md)
