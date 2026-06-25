---
type: decision
title: Frontend default stack — Astro + React islands + Tailwind + shadcn/ui
description: Locked 2026-06-25. Every app starts on the default stack — Astro shell, React for interactive islands, Tailwind for styling, shadcn/ui for components. Per-repo design pass (frontend-design skill) sets the palette, typography, and signature touches; the stack stays uniform underneath.
tags:
- decision
- frontend
- stack
- astro
- react
- tailwind
- shadcn
- design-system
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
related:
- decisions/architecture/packages/five-shared-npm-packages-2026-06-25
- decisions/architecture/apps/fleet-strategy-build-gate-2026-06-25
- decisions/architecture/frontend/final-per-app-visual-shared-behavior
---

# Frontend default stack — Astro + React + Tailwind + shadcn/ui

## Decision

Every new repo defaults to: **Astro** as the shell (zero-JS by default, fast static output), **React** for interactive islands only, **Tailwind** for utility styling, **shadcn/ui** as the component baseline. Each repo runs a `frontend-design` skill pass to set its palette, type scale, and one or two signature visual touches; underneath, the stack is identical across the fleet.

## Why

- **Astro shell** ships the smallest JS bundle by default — perfect for landing pages and tool surfaces where most pixels are static.
- **React for islands** keeps the developer-pool deep; every contributor / agent knows React.
- **Tailwind** removes the per-app CSS-naming bikeshed and pairs cleanly with shadcn/ui copy-paste components.
- **shadcn/ui** is copy-into-repo, not a runtime dependency — no version lock, no upstream-break risk.
- **Per-repo design pass** prevents the family from looking like a single template farm. Palette + type + signature touch = recognisable, but the chrome (header / footer / widget slots) stays uniform.
- **Uniform stack = uniform tooling** — same Vite config, same Tailwind config, same lint rules, same `@oriz/ui` import path.

## Implications

- The `frontend-design` skill runs on every new repo before the first commit beyond scaffolding.
- `@oriz/ui` (shared package) wraps shadcn primitives with family defaults; per-repo overrides are explicit.
- React Server Components are NOT on the table — Astro islands cover the SSR-interactive seam without RSC complexity.
- Replaces ad-hoc "Astro + SvelteKit + per-runtime framework" tolerance from earlier decisions — Svelte is out as a default; can still be used in a one-off repo if a clear reason exists.
- shadcn/ui's headless-Radix base makes a11y gates (WCAG 2.2 AA, LH ≥ 95 a11y) easier to hit.
- Per-app dark+light theme toggle lives in `@oriz/ui` — one implementation, every app inherits it.
