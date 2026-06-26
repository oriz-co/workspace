---
type: rule
title: "Scope-cut: only shipping survives"
description: "Only repos with actual shipping content survive. Anything in-progress, scaffold, or \"will-build-someday\" gets archived. 33 repos cut 2026-06-25."
tags: [feedback, agent-preferences, fleet, scope-cut, build-gate]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
---

The build-gate rule applied to entire repos: if it doesn't ship value to a user today, archive it.

Killed today (33 repos) — categories:

- **14 India-data APIs** — every entry under `repos/oriz/own/svc/api/` (air-quality, currency-rates, flow-fii-dii, gold-silver, ifsc, india-budget, india-holidays, india-petrol-diesel, india-train-schedules, india-weather, mf-nav, mmi-tickertape, nse-bse-tickers, pincode, rbi-rates — `openmodel-shim` was killed earlier).
- **All "scaffold" apps** — cards, finance, health, packages, tools, `oriz-forge-dev-tools-app`, `oriz-cipher-crypto-tools-app`, `oriz-omni-post-app`.
- **2 of 5 books** — `oriz-paisa-book`, `oriz-pdf-book` (meta books not started; only chapter outlines existed).
- **4 Phase A repos created hours earlier** — template, tools, backup-already-was-kept, secrets.
- **1 hub** — status (no probes wired; would have shipped a static "all green" page).
- **1 auth** — auth (orphaned by the no-auth-in-apps-or-apis rule).
- **1 forked extension** — chathub (personal-use-only fork; not distributable to CWS).

Surviving repos (~20):

- blog, journal, me, home
- oriz-ncert-app, oriz-lore-app, oriz-janaushdhi-app
- ai-rewrite-bs-ext, bookmark-mind-bs-ext, dearrow-plus-bs-ext, sops-lens-vsc-ext
- claude-notifications-cli, clear-thought-mcp-server (kept on review)
- userscripts, agent-skills
- freellmapi, omniroute
- oriz-janaushdhi-book, oriz-me-book, oriz-stack-book (kept on review)
- backup, oriz-portfolio-engine-app

Some "kept on review" entries above may need a second-pass check.

Generalizes [`build-gate-top3-must-have-defect`](../../../decisions/architecture/fleet/build-gate-top3-must-have-defect.md) from features to repos.

Related: [`zero-in-house-packages-inline-analytics-2026-06-25`](../../../decisions/architecture/packaging/zero-in-house-packages-inline-analytics-2026-06-25.md) (similar scope-cut, applied to packages).

Why same-day reversal of Phase A: template, tools, secrets were created speculatively. None had shipping content; all met the kill criterion.
