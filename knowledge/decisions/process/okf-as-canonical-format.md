---
type: decision
title: "OKF v0.1 is the canonical format for all family knowledge"
description: "Adopt the Open Knowledge Format v0.1 for every concept file in the oriz family knowledge bundles, master + per-site."
tags: [okf, knowledge, convention, format]
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
  - rules/self-update-rule
  - decisions/content/100-year-strategy-locked
  - runbooks/add-new-decision
---

# OKF v0.1 is the canonical format for all family knowledge

## Decision

Every concept file in `oriz/knowledge/` and in each submodule's
`knowledge/` directory follows OKF v0.1 — one concept per file, plain
markdown body, YAML frontmatter with `type` / `title` / `description`
/ `tags` / `timestamp`, kebab-case filenames, max 3-level hierarchy.

## Why

OKF is producer/consumer-independent: any LLM-backed agent can read
it without bespoke tooling, and the user can read it with any
markdown editor. It also has a Google Cloud-published static
visualizer and an emerging consumer ecosystem, which is the
strongest 100-year-bet currently available for durable agent-readable
docs. Picking it once across the whole family avoids a per-repo
re-litigation each time we open a new submodule.

## Implications

- Family-wide conventions live in [`../../_okf.md`](../../_okf.md); every other concept file references it implicitly.
- Per-site `knowledge/` bundles follow the same shape with site-specific concepts only; cross-link to family-wide concepts via relative paths.
- The 12 allowed `type` values (`convention`, `rule`, `decision`, `service`, `runbook`, `design-brief`, `architecture`, `policy`, `schema`, `process`, `glossary`, `index`, `log`) are the closed taxonomy — extend deliberately.
- New decisions get a file under `knowledge/decisions/`, NOT a section embedded in AGENTS.md.
- When the spec hits 1.0 we run a frontmatter audit; until then prefer additive frontmatter changes over structural ones.

## Cross-refs

- [Format conventions (`_okf.md`)](../../_okf.md)
- [Self-update rule](../../rules/self-update-rule.md)
- [Knowledge bundle index](../../index.md)
- [Add-new-decision runbook](../../runbooks/add-new-decision.md) — the operational workflow that enforces this format
- OKF v0.1 spec — Google Cloud, published 2026-06-13
