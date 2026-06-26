# npm + Astro shared-library best practices 2026

> Research date: 2026-06-26. Scope: authoring atomic npm packages and sharing components/utilities across Astro 6 apps. Sources verified via WebSearch + WebFetch on docs.astro.build, docs.npmjs.com, github.blog, tsdown.dev, vitest.dev, publint.dev, and arethetypeswrong.github.io. Pre-2024 material excluded except authoritative specs (Node.js packages docs, RFC 0030).

---

## TL;DR (the picks)

- **Build:** **tsdown** — Rolldown-based, official Rolldown project, tsup-compatible API, 3-5x faster, auto-derives dts and exports from `package.json`. Runner-up: tsup (boring/safe, 6.58M weekly downloads).
- **Module type:** **ESM-only** — `"type": "module"`, no dual build. Node 20.19+ / 22.12+ supports `require(esm)` for static graphs, so CJS consumers are not blocked. The dual-package hazard is no longer worth paying for in a greenfield 2026 library.
- **Astro components:** **Ship raw source.** Publish `.astro` / `.tsx` / `.css` files with `peerDependencies.astro` and a small `exports` map; Astro 6 consumes them via Vite without a build step. Astro 6's PR #14751 stubs `.astro` out of client bundles, so barrels mixing `.astro` and `.tsx` now hydrate correctly.
- **Publish:** **OIDC Trusted Publishers** (GA since 2025-07-31) on GitHub Actions, **no NPM_TOKEN**. Versioning: plain `npm version` for single-package polyrepos; **Changesets** for monorepos with cross-package deps.
- **Test:** **Vitest 3.2+** (Vitest 4 is shipping but the browser-provider API changed — pin to 3.2 unless you've migrated). Astro component tests via `experimental_AstroContainer.renderToString()`. Bun test is NOT viable as the primary runner for an Astro library in 2026.
- **Docs:** **README.md per package** is the default. Add **TypeDoc** once exports exceed ~20 per package. Cross-package portal: **single Starlight site** at `docs.<org>.<tld>` with one sidebar section per package — NOT multi-instance Starlight.

---

## 1. Build tools

The user's list (tsup / unbuild / vite-plugin-dts / tshy / pkgroll / bunchee) is still the established set, but the 2026 conversation has been eaten by a seventh tool: **tsdown** (Rolldown-based, official Rolldown project, designed as a tsup successor). Skipping it would be malpractice.

### Comparison table (verified 2026-06-26)

| Tool | Latest | Stars | Wk dl | Engine | Dual ESM/CJS | dts | Exports auto-gen | Watch | Tree-shake | 2026 pulse |
|---|---|---|---|---|---|---|---|---|---|---|
| **tsdown** ⭐ | 0.22.3 | 4.09k | **2.72M** | **Rolldown (Rust)** | yes | yes (oxc, auto-on from exports) | reads `exports` | yes | Rolldown + workspace | **fastest-growing**; official Rolldown project |
| tsup | 8.5.1 | 11.3k | 6.58M | esbuild | yes | yes (tsc/api-extractor) | manual | yes | esbuild-level | slowing — maintenance, no major feature push |
| unbuild | 3.6.1 | 2.73k | 232k | rollup + mkdist | yes | rollup-plugin-dts | reads `exports` | stub mode | rollup-level (best) | UnJS-active; Node 24+ baseline |
| tshy | 4.1.3 | 1.04k | 179k | tsc / tsgo | yes (hybrid) | yes (it IS tsc) | reads `exports` | yes | none (no bundling) | actively moving onto tsgo / TS 6.x |
| pkgroll | 2.27.1 | 1.56k | 79k | rollup | yes | yes | reads `exports` zero-config | yes | rollup-level | maintained, niche |
| bunchee | 6.11.0 | 1.40k | 62k | swc + rollup | yes | yes | reads `exports` | yes | rollup + RSC-aware | active, Vercel-adjacent |
| vite-plugin-dts | 5.0.3 | 1.53k | 3.70M | n/a (Vite plugin) | n/a | yes only | n/a | via Vite | n/a | very active; renamed `unplugin-dts` mid-2026 |

Key observations:
- **tsup vs tsdown speed**: ~2.5s vs ~0.6s on a 50-file real-world library — 3-5x faster in practice (PkgPulse 2026 benchmark).
- **tshy is unique**: pure-tsc hybrid emitter — no bundler. Best `.d.ts` fidelity (it *is* the TypeScript compiler), but no minification, no bundling. Used by npm itself, node-glob, mkdirp, rimraf (Isaac Schlueter's stack). Bootstrapping on `@typescript/native-preview` (tsgo).
- **vite-plugin-dts is not a library bundler** — it's a dts emitter. Its 3.7M weekly count is from Vite app projects emitting types, not standalone library builds.
- **bunchee**: first-class React Server Components (`"use server"`/`"use client"` directives), CSS, `bin` entries. Vercel/Next.js use it for internal packages.
- **unbuild**: UnJS default; powers Nuxt/Nitro/H3/ofetch internals. Stub mode (zero rebuild during dev) is the killer feature.
- **pkgroll**: minimalist's choice — pure `package.json#exports`-driven, no config file.

### Winner — tsdown

One-line rationale: tsup's API and DX, runs 3-5x faster on Rust (Rolldown), auto-derives dts/exports from `package.json`, and is positioned to become rolldown-vite's library mode. Every other tool in this list is on a flat or declining curve relative to it.

#### `package.json` for a tsdown-built library

```jsonc
{
  "name": "@oriz/util-name",
  "version": "0.1.0",
  "type": "module",
  "files": ["dist", "README.md", "LICENSE"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./package.json": "./package.json"
  },
  "scripts": {
    "build": "tsdown",
    "dev": "tsdown --watch",
    "type-check": "tsc --noEmit",
    "lint:pkg": "publint && attw --pack ."
  },
  "devDependencies": {
    "tsdown": "^0.22.0",
    "typescript": "^5.9.0",
    "publint": "^0.3.0",
    "@arethetypeswrong/cli": "^0.17.0"
  },
  "engines": { "node": "^20.19.0 || >=22.12.0" }
}
```

#### `tsdown.config.ts`

```ts
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],          // ESM-only; add 'cjs' only if you have data showing CJS consumers
  dts: true,                // auto-on if package.json has `types`/`exports.types`
  clean: true,
  sourcemap: true,
  treeshake: true,
  minify: false,            // libraries don't minify — consumers do
  // platform: 'neutral',   // set 'node' for Node-only libs
  // external: [/^node:/], // peer-deps are excluded by default
})
```

#### Migration from tsup (~90 seconds)

```bash
npm uninstall tsup
npm i -D tsdown
mv tsup.config.ts tsdown.config.ts
sed -i 's/from "tsup"/from "tsdown"/' tsdown.config.ts
sed -i 's/"tsup"/"tsdown"/g' package.json
```

### Runner-up — tsup

Pick tsup if: you cannot stomach a 0.x version on your build tool. 6.58M weekly downloads is a real Schelling point.

### When NOT tsdown

- Inside UnJS / Nuxt — use **unbuild** for ecosystem cohesion + stub mode.
- Publishing a tiny Node CLI with maximum `.d.ts` fidelity needed — use **tshy**.
- Publishing a Next.js / RSC package with `"use client"` boundaries — use **bunchee**.

### Caveat: do `.astro` components need a builder at all?

No. For Astro component packages, see Section 3 — you ship raw `.astro` + `.tsx` files, no build step. tsdown is only needed for TS utility packages and (optionally) for shipping React island components as compiled `.js` + `.d.ts` instead of raw `.tsx`. For an Astro-only component pack, skip the builder entirely.

---

## 2. Package shape

### ESM-only vs dual — pick ESM-only

Concretely:
- `"type": "module"` at the root.
- `dist/*.js` files are ESM (use `node:` protocol for builtins, full `./file.js` relative paths).
- No `.cjs` build, no Rollup dual emit, no tshy.

Why this works in 2026: every active Node LTS (20.19+, 22.12+, 24+) supports `require(esm)` for static graphs, so a CJS consumer can `require()` an ESM package directly. The dual-package hazard (two copies of state, two `instanceof` chains) is the cost. For a greenfield package in 2026, the cost is unjustified. Source: https://nodejs.github.io/package-examples/04-cjs-esm-interop/shipping-esm-for-cjs/

Escape hatch: `module-sync` exports condition exists for libraries that need to also serve EOL Node versions with a CJS fallback. Skip it unless you have data showing real EOL-Node consumers.

For an Astro 6 component library specifically: ESM-only is doubly correct. Astro is ESM-native, Vite is ESM-native, every modern bundler tree-shakes ESM better. The only consumer who'd want CJS is a legacy Next 12 app, and they can use dynamic `import()`.

### Complete `package.json` exports map

Conditions ordering rule from Node and TS: **`types` first, `default` last**, most-specific to least-specific between. (publint rule `EXPORTS_TYPES_SHOULD_BE_FIRST`/`EXPORTS_DEFAULT_SHOULD_BE_LAST`.)

```json
{
  "name": "@oriz/ui",
  "version": "0.1.0",
  "type": "module",
  "license": "MIT",
  "engines": {
    "node": "^20.19.0 || >=22.12.0"
  },
  "sideEffects": [
    "**/*.css",
    "**/*.astro"
  ],
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./components/*": {
      "types": "./dist/components/*.d.ts",
      "default": "./dist/components/*.js"
    },
    "./styles/*.css": "./dist/styles/*.css",
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
    "typescript": "^5.9.0",
    "publint": "^0.3.0",
    "@arethetypeswrong/cli": "^0.17.0"
  }
}
```

Rules enforced by publint / attw:
- **`types` before `default`** in every condition group. For an ESM-only package, you usually need only `types` + `default` — no separate `import`/`require` legs.
- **`./package.json` must be re-exported** so Vite and Astro can read it through resolution.
- **Wildcard `*`** is pure string substitution (Node docs), no `**` glob semantics. Keep extensions on both sides.
- **`null` targets** exclude private subpaths inside a wildcard surface.

### sideEffects — when safe to claim

Disqualifiers (any of these = not side-effect-free):

| Pattern | Side effect? |
|---|---|
| `import './polyfill.js'` for its effects | yes |
| `import './styles.css'` | yes — bundlers will drop them |
| Module-level `window.foo = ...`, `console.log`, registry register | yes |
| `class X extends Base {}; register(X)` | yes |
| Top-level `Symbol.for(...)` cache poke | usually yes |
| Pure export of a function / class | no |
| `const x = computeOnce()` where `computeOnce` is pure | no, but flag `/*#__PURE__*/` |

Recommended for a component library: array form, not `false` (matches Material UI, Lodash-es):

```json
"sideEffects": ["**/*.css", "**/*.astro"]
```

`.astro` files are side-effectful at scope level (they register components and styles). Pure `false` is only safe for headless utility libraries with zero CSS, zero polyfills, zero global registration. When in doubt, list explicit files — over-aggressive `false` is the #1 way to silently ship broken consumer bundles.

### peerDependencies vs dependencies

| Package | Used by your code? | Singleton required? | Field |
|---|---|---|---|
| `react`, `react-dom` in a React component lib | yes, at runtime | yes (one React per app) | `peerDependencies` + same in `devDependencies` |
| `astro` in an Astro integration / component pack | yes, at runtime | yes | `peerDependencies` + `devDependencies` |
| `lodash-es`, `clsx`, internal helpers | yes, at runtime | no | `dependencies` |
| `typescript`, `publint`, `vitest`, `eslint` | build/test only | n/a | `devDependencies` |
| `react` if your lib is framework-agnostic with an optional adapter | only when consumer uses adapter | yes | `peerDependencies` + `peerDependenciesMeta: { react: { optional: true } }` |
| Platform-specific native binary (`@nx/nx-darwin-arm64`) | runtime, one of N | no | `optionalDependencies` |

Rules:
- **Peer = "bring your own, and we share it."** Use when you'd break the consumer if they had a different copy in their tree (React hooks die across copies; same with anything using `instanceof` or context).
- **`peerDependenciesMeta.<name>.optional: true`** = "supported if present, no auto-install, no warning when missing." Per RFC 0030.
- **`optionalDependencies` ≠ optional peerDependencies.** It's for "auto-install if possible, don't fail if not" — used almost exclusively for platform-specific native artifacts.
- **Mirror every peer in devDependencies** so the package's own tests/build resolve.

For an Astro component lib: Astro is a required peer (`^6.0.0`); React + React-DOM are optional peers (only needed if your components are `.jsx`/`.tsx`). For a Node-only utility lib: usually zero peerDeps.

### engines.node

- **Node-only utility library:** `"node": "^20.19.0 || >=22.12.0"` (matches `require(esm)` support, all active LTS). Don't bother with EOL 18 (EOL April 2025).
- **Astro 6 component library:** `"node": ">=20.19.0"` is functionally equivalent — Astro 6 itself requires Node 20.19+. Match Astro's own `engines.node` if possible.
- **Pure-browser library (no Node-only APIs):** still pin `engines.node` to the same range — your build/install pipeline uses Node, and publint's `USE_ENGINES_NODE` rule prompts you for it.

Avoid `>=18` in 2026 — misleading (you likely use APIs that need 20.19+) and disables `module-sync` opportunities.

### files field

Whitelist, not blacklist. `.npmignore` is footgun-prone:

```json
"files": ["dist", "README.md", "LICENSE", "CHANGELOG.md"]
```

npm always adds `package.json`, `README*`, `LICENSE*`, `CHANGELOG*` regardless, but list them for clarity.

Do not ship `src/` by default. Declaration maps (next point) give you go-to-source without bloating the package. Skip `src/`, skip `tsconfig.json`, skip `.github/`, skip tests.

Pre-publish: run `npm pack --dry-run` and `publint`; publint flags `FILE_NOT_PUBLISHED` for anything referenced from `exports` not in the tarball.

### TypeScript: declarationMap + satisfies

**`declarationMap: true`: always on for libraries.** The package gets `.d.ts.map` files alongside each `.d.ts`. When a consumer ⌘-clicks an export in VS Code, the editor follows the map back to the original `.ts` source.

For full click-through experience, ship `.ts` sources too. Two viable shapes:
- **Lean (most libs):** `declarationMap: true`, exclude `src/` from `files`. Maps point to nothing in node_modules — harmless. Costs ~5% pkg size.
- **Full DX:** include `src/**/*.ts` in `files`. Adds bytes; consumers can step through your sources. Worth it for component libraries.

For an Astro/React component lib: full DX. Designers will want to peek at actual `.tsx`/`.astro` source. For a hot-path utility lib where every KB matters: lean.

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "target": "es2022",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "outDir": "dist"
  }
}
```

**`satisfies` operator — where it earns its place:**

A. Public config literals where you want exact types (not widened):

```ts
import type { ThemeConfig } from "./types.js";

