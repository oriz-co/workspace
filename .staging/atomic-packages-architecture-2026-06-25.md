# Atomic Packages — Architecture Brief

> **Status:** BLUEPRINT, not an action plan. Day-0 fleet has **zero `@oriz/*` packages** and ships fine without them ([`zero-in-house-packages-inline-analytics`](../knowledge/decisions/architecture/packaging/zero-in-house-packages-inline-analytics-2026-06-25.md)). This document tells the next agent **what to do when the trigger fires** ("2+ apps need the same logic, and inlining a third copy would hurt").
>
> Synthesised from two June-2026 research briefs:
> - [`research-npm-astro-2026.md`](./research-npm-astro-2026.md) — build/test/release/CI tool picks
> - [`research-monorepo-docs-2026.md`](./research-monorepo-docs-2026.md) — docs site + aggregation
>
> Locked rules respected (do **not** reverse here): Astro 6 + React + Tailwind v4 + shadcn ([`framework-astro-react-tailwind-shadcn-2026-06-25`](../knowledge/decisions/architecture/frontend/framework-astro-react-tailwind-shadcn-2026-06-25.md)); polyrepo + submodules ([`workspace-flat-repos-2026-06-25`](../knowledge/decisions/architecture/infrastructure/workspace-flat-repos-2026-06-25.md), [`umbrella-as-clone-entrypoint-2026-06-25`](../knowledge/decisions/architecture/infrastructure/umbrella-as-clone-entrypoint-2026-06-25.md)); `repos/own/<slug>-npm-pkg/` + `@oriz/*` ns; concern-atomic (1 concern, 100-300 LOC, 3-5 exports); lazy-emergent (2+ app trigger); no auth in apps ([`no-auth-in-apps-or-apis-2026-06-25`](../knowledge/decisions/architecture/security/no-auth-in-apps-or-apis-2026-06-25.md)); analytics stays inline; GH org secrets ([`github-org-level-secrets`](../knowledge/rules/security/github-org-level-secrets.md)); 6 surviving apps: `blog`, `journal`, `me`, `oriz-ncert-app`, `oriz-lore-app`, `oriz-janaushdhi-app`.
>
> Versions of record at time of writing (full table in research brief §0): Astro 6.4, TypeScript 5.9.2, Node 24 LTS / 22 Maintenance, Vitest 4.1, tsdown ^0.22, Tailwind v4, React 19, pnpm v10.

---

## 1. End state — what the fleet looks like at maturity (~6 months)

At maturity, **5-10 packages** in production. Floor is 0 (today), ceiling is "before you cross 10, audit for resurfacing the 23-package mistake."

Each package is a **named, versioned, MIT-licensed concern**, published to npm as `@oriz/<slug>` and source-hosted at `oriz-org/<slug>-npm-pkg/`, pulled into the umbrella as a submodule at `repos/own/<slug>-npm-pkg/`. All packages are pure-TS ESM-only by default; React/Tailwind packages isolate their framework surface to a `./react` subpath export so non-React consumers don't pull React.

```
oriz-org/                                       # GitHub org
├── oriz/                                       # umbrella (this repo)
│   ├── knowledge/                              # OKF brain
│   ├── repos/
│   │   ├── own/
│   │   │   ├── tsconfig-base-npm-pkg/          # @oriz/tsconfig-base   (foundation, see §11)
│   │   │   ├── ci-workflows/                   # reusable GHA workflows (not on npm)
│   │   │   ├── renovate-config/                # Renovate preset      (not on npm)
│   │   │   ├── seo-base-npm-pkg/               # @oriz/seo-base
│   │   │   ├── footer-mega-npm-pkg/            # @oriz/footer-mega    (universal-legal section)
│   │   │   ├── feeds-npm-pkg/                  # @oriz/feeds          (rss/atom/json generator)
│   │   │   ├── donate-npm-pkg/                 # @oriz/donate         (BMC/GH-Sponsors/UPI footer)
│   │   │   ├── india-format-npm-pkg/           # @oriz/india-format   (INR, Indian dates, en-IN)
│   │   │   ├── data-loaders-npm-pkg/           # @oriz/data-loaders   (GH-Pages JSON fetch + zod)
│   │   │   ├── status-banner-npm-pkg/          # @oriz/status-banner  (dismissible top banner)
│   │   │   └── shadcn-presets-npm-pkg/         # @oriz/shadcn-presets (theme tokens, .css only)
│   │   └── frk/                                # forks (not packages)
│   └── docs/                                   # packages.oriz.in source (Starlight)
└── packages-oriz-in/                           # OR a sibling repo — see §6
```

Not on this list **and never will be**: auth/login (separate project per [`no-auth-in-apps-or-apis-2026-06-25`](../knowledge/decisions/architecture/security/no-auth-in-apps-or-apis-2026-06-25.md)); analytics (inline-only per locked rule); per-app design tokens (each app gets its own `frontend-design` pass, per [`per-app-distinctive-frontend-design`](../knowledge/rules/design/per-app-distinctive-frontend-design.md)); India-API response shapes (each API repo is self-contained, only the *fetch* helper gets shared via `@oriz/data-loaders`).

The fleet's centre of gravity is the **6 surviving apps** consuming the packages. If a package isn't being consumed by ≥2 apps, it shouldn't exist. The build-gate ([`fleet-strategy-build-gate-2026-06-25`](../knowledge/decisions/architecture/apps/fleet-strategy-build-gate-2026-06-25.md)) applies to packages too — only "we have 2 inlined copies and the third would hurt" creates a new package.

---

## 2. Initial backlog — packages most likely to emerge first (0-90 days)

These are the packages the **next agent should be ready to create** when the trigger fires. **Do not create them speculatively.** The trigger column names the specific event that creates ≥2 app demand.

