---
type: architecture
title: The fourteen packages — the locked oriz family package set
description: The chirag127/oriz family ships 14 packages — 10 Astro (shell, chrome, tools, content, data, forms, billing, pwa, distribute, widgets) + 4 cross-surface auth (auth-core, auth-wxt, auth-vsc, auth-cli). Threshold for being a package — ≥25 lines duplicated across ≥3 consumers AND no community library covers it. Anything below the threshold is inlined.
tags: [architecture, packages, astro, npm, locked]
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
supersedes:
  - decisions/architecture/zero-chirag127-packages
  - decisions/architecture/cross-surface-package-set
related:
  - architecture/package-isolation-rule
  - architecture/repo-layout
  - architecture/cross-site-auth-via-auth-oriz-in
  - architecture/subscription-flow
  - decisions/architecture/per-runtime-framework
---

# The fourteen packages — locked

## Concept

14 npm packages under `@chirag127/*` are the shared surface for the family. 10 ship for Astro sites/apps; 4 wrap auth for cross-surface (browser-ext / VS Code-ext / CLI / Worker).

A package exists only when:
1. **≥25 lines** of identical code would otherwise duplicate across
2. **≥3 consuming projects**, AND
3. **No community npm package** already does it adequately.

If only (1) and (2) hold but (3) doesn't — use the community package directly. If only (2) holds and the duplication is <25 lines — inline.

## The set

### Layered Astro packages (10)

| # | Package | Peer-dep | What it owns |
|---|---|---|---|
| 1 | `@chirag127/astro-shell` | — (base) | astro.config wrapper + locked integration set (`@astrojs/react` / `@astrojs/sitemap` / `@astrojs/mdx` / `@tailwindcss/vite` / `astro-icon` / `astro-compress` / `vite-plugin-wasm` / `vite-plugin-top-level-await` / `@astrojs/rss`) + Base layout + Tailwind v4 preset + reusable Cloudflare Pages deploy workflow. |
| 2 | `@chirag127/astro-chrome` | astro-shell | Header / Sidebar / BottomBar / Footer / Stamp / SEO + JSON-LD / Auth UI (AccountPanel + FinishSignIn) / Analytics + Consent (Klaro) / 24 legal pages + Datasheet Dark tokens + self-hosted fonts. |
| 3 | `@chirag127/astro-tools` | astro-chrome | `<ToolGrid>` + `<ToolCard>` + `<ToolPage>` for the 15 tool sites. |
| 4 | `@chirag127/astro-content` | astro-chrome | Zod content-collection schemas (post / book / card / journal) + RSS + Atom + JSON-Feed generators + sitemap glue + IndexNow ping + OG-card emit. |
| 5 | `@chirag127/astro-data` | — | Firebase init + Firestore typed helpers + family.ts constants + TanStack Query setup + LocalStorage hooks + Puter.js wrappers (folded in from former astro-ai). |
| 6 | `@chirag127/astro-forms` | — | react-hook-form + Zod resolvers + shadcn-style Form wrappers + honeypot + Web3Forms client + StaticForms fallback. |
| 7 | `@chirag127/astro-billing` | — | Razorpay checkout + license-key verify + `<Paywall>` + `<PriceTag>` for one-subscription-unlocks-all per [[subscription-flow]]. |
| 8 | `@chirag127/astro-pwa` | — | `@vite-pwa/astro` wrapper with locked defaults (manifest from astro-chrome brand, offline shell, `<InstallPrompt>`, `<UpdateToast>`). |
| 9 | `@chirag127/astro-distribute` | — | Thin CLI wrapping PWABuilder (primary — AAB / MSIX / iOS-project) + optional Tauri for desktop EXE/dmg/AppImage. |
| 10 | `@chirag127/astro-widgets` | astro-chrome | Shared cross-app islands — `<MultiSearch>` popover + `<StatusBanner>` + `<ConsentBanner>` (Klaro). |

### Cross-surface auth (4)

