---
type: runbook
title: Build PWA + Android AAB/APK + Windows MSIX + desktop EXE from one app
description: "One command per app emits all distributables \u2014 PWA on Cloudflare\
  \ Pages, native packages via PWABuilder (Android AAB, Windows MSIX) or optional\
  \ Tauri (EXE/dmg/AppImage). No per-app native code; PWA is the source of truth."
tags:
- runbook
- distribute
- pwa
- pwabuilder
- tauri
- aab
- msix
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- architecture/packages/the-23-packages
- decisions/architecture/frontend/pwabuilder-as-primary-converter
- decisions/architecture/compute/distribution-and-queues-locked
- services/pwa/vite-pwa-astro
---



# Build PWA + Android AAB/APK + Windows MSIX + desktop EXE from one app

## When to use

You have an app under `repos/oriz/own/prod/apps/**/<brand>-app/` and you want it distributed as a PWA + Android app (Play Store or sideload APK) + Windows app (Microsoft Store or sideload MSIX) + optional desktop EXE/dmg/AppImage from the same source. iOS is PWA-only; no App Store path. See [decisions/architecture/pwabuilder-as-primary-converter.md](../../decisions/architecture/frontend/pwabuilder-as-primary-converter.md) for the rationale.

## Prerequisites

- App already builds with `pnpm build` (Astro 6 + astro-shell + astro-chrome)
- `@chirag127/astro-pwa` integration added to `astro.config.ts` (this is what makes the build a valid PWA — manifest + service worker + icons)
- `@chirag127/astro-distribute` listed as a dev dependency
- The PWA is reachable at `<brand>.oriz.in` (PWABuilder fetches it remotely, not from local `dist/`)
- For Play Store publish: $25 one-time Google Play Developer fee (prepaid via PayPal balance per [no-card-on-file](../../rules/interaction/no-card-on-file.md) escape hatch)
- For Microsoft Store publish: free Microsoft Partner Center account (no fee)
- For optional Tauri route only: Rust toolchain installed locally or on CI runners

## The single command

```bash
cd repos/oriz/own/prod/apps/<category>/<brand>-app
pnpm build                            # Astro → dist/ (this IS the PWA)
pnpm astro-distribute build           # PWABuilder fetches <brand>.oriz.in, emits packages
```

Default emits PWABuilder packages only:

```text
dist/                          ← PWA, deployed by CF Pages workflow
dist-native/<brand>.aab        ← Android App Bundle (Play Store)
dist-native/<brand>.apk        ← Android sideload APK
dist-native/<brand>.msix       ← Windows MSIX (Microsoft Store + sideload)
dist-native/<brand>-ios/       ← iOS XCode project (slug-reserved, NOT published)
```

Opt-in Tauri route (smaller binaries + auto-update, costs Rust toolchain at build):

```bash
pnpm astro-distribute build --tauri   # adds Tauri outputs
# → dist-native/<brand>-setup.exe (NSIS), .dmg, .AppImage
```

## What each path does

### PWA (already there)

`@chirag127/astro-pwa` registers `@vite-pwa/astro` with the manifest fed from astro-chrome's brand config. `pnpm build` IS the PWA build. Cloudflare Pages deploys `dist/` per [cloudflare-pages-only.md](../../rules/infrastructure/cloudflare-pages-only.md).

### PWABuilder route (primary)

`astro-distribute` invokes the PWABuilder CLI:

```bash
pwabuilder package --url https://<brand>.oriz.in --platform android --output dist-native/
pwabuilder package --url https://<brand>.oriz.in --platform windows --output dist-native/
pwabuilder package --url https://<brand>.oriz.in --platform ios     --output dist-native/   # slug-reserved
```

PWABuilder reads the deployed PWA manifest, generates a Trusted Web Activity for Android (via Bubblewrap), an MSIX for Windows, an XCode project for iOS. Digital Asset Links (`/.well-known/assetlinks.json`) are emitted into `dist/` automatically.

- The PWA must be deployed BEFORE `astro-distribute build` runs — PWABuilder fetches it over HTTPS, not from local disk. Deploy first, package second.
- AAB vs APK: PWABuilder emits AAB by default (required for Play Store since 2021). Pass `--apk` for sideload APK.
- iOS XCode project is generated but never opened or published — kept as artefact in case iOS becomes viable later.

### Tauri route (optional)

When `--tauri` is passed, `astro-distribute` ALSO wraps `dist/` in a Tauri v2 shell:

- Windows: `dist-native/<brand>-setup.exe` (NSIS, ~5 MB)
- macOS: `dist-native/<brand>.dmg` (unsigned — right-click to open)
- Linux: `dist-native/<brand>.AppImage`

Tauri offers auto-update via its built-in updater pointing at `https://updates.oriz.in/<brand>/`. Use this route for apps that ship weekly or where the MSIX install size matters.

### What is NOT emitted

- **No iOS .ipa**. PWABuilder generates the XCode project but signing + publishing needs an Apple Developer Program account ($99/yr — violates [no-card-on-file](../../rules/interaction/no-card-on-file.md) and we have no Mac to test on). iOS users install the PWA via Safari's "Add to Home Screen".
- **No code-signing on Windows**. The MSIX is signed by Microsoft Store on publish; the sideload MSIX + Tauri EXE will show SmartScreen on first run for ~3000 users until reputation builds.
- **No macOS dmg signing**. No Apple Developer Program.

## Wiring it into CI

Per-app `.github/workflows/build-distributables.yml`:

```yaml
name: Build distributables
on:
  push:
    tags: ['v*']
jobs:
  pwa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install
      - run: pnpm build
      - run: pnpm wrangler pages deploy dist --project-name "<brand>-app"
  native:
    needs: pwa
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install
      - run: pnpm astro-distribute build              # PWABuilder fetches <brand>.oriz.in
      - uses: softprops/action-gh-release@v2
        with:
          files: dist-native/*
```

Publish to Play Console / Microsoft Partner Center is **manual** — download the AAB / MSIX from the GitHub Release and upload via each store's web UI. Both stores' APIs are gated behind credentials that don't fit the unattended-CI model on free tiers.

## Verify

After `pnpm astro-distribute build`:

- `dist/manifest.webmanifest` exists and lists icons + start URL + scope
- `dist/.well-known/assetlinks.json` exists (TWA on Android needs this)
- `dist-native/*.aab` opens in `bundletool` and installs on a connected Android device via `bundletool install-apks`
- `dist-native/*.msix` installs on Windows via `Add-AppxPackage`
- The installed app on Android / Windows shows chrome-less (no browser address bar) when launched against the deployed PWA domain

## Time budget

- First-time setup per app (add `astro-pwa` + `astro-distribute` to package.json): ~3 min
- Every build after: one `pnpm astro-distribute build` command — PWABuilder ~60 s per platform, Tauri ~90 s per OS in parallel
