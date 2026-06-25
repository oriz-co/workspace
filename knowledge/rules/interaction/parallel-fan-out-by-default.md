---
type: rule
title: Parallel fan-out by default (background subagents)
description: "Any work that can be parallelised MUST be fanned out via background\
  \ subagents. Operational HOW for the parallel-by-default rule \u2014 keeps the orchestrator\
  \ under context-window limits and the wall-clock low."
tags:
- rules
- agent
- subagents
- parallel
- context-window
- productivity
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- parallel-by-default.md
- ../runbooks/clean-install.md
- ../runbooks/add-new-site-to-family.md
- ../runbooks/bump-submodule-pointer.md
---



# Parallel fan-out by default (background subagents)

> Sibling rule of [`parallel-by-default.md`](./parallel-by-default.md).
> That file says **why** to fan out. This file says **how** — concretely,
> using the harness's `Agent` tool with `run_in_background: true`, and
> sized to keep the orchestrator below Anthropic context-window limits.

## What

Any work that can be parallelised across files, sites, services, or
research questions MUST be fanned out via **background subagents**.
The orchestrator (the chat agent the user is talking to) MUST NOT do
that work itself when 2+ subagents could do it concurrently.

Sequential execution is the EXCEPTION, not the default. When chosen,
it must be justified in the commit message, the task description, or
the agent's reply.

## Why

Three independent reasons, any one of which is sufficient:

1. **Anthropic context-window limits.** Each subagent has its own
   context window. Searching 17 files in the orchestrator burns 17
   files of orchestrator context. Searching them in 17 subagents
   returns one summary line per agent and burns ~zero orchestrator
   context. The user runs out of conversation 10x slower this way.
   See [`claude-api`](../file:/~/.claude/skills/claude-api) for current
   model context-window numbers — never answer from memory.
2. **Wall-clock.** N parallel agents complete in roughly the time of
   the slowest one, not the sum. For a family of 11 sites + N
   extensions, this is the difference between minutes and an
   afternoon.
3. **Orchestrator availability.** While background agents work, the
   orchestrator stays free to answer MCQs, accept new instructions,
   and refine the plan. Sequential blocks the user.

## How

### Use the `Agent` tool with `run_in_background: true`

```
Agent(
  description: "short label",
  prompt: "self-contained task; absolute paths; what to return",
  subagent_type: "general-purpose" | "Explore" | "claude" | ...,
  run_in_background: true
)
```

- **Send 3-6 subagents per turn** for independent work. More than 6
  starts to thrash the user's terminal; fewer than 3 wastes the
  fan-out advantage.
- **Each subagent prompt must be self-contained.** It cannot see the
  user's chat history. Pass absolute paths, the exact deliverable,
  and the expected return shape ("return file paths and a 3-line
  summary, no full file dumps").
- **Independent work in a single message.** When you launch multiple
  subagents in one assistant turn, put all the `Agent` tool calls in
  ONE function-calls block so they actually run concurrently — not
  serialised across turns.
- **Await `<task-notification>` events.** The harness re-invokes the
  orchestrator when each background agent finishes. Don't poll; don't
  block.
- **Commit + push after each batch** (subject to
  [`no-push-without-say-so.md`](../no-push-without-say-so.md)). A batch
  is one logical unit — "added 5 sites' contact forms", not "added
  contact form to oriz-blog".

### Choose the right `subagent_type`

| Need | Agent type |
|---|---|
| Search across many files / dirs | `Explore` (read-only, summarises) |
| Multi-step task with edits + commits | `general-purpose` or `claude` |
| Plan-only, no edits | `Plan` |
| Catch-all | `claude` |

### Worktree isolation

For agents that will edit files, pass `isolation: "worktree"` so each
agent gets its own git worktree and they don't trample each other.
The harness auto-cleans worktrees that are unchanged.

## When NOT to fan out

Sequential is correct when:

- **Trivial single-file edits.** Spawning a subagent to change one
  line is overhead theatre.
- **Step N depends on step N−1's exact output.** Build → test → deploy.
  Migration where commit N must land before commit N+1 starts.
- **Interactive flows where the user is in the loop between steps.**

In those cases, say so explicitly in the commit message or task
description: "sequential because step 2 depends on step 1 output."

## Examples (from this repo)

- **2026-06-20 bundle bootstrap**: 5 parallel subagents populated
  `decisions/` (33 files), `services/` (41 files), `architecture/`
  (21 files), `policy/` (11 files), `glossary/` (28 files); a sixth
  rebuilt `rules/` (12 files). See [`../log.md`](../../log.md).
- **Clean install across 11 sites**: see
  [`../runbooks/clean-install.md`](../../runbooks/operations/clean-install.md).
- **Bump submodule pointer**: when bumping multiple, fan out — see
  [`../runbooks/bump-submodule-pointer.md`](../../runbooks/operations/bump-submodule-pointer.md).
- **Add new site to family**: bootstrap steps that don't depend on
  each other (workflows, secrets, DNS, submodule add) are fan-outable
  — see [`../runbooks/add-new-site-to-family.md`](../../runbooks/operations/add-new-site-to-family.md).

## See also

- AGENTS.md §"Parallel-by-default rule" (rule #2)
- AGENTS.md §"Agents working in this repo"
- [`parallel-by-default.md`](./parallel-by-default.md) — the sibling
  rule covering the WHY at family level
- [`never-hit-quotas.md`](./never-hit-quotas.md) — analogous mindset
  for service quotas: architect for headroom, not for the wall
