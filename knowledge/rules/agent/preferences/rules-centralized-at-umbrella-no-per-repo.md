---
type: rule
title: "Rules centralized at umbrella — no per-repo rules"
description: "All rules + .env.example live ONLY in the umbrella (oriz-org/workspace). Individual submodules have NO rules of their own. Reverses earlier per-repo rule."
tags: [feedback, agent-preferences, knowledge, fleet, env]
timestamp: 2026-06-26
format_version: okf-v0.1
status: active
supersedes: env-example-mirrors-env-with-steps
---

ALL rules + `.env.example` live ONLY in the umbrella (`oriz-org/workspace` at `c:\D\oriz\`).

- Submodules: NO rules, NO `.env.example`. Just code + their own `.env` (if needed, gitignored).
- Umbrella: ONE canonical `.env.example` at root, ONE knowledge tree, ONE AGENTS.md.

Reverses [`env-example-mirrors-env-with-steps`](./env-example-mirrors-env-with-steps.md) (deleted) + `submodule-env-files-three-file-pattern` (deleted from knowledge).

Why: simpler. One place to look. No drift across 20 submodules.

Related: [`knowledge-deletion-not-supersession`](./knowledge-deletion-not-supersession.md) — superseded files hard-deleted, not marked.
