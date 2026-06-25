---
type: rule
title: User prefers strict-no-toggle interpretation of locked rules
description: When a family-wide rule (dark mode, no auth, no card) is offered as 'strict'
  vs 'with opt-in toggle', user picks strict. No light-mode toggle. No card-on-file
  even with opt-in. The rule is the rule.
tags:
- taste
- mcq-learned
- ui
- rules
timestamp: 2026-06-20
related:
- user-prefers-atomic-split
- user-prefers-wider-coverage
---



# User prefers strict-no-toggle reading of rules

## The rule

When a family rule (e.g., "dark mode default", "no card on file",
"no manual tracking") is offered as a strict reading vs a soft reading
that adds a per-user toggle, default to **strict — no toggle**.

A rule with an opt-out becomes a default; a rule without an opt-out
is a constraint. User picks constraint.

## Evidence

| Date | Choice offered | Choice picked | Recommended |
|---|---|---|---|
| 2026-06-20 | Dark default + light opt-in vs AMOLED only no toggle vs 3 modes | **AMOLED only, no toggle** | Dark + light opt-in |

(Earlier in 2026-06-20: Toggl Track adopted then walked back same day
to Wakatime-only when manual-tracker option opened a hole in
auto-only-tracking — same pattern: rule wins, exception path closed.)

## How to apply

When designing UI / API / config surfaces and a family rule applies:

- Don't ship a toggle for "exceptions to the rule".
- Don't ship a config flag that disables the rule on opt-in.
- Don't ship a per-user override.
- Ship the rule, period.

If a user genuinely needs the exception (a future user, not the
current one), they can fork or build their own. The rules are for
chirag127's products, not for arbitrary user customisation.

## Limits

This rule applies to **family rules**, not implementation choices.
Per-tool calculator unit preferences (kg vs lb), language picks,
keyboard shortcuts, etc. — those are config, not rule overrides.
A toggle for "metric vs imperial" on a unit converter is not the
same as a toggle for "dark vs light theme".

The line: if it overrides an `~/AGENTS.md` rule, no toggle. If it
parameterises a feature within the rule, toggle is fine.

## Source

Mined from MCQ override 2026-06-20 per `~/AGENTS.md` AskUserQuestion
learning rule.
