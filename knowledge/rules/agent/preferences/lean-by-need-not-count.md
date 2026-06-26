---
type: rule
title: "Lean by need, not count"
description: "Build-gate applies to npm deps the same as to features. No minimum dep count, no maximum. Each dep justifies itself."
tags: [feedback, agent-preferences, dependencies, build-gate]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
---

# Lean by need, not count

The build-gate principle — "top-3 results must have a defect" before we ship — generalizes from features to dependencies. There is no target floor for the number of npm deps in a project, and no ceiling. Each dep stands on its own: does it solve a real problem that we can't solve cheaper inline? If yes, pull it in. If no, drop it. The total count is an output, never an input.

This means: don't pad a `package.json` to look "serious," and don't artificially slim it to look "lean." Both moves optimize for the wrong target. The right target is each dep individually clearing the same defect-justification bar that features clear.

Captured 2026-06-25 when user said "no minimum" on the blog's deps after I asked if 100+ was a floor or a target. The clarification: deps follow the same justify-or-drop rule as everything else; the count is incidental.

Related:
- [`build-gate-top3-must-have-defect`](../../../decisions/architecture/fleet/build-gate-top3-must-have-defect.md) — the parent rule this generalizes from
