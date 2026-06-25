---
type: rule
title: Auto-only tracking
description: Every tracked metric in the chirag127/oriz family must be automatically
  captured. Manual entry, manual timer, manual journal not allowed for anything that's
  a system metric. Manual = decay; auto = honest. Applies to METRICS, not content.
tags:
- rules
- tracking
- observability
- metrics
- auto
- free-tier
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- rules/interaction/never-hit-quotas
- rules/interaction/no-card-on-file
- decisions/architecture/general/auto-tracking-everywhere
- decisions/architecture/ops/time-tracking-wakatime-only
- decisions/architecture/database/lifestream-jsonl-canonical
- services/productivity/wakatime
- services/analytics/cloudflare-web-analytics
- services/monitoring/sentry
---



# Auto-only tracking

Every tracked metric in the `chirag127/oriz*` family must be
**automatically captured**. Manual entry, manual timer, manual
journal — not allowed for anything that is a system metric.

## What

If a thing is a metric — a number, a timestamp, a duration, a
count, an event, a state, a status — its capture must be
automatic. No "I'll write it down later". No "start the timer
when the meeting begins". No spreadsheet column the user types
into. No Discord-bot `/log` command. No daily standup form.

If automatic capture for a metric is not possible today, **the
metric is not tracked** until it can be made automatic. We do
not fall back to manual.

## Why

- **Manual tracking decays.** Humans forget to start, fudge stops,
  skip days, retro-fill incorrectly, lie about durations to make
  themselves feel better. The data drifts further from reality
  every week.
- **Dishonest data is worse than no data.** A manual time-tracking
  log that says "8 hours of deep work" when the truth was 4 hours
  of deep work + 4 hours of context-switching produces wrong
  decisions downstream. Untracked is honest; manual-tracked is
  often dishonest.
- **Untracked is information.** A 2-hour gap in Wakatime data is
  a fact: the user was away from the keyboard. That gap is worth
  capturing as a gap, not papered over.
- **Auto scales.** Adding a new tracked dimension means adding a
  hook / SDK / cron job once, and from then on it captures forever.
  Manual tracking has linear cost-per-metric in human attention,
  which is the scarce resource.

## How — examples in the current stack

| Metric | Auto source |
|---|---|
| Coding time | [Wakatime](../../services/productivity/wakatime.md) IDE plugin (heartbeat on file activity) |
| Page views | [Cloudflare Web Analytics](../../services/analytics/cloudflare-web-analytics.md) + [GA4](../../services/analytics/index.md) + [Microsoft Clarity](../../services/analytics/microsoft-clarity.md) |
| Errors / exceptions | [Sentry](../../services/monitoring/sentry.md) SDK |
| Operational logs | [Cloudflare Workers Tail](../../services/monitoring/cloudflare-workers-tail.md) (live) + [Better Stack Logs](../../services/monitoring/better-stack-logs.md) (aggregation) |
| Uptime | [Better Stack](../../services/monitoring/better-stack.md) + [Instatus](../../services/monitoring/instatus.md) auto pings |
| Lifestream events | JSONL append on git events / npm publish events / CI events (auto webhook → CF Worker → JSONL) |
| Build success / fail | [GitHub Actions](../../services/cron/github-actions-schedule.md) workflow status |
| Spending | Would be manual → therefore the family does not spend money. The [no-card-on-file rule](./no-card-on-file.md) enforces this from the other direction. |

## When NOT to apply this rule

This rule applies to **METRICS, not content**.

- **Journal / thoughts entries on `oriz-journal-site`** are
  intentionally manual creative writing. They are CONTENT that
  the user *wants* to write. They are not a system metric.
- **Blog posts, README files, design briefs, knowledge bundle
  entries** — same: intentionally human-written content, not
  metrics.
- **Code itself** is content, not a metric.

The line: if the value is "what was the user doing / how much /
when?" → metric, must be auto. If the value is "what does the
user want to say?" → content, manual is fine and expected.

## Concrete walk-back consequences

- **Toggl Track REJECTED** as of 2026-06-20 (same day it was
  adopted). Manual timer = manual data entry. See
  [`services/productivity/toggl-track`](../../services/productivity/toggl-track.md)
  for the audit trail and
  [`decisions/architecture/time-tracking-wakatime-only`](../../decisions/architecture/ops/time-tracking-wakatime-only.md)
  for the walk-back narrative.
- **Wakatime stays** as the sole time-tracking pick — auto via
  IDE plugin, fits the rule.
- **Future tracking decisions** must justify their auto-capture
  story up front. "We'll add a manual fallback for non-coding
  time" → no, by this rule.

## Exceptions

None for metrics. Content is not subject to this rule (see
"When NOT to apply" above).

## See also

- [`decisions/architecture/auto-tracking-everywhere.md`](../../decisions/architecture/general/auto-tracking-everywhere.md) — the family-wide decision that locks this principle, with concrete auto-event source list for the lifestream
- [`decisions/architecture/time-tracking-wakatime-only.md`](../../decisions/architecture/ops/time-tracking-wakatime-only.md) — the walk-back of Toggl
- [`decisions/architecture/lifestream-jsonl-canonical.md`](../../decisions/architecture/database/lifestream-jsonl-canonical.md) — the JSONL stream that consumes auto sources
- [`rules/never-hit-quotas.md`](./never-hit-quotas.md) — paired rule on the architecture-not-survival posture
- [`rules/no-card-on-file.md`](./no-card-on-file.md) — auto-tracking spending = no spending
- [`rules/future-overrides-past.md`](./future-overrides-past.md) — why this rule supersedes the earlier "Toggl + Wakatime both" direction from the same day
