---
type: decision
title: "Time tracking \u2014 Wakatime ONLY (Toggl walked back)"
description: 'Locked 2026-06-20 (walked back same day): time tracking is Wakatime
  ONLY. Wakatime auto-tracks coding time via IDE plugin (VS Code + JetBrains). Toggl
  Track was originally adopted alongside it for manual non-coding tracking, then walked
  back the same day under the new auto-only-tracking rule. Non-coding time is intentionally
  NOT tracked rather than manually tracked. File renamed via git mv from time-tracking-toggl-plus-wakatime.md.'
tags:
- decisions
- architecture
- productivity
- time-tracking
- wakatime
- toggl-rejected
- walk-back
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/productivity/wakatime
- services/productivity/toggl-track
- rules/interaction/auto-only-tracking
- decisions/architecture/general/auto-tracking-everywhere
- decisions/branding/oriz-me-added-to-family
- decisions/architecture/database/lifestream-jsonl-canonical
- rules/interaction/no-card-on-file
- rules/infrastructure/no-subscriptions
---



# Time tracking — Wakatime ONLY (Toggl walked back)

## Decision

Time tracking across the family is **Wakatime, automatic, only**.

- **[Wakatime](../../../services/productivity/wakatime.md)** —
  automatic coding-time tracking via IDE plugin (VS Code, Cursor,
  JetBrains family). Free auto-tracking with daily / weekly / monthly
  charts. Recruiter-facing public dashboard at
  `wakatime.com/@chirag127`. **Sole pick.**
- **[Toggl Track](../../../services/productivity/toggl-track.md)** —
  REJECTED. Originally adopted earlier on 2026-06-20 (Batch 19) as
  the manual half of a two-tool split; walked back the same day
  under the new family-wide
  [auto-only-tracking rule](../../../rules/interaction/auto-only-tracking.md).
- **Non-coding time is intentionally NOT tracked.** Meetings,
  planning, calls, learning sessions — untracked. The honest read of
  "what was the user doing during a 2-hour Wakatime gap?" is "away
  from the keyboard", not "they should manually fill it in later".

This file was renamed via `git mv` from
`time-tracking-toggl-plus-wakatime.md` to reflect the new content.
History is preserved.

User direction (chronological, same day 2026-06-20):

1. Earlier: "Toggl + Wakatime both."
2. Later: "I want everything to be automatically tracked no manual
   tracking."

The later direction wins per
[`rules/future-overrides-past.md`](../../../rules/interaction/future-overrides-past.md).

## Why

- **Manual tracking decays.** Humans forget to start timers, fudge
  stops, skip days, retro-fill incorrectly. The resulting data is
  dishonest, which makes it worse than no data.
- **Auto-tracking is honest.** Wakatime's IDE-plugin heartbeat
  records what actually happened — no human in the loop, no
  "I'll write it down later" failure mode.
- **Untracked time is a feature, not a bug.** A 2-hour gap in
  Wakatime data is information: the user was away from the keyboard.
  That's a fact worth capturing as untracked, not a hole to paper
  over with a fabricated manual entry.
- **Family-wide consistency.** Every other tracked metric in the
  family is already auto (errors → Sentry, page views → CF Web
  Analytics + GA4 + Clarity, logs → CF Workers Tail + Better Stack,
  uptime → Better Stack pings). Time tracking was the only manual
  outlier; the auto-only rule normalises it. See
  [`auto-tracking-everywhere`](../general/auto-tracking-everywhere.md) for the
  family-wide pattern.
- **Wakatime stays free + no-card.** The 2-week-history limitation is
  mitigated by daily lifestream JSONL export (the API is the funnel,
  JSONL is the durable archive). Fits
  [`rules/no-card-on-file`](../../../rules/interaction/no-card-on-file.md) +
  [`rules/no-subscriptions`](../../../rules/infrastructure/no-subscriptions.md).
- **Wakatime's recruiter-facing dashboard** is a public artifact
  that surfaces "what tech stack the user actually uses" — pairs
  with the everything-is-public-OSS posture per
  [`repos-work-independently`](../../../rules/development/repos-work-independently.md)
  and the donation rails per
  [`max-payment-methods`](../../monetisation/max-payment-methods.md).

## Why not the rejected options

| Tool | Why rejected |
|---|---|
| Toggl Track | **Walked back 2026-06-20.** Manual timer = manual data entry → violates [auto-only-tracking rule](../../../rules/interaction/auto-only-tracking.md). Free tier was fine; the rejection is on the manual-tracking dimension, not billing. |
| RescueTime | Auto-tracker in principle but full reports require Premium subscription (card-on-file); also overlaps Wakatime's coding scope without IDE-classification depth. |
| Clockify | Manual tracker → same auto-only rejection as Toggl. |
| Harvest | Card-required past 1 user / 2 projects; manual + invoice-shaped. |
| Tempo (Jira) | Requires Jira — already rejected per [`bug-tracker-github-issues-only`](../general/bug-tracker-github-issues-only.md). Also manual. |
| Timing.app | Mac-only, paid-only. |
| Toggl Plan / Asana time tracking | Bundled in heavier project tools — already rejected per [`project-mgmt-github-projects-only`](../general/project-mgmt-github-projects-only.md). |
| Manual spreadsheet / paper journal / iOS Reminders timer | All manual → auto-only rejection. |