export const defaultTheme = {
  primary: "#7c3aed",
  radius: { sm: 4, md: 8, lg: 16 }
} as const satisfies ThemeConfig;
// consumers get exact literal types — `defaultTheme.radius.sm` is `4`, not `number`.
```

B. Default exports that need a type contract (default exports can't carry annotations):

```ts
import type { StringCallback } from "./core.js";
export default ((s) => s.toUpperCase()) satisfies StringCallback;
```

C. Discriminated-union registries where consumers should autocomplete keys:

```ts
export const components = {
  Button: { tag: "button", variant: "primary" },
  Link:   { tag: "a",      variant: "ghost" }
} as const satisfies Record<string, ComponentSpec>;
```

Not useful: on values that already have a contextual type (typed function returns/params, annotated exports); as a replacement for type annotations on mutable bindings.

### Pre-publish checklist (in CI)

```bash
npx publint
npx @arethetypeswrong/cli --pack .
npm pack --dry-run
```

Both publint and attw should run green before `npm publish`.

---

## 3. Astro 6 patterns

Verified against Astro 6.0 (released 2026-03-10, current stable 6.4 from 2026-05-28). Astro 7.0 has shipped but the question is scoped to v6, which is the live LTS-style line.

### Exporting `.astro` components from an npm package

Astro 6 ships `.astro` source files **directly — no build step**. The Astro compiler handles them via Vite when the consumer imports them.

Quoting docs.astro.build: *"Any file type that Astro supports natively, such as .astro, .ts, .jsx, and .css, can be published directly without a build step."*

Minimal `package.json` for an `.astro`-only package:

```json
{
  "name": "@oriz/ui",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./index.ts",
    "./Button.astro": "./src/Button.astro",
    "./Card.astro": "./src/Card.astro",
    "./styles.css": "./src/styles.css"
  },
  "files": ["src", "index.ts"],
  "keywords": ["astro-component", "withastro"],
  "peerDependencies": { "astro": "^6.0.0" }
}
```

`index.ts` barrel:

```ts
export { default as Button } from './src/Button.astro';
export { default as Card } from './src/Card.astro';
```

Rules:
- Every `.astro` file you want consumed must appear in `files` (or in a listed directory). `files` is an inclusion list.
- The `exports` map controls what consumers import. The barrel lets `import { Button } from '@oriz/ui'`. The subpath entries enable `import Button from '@oriz/ui/Button.astro'`.
- `"type": "module"` + `peerDependencies.astro` — don't bundle Astro.
- Add `astro-component` keyword for the integrations directory.

**Astro 6 fix worth knowing:** re-exporting `.astro` through a barrel previously broke client hydration (issue #3703). Astro 6's PR #14751 stubs `.astro` imports out of client modules entirely, so a mixed barrel exporting both `.astro` and `.tsx` now works correctly in dev + prod.

### Exporting React island components

Ship raw `.jsx` / `.tsx` source — Vite handles JSX. No prebuild required. Astro's own `examples/component` template ships TS source directly.

`client:load` across package boundaries works the same as locally: the directive is parsed at compile time in the consumer's `.astro` file, Astro resolves through Vite. The consumer must have `@astrojs/react` registered — your package can't add the renderer unless you ship an integration (see below).

```json
{
  "name": "@oriz/ui",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./index.ts",
    "./Button.astro": "./src/Button.astro",
    "./Counter.tsx": "./src/Counter.tsx",
    "./Modal.tsx": "./src/Modal.tsx"
  },
  "files": ["src", "index.ts"],
  "keywords": ["astro-component", "withastro"],
  "peerDependencies": {
    "astro": "^6.0.0",
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "@astrojs/react": "^4.0.0 || ^5.0.0"
  }
}
```

Consumer:

```astro
---
import { Counter } from '@oriz/ui';
import Modal from '@oriz/ui/Modal.tsx';
---
<Counter client:load />
<Modal client:visible />
```

`.d.ts` is not required — `astro sync` picks types from source. Add it only if you want types available to a non-Astro consumer.

### Sharing Tailwind config

Mid-2026 state: **Tailwind v4 dominates**, and the CSS-first `@theme` block in a `.css` file is the official sharing pattern. The v3 JS preset (`presets: [...]`) is legacy — don't use for new libraries.

`packages/@oriz/theme/package.json`:

```json
{
  "name": "@oriz/theme",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./src/theme.css",
    "./theme.css": "./src/theme.css"
  },
  "files": ["src"],
  "sideEffects": ["*.css"]
}
```

`packages/@oriz/theme/src/theme.css`:

```css
/* Do NOT @import "tailwindcss" here — the consumer does that. */
@theme {
  --color-brand-500: oklch(0.55 0.19 260);
  --color-ink: oklch(0.26 0.05 264);
  --font-sans: Inter, system-ui, sans-serif;
  --radius-md: 0.5rem;
}
```

Consumer `src/styles/global.css`:

```css
@import "tailwindcss";
@import "@oriz/theme/theme.css";

