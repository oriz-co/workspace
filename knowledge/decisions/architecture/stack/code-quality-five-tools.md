---
type: decision
title: "Code quality \u2014 5-tool stack (Sonarcloud + CodeRabbit + Codecov + Code\
  \ Climate + DeepSource)"
description: "Locked 2026-06-20: every public repo runs five complementary code-quality\
  \ tools. Sonarcloud (SAST + smells), CodeRabbit (LLM PR review), Codecov (coverage\
  \ delta), Code Climate (A \u2014 F maintainability), DeepSource (autofix). All five\
  \ free for the family's public / OSS repos. Builds on the earlier 4-tool stack \u2014\
  \ adds Codecov + Code Climate + DeepSource alongside the existing Dependabot + biome\
  \ + CodeRabbit + Sonarcloud."
tags:
- code-quality
- decisions
- architecture
- sast
- coverage
- ci
- oss
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/code-quality/sonarcloud
- services/code-quality/coderabbit
- services/code-quality/codecov
- services/code-quality/codeclimate
- services/code-quality/deepsource
- services/code-quality/dependabot
- decisions/process/code-quality-stack
- rules/interaction/no-card-on-file
---



# Code quality — 5-tool stack

## Decision

Every public repo in the `chirag127/oriz*` family runs five
complementary code-quality tools. All five are free for OSS / public
repos — the family's
[repos-work-independently](../../../rules/development/repos-work-independently.md)
posture and the user's *"all of the repositories are public.
Everything is public and open source"* direction keep every repo
eligible for free tiers across the board.

| # | Tool | What it owns | Where it renders |
|---|---|---|---|
| 1 | [Sonarcloud](../../../services/code-quality/sonarcloud.md) | SAST + code smells + duplication + complexity | Quality gate on `main` |
| 2 | [CodeRabbit](../../../services/code-quality/coderabbit.md) | LLM-grade design + intent review | PR comments |
| 3 | [Codecov](../../../services/code-quality/codecov.md) | Per-PR coverage delta | PR comment + status check |
| 4 | [Code Climate Quality](../../../services/code-quality/codeclimate.md) | A — F maintainability grade per file | Dashboard + status check |
| 5 | [DeepSource](../../../services/code-quality/deepsource.md) | Static analysis + **autofix PRs** | Issue list + auto-PR |

This builds on (does not supersede) the earlier 4-tool stack
documented in
[`decisions/process/code-quality-stack.md`](../../process/code-quality-stack.md):
Dependabot + biome + CodeRabbit + Sonarcloud stay; Codecov + Code
Climate + DeepSource are added alongside.

## Why all five

Each tool catches a different failure mode and renders the result on
a different surface:

- **Sonarcloud** — SAST (data-flow-aware), the broadest rule library
  on TS, but its dashboard is the densest signal.
- **CodeRabbit** — LLM-grade review of *intent and design*. Catches
  things rules can't encode (a refactor that breaks a contract, a
  function name that misleads).
- **Codecov** — coverage delta is the most-read PR signal during
  reviews; Sonarcloud also tracks coverage but its rendering is
  buried.
- **Code Climate** — A — F per-file grade is the cheapest "is this
  file getting worse?" glance; complements Sonarcloud's full report.
- **DeepSource** — *only* tool that opens autofix PRs. Cheapest path
  from "issue reported" to "issue fixed in repo".

The user's direction was: *"use everything … so that everything is
done best."* For public-OSS repos, "everything" costs nothing. For
private repos, the family would scale this back — but every family
repo is public per the user's stated posture, so no scale-back
needed.

## Implications

- **`templates/per-site-ci/.github/workflows/ci.yml`** gains three new
  steps:
  - `codecov/codecov-action@v5` after the Vitest run (uploads LCOV).
  - `paambaati/codeclimate-action@v9` (or the Code Climate GitHub App,
    whichever ships the cleaner status check).
  - DeepSource is GitHub-App-native; the `.deepsource.toml` config
    file lands at the repo root via the same template, no workflow
    step required.
- **Repo root config files** added by the template:
  - `codecov.yml` — coverage threshold + flag config
  - `.codeclimate.yml` — engines config (eslint / duplication /
    structure)
  - `.deepsource.toml` — analyser + transformer config
- **Apply via [`runbooks/apply-per-site-ci.md`](../../../runbooks/operations/apply-per-site-ci.md)**
  to every site + package submodule (11 sites + 6 packages).
- **GitHub App installs** are one-time, account-wide:
  - Codecov GitHub App
  - Code Climate Quality GitHub App
  - DeepSource GitHub App
  Sonarcloud + CodeRabbit + Dependabot are already installed.
- **Status-check matrix** on every PR: PR fails if any of
  Sonarcloud quality gate / Codecov coverage threshold / Code
  Climate maintainability gate / DeepSource issue gate fails.
  CodeRabbit posts comments only — no failing check (LLM review is
  advisory).
- **Quota safeguard** ([`rules/never-hit-quotas.md`](../../../rules/interaction/never-hit-quotas.md)):
  every tool runs on free OSS tier with no metering. If the family
  ever flips a repo private, that single repo drops the four
  paid-for-private tools (Codecov, Code Climate, DeepSource,
  Sonarcloud) and runs only Dependabot + biome + CodeRabbit on free
  private tier — documented but not currently in scope.

## Cross-refs

- [Code quality services index](../../../services/code-quality/index.md) — per-tool detail
- [Earlier 4-tool stack decision](../../process/code-quality-stack.md) — supersedes-by-extension; that decision stays the source for biome + Dependabot rationale
- [Per-site CI runbook](../../../runbooks/operations/apply-per-site-ci.md)
- [`templates/per-site-ci/.github/workflows/ci.yml`](../../../templates/per-site-ci/.github/workflows/ci.yml)
- [Repos work independently rule](../../../rules/development/repos-work-independently.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
- [Never hit quotas rule](../../../rules/interaction/never-hit-quotas.md)
