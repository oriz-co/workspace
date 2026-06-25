---
type: architecture
title: "The twenty-three packages \u2014 the locked oriz family package set"
description: "The chirag127/oriz family ships 23 npm packages \u2014 10 Astro (shell,\
  \ chrome, tools, content, data, forms, billing, pwa, distribute, widgets) + 1 shared\
  \ test fixtures (astro-test-utils) + 4 cross-surface auth (auth-core, auth-wxt,\
  \ auth-vsc, auth-cli) + 1 cross-post engine (omni-publish) + 1 book-build pipeline\
  \ (oriz-book-build) + 1 AI-providers aggregator (oriz-ai-providers) + 5 cross-cutting\
  \ concerns (oriz-rate-limit, oriz-analytics, oriz-seo, oriz-consent, oriz-kit).\
  \ Threshold for being a package \u2014 \u226525 lines duplicated across \u22653\
  \ consumers AND no community library covers it. Anything below the threshold is\
  \ inlined."
tags:
- architecture
- packages
- astro
- npm
- locked
timestamp: 2026-06-22
format_version: okf-v0.1
status: superseded
superseded_by: decisions/architecture/packaging/one-package-only-analytics-2026-06-25
supersedes:
- decisions/architecture/zero-chirag127-packages
- decisions/architecture/cross-surface-package-set
- architecture/the-17-packages
- architecture/the-18-packages
- decisions/architecture/four-more-packages-22-total
related:
- architecture/security/package-isolation-rule
- architecture/ops/repo-layout
- architecture/security/cross-site-auth-via-auth-oriz-in
- architecture/ops/subscription-flow
- decisions/architecture/general/per-runtime-framework
- decisions/architecture/packages/omni-publish-package
- decisions/architecture/content/book-publish-pipeline
- decisions/architecture/packages/oriz-ai-providers-package
- decisions/architecture/packages/four-more-packages-22-total
- services/family-inventory
---



# The twenty-three packages — locked

**SUPERSEDED 2026-06-25** by [[decisions/architecture/packaging/one-package-only-analytics-2026-06-25]]. 22 of 23 packages archived to `oriz-archive`; only `oriz-analytics-npm-pkg` survives.

## Concept

23 npm packages under `@chirag127/*` are the shared surface for the family.

A package exists only when:
1. **≥25 lines** of identical code would otherwise duplicate across
2. **≥3 consuming projects**, AND
3. **No community npm package** already does it adequately.

If only (1) and (2) hold but (3) doesn't — use the community package directly. If only (2) holds and the duplication is <25 lines — inline.

## The set (23 total)

### Layered Astro packages (10)

| # | Package | Peer-dep | What it owns |
|---|---|---|---|
| 1 | `@chirag127/astro-shell` | — (base) | astro.config wrapper + locked integration set (`@astrojs/react` / `@astrojs/sitemap` / `@astrojs/mdx` / `@tailwindcss/vite` / `astro-icon` / `astro-compress` / `vite-plugin-wasm` / `vite-plugin-top-level-await` / `@astrojs/rss`) + Base layout + Tailwind v4 preset + reusable Cloudflare Pages deploy workflow. |
| 2 | `@chirag127/astro-chrome` | astro-shell | Header / Sidebar / BottomBar / Footer / Stamp / SEO + JSON-LD / Auth UI (AccountPanel + FinishSignIn) / Analytics + Consent (Klaro) / 24 legal pages + Datasheet Dark tokens + self-hosted fonts. |
| 3 | `@chirag127/astro-tools` | astro-chrome | `<ToolGrid>` + `<ToolCard>` + `<ToolPage>` for the 16 tool subdomains. |
| 4 | `@chirag127/astro-content` | astro-chrome | Zod content-collection schemas (post / book / card / journal) + RSS + Atom + JSON-Feed generators + sitemap glue + IndexNow ping + OG-card emit. |
| 5 | `@chirag127/astro-data` | — | Firebase init + Firestore typed helpers + family.ts constants + TanStack Query setup + LocalStorage hooks + Puter.js wrappers (folded in from former astro-ai). |
| 6 | `@chirag127/astro-forms` | — | react-hook-form + Zod resolvers + shadcn-style Form wrappers + honeypot + Web3Forms client + StaticForms fallback. |
| 7 | `@chirag127/astro-billing` | — | Razorpay checkout + license-key verify + `<Paywall>` + `<PriceTag>` for one-subscription-unlocks-all per [[subscription-flow]]. |
| 8 | `@chirag127/astro-pwa` | — | `@vite-pwa/astro` wrapper with locked defaults (manifest from astro-chrome brand, offline shell, `<InstallPrompt>`, `<UpdateToast>`). |
| 9 | `@chirag127/astro-distribute` | — | Thin CLI wrapping PWABuilder (primary — AAB / MSIX / iOS-project) + optional Tauri for desktop EXE/dmg/AppImage. |
| 10 | `@chirag127/astro-widgets` | astro-chrome | Shared cross-app islands — `<MultiSearch>` popover + `<StatusBanner>` + `<ConsentBanner>` (Klaro). |

### Shared test fixtures (1)

| # | Package | Peer-dep | What it owns |
|---|---|---|---|
| 11 | `@chirag127/astro-test-utils` | — | Common Vitest + Playwright + MSW + Firebase test fixtures. Thin wrapper over `@firebase/rules-unit-testing`, `msw`, `@playwright/test`. |

### Cross-surface auth (4)

