---
type: rule
title: 'Astro version pin: major in package.json, auto-update minors weekly'
description: Every package.json across the family pins Astro at the current major
  via caret. Minors+patches auto-update weekly. Major upgrades happen via single workspace-wide
  PR.
tags:
- rules
- astro
- dependencies
- versioning
- pnpm
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- rules/development/always-latest-deps
- decisions/architecture/general/per-runtime-framework
- decisions/architecture/stack/family-stack-lock
---



# Astro version pin

## The rule

Every `package.json` pins Astro at the current major via caret (`"astro": "^6.0.0"`).
Minors + patches update automatically via the weekly `pnpm update --latest --recursive`
cron. Majors (Astro 6 → 7) ship via a single workspace-wide PR touching all
25+ repos at once.

## Companion runtime pins

Same caret-on-major rule applies family-wide:

| Runtime | Package | Pin |
|---|---|---|
| Sites | astro | `^6.0.0` |
| Sites | react / react-dom | `^19.0.0` |
| Sites | tailwindcss / @tailwindcss/vite | `^4.0.0` |
| Extensions | wxt | `^0.20.0` |
| VSC ext | esbuild | `^0.24.0` |
| CLI / MCP | tsup | `^8.0.0` |
| Node runtime | (target) | `>= 22.0.0` |
| Package mgr | pnpm | `^10.0.0` |
| Linter | @biomejs/biome | `^2.0.0` |

## Why

- **Drift kills reuse** — caret on major guarantees `@chirag127/astro-shell` works in every site.
- **Minor/patch safe to auto-update** per semver — weekly cron keeps family fresh.
- **Majors NOT safe** — Astro 5→6 changed adapter APIs + collection schemas. All-or-nothing via one PR.

## How to apply

Weekly automation (GH Actions cron at workspace root):
```yaml
- run: pnpm update --latest --recursive
```

Major upgrade flow (when Astro 7 ships):
1. Wait 4 weeks after stable for ecosystem to catch up
2. Single PR on `chirag127/workspace` updates every submodule
3. CI runs `pnpm install` + `pnpm build` across every submodule
4. Land all-at-once on green

## When NOT to apply

- Beta-track Astro (`astro@beta`) never used in family
- Browser-extension repos may pin specific Chrome/Firefox API surface — exceptions in per-repo `package.json` with comment
