---
type: index
title: "Family rules — index"
description: "The non-negotiable rules every oriz repo follows. One file per atomic rule; this file is the table of contents."
tags: [rules, index, meta]
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
---

# Family rules — index

These are the rules every `chirag127/oriz*` repo and every agent
working in the family must follow. They override anything an agent
might otherwise assume from training data or convenience.

If a chat decision contradicts a rule here, see
[`future-overrides-past.md`](./future-overrides-past.md) — the chat
wins, and the rule file is updated in the same conversation.

## Operational HOW for fan-out

- [`parallel-fan-out-by-default.md`](./parallel-fan-out-by-default.md) — concrete HOW for the parallel-by-default rule: use the `Agent` tool with `run_in_background: true`, send 3-6 subagents per turn for independent work, await `<task-notification>` events, commit + push after each batch. Sized to dodge Anthropic context-window limits.

## The five non-negotiables (from AGENTS.md §"five non-negotiable rules")

1. [`never-hit-quotas.md`](./never-hit-quotas.md) — architect for headroom; surprise quota walls are a design failure.
2. [`no-card-on-file.md`](./no-card-on-file.md) — Cloudflare Free / Firebase Spark / GitHub Free only; no card EVER.
3. [`self-update-rule.md`](./self-update-rule.md) — every chat decision lands in `knowledge/` in the same conversation.
4. [`future-overrides-past.md`](./future-overrides-past.md) — when chat contradicts knowledge, chat wins; knowledge updates.
5. [`parallel-by-default.md`](./parallel-by-default.md) — fan-out subagents for any parallelisable work.

## Auto-only tracking (family-wide goal)

- [`auto-only-tracking.md`](./auto-only-tracking.md) — every tracked metric in the family must be automatically captured. Manual entry, manual timer, manual journal NOT allowed for system metrics. Manual = decay; auto = honest. Rejects [Toggl Track](../services/productivity/toggl-track.md) (manual timer); locks [Wakatime](../services/productivity/wakatime.md) as sole time-tracking pick. Applies to METRICS, not content (journal entries on `oriz-journal-site` are intentionally manual creative writing — that's CONTENT, not a metric).

## Stricter than no-card

- [`no-subscriptions.md`](./no-subscriptions.md) — no service requiring a subscription, ever; no "free trial then pay".
- [`cloudflare-pages-only.md`](./cloudflare-pages-only.md) — every website and every app in the family hosts on Cloudflare Pages. No exceptions. GitHub Pages is the per-site survival mirror only; Firebase Hosting / Vercel / Netlify / Render / Fly all rejected.

## Git rules

- [`one-branch-only.md`](./one-branch-only.md) — only `main`, in master + every submodule.
- [`push-by-default.md`](./push-by-default.md) — commit AND push to main immediately after every change. Standing authorisation 2026-06-20. Replaces the retired no-push-without-say-so rule. Outward-effect actions (repo delete, paid APIs, store publish) still need confirmation.
- [`no-force-push-to-main.md`](./no-force-push-to-main.md) — separate explicit instruction required.
- [`conventional-commits.md`](./conventional-commits.md) — `feat` / `fix` / `chore` / `docs` / `refactor` / `test`.
- [`repo-naming.md`](./repo-naming.md) — every new repo slug ends in `-site` / `-ext` / `-vsc-ext` / `-cli` / `-worker` / `-fn` / `-data`, or is a clean npm-package name. Audit before publish.
- [`never-delete-empty-placeholder-repos.md`](./never-delete-empty-placeholder-repos.md) — empty repos in the `chirag127/oriz*` family are deliberate slug reservations, not cleanup candidates. `gh repo delete` requires explicit, repo-named, current-conversation user authorisation, even on empty repos.

## Stack / runtime constraints

- [`no-hardcoded-secrets.md`](./no-hardcoded-secrets.md) — everything via envpact.
- [`no-firebase-admin-in-workers.md`](./no-firebase-admin-in-workers.md) — gRPC incompat; use `firebase-rest-firestore`.
- [`no-web3forms-server-side.md`](./no-web3forms-server-side.md) — browser-side only.
- [`no-ad-slots-in-markup.md`](./no-ad-slots-in-markup.md) — AdSense / Ezoic / Mediavine inject at runtime.

## Tooling / dependencies

- [`always-latest-deps.md`](./always-latest-deps.md) — `pnpm add <pkg>@latest`; weekly `pnpm update --latest --recursive`.
- [`repos-work-independently.md`](./repos-work-independently.md) — every submodule must `pnpm install && pnpm build` standalone.
- [`use-pnpm.md`](./use-pnpm.md) — pnpm only, family-wide; the global store is what makes "no duplication" work.
- [`single-env-example-per-repo.md`](./single-env-example-per-repo.md) — **SUPERSEDED 2026-06-20** by [`env-example-synced-from-master.md`](./env-example-synced-from-master.md). Kept for audit trail.
- [`env-example-synced-from-master.md`](./env-example-synced-from-master.md) — canonical `.env.example` at master `templates/.env.example`; every other repo's copy is synced via [`scripts/sync-env-example.sh`](../../scripts/sync-env-example.sh); CI fails on drift; no comments. Pairs with [`github-org-level-secrets.md`](./github-org-level-secrets.md) and the [two-track decision](../decisions/security/env-and-secrets-single-source.md).
- [`github-org-level-secrets.md`](./github-org-level-secrets.md) — every GitHub Actions secret lives at the `chirag127` ORG level (`gh secret set --org chirag127 --visibility all`); per-repo writes are forbidden — they cause drift. Doppler stays upstream; org-level GH secrets are the runtime CI mirror.

## Design + style rules

- [`no-emoji-in-chrome.md`](./no-emoji-in-chrome.md) — per family design rules.
- [`match-surrounding-style.md`](./match-surrounding-style.md) — semicolons, indent, quotes match the file you're in.

## Agent-harness rules

- [`read-before-edit.md`](./read-before-edit.md) — always Read before Edit; the harness enforces it.

## MCQ-learned tastes

- [`user-prefers-atomic-split.md`](./user-prefers-atomic-split.md) — when offered fewer-larger-units vs. more-smaller-units, default to more-smaller (repos, packages, files). Mined from override patterns.
- [`user-prefers-wider-coverage.md`](./user-prefers-wider-coverage.md) — for content / brand surfaces, default to wider scope over narrower; for tools, default to narrower-and-deeper. Mined from override patterns.
