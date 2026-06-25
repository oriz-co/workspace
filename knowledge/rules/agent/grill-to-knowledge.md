---
type: rule
title: "Grill-to-knowledge \u2014 every grill-me answer lands in knowledge/"
description: When the user invokes grill-me or runs a sequence of design questions,
  EVERY locked answer (question stem + chosen option + rejected options + 'why') MUST
  land in knowledge/ in the same conversation. No locked answer may live only in chat
  history. The conversation context is the audit trail; the decision file is the durable
  truth.
tags:
- rule
- grill
- knowledge
- self-update
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- rules/agent/self-update-rule
- rules/agent/keep-knowledge-fresh
---



# Grill-to-knowledge

## The rule

When the user invokes `grill-me` or asks a sequence of design questions, **EVERY locked answer** MUST land in `knowledge/` in the same conversation. That includes:

- The question stem
- The chosen option
- The rejected options
- The "why" (rationale for the choice + why the rejected options were rejected)

Two destinations are valid:
- Append to the relevant existing decision file (`knowledge/decisions/<topic>/<slug>.md`)
- Write a new `decisions/architecture/<topic>.md` if no existing file covers it

## Why

The chat transcript is the audit trail of HOW we got to a decision. The knowledge file is the SSoT for WHAT the decision is. Without writing it down, the next session re-debates the same questions because no one remembers what was locked.

## How to apply

- Every grill-me invocation produces at least one knowledge file edit before the conversation ends.
- New decisions get a 2026-06-21-style entry in `knowledge/decisions/index.md`.
- Multi-question grills produce one consolidated decision file, not one file per question.

## Cross-refs

- The self-update sibling rule → [[rules/self-update-rule]]
- Keep-knowledge-fresh sibling rule → [[rules/keep-knowledge-fresh]]
