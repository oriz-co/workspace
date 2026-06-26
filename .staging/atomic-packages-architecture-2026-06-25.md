# Atomic Packages Architecture — Blueprint

> Drafted 2026-06-25. Status: **blueprint, not implementation**. Zero packages exist today and zero will be created from this brief — it is the playbook for when the first 2-app demand trigger fires.
>
> Inputs: `.staging/research-npm-astro-2026.md`, `.staging/research-monorepo-docs-2026.md`. All picks below are locked from those briefs; this document only synthesizes them into an architecture and a backlog.
>
> Reverses nothing. Honors: zero-in-house-packages-inline-analytics (current), polyrepo-with-category-consolidation, fs-own-frk-split, no-auth-in-apps-or-apis, donations-only-no-pro-no-ads, fleet-owner-oriz-org, lean-by-need-not-count, build-gate-top3-must-have-defect.

---

## 0. One-page summary

The oriz fleet is **zero-in-house-packages today** (analytics inline in BaseLayout, six surviving apps each self-contained). A package only emerges when **two or more apps independently grow the same logic** and the inline-then-extract cost beats the keep-inline cost. This blueprint says nothing about when the trigger fires — only what the **shape** of that emergence is when it does.

**Shape:**
- One `@oriz/<concern>` package = one concern = 100-300 LOC = 3-5 exports.
- Lives at `repos/own/<slug>-npm-pkg/` as a submodule of the umbrella; published from its own repo via OIDC trusted publishing on GitHub Actions.
- Built with **tsdown** (ESM-only). Astro components ship as raw `.astro`/`.tsx` source (no build step) with `astro` as a peer dependency.
- Released via **release-please** on conventional commits, kept at `0.x.y` until a real external consumer asks for stability.
- Tested with **Vitest 3.2+** and Astro's experimental Container API.
- Docs aggregate at **`docs.oriz.in`** (Astro Starlight) using Pagefind `mergeIndex` across each package's own `docs/` build.
- Shared base configs: **`@oriz/tsconfig`**, **`@oriz/eslint-config`** (thin wrapper over `@antfu/eslint-config`), **`@oriz/biome-config`**, **`oriz-org/automation`** for reusable workflows, **`oriz-org/renovate-config`** for dep policy.

**Anti-shape (what we are NOT doing):**
- No `@oriz/sdk` umbrella package. The 23-package SDK was archived 2026-06-25 — we are not re-doing that.
- No package that exists "in case someone needs it." The build-gate-top3-must-have-defect rule extends to internal libraries: a package needs a real second consumer at the moment it is born, not a speculative one.
- No published auth, no published India-data API client, no published analytics wrapper. These are scoped to separate projects (auth) or stay inline (analytics).
- No private `@oriz/` packages. Everything we publish is public on npmjs.com (the alternative is a paid registry — violates the no-card rule).

---

## 1. End state at 6 months (sketch, ~5-10 packages)

This is a **forecast**, not a plan. Each row only ships if 2+ apps independently demand it.

| Pkg | Concern | Likely consumers | Why it stays small |
|---|---|---|---|
| `@oriz/tsconfig` | Shared TS base configs (`base`, `astro`, `library`) | Every repo | Pure config; no runtime |
| `@oriz/eslint-config` | Flat-config wrapper over `@antfu/eslint-config` + oriz overrides | Every repo | Thin (≤30 LOC of rules) |
| `@oriz/biome-config` | Shared `biome.json` exported via `exports` | Every repo (where Biome wins over ESLint) | Pure config |
| `@oriz/theme` | Tailwind v4 `@theme` tokens + shared `globals.css` | All 6 apps | One CSS file; no JS |
| `@oriz/ui` | Headless shadcn-derived components (Button, Card, Modal, Input, Dialog) shipped as raw `.tsx` + `.astro` | All 6 apps | Components only; ~10-15 in total |
| `@oriz/layouts` | `BaseLayout.astro`, `DonationFooter.astro`, `SEOHead.astro` | All 6 apps | 3-4 components |
| `@oriz/utils` | Pure TS helpers: `cn`, `formatDate`, `slugify`, `debounce`, `safeJSON` | Apps + other oriz pkgs | ≤200 LOC, zero deps |
| `@oriz/seo` | `<SEOHead>` + sitemap/feed helpers | Content apps (blog, journal, me) | 1 component + 2 helpers |
| `@oriz/india-numbers` | `formatINR`, `wordsToINR`, `numToINRWords` (lakh/crore math) | finance app + janaushdhi app + lore app | Pure TS, ~100 LOC |
| `@oriz/donate` | `<BuyMeACoffee />`, `<UPIQR />`, `<GitHubSponsors />` | All 6 apps | 3 components; no auth |

**Likely cap:** 7-10 packages. The "lean by need, not count" rule says we don't force more.

**What stays inline forever** (not packaged, per zero-in-house-packages-inline-analytics):
- Cloudflare Analytics / Clarity / PostHog / Fathom / GoatCounter / GA4 snippets — they live in `BaseLayout.astro` per app.
- Per-app design tokens (frontend-design pass per repo) — only the **baseline** lives in `@oriz/theme`.
- App-specific routes, content collections, and middleware.