| # | Package | Peer-dep | What it owns |
|---|---|---|---|
| 11 | `@chirag127/auth-core` | — | Cross-surface auth primitives — auth.oriz.in URL helpers, Firebase ID-token verify, refresh logic. Runtime-agnostic. |
| 12 | `@chirag127/auth-wxt` | auth-core | Browser-extension auth — `chrome.identity.launchWebAuthFlow` bouncing through auth.oriz.in, ID-token in `chrome.storage.local`. Chrome / Firefox / Edge via `@wxt-dev/browser`. |
| 13 | `@chirag127/auth-vsc` | auth-core | VS Code extension auth — `vscode.authentication` API + Firebase ID-token mint via REST + secure storage via `context.secrets`. |
| 14 | `@chirag127/auth-cli` | auth-core | CLI auth — Firebase OAuth device-code flow + token store at `~/.config/oriz/auth.json` + refresh on 401. |

## Hierarchy

```
astro-shell        (base)
└── astro-chrome   (peer-dep on shell)
    ├── astro-tools     (peer-dep on chrome)
    ├── astro-content   (peer-dep on chrome)
    └── astro-widgets   (peer-dep on chrome)

astro-data    (standalone)
astro-forms   (standalone)
astro-billing (standalone)
astro-pwa     (standalone)
astro-distribute (standalone CLI)

auth-core   (base)
├── auth-wxt  (peer-dep on auth-core)
├── auth-vsc  (peer-dep on auth-core)
└── auth-cli  (peer-dep on auth-core)
```

## Dropped from the set (use community library directly)

| Old name | Replacement |
|---|---|
| ~~`astro-config`~~ | `astro/tsconfigs/strict` extend + `biome init` + Tailwind v4 preset in `astro-shell` |
| ~~`astro-icons`~~ | `pnpm add lucide-react` |
| ~~`astro-ai`~~ | folded into `astro-data` (Puter.js is a data primitive) |
| ~~`astro-search`~~ | `pagefind` CLI + 5-line component |
| ~~`astro-mdx`~~ | `rehype-callouts` + `rehype-shiki` directly |
| ~~`astro-toc`~~ | `rehype-toc` directly |
| ~~`astro-comments`~~ | `@giscus/react` directly |
| ~~`astro-share`~~ | ~20 lines inline (no shared SDK to wrap) |
| ~~`astro-newsletter`~~ | ~10 lines `fetch` to Buttondown |
| ~~`astro-affiliate`~~ | 1-line `<a rel="nofollow sponsored">` |
| ~~`astro-keyboard`~~ | `cmdk` directly |
| ~~`astro-feedback`~~ | ~15 lines inline `<form>` to Web3Forms |
| ~~`astro-test-utils`~~ | `vitest` + `msw` + `@playwright/test` directly |

## Versioning

- **Independent SemVer per package** + changesets-style PRs for releases.
- **Tag-driven publish**: push `v*.*.*` tag → `.github/workflows/release.yml` runs `npm publish` using `NPM_TOKEN` (org-level GH secret).
- Manual bump per package: `pnpm version patch && git push --tags`.

## Testing strategy

- Each package has its own `src/__tests__/` Vitest suite. `pnpm test` per package; CI runs on push + PR.
- Common test/lint/build configs live in `templates/` at master root (not a package — copied once per repo).
- Weekly drift-check GH Actions workflow at master compares each repo's configs against `templates/` and opens an issue on drift.

## License

Source-available, all rights reserved. See per-repo `LICENSE`. NO license is granted to use, fork, modify, or redistribute. Public visibility is for transparency only.

## Cross-refs

- The package-isolation principle this sharpens → [[package-isolation-rule]]
- The auth flow these wrap → [[cross-site-auth-via-auth-oriz-in]]
- The subscription flow `astro-billing` implements → [[subscription-flow]]
- Repo layout → [[repo-layout]]
- Build the distributables → [[runbooks/build-distributable]]
- npm publish via token → [[runbooks/npm-publish-token-setup]]
