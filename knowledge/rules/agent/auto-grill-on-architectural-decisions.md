---
type: rule
title: Auto-grill on architectural decisions
description: "Before any multi-file architectural choice (storage, auth, deploy, payments,\
  \ framework, data model), agents MUST run the grill skill or its inline equivalent\
  \ (3\u20134 ranked-recommendation questions via AskUserQuestion). Decision must\
  \ be locked into knowledge/decisions/ before code lands. Locked 2026-06-23 in response\
  \ to user explicitly choosing the auto-grill cadence. Compounds with self-update-on-every-decision:\
  \ grill produces the decision, that rule files it."
tags:
- rule
- grill
- architecture
- knowledge
- decision-discipline
timestamp: 2026-06-23
format_version: okf-v0.1
status: active
related:
- rules/self-update-on-every-decision
- rules/agent/grill-to-knowledge
- rules/agent/grill-on-loc-removal
- skills/grill-me
---



# Rule: auto-grill on every architectural decision

## What

Before writing code for any decision that:

- touches more than 2 files,
- introduces a new dependency, runtime, deploy surface, or database,
- locks in an API shape that other apps will import,
- chooses between SaaS providers, hosting tiers, or payment processors,
- changes how auth, billing, secrets, or PII are handled,

agents MUST run a structured grill of 3–4 questions via `AskUserQuestion` (or invoke the `grill-me` skill), then write the resulting choice to `knowledge/decisions/<topic>.md` BEFORE any code lands.

## Why

The user pasted explicit feedback 2026-06-23 about my flag-system reasoning being wrong on 4 specific points (incident response not always git-push-able, paying-user threshold approaching, etc.). Pattern: when I commit to architecture without a grill, I tend to overstate the case for the cheap option. Grilling forces me to surface tradeoffs, give a ranked recommendation, and accept correction before the code locks in.

Grilling is FAST when the recommendation is obvious — three questions, three Recommended answers, 30 seconds. The cost is low; the cost of skipping it on a decision that turns out wrong is hours of rework.

## How to apply

1. Identify the decision boundary. If you're about to write code that introduces dependency / SaaS / DB / shared API / auth-billing-PII change, STOP.
2. Compose 3–4 ranked-recommendation questions per `AskUserQuestion`. Each option:
   - Option 1 = Recommended (suffix `(Recommended)`)
   - Option 2 = 2nd choice (suffix `(2nd choice)`)
   - Options 3–4 = other viable shapes
   - Never ship four equally-weighted options. If you can't pick a recommendation, research first.
3. Write the locked answers into `knowledge/decisions/architecture/<slug>.md` with format-version OKF metadata.
4. If the user picks the 2nd choice or overrides Recommended, also write a candidate `feedback` memory: "user prefers X for category Y" — surface the taste pattern that the override implies.
5. ONLY then write the code.

## What grill is NOT

- Not for trivial edits (`AskUserQuestion` is the wrong tool for "should I rename this variable").
- Not for choices the user already locked in earlier in the session — re-read context.
- Not for choices the codebase already encodes — re-read [`knowledge/`](../../knowledge).
- Not a stalling tactic. If everything is genuinely Recommended → 2nd choice → 3rd → 4th and the user repeatedly chooses Recommended, the grill has done its job by surfacing options.

## How NOT to apply

- DON'T grill the user on what they just said. ("Should I commit?" after they said "commit and push" is forbidden.)
- DON'T grill them on choices with a conventional default (Astro template, ESLint rules, biome formatter).
- DON'T grill them on factual lookups (file paths, port numbers, version strings — verify the codebase yourself).

## Cross-refs

- The grill produces the decision; the decision goes to `knowledge/decisions/`; that's [[self-update-on-every-decision]].
- For LOC-removal grilling specifically: [[grill-on-loc-removal]] (a stricter subset).
- For the skill that automates the grill format: `~/.claude/skills/grill-me/`
