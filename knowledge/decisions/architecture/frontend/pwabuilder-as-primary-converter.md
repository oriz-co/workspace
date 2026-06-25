---
type: decision
title: "PWABuilder is the primary PWA\u2192native converter; Tauri optional"
description: Every Astro app's PWA build is the source of truth. PWABuilder (free,
  Microsoft-hosted, CLI available) converts the PWA into Android AAB + Windows MSIX
  without per-app native code. Tauri stays available as opt-in for apps that want
  auto-update + smaller binaries. iOS is PWA-only (no Apple Developer Program, no
  test devices). Bubblewrap, Capacitor, Cordova all rejected.
tags:
- architecture
- distribution
- pwa
- pwabuilder
- tauri
- stores
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/compute/distribution-and-queues-locked
- architecture/packages/the-23-packages
- runbooks/operations/build-distributable
- rules/interaction/no-card-on-file
- rules/interaction/linux-ci-only
---



# PWABuilder is the primary PWA→native converter; Tauri optional

## Decision

Every Astro app in the family ships as a PWA first. Native packages are generated from that PWA — never hand-written native code:

- **Primary**: [PWABuilder](https://pwabuilder.com) — Microsoft's free hosted service + CLI. Point it at `<brand>.oriz.in`, get Android AAB (Play Store), Windows MSIX (Microsoft Store), iOS XCode project. Free, no card. Bubblewrap runs under PWABuilder's hood for the AAB.
- **Optional (per-app)**: [Tauri v2](https://tauri.app) for apps that need auto-update or a smaller desktop binary (~5 MB Tauri vs ~150 MB MSIX-installed). Requires Rust toolchain at build time.

Distribution channels (locked):

- **Google Play Store** ($25 one-time fee, prepaid via PayPal balance — fits the [no-card-on-file](../../../rules/interaction/no-card-on-file.md) "one-time prepaid" escape hatch already used by Chrome Web Store $5). AAB from PWABuilder.
- **Microsoft Store** (free for developer account). MSIX from PWABuilder.
- **Chrome Web Store** ($5 one-time, prepaid — for browser extensions only, not apps; separate `*-ext` repos).
- **Direct sideload** from `<brand>.oriz.in/download` — APK + EXE + dmg + AppImage for users who avoid stores.
- **iOS — PWA only**. Safari's "Add to Home Screen" installs the PWA. No App Store presence (Apple Developer Program $99/yr violates no-card; no Mac to test). XCode project from PWABuilder is generated but never published — kept as a slug-reservation artefact if iOS becomes viable.

No code signing on Windows (lean on PWA route to avoid SmartScreen entirely; the EXE side is for power users who accept first-time warnings). No macOS signing (no Apple Developer Program). Linux unsigned (no convention).

## Why

PWABuilder collapses the per-app distribution surface to zero: there is no per-app `src-tauri/`, no per-app `android/`, no per-app `xcode/`. The PWA manifest emitted by `astro-pwa` is the entire input; native packages are downloaded outputs.

PWABuilder is free, hosted by Microsoft (alignment with Microsoft Store distribution), and has a CLI suitable for CI (`pwabuilder package --platform <android|windows|ios|macos>`). Bubblewrap (Google's tool) is what PWABuilder runs internally for Android — using PWABuilder gives both Android AAB + Windows MSIX from one tool instead of two.

Tauri stays available as an opt-in escape hatch because PWABuilder MSIX binaries are larger and don't support auto-update. Apps that ship frequently or care about install size can switch to Tauri per-app without affecting the rest of the family.

## Implications

- `@chirag127/astro-distribute` becomes a thin CLI wrapping PWABuilder CLI + (optional) Tauri. Both routes share the same `dist/` PWA build. See [the-23-packages.md](../../../architecture/packages/the-23-packages.md).
- `astro-pwa` emits the manifest + service worker that PWABuilder reads — no per-app PWABuilder config needed.
- CI workflow per app: `pnpm build` → `pnpm astro-distribute build` → uploads AAB/MSIX/APK/EXE to GitHub Releases. Stores publish manually from the release artefact (no API push — Play Console + Microsoft Partner Center don't reliably support unattended uploads on free tiers).
- The runbook [build-distributable.md](../../../runbooks/operations/build-distributable.md) is updated to reflect PWABuilder primary + Tauri optional.
- Family rule [`rules/no-card-on-file.md`](../../../rules/interaction/no-card-on-file.md) gets an inline note that "one-time prepaid store fees" (Play $25, CWS $5) are the only exceptions, and only when paid via prepaid PayPal balance.

## Rejected

- **Bubblewrap directly** — PWABuilder runs it internally; using PWABuilder gives MSIX too for the same effort.
- **Capacitor** — needs a per-app Capacitor project, defeats the "no per-app native code" rule.
- **Cordova** — deprecated by its maintainers.
- **Electron** — desktop only, much larger binaries than Tauri, and ships Chromium so PWA → Electron is double-counting the browser.
- **Apple App Store / iOS** — $99/yr Apple Developer Program violates [no-card-on-file](../../../rules/interaction/no-card-on-file.md) recurring-cost rule; no Apple devices to test on.

## Cross-refs

- The 17 Packages (umbrella) → [../../architecture/the-23-packages.md](../../../architecture/packages/the-23-packages.md)
- The build runbook → [../../runbooks/build-distributable.md](../../../runbooks/operations/build-distributable.md)
- The previous distribution lock (PWA + Bubblewrap + Tauri) → [distribution-and-queues-locked.md](../compute/distribution-and-queues-locked.md) — superseded in scope by this file (Tauri demoted to optional, Bubblewrap replaced by PWABuilder)
- The cost discipline this fits → [`rules/no-card-on-file.md`](../../../rules/interaction/no-card-on-file.md)
- The Linux-only CI rule that depends on PWABuilder eliminating macOS/Xcode → [`rules/linux-ci-only.md`](../../../rules/interaction/linux-ci-only.md)
