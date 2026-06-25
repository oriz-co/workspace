---
type: decision
title: "Testing \u2014 three-layer stack (Vitest unit + Playwright E2E + Storybook+Chromatic\
  \ visual)"
description: Every PR runs Vitest unit, Playwright E2E, and Chromatic visual-regression
  against Storybook in parallel. PR fails on any failure in any layer. All free, no
  card.
tags:
- decisions
- architecture
- testing
- vitest
- playwright
- storybook
- chromatic
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/testing/vitest
- services/testing/playwright
- services/testing/storybook
- services/testing/chromatic
- services/a11y/axe-core
- decisions/architecture/stack/a11y-three-tools
- decisions/process/code-quality-stack
---



# Testing — three-layer stack (Vitest unit + Playwright E2E + Storybook+Chromatic visual)

## Decision

Every site's and every package's per-PR CI runs **three layers** of
tests in parallel after the Cloudflare Pages preview deploy lands:

1. **Unit / integration** — [Vitest](../../../services/testing/vitest.md). Fast,
   in-memory, Vite-native; runs every `*.test.ts` file.
2. **End-to-end** — [Playwright](../../../services/testing/playwright.md). Real
   browser (Chromium + WebKit + Firefox) against the preview URL.
   Already the substrate the
   [a11y axe-core suite](../stack/a11y-three-tools.md) rides on.
3. **Visual regression** —
   [Storybook](../../../services/testing/storybook.md) +
   [Chromatic](../../../services/testing/chromatic.md). Storybook
   declares canonical states; Chromatic diffs them against the
   baseline branch.

PR fails on **any** failure in **any** layer. All three layers are
free, no card. The visual-regression layer requires explicit
human acceptance of any declared diff.

## Why

- **No single layer catches everything.** Vitest catches logic
  bugs but not focus / scroll / keyboard-nav issues. Playwright
  catches browser behaviour but is expensive to write per
  component state. Chromatic catches "this CSS change broke
  something unrelated" — a class of regression the other two
  miss entirely.
- **Cost is zero.** All three layers are free. Vitest, Playwright,
  and Storybook are OSS; Chromatic's free tier (5K snapshots/mo) is
  a 5-10x buffer over family-scale traffic.
- **Reuses substrate already required by the
  [a11y trio](../stack/a11y-three-tools.md).** Playwright is already
  installed for axe-core + Pa11y; the E2E suite shares the same
  browser context. Net new install surface = `vitest` +
  `storybook` + `@chromatic-com/storybook` + `chromaui/action`.
- **Different views serve different reviewers.** Vitest produces
  a fast pass/fail. Playwright produces a trace viewer for
  failure triage. Chromatic produces a UI for accepting visual
  diffs. The Sonarcloud quality gate (from the
  [code-quality stack](../../process/code-quality-stack.md)) consumes
  Vitest's coverage report.

## Implications

### Architecture

- Three new GitHub Actions jobs in each site's `ci.yml`:
  - `test-unit` — `pnpm vitest run --coverage`. Coverage uploads to
    Sonarcloud.
  - `test-e2e` — depends on the Cloudflare Pages preview deploy;
    runs `pnpm playwright test` against `$PREVIEW_URL`. Reuses the
    Playwright install the a11y trio already needs.
  - `test-visual` — `pnpm storybook build` then
    `chromaui/action@v11`. Posts the Visual-changes check back on
    the PR; explicit accept required.
- Shared test scaffolding ships from
  `@chirag127/oriz-kit/testing/`:
  - `vitest.config.shared.ts` (path aliases, jsdom + happy-dom
    selection, MSW setup)
  - `playwright.config.shared.ts` (3-browser matrix, trace + video
    on retry, base URL from env)
  - `storybook/preview.ts` + the family's theme decorators
- Story files live next to the component: `Foo.tsx` +
  `Foo.stories.tsx`. Test files under `tests/` (unit + E2E) and
  `stories/` (visual).
- Chromatic's TurboSnap is enabled via `onlyChanged: true` to
  avoid snapshot burn on no-op PRs.

### Coupling to existing stacks

- **A11y trio** — axe-core is invoked from the same Playwright
  install. Test files under `tests/a11y/` reuse the
  `playwright.config.shared.ts`. The two stacks (a11y + testing)
  are independently failing — passing one does not let the other
  off the hook.
- **Code-quality stack** — Sonarcloud's coverage gate consumes
  `coverage/lcov.info` from Vitest. CodeRabbit reads test diffs
  for review-comment context. Dependabot batches updates for all
  test-tier packages weekly.
- **Per-repo CI workflows** — each repo owns its own `ci.yml` per
  the [per-repo CI decision](../../process/per-repo-ci-workflows.md).
  The shared kit ships the configs; per-repo files are thin
  wrappers.

### Per-PR gating

- **Any failure fails the PR** — same posture as the a11y trio.
- Visual diffs **must be explicitly accepted** in Chromatic's UI;
  the PR check stays red until acceptance lands. Acceptance is
  the design author's call, recorded in Chromatic's audit log.
- Flaky-test budget: Playwright retries are capped at 1 in CI;
  any retry-required test gets a `@flaky` tag and an issue. No
  global retry-twice posture — that hides real regressions.

### What we don't do

- **No paid testing tools** — Percy / Cypress Cloud / BrowserStack
  paid tiers all fight the no-paid-tier posture; covered by free
  alternatives.
- **No "warn-only" gating.** Same logic as the
  [a11y trio](../stack/a11y-three-tools.md): warn-only across 11+ sites is
  indistinguishable from off.
- **No JSDOM-only test posture.** Browser behaviour goes through
  Playwright; Vitest's `jsdom` env is reserved for trivially
  DOM-touching unit cases.
- **No skipping visual regression on docs-only PRs.** TurboSnap
  short-circuits unchanged stories; no manual skip.

## Cross-refs

- [Vitest service entry](../../../services/testing/vitest.md)
- [Playwright service entry](../../../services/testing/playwright.md)
- [Storybook service entry](../../../services/testing/storybook.md)
- [Chromatic service entry](../../../services/testing/chromatic.md)
- [testing services index](../../../services/testing/index.md)
- [a11y three-tools decision — rides on the same Playwright install](../stack/a11y-three-tools.md)
- [Code-quality stack decision](../../process/code-quality-stack.md)
- [Per-repo CI workflows decision](../../process/per-repo-ci-workflows.md)
- [oriz-ui split into 5 packages](../oriz-ui-split-into-5-packages.md)
- [Doppler — secrets source-of-truth](../../../services/secrets/doppler.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
- [Never hit quotas rule](../../../rules/interaction/never-hit-quotas.md)