/* Critical for monorepo: tell Tailwind to scan the library's source
   so utilities used inside library components actually generate. */
@source "../../packages/@oriz/ui/src/**/*.{astro,tsx,jsx}";
```

Astro 6 uses `@tailwindcss/vite` (not the deprecated `@astrojs/tailwind`):

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ vite: { plugins: [tailwindcss()] } });
```

Flag: no Astro-6-specific blog post about Tailwind v4 — pattern is Tailwind-v4-authoritative and works under any Vite framework.

### Sharing CSS

`sideEffects` must list CSS files so Rollup/Rolldown (and webpack consumers) don't tree-shake side-effect imports.

```json
{
  "name": "@oriz/styles",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    "./globals.css": "./src/globals.css",
    "./reset.css": "./src/reset.css"
  },
  "files": ["src"],
  "sideEffects": ["*.css", "**/*.css"]
}
```

Consumer placement: import once from a shared layout — not from `astro.config.mjs` (Astro has no top-level `css:` config).

`src/layouts/BaseLayout.astro`:

```astro
---
import '@oriz/styles/globals.css';
import '@oriz/theme/theme.css';
---
<!doctype html>
<html lang="en"><head><title>{Astro.props.title}</title></head>
<body><slot /></body></html>
```

Alternative — inject from an integration (only if shipping one anyway):

