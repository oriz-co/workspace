---
type: rule
title: Self-update on every decision (durable info only)
description: "Every durable architectural / naming / stack / external-fact decision\
  \ the user makes in chat MUST be reflected in knowledge/ before the conversation\
  \ ends. But DO NOT write count bumps, migration timestamps, step logs, or restatements\
  \ of the diff \u2014 those waste tokens and add noise. Capture only what future-you\
  \ cannot easily re-derive from code + git history."
tags:
- rules
- agent
- knowledge
- process
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
- rules/interaction/future-overrides-past
- _okf
---



# Self-update on every decision

Every **durable** decision the user makes in chat MUST be reflected
in `knowledge/` (or `AGENTS.md` if family-wide foundational) **in the
same conversation**, before the agent's final response.

## What COUNTS as a durable decision

Capture only **non-recoverable** information:

- A choice between architecturally distinct options + the reason
  (e.g. "Razorpay not Stripe because INR rail")
- A constraint or taste rule the user has stated (e.g. "no card on
  file", "free for users")
- An external fact future-you cannot easily re-derive (e.g.
  GPL-3.0 obligations for shipping a fork to a store)

## What does NOT count (do NOT write)

- **Count bumps.** "72 submodules → 73" is recoverable from
  `git submodule status`. Update count files (`family-inventory`)
  only when the **composition** changes (a new bucket appears, a
  category disappears), not on every routine add.
- **Migration timestamps + step logs.** Git history already records
  what happened when. Don't write "renamed X to Y on date Z" files
  unless the rename embodies a durable rule.
- **Re-statements of what's in the diff.** A commit already says
  "added DeArrow as submodule." A knowledge file repeating that
  fact wastes tokens for every future agent.
- **Status updates.** "Task complete" belongs in commit messages.

## Protocol

1. Identify durable info in the user's message (see "What COUNTS").
2. If nothing durable was decided, do NOT write to knowledge.
3. Otherwise, pick the right home per [`_okf.md`](../../_okf.md) taxonomy.
4. `kebab-case.md` filename. Concise OKF frontmatter + body.
5. If it supersedes an older concept, set `superseded_by` on the
   old + `supersedes` on the new. Don't delete.
6. Commit `docs(knowledge): <one-line summary>` (don't push — see
   [`no-push-without-say-so.md`](../no-push-without-say-so.md)).

## See also

- [`future-overrides-past.md`](../interaction/future-overrides-past.md)
- [`_okf.md`](../../_okf.md) §"Update protocol"