---

## 2. Initial backlog — next 0-3 months

These are the **5 most likely** first emergences, ranked by probability of triggering. Order is calibrated against the locked 6-app surface (blog, journal, me, oriz-ncert-app, oriz-lore-app, oriz-janaushdhi-app).

### 2.1 `@oriz/tsconfig` — base TS configs

- **Concern:** One published `tsconfig.json` family extended by every repo.
- **Exports:** `./base.json`, `./astro.json`, `./library.json`, `./node.json`.
- **Consumers:** all 6 apps + every future `*-npm-pkg`.
- **Trigger:** the **moment** we add a second app that needs `strict: true` + `moduleResolution: nodenext` + the same `lib` array. We already have 6 apps — the trigger has *technically* fired; we just haven't created the package because no friction was felt yet. **Recommendation: ship this first, even before component packages.** The friction is invisible until the third drift incident.
- **LOC:** ~40 lines of JSON across 4 files. Effectively zero runtime.
- **Risk:** thin wrapper temptation. Resist publishing under `@oriz/` if `@tsconfig/strictest` + `@tsconfig/node-lts` already cover the surface — start by extending the community presets directly and only fork into `@oriz/tsconfig` once we have ≥3 oriz-specific overrides.

### 2.2 `@oriz/theme` — Tailwind v4 tokens + globals.css

- **Concern:** Single CSS file with `@theme { ... }` tokens consumed by every app's `@import "tailwindcss"` block.
- **Exports:** `./theme.css`, `./globals.css`, `./reset.css`.
- **Consumers:** all 6 apps.
- **Trigger:** the second time we copy-paste the same `oklch()` palette into a second app's `global.css`. With the frontend-design-pass-per-repo rule, each app diverges in *details* but shares the *baseline* (font stack, spacing scale, radius). The baseline is what gets packaged.
- **LOC:** ~80 lines of CSS.
- **Risk:** scope creep. Per-app palette overrides MUST stay in the app repo, not leak into `@oriz/theme`. Discipline: `@oriz/theme` exports tokens; the app's `global.css` overrides them via `--color-brand-500: ...` after the `@import "@oriz/theme/theme.css"`.

### 2.3 `@oriz/ui` — headless component pack (raw `.astro` + `.tsx`)

- **Concern:** ~10 components that 2+ apps need verbatim. Buttons, cards, modal, dialog, badge, input.
- **Exports:** `./Button.astro`, `./Card.astro`, `./Modal.tsx`, `./Dialog.tsx`, `./index.ts` (barrel), `./styles.css`.
- **Consumers:** all 6 apps. Most likely first pair: **blog + me** (both need cards + button + footer); **oriz-ncert-app + oriz-lore-app** (both need dialog + modal for content browsing).
- **Trigger:** when the second app copies the same shadcn-derived `Button.tsx` and one of them gets a bug-fix the other doesn't. That divergence is the signal.
- **LOC:** ~150-250 total. Each component is 15-40 LOC.
- **Risk:** **the 23-package SDK trap.** Mitigation: ONE package, not one-per-component. Don't split `@oriz/button` from `@oriz/card`. Concern-atomicity here is "shared visual primitives", not "one component each."

### 2.4 `@oriz/utils` — pure TS helpers

- **Concern:** Zero-dep TS functions used across apps. `cn` (clsx wrapper), `formatDate` (Intl-based, locale=en-IN), `slugify`, `safeJSON.parse`, `debounce`, `throttle`.
- **Exports:** `./cn`, `./date`, `./slug`, `./json`, `./fn`, `./index.ts` (barrel).
- **Consumers:** all 6 apps + other oriz pkgs.
- **Trigger:** when the second app needs the same `cn` helper and we feel the urge to copy the same 4 lines. The threshold here is *low* because the helper is tiny — but the visibility of "where did I write this helper last" is high.
- **LOC:** ~100-150 total.
- **Risk:** "this could be lodash-es." Stay disciplined: only the helpers actually used in 2+ apps make it in. We are not building a lib.

### 2.5 `@oriz/india-numbers` — INR formatting + lakh/crore math

- **Concern:** `formatINR(1234567)` → `"₹12,34,567"`, `numToINRWords(123456)` → `"one lakh twenty three thousand..."`, `parseINRShorthand("1.5 cr")` → `15000000`.
- **Exports:** `./format`, `./words`, `./parse`, `./index.ts`.
- **Consumers:** oriz-janaushdhi-app (drug prices), oriz-lore-app (story-level wealth narratives), future finance app (EMI/SIP route lives on finance.oriz.in per polyrepo-with-category-consolidation).
- **Trigger:** the second app that needs grouping-by-2-then-3 (Indian numbering system) and we feel the urge to NPM the same 30-line helper. This is the textbook concern-atomic package.
- **LOC:** ~150.
- **Risk:** scope creep into "Indian utilities in general" (calendar, holidays, GST). Resist — those are separate concerns and separate packages if they ever happen.