```js
'astro:config:setup': ({ injectScript }) => {
  injectScript('page-ssr', 'import "@oriz/styles/globals.css";');
}
```

Docs note: *"The main use for the page-ssr stage is injecting a CSS import into every page to be optimized and resolved by Vite."*

Astro 6 / Vite 7 gotcha: with Rolldown's dedup, the same CSS imported as side effect from many entry chunks can disappear. Layout-level imports (one entry chunk) sidestep this.

### When ship an integration vs components-only

Plain package suffices when you only export `.astro` / `.tsx` / `.css` / `.ts` and the consumer adds their own renderer and CSS imports.

Ship an integration when you need ANY of:
- `addRenderer` — register a new UI framework
- `addMiddleware` — every-request middleware
- `injectRoute` — pages from your package
- `injectScript` — auto-inject script/CSS into every page
- `addClientDirective` — custom `client:*`
- `addDevToolbarApp` — dev-toolbar UI
- `updateConfig` — auto-wire Vite plugins / redirects
- `addWatchFile` — restart dev on config file changes
- `injectTypes` — extend consumer's TS types (canonical in v6 via `astro:config:done`)
- `createCodegenDir` — emit codegen into `.astro/integrations/<name>/`

Astro 6 hooks (full list):
- `astro:config:setup` — `updateConfig`, `addRenderer`, `addClientDirective`, `addMiddleware`, `addDevToolbarApp`, `addWatchFile`, `injectScript`, `injectRoute`, `createCodegenDir`, `logger`
- `astro:route:setup` — per-route options
- `astro:routes:resolved` — after route resolution
- `astro:config:done` — `setAdapter`, `injectTypes`, `buildOutput`
- `astro:server:setup` / `astro:server:start` / `astro:server:done`
- `astro:build:start` — new `setPrerenderer` in v6
- `astro:build:setup` / `astro:build:ssr` / `astro:build:generated`
- `astro:build:done` — v6 removed `routes` from payload (use `astro:routes:resolved`)

