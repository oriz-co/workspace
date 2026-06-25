---
type: decision
title: 'Distribution + queues locked: 3-store browser-ext + dual VS Code marketplace
  + PWA-only + CF Queues + Hookdeck'
description: "Single Batch 13 lock covering distribution + reliability. Browser extensions\
  \ publish to Chrome + Firefox + Edge. VS Code extensions publish to VS Code Marketplace\
  \ + Open VSX (JetBrains walked back). Every site is a PWA via @vite-pwa/astro (Capacitor\
  \ + Tauri walked back). Webhook reliability is Hookdeck \u2192 Cloudflare Queues\
  \ (Trigger.dev walked back). All free, no card."
tags:
- decisions
- architecture
- distribution
- extensions
- vscode
- pwa
- queue
- hookdeck
- batch-13
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/extension-store/chrome-web-store
- services/extension-store/firefox-add-ons
- services/extension-store/edge-add-ons
- services/extension-store/vs-code-marketplace
- services/extension-store/open-vsx-registry
- services/extension-store/index
- services/pwa/vite-pwa-astro
- services/pwa/index
- services/queue/cloudflare-queues
- services/queue/hookdeck
- services/queue/index
- services/tooling/hookdeck
- decisions/branding/repo-naming-suffixes
- decisions/infrastructure/extensions-cross-store-publish
- decisions/infrastructure/hookdeck-for-webhook-reliability
- decisions/architecture/compute/queue-cloudflare-native
- rules/interaction/no-card-on-file
---



# Distribution + queues locked

Single consolidated Batch 13 decision covering four parallel
distribution / reliability picks. All four locks were originally
proposed at wider scope and walked back to the floors below — the
family chose **simplicity over coverage** every time.

## Decision

### 1. Browser extensions: Chrome + Firefox + Edge

Every `oriz-*-ext` repo publishes to **all three** browser stores:

- [Chrome Web Store](../../../services/extension-store/chrome-web-store.md) — $5 one-time dev fee (sunk cost, not a subscription)
- [Firefox Add-ons (AMO)](../../../services/extension-store/firefox-add-ons.md) — free, unlimited
- [Microsoft Edge Add-ons](../../../services/extension-store/edge-add-ons.md) — free, unlimited

CI flow: build once via `web-ext`; submit in parallel to all three.

### 2. VS Code extensions: VS Code Marketplace + Open VSX

Every `oriz-*-vsc-ext` repo dual-publishes:

- [VS Code Marketplace](../../../services/extension-store/vs-code-marketplace.md) — Microsoft's official, free
- [Open VSX Registry](../../../services/extension-store/open-vsx-registry.md) — Eclipse Foundation, required for VSCodium / Cursor / Theia / Gitpod / code-server

CI flow: build once into `.vsix`; `vsce publish` + `ovsx publish`.

### 3. PWA-only on every site

Every site in the family ships as an installable PWA via
[`@vite-pwa/astro`](../../../services/pwa/vite-pwa-astro.md). No native
wrapper. Workbox-generated service worker, manifest, install prompt.

### 4. Webhook reliability: Cloudflare Queues + Hookdeck

The reliability stack is two layers:

- [Hookdeck](../../../services/queue/hookdeck.md) (webhook ingress) — 50K events/mo free, exponential-backoff retries, replay UI
- [Cloudflare Queues](../../../services/queue/cloudflare-queues.md) (fan-out queue) — 1M ops/mo free, native Worker binding

Producers POST to Hookdeck → Hookdeck retries to api.oriz.in
Worker → Worker enqueues onto Cloudflare Queues → consumer Workers
drain.

## Why

All four picks share the same logic: **simplicity over coverage**,
built on the family's already-locked stack, and all free or
one-time-fee.

- Three browser stores reach >99% of extension users; adding a
  fourth (Safari, Opera-native) would gate on Apple Developer
  Program ($99/yr — fights [`no-subscriptions-anywhere`](../../monetisation/no-subscriptions-anywhere.md))
  or duplicate Chromium reach.
- Two VS Code marketplaces reach every VS Code-compatible editor
  (VSCodium, Cursor, Theia, Gitpod, code-server). JetBrains is a
  different IDE family — different artifact format, different
  build, different audience. The family has no JetBrains plugin in
  plan; pre-emptively wiring the publish step would be over-coverage.
- PWA-only means every site is installable today with no Apple
  Developer / Google Play tax, no signing complexity, no
  per-platform binary build. Capacitor and Tauri stay walked back
  unless a hardware / native-only feature need lands.
- CF Queues + Hookdeck stacks two reliability layers from services
  the family already pays $0 for. Trigger.dev's durable-workflow
  model is more powerful but redundant for current webhook volume,
  and adds a new account / credentials surface.

## Implications

- Every extension repo (`-ext` and `-vsc-ext` per
  [`decisions/branding/repo-naming-suffixes.md`](../../branding/repo-naming-suffixes.md))
  carries one CI workflow that publishes to all the stores in its
  flavour's row of the matrix below. Per
  [`decisions/process/per-repo-ci-workflows.md`](../../process/per-repo-ci-workflows.md).
