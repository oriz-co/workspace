---
type: rule
title: "React > Preact — ecosystem over bundle size"
description: "User picks React over Preact when offered. Values ecosystem compatibility over the ~42 KB bundle savings."
tags: [user-identity, frontend, framework]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
---

User chose React over Preact in the framework grill on 2026-06-25. 2nd-choice override pattern — Preact was the "smaller bundle" recommendation.

**Why:** User values library/component ecosystem compatibility (shadcn, Radix, every React-first library) over the 42 KB bundle savings Preact would have delivered. Taste: ecosystem reach > micro-optimization.

**How to apply:** When picking between a popular framework and a smaller-but-compatible alternative, default to the popular one. Don't propose Preact/Inferno/Solid as the Recommended option unless bundle size is the explicit constraint. Generalizes: ecosystem > bundle-size for this user across future framework picks.
