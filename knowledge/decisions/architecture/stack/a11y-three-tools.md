---
type: decision
title: "Accessibility \u2014 three-tool stack (axe + Pa11y + Lighthouse CI)"
description: Every PR runs axe-core, Pa11y, and Lighthouse CI in parallel. PR fails
  on any new a11y violation in any tool. Each tool catches a different category.
tags:
- decisions
- architecture
- a11y
- accessibility
- axe
- pa11y
- lighthouse
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/a11y/axe-core
- services/a11y/pa11y
- services/a11y/lighthouse-ci
- decisions/process/code-quality-stack
---



# Accessibility — three-tool stack (axe + Pa11y + Lighthouse CI)

## Decision

Every site's per-PR CI runs **all three** a11y tools in parallel:

1. [axe-core](../../../services/a11y/axe-core.md) — Deque's static
   rule engine, run via `@axe-core/playwright`.
2. [Pa11y](../../../services/a11y/pa11y.md) — dynamic runner with the
   HTMLCS ruleset (and axe runner alongside).
3. [Lighthouse CI](../../../services/a11y/lighthouse-ci.md) — score
   + perf budget, posted as a PR comment.

PR fails on any **new** violation in any of the three tools. The
a11y category in Lighthouse CI is required to score 100. All three
are free, OSS, no card.

## Why

- **No single tool catches everything.** axe is the industry-
  standard rule engine but Deque's catalog is finite. Pa11y's
  HTMLCS catches a slightly different set of structural / visual
  rules. Lighthouse CI catches presence-of-best-practice rules
  Lighthouse alone scores on (e.g. landmarks, lang attribute).
- **Cost is zero.** All three are OSS, run inside the existing
  GitHub Actions runner against the existing Playwright install. No
  new vendor, no card.
- **Different views serve different reviewers.** axe + Pa11y print
  violations (good for a fix-list); Lighthouse posts a PR comment
  with a score (good for reviewer at-a-glance). Both views matter.
- **Aligns with the [code-quality stack](../../process/code-quality-stack.md)**
  — that decision locks the family on layered tooling
  (Dependabot + biome + CodeRabbit + Sonarcloud); a11y deserves the
  same defensive layering.

## Implications

### Architecture

- Three GitHub Actions jobs in each site's `ci.yml`:
  - `a11y-axe` — runs Playwright + `@axe-core/playwright` over the
    site's key routes.
  - `a11y-pa11y` — runs `pa11y-ci` against the Cloudflare Pages
    preview URL.
  - `lighthouse-ci` — runs `treosh/lighthouse-ci-action@v11` and
    posts the score as a PR comment.
- All three jobs depend on the Cloudflare Pages preview deploy
  job; they can run in parallel after the preview is up.
- Tests live under `tests/a11y/` per site; the kit ships a baseline
  spec at `@chirag127/oriz-kit/testing/a11y.spec.ts` that each site
  imports + extends with its own routes.
- `lighthouserc.json` per site sets the assertions — a11y minScore
  1.0 (required), perf 0.9, best-practices 0.95, SEO 1.0.

### Per-PR gating

- **Any** violation fails the PR — no warnings, no exceptions. If
  a finding is a known false positive, it's silenced via the tool's
  config (axe: `disableRules`; Pa11y: `ignore`; Lighthouse: per-rule
  `assertions: off`) and a comment in the config explains why.
- The Sonarcloud quality gate (from the code-quality stack) treats
  these as separate jobs — they don't collapse into one score.

### Why fail-on-any vs warn-only

- The family's site count (11+) makes "warn-only" indistinguishable
  from "off" — no one chases a long warning list across 11 PRs.
- All three tools are tunable via config — false positives become
  documented `ignore` entries, not silent passes.
- Aligns with the `never-hit-quotas` philosophy applied to quality:
  fail loudly, never drift silently.

### What we don't do

- **No paid a11y tools** — accessibility-checker (IBM) is OSS but
  smaller community; WAVE API is paid past its free tier; Axe DevTools
  Pro is paid. Three free tools cover us.
- **No manual a11y review as the only check** — manual review still
  happens for keyboard-nav and screen-reader UX (per
  [`design/family-rules.md`](../../../design/family-rules.md) if it
  exists in the family rules), but the automated trio is the floor.
- **No suppressing failures across the board.** Tunable per-rule via
  config files; suppressing globally is not.

## Cross-refs

- [axe-core service entry](../../../services/a11y/axe-core.md)
- [Pa11y service entry](../../../services/a11y/pa11y.md)
- [Lighthouse CI service entry](../../../services/a11y/lighthouse-ci.md)
- [a11y services index](../../../services/a11y/index.md)
- [Code-quality stack decision](../../process/code-quality-stack.md)
- [Per-repo CI workflows decision](../../process/per-repo-ci-workflows.md)
- [Perf monitoring decision (Lighthouse CI also feeds perf budget)](../ops/perf-monitoring-vercel-speed-insights.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
