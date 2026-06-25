---
type: index
title: Agent
description: Index of concepts in rules/agent.
tags:
- index
- agent
timestamp: '2026-06-24'
format_version: okf-v0.1
status: active
---

# Agent

## Concepts

- [Agent minimum-context protocol — find before deriving](./agent-minimum-context.md) — How any AI agent operates on this repo with minimum upfront token cost. Read knowledge/_navigation.md FIRST. Grep before writing. Terse self-contained files. [[wikilinks]] for chaining. Commit knowledge same-turn. Plus a cookbook of recurring tasks with entry-point file paths.
- [2025 agents.md discipline — tight context, knowledge bundle, don't drift to 2026 yolo](./agents-md-2025-discipline.md) — User locked the 2025 mindset on 2026-06-23: AGENTS.md stays short + sharp, knowledge/ is the brain, every concept gets a file. Reject the 'just let agents figure it out from context' 2026 yolo for non-toy projects. For oriz family this means: AGENTS.md ≤200 lines pointing at README.md and knowledge/, never inline rules in AGENTS.md if a knowledge file exists, prune stale knowledge weekly, treat context as a precious limited resource.
- [Auto-grill on architectural decisions](./auto-grill-on-architectural-decisions.md) — Before any multi-file architectural choice (storage, auth, deploy, payments, framework, data model), agents MUST run the grill skill or its inline equivalent (3–4 ranked-recommendation questions via AskUserQuestion). Decision must be locked into knowledge/decisions/ before code lands. Locked 2026-06-23 in response to user explicitly choosing the auto-grill cadence. Compounds with self-update-on-every-decision: grill produces the decision, that rule files it.
- [Grill the user on every new input that contradicts existing knowledge](./confirm-knowledge-deltas.md) — Whenever the user's latest message contradicts, narrows, widens, or reverses a decision already in knowledge/, the agent must explicitly call out the delta, ask the user to confirm whether to overwrite knowledge or treat as one-off, and only then act. Latest user input is the source of truth ONLY after explicit confirmation.
- [Grill on LOC removal >= 50 lines per sweep (TIGHTENED 2026-06-22 evening)](./grill-on-loc-removal.md) — TIGHTENED 2026-06-22 evening: threshold dropped from 1000 LOC → 50 LOC. When a dedup/refactor/cleanup sweep removes ≥50 lines of code in a single agent action, the agent MUST surface this as a delta, ask the user MCQs about what was removed + why, offer restoration paths, and confirm before deleting. Reason: 50-LOC sweeps can hide substantive functional removal (an entire component, a route, a feature). Design pattern consolidation safe ONLY after grill; content/feature deletion NEVER safe without grill.
- [Grill-to-knowledge — every grill-me answer lands in knowledge/](./grill-to-knowledge.md) — When the user invokes grill-me or runs a sequence of design questions, EVERY locked answer (question stem + chosen option + rejected options + 'why') MUST land in knowledge/ in the same conversation. No locked answer may live only in chat history. The conversation context is the audit trail; the decision file is the durable truth.
- [Keep knowledge fresh — read first, write current truth, delete obsoletes](./keep-knowledge-fresh.md) — Every session reads knowledge before acting, writes decisions into knowledge as CURRENT TRUTH (not historical logs), and deletes obsoleted content same-turn. Knowledge files are snapshots of what IS, not journeys of how we got here.
- [Knowledge-first — no README ↔ knowledge duplication; per-app knowledge in submodules](./knowledge-first.md) — Durable info goes in knowledge/ first. README is entry-point only. If info is in knowledge/, it's NOT also in README, and vice versa. Per-app knowledge lives in each submodule's own knowledge/ (OKF-light: index.md + decisions/ + runbooks/ + services/). Cross-cutting knowledge stays at master knowledge/. Master knowledge/sites/<app>/ is NOT used for app-specifics.
- [Always Read a file before Edit](./read-before-edit.md) — Always Read a file in the current session before calling Edit. The harness enforces this; the rule restates the why so agents don't fight it — it prevents stale-match failures and accidental clobbering.
- [Self-update on every decision (durable info only)](./self-update-rule.md) — Every durable architectural / naming / stack / external-fact decision the user makes in chat MUST be reflected in knowledge/ before the conversation ends. But DO NOT write count bumps, migration timestamps, step logs, or restatements of the diff — those waste tokens and add noise. Capture only what future-you cannot easily re-derive from code + git history.
