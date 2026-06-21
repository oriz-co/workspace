---
type: architecture
title: The twenty-two packages — 8 on disk + 14 to add
description: The shared client-side surface for the family is 22 `@chirag127/astro-*` packages. 8 exist on disk today (shell, chrome, config, data, forms, icons, tools, ai); 14 to add cover distribution, PWA, content, billing, search, MDX, TOC, comments, share, newsletter, affiliate, keyboard, feedback, test-utils. Apps stay near-empty so each builds to PWA + APK + EXE from one repo.
tags: [architecture, packages, astro, npm]
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
  - architecture/package-isolation-rule
  - architecture/repo-layout
  - architecture/cross-site-auth-via-auth-oriz-in
  - decisions/architecture/chrome-config-contract
---

# The twenty-two packages — 8 on disk + 14 to add

## Concept

The shared client-side surface is split across `@chirag127/astro-*` packages so apps stay near-empty: an app's `astro.config.ts` is ~4 lines, an app's `src/` holds only routes and content. 8 packages exist today; 14 more are planned where the same code is already repeated in ≥3 apps. The single distribution package collapses every app into PWA + Android APK + desktop EXE/dmg/AppImage from one `pnpm build`.

## How it works

### On disk today (8)

| Package | What it owns |
|---|---|
| `@chirag127/astro-shell` | Astro 6 base config, integrations, Tailwind v4 preset, Base layout, reusable CF Pages deploy workflow. |
| `@chirag127/astro-chrome` | Header, Sidebar, BottomBar, Footer, Stamp, SEO meta + JSON-LD, Auth UI, Analytics + Consent (Klaro), all 24 legal pages. Owns Datasheet Dark tokens + fonts. |
| `@chirag127/astro-config` | Shared `tsconfig.json` extend-from, `biome.json`, Tailwind preset, reusable GH Actions workflow templates. Zero runtime deps. |
| `@chirag127/astro-data` | TanStack Query setup, typed Firestore helpers, LocalStorage hooks. |
| `@chirag127/astro-forms` | react-hook-form + Zod resolvers + shadcn-style Form wrappers + honeypot + Web3Forms client. |
| `@chirag127/astro-icons` | Lucide subset re-export + `<Icon>` wrapper + size presets. |
| `@chirag127/astro-tools` | `<ToolGrid>` + `<ToolCard>` + `<ToolPage>` on top of astro-chrome. Used by the 15 tool apps. |
| `@chirag127/astro-ai` | Puter.js wrappers + token counting + streaming + auth flow. |

### To add (14) — each fills a per-app duplication

