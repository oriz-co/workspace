---
type: index
title: "oriz family knowledge bundle"
description: "The canonical home for every durable rule, decision, service pick, design brief, runbook, and policy across the oriz family. Read this first."
tags: [okf, index, family]
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
---

# oriz family knowledge bundle

This is the canonical knowledge bundle for the chirag127/oriz family
of websites and Chrome extensions. Format: [Open Knowledge Format
v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md).

The pre-OKF state of this content lived in `AGENTS.md` and
`design-briefs/` at the repo root. Those locations are now thin pointers
back here. **This bundle is the single source of truth — if AGENTS.md
or any per-site file disagrees with a concept here, the concept here
wins.**

If you're an agent reading this for the first time, start with:

1. [`_okf.md`](./_okf.md) — the conventions every concept file follows
2. [`rules/index.md`](./rules/index.md) — the 5 non-negotiable rules
3. [`decisions/index.md`](./decisions/index.md) — chronological log of locked decisions
4. The relevant subdirectory below for the topic you care about

## What lives here

| Directory | What's in it | Files |
|---|---|---|
| [`rules/`](./rules/) | Non-negotiable family-wide constraints | 12 |
| [`decisions/`](./decisions/) | Architectural / naming / stack decisions, chronological | 38 |
| [`services/`](./services/) | One file per external service: role, free tier, alternative, swap cost | 49 |
| [`architecture/`](./architecture/) | The 5-layer stack, API umbrella, canonical store, repo layout | 21 |
| [`design/`](./design/) | v2 design briefs per site + family design rules | 14 |
| [`policy/`](./policy/) | Age-gating, public/private line, monetisation, ingester contract, etc. | 11 |
| [`runbooks/`](./runbooks/) | Step-by-step actionable sequences (auth setup, add a site, etc.) | 4 |
| [`glossary/`](./glossary/) | Definitions of family-specific terms | 28 |
| [`sites/`](./sites/) | Per-site bundles (concepts that only apply to one site) | varies |

**Total: 164 concept files + 3 root files (`_okf.md`, this file, `log.md`).**

Hierarchy depth: `knowledge/<area>/<file>.md` — never deeper. This
limit is enforced in `_okf.md`'s convention rules.

## Per-site knowledge

Per-app knowledge lives INSIDE each app submodule under its own `knowledge/` folder (OKF-light: `index.md` + `decisions/` + `runbooks/` + `services/`). Same OKF contract as this family bundle, just scoped to one app. The deprecated master `knowledge/sites/<app>/` location is NOT used.

Richest example of a per-app bundle:

- [`projects/apps/personal/oriz-cs-me-app/knowledge/`](../projects/apps/personal/oriz-cs-me-app/knowledge/) — lifestream + 100-year strategy + age-gating + ingester contract (lives inside the oriz-cs-me-app submodule)

## Update protocol

Every architectural decision the user makes in chat must land here in
the same conversation. See [`_okf.md`](./_okf.md) §"Update protocol"
for the full rule.

## Format version

OKF v0.1, adopted 2026-06-20 (format published 2026-06-13). When the
spec evolves, [`_okf.md`](./_okf.md) §"When the spec moves" describes
the migration protocol.