**Packages NOT in the initial backlog (deliberate):**
- `@oriz/donate` — every app inlines `<a href="https://buymeacoffee.com/...">`. The footer is 6 lines. No package yet.
- `@oriz/seo` — Astro's `<head>` is fine; one component per app, divergence is welcome (different schemas per app type).
- `@oriz/eslint-config` — use `@antfu/eslint-config` directly until we have 3+ org-specific overrides.
- `@oriz/biome-config` — wait until we commit to Biome over ESLint+Prettier across all repos. That decision isn't made.
- `@oriz/auth` — banned per no-auth-in-apps-or-apis.
- `@oriz/analytics` — banned per zero-in-house-packages-inline-analytics.

---

## 3. Per-package scaffolding template

Every `@oriz/*` package looks the same. The template below is the contract.

### 3.1 Repo layout

```
repos/own/<slug>-npm-pkg/        # checked out by the umbrella as a submodule
  .github/
    workflows/
      ci.yml                     # calls oriz-org/automation/.github/workflows/_ci.yml
      release-please.yml         # opens/maintains the Release PR
      publish.yml                # fires on tag push → npm publish via OIDC
    renovate.json                # { "extends": ["github>oriz-org/renovate-config:lib"] }
  docs/                          # Starlight site, deployed to <slug>.docs.oriz.in
    src/content/docs/
      index.md
      api/                       # TypeDoc output via starlight-typedoc
    astro.config.mjs
    package.json
  src/
    index.ts                     # barrel — only re-exports
    <concern>.ts                 # one file per concern (or one .astro/.tsx per component)
    <concern>.test.ts            # colocated with source
    <concern>.test-d.ts          # type-tests (optional)
  .env.example                   # never committed with real values
  .gitignore
  CHANGELOG.md                   # release-please managed
  LICENSE                        # MIT
  README.md                      # npm-rendered; the front door
  package.json
  tsconfig.json
  tsdown.config.ts               # absent for components-only packages (no build)
  vitest.config.ts
```

For **components-only packages** (`@oriz/ui`, `@oriz/theme`, `@oriz/layouts`): drop `tsdown.config.ts`, point `exports` at `src/` directly, set `files: ["src", "index.ts"]`.

### 3.2 `package.json` — TS utility shape

```jsonc
{
  "name": "@oriz/utils",
  "version": "0.1.0",
  "description": "Pure TypeScript helpers used across the oriz fleet",
  "license": "MIT",
  "type": "module",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/oriz-org/utils-npm-pkg.git"
  },
  "homepage": "https://utils.docs.oriz.in",
  "bugs": "https://github.com/oriz-org/utils-npm-pkg/issues",
  "keywords": ["oriz", "utilities"],
  "engines": { "node": "^20.19.0 || >=22.12.0" },
  "sideEffects": false,
  "files": ["dist", "README.md", "LICENSE", "CHANGELOG.md"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./cn": {
      "types": "./dist/cn.d.ts",
      "default": "./dist/cn.js"
    },
    "./date": {
      "types": "./dist/date.d.ts",
      "default": "./dist/date.js"
    },
    "./package.json": "./package.json"
  },
  "scripts": {
    "build": "tsdown",
    "dev": "tsdown --watch",
    "test": "vitest run",
    "test:types": "vitest --typecheck",
    "type-check": "tsc --noEmit",
    "lint": "eslint .",
    "lint:pkg": "publint && attw --pack .",
    "docs:dev": "astro dev --root docs",
    "docs:build": "astro build --root docs"
  },
  "publishConfig": {
    "access": "public",
    "provenance": true
  },
  "devDependencies": {
    "@arethetypeswrong/cli": "^0.17.0",
    "@oriz/eslint-config": "^0.1.0",
    "@oriz/tsconfig": "^0.1.0",
    "publint": "^0.3.0",
    "tsdown": "^0.22.0",
    "typescript": "^5.9.0",
    "vitest": "^3.2.0"
  }
}
```

### 3.3 `package.json` — Astro component shape (no build)

```jsonc
{
  "name": "@oriz/ui",
  "version": "0.1.0",
  "type": "module",
  "license": "MIT",
  "keywords": ["oriz", "astro-component", "withastro"],
  "sideEffects": ["**/*.css", "**/*.astro"],
  "files": ["src", "index.ts"],
  "exports": {
    ".": "./index.ts",
    "./Button.astro": "./src/Button.astro",
    "./Card.astro": "./src/Card.astro",
    "./Modal.tsx": "./src/Modal.tsx",
    "./Dialog.tsx": "./src/Dialog.tsx",
    "./styles.css": "./src/styles.css",
    "./package.json": "./package.json"
  },
  "peerDependencies": {
    "astro": "^6.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "peerDependenciesMeta": {
    "react": { "optional": true },
    "react-dom": { "optional": true }
  },
  "devDependencies": {
    "astro": "^6.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@oriz/tsconfig": "^0.1.0",
    "typescript": "^5.9.0",
    "publint": "^0.3.0"
  }
}
```

### 3.4 `tsconfig.json`

```jsonc
{
  "extends": "@oriz/tsconfig/library",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["**/*.test.ts", "**/*.test-d.ts", "dist", "docs"]
}
```

