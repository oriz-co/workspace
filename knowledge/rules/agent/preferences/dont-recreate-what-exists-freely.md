---
type: rule
title: "Don't recreate what already exists freely as open source"
description: "Before forking, scaffolding, or building any project — confirm via at least 2 web searches that no free, open-source, actively-maintained equivalent already exists. If it does, use it; don't duplicate."
tags: [scope, build-gate, dont-duplicate, agent-preferences, feedback]
timestamp: 2026-06-28
format_version: okf-v0.1
status: active
related:
  - rules/agent/preferences/always-search-twice-before-deciding
  - decisions/architecture/fleet/build-gate-top3-must-have-defect
  - rules/agent/preferences/lean-by-need-not-count
---

# Don't recreate what already exists freely

## Rule

Before creating, forking, scaffolding, or scoping any new project, verify:

1. **Does a free open-source equivalent already exist?** Two web searches minimum.
2. **Is it actively maintained?** Last commit < 12 months.
3. **Is the license compatible?** MIT / Apache / similar.
4. **Is the data / functionality what we'd need?** Read the README, not just the title.

If all four are yes → **use it directly, don't recreate**. We are users, not duplicators of existing public goods.

The fork itself adds nothing unless we plan to actively maintain divergent features. A "backup fork" of a maintained upstream is dead weight.

## Why

User feedback, 2026-06-28 (verbatim):

> "Already API exists for the Gita data and we don't need an API for Gita data. Already open data exists if already exists. If a similar project exists for something then we will not add as that product as a product if some product already exists freely free and free of cost and repository is always open source and many more criteria can be there then we will not create that."

Concrete failure this session: I forked `gita/gita` twice (once to `chirag127`, then to `oriz-org`) before checking that the upstream is already free, open, actively-served at https://bhagavadgita.io, and has REST endpoints anyone can hit. We deleted both forks immediately.

## Composes with existing rules

This rule strengthens, but does NOT replace:

- [`build-gate-top3-must-have-defect`](../../decisions/architecture/fleet/build-gate-top3-must-have-defect.md) — build only when top-3 search results have a defect we'd fix
- [`lean-by-need-not-count`](./lean-by-need-not-count.md) — applies to deps; this applies to whole projects
- [`scope-cut-only-shipping-survives`](./scope-cut-only-shipping-survives.md) — every project must justify shipping

The four "if all four yes" criteria match the build-gate's spirit: existing free + maintained + correct-license + correct-data = top-3-without-defect.

## How to apply

For every "should we build/fork/scaffold X?" question:

1. Run 2 web searches: forward ("X open source github") and adversarial ("X alternatives", "X discontinued")
2. If 0 matches found → no existing solution, proceed
3. If 1+ active OSS match found:
   - Read the README
   - Check last commit date
   - Check license
   - If all check out → **use it directly via its public URL / CDN**. No fork.
4. If existing match has a real defect → file an upstream issue first. Only fork if upstream rejects the fix or is unresponsive after 30 days.

## Anti-patterns

- ❌ Forking purely to "have a copy" of an actively-maintained upstream
- ❌ Scaffolding a new repo when a `cdn.jsdelivr.net/gh/<upstream>` URL would work
- ❌ "Let's build our own X for fun" — fun isn't shipping
- ❌ Skipping the search because the project is small ("just a JSON file")