| # | Name | Concern | Apps that will use it | Trigger event | Est. LOC | First export shape |
|---|---|---|---|---|---|---|
| 1 | **`@oriz/feeds`** | Generate RSS 2.0 + Atom 1.0 + JSON Feed v1.1 from an array of items; emit `<link rel="alternate">` head tags. | `blog`, `journal`, `me`, `oriz-lore-app` | 2nd app inlines its 3rd feed format and hits an Atom date-format inconsistency vs blog. | ~200 | `generateFeeds({ items, site, ... }) → { rss, atom, json }`; `<FeedDiscovery site/>` Astro component (zero-hydration) |
| 2 | **`@oriz/donate`** | Render the 3-rail donations footer (BuyMeACoffee + GH Sponsors + UPI deep-link with QR fallback) per [`donations-only-2026-06-25`](../knowledge/decisions/architecture/monetisation/donations-only-2026-06-25.md). UPI string is the load-bearing piece. | All 6 apps + future docs site | 3rd app needs the donations footer. Inlining the UPI string + QR + 3 buttons crosses the "fix in 6 places when amount changes" line. | ~150 | `<DonationFooter upi={...} bmc={...} sponsorsHandle={...} />` (React, in `./react` subpath); pure-TS `buildUpiLink(opts)` helper at root export |
| 3 | **`@oriz/india-format`** | Indian number/currency/date formatters: `₹1,23,456.78` (lakh/crore comma rule), `en-IN` date, INR words ("twelve lakh twenty-three thousand…"). | `oriz-ncert-app` (textbook prices), `oriz-janaushdhi-app` (medicine prices + PPP comparisons), future finance app | `oriz-janaushdhi-app` ships INR formatting; `oriz-ncert-app` adds it for textbook prices; both reach for `Intl.NumberFormat('en-IN')` and miss the lakh-grouping subtleties differently. | ~150 | `formatINR(n) → string`; `formatINRWords(n) → string`; `formatINDate(d) → string`; tiny, pure-TS, framework-agnostic |
| 4 | **`@oriz/seo-base`** | Astro component pack: `<SEO />`, `<OG />`, `<JsonLd />`, sitemap helper, IndexNow ping, `robots.txt` generator. Implements [`seo-three-pillars`](../knowledge/decisions/architecture/ops/seo-three-pillars.md). | All 6 apps + docs site | 2nd app duplicates the SEO head block from `blog` and the canonical-URL logic diverges. | ~250 | `<SEO title description canonical og.../>`; `<JsonLd kind="article" data={...}/>`; `siteMapEntries(items, base)` helper |
| 5 | **`@oriz/data-loaders`** | Typed fetch helpers for the family's GitHub-Pages JSON APIs ([`github-pages-as-json-api`](../knowledge/decisions/architecture/compute/github-pages-as-json-api.md)) — `oriz-mmi-tickertape-mmi-api`, future `oriz-flow-fii-dii-api`. Zod schemas, build-time cache header passthrough, fallback chain. | `me` (lifestream dashboards), `journal` (cross-link insertions), future `oriz-stats-app` | 2nd consumer of any GitHub-Pages JSON API. The schema validation is the value, not the fetch. | ~200 | `loadJSON(url, schema, opts) → T`; per-API typed wrappers as named exports |

**Hidden prerequisite (Day -1):** `@oriz/tsconfig-base` is the foundation every other package extends. It's not a "concern package" per the lazy rule — it's infrastructure. Ship it the same day the *first* concern package is created (not before; YAGNI).

What's **deliberately NOT on this list** (and the reason):
- `@oriz/ui` / shadcn component pack — per `per-app-distinctive-frontend-design`, each app gets its own design pass. Sharing components would force a shared palette, which we explicitly rejected. (`@oriz/shadcn-presets` shipping just theme tokens stays viable but only if it emerges, not Day-1.)
- `@oriz/analytics` — explicitly killed by [`zero-in-house-packages-inline-analytics-2026-06-25`](../knowledge/decisions/architecture/packaging/zero-in-house-packages-inline-analytics-2026-06-25.md).
- `@oriz/auth` — explicitly killed by [`no-auth-in-apps-or-apis-2026-06-25`](../knowledge/decisions/architecture/security/no-auth-in-apps-or-apis-2026-06-25.md). Login is a separate project.
- `@oriz/legal-pages` — per-app legal pages are required by AdSense/Play Store; the *content* is universal and lives as an Astro snippet copy-pasted on Day-0. Only package when content drifts across 3+ apps.

---

## 3. Per-package scaffolding template