- Every site repo enables `@vite-pwa/astro` via the
  [`@chirag127/oriz-kit`](../../../glossary/o-r/oriz-kit.md) preset; the only per-site
  override is name / icons.
- Every external-webhook producer (Razorpay first; Lemon Squeezy,
  GitHub, others as added) targets a Hookdeck connection URL, not
  api.oriz.in directly.
- All credentials originate at [Doppler](../../../services/secrets/doppler.md)
  and mirror to [GitHub Secrets](../../../services/secrets/github-secrets.md)
  per [`decisions/security/secrets-management-doppler.md`](../../security/secrets-management-doppler.md).
- The earlier
  [`decisions/infrastructure/extensions-cross-store-publish.md`](../../infrastructure/extensions-cross-store-publish.md)
  (Batch 1) and
  [`decisions/infrastructure/hookdeck-for-webhook-reliability.md`](../../infrastructure/hookdeck-for-webhook-reliability.md)
  (Batch 4) and
  [`decisions/architecture/queue-cloudflare-native.md`](./queue-cloudflare-native.md)
  (Batch 8) are NOT superseded — they remain in force; this Batch
  13 lock consolidates them with the new VS Code + PWA + Hookdeck-as-ingress
  facets and records the walked-back alternatives.

## Publish + reliability matrix

| Surface | Targets (active) | Walked back |
|---|---|---|
| Browser extension (`oriz-*-ext`) | Chrome Web Store + Firefox AMO + Edge Add-ons | Safari (Apple Developer fee), standalone Opera |
| VS Code extension (`oriz-*-vsc-ext`) | VS Code Marketplace + Open VSX | JetBrains Marketplace |
| Site (`oriz-*-site`) | PWA via `@vite-pwa/astro` | Capacitor, Tauri, TWA |
| Webhook reliability | Hookdeck (ingress) → Cloudflare Queues (fan-out) | Trigger.dev (durable workflows) |

## Walked back — why simplicity over coverage

| Walked back | Originally proposed for | Why walked back |
|---|---|---|
| **JetBrains Marketplace** | VS Code distribution trio | Different IDE family entirely (Gradle build, JetBrains Platform SDK, separate audience). Family has no JetBrains plugin in plan; adding the publish target pre-emptively is dead code. Re-open if a JetBrains plugin is ever greenlit — likely under a `-jb-ext` suffix added to [`repo-naming-suffixes.md`](../../branding/repo-naming-suffixes.md). |
| **Capacitor** | Native PWA wrapper, parallel to vite-pwa | iOS publish requires Apple Developer Program at $99/yr, conflicts with [`no-subscriptions-anywhere`](../../monetisation/no-subscriptions-anywhere.md). Android publish doable free but adds a per-app binary, signing, Play Store review. PWA install on Android already covers the install-icon use case. |
| **Tauri** | Native PWA wrapper, parallel to vite-pwa | Adds a Rust toolchain + WebView dependency for zero gain over PWA on the surface the family targets (web). Re-open only if a desktop-native feature lands (system tray, native-menubar, native-FS) that PWA APIs can't express. |
| **Trigger.dev** | Durable-workflow queue alternative to CF Queues | Powerful programming model (code-defined multi-step workflows with checkpointed state) but overkill for current webhook volume. Adds a separate account, credentials surface, and hosting dependency. CF Queues + Hookdeck covers the same reliability surface inside the family's existing stack. Re-open if multi-step durable workflows become a real need (the [`queue/inngest.md`](../../../services/queue/inngest.md) entry covers the same swap-target shape). |

The shape of every walked-back item is the same: marginal coverage
gain at the cost of a new credentials surface, a paid tier, or a
build-toolchain dependency. The family stays small, the stack stays
on Cloudflare, and re-opening any of these is a one-decision flip
when a real need surfaces.

## Cross-refs

- [Repo naming suffixes — `-ext` / `-vsc-ext`](../../branding/repo-naming-suffixes.md)
- [Earlier cross-store browser-ext decision (Batch 1)](../../infrastructure/extensions-cross-store-publish.md)
- [Earlier Hookdeck-for-Razorpay decision (Batch 4)](../../infrastructure/hookdeck-for-webhook-reliability.md)
- [Earlier CF Queues primary decision (Batch 8)](./queue-cloudflare-native.md)
- [Chrome extensions as submodules](../../infrastructure/chrome-extensions-as-submodules.md)
- [Per-extension privacy policy](../../content/per-extension-privacy-policy.md)
- [Per-repo CI workflows](../../process/per-repo-ci-workflows.md)
- [Cloudflare Pages for all sites](../../infrastructure/cloudflare-pages-for-all-sites.md)
- [oriz-ui split into 5 packages](../oriz-ui-split-into-5-packages.md)
- [No subscriptions anywhere](../../monetisation/no-subscriptions-anywhere.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
- [services/extension-store/index.md](../../../services/extension-store/index.md)
- [services/pwa/index.md](../../../services/pwa/index.md)
- [services/queue/index.md](../../../services/queue/index.md)
