---
type: decision
title: "[SUPERSEDED] Cross-surface package set — replaced by 14-package locked set"
status: superseded
superseded_by: architecture/the-six-packages
description: "Family supports 6 surfaces (astro / browser-ext / vsc-ext / cli / cf-worker / mcp-server) × 10 cross-cutting concerns (auth / billing / analytics / logger / config / api-client / flags / storage / notifications / test-utils). Default rule: use existing npm packages (firebase, razorpay, pino, posthog-js, unstorage, etc.); only carve a @chirag127/* package when no existing one fits. Net result: 3 thin wrappers (auth-wxt, auth-vsc, auth-cli) on top of the existing 22 @chirag127/astro-* packages."
tags: [architecture, packages, cross-surface, auth, billing, analytics]
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
  - architecture/the-six-packages
  - architecture/package-isolation-rule
  - architecture/cross-site-auth-via-auth-oriz-in
  - architecture/subscription-flow
  - architecture/hono-rpc-type-sharing
  - decisions/architecture/per-runtime-framework
  - decisions/architecture/distribution-and-queues-locked
---

# Cross-surface package set — prefer existing npm packages over new wrappers

## Decision

Six surfaces × ten concerns. Default: use existing packages from npm. Carve a `@chirag127/*` package ONLY when no existing one covers the gap (typically a surface-specific binding the upstream library doesn't ship). This is the [[package-isolation-rule]] sharpened: isolation matters when the dep is volatile or surface-specific; for stable industry libs we consume them directly.

## Surfaces (6)

| Surface | Runtime / framework | Reference |
|---|---|---|
| Astro | Astro 6 + React 19 + Tailwind v4 + Cloudflare Pages | [[per-runtime-framework]] |
| Browser extension | WXT + React 19; Chrome + Firefox + Edge | [[distribution-and-queues-locked]] |
| VS Code extension | esbuild + Node + VS Code API; VS Code Marketplace + Open VSX | [[per-runtime-framework]] |
| CLI | tsup + Node 22 | [[per-runtime-framework]] |
| Cloudflare Worker | Hono + workerd | [[api-umbrella-hono-worker]] |
| MCP server | `@modelcontextprotocol/sdk` + tsup + stdio | [[per-runtime-framework]] |

## Concerns × packages

| Concern | Core | Astro | WXT | VS Code | CLI | Worker | MCP |
|---|---|---|---|---|---|---|---|
| Auth | `firebase` | `@chirag127/astro-chrome` | **`@chirag127/auth-wxt`** (new) | **`@chirag127/auth-vsc`** (new) | **`@chirag127/auth-cli`** (new) | `firebase-rest-firestore` | `@modelcontextprotocol/sdk` OAuth |
| Billing | `razorpay` | `@chirag127/astro-billing` (stub) | open `oriz.in/billing` in browser + license-key paste | same | same | `apps/api/routes/razorpay/` | n/a |
| Analytics | `posthog-js`, `@sentry/*`, `@microsoft/clarity` | `@chirag127/astro-chrome` | `posthog-js` | n/a | `posthog-node` (opt-in) | `@sentry/cloudflare` | n/a |
| Logger | `pino` | folded in `astro-chrome` | `pino` | `vscode.window.createOutputChannel` | `pino` + `pino-pretty` | `console.*` → CF Tail + Better Stack | `pino` to stderr |
| Config | `dotenv`, `zod` | `import.meta.env` + zod | `wxt.config.ts` + `import.meta.env` | `vscode.workspace.getConfiguration` + zod | `dotenv` + zod | `env` binding + zod | `process.env` + zod |
| API client | `hono` (`hc<AppType>`) | `@chirag127/astro-data` | hono client | hono client | hono client | direct fetch | hono client |
| Flags | `firebase/remote-config` | same | same | same | same | REST fetch | same |
| Storage | `unstorage` (unjs) | `unstorage/drivers/localstorage` | `unstorage/drivers/chrome-storage` | `unstorage/drivers/fs` (workspaceStorage) | `unstorage/drivers/fs` | `unstorage/drivers/cloudflare-kv` | `unstorage/drivers/fs` |
| Notifications | `web-push`, FCM, Knock SDK | folded in `astro-chrome` | `chrome.notifications` | `vscode.window.showInformationMessage` | stdout | Resend (email) / Knock (SMS) | stdout |
| Test utils | `vitest`, `msw`, `@playwright/test` | `@chirag127/astro-test-utils` | same | same | same | same | same |

## What this means in code

**Don't:** `pnpm add @chirag127/logger` and use a custom logger wrapper.
**Do:** `pnpm add pino` and import it directly — the same in every surface that has Node-like runtime; for VS Code use the native output channel; for browser the console. The "convention" is the import line, not a wrapper package.

**Don't:** `pnpm add @chirag127/storage` wrapping unstorage.
**Do:** `pnpm add unstorage` and pick the driver per surface. Saves a wrapper package + version-skew risk.

**Don't:** create `@chirag127/billing-vsc` / `@chirag127/billing-cli` / `@chirag127/billing-wxt`. They'd all do the same thing — open `https://oriz.in/billing` in a browser, optionally accept a license key paste.
**Do:** in each surface, ~5 lines of inline code that opens the URL via the surface's native API (`chrome.tabs.create`, `vscode.env.openExternal`, `open` for CLI).

## The 3 new packages we DO build

These earn their existence because the auth flow differs meaningfully per surface and the wrapper hides a multi-step dance:

| Package | What it hides |
|---|---|
| `@chirag127/auth-wxt` | `chrome.identity.launchWebAuthFlow` bouncing through `auth.oriz.in`, ID-token persistence to `chrome.storage.local`, refresh-on-expiry, cross-browser quirks (Firefox uses `browser.identity`, Edge follows Chrome) |
| `@chirag127/auth-vsc` | `vscode.authentication.registerAuthenticationProvider` glue + Firebase ID-token mint via REST + secure-storage via `context.secrets` |
| `@chirag127/auth-cli` | Device-code flow against `auth.oriz.in/device`, token-store at `~/.config/oriz/auth.json`, refresh on `401` from `api.oriz.in` |

## Rejected packages (no longer worth carving)

- `@chirag127/logger-*` — use `pino` directly
- `@chirag127/storage-*` — use `unstorage` directly
- `@chirag127/config-*` — use `dotenv` + `zod` directly
- `@chirag127/api-client-*` — use Hono's `hc<AppType>` directly (already documented in [[hono-rpc-type-sharing]])
- `@chirag127/flags-*` — use `firebase/remote-config` directly
- `@chirag127/analytics-*` — use vendor SDKs directly (posthog-js / @sentry/* / @microsoft/clarity)
- `@chirag127/billing-{wxt,vsc,cli}` — 5-line inline implementation in each consumer
- `@chirag127/notifications-*` — use vendor APIs directly per surface
- `@chirag127/test-utils-*` — `@chirag127/astro-test-utils` already covers the common subset; per-surface tests use the underlying tools directly

## How to apply

- New shared concern arrives: first run `npm view <plausible-name>` and check unjs / community packages. Carve `@chirag127/*` only when no existing wrapper covers it.
- When 3 surfaces duplicate ~20+ lines of glue, that's the threshold for carving. Below that: inline it.
- Auth is the one concern where the glue is non-trivial; the 3 new packages exist for that reason.

## Cross-refs

- The 22 Astro packages → [[the-six-packages]]
- The auth flow → [[cross-site-auth-via-auth-oriz-in]]
- The subscription flow → [[subscription-flow]]
- The package-isolation principle this sharpens → [[package-isolation-rule]]
- The per-runtime framework lock → [[per-runtime-framework]]
