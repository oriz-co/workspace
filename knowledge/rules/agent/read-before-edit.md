---
type: rule
title: Always Read a file before Edit
description: "Always Read a file in the current session before calling Edit. The harness\
  \ enforces this; the rule restates the why so agents don't fight it \u2014 it prevents\
  \ stale-match failures and accidental clobbering."
tags:
- rules
- agent-harness
- edit
- claude-code
- safety
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- rules/interaction/match-surrounding-style
- rules/no-push-without-say-so
---



# Always Read a file before Edit

Always call `Read` on a file in the current session before calling
`Edit` (or `Write` to overwrite it). The Claude Code harness already
enforces this — Edit fails on a file the session hasn't Read — but
agents still occasionally try to bypass by guessing context. Don't.

## Why

The harness rule exists for two reasons; the rule file makes them
explicit so agents stop trying to outsmart it.

1. **Stale-match failures.** `Edit` requires `old_string` to match
   exactly, character-for-character. A file the agent thinks it knows
   from training data, an earlier session, or a different branch is
   almost always slightly different — different whitespace, different
   import order, a recent commit. Reading first guarantees the
   `old_string` is taken from the file's current state.

2. **Accidental clobbering.** `Write` overwrites the entire file. If
   the agent hasn't Read it, there's no way to know whether the
   overwrite drops a function someone added since the agent's last
   look. Reading first surfaces those changes before they're lost.

A third reason, equally important in this codebase: many edits should
match the surrounding style ([`match-surrounding-style.md`](../interaction/match-surrounding-style.md)).
You can't match what you haven't seen.

## What this means concretely

- Every `Edit` call must be preceded by a `Read` of the same
  `file_path` **in the current session**. Reads from a different
  session don't count — file contents change.
- For a multi-file edit, batch the `Read` calls in a single assistant
  turn (parallel function calls), then batch the `Edit` calls — don't
  serialise.
- For surgical edits, prefer `Edit` over `Write`. Only `Write` when
  creating a net-new file or fully replacing one already Read in this
  session.
- Don't `Read` the same file again just to "verify" the edit — the
  harness tracks file state and `Edit` would have errored if the match
  failed.

## Exceptions

None. The harness will block you anyway.

## See also

- [`match-surrounding-style.md`](../interaction/match-surrounding-style.md)
- Claude Code edit-mode preferences in `~/.claude/CLAUDE.md`
