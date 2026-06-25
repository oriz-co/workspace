---
type: architecture
title: Extensions Minimalist & Modern Stack
description: The absolute best, most minimalist, and fastest stack, frameworks, libraries, and dev tools for browser and editor extensions.
tags:
- extensions
- wxt
- chrome
- vscode
- stack
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
---

# Extensions Minimalist & Modern Stack

- **Chrome Extension Framework:** **[WXT](https://wxt.dev/)** (Vite-powered, framework-agnostic)
  - *Chosen over Plasmo* because:
    - **Active Maintenance & Reliability:** Plasmo suffers from significant maintenance lag, unresolved issues with its bundler (Parcel), and slow build times. WXT is actively maintained, highly stable, and boasts rapid development cycles.
    - **Vite Ecosystem Speed:** WXT is natively powered by Vite, giving it ultra-fast Hot Module Replacement (HMR) and compilation speeds, whereas Plasmo is bound to Parcel's slower resolver.
  - *Chosen over raw CRXJS* because:
    - **Unified Abstractions:** WXT provides elegant, built-in APIs and helper modules for unified local storage, cross-context messaging, and internationalization (i18n), which must be manually implemented in CRXJS.
    - **Developer Ergonomics:** WXT includes features like auto-imports (similar to Nuxt) and automatic browser-specific manifest generation (Chrome, Firefox, Safari, Edge) from a single codebase.

- **VS Code Extension Development:** **TypeScript + [yo code](https://github.com/Microsoft/vscode-generator-code) + [esbuild](https://esbuild.github.io/)**
  - *TypeScript & yo code:* Serves as the industry-standard generator and strongly-typed base for VS Code extension APIs.
  - *esbuild chosen over Webpack* because:
    - **Compilation Speed:** esbuild is written in Go and compiles/packages JavaScript and TypeScript code 10x to 100x faster than Webpack, providing near-instant packaging for developer iteration.
    - **Zero-Config Simplicity:** esbuild requires virtually zero configuration to package VS Code extensions, avoiding the complex, verbose webpack.config.js setups commonly required.

- **Infrastructure & Costs:**
  - **Local Development ($0/month):** Extension compilation, loading, debugging, and execution run entirely on the local client machine.
  - **Zero Hosting Costs:** Unless the extension communicates with a remote backend (which should be minimized/avoided for security and local-first policies), hosting, distribution, and runtime execution incur $0 hosting/infrastructure costs.