Every `@oriz/<slug>-npm-pkg/` repo has the same shape. The next agent should `cp -r templates/npm-pkg/* repos/own/<slug>-npm-pkg/` (template will live in the umbrella's `templates/` dir on Day-N when the first package emerges).

### 3.1 Repo file tree

```
@oriz/<slug>-npm-pkg/
├── .github/
│   └── workflows/
│       └── release.yml            # ci + release-please + publish (see §3.5)
├── src/
│   ├── index.ts                   # the only required entry
│   ├── react/
│   │   └── index.tsx              # only if package has React surface
│   └── *.test.ts                  # colocated tests
├── dist/                          # gitignored; built by tsdown
├── .gitignore
├── AGENTS.md                      # 30-line guide for any AI agent editing this repo
├── CHANGELOG.md                   # auto-maintained by release-please
├── LICENSE                        # MIT
├── README.md                      # plain GFM, ~80 lines (see §3.6)
├── package.json
├── renovate.json                  # one-line extends (see §3.7)
├── tsconfig.json                  # 4-line extends (see §3.3)
├── tsdown.config.ts               # often unnecessary (smart defaults)
└── vitest.config.ts               # see §3.4
```

No `.npmignore` (the `package.json#files` whitelist replaces it). No `.changeset/` directory (we use release-please, not Changesets — see §5).

### 3.2 `package.json` — canonical shape (ESM-only)

Verbatim from research brief §3, adapted for `@oriz/*` namespace. Copy-paste-ready:

```jsonc
{
  "name": "@oriz/<slug>",
  "version": "0.1.0",
  "description": "<one line, present-tense>",
  "license": "MIT",
  "type": "module",
  "engines": { "node": ">=22.0.0" },

  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./react": {
      "types": "./dist/react/index.d.ts",
      "default": "./dist/react/index.js"
    },
    "./package.json": "./package.json"
  },
  "types": "./dist/index.d.ts",
  "files": ["dist", "src", "!**/*.test.*", "!**/*.spec.*"],
  "sideEffects": false,

  "publishConfig": {
    "access": "public",
    "provenance": true
  },

  "repository": {
    "type": "git",
    "url": "git+https://github.com/oriz-org/<slug>-npm-pkg.git"
  },
  "homepage": "https://packages.oriz.in/<slug>",
  "bugs": "https://github.com/oriz-org/<slug>-npm-pkg/issues",
  "funding": "https://github.com/sponsors/chirag127",
  "keywords": ["oriz", "<slug>"],

  "scripts": {
    "build": "tsdown",
    "check:types": "tsc --noEmit",
    "check:exports": "attw --pack . && publint",
    "test": "vitest run",
    "test:watch": "vitest",
    "coverage": "vitest run --coverage",
    "prepublishOnly": "pnpm build && pnpm check:exports && pnpm test"
  },

  "peerDependencies": {
    "react": "^18 || ^19",
    "react-dom": "^18 || ^19"
  },
  "peerDependenciesMeta": {
    "react": { "optional": true },
    "react-dom": { "optional": true },
    "@types/react": { "optional": true }
  },

  "devDependencies": {
    "@arethetypeswrong/cli": "^0.18.0",
    "@oriz/tsconfig-base": "^1.0.0",
    "@types/react": "^19.0.0",
    "@vitest/coverage-v8": "^4.1.0",
    "publint": "^0.3.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "tsdown": "^0.22.0",
    "typescript": "^5.9.0",
    "vitest": "^4.1.0"
  }
}
```

**Drop the `./react` subpath block, the `peerDependencies` / `peerDependenciesMeta`, and React/Tailwind dev-deps** for pure-TS packages (`@oriz/feeds`, `@oriz/india-format`, `@oriz/data-loaders`).

Critical details (cited research brief §3, §9, §10):
- **ESM-only**, no `.mjs`/`.cjs` dual-publish. Node 22 LTS's native `require(esm)` removed the dual-publish tax.
- **Exports map ordering is hard-ruled** by `publint`: `types` first, `default` last.
- **`files` whitelist beats `.npmignore`** for safety.
- **`sideEffects: false`** except for packages shipping CSS (use array form: `["./dist/*.css"]`).
- **`engines.node: ">=22"`** is the 2026 floor.
- **`publishConfig.provenance: true`** — Sigstore badge automatic.
- **`moduleResolution: "nodenext"`** in tsconfig — never `"bundler"` for libraries.
- **React → peer always** at `"^18 || ^19"`. **Tailwind → devDependency only, never peer.**

Gate every publish on `attw --pack . && publint`. These two commands have caught more publish bugs than tests have.

### 3.3 `tsconfig.json` — 4 lines, extends shared base

Per-package `tsconfig.json`:

```jsonc
{
  "extends": "@oriz/tsconfig-base/tsconfig.json",
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "**/*.test.ts", "**/*.spec.ts"]
}
```

The shared base (lives in its own repo `@oriz/tsconfig-base`):

```jsonc
// @oriz/tsconfig-base/tsconfig.json
{
  "extends": [
    "@tsconfig/strictest/tsconfig.json",
    "@tsconfig/node-lts/tsconfig.json"
  ],
  "compilerOptions": {
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "rootDir": "src",
    "outDir": "dist",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "target": "es2022",
    "lib": ["es2022"],
    "skipLibCheck": true
  }
}
```

Why ship a shared base (research brief §4): one bump rolls strictness across the fleet. Multi-extends (TS 5.0+) lets us compose `@tsconfig/strictest` + `@tsconfig/node-lts` cleanly. **`verbatimModuleSyntax`** protects library consumers from import elision bugs. **`erasableSyntaxOnly`** keeps the output tool-portable (no `enum`, no `namespace`, no parameter properties — so the same source compiles under tsc, swc, esbuild, oxc, and Node's strip-types).

### 3.4 `vitest.config.ts` — tiny-lib config

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
      reporter: ['text', 'html', 'json-summary'],
    },
  },
});
```

No `projects:` block — that's a monorepo feature; we're per-repo. Use `@vitest/coverage-v8` (parity with istanbul since Vitest 3.2). Skip browser mode for pure-TS packages; pull in `@vitest/browser-playwright` only when the package touches DOM (e.g. `@oriz/donate`'s React component).

### 3.5 GitHub Actions — `release.yml`

Single workflow handles CI on `push` + release-please on `push` + npm publish via OIDC on `release`. **No `NPM_TOKEN` secret** after first publish.

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]
  release:
    types: [published]

permissions:
  contents: write
  pull-requests: write
  id-token: write   # npm OIDC

jobs:
  ci:
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '24'
          cache: 'pnpm'
          registry-url: 'https://registry.npmjs.org'
      - run: pnpm install --frozen-lockfile
      - run: pnpm check:types
      - run: pnpm check:exports   # attw + publint
      - run: pnpm test
      - run: pnpm build

  release-please:
    if: github.event_name == 'push'
    needs: ci
    runs-on: ubuntu-latest
    steps:
      - uses: googleapis/release-please-action@v5
        with:
          release-type: node

  publish:
    if: github.event_name == 'release'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          ref: ${{ github.event.release.tag_name }}
      - uses: pnpm/action-setup@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '24'
          cache: 'pnpm'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install -g npm@latest          # OIDC needs npm >= 11.5.1
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: npm publish --provenance --access public
```

After the fleet hits 3+ packages, hoist the `publish` job into `oriz-org/ci-workflows/.github/workflows/npm-publish.yml@v1` and call it via `uses:` from each consumer — single source of truth across the fleet.

First-publish setup is manual (one-time per package): run `npm publish` locally with a granular token, then configure trusted publishing on npmjs.com pointing at this workflow path. Delete the token. v0.0.2+ publishes are tokenless.

### 3.6 `README.md` — plain GFM, ~80 lines

Research brief §6 (docs) is emphatic: **README.md stays plain GFM** because npm + GitHub render only GFM, not MDX. The rich content lives at `packages.oriz.in/<slug>`.

````md
# @oriz/<slug>