Astro 6 breaking changes for integration authors:
- Drops Node 18/20 (Node 22+ required at consumer side)
- Vite 7 + Vite Environment API — `astro dev` uses the production runtime
- `astro:ssr-manifest` virtual module removed
- `RouteData.generate()` removed from Adapter API
- `routes` removed from `astro:build:done`
- `setPrerenderer()` added on `astro:build:start`

Minimal integration skeleton:

```js
// packages/@oriz/astro-analytics/src/index.js
/**
 * @param {{ siteId: string }} opts
 * @returns {import('astro').AstroIntegration}
 */
export default function analytics(opts) {
  return {
    name: '@oriz/astro-analytics',
    hooks: {
      'astro:config:setup': ({ injectScript, updateConfig, logger }) => {
        logger.info(`Wiring analytics ${opts.siteId}`);
        injectScript('page',
          `import { track } from '@oriz/astro-analytics/script.js';
           track(${JSON.stringify(opts.siteId)});`);
        injectScript('page-ssr', `import '@oriz/styles/globals.css';`);
        updateConfig({ vite: { define: { __ORIZ_SITE__: JSON.stringify(opts.siteId) } } });
      },
      'astro:config:done': ({ injectTypes }) => {
        injectTypes({ filename: 'oriz-analytics.d.ts', content: `declare const __ORIZ_SITE__: string;` });
      },
    },
  };
}
```

Consumer:

```js
import analytics from '@oriz/astro-analytics';
export default defineConfig({ integrations: [analytics({ siteId: 'oriz.in' })] });
```

### Decision rules

| Need | Ship |
|---|---|
| `.astro` + `.tsx` components only | Plain package |
| Tailwind tokens / global CSS | Plain CSS-only package, `sideEffects: ["*.css"]` |
| Components + opinionated `client:click` | Integration (`addClientDirective`) |
| Auto-injected analytics / global CSS | Integration (`injectScript`) |
| Auth middleware | Integration (`addMiddleware`) |
| Ready-made `/admin` page in the package | Integration (`injectRoute`) |
| New UI framework support | Integration (`addRenderer`) — bigger lift |
| Cloudflare / Node adapter | Adapter (integration with `setAdapter`) |

**For the oriz fleet specifically:** the existing inline-analytics-via-BaseLayout decision (zero-in-house-packages-inline-analytics.md) matches Astro's grain. Only graduate to a packaged integration once the same boilerplate lives in 3+ apps with diverging configs. Smallest viable shared layer is plain `@oriz/ui` + CSS-only `@oriz/theme`.

---

## 4. Publishing

### Trusted Publishers (OIDC) — GA since 2025-07-31

GitHub announced npm Trusted Publishing with OIDC GA on 2025-07-31. This is the OpenSSF "trusted publishers" standard (PyPI, RubyGems, crates.io, NuGet all use it).

**Supported CI providers (as of 2026-06):**
- GitHub Actions (GitHub-hosted runners)
- GitLab CI/CD (gitlab.com shared runners)
- CircleCI cloud

Self-hosted runners NOT supported yet.

**Use Trusted Publishers over automation tokens — aggressively.** Following the September 2025 GitHub plan for a more secure npm supply chain:
- **2025-12-09:** All npm classic tokens permanently revoked. `npm login` now issues 2-hour session tokens.
- **2026 default:** New packages created with 2FA-required publishing. Granular tokens have shorter expiries (write tokens capped at 90 days).
- TOTP 2FA being phased out in favor of WebAuthn/passkeys.
- Long-term: only three sanctioned publish paths — (1) local with 2FA, (2) short-lived granular tokens (7-day target), (3) Trusted Publishing.

**One limitation:** Trusted Publishing can't do the *first* publish — the package must exist on npmjs.com before you can configure a trusted publisher. Workaround: manual first publish (or `setup-npm-trusted-publish` to push a v0.0.0).

**Requires npm CLI v11.5.1+** (ships with Node 22+; Node 24 is the safe baseline).

### npm provenance — how to enable

**With Trusted Publishing:** automatic. `--provenance` flag no longer needed; npm CLI generates and uploads the sigstore attestation by default. Opt out with `NPM_CONFIG_PROVENANCE=false`.

**Without Trusted Publishing (token-based):** in the GH Actions workflow:
1. `permissions: id-token: write` on the job
2. GitHub-hosted runner (`runs-on: ubuntu-latest`)
3. `--provenance` flag on `npm publish`

Plus in `package.json`:

```json
{
  "repository": { "type": "git", "url": "git+https://github.com/owner/repo.git" },
  "publishConfig": { "access": "public", "provenance": true }
}
```

### Changesets — when to reach for it