`@oriz/tsconfig/library` sets: `module: nodenext`, `moduleResolution: nodenext`, `target: es2022`, `strict: true`, `declaration: true`, `declarationMap: true`, `sourceMap: true`, `verbatimModuleSyntax: true`, `isolatedModules: true`.

### 3.5 `tsdown.config.ts`

```ts
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/cn.ts', 'src/date.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  minify: false,
});
```

For multi-entry packages, list every entry; tsdown auto-derives `exports` from `package.json` if the entries match the subpaths.

### 3.6 `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    typecheck: {
      enabled: true,
      include: ['src/**/*.test-d.ts'],
    },
    coverage: {
      provider: 'v8',
      experimentalAstAwareRemapping: true,
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/index.ts'],
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
    },
  },
});
```

### 3.7 `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
jobs:
  ci:
    uses: oriz-org/automation/.github/workflows/_ci-npm.yml@main
    with:
      node-version: '24'
```

The reusable workflow in `oriz-org/automation` does: checkout → setup-node → install → `npm run lint` → `npm run type-check` → `npm test` → `npm run build` → `npm run lint:pkg`.

### 3.8 `.github/workflows/release-please.yml`

```yaml
name: Release Please
on:
  push: { branches: [main] }
permissions:
  contents: write
  pull-requests: write
jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: googleapis/release-please-action@v4
        with:
          release-type: node
```

### 3.9 `.github/workflows/publish.yml`

```yaml
name: Publish
on:
  push:
    tags: ['v*']
permissions:
  contents: read
  id-token: write
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install -g npm@latest
      - run: npm ci
      - run: npm run build
      - run: npm test
      - run: npm publish
```

No `NODE_AUTH_TOKEN`. No `--provenance` (auto-emitted by OIDC). The `id-token: write` permission is what makes Trusted Publishing work.

### 3.10 First-publish bootstrap (one-time, per package)

Trusted Publishing can't do the first publish. Two-step bootstrap:

1. **Local first publish:** `npm publish` with a session token (`npm login` → 2-hour token).
2. **Attach Trusted Publisher** on npmjs.com → package settings → Trusted Publisher → GitHub Actions → fill org=`oriz-org`, repo=`<slug>-npm-pkg`, workflow=`publish.yml`.
3. From v0.1.1 onward, releases run via OIDC with zero tokens.

### 3.11 `README.md` skeleton

```md
# @oriz/<concern>

> One-sentence concern statement.

## Install

\`\`\`bash
npm i @oriz/<concern>
\`\`\`

## Use

\`\`\`ts
import { fn } from '@oriz/<concern>';
fn();
\`\`\`

## API

See [<slug>.docs.oriz.in](https://<slug>.docs.oriz.in) for the full API reference.

## License

MIT
```

### 3.12 `.env.example`

Per the locked rule (per-repo `.env` + `.env.example` with hand-maintained comments + obtain-steps), every package repo has one even if it's empty:

```bash
# .env.example
# This package is library code — no runtime secrets needed.
# If a contributor wants to publish locally:
#   NPM_TOKEN: not required if you've configured npm Trusted Publisher and run via CI.
#   For a local emergency publish: run `npm login` to get a 2-hour session token.
#   Obtain steps: npmjs.com → Account → Access Tokens (granular, 7-day max).
```

---

## 4. Consumer pattern — how an Astro app uses an `@oriz/*` package

### 4.1 Install

```bash
# inside repos/own/blog/
npm i @oriz/ui @oriz/theme @oriz/utils
```

Submodules don't change anything — each app's own `package.json` resolves from npm just like any other package.

### 4.2 Wire CSS (once, in BaseLayout)

```css
/* src/styles/global.css inside the app */
@import "tailwindcss";
@import "@oriz/theme/theme.css";

/* Per-app overrides (frontend-design-pass-per-repo) */
@theme {
  --color-brand-500: oklch(0.62 0.21 286);  /* this app's accent */
}

/* Critical: scan @oriz/ui source so its Tailwind classes generate.
   Path is relative to this file's directory. */
@source "../../node_modules/@oriz/ui/src/**/*.{astro,tsx,jsx}";
```

```astro
---
// src/layouts/BaseLayout.astro
import '../styles/global.css';
import '@oriz/ui/styles.css';
const { title } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <title>{title}</title>
    <!-- inline analytics scripts stay here -->
  </head>
  <body><slot /></body>
</html>
```

### 4.3 Use components

```astro
---
import { Button, Card } from '@oriz/ui';
import Modal from '@oriz/ui/Modal.tsx';
import { cn, formatDate } from '@oriz/utils';
---
<Card>
  <h2 class={cn('text-xl', 'font-bold')}>Hello</h2>
  <p>Published {formatDate(new Date())}</p>
  <Button>Click</Button>
  <Modal client:visible />
</Card>
```

`client:load`, `client:visible`, etc. work across package boundaries — Astro 6 PR #14751 fixed the barrel-export hydration bug.

### 4.4 No build step on the consumer for `.astro`/`.tsx`