| Package | What it owns | Replaces |
|---|---|---|
| `@chirag127/astro-distribute` | Thin CLI wrapping [PWABuilder](https://pwabuilder.com) (primary — AAB / MSIX / iOS-project from the deployed PWA, no per-app native code) + optional `--tauri` flag for desktop EXE/dmg/AppImage with auto-update. iOS XCode project is generated but never published (no Apple Developer Program). | All per-app native-wrapper boilerplate |
| `@chirag127/astro-pwa` | Thin wrap of `@vite-pwa/astro` with locked defaults (manifest fed from astro-chrome brand, offline shell, `<InstallPrompt>`, `<UpdateToast>`). | The `vite-pwa` config block copy-pasted in every app's `astro.config.ts` |
| `@chirag127/astro-content` | Zod content-collection schemas (post / book / card / journal), RSS + Atom + JSON-Feed generators, sitemap glue, IndexNow ping, OG-card emit. | Every content-app's `src/content/config.ts`, 3 feed routes, sitemap glue, IndexNow script |
| `@chirag127/astro-billing` | Razorpay client + license-key verify + `<Paywall>` + `<PriceTag>`. Implements the one-subscription-unlocks-all flow. | Future billing boilerplate before it duplicates across apps |
| `@chirag127/astro-search` | `<MultiSearch>` popover (multi-engine web search) + `<SiteSearch>` (Pagefind local index, built at deploy time). | The per-site search UI + Pagefind wiring |
| `@chirag127/astro-mdx` | Shared MDX components: `<Callout>`, `<Aside>`, `<Figure>`, `<ImageCompare>`, `<KaTeX>`, `<CodeBlock>` (Shiki + copy + line-highlight). | Per-app MDX component sets repeated across 7 content apps + `me` |
| `@chirag127/astro-toc` | Auto table-of-contents from `<h2>`/`<h3>` with sticky sidebar + scroll-spy + jump-to. | TOC logic in every long-form content app |
| `@chirag127/astro-comments` | Giscus wrapper with dark theme + lazy-load + reply-count fetch. | Per-app Giscus init across blog, journal, ncert, lore, cards |
| `@chirag127/astro-share` | `<ShareBar>` — X / LinkedIn / copy-link / QR / native-share fallback. | Per-app share UI |
| `@chirag127/astro-newsletter` | `<NewsletterForm>` — Buttondown primary, EmailOctopus fallback, honeypot, double-opt-in. | Per-app newsletter signup across blog, me, journal, hub |
| `@chirag127/astro-affiliate` | Disclosure banner + `<AffiliateLink>` (UTM tracking + `rel=nofollow sponsored` + click ping). | Per-app affiliate plumbing on cards + lore |
| `@chirag127/astro-keyboard` | Global Cmd-K palette + `?` shortcuts overlay + `/` focus-search. | Per-app keyboard handlers |
| `@chirag127/astro-feedback` | "Was this helpful?" thumbs + optional textarea, ships to Web3Forms / Firestore. | Per-app feedback widget across content + tools |
| `@chirag127/astro-test-utils` | Vitest mocks (Firestore, Razorpay, Web3Forms) + Playwright fixtures + MSW handlers. | Per-repo test scaffolding |

### Explicitly NOT new packages (folded in)

- SEO meta / JSON-LD → `astro-chrome` (already owns SEO)
- Auth UI, Analytics, Consent, 24 legal pages → `astro-chrome` (already owns these)
- Header / Sidebar / Footer / Stamp / StatusBanner / Image wrapper → `astro-chrome` (single-component additions don't justify a new repo)
- `firebase-init` standalone → `astro-data` already wraps Firestore; init is a few lines
- `newsletter`, `omnipost` → server-side concerns; live in `apps/api/` or a Worker, not a client package
- A second "kit" umbrella → `astro-shell` is the family base layer; no second umbrella

## How a consuming app looks

```ts
// astro.config.ts
import { defineConfig } from 'astro/config'
import { shell } from '@chirag127/astro-shell'
import { pwa } from '@chirag127/astro-pwa'              // planned
import { content } from '@chirag127/astro-content'      // planned (content sites only)

export default defineConfig(shell({
  site: 'https://blog.oriz.in',
  integrations: [pwa({ name: 'Oriz Blog' }), content()],
}))
```

```jsonc
// package.json — typical content app
{
  "dependencies": {
    "@chirag127/astro-shell":      "workspace:*",
    "@chirag127/astro-chrome":     "workspace:*",
    "@chirag127/astro-content":    "workspace:*",
    "@chirag127/astro-pwa":        "workspace:*",
    "@chirag127/astro-distribute": "workspace:*"
  },
  "scripts": {
    "dev":   "astro dev",
    "build": "astro build && astro-distribute build"
  }
}
```

The `astro-distribute build` step is the lazy path to PWA → APK → EXE without per-app wrapping config.

## Why this shape

The split-by-surface pattern decouples reorganisation from churn. Apps depend on small, named packages; the family rearranges internals over time without modifying any app.

Apps are near-empty by design: every duplicated concern is pushed into a package the first time a third app needs it. This is the [package-isolation-rule](package-isolation-rule.md) applied to the client surface — the rule applies symmetrically to server-side routes under `apps/api/src/routes/`.

The kit-umbrella ("oriz-kit") pattern from earlier iterations is gone — `astro-shell` is the base layer, every other package is a peer. Apps import packages by name, not via a single re-export.

## Cross-refs

- The rule that drives this split → [package-isolation-rule.md](package-isolation-rule.md)
- Where packages sit in the repo → [repo-layout.md](repo-layout.md)
- The auth flow these packages plug into → [cross-site-auth-via-auth-oriz-in.md](cross-site-auth-via-auth-oriz-in.md)
- The Chrome contract spec → [../decisions/architecture/chrome-config-contract.md](../decisions/architecture/chrome-config-contract.md)
- Building the distributables → [../runbooks/build-distributable.md](../runbooks/build-distributable.md)
