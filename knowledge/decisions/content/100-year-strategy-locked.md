---
type: decision
title: "100-year strategy locked"
description: "The 16-point strategic contract for me.oriz.in — 50-year horizon, public archive on death, 10-min/day budget, JSONL canonical, GitHub Pages survival layer — is locked as a family-wide reference."
tags: [strategy, durability, lifestream, contract, 100-year]
timestamp: 2026-06-19
format_version: okf-v0.1
status: active
related:
  - decisions/architecture/lifestream-jsonl-canonical
  - decisions/content/journal-stays-auth-gated
  - decisions/content/age-gating-policy-adopted
  - decisions/infrastructure/github-pages-mirror-per-site
---

# 100-year strategy locked

## Decision

The 16-point 100-year strategy doc — full text at
[`projects/oriz/own/prod/apps/personal/oriz-cs-me-app/knowledge/decisions/100-year-strategy.md`](../../../../projects/oriz/own/prod/apps/personal/oriz-cs-me-app/knowledge/decisions/100-year-strategy.md) (in the oriz-cs-me-app submodule)
— is the locked strategic contract for `me.oriz.in` and informs
every architecture decision across the family. Its 16 sections
cover: 50-year time horizon, posthumous public archive, 10-min/day
effort budget, top-3 failure modes, recruiter-first audience
priority, public/private line, negative-data publishing,
freshness/staleness, 7-day fix-or-pause SLA, JSONL-canonical store,
JSONL year-file format, multi-host mirror strategy (deferred),
cloud-only architecture, 100% automated ingesters, self-healing
during long absences, minimum-survival layer.

## Why

This site is not a project — it's a 50-year archive. The default
architecture decisions for a project (pick the trendiest framework,
ship fast, refactor later) actively harm a 50-year archive. The
strategy fixes the strategic constraints up front so every later
"should I use X?" question has an answer. If a future architecture
decision conflicts with anything in the strategy, the strategy wins
— the architecture must change.

## Implications

- The full 16-point strategy lives in [`projects/oriz/own/prod/apps/personal/oriz-cs-me-app/knowledge/decisions/100-year-strategy.md`](../../../../projects/oriz/own/prod/apps/personal/oriz-cs-me-app/knowledge/decisions/100-year-strategy.md) (in the oriz-cs-me-app submodule) — this file is just the family-level pointer + headline rationale.
- Several strategy points cascade into separate locked decisions across the family: [lifestream-jsonl-canonical](../architecture/lifestream-jsonl-canonical.md), [github-pages-mirror-per-site](../infrastructure/github-pages-mirror-per-site.md), [journal-stays-auth-gated](./journal-stays-auth-gated.md), [age-gating-policy-adopted](./age-gating-policy-adopted.md).
- Annual review on Chirag's birthday: re-read the strategy doc, audit auto-paused ingesters, run the GitHub Pages mirror fire-drill, run the JSONL repo fire-drill, re-read age-gating policy against current jurisdictional rules.
- The "everything public including journal" line was reversed at adoption — see [journal-stays-auth-gated](./journal-stays-auth-gated.md). The reversal is annotated in the strategy doc itself.
- Strategy applies to `me.oriz.in` first; family-wide implications (e.g. survival fallback layer for ALL sites) are explicit in the per-decision files.

## Cross-refs

- [Full 100-year strategy doc (in the oriz-cs-me-app submodule)](../../../../projects/oriz/own/prod/apps/personal/oriz-cs-me-app/knowledge/decisions/100-year-strategy.md)
- [Lifestream JSONL canonical](../architecture/lifestream-jsonl-canonical.md)
- [GitHub Pages mirror per site](../infrastructure/github-pages-mirror-per-site.md)
- [Journal stays auth-gated](./journal-stays-auth-gated.md)
- [Age-gating policy adopted](./age-gating-policy-adopted.md)