Astro's Vite reads raw source from `node_modules/@oriz/ui/src/*.astro` and compiles in the consumer. No prebuild is needed. The package ships source, not dist.

### 4.5 TypeScript

The app's `tsconfig.json` extends `@oriz/tsconfig/astro`. `@oriz/utils`'s `.d.ts` files are resolved automatically via the `exports.types` condition. ⌘-click on an import opens the original source thanks to `declarationMap`.

---

## 5. Versioning and release

### 5.1 Conventional commits — the contract

Every commit on `main` (or merged via PR) follows:

```
<type>(<scope>): <subject>

[optional body]

[optional footer with BREAKING CHANGE: ...]
```

Types: `feat` (minor bump), `fix` (patch), `chore`/`docs`/`refactor`/`test` (no bump), `feat!`/`fix!` or `BREAKING CHANGE:` footer (major).

`commitlint` + `@commitlint/config-conventional` runs on a husky `commit-msg` hook, set up by `oriz-org/automation/.github/workflows/_setup-husky.yml` or by the repo template.

### 5.2 release-please flow

1. Push `feat: add formatINR` to `main`.
2. release-please-action opens (or updates) a "release-please--branches--main" PR titled `chore(main): release 0.2.0`. It updates `CHANGELOG.md` and bumps `package.json` to `0.2.0`.
3. Review the PR. Merge when ready.
4. Merging the Release PR creates a `v0.2.0` tag + GitHub Release.
5. The tag push triggers `publish.yml`, which runs `npm publish` via OIDC. Provenance auto-attaches.

The Release PR is a **human checkpoint** — no surprise publishes. This is the key difference from semantic-release.

### 5.3 Initial version: `0.1.0`

Every package starts at `0.1.0` (not `1.0.0`). `0.x.y` signals "API may change without notice." This matches the donations-only / no-paid-support posture: nobody is buying stability from us.

### 5.4 When to go `1.0.0`

Conditions (all must be true):
1. At least one external (non-oriz) consumer is using the package on a published app or library.
2. The API hasn't had a breaking change in 60 days.
3. The docs page is complete (every export documented).
4. `attw --pack .` and `publint` are clean.
5. Conscious decision: "we are now promising backwards compatibility for this surface."

Until then: stay on `0.x.y`. Breaking changes bump the minor (`0.2.x` → `0.3.0`), not the major.

### 5.5 Internal-only packages (`@oriz/tsconfig`, `@oriz/eslint-config`, `@oriz/biome-config`)

Same flow, same OIDC, but these may stay on `0.x.y` indefinitely — they only have internal consumers, and major bumps are cheap when you control all the consumers.

### 5.6 Cross-package version coordination

**There isn't any.** Each package is its own polyrepo. If `@oriz/ui` bumps and `@oriz/theme` is unaffected, only `@oriz/ui` ships.

Cross-package internal-dep bumps (e.g., `@oriz/ui` depends on `@oriz/utils`) are handled by Renovate, which opens a PR in `@oriz/ui` when `@oriz/utils` ships a new version. Conventional commit on that PR triggers release-please.

This is the polyrepo tax we accepted. Changesets would close the gap — but only inside a monorepo. We're not in a monorepo.

---

## 6. Documentation — `docs.oriz.in` aggregator

### 6.1 Per-package docs site

Every `@oriz/*` package has a `docs/` directory at the repo root that is its own Astro Starlight site. It deploys to `<slug>.docs.oriz.in` (CF Pages, one CF project per repo).

Structure:

```
docs/
  src/content/docs/
    index.md            # mirrors README.md plus deeper guide
    guides/
      getting-started.md
      patterns.md
    api/                # generated by starlight-typedoc at build time
  astro.config.mjs      # Starlight + starlight-typedoc + Pagefind
  package.json
```

`astro.config.mjs` registers `starlight-typedoc` pointing at `../src/index.ts`. TypeDoc + typedoc-plugin-markdown emit MDX into `src/content/docs/api/` at build time.

### 6.2 Aggregator at `docs.oriz.in`

A separate repo `repos/own/docs-aggregator/` (an Astro Starlight site) at `docs.oriz.in`. It contains:

- Landing page with package cards (one per `@oriz/*`).
- A search box backed by **Pagefind `mergeIndex`** that pulls each `<slug>.docs.oriz.in/pagefind/` bundle at client load and federates results.
- A "Patterns" section with cross-package recipes (e.g., "Build a card list using `@oriz/ui` + `@oriz/utils`").

`mergeIndex` setup (client-side):

```js
// docs.oriz.in's search component
import { Pagefind } from '@pagefind/default-ui';
const pagefind = await import('/pagefind/pagefind.js');
await pagefind.options({
  mergeIndex: [
    { bundlePath: 'https://utils.docs.oriz.in/pagefind/' },
    { bundlePath: 'https://ui.docs.oriz.in/pagefind/' },
    { bundlePath: 'https://theme.docs.oriz.in/pagefind/' },
    // ...one entry per @oriz/* package
  ],
});
```

CORS must be enabled on each `<slug>.docs.oriz.in` for the aggregator's origin. CF Pages does this with a `_headers` file.