[`changesets/changesets`](https://github.com/changesets/changesets) — 12k stars, actively maintained (v3 in development on main, v2 on maintenance/v2).

Best fit: **monorepos with multiple packages** (Vercel, Radix, Remix, Svelte, Panda CSS all use it). NOT the best choice for single-package polyrepos — too much ceremony.

Workflow:
1. Dev runs `pnpm changeset add` describing the change + semver bump
2. `.changeset/<id>.md` is committed alongside the code in the PR
3. [`changesets/action`](https://github.com/changesets/action) keeps a perpetual "Version Packages" PR open showing pending bumps + generated changelog
4. Merging the version PR triggers `changeset publish` → npm

Differentiator: the dev who *wrote* the change picks patch/minor/major — not a regex over commit messages. Why it's preferred for monorepos with cross-package dependency graphs: handles internal-dep version bumps correctly without inference. Tradeoff: every PR needs a changeset file.

### release-please — when it beats changesets

[`googleapis/release-please`](https://github.com/googleapis/release-please) — 7k stars, 284k weekly downloads, Google-maintained.

Best fit:
- **Conventional-commits-native teams** that don't want a parallel `.changeset/` ceremony
- **Polyglot repos** (Node + Python + Rust + Go in one repo — handles all natively)
- Teams that want a "release PR you can review before merging" rather than blind auto-release

Workflow: every push to `main` updates a single "Release PR" with the running changelog + version bump derived from `feat:`/`fix:`/`feat!:` prefixes. Merge → tag + publish.

Monorepo support via the manifest releaser (`release-please-config.json` + `.release-please-manifest.json`, plus `node-workspace` plugin for cross-package dep bumps).

**Watch out:** the original `google-github-actions/release-please-action` was archived August 2024 and migrated to `googleapis/release-please-action` with a breaking v3→v4 transition. Community has griped about PR-creation flakiness and 197+ open issues. CLI itself is fine; the GH Action has rough edges.

### semantic-release — still alive in 2026

[`semantic-release/semantic-release`](https://github.com/semantic-release/semantic-release) — 23.8k stars, latest v25.0.5 published 2026-06-09. Not deprecated.

But: overtaken in mindshare — most new monorepos pick changesets, most polyglot repos pick release-please. Now mostly the legacy choice or for "fully-automatic, no-PR-gate, fire-on-merge" single-package projects. Monorepo support is still community-plugin only (`semantic-release-monorepo`, effectively unmaintained for Nx/pnpm workspaces).

Choose it only if: you want zero-touch automatic releases (no PR to merge), have a single package, and already speak Conventional Commits fluently.

### Plain `npm version && npm publish` — when fine

Totally OK for:
- Solo-maintainer package with <1 release/month
- Initial bootstrap publish (required anyway for Trusted Publishers)
- Throwaway/experimental packages
- Cases where you'd rather think for 30 seconds about the semver bump than maintain a `.changeset/` directory

Pair with `np` for a guided local release with safety checks, or `npm version patch && git push --follow-tags` to trigger a tag-based CI workflow.

### Winners by repo shape

| Repo shape | Pick | Why |
|---|---|---|
| **Single atomic 100-LOC package polyrepo** | **`npm version` + GH Actions on tag push, Trusted Publishing, no changelog tool** | 100 LOC doesn't warrant a release-PR dance. Tag → publish is 25 lines of YAML. release-please is reasonable if you want auto-changelog from conventional commits. |
| **Monorepo with 5+ packages** | **Changesets** (Recommended). `release-please` manifest mode 2nd choice if team is conventional-commits-only or polyglot | Changesets handles cross-package internal-dep bumps correctly, has biggest monorepo install base (Vercel/Radix/Svelte/Remix), `.changeset/` files make semver decisions explicit and reviewable. |

### GitHub Actions — Trusted Publisher (no tokens)

Prereq (one-time): on npmjs.com → your package → Settings → Trusted Publisher → GitHub Actions. Fill in: organization, repository, workflow filename (`publish.yml` — filename only), optional environment.

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  push:
    tags: ['v*']
  workflow_dispatch:

permissions:
  contents: read
  id-token: write   # required for OIDC token exchange

jobs:
  publish:
    runs-on: ubuntu-latest          # Trusted Publishing needs GH-hosted runners
    environment: production         # optional reviewer-approval gate
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'        # ships with npm >= 11.5.1
          registry-url: 'https://registry.npmjs.org'
      - run: npm install -g npm@latest   # ensure OIDC-aware CLI
      - run: npm ci
      - run: npm run build --if-present
      - run: npm test --if-present
      - run: npm publish --access public
        # No NODE_AUTH_TOKEN — OIDC handles auth via id-token: write
        # No --provenance flag — Trusted Publishing emits it automatically
```

Matching `package.json` (provenance won't sign without these):

```json
{
  "name": "@acme/widget",
  "version": "0.1.0",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/acme/widget.git"
  },
  "publishConfig": { "access": "public" }
}
```

### Monorepo workflow — Changesets + Trusted Publisher

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

permissions:
  contents: write       # changesets/action commits version bumps
  pull-requests: write  # and opens the "Version Packages" PR
  id-token: write       # OIDC for npm Trusted Publisher

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install -g npm@latest
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: changesets/action@v1
        with:
          publish: pnpm changeset publish    # uses OIDC — no NPM_TOKEN
          version: pnpm changeset version
          commit: "chore: version packages"
          title: "chore: version packages"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # No NPM_TOKEN — Trusted Publisher provides auth via id-token
```

---

## 5. Testing

### Vitest — the consensus

Yes — Vitest is the default for new TS libraries in 2026. Weekly downloads jumped from 4.8M (v2) to 7.7M (v3); Storybook's new test runtime is built on it.

Current versions: **Vitest 4.0** has shipped as the new major; the widely-installed stable line is **3.2.x**. **Pin to 3.2 unless you've migrated past the browser-provider rework in v4.**

Killer features (3.2+):
- **`projects`** (replaces `workspace`) — inline projects array; `workspace` deprecated.
- **Multi-browser `instances`** — one Vite server cached across browsers.
- **Type-testing via `expectTypeOf` / `assertType`** — runs `tsc --noEmit`, default pattern `*.test-d.ts`, flag `--typecheck`.
- **AST-aware V8 coverage remapping** (3.2+) — V8 speed with Istanbul accuracy.
- **Browser Mode** with Playwright/WebdriverIO, `locators.extend`, `screenshot.save`.
- **In-source testing** via `includeSource` + `import.meta.vitest`.

Vitest 4 breaking changes: browser provider is an object, `@vitest/browser` no longer needed, several deprecated `deps.*` options removed.

### Bun test — not the primary runner for an Astro library in 2026

Add Bun test as a secondary CI matrix entry only if you advertise Bun support.

Evidence from a real May 2026 migration of 316 files / 2756 tests (`bun#31316`):
- `mock.module()` had a process-global registry with no per-file reset — forced per-file process isolation, killing speed. Fix only landed mid-2026.
- `mock.module` factory must be synchronous (Vitest allows async).
- No `importActual` bypass of an active mock — breaks `vi.mock(x, () => ({ ...actual, override }))`.
- `spyOn` doesn't propagate through ESM re-export barrels (`bun#30242`).
- No per-file environment selection (no equivalent to `// @vitest-environment happy-dom`).
- `vi` alias is partial — 5 methods only; missing `hoisted`, `importActual`, `stubEnv`, `stubGlobal`, fake timers, etc.
- No V8 coverage on Bun.

What works: Jest-compatible API, TS/JSX native, snapshots, watch, `--preload`, GH Actions auto-annotations, `expectTypeOf`.

**Critical for this question:** `bun test` does NOT work with Astro components. Astro maintainer: "Testing needs to be done via vitest, because it loads the vite configuration required to compile the Astro components" (`astro#12740`).

### Astro Container API + Vitest

Still **`experimental_` prefixed** in mid-2026. Import is `experimental_AstroContainer`. Canonical example: `withastro/astro` → `examples/container-with-vitest`.

Compat:
- Astro 5.x needs Vitest 3.0.5+; Astro 6 needs same or newer.
- Bun test unsupported.

```ts
// tests/Card.test.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/react';
import { expect, test } from 'vitest';
import Card from '../src/components/Card.astro';

// Only needed if the .astro embeds React/Svelte/Vue islands.
const renderers = await loadRenderers([getContainerRenderer()]);
const container = await AstroContainer.create({ renderers });

test('Card renders title and slot content', async () => {
  const result = await container.renderToString(Card, {
    props: { title: 'Hello' },
    slots: { default: 'Card body' },
  });
  expect(result).toContain('Hello');
  expect(result).toContain('Card body');
});
```

For pure-Astro components (no island), drop the `renderers` argument.

### `vitest.config.ts` for a TS library

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    typecheck: {
      enabled: true,
      include: ['src/**/*.test-d.ts'],
      tsconfig: './tsconfig.test.json',
    },
    coverage: {
      provider: 'v8',
      experimentalAstAwareRemapping: true, // Vitest 3.2+: V8 speed, Istanbul accuracy
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test-d.ts', 'src/**/index.ts'],
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
    },
    includeSource: ['src/**/*.ts'], // in-source `import.meta.vitest` blocks
  },
  define: {
    'import.meta.vitest': 'undefined', // strip from prod build
  },
});
```

Type-test example (`src/foo.test-d.ts`):

```ts
import { expectTypeOf, test } from 'vitest';
import { mount } from './mount.js';

