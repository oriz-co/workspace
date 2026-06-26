---
type: rule
title: "GH org secrets, build-time inject"
description: "All shared tokens (analytics keys, third-party API keys) flow from GitHub organization-level Actions secrets into each repo's CI workflow, baked into Astro static output at build time."
tags: [feedback, agent-preferences, secrets, ci, github-actions]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
---

# GH org secrets, build-time inject

## Mechanism

1. Shared tokens (GA4 measurement ID, PostHog project key, Clarity project ID, Fathom site ID, GoatCounter site code, third-party API keys) are stored once as **GitHub organization-level Actions secrets** on `oriz-org`.
2. Each repo's CI workflow references them via `${{ secrets.PUBLIC_GA4_ID }}` etc., exposed into the build job's `env:`.
3. Astro reads them at build time as `PUBLIC_*` env vars (Astro's documented prefix for browser-exposed values).
4. The static output is baked with the values inlined. Deploy to CF Pages or GitHub Pages — no runtime secret store needed.

One source of truth across every app in the org. Rotate the org secret once, every CI run after that picks up the new value on the next deploy.

## Alternative considered

**CF Pages env vars** (set per-project in the CF dashboard) — rejected because it causes per-project drift. Each app would carry its own copy of the same key, rotation becomes 22+ dashboard edits, and the GitHub Pages-hosted landing pages don't get coverage at all (different host). Org-level GH secrets unify both deploy targets under one source.

## On the word "secret"

`PUBLIC_*` env vars in Astro are **public by design** — they ship to the browser as plain strings in the bundled JS. The analytics keys we're injecting (GA4 ID, PostHog project key, etc.) **are supposed to ship to the browser**; they are public identifiers, not credentials. "Secret" in this context means "centrally managed config," not "must stay confidential." Genuine credentials (e.g., write-access API tokens) never go in `PUBLIC_*` and never reach the static output — those stay in workflow-only env (no `PUBLIC_` prefix) and are used only by CI steps.

Related:
- [`zero-in-house-packages-inline-analytics-2026-06-25`](../../../decisions/architecture/packaging/zero-in-house-packages-inline-analytics-2026-06-25.md) — the inline-scripts decision this feeds
