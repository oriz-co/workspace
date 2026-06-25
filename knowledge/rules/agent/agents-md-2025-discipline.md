---
type: rule
title: "2025 agents.md discipline \u2014 tight context, knowledge bundle, don't drift\
  \ to 2026 yolo"
description: "User locked the 2025 mindset on 2026-06-23: AGENTS.md stays short +\
  \ sharp, knowledge/ is the brain, every concept gets a file. Reject the 'just let\
  \ agents figure it out from context' 2026 yolo for non-toy projects. For oriz family\
  \ this means: AGENTS.md \u2264200 lines pointing at README.md and knowledge/, never\
  \ inline rules in AGENTS.md if a knowledge file exists, prune stale knowledge weekly,\
  \ treat context as a precious limited resource."
tags:
- rule
- agents-md
- knowledge
- context-management
- discipline
timestamp: 2026-06-23
format_version: okf-v0.1
status: active
related:
- rules/self-update-on-every-decision
- rules/agent/auto-grill-on-architectural-decisions
- rules/agent/confirm-knowledge-deltas
---



# Rule: 2025 agents.md discipline

## What

For this repo and the oriz family:

- `AGENTS.md` stays ≤200 lines. It POINTS at `README.md` (canonical entry) and `knowledge/index.md` (canonical brain). It does NOT inline rules that have their own knowledge file.
- Every multi-decision concept gets its own file in `knowledge/rules/<slug>.md`, `knowledge/decisions/<slug>.md`, or `knowledge/runbooks/<slug>-YYYY-MM-DD.md`.
- Each markdown front-matter follows the OKF v0.1 spec (`knowledge/_okf.md`).
- Context is precious. Adding a rule means deleting another, or splitting an existing one. The total agent-context payload should be measured, not assumed.
- Stale knowledge gets PRUNED, not preserved out of politeness. If a decision is superseded, mark it `status: superseded` and link the successor.

## Why

User pasted the 2025-vs-2026 mindset debate 2026-06-23 and locked the 2025 mindset for this project. Direct quote: *"I think it's more nuanced than this... at least for now, I suggest the same for you... for larger projects, I like to be all over it."*

This project is NOT a toy. It is the oriz family — 60+ submodules, paying-user infra, family-level cohesion via shared chrome and design tokens. The 2026 "let it hang out" approach is appropriate for a first-person shooter built in a weekend. It is not appropriate here.

## How to apply

1. Before adding to `AGENTS.md`, ask: does this belong in `knowledge/rules/`, `knowledge/decisions/`, or `knowledge/runbooks/`? If yes, write it there + add a one-line pointer in `knowledge/index.md`.
2. When making a decision, write the decision file FIRST, then code from it. Don't write code-then-doc.
3. Treat `AGENTS.md` updates as expensive. Every line there is loaded into every agent's context on every invocation across 60 repos.
4. Run the agents-md-sync skill periodically to dedupe overlapping rules across `claude.md` / `agents.md` / `gemini.md` if the project ever adds those formats.
5. When pruning: a knowledge file marked `superseded` for >30 days can be deleted entirely if its successor has absorbed the relevant content. Git history is the durable backup.

## How NOT to apply

- DON'T let `AGENTS.md` grow past 200 lines. If it does, it's a smell — extract sections to `knowledge/`.
- DON'T duplicate rules across `AGENTS.md` and `knowledge/rules/*.md`. The knowledge file is the source of truth; `AGENTS.md` points at it.
- DON'T preserve stale knowledge "just in case". The "just in case" is git history.
- DON'T add a `knowledge/` file for one-off decisions that won't recur. The bar is "would a future agent need this to make a similar decision again."

## Cross-refs

- README.md is the canonical entry — see [README.md](../../README.md).
- The knowledge brain index — see [knowledge/index.md](../../index.md).
- Format spec for files in `knowledge/` — see [knowledge/_okf.md](../../_okf.md).
- Companion rule on filing every locked decision — see [[self-update-on-every-decision]].
- Companion rule on confirming knowledge deltas — see [[confirm-knowledge-deltas]].
