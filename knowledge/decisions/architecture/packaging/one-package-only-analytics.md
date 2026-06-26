---
type: decision
title: "One package only — analytics"
description: "Only one in-house npm package — oriz-analytics-npm-pkg. 22 sibling packages archived 2026-06-25. Apps use community deps only."
tags: [packaging, scope-cut, superseded]
timestamp: 2026-06-25
format_version: okf-v0.1
status: superseded
supersedes: twenty-two-packages-on-npm
superseded_by: zero-in-house-packages-inline-analytics-2026-06-25
---

- The sole surviving in-house package is `oriz-analytics-npm-pkg` (analytics + tracking + ads — applied uniformly to all apps).
- Future rule: lazy in-house. Build new packages ONLY when a real need forces it (no community equivalent + 3+ apps need it). Do NOT pre-build SDK packages.
- Why: 22 stub packages were build-gate violations (built before any app demanded them). Each one was a maintenance tax with no payoff.
- Why one: every app deserves equal analytics/tracking/monetization — that's intentionally uniform, hence the shared package.
- Why this package: analytics fits the criterion (community alternatives exist but mixing 5 SDKs across apps creates drift; uniformity wins).
- Supersedes: [`twenty-two-packages-on-npm`](./twenty-two-packages-on-npm.md) (the 23-package model, locked 2026-06-21).
- Related: [`build-gate-top3-must-have-defect`](../fleet/build-gate-top3-must-have-defect.md), [`donations-only-no-pro-no-ads`](../monetisation/donations-only-no-pro-no-ads.md).

**SUPERSEDED 2026-06-25 (same day)** by [`zero-in-house-packages-inline-analytics-2026-06-25`](./zero-in-house-packages-inline-analytics-2026-06-25.md). Analytics integration is 1-3 lines of `<script>` per tool — a wrapping npm package was pure ceremony.
