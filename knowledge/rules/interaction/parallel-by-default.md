---
type: rule
title: Parallel by default
description: Any work that can be parallelised MUST be fanned out via subagents. Sequential
  is the exception, justified when used.
tags:
- rules
- agent
- productivity
- subagents
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
---



# Parallel by default

Any work that can be parallelised MUST be fanned out via subagents.
Sequential is the exception, justified in the commit message or task
description when used.

## Why

A solo developer without parallelism is the bottleneck. A solo
developer with parallelism is not. The user is solo. Therefore every
agent that can fan out, must.

This applies even when the work is simple. The cost of spawning N
subagents is small; the wall-clock saved across 11 sites + N
extensions compounds heavily.

## When to fan out

- Adding a new feature across 5 sites → 5 parallel subagents
- Researching alternatives to N services → N parallel research agents
- Renaming a package across 11 consumers → 11 parallel update agents
- Auditing 17 files for a pattern → 17 parallel reads (or one Grep)
- Creating 18 small docs from one source → 18 parallel writes (this very task)

## When sequential is correct

- A 3-step pipeline where step 2 needs step 1's output (build → test → deploy)
- A migration where step N depends on step N−1 having committed
- An interactive flow where the user is in the loop between steps

In those cases, the commit message or task description should say so:
"sequential because step 2 depends on step 1 output."

## Exceptions

The dependency cases above. No other exceptions.

## See also

- AGENTS.md "Parallel-by-default rule"
- AGENTS.md "Agents working in this repo" §"Always parallelise"
