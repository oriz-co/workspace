---
type: decision
title: "Code stats \u2014 every metric tool turned on (9-tool stack)"
description: "Locked 2026-06-20: every public family repo runs the full code-stats\
  \ stack \u2014 Sonarcloud + CodeRabbit + Codecov + CodeClimate + DeepSource + biome\
  \ + GitHub Insights + Tokei + Lines-of-Code badge. All free for OSS. Auto-tracked\
  \ per the auto-only-tracking rule. Extends the 5-tool code-quality decision with\
  \ three more stat-shaped tools (GH Insights / Tokei / LoC badge) on top of the 5\
  \ quality tools."
tags:
- code-stats
- code-quality
- decisions
- architecture
- oss
- auto-tracking
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- decisions/architecture/stack/code-quality-five-tools
- services/code-quality/sonarcloud
- services/code-quality/coderabbit
- services/code-quality/codecov
- services/code-quality/codeclimate
- services/code-quality/deepsource
- services/code-quality/github-insights
- services/code-quality/tokei
- services/code-quality/lines-of-code-badge
- rules/interaction/auto-only-tracking
---



# Code stats — every metric tool turned on

## Decision

Every public repo in the `chirag127/oriz*` family runs **nine**
code-quality / code-stats tools — every metric the family can
auto-track for free, turned on, with no manual upkeep.

| # | Tool | What it owns | Where it renders |
|---|---|---|---|
| 1 | [Sonarcloud](../../../services/code-quality/sonarcloud.md) | SAST + code smells + duplication + complexity | Quality gate on `main` |
| 2 | [CodeRabbit](../../../services/code-quality/coderabbit.md) | LLM-grade design + intent review | PR comments |
| 3 | [Codecov](../../../services/code-quality/codecov.md) | Per-PR coverage delta | PR comment + status check |
| 4 | [Code Climate Quality](../../../services/code-quality/codeclimate.md) | A — F maintainability per file | Dashboard + status check |
| 5 | [DeepSource](../../../services/code-quality/deepsource.md) | Static analysis + autofix PRs | Issue list + auto-PR |
| 6 | **biome** (in repo, not a SaaS) | Lint + format + simple-bug catch | Local + CI |
| 7 | [GitHub Insights](../../../services/code-quality/github-insights.md) | Native contributors / commits / code-frequency / dependents | Repo `/pulse` + `/graphs/*` |
| 8 | [Tokei](../../../services/code-quality/tokei.md) | Per-language line / file / blank / comment counts | CI artefact + family `/stats` |
| 9 | [Lines of Code badge](../../../services/code-quality/lines-of-code-badge.md) | Single LoC number | README badge per repo |

That is intentionally 9 tools. The user direction was: *"ADD
EVERYTHING — GitHub Insights + Tokei + CodeClimate + LinesOfCode
badges."* Builds on (does not supersede) the
[5-tool code-quality decision](../stack/code-quality-five-tools.md) — the 5
quality tools stay; the 4 stat-shaped tools (biome, GH Insights,
Tokei, LoC badge) are the auto-tracking-friendly metric layer
alongside.

## Why every tool

Each tool catches or surfaces a different signal **and renders to a
different surface**, so layering them costs nothing (all free for
public OSS) and makes a different reviewer comfortable:

- **SAST + smells** = Sonarcloud (depth) + DeepSource (autofix) +
  biome (fast)
- **Coverage** = Codecov (PR delta), reinforced by Sonarcloud's gate
- **Maintainability** = Code Climate's A — F grade, the cheapest
  glance for "is this file getting worse?"
- **Design + intent** = CodeRabbit (LLM PR review)
- **Native repo metrics** = GitHub Insights — commit cadence,
  contributor list, code-frequency graph, dependency graph,
  dependents — none of which the SAST tools surface
- **Line counts** = Tokei (canonical, scriptable JSON output) +
  LoC badge (visible README at-a-glance)

Auto-tracked everywhere — every metric is computed without a human
pressing "refresh", in line with
[`auto-only-tracking`](../../../rules/interaction/auto-only-tracking.md). No manual
LOC counting, no manual contributor lists, no manual maintainability
calls.

The user posture was *"use everything … so that everything is done
best."* For public-OSS repos, "everything" costs nothing.

## Implications

- **`templates/per-site-ci/.github/workflows/ci.yml`** runs Tokei in
  CI as the line-counter step, emits JSON, uploads as a workflow
  artefact AND publishes to the family `/stats` page per
  [`family-wide-stats-page`](../apps/family-wide-stats-page.md).
- **README badges** — every repo's README ships the LoC badge from
  [`lines-of-code-badge`](../../../services/code-quality/lines-of-code-badge.md),
  alongside the existing quality / coverage / Sonarcloud /
  CodeRabbit badges. Templated via `templates/per-site-ci/` so new
  repos get the badge by default.
- **GitHub Insights** is enabled by default on public repos — no
  setup. The decision is to *use* it (link to `/pulse` from family
  /stats; consume `/graphs/contributors` data via REST API at build
  time for the family stats page), not configure it.
- **Quota math** — all 9 tools free for OSS / public repos under
  the family's
  [public-everywhere posture](../../../rules/development/repos-work-independently.md);
  no card on file required for any. Per
  [`rules/never-hit-quotas`](../../../rules/interaction/never-hit-quotas.md): if
  any tool tightens its OSS tier in future, that single tool drops;
  the rest stay.
- **Build-time aggregation** — the family `/stats` page on
  `oriz.in` (per
  [`family-wide-stats-page`](../apps/family-wide-stats-page.md)) rolls up
  Tokei + GitHub Insights + Codecov + Code Climate / DeepSource
  badges across every repo into one public dashboard.

## Cross-refs

- [Code quality services index](../../../services/code-quality/index.md)
- [5-tool code-quality decision (extended here)](../stack/code-quality-five-tools.md)
- [Family-wide /stats page decision](../apps/family-wide-stats-page.md)
- [GitHub Insights service](../../../services/code-quality/github-insights.md)
- [Tokei service](../../../services/code-quality/tokei.md)
- [Lines of Code badge service](../../../services/code-quality/lines-of-code-badge.md)
- [Auto-only-tracking rule](../../../rules/interaction/auto-only-tracking.md) (forward ref — being added in parallel)
- [Repos work independently rule](../../../rules/development/repos-work-independently.md)
- [Never hit quotas rule](../../../rules/interaction/never-hit-quotas.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