[![npm](https://img.shields.io/npm/v/@oriz/<slug>)](https://npmjs.com/package/@oriz/<slug>)
[![bundle](https://img.shields.io/bundlephobia/minzip/@oriz/<slug>)](https://bundlephobia.com/package/@oriz/<slug>)
[![license](https://img.shields.io/npm/l/@oriz/<slug>)](./LICENSE)

<one-line tagline>. Atomic. ESM-only. Zero runtime deps.

## Install

```bash
pnpm add @oriz/<slug>
```

## Usage

```ts
import { thing } from '@oriz/<slug>';
thing();
```

## Docs

Full docs at <https://packages.oriz.in/<slug>>.

## License

MIT — © Chirag Singhal.
````

### 3.7 `renovate.json` — one-line extends

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["oriz-org/renovate-config"]
}
```

The preset lives at `oriz-org/renovate-config/default.json` — see research brief §7 for the full preset (auto-merges patches for `@types/*`, eslint, vitest; holds majors for dashboard approval; lockFileMaintenance weekly; Asia/Kolkata weekend schedule).

Mend Renovate Cloud free tier handles unlimited public + private repos. Dependabot stays on for **security alerts only** (turn off version updates to avoid duplicate PRs).

### 3.8 `AGENTS.md` — 30-line agent guide

Each package repo also gets a tiny `AGENTS.md` at root (per research brief §9 — the AGENTS.md convention is real and adopted by OpenAI Codex among others). Template:

```md
# AGENTS.md — @oriz/<slug>

This is an atomic `@oriz/*` npm package. Concern: <one sentence>.

## Rules
- ESM-only, Node ≥ 22, TypeScript strict.
- Stay under 300 LOC src/. If you cross that line, split — don't fatten.
- Public API in `src/index.ts`. ≤5 named exports.
- Tests colocated, Vitest. 80% coverage floor.
- Conventional commits. Release via release-please PR merge.

## Don't
- Add runtime dependencies without a 2-paragraph rationale in the PR.
- Import from `@oriz/*` peers — keep packages independent.
- Add Astro / Tailwind / Vite as deps (devDep only, build-tools).
- Ship CSS without setting `sideEffects: ["**/*.css"]`.

## Verify before publish
- `pnpm check:types`, `pnpm check:exports` (attw + publint), `pnpm test`.

Knowledge home: ../../knowledge/decisions/architecture/packages/<slug>.md.
```

---

## 4. Consumer pattern — how an Astro 6 app uses `@oriz/*`

### 4.1 Install

```bash
# from anywhere inside the umbrella
pnpm --filter @oriz/blog add @oriz/feeds @oriz/seo-base @oriz/donate
```

Each app's `package.json` lists each `@oriz/*` package at a caret range; `pnpm-lock.yaml` pins exact versions. `auto-install-peers=true` is on by default in pnpm 8+.

### 4.2 Use in `.astro` frontmatter (zero hydration)

Pure-TS packages drop into Astro frontmatter directly — frontmatter is TypeScript with top-level await (research brief §8.2):

```astro
---
// src/pages/rss.xml.astro  (in oriz-blog-app)
import { generateFeeds } from '@oriz/feeds';
import { getCollection } from 'astro:content';

const posts = await getCollection('blog');
const { rss } = generateFeeds({
  site: 'https://blog.oriz.in',
  items: posts.map(p => ({
    title: p.data.title,
    url: `/posts/${p.slug}`,
    date: p.data.pubDate,
  })),
});
---
{rss}
```

Zero JS shipped to the browser. Type-checked end to end.

### 4.3 Use as a React island

When you need an actual React component (e.g. `<DonateFooter />` with a copy-UPI-link button):

```astro
---
// src/components/Footer.astro
import { DonateFooter } from '@oriz/donate/react';
---
<footer>
  <DonateFooter
    upi="oriz@upi"
    bmc="chirag127"
    sponsorsHandle="chirag127"
    client:visible
  />
</footer>
```

`client:visible` is the default hydration directive — load JS only when the footer scrolls into view. The package's `./react` subpath is the only thing that pulls React; the root `.` export stays framework-agnostic.

### 4.4 Composing two packages

```astro
---
// src/layouts/BaseLayout.astro (in any oriz app)
import { SEO, JsonLd } from '@oriz/seo-base';
import { formatINR } from '@oriz/india-format';

const { title, description, ogImage, price } = Astro.props;
---
<html>
  <head>
    <SEO title={title} description={description} og={{ image: ogImage }} />
    {price && <JsonLd kind="product" data={{ price: formatINR(price), priceCurrency: 'INR' }} />}
  </head>
  <body><slot /></body>
</html>
```

No new dance: packages are independent libraries imported side-by-side. The atomic discipline pays off here — `@oriz/india-format` doesn't depend on `@oriz/seo-base`, so each can release independently.

### 4.5 Where types flow

Types are bundled inside each package's `dist/*.d.ts`, surfaced via the exports-map `types` condition. Consumers get full inference with **zero codegen, zero schema files** — the package's exported function signatures *are* the API contract. This matches the Hono RPC pattern already documented in [`hono-rpc-type-sharing`](../knowledge/decisions/architecture/compute/hono-rpc-type-sharing.md), generalized to libraries.

### 4.6 Tailwind v4 styles (only relevant for `@oriz/donate`, `@oriz/status-banner`, etc.)

Packages that ship Tailwind-classed components follow the **hybrid** model (research brief §10):

1. Ship raw `.tsx` with classNames in source. Do **not** `@import "tailwindcss"` inside the library — that's the consumer's job.
2. Ship a thin precompiled `./theme.css` containing only `@theme { ... }` tokens (no utilities).
3. README documents the exact `@source` line the consumer must add.

Consumer app `src/styles/global.css`:

```css
@import "tailwindcss";

/* node_modules is unconditionally excluded from auto-scan in Tailwind v4.0.18+ */
/* So consumer apps MUST explicitly opt in: */
@source "../../node_modules/@oriz/donate/dist";

/* Optional: pull in package's design tokens. */
@import "@oriz/donate/theme.css";
```

The `@source` line is the **#1 footgun**. The package README must document it verbatim. Without it, the consumer's build produces unstyled output and the regression isn't obvious until QA.

---

## 5. Versioning + release strategy

### 5.1 Bootstrap version

Every package starts at **`0.1.0`** — not `0.0.1`, not `1.0.0`. Reasons:
- `0.x` semver signals "API may change in minor versions" per [semver spec §4](https://semver.org/#spec-item-4).
- `0.1.0` (not `0.0.1`) leaves headroom for patch-only releases inside the first minor.
- The fleet's "atomic" discipline means breaking changes will land — versioning needs to absorb them without ceremony.

### 5.2 When to go `1.0.0`

A package goes `1.0.0` when **all** of:
- ≥3 apps consume it in production (not just listed in package.json — actually shipped).
- ≥30 days without an API-shaped change (additions OK; renames/removes count).
- README contracts are stable enough that the agent doesn't have to re-read `src/index.ts` to know the surface.

Going `1.0.0` is **not** a celebration — it's a contract. Breaking changes after 1.0 require a major bump and a migration note in `CHANGELOG.md`. Until then, every minor bump is permitted to break consumers (this is normal `0.x` discipline).

### 5.3 Release flow (per package)

Per research brief §5, the chosen tool is **release-please** (Apache-2.0, Google-maintained, CC-driven, human-gated). Flow:

1. Land a conventional-commit on `main` (e.g. `feat(format): add formatINRWords`).
2. release-please opens or updates a PR titled `chore(main): release @oriz/<slug> 0.2.0` containing the version bump + CHANGELOG.md delta.
3. Maintainer reviews and merges the PR.
4. release-please tags `v0.2.0` and creates a GitHub Release.
5. The `release: { types: [published] }` job runs and publishes to npm via OIDC.

The **human gate** (step 3) is the explicit design choice over `semantic-release`. We don't want every merge to main to ship a new version.

### 5.4 Why not Changesets

Changesets requires `.changeset/*.md` intent files per PR. Our conventional-commit discipline already does that work in the commit message; Changesets would be double-bookkeeping. Plus, it doesn't naturally produce per-repo release flows in a polyrepo (its monorepo orientation shows). Research brief §5 has the full justification.

### 5.5 First-publish bootstrap (one-time per package)

```bash
# Locally, with a granular npm token in env
cd repos/own/<slug>-npm-pkg/
npm publish --access public
# Then configure trusted publisher at npmjs.com → Package settings → Trusted Publishers
#   - Provider: GitHub Actions
#   - Org: oriz-org
#   - Repo: <slug>-npm-pkg
#   - Workflow: .github/workflows/release.yml
#   - Environment: (blank)
# Delete the token afterwards. Subsequent publishes are tokenless.
```

---

## 6. Documentation site — `packages.oriz.in`

### 6.1 Where it lives

**Sibling repo `oriz-org/packages-oriz-in/`** (NOT inside the umbrella), submoduled into the umbrella under `repos/own/packages-oriz-in/`. Reasons:

1. Independent deploys — docs rebuild doesn't require an umbrella commit.
2. Cleanly fits the locked file-system convention (one repo per concern).
3. Its build pulls READMEs from sibling package repos via Astro Content Layer loader — sibling-repo access doesn't require it to be inside the umbrella.

### 6.2 Framework

**Astro 6 + Starlight 0.41+**, deployed to Cloudflare Pages. Per research brief §1, this wins because:
- Astro 6 is the family default (no new framework).
- Pagefind built-in (zero search infra).
- Astro Content Layer is the cleanest aggregation primitive — purpose-built community loaders exist (`@larkiny/astro-github-loader`).
- Real reference architecture exists: `WyattAu/starlight-sites` runs 9 Starlight sites on CF Pages.

Skip versioned routes (research brief §8) — match Lucide's "latest only + GitHub tags for history" pattern. 100-300 LOC packages don't need `/v0` `/v1` `/v2`.

### 6.3 Per-package or unified?

**Unified.** One Starlight site at `packages.oriz.in` with one section per package. Reasons:
- 5-15 packages is too few for per-package subdomains; subdomain proliferation hurts SEO authority (see [`subdomain-path-based-on-category-2026-06-25`](../knowledge/decisions/architecture/branding/subdomain-path-based-on-category-2026-06-25.md) — same principle).
- Pagefind cross-package search works only inside a single site.
- A single `/releases` page aggregating across the fleet (research brief §4 — Vitest pattern) requires a single site.

Routes:
- `/` — catalog page (card grid, see §6.5).
- `/<slug>/` — per-package landing (rendered from sibling repo's README via Content Layer).
- `/<slug>/api` — TypeDoc-generated API ref **only if** package crosses 5+ exports (most won't; see research brief §3).
- `/releases` — aggregated releases feed across the fleet (fetched from GitHub Releases API at build time).

### 6.4 How packages contribute docs

Per research brief §2 — Astro Content Layer loader + each sibling repo's release workflow `curl`s a Cloudflare Pages Deploy Hook URL. The flow:

```
[sibling release workflow]
  └─ curl -X POST $PACKAGES_DEPLOY_HOOK
       │
       └──► [CF Pages build]
              ├─ git clone oriz-org/packages-oriz-in --recurse-submodules
              ├─ Astro Content Layer loader fetches READMEs from sibling repos via GitHub API
              ├─ pnpm build
              └─ deploy
```

No README symlinks. No commit-back loops. No frontmatter conventions enforced on package repos (they stay plain GFM). The docs site **pulls**; nothing **pushes** into the docs site.

```ts
// packages-oriz-in/src/content/config.ts
import { defineCollection, z } from 'astro:content';
import { githubFileLoader } from '@larkiny/astro-github-loader';

const PACKAGES = [
  'feeds-npm-pkg',
  'donate-npm-pkg',
  'india-format-npm-pkg',
  'seo-base-npm-pkg',
  'data-loaders-npm-pkg',
];

export const collections = {
  packages: defineCollection({
    loader: githubFileLoader({
      owner: 'oriz-org',
      repos: PACKAGES,
      path: 'README.md',
      ref: 'main',
      token: import.meta.env.GITHUB_TOKEN,
    }),
    schema: z.object({ title: z.string().optional() }).passthrough(),
  }),
};
```

Each sibling repo's `release.yml` ends with:

```yaml
- name: Trigger packages.oriz.in rebuild
  run: curl -X POST "${{ secrets.PACKAGES_DEPLOY_HOOK }}"
```

`PACKAGES_DEPLOY_HOOK` is set at the **org level** ([`github-org-level-secrets`](../knowledge/rules/security/github-org-level-secrets.md)) so all sibling repos inherit it.

### 6.5 Catalog page

Hand-curated `packages.json` listing the fleet + enriched at build time with live npm version + bundle size (research brief §7):

```json
// packages-oriz-in/src/data/packages.json
[
  { "slug": "feeds",        "title": "@oriz/feeds",        "tagline": "RSS + Atom + JSON feed generator.",        "category": "content", "status": "stable" },
  { "slug": "donate",       "title": "@oriz/donate",       "tagline": "3-rail donation footer (BMC + GH + UPI).",   "category": "ui",      "status": "stable" },
  { "slug": "india-format", "title": "@oriz/india-format", "tagline": "INR, en-IN date, lakh/crore formatters.",   "category": "i18n",    "status": "stable" },
  { "slug": "seo-base",     "title": "@oriz/seo-base",     "tagline": "Astro SEO pillars: meta, OG, JSON-LD.",     "category": "seo",     "status": "stable" },
  { "slug": "data-loaders", "title": "@oriz/data-loaders", "tagline": "Typed fetch + zod for GH-Pages JSON APIs.", "category": "data",    "status": "beta" }
]
```

### 6.6 Knowledge bundle sync

Per research brief §9 — **one-way pull**, never two-way. The docs site reads `knowledge/decisions/architecture/packages/<slug>.md` from the umbrella (submoduled) at build time and surfaces "Architecture rationale" on each package's docs page. Each package repo does **not** push to `knowledge/`. The umbrella owns its own facts; the package repo owns its README + CHANGELOG.

When a new package emerges (Day-N flow, §7.2), the agent writes both: a `knowledge/decisions/architecture/packages/<slug>.md` concept file AND the package repo. Same commit on the umbrella, separate commit on the package repo. This matches [`self-update-rule`](../knowledge/rules/agent/self-update-rule.md).

### 6.7 `llms.txt` and AGENTS.md

Cheap to ship, marginal value (research brief §9). Use `starlight-llms-txt` plugin to generate `packages.oriz.in/llms.txt` automatically. Each package repo also gets a tiny `AGENTS.md` per §3.8. This is belt-and-braces for agent-readability; no production system relies on it.

---

## 7. Migration path — from today to maturity

### 7.1 Day 0 (today, 2026-06-25)

State: **zero packages.** All 6 apps inline the analytics tags, the SEO head block, the donations footer, the feed XML — whatever they need. They each work fine. The umbrella has a `templates/npm-pkg/` directory that does NOT exist yet (it will be created the same day the first package emerges, not before).

The fleet's surviving 6 apps + 1 API are independent. No shared code. This is the right starting state per the locked rules.

### 7.2 Day 7-30 — first package emerges

Most likely trigger event (rank-ordered):

1. **`@oriz/feeds`** — when `blog`, `journal`, `me`, and `oriz-lore-app` are all building feeds (per [`feeds-rss-atom-json`](../knowledge/decisions/architecture/content/feeds-rss-atom-json.md)), and the 2nd app's Atom-vs-RSS date-format inconsistency wastes 20 min.
2. **`@oriz/donate`** — when the 3rd app gets the donations footer (UPI deep-link + 2 button rails), and changing the UPI amount means editing 3 files.
3. **`@oriz/india-format`** — when `oriz-janaushdhi-app` and `oriz-ncert-app` both ship INR prices, and one of them fumbles the lakh-grouping.

When the trigger fires, the next agent runs:

```bash
# Day-N: first package emerges
cd c:/D/oriz

# 1. Create the foundation tsconfig package (only if it doesn't exist yet)
mkdir -p repos/own/tsconfig-base-npm-pkg
# ... scaffold per §3, publish as @oriz/tsconfig-base v1.0.0
# (no semver caution here — it's infrastructure with a stable contract)

# 2. Create the concern package
mkdir -p repos/own/feeds-npm-pkg
# ... scaffold per §3, write src/, write tests, publish v0.1.0

# 3. Write the knowledge concept file
$EDITOR knowledge/decisions/architecture/packages/feeds.md
# OKF frontmatter + rationale + when-to-use + when-to-NOT-use

# 4. Migrate consumers
# Replace inlined feed code in oriz-blog-app with `import { generateFeeds } from '@oriz/feeds'`
# Same for the second app.

# 5. Commit umbrella
git add knowledge/decisions/architecture/packages/feeds.md repos/own/feeds-npm-pkg
git commit -m "feat(packages): introduce @oriz/feeds — 2-app trigger fired in blog+journal"
```

**Important — do not pre-create the docs site at Day 7.** With only one package, `packages.oriz.in` is a vanity URL. Wait until package #3 ships, then bootstrap the docs site as part of that commit.

### 7.3 Day 30-90 — more packages emerge organically

Per emergence:

1. Confirm 2+ app demand has materialized (don't speculate).
2. `cp -r templates/npm-pkg/ repos/own/<slug>-npm-pkg/` — the template now exists.
3. Customize `package.json#name`, `description`, `src/index.ts`, `README.md`.
4. Write `knowledge/decisions/architecture/packages/<slug>.md` concept file in the same commit on the umbrella.
5. Create the GitHub repo at `oriz-org/<slug>-npm-pkg`. Set up trusted-publisher config on npmjs.com after first manual publish.
6. Migrate consumers; delete inlined copies.
7. When package #3 ships, bootstrap `oriz-org/packages-oriz-in/` per §6 and create the CF Pages project + Deploy Hook.

**Rate limit:** no more than one package per week. The "lazy by design" rule means the velocity is supposed to be low. If the agent is creating two packages in one week, something is wrong (probably speculative atomicity — see risks).

### 7.4 Day 90+ — steady state

The fleet stabilizes at 5-10 packages. New packages emerge ~quarterly. The docs site at `packages.oriz.in` is live. Renovate is keeping deps fresh. Each release passes through release-please's PR gate. The umbrella's `knowledge/decisions/architecture/packages/` directory has one concept file per package, hand-deleted when a package is sunset (per [`knowledge-deletion-not-supersession`](../knowledge/rules/agent/knowledge-deletion-not-supersession.md)).

---

## 8. Out of scope — what this blueprint does NOT solve

- **Auth.** Login is a separate project per [`no-auth-in-apps-or-apis-2026-06-25`](../knowledge/decisions/architecture/security/no-auth-in-apps-or-apis-2026-06-25.md). Apps redirect to `login.oriz.in`, never embed it. No `@oriz/auth` package, ever.
- **India-data API response shapes.** Each `oriz-*-api` repo defines its own response schema and serves via GitHub Pages JSON. The *fetch helper* (`@oriz/data-loaders`) is shared; the *schemas* are per-API and live in each API's repo.
- **App-specific design tokens.** Each app gets its own `frontend-design` pass per [`per-app-distinctive-frontend-design`](../knowledge/rules/design/per-app-distinctive-frontend-design.md). `@oriz/shadcn-presets` (if it ever ships) carries only the shadcn-component-source pattern, never a palette.
- **Analytics.** Inline-only per [`zero-in-house-packages-inline-analytics-2026-06-25`](../knowledge/decisions/architecture/packaging/zero-in-house-packages-inline-analytics-2026-06-25.md). CF Web Analytics + Clarity + PostHog are `<script>` tags in `BaseLayout.astro`, env-gated. No package abstraction. This is non-negotiable.
- **Hosting.** `@astrojs/cloudflare@13` dropped Cloudflare Pages support for Astro 6 SSR (research brief §8.1). Static Astro builds still upload to CF Pages. SSR Astro sites must move to Workers. **Action item:** the existing hosting-split rule may need a revision pass — see open questions §10.
- **Books, blog posts, userscripts, extensions.** These are content/distribution surfaces, not packages. They have their own decision files; they don't consume `@oriz/*` packages today and shouldn't be force-fit.
- **Forks (`repos/frk/*`).** Forks track upstream. They don't consume `@oriz/*` packages; we don't add fleet-internal deps to a fork because it makes the rebase contract painful per [`fork-customization-minimum-conflict`](../knowledge/rules/development/fork-customization-minimum-conflict.md).

---

## 9. Risks + mitigations

| Risk | Description | Mitigation |
|---|---|---|
| **Re-running the 23-packages mistake** | Aggressively planning packages becomes "speculative atomicity"; we add 5 packages without proving demand. Killed in [`zero-in-house-packages-inline-analytics-2026-06-25`](../knowledge/decisions/architecture/packaging/zero-in-house-packages-inline-analytics-2026-06-25.md) the first time. | **2-app trigger is the only door.** Every package PR opens with proof of 2 inlined consumers and a paragraph showing the third would hurt. The agent must paste both consumer code blocks into the commit message. |
| **Speculative atomicity** | Agent reads this blueprint and starts scaffolding the 5 backlog packages on Day 1 to "be ready". | This document explicitly says **"BLUEPRINT, not action plan"** at the top. Templates do not pre-exist in `templates/npm-pkg/` — the first agent to need them creates them. The 5 backlog packages are *predictions*, not assignments. |
| **Maintenance fatigue** | 5-10 packages × monthly Renovate PRs × release-please PRs × CI failures = inbox death. | Renovate auto-merges patches for low-risk deps (research brief §7 preset); release-please batches commits into a single PR; reusable workflow at `oriz-org/ci-workflows` means one upgrade ripples to all packages. **Hard cap:** if the fleet crosses 10 packages and the agent is spending >30 min/week on package chores, audit and sunset the bottom 2. |
| **Astro 7 / breaking framework upgrade** | Astro releases a major; framework-locked packages break across the fleet simultaneously. | Bias to **framework-agnostic pure-TS** for new packages (research brief §8.3). React/Astro touches go in `./react`, `./astro` subpath exports. The pure-TS root is portable; only the subpath surfaces need re-testing on framework majors. |
| **Cloudflare Pages SSR sunset** | `@astrojs/cloudflare@13` drops Pages support for SSR Astro. Existing hosting decision file (hosting-split-cf-and-gh-2026-06-25) may be stale. | **Open question §10.1.** This is a hosting decision, not a packages decision, but the fleet build depends on it. Verify whether the surviving 6 apps are static (CF Pages still works) or SSR (must move to Workers). |
| **First publish footguns** | npm Trusted Publishing requires the package to exist on the registry first (bootstrap problem). Provenance attestation needs `id-token: write` permission, easily forgotten in reusable workflows. | First-publish runbook lives at `knowledge/runbooks/security/npm-publish-token-setup.md` (verify it's current). The reusable workflow at `oriz-org/ci-workflows/.github/workflows/npm-publish.yml@v1` codifies `permissions: { contents: read, id-token: write }`. |
| **Tailwind `@source` footgun** | Package ships fine; consumer build silently drops the package's classnames; QA misses it. | **README must document the exact `@source` line.** This blueprint §4.6 includes it verbatim. CI on each package can include a `pnpm --filter <consumer-app> build && grep -c "<expected-class>" dist/` smoke check. |
| **OIDC publish stalls on Node version** | npm Trusted Publishing requires npm ≥ 11.5.1. Node 22 LTS ships npm 10.x. Workflow fails with a misleading 404. | Workflow pins `node-version: '24'` AND runs `npm install -g npm@latest` as belt-and-braces. Both already in the §3.5 template. |
| **Two-way sync with knowledge bundle** | Agent gets tempted to push package facts back into `knowledge/` from each package repo. | **One-way pull only** per research brief §9. AGENTS.md in each package repo says so. The umbrella owns its facts; packages own their READMEs. |
| **Renovate creates 20+ noisy PRs per week** | Default config opens patch + minor + major PRs per dep per repo. | Preset config (research brief §7) auto-merges patches for known-safe deps (`@types/*`, eslint, prettier, vitest patches); holds majors for `dependencyDashboardApproval`; uses Asia/Kolkata weekend schedule. Result: ~5 PRs/week across the whole fleet at maturity. |
| **shadcn temptation** | Agent sees an app using shadcn components, factors them into `@oriz/ui`, breaks the per-app-distinctive-design rule. | shadcn is **source-distributed by design** (research brief §10). The right pattern at scale is a shadcn-registry repo (which is *not* an npm package), not `@oriz/ui`. If the fleet ever wants this, it's its own decision — not a packages decision. |

---

## 10. Open questions for the user

Three items the research couldn't resolve unilaterally. These should be grilled before the first package ships.

### 10.1 Astro 6 SSR hosting — does the locked hosting-split rule still hold?

Research brief §8.1: `@astrojs/cloudflare@13` (Mar 2026) dropped Cloudflare Pages SSR support; SSR Astro must now move to Workers. The locked rule (`hosting-split-cf-and-gh-2026-06-25`) says "apps deploy to Cloudflare Pages on custom subdomains." That decision was made on 2026-06-25 — same day as today, presumably before this finding surfaced.

**Question:** Are the 6 surviving apps (blog, journal, me, oriz-ncert-app, oriz-lore-app, oriz-janaushdhi-app) static or SSR?
- If **static** (`output: 'static'`) → CF Pages still works, rule stands.
- If **SSR** (`output: 'server'` or `'hybrid'`) → either switch each app to Workers, or revert to static + GH Actions for any dynamic bits.

The packages design doesn't bend on this — it's a hosting question — but the fleet build pipeline does.

### 10.2 First-package trigger — which of the 5 is actually first?

The blueprint ranks `@oriz/feeds` as most likely to trigger first. But the user may already know which app pair is closest to the 2-app trigger:

- Is `blog` already publishing feeds and `journal` is about to? → `@oriz/feeds` first.
- Is the UPI footer about to land on a 3rd app? → `@oriz/donate` first.
- Is `oriz-janaushdhi-app` shipping INR-heavy UIs and `oriz-ncert-app` is about to add textbook prices? → `@oriz/india-format` first.

This affects what gets built into the `templates/npm-pkg/` directory first and what example lives at `packages.oriz.in/index`.

### 10.3 `@oriz/tsconfig-base` — eager or lazy?

The blueprint treats `@oriz/tsconfig-base` as **infrastructure** that ships the same day as the first concern package — not before. But strict "lazy by need" would say wait until the **second** concern package, since at N=1 you don't have duplication.

**Question:** Bend the lazy rule for the tsconfig (because the duplication is genuinely cheap to share and the upgrade leverage is high)? Or stay strict (no `@oriz/tsconfig-base` until N=2, accept the one-time copy-paste)?

Default recommendation: ship `@oriz/tsconfig-base` v1.0.0 the same day as package #1. The cost is ~10 minutes; the upside is one source of truth for fleet-wide TS strictness rolls.

---

## 11. Appendix — quick-reference

### 11.1 The TL;DR table (synthesised from both research briefs)

| Concern | Winner | One-line rationale |
|---|---|---|
| Build tool | **tsdown ^0.22** | tsup README says so; rolldown-based; 2x perf; massive 2026 adoption |
| Test runner | **Vitest 4.1 + @vitest/coverage-v8** | v8 reached istanbul parity in 3.2; browser mode GA in 4.0 |
| Package shape | **ESM-only, exports map types-first/default-last, files whitelist, engines.node ≥ 22** | Node 22 LTS native `require(esm)` killed the dual-publish tax |
| Module resolution | **`nodenext`** for libraries | TS handbook calls bundler-mode "infectious" |
| Strictness | **`@oriz/tsconfig-base` extending `@tsconfig/strictest` + `@tsconfig/node-lts`** + `verbatimModuleSyntax` + `erasableSyntaxOnly` | Multi-extends (TS 5.0+) lets one base compose three concerns |
| Release automation | **release-please-action v5** | CC-driven, human-gated, Apache-2.0, active |
| CI on free tier | **GitHub Actions + npm Trusted Publishing (OIDC)** | Public repos = unlimited minutes; no `NPM_TOKEN` |
| Dep updates | **Mend Renovate Cloud (free) + preset repo + Dependabot security alerts** | Renovate has shareable presets; Dependabot still doesn't in 2026 |
| Astro consumption | **Pure-TS framework-agnostic in `.astro` frontmatter; React via `./react` subpath + `client:visible`** | Zero hydration when possible; isolate React |
| Peer deps | **`react ^18 \|\| ^19` peer; Radix as deps; Tailwind devDep-only** | Matches every major library on the registry |
| Tailwind delivery | **Ship raw `.tsx` + `./theme.css`; document `@source` line in README** | node_modules excluded from v4 auto-scan; library CSS isn't consumer-tree-shaken |
| Docs site | **Astro Starlight 0.41+ on CF Pages, Pagefind built-in** | Family default; cleanest aggregation primitive; real reference architecture exists |
| README aggregation | **Astro Content Layer loader pulling from sibling repos via GH API at build time** | Build-time deterministic; sub-second freshness via Deploy Hook |
| Build trigger | **CF Pages Deploy Hook fired by sibling release workflow** | No PAT, no commit-back loop, audit trail in CF panel |
| README format | **Plain GFM, ~80 lines** | npm + GitHub render GFM only; viem/wagmi/hono/shadcn/Astro all do this |
| Changelog visibility | **Per-repo CHANGELOG.md (release-please) + aggregated `/releases` page on docs site** | Mirror Vitest's three-surface pattern |
| Versioned docs routes | **None; latest only** | Lucide pattern; Starlight has no native versioning |
| Search | **Pagefind (built-in)** | Static, zero infra; switch to Algolia DocSearch only if UX limits |
| TypeDoc | **Skip per-repo; run at docs-site only if >5 exports** | TypeDoc maintainer himself says so for tiny libs |
| Knowledge sync | **One-way pull from `knowledge/`** | OKF is publish-once-read-many by design |

### 11.2 Fleet bootstrap order (if rebuilding from zero)

1. **Day 0**: zero packages, zero `@oriz/*` repos. Templates don't exist yet. All apps inline shared logic. Wait.
2. **Day N₁** (first 2-app trigger fires):
   - Create `oriz-org/tsconfig-base-npm-pkg/`, publish `@oriz/tsconfig-base@1.0.0`.
   - Create `oriz-org/renovate-config/` (NOT a package — just a Renovate preset repo).
   - Create `oriz-org/ci-workflows/` with `npm-publish.yml@v1`.
   - Create `oriz-org/<concern>-npm-pkg/` (probably `@oriz/feeds`), publish v0.1.0.
   - Write `knowledge/decisions/architecture/packages/<concern>.md` concept file in the same umbrella commit.
   - Migrate 2 consumer apps to use the package. Delete their inlined copies.
3. **Day N₂** (second trigger): Add next package. Same drill.
4. **Day N₃** (third package ships): Bootstrap `oriz-org/packages-oriz-in/` (Starlight docs site) + CF Pages project + Deploy Hook. Wire all 3 packages.
5. **Day 90+**: Steady state. New packages emerge ~quarterly. Renovate keeps deps fresh. Docs site auto-rebuilds on each release.

### 11.3 References — the locked knowledge files this blueprint respects

- [`framework-astro-react-tailwind-shadcn-2026-06-25`](../knowledge/decisions/architecture/frontend/framework-astro-react-tailwind-shadcn-2026-06-25.md) — stack lock
- [`workspace-flat-repos-2026-06-25`](../knowledge/decisions/architecture/infrastructure/workspace-flat-repos-2026-06-25.md) — `repos/own/<slug>-npm-pkg/` layout
- [`umbrella-as-clone-entrypoint-2026-06-25`](../knowledge/decisions/architecture/infrastructure/umbrella-as-clone-entrypoint-2026-06-25.md) — single-clone fleet
- [`zero-in-house-packages-inline-analytics-2026-06-25`](../knowledge/decisions/architecture/packaging/zero-in-house-packages-inline-analytics-2026-06-25.md) — analytics inline-only
- [`no-auth-in-apps-or-apis-2026-06-25`](../knowledge/decisions/architecture/security/no-auth-in-apps-or-apis-2026-06-25.md) — no auth in apps
- [`donations-only-2026-06-25`](../knowledge/decisions/architecture/monetisation/donations-only-2026-06-25.md) — donations only
- [`per-app-distinctive-frontend-design`](../knowledge/rules/design/per-app-distinctive-frontend-design.md) — per-app design pass
- [`use-pnpm`](../knowledge/rules/development/use-pnpm.md), [`conventional-commits`](../knowledge/rules/development/conventional-commits.md), [`always-latest-deps`](../knowledge/rules/development/always-latest-deps.md), [`one-branch-only`](../knowledge/rules/development/one-branch-only.md) — development discipline
- [`github-org-level-secrets`](../knowledge/rules/security/github-org-level-secrets.md), [`no-hardcoded-secrets`](../knowledge/rules/security/no-hardcoded-secrets.md) — secret management
- [`self-update-rule`](../knowledge/rules/agent/self-update-rule.md), [`knowledge-deletion-not-supersession`](../knowledge/rules/agent/knowledge-deletion-not-supersession.md) — knowledge discipline

---

*Brief synthesised 2026-06-25. Source briefs: `research-npm-astro-2026.md` (~700 lines, 50+ citations), `research-monorepo-docs-2026.md` (444 lines, 25+ citations). This brief is not a decision — locking it requires the user's grill pass.*
