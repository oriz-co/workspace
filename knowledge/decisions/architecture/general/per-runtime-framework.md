---
type: decision
title: Per-runtime framework matrix locked
description: Astro 6 for all 25+ sites + companion docs; Vite+React+WXT for browser
  extensions; esbuild+TS for VS Code extensions; tsup+Node 22 for CLIs and MCP servers.
  Each runtime gets the framework that ships best to its target.
tags:
- architecture
- framework
- stack
- runtime
- astro
- vite
- esbuild
- tsup
- wxt
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/stack/family-stack-lock
- rules/development/astro-version-pin
- decisions/architecture/general/chrome-config-contract
---



# Per-runtime framework matrix locked

## Decision

One framework per runtime. Astro can't compile to chrome extensions or
`.vsix` packages, so those need different tools. Within each runtime,
the family picks ONE framework and uses it everywhere.

| Runtime | Framework | Build | UI lib | Hosting |
|---|---|---|---|---|
| Astro site (25+ family sites) | Astro 6 | astro build | React 19 islands | Cloudflare Pages |
| Browser extension (`*-ext`) | WXT | wxt build | React 19 | Chrome / Firefox / Edge stores |
| VS Code extension (`*-vsc-ext`) | (none) | esbuild | TS only, no UI lib | VS Code Marketplace + Open VSX |
| VSC companion site (`<name>-vsc-ext/site/`) | Astro 6 | astro build | React 19 islands | **GitHub Pages** (unlimited free projects) |
| CLI (`*-cli`) | (none) | tsup | TS, no UI | npm + bin entry |
| MCP server (`*-mcp`) | @modelcontextprotocol/sdk | tsup | TS, no UI | npm bin + stdio transport |
| CLI/MCP doc page (`*-cli/docs/`) | Astro 6 | astro build | React 19 islands | Cloudflare Pages |
| npm package (`@chirag127/*`) | (none) | tsup OR astro-build | TS | npm registry |

## Why this split

- **Astro everywhere on sites** — same `@chirag127/astro-shell` + `astro-chrome` packages reused. One fix lands across 25+ sites with `pnpm update --recursive`.
- **WXT for extensions** — vite-based, manifest-v3-aware, ships hot reload + cross-browser builds. Astro can't generate `manifest.json` or compile to `chrome-extension://`. WXT wins over Plasmo on freshness + Vite-native DX.
- **esbuild for VSC extensions** — VS Code extension host runs Node + the VS Code API. No DOM, no React, no Astro. esbuild directly for tight control.
- **tsup for CLIs and MCP servers** — wraps esbuild for npm-publishable packages with bin entries. Stable, zero-config common case, 1000+ npm packages.
- **Astro for doc/companion pages** — every CLI, MCP server, and VS Code extension still needs a public landing page. That page is Astro just like the other 25 sites.

## VSC extension companion site mechanics

The `*-vsc-ext` repo holds two artifacts:
- Extension code at root (compiles to `.vsix` via esbuild)
- Companion site at `site/` subdir (Astro 6, deploys to GH Pages)

Single `.github/workflows/deploy.yml`:
- On push to `main`: build extension + publish to marketplace
- On push to `main`: ALSO build `site/` + `actions/deploy-pages` to GH Pages at `<extension-slug>.github.io` (or CNAME under `oriz.in`)

Keeps repo count low (one per extension, not two) while preserving the
family rule "every project has a marketing site." Any free unlimited-repos
host equivalent works (Netlify Drop, Surge, Render static); GH Pages
preferred to keep CF Pages free-tier 1-concurrent-build slot for the
24+ primary sites.

## Astro integration set locked in @chirag127/astro-shell

Nine integrations ship as peer-deps; every consumer adds them at workspace level:

| Integration | Purpose |
|---|---|
| `@astrojs/sitemap` | Auto-generates sitemap.xml |
| `@astrojs/mdx` | MDX for content |
| `@astrojs/rss` | RSS feed helper |
| `@astrojs/react` | React 19 islands |
| `@tailwindcss/vite` | Tailwind v4 via Vite plugin (NOT the deprecated `@astrojs/tailwind`) |
| `astro-icon` | SVG icon component |
| `astro-compress` | CSS/HTML/JS minification |
| `@vite-pwa/astro` | PWA per distribution-and-queues-locked.md |
| `vite-plugin-wasm` + `vite-plugin-top-level-await` | WASM for tool sites |

## Rejected

- **Next.js 16** — App Router overkill for static sites; ~50× bigger bundle.
- **SvelteKit / Solid.js islands** — lose React ecosystem (react-pdf, react-firebase-hooks).
- **Vite + React SPA for sites** — loses Astro's zero-JS-by-default win.
- **Plasmo** for extensions — less Vite-native than WXT.
- **Deno for CLIs** — switching cost real, family is Node + pnpm.
