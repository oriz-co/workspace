---
type: rule
title: Always parse 'Other' answers in MCQs for additional context beyond the literal
  question
description: "When the user selects 'Other' on an AskUserQuestion MCQ and adds free-text,\
  \ that free-text may carry context unrelated to the specific question being asked\
  \ \u2014 instructions, constraints, requests, new decisions. The agent MUST parse\
  \ the free-text for ALL meaningful directives, not just answer the literal question.\
  \ If the free-text contains a new directive or constraint, the agent must (1) acknowledge\
  \ it explicitly, (2) write it to knowledge if durable, (3) act on it, AND (4) still\
  \ record an answer to the original question."
tags:
- rule
- communication
- mcq
- askuserquestion
- parsing
- context
- stt-friendly
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- rules/interaction/communication-stt-friendly
- rules/agent/confirm-knowledge-deltas
- rules/agent/keep-knowledge-fresh
- rules/agent/grill-to-knowledge
---



# Parse 'Other' answers for additional context

## Rule

When the user answers an AskUserQuestion MCQ with free-text "Other" (especially via STT), that text often carries:

1. The literal answer to the question being asked
2. New directives, constraints, preferences for OTHER topics
3. Corrections to past decisions
4. Requests for follow-up grilling
5. Pasted context (schemas, lists, URLs)

The agent MUST:

1. **Parse the entire free-text**, not just match a phrase to the option labels.
2. **Acknowledge each extracted directive explicitly** in the response.
3. **Write durable directives to `knowledge/`** in the same turn (per `keep-knowledge-fresh`).
4. **Apply non-durable directives** to the immediate work.
5. **Still record an answer** to the original question (use best inference from the text).

Never silently drop side-context that doesn't fit the original question.

## Example

Q: "Which subdomains to wire first?"
User's "Other" text: "auth.oriz.in, packages.oriz.in. And every AI provider should be OpenAI-compatible — that's a new rule. Grill me on it."

Agent must:
1. Record `auth.oriz.in + packages.oriz.in` as the answer.
2. Acknowledge "OpenAI-compat for all providers" as a new directive.
3. Write a new rule `knowledge/rules/openai-compat-for-all-ai-providers.md`.
4. Schedule follow-up MCQs to grill on the new directive.

## Why

STT users tend to package multiple thoughts in one utterance. The agent's job is to extract every actionable signal, not just the one that fits the current question template.

This pairs with [[rules/communication-stt-friendly]] — STT input is noisy AND multi-topic.

## Cross-refs

- STT-friendly communication → [[rules/communication-stt-friendly]]
- Confirm knowledge deltas → [[rules/confirm-knowledge-deltas]]
- Keep knowledge fresh → [[rules/keep-knowledge-fresh]]
