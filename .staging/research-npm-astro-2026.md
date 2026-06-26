# Shipping atomic `@oriz/*` npm packages for Astro 6 + React + Tailwind v4 apps

**Research brief, June 2026 — for the oriz polyrepo fleet**

Context fixed by user: polyrepo with git submodules, one repo per concern under `repos/own/<slug>-npm-pkg/`, npm namespace `@oriz/*`, consumers are Astro 6 sites on Cloudflare (Workers, see §8.1), pnpm mandatory, free-tier CI only, MIT, ESM-only, TypeScript strict mode, 100-300 LOC / 3-5 exports per package.

This brief is opinionated. Every recommendation cites primary sources. Direct quotes are blockquoted.

---

## 0. Versions of record (June 2026)

| Tool | Version | Source |
|---|---|---|
| TypeScript stable | **5.9.2** (Aug 2025; tag re-pointed Oct 2025) | [TS 5.9 announce](https://devblogs.microsoft.com/typescript/announcing-typescript-5-9/) |
| Node.js LTS | **24** Active LTS (EOL 2028-04-30); **22** Maintenance LTS (EOL 2027-04-30); **26** Current, going LTS Oct 2026 | [endoflife.date/nodejs](https://endoflife.date/nodejs) |
| Astro | **6.4** (May 28, 2026); requires Node ≥ 22 | [Astro 6 blog](https://astro.build/blog/astro-6/) |
| Vite | **8.1.0** (2026-06-23); rolldown-based, esbuild and Rollup removed from core | [Vite 8 announce](https://vite.dev/blog/announcing-vite8) |
| Rolldown | **1.0.0** GA (2026-05-07) | [VoidZero announce](https://voidzero.dev/posts/announcing-rolldown-1-0) |
| Vitest | **4.1.x** (2026-03-12); requires Vite ≥ 6, Node ≥ 20 | [Vitest 4.1 blog](https://vitest.dev/blog/vitest-4-1) |
| tsdown | **v0.22.3** (2026-06-16) | [GitHub releases](https://github.com/rolldown/tsdown/releases) |
| tsup | v8.5.1 (2025-11-12) — **README marked "not actively maintained"** | [github.com/egoist/tsup](https://github.com/egoist/tsup) |
| pkgroll | v2.27.1 (2026-05-27) | [github.com/privatenumber/pkgroll](https://github.com/privatenumber/pkgroll) |
| Tailwind CSS | **v4.x** (v4.0 shipped 2025-01-22; CSS-first config) | [Tailwind v4 blog](https://tailwindcss.com/blog/tailwindcss-v4) |
| React | **19** stable; supported by `@astrojs/react@4.4+` | [React 19 upgrade](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) |
| pnpm | v10.x; `auto-install-peers=true` since v8.0.0 (2023-03-27) | [pnpm v8 release](https://github.com/pnpm/pnpm/releases/tag/v8.0.0) |
| `@astrojs/cloudflare` | **v13** (Mar 2026); **Workers only — Pages support dropped** | [release notes](https://github.com/withastro/astro/releases/tag/%40astrojs/cloudflare%4013.0.0) |

Major architectural news for this fleet:
- **VoidZero (parent of Vite/Vitest/Rolldown/Oxc) acquired by Cloudflare on 2026-06-04.** Projects remain MIT; $1M Vite ecosystem fund. ([Cloudflare blog](https://blog.cloudflare.com/voidzero-joins-cloudflare/))
- **Cloudflare Pages deployment path for Astro 6 SSR is dead.** New SSR Astro sites must deploy to Workers via `@astrojs/cloudflare@13`. Static Astro builds (`output: 'static'`) can still upload to CF Pages as plain static hosting. This directly impacts `knowledge/hosting-split-cf-and-github-pages.md`.

---

## 1. Build tool — `tsup` vs `unbuild` vs `tsdown` vs `vite-lib` vs `pkgroll`

| Tool | Engine | Latest | Weekly DLs | Maintenance signal |
|---|---|---|---|---|
| **tsdown** | rolldown 1.0 + oxc | v0.22.3 (2026-06-16) | ~2.4-2.7M | Active; same author lineage as tsup |
| tsup | esbuild + rollup-plugin-dts | v8.5.1 (2025-11-12) | ~4.7-6.6M (legacy install base) | README: *"not actively maintained anymore. Please consider using tsdown instead"* |
| unbuild | rollup + mkdist | v3.6.1 (2025-08-15) | ~232K | Active but softer succession to obuild flagged |
| pkgroll | rollup | v2.27.1 (2026-05-27) | ~78K | Most actively shipping of the rollup-based three |
| Vite lib mode | rolldown (Vite 8) | Vite 8.1.0 (2026-06-23) | (Vite total ~31M) | Two active regressions in dts plugin (see below) |

### tsdown is the winner

The maintainer (Anthony Fu / sxzz) wrote the recent tsup releases too — this is a coordinated handoff, not an adversarial fork. From [tsup's own README](https://github.com/egoist/tsup):

> "This project is not actively maintained anymore. Please consider using tsdown instead."

Quote from [tsdown docs](https://tsdown.dev/advanced/benchmark):

> "Approximately 2 times faster than tsup for standard builds, and up to 8 times faster when generating TypeScript declaration files."

Real-world independent benchmark from [Alan Norbauer's migration writeup](https://alan.norbauer.com/articles/tsdown-bundler/) (hyperfine, 26-package monorepo): 49% faster (7.014s → 3.583s). For a 100-300 LOC package the absolute time difference is negligible — but tsdown's *smart defaults* are the actual win:

- Auto-externalizes `dependencies` and `peerDependencies`; bundles `devDependencies`.
- Infers `dts` emit from `package.json#types`/`typings`.
- Infers Node target from `engines.node`.
- ESM-only when `package.json#type === "module"`.
- If `tsconfig.isolatedDeclarations: true` → uses oxc-transform for dts (extremely fast); else falls back to `tsc`.

Adoption signal: VueUse, Vercel Turborepo (7 pkgs, PR #11649), Tiptap (**72 packages**, 2026-02-19), Pinia Colada, TresJS. ([Turborepo migration PR](https://github.com/vercel/turborepo/pull/11649), [Tiptap migration PR](https://github.com/ueberdosis/tiptap/pull/7531))

VoidZero has publicly designated tsdown as the foundation for the future Vite library mode ([rolldown/tsdown discussion #465](https://github.com/rolldown/tsdown/discussions/465)).

### Why not the others

- **tsup**: marked unmaintained; only CI commits in 2026. Existing tsup projects work — don't start new ones here.
- **unbuild**: pick only if you need bundleless `mkdist` output (Nuxt-style file-to-file) or `--stub` for `pnpm link` workflows. Niche.
- **pkgroll**: genuinely good zero-config rollup option, but slower (rollup vs rolldown) and smaller install base. Pick if you want rollup correctness as a contract.
- **Vite library mode**: skip. Vite 8 (2026-03-12) dropped esbuild + Rollup in favor of rolldown. Two active regressions as of mid-June 2026:
  - `vite-plugin-dts@5.0.0` (now a shim over `unplugin-dts`) leaks optional peer deps into emitted `.d.ts` files. [Issue qmhc/unplugin-dts#476](https://github.com/qmhc/unplugin-dts/issues/476). Workaround: pin `vite-plugin-dts@^4.5.4`.
  - `unplugin-dts@1.0.2` doesn't emit `.d.ts` at all. [Issue #482](https://github.com/qmhc/unplugin-dts/issues/482) (2026-06-15). Workaround: pin `unplugin-dts@1.0.1`.
  - Pick Vite library mode only if you *also* need a Vite dev server (component library with stories).

### Recommendation

> **`tsdown` for every `@oriz/*` package.** Pin to `^0.22`. Re-evaluate at tsdown 1.0.

```ts
// tsdown.config.ts (most packages won't need a config file at all)
import { defineConfig } from "tsdown";
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
});
```

---

## 2. Test runner — Vitest config for a tiny TS lib

### Version: Vitest 4.1.x

- Vitest 4.0 (2025-10-22) — browser mode promoted from experimental to stable; `workspace` removed.
- Vitest 4.1 (2026-03-12) — Vite 8 support, new `agent` reporter for LLM-driven CI.
- Requires Vite ≥ 6 and Node ≥ 20.

### Workspace → projects rename

Lifecycle from [Vitest migration guide](https://vitest.dev/guide/migration.html):

1. **Vitest 3.2 (2025-06-02)** — `workspace` deprecated; `projects` introduced inside `test:`.
2. **Vitest 4.0 (2025-10-22)** — `workspace` removed entirely. `defineWorkspace` export gone, `vitest --workspace` CLI flag gone, `vitest.workspace.ts` file pathway gone.

Direct quote from [Vitest 3.2 blog](https://vitest.dev/blog/vitest-3-2):

> "We also decided to deprecate the `workspace` name because it clashes with other tools like PNPM that provide monorepo support via this option."

**For tiny single-package libraries, don't use `projects` at all.** It's a monorepo feature.

### Browser mode — stable as of Vitest 4.0

From [Vitest 4.0 blog](https://vitest.dev/blog/vitest-4):

> "With this release we are removing the `experimental` tag from Browser Mode."

Three official provider packages:

- **`@vitest/browser-playwright`** — recommended default; *"supports parallel execution, which makes your tests run faster"* per docs.
- `@vitest/browser-webdriverio` — only for WebDriver/Selenium grid environments.
- `@vitest/browser-preview` — *"useful to quickly run your tests in the browser, but not suitable for CI"* per docs.

API change: provider is now a factory function — `import { playwright } from '@vitest/browser-playwright'; provider: playwright()`. No string identifier anymore.

**For pure-TS-no-DOM `@oriz/*` packages, skip browser mode. Use the Node runner.**

### Coverage — v8 by default

The historical "istanbul is more accurate for branch coverage" criticism stopped being true in Vitest 3.2 (June 2025), when v8 switched to AST-based remapping (`ast-v8-to-istanbul`). Vitest 4 made that the only mode. Real-codebase parity from [PR #7736](https://github.com/vitest-dev/vitest/pull/7736):

- `vuejs/core` branch coverage: v8 = 87.69% vs istanbul = 87.46% — essentially identical.
- `vitejs/vite`: *"Close to 100% match with @vitest/coverage-istanbul."*

Pick istanbul only for Firefox via WebdriverIO, Bun, Cloudflare Workers, or React JSX branch-coverage precision.

### Vitest 4 footguns

- `coverage.all` removed. **Set `coverage.include: ['src/**/*.ts']` explicitly** or coverage percentages artificially inflate.
- Ignore-hint comments: `/* v8 ignore next 3 */` (count form) is gone. Use `/* v8 ignore next -- @preserve */` or `start/stop` form. The `-- @preserve` suffix is required when source is TS.
- `basic` reporter removed (use `default` with `summary: false`).

### Recommendation

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts"],
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
      reporter: ["text", "html", "json-summary"],
    },
  },
});
```

Cited sources for §2:
- [vitest.dev/blog/vitest-4](https://vitest.dev/blog/vitest-4)
- [vitest.dev/blog/vitest-4-1](https://vitest.dev/blog/vitest-4-1)
- [vitest.dev/guide/migration](https://vitest.dev/guide/migration.html)
- [vitest.dev/guide/coverage](https://vitest.dev/guide/coverage)
- [github.com/vitest-dev/vitest/pull/7736](https://github.com/vitest-dev/vitest/pull/7736)

---

## 3. `package.json` — exports map, files, sideEffects, engines

### The canonical rules

1. **`"type": "module"`** is mandatory for ESM-only. ([Node packages docs](https://nodejs.org/api/packages.html))
2. **`"exports"` map replaces `main`/`module`/`types`/`typesVersions`.** Keep a top-level `"types"` as fallback for legacy `moduleResolution: "node"` consumers.
3. **Condition ordering is hard-ruled.** From [publint rules](https://publint.dev/rules):
   > `EXPORTS_TYPES_SHOULD_BE_FIRST` — *"Ensure `\"types\"` condition to be the first… `\"exports\"` conditions are order-sensitive."*
   > `EXPORTS_DEFAULT_SHOULD_BE_LAST` — *"the `\"default\"` condition should come last as the fallback."*
4. **ESM-only with no dual-publish collapses to two conditions.** With `"type": "module"`, `.js` is unambiguously ESM, `.d.ts` is unambiguously ESM types. No need for `.mjs`/`.d.mts`. No `"import"`/`"require"` split.
5. **`files` whitelist > `.npmignore`.** From [Dr. Axel's 2025 ESM tutorial](https://2ality.com/2025/02/typescript-esm-packages.html):
   > "While there is also the `.npmignore` file, explicitly listing what's included is safer."
6. **`sideEffects: false`** if the package is pure (no CSS, no polyfills, no module-level registration). Array form for libraries that ship CSS: `["./dist/*.css"]`.
7. **`engines.node: ">=22.0.0"`** is the 2026 floor for new packages. Node 22 LTS lands native `require(esm)`, killing the last reason ESM-only broke CJS consumers.
8. **`publishConfig.provenance: true`** — set it once, every publish gets the Sigstore badge automatically. ([npm provenance docs](https://docs.npmjs.com/generating-provenance-statements))
9. **`moduleResolution: "nodenext"`** for libraries — NOT `"bundler"`. From [TS handbook "Choosing Compiler Options"](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html):
   > *"`\"moduleResolution\": \"bundler\"` is infectious, allowing code that only works in bundlers to be produced."*
10. **`exports["./package.json"]`** — always expose. arethetypeswrong recommends it.

### Copy-paste-ready `package.json`

```jsonc
{
  "name": "@oriz/some-thing",
  "version": "0.1.0",
  "description": "One concern, 100-300 LOC.",
  "license": "MIT",
  "type": "module",
  "engines": { "node": ">=22.0.0" },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
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
    "url": "git+https://github.com/oriz-org/some-thing-npm-pkg.git"
  },
  "homepage": "https://github.com/oriz-org/some-thing-npm-pkg#readme",
  "bugs": "https://github.com/oriz-org/some-thing-npm-pkg/issues",
  "funding": "https://github.com/sponsors/chirag127",
  "keywords": ["oriz"],
  "scripts": {
    "build": "tsdown",
    "check:types": "tsc --noEmit",
    "check:exports": "attw --pack . && publint",
    "test": "vitest run",
    "test:watch": "vitest",
    "coverage": "vitest run --coverage",
    "prepublishOnly": "pnpm build && pnpm check:exports && pnpm test"
  },
  "devDependencies": {
    "@arethetypeswrong/cli": "^0.18.0",
    "@vitest/coverage-v8": "^4.1.0",
    "publint": "^0.3.0",
    "tsdown": "^0.22.0",
    "typescript": "^5.9.0",
    "vitest": "^4.1.0"
  }
}
```

Cited sources for §3:
- [2ality.com/2025/02/typescript-esm-packages.html](https://2ality.com/2025/02/typescript-esm-packages.html)
- [publint.dev/rules](https://publint.dev/rules)
- [arethetypeswrong.github.io](https://arethetypeswrong.github.io/)
- [docs.npmjs.com/generating-provenance-statements](https://docs.npmjs.com/generating-provenance-statements)
- [TypeScript handbook — Choosing Compiler Options](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html)
- [Node packages docs](https://nodejs.org/api/packages.html)

---

## 4. `tsconfig` — should we ship `@oriz/tsconfig-base`?

**Yes, at this fleet size.** With ≥3 TS packages, a shared base pays for itself within one quarter. The break-even point is "I want to roll `noUncheckedIndexedAccess` across the fleet without 22 separate PRs."

TypeScript 5.0 added **`extends` as an array** — multi-extends — so `@oriz/tsconfig-base` just composes the published bases:

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
    "lib": ["es2022"]
  }
}
```

### What goes in (and why)

| Field | Value | Source |
|---|---|---|
| `module` | `"nodenext"` (or `"node20"` for frozen behavior) | [TS handbook library guide](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html) |
| `moduleResolution` | `"nodenext"` | Implied by module; listed for clarity |
| `target` | `"es2022"` | Matches Node 22 native support |
| `lib` | `["es2022"]` | Same |
| `strict` | `true` | `@tsconfig/strictest` |
| `verbatimModuleSyntax` | `true` | TS handbook: *"This setting protects against a few module-related pitfalls that can cause problems for library consumers."* |
| `erasableSyntaxOnly` | `true` | TS 5.8+. Forbids `enum`, `namespace`, parameter properties, JSX. Makes output tool-portable across `tsc`/`swc`/`esbuild`/Node-strip-types. |
| `declaration`, `declarationMap`, `sourceMap` | `true` | Handbook: *"By shipping declaration maps and source files, consumers will be able to see the original TypeScript sources when they run Go To Definition."* |
| `skipLibCheck` | `true` | In every shared base for a reason |
| `noUncheckedIndexedAccess` | `true` | `@tsconfig/strictest` |

### Per-package `tsconfig.json`

Each `@oriz/*` package's tsconfig is then 4 lines:

```jsonc
{
  "extends": "@oriz/tsconfig-base/tsconfig.json",
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "**/*.test.ts", "**/*.spec.ts"]
}
```

### Pros / cons of shared base

Pros:
- One bump rolls strictness across fleet.
- Each package's tsconfig is trivial.
- The base itself is published as a versioned npm package; consumers pin (`^1`).

Cons:
- Adds an internal versioned dep. Acceptable here — your fleet already has shared infrastructure conventions (renovate config, ci-workflows, etc.).

**Don't pick `moduleResolution: "bundler"`** for libraries even though Astro 6 uses Vite. The handbook is explicit that bundler-mode produces output Node will reject.

Cited sources for §4:
- [TS 5.0 release — multi-extends](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/)
- [TS 5.8 release — `erasableSyntaxOnly`](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/)
- [TS 5.9 release — `node20` stable](https://devblogs.microsoft.com/typescript/announcing-typescript-5-9/)
- [`@tsconfig/bases` repo](https://github.com/tsconfig/bases)
- [TS handbook library guide](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html)

---

## 5. Release automation — per-repo, conventional-commits

| Tool | License | Per-repo fit | CC-driven | Verdict |
|---|---|---|---|---|
| **release-please-action v5** | Apache-2.0 | Excellent (`release-type: node`) | Yes | **Recommended** |
| semantic-release v25 | MIT | Excellent | Yes | Runner-up (no human gate) |
| Changesets v2.31 | MIT | Works but redundant | **No (intentional)** | Skip |
| np v11.2.1 | MIT | Interactive only | No | Skip for CI |
| git-cliff + manual | MIT/Apache | Component only | Yes | Skip |

### release-please wins

The canonical action is now at [`googleapis/release-please-action`](https://github.com/googleapis/release-please-action) — the `google-github-actions/release-please-action` path was deprecated. The hosted GitHub App shut down on 2025-08-14 ([issue #2569](https://github.com/googleapis/release-please/issues/2569)), but the CLI and action are actively maintained: action v5.0.0 (2026-04-22), core v17.10.0 (2026-06-22).

Critical detail: **release-please does NOT publish to npm by itself.** Quote from the repo:

> "It does not handle publication to package managers or handle complex branch management."

You wire a follow-up CI job listening on `release: { types: [published] }`.

### Why this beats semantic-release for our fleet

- **Human gate.** release-please opens a PR with the version bump + CHANGELOG. You merge when ready. semantic-release pushes on every merge to main — no gate.
- Apache-2.0; Google-maintained; frequent 2026 releases.
- Trivially reusable across 20+ repos.

### Why Changesets is wrong here

From maintainer Andarist on [discussion #892](https://github.com/changesets/changesets/discussions/892): single-package repos work fine, but Changesets is **intentionally not Conventional-Commits-driven** — it requires `.changeset/*.md` intent files per PR. That's authoring overhead this fleet shouldn't pay given the existing CC discipline (your commit log already runs `feat:`/`refactor!:`/`chore(submodules):`).

Cited sources for §5:
- [github.com/googleapis/release-please-action](https://github.com/googleapis/release-please-action)
- [googleapis/release-please issue #2569](https://github.com/googleapis/release-please/issues/2569)
- [github.com/semantic-release/semantic-release](https://github.com/semantic-release/semantic-release)
- [changesets/changesets discussion #892](https://github.com/changesets/changesets/discussions/892)
- [oleksiipopov.com/blog/npm-release-automation](https://oleksiipopov.com/blog/npm-release-automation/)

---

## 6. CI on the free tier — typecheck + test + build + publish

### Key facts

- **Public-repo Actions minutes are unlimited** on standard GitHub-hosted runners. ([billing docs](https://github.com/github/docs/blob/main/content/billing/concepts/product-billing/github-actions.md))
- **npm Trusted Publishing GA'd 2025-07-31.** ([GH Blog changelog](https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/))
  > "As of today, npm trusted publishing with OpenID Connect (OIDC) is now generally available."
- **npm CLI ≥ 11.5.1 required** for OIDC. Node 22 LTS ships npm 10.x and fails with a misleading 404. Use Node 24 in setup-node + run `npm install -g npm@latest` as belt-and-braces.
- **Required permissions:** `id-token: write` + `contents: read`. From [npm Trusted Publishers docs](https://docs.npmjs.com/trusted-publishers/):
  > "The critical requirement is the `id-token: write` permission."
- **Pass `--provenance` explicitly** even though docs claim it's automatic. From Phil Nash ([2026-01 writeup](https://philna.sh/blog/2026/01/28/trusted-publishing-npm/)):
  > "I did not find this to be the case. I needed to add the `--provenance` flag so that my package would publish successfully."
- **First publish must use a token** to create the package on the registry; configure trusted publishing for v0.0.2 onward.
- **2026-05-20 behavior change:** new trusted-publisher configs require you to explicitly select at least one allowed action (`npm publish`). Older configs grandfather.
- **`setup-node v6` pnpm caching is NOT auto-enabled** even with `packageManager: "pnpm@..."`. Pass `cache: 'pnpm'`. ([actions/setup-node docs](https://github.com/actions/setup-node))
- **Reusable workflows:** both caller and callee need `id-token: write`. Pin by tag (`@v1`), never by branch.

### Target run time: under 60s per typical package

For a 100-300 LOC TS-only package: install ≈ 8-12s (cached), typecheck ≈ 4s, test ≈ 5s, build (tsdown) ≈ 1-3s, publish ≈ 15s. Total: well under a minute.

### Copy-paste-ready `.github/workflows/release.yml`

```yaml
# .github/workflows/release.yml
#
# Per-repo release pipeline for the oriz-org TypeScript npm fleet.
# Push to main runs CI; release-please-action opens/maintains a
# release PR; merging it triggers a GitHub Release; the publish job
# (on: release) publishes to npm via Trusted Publishing (no NPM_TOKEN).

name: Release

on:
  push:
    branches: [main]
  release:
    types: [published]

permissions:
  contents: write       # release-please needs to push branches + tags
  pull-requests: write  # release-please needs to open the release PR
  id-token: write       # npm OIDC — https://docs.npmjs.com/trusted-publishers/

jobs:
  ci:
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v6     # before setup-node — pnpm must be on PATH for cache resolver
      - uses: actions/setup-node@v6
        with:
          node-version: '24'
          cache: 'pnpm'                # must be explicit; not auto-enabled
          registry-url: 'https://registry.npmjs.org'
      - run: pnpm install --frozen-lockfile
      - run: pnpm check:types
      - run: pnpm check:exports        # attw + publint
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
      - run: npm install -g npm@latest  # guarantee npm >= 11.5.1 for OIDC handshake
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: npm publish --provenance --access public
```

For 20+ repos, hoist the publish job into `oriz-org/ci-workflows/.github/workflows/npm-publish.yml@v1` and call via `uses:` with `secrets: inherit` + `permissions: { contents: read, id-token: write }`.

Cited sources for §6:
- [github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available](https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/)
- [docs.npmjs.com/trusted-publishers](https://docs.npmjs.com/trusted-publishers/)
- [philna.sh/blog/2026/01/28/trusted-publishing-npm](https://philna.sh/blog/2026/01/28/trusted-publishing-npm/)
- [datafrog.io/en/blog/npm-trusted-publishing-github-actions-without-npm-token](https://datafrog.io/en/blog/npm-trusted-publishing-github-actions-without-npm-token)
- [github.com/actions/setup-node](https://github.com/actions/setup-node)
- [github.com/pnpm/action-setup](https://github.com/pnpm/action-setup)

---

## 7. Dependency updates — Renovate vs Dependabot vs depfu

| Tool | OSS price | Config inheritance | Polyrepo verdict |
|---|---|---|---|
| **Mend Renovate Cloud** | Free, unlimited public+private | **Yes — `extends: ["github>org/preset"]`** | **Recommended** |
| Dependabot | Free (GitHub-native) | **No inheritance** (2026) | Use only for security alerts alongside Renovate |
| depfu | Free 1 OSS, $29+ paid | No | Skip — narrower ecosystem, paid past 1 repo |

### Renovate wins on config-DRY

From [Renovate config-presets docs](https://docs.renovatebot.com/config-presets/):

> "You do not need to add it as a devDependency or add any other files to the preset repo."

You publish one preset repo (`oriz-org/renovate-config`) with a `default.json`; every consumer repo has a one-line `renovate.json` that extends it. Edit the preset once → all 20+ consumers re-resolve on the next 4-hour run.

Mend Renovate Cloud free tier: *"A generous free tier, available for all across an unlimited number of public and private repositories"* ([Mend resource tiers](https://docs.mend.io/renovate/latest/mend-renovate-cloud-resource-tiers)). 1 concurrent job per org, every 4 h schedule. OSS-licensed orgs can request a bump.

### Why not Dependabot

Dependabot has shipped real improvements in 2024-2026 (grouped updates GA Aug 2023, security-update grouping Mar 2024, cross-ecosystem grouping Jul 2025, multi-directory grouping Feb 2026). But it still has **no config inheritance** — you'd be duplicating `dependabot.yml` across 20+ repos and resyncing on every config change.

**Combined strategy:** Renovate for routine updates + Dependabot security alerts (turn off Dependabot version-updates, keep the security alerts on).

### Copy-paste-ready preset

`oriz-org/renovate-config/default.json`:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "config:recommended",
    ":dependencyDashboard",
    ":semanticCommits",
    "group:monorepos",
    "group:recommended",
    "helpers:pinGitHubActionDigests"
  ],
  "timezone": "Asia/Kolkata",
  "schedule": ["* 0-6 * * 6,0"],
  "prConcurrentLimit": 5,
  "prHourlyLimit": 2,
  "rangeStrategy": "bump",
  "minimumReleaseAge": "3 days",
  "packageRules": [
    {
      "description": "Auto-merge patches for low-risk deps",
      "matchPackagePatterns": ["^@types/", "^eslint", "^prettier", "^@typescript-eslint/", "^vitest", "^@vitest/"],
      "matchUpdateTypes": ["patch", "pin", "digest"],
      "automerge": true,
      "platformAutomerge": true
    },
    {
      "description": "Auto-merge GitHub Actions digest pins",
      "matchManagers": ["github-actions"],
      "matchUpdateTypes": ["digest", "patch"],
      "automerge": true,
      "platformAutomerge": true
    },
    {
      "description": "Hold major bumps for manual review via Dashboard",
      "matchUpdateTypes": ["major"],
      "dependencyDashboardApproval": true
    }
  ],
  "lockFileMaintenance": { "enabled": true, "schedule": ["* 0-6 * * 0"] },
  "vulnerabilityAlerts": { "labels": ["security"], "minimumReleaseAge": null, "schedule": [] }
}
```

Each consumer repo's `renovate.json`:

```json
{ "$schema": "https://docs.renovatebot.com/renovate-schema.json", "extends": ["oriz-org/renovate-config"] }
```

Cited sources for §7:
- [docs.renovatebot.com/bot-comparison](https://docs.renovatebot.com/bot-comparison/)
- [docs.renovatebot.com/config-presets](https://docs.renovatebot.com/config-presets/)
- [docs.mend.io/renovate/latest/mend-renovate-cloud-resource-tiers](https://docs.mend.io/renovate/latest/mend-renovate-cloud-resource-tiers)
- [github.blog/changelog/2023-08-24-grouped-version-updates-for-dependabot-are-generally-available](https://github.blog/changelog/2023-08-24-grouped-version-updates-for-dependabot-are-generally-available/)
- [safeguard.sh/resources/blog/dependabot-vs-renovate-operational-experience](https://safeguard.sh/resources/blog/dependabot-vs-renovate-operational-experience)

---

## 8. Astro 6 consumer patterns

### 8.1 Hosting break — Cloudflare Pages is dead for Astro 6 SSR

From [`@astrojs/cloudflare` v13 release notes](https://github.com/withastro/astro/releases/tag/%40astrojs/cloudflare%4013.0.0) (Mar 10, 2026):

> "Drops official support for Cloudflare Pages in favor of Cloudflare Workers. The Astro Cloudflare adapter now only supports deployment to Cloudflare Workers by default in order to comply with Cloudflare's recommendations for new projects."

From the [Astro 6 upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v6/):

> "Astro 6 brings significant improvements to the Cloudflare development experience and requires `@astrojs/cloudflare` v13 or later. Now, `astro dev` uses Cloudflare's Vite plugin and `workerd` runtime to closely mirror production behavior."

> "Removed: Cloudflare Pages support — The Astro Cloudflare adapter no longer supports deployment on Cloudflare Pages."

Note: Cloudflare acquired The Astro Technology Company in January 2026. Worker integration is now first-class.

**Action item:** the existing `knowledge/hosting-split-cf-and-github-pages.md` rule needs revision. Static Astro builds (`output: 'static'`) can still upload to CF Pages as plain static hosting (no adapter needed). SSR Astro sites must move to Workers.

### 8.2 Consumer patterns — `.astro` frontmatter vs React island

**.astro frontmatter is TypeScript with top-level await.** From the [Astro compiler syntax spec](https://github.com/withastro/compiler/blob/main/SYNTAX_SPEC.md):

> "The component script is TypeScript. All standard TypeScript syntax is valid… `return` may be used at the top level."

And from the [data-fetching guide](https://docs.astro.build/en/guides/data-fetching/):

> "Take advantage of top-level await inside of your Astro component script."

So tiny TS-only `@oriz/*` packages drop straight into frontmatter:

```astro
---
// src/pages/finance/emi.astro
import { calcEmi, formatINR } from '@oriz/finance-core';
const { principal, rate, months } = Astro.props;
const schedule = await calcEmi({ principal, rate, months });
---
<h1>EMI: {formatINR(schedule.monthly)}</h1>
```

Zero hydration cost. Zero JS shipped from `@oriz/finance-core`. Type-checked end to end.

### 8.3 Framework-agnostic > framework-locked

Strong preference: **pure-TS, no JSX, framework-agnostic.** Reasons:

1. Works in `.astro` frontmatter (SSG/SSR) with zero hydration.
2. Works inside any React island as imported logic.
3. Reusable from Next, Remix, Bun, Workers, Node CLIs.
4. Tree-shakes cleanly with `sideEffects: false`.

When you genuinely need React components, isolate them in a subpath export:

```jsonc
{
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./react": { "types": "./dist/react/index.d.ts", "import": "./dist/react/index.js" }
  }
}
```

Non-React consumers won't pull React.

### 8.4 Hydration directives (current set)

| Directive | When JS loads | Best for |
|---|---|---|
| `client:load` | Immediately | Above-the-fold interactive |
| `client:idle` | After `requestIdleCallback` | Important but not critical |
| `client:visible` | When entering viewport | **Default for most islands** |
| `client:media={QUERY}` | When media query matches | Mobile/desktop-only UI |
| `client:only={framework}` | Client-only, no SSR | Browser-API-dependent |
| `server:defer` | Server-renders deferred, fetched on load | Personalized content |

`server:defer` stable since Astro 5.0. Quote from [server-islands docs](https://docs.astro.build/en/guides/server-islands/):

> "A server island is a normal server-rendered Astro component that is instructed to delay rendering until its contents are available."

**Gotcha:** props are encrypted into URL query — functions/circular refs can't be passed. Keep server-island props tiny.

### 8.5 React 19 status

`@astrojs/react@4.4+` for Astro 6 has stable React 19 support. The Actions APIs went from `experimental_withState()` → `withState()` in Sep 2025 (commit `f75f446`). Pin `react@^19` in your library `peerDependencies` if you ship React components.

### 8.6 ESM-only on Astro 6 — no issues

Astro is ESM-only end-to-end. Pure-ESM packages just work. The two known friction points:

1. **CJS deps slip in.** Add to `vite.ssr.noExternal` in `astro.config.mjs`.
2. **CSS without extension.** Always export CSS with `.css` in `exports`. Don't rely on extensionless imports.

### 8.7 `import.meta.env` inside library code — DON'T

From [withastro/roadmap discussion #854](https://github.com/withastro/roadmap/discussions/854):

> "The blessed way Astro supports env vars is through `import.meta.env.*`. Even so, libraries shouldn't rely on this because it's a Vite/Astro specific feature. Libraries should use an agnostic way for env vars, e.g. `process.env.*` or via parameters."

**For `@oriz/*`:** read from `process.env` with a fallback, always accept explicit overrides:

```ts
export function createClient({ apiKey = process.env?.ORIZ_API_KEY } = {}) {
  if (!apiKey) throw new Error('apiKey required');
}
```

Cited sources for §8:
- [astro.build/blog/astro-6](https://astro.build/blog/astro-6/)
- [docs.astro.build/en/guides/upgrade-to/v6](https://docs.astro.build/en/guides/upgrade-to/v6/)
- [docs.astro.build/en/reference/directives-reference](https://docs.astro.build/en/reference/directives-reference/)
- [docs.astro.build/en/guides/framework-components](https://docs.astro.build/en/guides/framework-components/)
- [docs.astro.build/en/guides/server-islands](https://docs.astro.build/en/guides/server-islands/)
- [github.com/withastro/compiler/SYNTAX_SPEC.md](https://github.com/withastro/compiler/blob/main/SYNTAX_SPEC.md)
- [github.com/withastro/roadmap/discussions/854](https://github.com/withastro/roadmap/discussions/854)
- [docs.astro.build/en/guides/styling](https://docs.astro.build/en/guides/styling/)

---

## 9. Peer dependencies — what goes where

### Verified pattern across major React libraries in 2026

Live npm registry samples:

- `@tanstack/react-query@5.101.1` → `"peerDependencies": { "react": "^18 || ^19" }`
- `react-redux@9.3.0` → `"peerDependencies": { "react": "^18.0 || ^19" }`
- `@headlessui/react@2.2.10` → `"peerDependencies": { "react": "^18 || ^19 || ^19.0.0-rc", "react-dom": "^18 || ^19 || ^19.0.0-rc" }`
- `react-hook-form@7.80.0` → `"peerDependencies": { "react": "^16.8.0 || ^17 || ^18 || ^19" }`

### The rules

1. **`react` → peer always.** Range `"^18 || ^19"` matches the ecosystem floor.
   > "the `react` import from your application code needs to resolve to the same module as the `react` import from inside the `react-dom` package." — [React docs: Invalid Hook Call](https://legacy.reactjs.org/warnings/invalid-hook-call-warning.html)
   > "maybe a library you're using incorrectly specifies react as a dependency (rather than a peer dependency)." — same source
2. **`react-dom` → peer only if you render to the DOM.** Hook-only/headless/state libs omit it.
3. **`react/jsx-runtime` → never a peer.** It ships inside `react`. The JSX transform is tsconfig-driven (`"jsx": "react-jsx"`).
4. **`@types/react` (+ `@types/react-dom`) → optional peer via `peerDependenciesMeta`** so non-TS consumers don't get spurious peer warnings.
5. **Tailwind → NEVER a peer.** It's a build-time tool, not a runtime API. Only Tailwind *plugins* peer-depend on Tailwind. Tailwind v4 itself declares no peers.
6. **Radix primitives → regular `dependencies`** at caret ranges. This is what cmdk, vaul, sonner all do.
7. **Astro → NEVER a peer.** Same logic as Tailwind — your library doesn't depend on Astro's runtime; the consumer's Astro app consumes your library's output.

### pnpm peer auto-install behavior

`auto-install-peers` flipped to **true** by default in pnpm 8.0.0 (2023-03-27) and remains default through v10. From [pnpm v8 release](https://github.com/pnpm/pnpm/releases/tag/v8.0.0). Conflicting peer ranges → warning, no install.

npm 7+ (incl. npm 10/11) also auto-installs peers. Yarn (Classic + Berry) has **never** auto-installed peers — relevant only if a Yarn-using consumer hits your package.

### Copy-paste-ready peer block (React+Tailwind component package)

```jsonc
{
  "peerDependencies": {
    "react": "^18 || ^19",
    "react-dom": "^18 || ^19"
  },
  "peerDependenciesMeta": {
    "@types/react": { "optional": true },
    "@types/react-dom": { "optional": true }
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-slot": "^1.1.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "tsdown": "^0.22.0",
    "typescript": "^5.9.0"
  }
}
```

Cited sources for §9:
- [docs.npmjs.com/cli/v10/configuring-npm/package-json](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
- [react.dev/warnings/invalid-hook-call-warning](https://react.dev/warnings/invalid-hook-call-warning)
- [react.dev/blog/2024/04/25/react-19-upgrade-guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [pnpm.io/settings](https://pnpm.io/settings)
- [github.com/pnpm/pnpm/releases/tag/v8.0.0](https://github.com/pnpm/pnpm/releases/tag/v8.0.0)
- [github.blog/news-insights/product-news/npm-7-is-now-generally-available](https://github.blog/news-insights/product-news/npm-7-is-now-generally-available/)
- [github.com/yarnpkg/berry/discussions/6666](https://github.com/yarnpkg/berry/discussions/6666)

---

## 10. Tailwind v4 style delivery

### The three (real) options

1. **Ship raw `.tsx` only; consumer adds `@source`** — best tree-shake; no CSS bundle.
2. **Ship pre-built `./styles.css` via exports** — bigger bundle, no consumer-driven tree-shake, but zero-config.
3. **Hybrid: ship JS + `./theme.css` containing only `@theme` tokens** — best of both for design-system packages.

### Rule: NEVER `@import "tailwindcss"` inside library CSS

From [Tailwind discussion #18758](https://github.com/tailwindlabs/tailwindcss/discussions/18758):

> "Consumer apps should contain this `@import` statement, not the library, otherwise you may get a double-up of Tailwind CSS rules."

### Rule: Library CSS is NOT consumer-tree-shaken

From [Tailwind discussion #19684](https://github.com/tailwindlabs/tailwindcss/discussions/19684):

Tree-shaking happens at the consumer's build, not at library publish. If you ship pre-built CSS, it includes every utility your library uses — no consumer-driven elimination.

**Implication:** for size-sensitive packages, ship JS only and document the `@source` line.

### Rule: node_modules is unconditionally excluded from auto-scan

As of Tailwind v4.0.18 (2025-03-28), node_modules is excluded regardless of `.gitignore`. From [detecting-classes docs](https://tailwindcss.com/docs/detecting-classes-in-source-files):

The consumer must opt in explicitly:

```css
@source "../node_modules/@oriz/ui";
```

### Rule: `@plugin` is a v3 compatibility shim

From [functions-and-directives](https://tailwindcss.com/docs/functions-and-directives):

> "Use the `@plugin` directive to load a legacy JavaScript-based plugin."

v4-native plugin authoring uses `@utility`, `@variant`, `@theme` directly in CSS — not a JS function.

### shadcn distribution model unchanged

As of June 2026, [shadcn/ui](https://ui.shadcn.com/docs/tailwind-v4) is still **source-distributed**, not an npm package of components. The June 2026 update made any GitHub repo with a `registry.json` installable as a registry (`npx shadcn@latest add user/repo/item`). For `@oriz/*`, if your "package" is a set of shadcn-style primitives users will edit, **consider the shadcn-registry path instead of npm**.

### Recommendation: hybrid

For a `@oriz/*` component package:

1. Ship raw `.tsx` with classNames in source. Ship a thin precompiled `./theme.css` (only `@theme` tokens, no utilities). Optionally ship `./styles.css` as a precompiled fallback for the lazy.
2. README must include the exact `@source` line. This is the #1 footgun.
3. Set `"sideEffects": ["**/*.css"]` to keep bundlers from dropping CSS.

### Worked example — consumer Astro app global CSS

```css
/* src/styles/global.css */
@import "tailwindcss";

/* Scan @oriz/ui's compiled JS so its className strings are detected. */
@source "../../node_modules/@oriz/ui/dist";

/* Optional: pull in library theme tokens (just @theme declarations, no utilities). */
@import "@oriz/ui/theme.css";

@theme {
  --color-brand-500: oklch(0.7 0.18 250);
}
```

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
```

### Don't use runtime CSS-in-JS in 2026

From [Next.js CSS-in-JS docs](https://nextjs.org/docs/app/building-your-application/styling/css-in-js):

> "Many CSS-in-JS libraries that rely on runtime JavaScript are not compatible with React Server Components."

Build-time extractors (Panda, vanilla-extract, Linaria) are RSC-safe alternatives. But for `@oriz/*` on Tailwind v4, you don't need any of this — classnames in source + `@source` is the right answer.

Cited sources for §10:
- [tailwindcss.com/blog/tailwindcss-v4](https://tailwindcss.com/blog/tailwindcss-v4)
- [tailwindcss.com/docs/detecting-classes-in-source-files](https://tailwindcss.com/docs/detecting-classes-in-source-files)
- [tailwindcss.com/docs/functions-and-directives](https://tailwindcss.com/docs/functions-and-directives)
- [github.com/tailwindlabs/tailwindcss/discussions/18758](https://github.com/tailwindlabs/tailwindcss/discussions/18758)
- [github.com/tailwindlabs/tailwindcss/discussions/18545](https://github.com/tailwindlabs/tailwindcss/discussions/18545)
- [github.com/tailwindlabs/tailwindcss/discussions/19684](https://github.com/tailwindlabs/tailwindcss/discussions/19684)
- [ui.shadcn.com/docs/tailwind-v4](https://ui.shadcn.com/docs/tailwind-v4)
- [ui.shadcn.com/docs/changelog/2026-06-github-registries](https://ui.shadcn.com/docs/changelog/2026-06-github-registries)
- [nextjs.org/docs/app/building-your-application/styling/css-in-js](https://nextjs.org/docs/app/building-your-application/styling/css-in-js)

---

## TL;DR winners table

| Concern | Winner | Why |
|---|---|---|
| Build tool | **tsdown ^0.22** | tsup itself recommends it; smart defaults; 2x perf; massive adoption (Tiptap 72 pkgs, Turborepo, VueUse) |
| Test runner | **Vitest 4.1 + @vitest/coverage-v8** | v8 reached parity with istanbul in Vitest 3.2; browser mode GA in 4.0 |
| Package shape | **ESM-only, exports map types-first/default-last, files whitelist, `engines.node >=22`** | Node 22 native `require(esm)` killed the dual-publish tax; publint/attw gate |
| Module resolution | **`nodenext`** for libraries | TS handbook: bundler-mode is "infectious" |
| Strictness | **`@oriz/tsconfig-base` extending `@tsconfig/strictest` + `@tsconfig/node-lts`** with `verbatimModuleSyntax` + `erasableSyntaxOnly` | Multi-extends (TS 5.0+) lets one base compose three concerns |
| Release automation | **release-please-action v5** | CC-driven, human-gated release PR, Apache-2.0, active |
| CI on free tier | **GitHub Actions + npm Trusted Publishing (OIDC, no NPM_TOKEN)** | Public repos = unlimited minutes; Node 24 + `id-token: write` + `--provenance` |
| Dep updates | **Mend Renovate Cloud (free) + preset repo + keep Dependabot security alerts** | Renovate has shareable presets; Dependabot still doesn't in 2026 |
| Astro consumption | **Pure-TS framework-agnostic in `.astro` frontmatter; React via `./react` subpath + `client:visible`** | Zero hydration cost when possible; isolate React |
| Peer deps | **`react ^18 \|\| ^19` peer; `react-dom` peer only if needed; Radix as `dependencies`; Tailwind in `devDependencies` only** | Matches every major library in registry; React must be singleton |
| Tailwind delivery | **Ship raw `.tsx` + `./theme.css`; document `@source ".../node_modules/@oriz/ui"` line in README** | node_modules excluded from auto-scan; library CSS isn't consumer-tree-shaken |

## Concrete fleet bootstrap order

If starting from zero:

1. Publish `@oriz/tsconfig-base` (§4). Versioned, pinned.
2. Publish `oriz-org/renovate-config` (preset repo, §7).
3. Publish `oriz-org/ci-workflows` with reusable `npm-publish.yml@v1` (§6).
4. Each `@oriz/<thing>-npm-pkg` repo: copy the §3 `package.json` skeleton, §6 `release.yml`, §7 one-line `renovate.json`, point tsconfig at `@oriz/tsconfig-base`.
5. First publish uses a one-shot npm token. Configure trusted publishing on npmjs.com. Delete the token. Subsequent publishes are tokenless.

## Open items / things to revisit

- **`knowledge/hosting-split-cf-and-github-pages.md`** is outdated re: SSR Astro 6 on Cloudflare Pages — needs revision (Workers now). Static Astro to CF Pages is still fine.
- **VoidZero -> Cloudflare acquisition (2026-06-04)** means tsdown, Vite, Vitest, Rolldown, and Oxc are now all under the same corporate roof as your hosting. Strategically reduces tooling/host risk; watch for licensing changes (none signaled, but worth a yearly check).
- **tsdown 1.0** hasn't shipped yet — watch for it; pin `^0.22` until 1.0 stabilizes.
- **Astro 7** isn't on the horizon (Astro 6.4 was just May 2026). Re-evaluate this brief on Astro 7 release.
