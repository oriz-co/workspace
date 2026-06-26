# OmniRoute upstream issue — Turbopack 16.2.x dev-server panic

- **Issue:** [diegosouzapw/OmniRoute#5079](https://github.com/diegosouzapw/OmniRoute/issues/5079)
- **Title:** `fix(dev): Turbopack 16.2.x panics in `next dev`; webpack fallback works`
- **Filed:** 2026-06-26
- **Filed by:** chirag127
- **Framing:** FYI / heads-up (not "please merge")
- **Status:** open

## Our downstream patch

- Repo: `oriz-org/omniroute`
- Commit: [`81f40e0da`](https://github.com/oriz-org/omniroute/commit/81f40e0dab8bca76e5ba417f91edc09d79399a1b)
- Changes: `.env.example` (default flip `OMNIROUTE_USE_TURBOPACK=1` → `0`) + `scripts/dev/run-next.mjs` (pass `webpack: !useTurbopack` AND `delete process.env.TURBOPACK`)
- Why both: passing `turbopack: false` to programmatic `next()` isn't enough — `parseBundlerArgs` falls back to `TURBOPACK=auto` and `next-dev-server.js` reads that env var directly, silently re-opting into Turbopack.

## Context links

- Prior upstream workaround for the same bug class in the Docker prod build: PR #4052
- Upstream activity: very active (release v3.8.37 cut today, 2026-06-26)
- Related-but-distinct issues already closed: #509 (Electron hashed-module refs), #4076 (Docker build OOM)

## Pre-file checks completed

- `gh issue list --search "turbopack OR panic"`: no exact duplicate for the dev-server panic surface.
- Upstream commit cadence: same-day commits today. Filing not wasted.

## Standing rule applied

[fork-features-also-as-upstream-issues](C:/Users/C5420321/.claude/projects/C--d-oriz/memory/fork-features-also-as-upstream-issues.md) — patch local fork + file issue upstream, no PR.

## Follow-ups

- Do NOT submit a PR.
- Do NOT @-mention the owner.
- Revisit if upstream replies, or when Turbopack ships a fix for the `module_graph/mod.rs:662` panic.