### 6.3 Why per-repo + aggregator, not single-site

- Single-aggregator-pulls-everything-at-build requires the aggregator to clone every repo at build time. That couples the docs site's CI to every package release — exactly the polyrepo isolation we worked to keep.
- Per-repo docs deploy independently. A doc-only fix to `@oriz/utils` doesn't rebuild every other docs site.
- Pagefind `mergeIndex` solves "one search across all docs" without the build-time coupling.

### 6.4 Defer versioning

No `/v0/`, `/v1/` paths. We ship at HEAD. The docs always reflect latest. If/when we hit a real downstream consumer asking for old docs, evaluate `starlight-versions` (community plugin) per-package — not site-wide.

### 6.5 TypeDoc threshold

For packages with ≤20 exports: README + `index.md` is enough; skip the TypeDoc generation. For packages with >20 exports: `starlight-typedoc` is the toggle.

---

## 7. Migration path — day-by-day

### Day 0 (today, 2026-06-25)

- Zero `@oriz/*` packages exist or are reserved.
- All 6 apps work and ship independently. Analytics is inline. Components are copy-pasted across apps where they happen to overlap (which is rare — apps are still divergent enough that no real overlap is felt).
- No `oriz-org/automation`, no `oriz-org/renovate-config`, no `oriz-org/tsconfig` repos exist yet.

### Day 1-7

- Create the **tooling infrastructure** (not packages, infrastructure):
  - `oriz-org/automation` — reusable workflows `_ci-npm.yml`, `_release-npm.yml`, `_docs-cf-pages.yml`.
  - `oriz-org/renovate-config` — `default.json`, `lib.json`, `app.json` per research brief §4.
  - `oriz-org/.github` — community-health files + workflow templates.
- Switch all 6 apps to `.github/renovate.json` extending `oriz-org/renovate-config:app`.
- Onboard the Mend Renovate Community Cloud app at the org level.
- Enable Dependabot for `github-actions` only in each repo (security advisories).

This is **infrastructure, not packages.** No publish to npm yet.

### Day 7-14 — first package likely emerges

Most likely candidate: **`@oriz/tsconfig`**. Trigger: someone notices that the 3rd app's `tsconfig.json` drifted from the first two.

