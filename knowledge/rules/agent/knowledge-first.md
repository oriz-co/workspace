---
type: rule
title: "Knowledge-first \u2014 no README \u2194 knowledge duplication; per-app knowledge\
  \ in submodules"
description: 'Durable info goes in knowledge/ first. README is entry-point only. If
  info is in knowledge/, it''s NOT also in README, and vice versa. Per-app knowledge
  lives in each submodule''s own knowledge/ (OKF-light: index.md + decisions/ + runbooks/
  + services/). Cross-cutting knowledge stays at master knowledge/. Master knowledge/sites/<app>/
  is NOT used for app-specifics.'
tags:
- rule
- knowledge
- no-duplication
- per-app
- okf
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- rules/agent/keep-knowledge-fresh
- rules/agent/grill-to-knowledge
---



# Knowledge-first + no README ↔ knowledge duplication

## The rule

1. **Durable info goes in `knowledge/` first.** README is entry-point only.
2. **No duplication.** If info is in `knowledge/`, it's NOT also in README. If it's in README, it's NOT also in knowledge.
3. **Per-app knowledge lives IN each submodule** as OKF-light: `index.md` + `decisions/` + `runbooks/` + `services/`.
4. **Cross-cutting knowledge stays at master** `knowledge/`.
5. **Master `knowledge/sites/<app>/` is NOT used** for app-specifics. That location is deprecated.

## Why

Two sources of the same fact drift apart. Drift becomes silent rot. The OKF format + per-app submodule pattern keeps every fact at exactly one location.

## How to apply

- New piece of durable info: write it as a concept file under master `knowledge/` (rule/decision/service/runbook/policy/architecture) OR under the relevant submodule's `knowledge/` if it's app-specific.
- READMEs link to knowledge files, never restate them.
- When adding a new app submodule, scaffold its `knowledge/` with OKF-light shape immediately.

## Cross-refs

- Keep-knowledge-fresh sibling → [[rules/keep-knowledge-fresh]]
- Grill-to-knowledge sibling → [[rules/grill-to-knowledge]]
