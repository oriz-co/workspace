---
type: index
title: "oriz family knowledge bundle"
description: "The canonical home for every durable rule, decision, service pick, design brief, runbook, and policy across the oriz family. Read this first."
tags: [okf, index, family]
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
---

# oriz family knowledge bundle

This is the canonical knowledge bundle for the `oriz-org/workspace`
family (renamed from `chirag127/oriz` 2026-06-22, then `oriz-co/workspace`
→ `oriz-org/workspace` 2026-06-24 — see
[`decisions/branding/oriz-org-rename-from-co`](./decisions/branding/oriz-org-rename-from-co.md)).
Format: [Open Knowledge Format v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md),
published 2026-06-13 by Google Cloud.

The pre-OKF state of this content lived in `AGENTS.md` and
`design-briefs/` at the repo root. Those locations are now thin pointers
back here. **This bundle is the single source of truth — if AGENTS.md
or any per-site file disagrees with a concept here, the concept here
wins.**

If you're an agent reading this for the first time, start with:

1. [`_okf.md`](./_okf.md) — the conventions every concept file follows + the code-editing workflow
2. [`rules/index.md`](./rules/index.md) — the 5 non-negotiable rules
3. [`decisions/index.md`](./decisions/index.md) — chronological log of locked decisions
4. The relevant subdirectory below for the topic you care about

## What lives here

| Directory | What's in it | Files |
|---|---|---|
| [`rules/`](./rules/) | Non-negotiable family-wide constraints | 63 |
| [`decisions/`](./decisions/) | Architectural / naming / stack decisions, chronological | 195 |
| [`services/`](./services/) | One file per external service: role, free tier, alternative, swap cost | 203 |
| [`architecture/`](./architecture/) | The 5-layer stack, API umbrella, canonical store, repo layout | 22 |
| [`design/`](./design/) | v2 design briefs per site + family design rules | 12 |
| [`policy/`](./policy/) | Age-gating, public/private line, monetisation, ingester contract, etc. | 12 |
| [`runbooks/`](./runbooks/) | Step-by-step actionable sequences (auth setup, add a site, etc.) | 36 |
| [`glossary/`](./glossary/) | Definitions of family-specific terms | 33 |

**Total: ~591 concept files** + root files (`_okf.md`, `_navigation.md`, this file).

(Counts as of 2026-06-24 via `find knowledge -type f -name '*.md' | wc -l` per category.)

Hierarchy depth: `knowledge/<area>/<file>.md` — never deeper unless folder exceeds 15 files. Depth rules in `_okf.md`.

## Agent entry points

These root files each point AI agents to this bundle:

| File | Agent |
|---|---|
| [`../AGENTS.md`](../AGENTS.md) | Generic (Cursor, Cline, Aider, any agent) — primary entry point with full OKF spec |
| [`../CLAUDE.md`](../CLAUDE.md) | Claude Code |
| [`../GEMINI.md`](../GEMINI.md) | Gemini / Antigravity |
| [`../COPILOT.md`](../COPILOT.md) | GitHub Copilot |
| [`../CURSOR.md`](../CURSOR.md) | Cursor |
| [`../AIDER.md`](../AIDER.md) | Aider |
| [`../knowledge.md`](../knowledge.md) | Root redirect for flat knowledge.md queries |

All of those files are thin pointers. **No rules or decisions live in them** — everything durable is here.

## Per-site knowledge

Per-app knowledge lives INSIDE each app submodule under its own `knowledge/` folder (OKF-light: `index.md` + `decisions/` + `runbooks/` + `services/`). Same OKF contract as this family bundle, just scoped to one app. The deprecated master `knowledge/sites/<app>/` location is NOT used.

Richest example of a per-app bundle:

- [`projects/chirag127/own/products/apps/personal/cs-me-app/knowledge/`](../projects/chirag127/own/products/apps/personal/cs-me-app/knowledge/) — lifestream + 100-year strategy + age-gating + ingester contract (lives inside the cs-me-app submodule; moved from oriz-org → chirag127 on 2026-06-24, slug dropped the `oriz-` prefix)

## Update protocol

Every architectural decision the user makes in chat must land here in
the same conversation. See [`_okf.md`](./_okf.md) §"Update protocol"
for the full rule.

## Format version

OKF v0.1, adopted 2026-06-20 (format published 2026-06-13). When the
spec evolves, [`_okf.md`](./_okf.md) §"When the spec moves" describes
the migration protocol.
