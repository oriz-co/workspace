---
type: rule
title: "Linux/Ubuntu only on CI runners \u2014 never Windows or macOS"
description: "Every CI workflow in every chirag127/oriz* repo runs on Linux/Ubuntu\
  \ runners. macOS and Windows runners are forbidden unless explicitly justified for\
  \ native build that can't be done another way. PWABuilder handles all native packaging\
  \ from a Linux runner via the deployed PWA URL \u2014 no macOS/Windows runner needed."
tags:
- rule
- ci
- linux
- runners
- cost
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- rules/interaction/never-hit-quotas
- rules/interaction/no-card-on-file
- decisions/architecture/frontend/pwabuilder-as-primary-converter
- services/easy-free-tier
---



# Linux/Ubuntu only on CI runners

## The rule

Every `.github/workflows/*.yml` in every chirag127/oriz* repo uses `runs-on: ubuntu-latest` (or `ubuntu-22.04` / `ubuntu-24.04` when pinning matters). **`runs-on: macos-*` and `runs-on: windows-*` are forbidden** unless one of the explicit exceptions below holds.

## Why

GitHub Actions billing for free public-repo minutes is **uniform on Linux but 10× on macOS and 2× on Windows**:

- Linux: 1× multiplier (effectively free for public repos)
- Windows: 2× multiplier
- macOS: 10× multiplier

Even when minutes are notionally "free for public repos," the family's [[never-hit-quotas]] rule applies: we architect for headroom, not survival. A single matrix that runs on `[ubuntu, macos, windows]` consumes 13× the budget of pure Linux. Switching one tool app's CI from `ubuntu-latest` to `[ubuntu-latest, macos-latest, windows-latest]` triples the runtime + 13×s the cost basis.

## Exceptions

A workflow MAY use a non-Linux runner ONLY when:

1. **Native build for macOS / iOS** — requires Xcode. NOT in family scope (per [[ios-pwa-only-no-mac]]).
2. **Native build for Windows MSIX signing** — requires Windows runner for `signtool.exe`. NOT in family scope (PWABuilder handles MSIX from any platform; signing is skipped per [[pwabuilder-as-primary-converter]]).
3. **Cross-platform testing of a CLI** that targets all three OSes natively. The family's CLIs are Node.js + npm bin, which run identically on any OS — so even this exception doesn't apply.

In practice: **no workflow in the family should use macOS or Windows.** If you find one, that's a bug — convert it to `ubuntu-latest`.

## How to enforce

- Master cron lints every submodule's `.github/workflows/*.yml` weekly via `actionlint` + a custom grep for `runs-on: (macos|windows)`. Any hit opens an issue in that repo.
- New workflow templates in `templates/per-site-ci/.github/workflows/` only ship Linux variants.
- Subagent prompts for scaffolding test/CI workflows always specify `ubuntu-latest`.

## Workarounds for things that "feel like" they need macOS/Windows

- **PWA → APK/MSIX**: PWABuilder runs in any browser or via CLI on Linux. No macOS/Windows needed.
- **Cross-browser E2E**: Playwright on Linux runners boots Chromium + WebKit + Firefox via system-installed deps. Sufficient.
- **Visual regression**: Chromatic, Argos CI, Playwright `toHaveScreenshot()` all run on Linux.
- **iOS-specific**: family is PWA-only on iOS per [[ios-pwa-only-no-mac]]. No iOS testing or building.
- **Windows-specific**: only the EXE installer signing requires Windows, and the family explicitly skips code-signing per [[pwabuilder-as-primary-converter]] §"No code-signing on Windows."

## Cross-refs

- The never-hit-quotas principle → [[never-hit-quotas]]
- The no-card rule → [[no-card-on-file]]
- The PWABuilder lock that eliminates the macOS-Xcode dependency → [[pwabuilder-as-primary-converter]]
- The iOS PWA-only memory → [[ios-pwa-only-no-mac]] (memory file)