test('mount signature', () => {
  expectTypeOf(mount).toBeFunction();
  expectTypeOf(mount).parameter(0).toExtend<{ name: string }>();
  expectTypeOf(mount).returns.toEqualTypeOf<{ ok: boolean }>();
});
```

---

## 6. Documentation

### Per-package — README vs TypeDoc vs api-extractor

| Approach | Strength | Weakness | When |
|---|---|---|---|
| **README.md only** | npm + GitHub render natively; zero build; the only doc most people read | Doesn't scale past ~20 exports | Small TS lib, `nanoid`-shaped. **The default.** |
| **TypeDoc** (~3M weekly) | TS-native; reads types + TSDoc/JSDoc; full static site; monorepo support; auto-links to GitHub source; `@alpha/@beta/@internal` | Looser than spec TSDoc — `eslint-plugin-tsdoc` warns on TypeDoc-isms | ≥20 exports where users want a browsable API site. De-facto standard. |
| **api-extractor + api-documenter** (~15M weekly) | `.d.ts` rollup; `.api.md` API-review files for PR gates; breaking-change detection; strict TSDoc; release-stage tracking | api-documenter's Markdown has embedded HTML that breaks several GH Pages pipelines; heavier setup | Microsoft/Rush/Nx-scale libs where API contract enforcement matters more than pretty docs |

For a small OSS TS lib (≤20 exports): README.md only. For 10+ exports with stable users: README + TypeDoc to GH Pages. Reach for api-extractor only when `.d.ts` rollup or PR-gated breaking-change diffs are needed.

### Centralized docs site — single Starlight

Starlight (`@astrojs/starlight` ~0.37.x) is the consensus docs theme on Astro in 2026 — used by Astro, Bun, Cloudflare.

**Best practice for ~10 small TS libraries: single Starlight site at `docs.<org>.<tld>`** — one sidebar section per package, each package's README rendered as the section landing page, with TypeDoc-generated API pages slotted under each section. Keep the per-package README authoritative on npm + GitHub for discovery.

Why one site, not 10:
- Starlight itself is a pnpm monorepo with one docs site for its 4+ packages.
- Cross-package search via Pagefind is free with a single site.
- Multi-instance Starlight costs cross-search, theme drift, and 10× deploy overhead.

Avoid: hosting docs in npm-package-internal `docs/` folders — npm doesn't render them.

---

## Conflicts / uncertainty flagged

1. **Build tool list incomplete:** the user's question listed six tools; tsdown (the 2026 winner) wasn't in the list. Including it because every 2026 source converges on it as the official Rolldown-based tsup successor.
2. **Vitest 4 vs 3.2:** Vitest 4 has shipped but breaks browser-provider config. The conservative pick is 3.2 until your stack tolerates the migration.
3. **Tailwind v4 + Astro 6:** no Astro-6-specific blog post about Tailwind v4. Pattern is Tailwind-v4-authoritative and works under any Vite framework — confidence high, but not Astro-team-blessed in writing.
4. **AstroContainer API:** still `experimental_` prefixed in mid-2026 despite years of stable usage. The prefix may not be removed in the v6 line. Plan for a rename when Astro 7 ships.
5. **Trusted Publishing first-publish gap:** can't bootstrap a brand-new package via OIDC — first publish must be local or token-based. Plan for it.
6. **Astro 6 stubbing `.astro` from client bundles (PR #14751):** referenced by one source but I could not directly verify the PR number against the Astro repo in this session — confidence on the behavior is high (it matches the documented v6 changelog about hydration fixes), but the PR number should be confirmed before citing in production docs.

---

## Sources

### Build tools
- https://www.pkgpulse.com/guides/tsup-vs-tsdown-vs-unbuild-typescript-library-bundling-2026 — 2026 head-to-head benchmark
- https://www.pkgpulse.com/guides/best-typescript-build-tools-2026 — best-of roundup
- https://www.pkgpulse.com/guides/state-of-typescript-tooling-2026 — broader landscape
- https://tsdown.dev/guide/ — tsdown introduction
- https://tsdown.dev/guide/faq — tsdown vs tsup, migration
- npm registry: tsup@8.5.1, unbuild@3.6.1, tshy@4.1.3, pkgroll@2.27.1, bunchee@6.11.0, vite-plugin-dts@5.0.3, tsdown@0.22.3

### Package shape
- https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c — pure ESM package gist
- https://2ality.com/2025/02/typescript-esm-packages.html — 2ality on ESM-only TS packages
- https://2ality.com/2025/02/satisfies-operator.html — `satisfies` deep dive
- https://cmdcolin.github.io/posts/2025-01-12-pureesm/ — pure-ESM publishing walkthrough
- https://nodejs.org/dist/latest/docs/api/packages.html — Node packages docs (authoritative)
- https://nodejs.github.io/package-examples/04-cjs-esm-interop/shipping-esm-for-cjs/ — official `require(esm)` guidance
- https://www.typescriptlang.org/docs/handbook/modules/reference.html — TS modules reference
- https://www.typescriptlang.org/tsconfig/declarationMap.html — declarationMap docs
- https://publint.dev/rules — publint rule list
- https://arethetypeswrong.github.io/ — attw + FAQ
- https://webpack.js.org/guides/tree-shaking/ — sideEffects spec
- https://github.com/npm/rfcs/blob/main/implemented/0030-no-install-optional-peer-deps.md — RFC 0030

### Astro 6
- https://docs.astro.build/en/reference/publish-to-npm/ — authoritative
- https://docs.astro.build/en/reference/integrations-reference/ — integration hooks
- https://docs.astro.build/en/reference/renderer-reference/ — renderer API
- https://docs.astro.build/en/guides/upgrade-to/v6/ — v6 upgrade guide
- https://astro.build/blog/astro-6/ — v6 launch post
- https://github.com/withastro/astro/pull/14751 — `.astro` client-bundle stub (verify PR number before citing)
- https://tailwindcss.com/docs/theme — Tailwind v4 `@theme`

### Publishing
- https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/ — GA announcement
- https://docs.npmjs.com/trusted-publishers/ — Trusted Publishers docs
- https://docs.npmjs.com/generating-provenance-statements/ — provenance docs
- https://github.blog/security/supply-chain-security/our-plan-for-a-more-secure-npm-supply-chain/ — Sept 2025 plan
- https://github.blog/changelog/2025-12-09-npm-classic-tokens-revoked-session-based-auth-and-cli-token-management-now-available/ — classic tokens revoked
- https://github.com/changesets/changesets — Changesets
- https://github.com/googleapis/release-please — release-please
- https://github.com/semantic-release/semantic-release — semantic-release (still v25.0.5 in 2026)

### Testing & docs
- https://vitest.dev/guide/ — Vitest docs
- https://vitest.dev/blog/vitest-3 — Vitest 3.0 blog
- https://vitest.dev/blog/vitest-3-2 — Vitest 3.2 blog
- https://vitest.dev/guide/migration.html — Vitest 4 migration
- https://vitest.dev/guide/coverage — coverage docs
- https://bun.com/docs/test — Bun test docs
- https://github.com/oven-sh/bun/issues/31316 — real-world Bun migration report
- https://docs.astro.build/en/reference/container-reference/ — Astro Container API
- https://github.com/withastro/astro/blob/main/examples/container-with-vitest — official example
- https://github.com/withastro/astro/issues/12740 — Bun unsupported for Astro tests
- https://starlight.astro.build/ — Starlight
- https://typedoc.org/documents/Doc_Comments.TSDoc_Support.html — TypeDoc + TSDoc
- https://tsdoc.org/ — TSDoc spec
- https://www.pkgpulse.com/guides/typedoc-vs-jsdoc-vs-api-extractor-2026 — 2026 docs-tool comparison
