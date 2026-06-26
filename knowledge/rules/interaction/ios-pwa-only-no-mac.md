---
type: rule
title: "iOS is PWA-only — user has no Mac"
description: "User has no Apple devices and cannot test iOS apps. iOS support is always PWA-only via Safari \"Add to Home Screen\". Never propose Apple Developer Program ($99/yr) or App Store distribution unless this changes."
tags: [user-identity, ios, pwa, distribution]
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
---

User stated directly 2026-06-21: "I also don't [have] Apple devices, so apps, apps. But that is not possible for me."

**Why this matters:** A lot of cross-platform tooling defaults to including iOS (Capacitor, Flutter, React Native, Tauri mobile). Proposing any iOS-publish path costs the user time to reject. Default iOS handling = generate PWA + leave the XCode project unbuilt/unpublished if PWABuilder emits one.

**How to apply:**
- Distribution proposals: write "iOS — PWA only" without asking.
- Cross-platform plans: list Android + Windows + Linux + web; mention iOS only as "PWA via Safari".
- Never spec features that require an iOS-only API (HealthKit, HomeKit, iMessage extensions, App Clips).
- If user explicitly asks "what about iPad / iOS?", answer with PWA install steps; never with App Store.

Reverses if user acquires an Apple device or asks for iOS support explicitly.

Related: [`pwabuilder-primary-converter`](../agent/preferences/pwabuilder-primary-converter.md), [`no-card-on-file-prepaid-escape`](./no-card-on-file-prepaid-escape.md).