## Implications

### Surface coverage

| Activity type | Captured? | How |
|---|---|---|
| Coding (any IDE-seen edit) | YES | Wakatime auto via IDE plugin heartbeat |
| Meeting / call / Zoom | NO (intentional) | Untracked — not a system metric in the family |
| Planning / design / writing | NO (intentional) | Untracked — not a system metric |
| Reading / learning | NO (intentional) | Untracked — not a system metric |
| Browsing / triage | NO (intentional) | Untracked — not a system metric |

If a non-coding-time signal is ever needed in the future, the
answer is **make it auto** (e.g. ingest from Google Calendar API,
not "ask the user to start a timer"). That call lands as a new
decision, not a re-adoption of Toggl.

### Setup (one-time)

```bash
# Wakatime — install per IDE
code --install-extension WakaTime.vscode-wakatime
# JetBrains: Settings → Plugins → Marketplace → "WakaTime"
# API key from wakatime.com/settings/account → ~/.wakatime.cfg
```

API key originates at
[Doppler](../../../services/secrets/doppler.md) per
[`secrets-management-doppler`](../../security/secrets-management-doppler.md);
not committed anywhere.

### Toggl walk-back — concrete steps

- **No Toggl Track account is created.** If one was created during
  the brief Batch 19 adoption window earlier today, it stays unused
  and will be deleted at next account-cleanup pass.
- **No `TOGGL_API_TOKEN`** in [Doppler](../../../services/secrets/doppler.md)
  or any runtime secret store.
- **No lifestream ingest** of Toggl data — the future
  [lifestream](../database/lifestream-jsonl-canonical.md) pulls from auto
  sources only (Wakatime API, GitHub commits, npm publishes, CI
  events, CF Web Analytics — see
  [`auto-tracking-everywhere`](../general/auto-tracking-everywhere.md)).
- **The `services/productivity/toggl-track.md` file stays** with
  `status: rejected` for audit trail per the family pattern of
  "flip status, never delete".

### Tag / project conventions

- **Wakatime auto-classifies** by git repo + language, so no
  manual setup beyond installing the plugin. Tags / projects line
  up automatically with `chirag127/oriz*` repo names on disk.

### Lifestream integration (future)

When `oriz-me` ingest pipelines land per
[`lifestream-jsonl-canonical`](../database/lifestream-jsonl-canonical.md):

- **Wakatime ingest** — daily cron pulls
  `/users/current/summaries` from Wakatime API
  (`wakatime.com/api/v1`), maps to JSONL events of shape
  `{ "type": "code-summary-wakatime", "ts": ..., "duration_s": N, "language": "...", "project": "..." }`.
- This feed powers the "where did the time go?" panel on
  `me.oriz.in` (auth-gated per
  [`journal-stays-auth-gated`](../../content/journal-stays-auth-gated.md)
  if the user keeps the panel private; or public-aggregate
  per `wakatime.com/@chirag127`'s existing public surface).
- No Toggl ingest line.

### What we don't do

- **No paid tier on Wakatime.** Free covers rolling-2-week history;
  long-term history is handled by the lifestream daily-export
  pattern (JSONL is durable; the API is just the funnel).
- **No Toggl Track.** Or any other manual tracker. Or a spreadsheet.
  Or a Discord-bot `/track` command. Or anything that requires the
  user to push a button to record time.
- **No team-shared workspaces.** Wakatime is single-user; no team.
- **No automated context-switching detection.** If the user is on a
  meeting and Wakatime sees no coding, that's correctly recorded as
  no coding — the meeting itself is intentionally untracked.

## Cross-refs

- [Wakatime service entry](../../../services/productivity/wakatime.md) — sole time-tracking pick
- [Toggl Track service entry — REJECTED](../../../services/productivity/toggl-track.md) — audit trail
- [Productivity services index](../../../services/productivity/index.md)
- [Auto-only-tracking rule](../../../rules/interaction/auto-only-tracking.md) — the rule that rejected Toggl
- [Auto-tracking-everywhere decision](../general/auto-tracking-everywhere.md) — family-wide auto-only principle
- [Future overrides past rule](../../../rules/interaction/future-overrides-past.md) — why the later "auto only" direction wins over the earlier "Toggl + Wakatime both"
- [oriz-me added to family](../../branding/oriz-me-added-to-family.md) — lifestream consumes Wakatime data
- [Lifestream JSONL canonical](../database/lifestream-jsonl-canonical.md) — JSONL shape for ingested time entries
- [Secrets management — Doppler](../../security/secrets-management-doppler.md) — API key
- [Project mgmt — GitHub Projects only](../general/project-mgmt-github-projects-only.md) — separate concern (plan vs. effort actuals)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
- [No subscriptions rule](../../../rules/infrastructure/no-subscriptions.md)
