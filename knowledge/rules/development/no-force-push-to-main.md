---
type: rule
title: Never force-push to main
description: "Force-push to main requires a separate, explicit user instruction \u2014\
  \ distinct from a normal push instruction."
tags:
- rules
- git
- agent
- safety
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- rules/no-push-without-say-so
- rules/development/one-branch-only
---



# Never force-push to main

Force-push (`git push --force` or `--force-with-lease`) to `main` —
in any repo — requires an explicit, separate user instruction. A
general "push" instruction is NOT consent for a force-push.

## Why

Force-push rewrites public history. Once consumers (other developers,
CI pipelines, dependent projects, the user's other machines) have
fetched a commit, force-undoing it on the server creates inconsistent
clones that are hard to recover from.

In the oriz family this is amplified by the [`one-branch-only`](./one-branch-only.md)
rule: every branch IS `main`, so force-push to main is force-push to
the only history that exists.

## What counts as "explicit instruction"

The user must use words like "force-push", "force push", "rewrite
history", or explicitly acknowledge the destructive nature. Examples:

- "force-push that" — explicit
- "rewrite history to remove the secret" — explicit
- "push --force" — explicit

What does NOT count:

- A plain "push" instruction (use a normal push)
- "fix the commit" (use `git commit --amend` only if the commit is
  unpushed; otherwise propose a follow-up commit)
- "undo that commit" (use `git revert`, which is a forward-only
  operation)

## Exceptions

None. If something REALLY needs force-pushing (leaked secret in
history, etc.), the agent proposes the operation with the exact
command and waits for explicit confirmation.

## See also

- [`no-push-without-say-so.md`](../no-push-without-say-so.md)
- [`one-branch-only.md`](./one-branch-only.md)
- AGENTS.md "Git" section