| # | Package | Peer-dep | What it owns |
|---|---|---|---|
| 12 | `@chirag127/auth-core` | — | Cross-surface auth primitives — auth.oriz.in URL helpers, Firebase ID-token verify, refresh logic. Runtime-agnostic. |
| 13 | `@chirag127/auth-wxt` | auth-core | Browser-extension auth — `chrome.identity.launchWebAuthFlow` bouncing through auth.oriz.in, ID-token in `chrome.storage.local`. Chrome / Firefox / Edge via `@wxt-dev/browser`. |
| 14 | `@chirag127/auth-vsc` | auth-core | VS Code extension auth — `vscode.authentication` API + Firebase ID-token mint via REST + secure storage via `context.secrets`. |
| 15 | `@chirag127/auth-cli` | auth-core | CLI auth — Firebase OAuth device-code flow + token store at `~/.config/oriz/auth.json` + refresh on 401. |

### Cross-post + book-build (2)

| # | Package | Peer-dep | What it owns |
|---|---|---|---|
| 16 | `@chirag127/omni-publish` | — | RSS → every-platform cross-poster. Watches `blog.oriz.in/rss.xml`; adapter-per-platform (dev.to / Hashnode / Medium / X / LinkedIn / Bluesky / Mastodon / Reddit / Threads). Idempotent, canonical URL preserved. See [[decisions/architecture/omni-publish-package]]. |
| 17 | `@chirag127/oriz-book-build` | — | Markua-flavoured `.md` → Pandoc → EPUB3 + PDF + MOBI build pipeline. Powers the 5-book publish channel set (Leanpub / Gumroad / LemonSqueezy / D2D / KDP). See [[decisions/architecture/book-publish-pipeline]]. |

### AI providers aggregator (1)

| # | Package | Peer-dep | What it owns |
|---|---|---|---|
| 18 | `@chirag127/oriz-ai-providers` | — | Thin wrapper around 20 free LLM APIs (OVHcloud, LLM7, Pollinations, Cerebras, Groq, NVIDIA NIM, OpenRouter, Google AI Studio, Cohere, GitHub Models, Cloudflare Workers AI, HuggingFace, Mistral, SambaNova, Z.AI, SiliconFlow, Aion Labs, Ollama Cloud, ModelScope, Kilo Code). Priority-based fallback chain; OpenAI SDK-compatible. Provider / model / rate-limit / priority data lives in the SEPARATE `chirag127/oriz-ai-providers-data` repo (CC0). See [[decisions/architecture/oriz-ai-providers-package]]. |

### Cross-cutting concerns (5) — added 2026-06-22

| # | Package | Peer-dep | What it owns |
|---|---|---|---|
| 19 | `@chirag127/oriz-rate-limit` | — | Per-user usage caps enforcing Free / Pro / Max tier limits (10/100/unlimited). Firestore-backed daily counters. See [[decisions/architecture/four-more-packages-22-total]]. |
| 20 | `@chirag127/oriz-analytics` | — | Single wrapper around CF Web Analytics + GA4 + Microsoft Clarity + Sentry. One init call per app. Klaro consent-gated. |
| 21 | `@chirag127/oriz-seo` | — | Sitemap + IndexNow + JSON-LD + OG image generator (satori). |
| 22 | `@chirag127/oriz-consent` | — | Klaro pre-configured for EU/UK (default-DENIED) + India DPDP + US GPC + ROW (no banner). Geo-routed via CF. |
| 23 | `@chirag127/oriz-kit` | astro-chrome | Family-wide kit barrel — `<MultiSearch />`, `<SponsorButton />` (Razorpay donation button pl_T4iEPIDcALKLPk per [[decisions/architecture/razorpay-donation-button]]), `<Wordmark />`, brand tokens. |

## Hierarchy

```text
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
astro-test-utils (standalone)

auth-core   (base)
├── auth-wxt  (peer-dep on auth-core)
├── auth-vsc  (peer-dep on auth-core)
└── auth-cli  (peer-dep on auth-core)

omni-publish     (standalone)
oriz-book-build  (standalone)
oriz-ai-providers (standalone — fetches data from chirag127/oriz-ai-providers-data)

oriz-rate-limit  (standalone)
oriz-analytics   (standalone)
oriz-seo         (standalone)
oriz-consent     (standalone)
oriz-kit         (peer-dep on astro-chrome — family-wide barrel)
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

## Versioning

- **Independent SemVer per package** + changesets-style PRs for releases.
- **Tag-driven publish**: push `v*.*.*` tag → `.github/workflows/release.yml` runs `npm publish` using `NPM_TOKEN` (org-level GH secret).
- Manual bump per package: `pnpm version patch && git push --tags`.

## Testing strategy

- Each package has its own `src/__tests__/` Vitest suite. `pnpm test` per package; CI runs on push + PR.
- Common test/lint/build configs live in `templates/` at master root (not a package — copied once per repo).
- Weekly drift-check GH Actions workflow at master compares each repo's configs against `templates/` and opens an issue on drift.

## License

MIT on every package. See [[decisions/architecture/mit-license-all-repos]].

## Cross-refs

- The package-isolation principle this sharpens → [[package-isolation-rule]]
- The auth flow these wrap → [[cross-site-auth-via-auth-oriz-in]]
- The subscription flow `astro-billing` implements → [[subscription-flow]]
- Repo layout → [[repo-layout]]
- Build the distributables → [[runbooks/build-distributable]]
- npm publish via token → [[runbooks/npm-publish-token-setup]]
- Canonical family counts → [[services/family-inventory]]
