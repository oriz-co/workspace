---
type: rule
title: "Atomic packages — extract lazily on second use"
description: "When 2+ apps need the same logic, extract to a tiny @oriz/* npm package or oriz-* PyPI package. Concern-atomic (one concern, 3-5 exports, 100-300 LOC). Build only when forced."
tags: [feedback, packaging, agent-preferences]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
---

When the same logic is needed in 2 or more apps, extract it to an atomic package.

**Rules:**
- **Trigger:** ≥2 apps need the same logic AND no community equivalent exists at the size/shape we need.
- **Atomicity:** One concern per package. 3-5 exports max. ~100-300 LOC. NOT a one-function-per-package extreme; NOT a domain SDK either.
- **Namespaces:**
  - npm: `@oriz/<concern>` (e.g. `@oriz/analytics`, `@oriz/donations`, `@oriz/india-currency`)
  - PyPI: `oriz-<concern>` (e.g. `oriz-llm-providers`, `oriz-india-data-fetchers`)
- **Scope:** Astro/React components, vanilla TS utilities, India-data formatters, scraper helpers for APIs. NOT auth (that's a separate project per `no-auth-in-apps-or-apis`), NOT analytics WRAPPER (analytics stay inline per `zero-in-house-packages-inline-analytics` until 2+ apps need the same custom event shape).
- **Repo home:** Each package lives in its own repo at `oriz-org/<slug>-npm-pkg` or `oriz-org/<slug>-py-pkg`. Submodule at `repos/own/<slug>-<npm|py>-pkg/`.

**Does NOT reverse:**
- The 23 archived packages stay archived. They were speculative / SDK-shaped; the new rule is the opposite.
- Analytics stays inline in apps unless we need a custom event-tracking helper across 2+ apps.
- Auth stays out of apps. A future `@oriz/login-redirect` thin client could exist when the separate login project ships.

**Reverses:**
- The strict "zero in-house packages" reading of `zero-in-house-packages-inline-analytics`. That rule still applies to analytics specifically (stay inline) but no longer applies as a blanket package ban.

**How to apply when 2nd app demands the same logic:**
1. Verify no community package exists at the right size/shape.
2. Create the repo: `gh repo create oriz-org/<slug>-npm-pkg --public --description "<one-liner>"`.
3. Add as submodule: `git submodule add ... repos/own/<slug>-npm-pkg`.
4. Publish to npm with provenance enabled.
5. Document the package in `knowledge/services/<area>/<slug>.md` with OKF frontmatter.
6. Both apps adopt it on next touch; no big-bang migration.

**Documentation:**
- Every atomic package gets a `knowledge/services/<area>/<slug>.md` OKF entry.
- AGENTS.md auto-rebuild picks up new packages on next sync.

**Related:**
- [`zero-in-house-packages-inline-analytics-2026-06-25`](../../../decisions/architecture/packaging/zero-in-house-packages-inline-analytics-2026-06-25.md) — analytics is still inline (this rule scopes that one down to analytics-only).
- [`lean-by-need-not-count`](./lean-by-need-not-count.md) — build-gate applies to packages.
- [`scope-cut-2026-06-25`](../../../decisions/architecture/fleet/scope-cut-2026-06-25.md) — only build packages used today.
- [`github-repo-names-are-brand-identity`](./github-repo-names-are-brand-identity.md) — package repo names are brand identity, picked carefully.