Steps:
1. `gh repo create oriz-org/tsconfig-npm-pkg --public --template oriz-org/npm-pkg-template` (template repo TBD — for now, copy the scaffold from §3).
2. Add as submodule under `repos/own/`.
3. First-publish via local `npm publish` (Trusted Publishing can't bootstrap).
4. Attach Trusted Publisher on npmjs.com.
5. Open PR in each consumer app to switch `tsconfig.json` to `"extends": "@oriz/tsconfig/astro"`.

### Day 14-30 — second package emerges

Most likely: **`@oriz/theme`**. Trigger: the second frontend-design-pass-per-repo lands and the baseline tokens duplicate.

By day 30 the fleet has 1-2 packages and a tooling infra layer. No more.

### Day 30-60

- `@oriz/utils` likely emerges when the 3rd `cn` copy-paste is felt.
- `@oriz/ui` likely emerges when the first cross-app bug-fix divergence is felt (one app fixed a Button11y issue and another didn't).
- `docs.oriz.in` aggregator goes up as soon as there are 2 packages with docs to federate.

### Day 60-90

- `@oriz/india-numbers` likely emerges if the janaushdhi + lore apps both ship.
- 3-5 packages total. Cap rising slowly.

### Day 90-180

- Evaluate `@oriz/eslint-config` (only if `@antfu/eslint-config` overrides have accumulated to ≥3 oriz-specific rules).
- Evaluate `@oriz/biome-config` (only if Biome vs ESLint decision lands on Biome).
- 5-10 packages total at month 6.

### What kills a candidate

If a proposed package gets to "we'd extract this" but the trigger doesn't actually fire (only 1 app uses it, or the divergence between apps is wider than the shared surface), it stays inline. Inline is the default; package is the deviation.

---

## 8. What this does NOT solve

Out of scope for this blueprint by design:

### 8.1 Auth

**Separate project entirely** (per no-auth-in-apps-or-apis). The 6 surviving apps are 100% public — no login, no account dashboard, no per-user state. If/when a future app needs auth, it goes into a separate project repo with its own auth service. No `@oriz/auth` package. No middleware integration. No shared session helpers.

### 8.2 India-data APIs

Each India-data API (drug prices for janaushdhi, NCERT content, etc.) is a **self-contained service** in its own repo. They don't share a client library, because:
- Each API has its own shape, auth model, rate-limit story.
- The total client-side surface is tiny (1-3 endpoints per API).
- A "@oriz/india-data-clients" umbrella is exactly the 23-package SDK trap.

The `@oriz/india-numbers` package is the *formatting* concern, not the *data fetching* concern. Big difference.

### 8.3 App-specific design tokens

Per frontend-design-pass-per-repo: each category app has its own palette, typography signature, motion language. `@oriz/theme` exports the **baseline only** (font stack, spacing scale, radius scale, neutral grays). Per-app accent colors, brand fonts, custom animations stay in the app's `global.css` as overrides.

If two apps converge on the same accent... extract to `@oriz/theme/colors/<name>.css` as an opt-in subpath. But that's a future-day problem.

### 8.4 Analytics

Inline forever, per zero-in-house-packages-inline-analytics. The 6 snippets (CF, Clarity, PostHog, Fathom, GoatCounter, GA4) live in each app's `BaseLayout.astro`. The build-time injection via GH org secrets is a *workflow* concern (handled by `oriz-org/automation`), not a *package* concern.

### 8.5 Deploy / hosting glue

CF Pages and GitHub Pages configs stay in each app's repo. No `@oriz/deploy` package. The reusable workflow `oriz-org/automation/_deploy-cf.yml` handles deploys via shared YAML, which is the right grain.

### 8.6 Per-app content

Blog posts, journal entries, NCERT content collections, lore stories — all stay in their respective app repos. Astro content collections don't generalize across categories cleanly.

---

## 9. Risks and mitigations

### 9.1 Risk: Re-doing the 23-package SDK mistake

**The 2026-06-25 archive of 23 packages happened because:** each package was speculative, none had 2+ real consumers, and the maintenance overhead of 23 release pipelines exceeded the value delivered. Mitigation:

- **Build-gate at the package level.** A package may not be created without **2 apps that already independently grew the same logic.** Not "two apps that might need it" — two apps that DID.
- **Concern-atomic, not function-atomic.** `@oriz/ui` (one package, 10 components) > `@oriz/button` + `@oriz/card` + `@oriz/modal` (three packages).
- **Lean by need, not count.** No minimum package count. We are happy to have 0 packages for 6 months if the inline cost stays low.
- **Quarterly review.** At month 3 and month 6, every package is reviewed for "is this still earning its weight?" Packages with <2 active consumers are deprecated (kept on npm at last version, archived on GitHub).

### 9.2 Risk: Speculative atomicity

**Symptom:** "we should split `@oriz/ui` into `@oriz/ui-core` and `@oriz/ui-icons`." Mitigation:

- Splits require the same 2-consumer trigger that creates a new package. If the splits don't both have 2+ consumers, they don't happen.
- The default direction is **consolidate** (merge two underused packages into one), not split.

### 9.3 Risk: Tooling lock-in

**Symptom:** tsdown turns out to be wrong, or release-please dies in 2027. Mitigation:

- All picks are **standards-compatible.** tsdown emits standard ESM; switching to tsup is a 90-second sed. release-please writes standard `CHANGELOG.md`; switching to changelogithub is a workflow swap.
- The package.json `exports` map is the contract, not the build tool. Consumers don't see what we build with.

### 9.4 Risk: Polyrepo coordination tax

**Symptom:** changing `@oriz/utils` requires PRs in 5 apps + 3 packages. Mitigation:

- Renovate batches the consumer updates as auto-mergeable PRs (patch + minor + dev-deps auto-merge per `oriz-org/renovate-config`).
- Stay at `0.x.y` until breaking changes are rare. Most updates should be additive.
- If the tax gets unbearable, the escape hatch is `nx import` to a monorepo (1-2 week migration per research brief §6). Bounded downside.

### 9.5 Risk: Trusted Publishing breaks first-publish

**Mitigation:** documented in §3.10. First publish is local; OIDC takes over from v0.1.1.

### 9.6 Risk: docs aggregator becomes a build-time SPOF

**Mitigation:** Pattern B (per-repo docs + aggregator with mergeIndex) avoids this. Each package's docs deploys independently. The aggregator is a static site with a JS search component; if it goes down, per-package docs are still reachable.

### 9.7 Risk: `@oriz/eslint-config` reinvents `@antfu/eslint-config`

**Mitigation:** don't create `@oriz/eslint-config` until 3+ oriz-specific overrides have accumulated AND are duplicated in 2+ repos. Until then, extend `@antfu/eslint-config` directly in each repo with inline overrides.

### 9.8 Risk: Astro version churn

**Mitigation:** Astro is a peer dep (`^6.0.0`). When Astro 7 lands, each package opens a major-version PR widening the peer range (`^6.0.0 || ^7.0.0`) after smoke testing. The 6 apps upgrade Astro independently per their own readiness.

### 9.9 Risk: PWABuilder needs a wrapper

PWABuilder is hosted, no SDK to wrap. Not a package concern.

### 9.10 Risk: maintainer bus factor

Single-maintainer fleet. Mitigation:

- All publish via OIDC — no personal access tokens.
- All repos under `oriz-org` (per fleet-owner-oriz-org), not `chirag127`.
- Backup keys in `oriz-org/backup` (per backup-keys-repo-oriz-org-backup).
- Each `.env.example` documents obtain-steps so a successor can rebuild credentials.

---

## 10. Decision table — when to extract, when to inline

When a piece of logic appears in 2+ apps, the question is: **inline, copy, or package?**

| Signal | Lean toward |
|---|---|
| Logic is <20 LOC and rarely changes | Copy-paste; revisit in 3 months |
| Logic is <20 LOC and changes monthly | Package (drift cost > publish cost) |
| Logic is >50 LOC and identical in 2+ apps | Package |
| Logic is >50 LOC but differs in each app | Inline (the difference is the point) |
| Logic touches state that crosses apps | Service, not package (e.g., shared API) |
| Logic is a single CSS variable | `@oriz/theme` |
| Logic is a single component used identically | `@oriz/ui` |
| Logic is "we keep typing this `<a>` snippet" | Markdown shortcode / Astro `<slot>` pattern in `@oriz/layouts` |
| Logic is API client for an oriz-owned service | Service exposes a thin TS client at `<api>.oriz.in/client.js`; no npm package |
| Logic is purely browser, no shared state | Package candidate if 2+ consumers |
| Logic is auth-related | Banned from `@oriz/*`. Goes into the auth project. |

---

## 11. Anti-patterns — explicit non-rules

Things this architecture **forbids**:

1. **`@oriz/sdk` / `@oriz/core` umbrella package.** Concern-atomic means no umbrella. We learned this 2026-06-25.
2. **One-function packages.** `@oriz/cn` is not a package. `cn` lives in `@oriz/utils`.
3. **Pre-1.0 promise of API stability.** Until 1.0, breaking changes only need a minor bump and a CHANGELOG line.
4. **Private packages on the public registry.** Everything we publish is intentionally public. If we ever need a private package, the policy is to **rewrite it inline** — not to pay for a private registry.
5. **TypeScript-only packages that ship `.ts` source.** Either ship compiled `.js`+`.d.ts` (tsdown) or ship `.astro`/`.tsx` for Astro/Vite consumption. No raw `.ts` shipping.
6. **Build-tool inflation.** No webpack, no rollup configs by hand, no esbuild scripts. tsdown is the one tool.
7. **`peerDependencies` of `lodash` or `date-fns`.** Internal helpers replace them where possible.
8. **Packages that exist to "consolidate constants."** Constants belong in the app that uses them; if a constant is shared across 2 apps, it's a config concern, not a package concern.
9. **Documentation outside `<pkg>/docs/`.** No Notion, no GitHub Wiki, no separate docs repo. The docs ship with the package.
10. **Deprecating in silence.** Deprecated packages get a `npm deprecate @oriz/foo "use @oriz/bar instead"` AND a README banner AND a CHANGELOG entry.

---

## 12. Appendix — quick start when the first trigger fires

When the first package needs to ship:

1. **Verify the trigger.** Two apps with the same logic, drifting. Document the drift in a `knowledge/decisions/` concept.
2. **Choose the slug.** Concern-atomic name, lowercase, hyphen-separated.
3. **`gh repo create oriz-org/<slug>-npm-pkg --public`** + add as submodule under `repos/own/<slug>-npm-pkg/`.
4. **Copy the scaffolding template** from §3.1.
5. **Fill out `package.json`** with the name, description, and exports.
6. **Write the code** in `src/`. Aim for 100-300 LOC, 3-5 exports.
7. **Write tests** in `src/*.test.ts` and `src/*.test-d.ts`.
8. **Run locally:** `npm run lint && npm run type-check && npm test && npm run build && npm run lint:pkg`.
9. **First publish:** `npm login` (2-hour session) → `npm publish`. Verify on npmjs.com.
10. **Attach Trusted Publisher** on npmjs.com.
11. **Open consumer PRs** in the 2 apps that triggered the extraction. Replace inline copies with `@oriz/<slug>` imports.
12. **Set up docs:** `docs/` directory with Starlight scaffold; add to `docs.oriz.in` aggregator's `mergeIndex` array.
13. **Record the extraction** in `knowledge/decisions/atomic-pkg-<slug>-extracted-YYYY-MM-DD.md`.

That's the loop. Repeat at most once per ~3 weeks across the fleet, per the lean-by-need-not-count posture.

---

## Sources

All technical picks in this brief are sourced from:

- `.staging/research-npm-astro-2026.md` — build tools, package shape, Astro 6 patterns, publishing, testing
- `.staging/research-monorepo-docs-2026.md` — polyrepo topology, tooling consistency, release coordination, Renovate, docs

All fleet rules referenced are from the locked knowledge base:

- `knowledge/decisions/zero-in-house-packages-inline-analytics.md`
- `knowledge/decisions/polyrepo-with-category-consolidation.md`
- `knowledge/decisions/fs-own-frk-split.md`
- `knowledge/decisions/no-auth-in-apps-or-apis.md`
- `knowledge/decisions/donations-only-no-pro-no-ads.md`
- `knowledge/decisions/fleet-owner-oriz-org.md`
- `knowledge/decisions/lean-by-need-not-count.md`
- `knowledge/decisions/build-gate-top3-must-have-defect.md`
- `knowledge/decisions/frontend-design-pass-per-repo.md`
- `knowledge/decisions/repo-slug-suffix-npm-pkg.md`
- `knowledge/decisions/repo-names-drop-oriz-prefix.md`
- `knowledge/decisions/gh-org-secrets-build-time-inject.md`
