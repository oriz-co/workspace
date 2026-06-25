---
type: rule
title: Future decisions override past decisions
description: When chat contradicts a knowledge file or AGENTS.md, the chat wins; the
  file is updated in the same turn.
tags:
- rules
- agent
- knowledge
- authority
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- rules/agent/self-update-rule
---



# Future decisions override past decisions

When the user says X in chat and the knowledge bundle (or AGENTS.md)
says Y, **X wins** and the relevant file is updated in the same turn
to say X.

## Why

The user's mental model evolves. The knowledge bundle is a snapshot of
"what we agreed last time" — it's authoritative for agents only because
it's the most recent codified decision. The instant the user says
something else, the bundle is the second-most-recent decision and
needs updating.

Agents that argue with the user from the bundle ("but the rule says…")
are doing it backwards. The bundle exists to encode the user's
preferences, not to constrain them.

## How to handle a contradiction

1. Acknowledge the new decision.
2. Identify which file(s) contradict it.
3. Update those files in the same conversation (per
   [`self-update-rule.md`](../agent/self-update-rule.md)).
4. If the old decision is worth preserving as history, mark it
   `status: superseded` and link `superseded_by:` to the new file
   rather than deleting it.

## Exceptions

The four mission-level non-negotiables (recruiter-impressing, lifelong
archive, zero hosting cost, no card-on-file) cannot be overridden by a
casual chat decision. If chat seems to contradict one of these, the
agent should ask for explicit confirmation that the user means to
override a mission-level constraint before updating.

## See also

- [`self-update-rule.md`](../agent/self-update-rule.md) — paired rule
- AGENTS.md "Authority order" header
