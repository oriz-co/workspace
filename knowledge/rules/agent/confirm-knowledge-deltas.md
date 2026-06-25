---
type: rule
title: Grill the user on every new input that contradicts existing knowledge
description: Whenever the user's latest message contradicts, narrows, widens, or reverses
  a decision already in knowledge/, the agent must explicitly call out the delta,
  ask the user to confirm whether to overwrite knowledge or treat as one-off, and
  only then act. Latest user input is the source of truth ONLY after explicit confirmation.
tags:
- rule
- communication
- knowledge
- drift
- latest-overrides
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- rules/agent/keep-knowledge-fresh
- rules/interaction/future-overrides-past
- rules/agent/grill-to-knowledge
- rules/agent/knowledge-first
- rules/interaction/communication-stt-friendly
---



# Confirm knowledge deltas before applying

## Rule

Every turn, before acting on new user input, the agent checks `knowledge/` for any decision/rule/policy the new input contradicts. When a contradiction exists:

1. **Surface the delta explicitly.** Quote both: the existing knowledge phrasing AND the new user input phrasing. One short paragraph each.
2. **Offer the choice.** "Should I update [[knowledge-slug]] to match, OR treat this as a one-off override that doesn't change the rule?"
3. **Wait for confirmation.** Do not silently overwrite knowledge. Do not silently ignore the new input either.
4. **On confirm → overwrite:** edit the knowledge file in the same turn, set its `status: active` (and the old one to `status: superseded` if it was a separate decision), and proceed.
5. **On confirm → one-off:** apply the request to the immediate work only; leave knowledge unchanged.

## Why

Without this, knowledge drifts: either the agent overrides it silently (knowledge becomes stale), or the agent ignores new input (user feels unheard). Both fail. Explicit grilling is the only reconciliation that keeps both surfaces honest.

This rule pairs with [[rules/future-overrides-past]] (newer wins after confirmation) and [[rules/keep-knowledge-fresh]] (knowledge is the SSoT once confirmed).

## Examples

- User says: "Header should be family-wide minimal." But `knowledge/rules/design-divergence-vs-dedup.md` says "Header is intentionally per-app divergent."
  → Agent surfaces both, asks: "Do I update design-divergence-vs-dedup.md, or keep it and override per-app variants in this turn only?"

- User says: "Use Telegram for drafts." But `knowledge/rules/no-telegram-india-banned.md` says Telegram is banned in India.
  → Agent surfaces both, asks: "VPN access changed? Should I remove the no-telegram rule, or look for a different drafts host?"

- User says: "Drop CF Workers entirely." But many decisions depend on Workers being the API tier.
  → Agent surfaces the dependent files, asks: "Which decisions to update first?"

## Cross-refs

- [[rules/keep-knowledge-fresh]] — every change must reach knowledge eventually
- [[rules/future-overrides-past]] — newer wins after explicit confirmation
- [[rules/grill-to-knowledge]] — grilling is the surface where this rule fires
- [[rules/communication-stt-friendly]] — pair this with short STT-friendly options when surfacing the delta
