---
type: decision
title: Family-wide /stats page on oriz.in (auto-tracked, public, all 11 sites + all
  repos)
description: 'Locked 2026-06-20: oriz.in/stats aggregates visitor data from all 11
  sites + code-stats data from all family repos, build-time fetched from CF Web Analytics
  + GitHub Insights + Wakatime + Tokei. Public, transparent, auto-refreshed via daily
  cron. Reinforces the auto-only-tracking and auto-tracking-everywhere posture. Single
  oriz-kit component pulls everything.'
tags:
- stats
- oriz-in
- transparency
- public
- auto-tracking
- decisions
- architecture
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- decisions/architecture/general/code-stats-everything
- decisions/architecture/general/lifestream-auto-event-sources
- decisions/architecture/compute/cron-split-cf-vs-gh
- decisions/architecture/general/cms-markdown-in-repo-only
- services/analytics/cloudflare-web-analytics
- services/code-quality/github-insights
- services/code-quality/tokei
- services/productivity/wakatime
- rules/interaction/auto-only-tracking
---



# Family-wide /stats page on oriz.in

## Decision

`oriz.in/stats` is a single, public, transparent dashboard that
aggregates **everything** the family auto-tracks:

- **Visitor stats** — every site's CF Web Analytics summary
  (pageviews / unique visitors / top paths / top referrers), all 11
  sites in one table
- **Code stats** — every repo's metrics: line counts (Tokei),
  contributor counts (GitHub Insights), commit cadence, coverage
  (Codecov), maintainability grade (Code Climate), open issues / PRs
- **Coding time** — Wakatime public dashboard data (last 7d / 30d
  totals, language breakdown)
- **Lifestream summary** — counts derived from the
  [oriz-me JSONL](../database/lifestream-jsonl-canonical.md) by `kind` (git
  events / coding days logged / visitor day-summaries)

Built at deploy time from each upstream's API; no client-side
fetches; cached at the Cloudflare edge with 1h `s-maxage`. A
**daily** GH Actions cron at 02:00 IST (after the
[lifestream auto-event-sources](../general/lifestream-auto-event-sources.md)
crons at 01:00 IST) re-deploys `oriz-in-site` so the dashboard
refreshes nightly without manual intervention.

User direction: *"family-wide /stats on oriz.in"* — locked.

## Why family-wide, not per-site

- A per-site `/stats` per repo would duplicate 11 build pipelines
  for the same dashboard component.
- The interesting comparison is **across** the family — which site
  ships fastest, which has the most contributors, total LOC,
  cross-site engagement — and that view only exists at the apex.
- One public stats URL is also the cleanest answer to "show me what
  you build" — recruiters, OSS contributors, and curious readers
  hit a single transparent page.

## Implications

- **`<FamilyStatsDashboard />` component** lands in
  [`@chirag127/oriz-kit`](../../../glossary/o-r/oriz-kit.md) (forward
  reference — kit shim split per
  [oriz-ui-split-into-5-packages](../oriz-ui-split-into-5-packages.md)).
  Single component embedded in `oriz-in-site/src/pages/stats.astro`.
  Per the
  [markdown-in-repo-only posture](../general/cms-markdown-in-repo-only.md)
  the component renders at build time from JSON props, no runtime
  CMS.
- **Build-time data fetch** runs in `oriz-in-site` build:
  - `CF Analytics GraphQL API` → 11 site summaries (24h + 7d + 30d)
  - `GitHub REST API` → per-repo `/stats/contributors`,
    `/stats/commit_activity`, `/stats/code_frequency`, repo metadata
    (stars / forks / open issues)
  - [Tokei](../../../services/code-quality/tokei.md) JSON output —
    consumed from each repo's CI artefact (or re-run inline if the
    repo is shallow-cloned at build)
  - [Wakatime](../../../services/productivity/wakatime.md) public
    summary endpoint — no auth needed for public dashboard scope
- **Daily refresh cron** — GH Actions schedule `0 2 * * *` (02:00
  IST = 20:30 UTC previous day) re-deploys `oriz-in-site`. Pings
  [healthchecks.io](../../../services/monitoring/healthchecks-io.md)
  per
  [`health-check-cron-plus-uptime`](../compute/health-check-cron-plus-uptime.md).
- **Caching** — page emits `Cache-Control: public, s-maxage=3600,
  stale-while-revalidate=86400` so the CF edge serves it for free
  per the
  [CF Worker quota mitigation playbook](../compute/cf-worker-quota-mitigation.md).
- **API tokens** — CF Analytics, GitHub, Wakatime API tokens in
  [Doppler](../../../services/secrets/doppler.md), GH Secrets at build
  time only. No tokens shipped to client.
- **Auto-tracked end-to-end** — the page exists *because* every
  upstream is already auto-tracked per
  [`auto-only-tracking`](../../../rules/interaction/auto-only-tracking.md) and the
  forward-referenced
  [`auto-tracking-everywhere` decision](../general/auto-tracking-everywhere.md).
  No manual data entry anywhere.
- **Privacy posture** — every metric on the page is already public
  upstream (CF Web Analytics is cookie-less aggregate data, GitHub
  Insights is repo-public, Wakatime public dashboard is opted-in).
  No PII surfaces. Falls under the family-wide
  [privacy-page](../../branding/family-wide-privacy-page.md) `/privacy`
  addendum for `/stats`.

## Cross-refs

- [Code stats everything decision](../general/code-stats-everything.md)
- [Lifestream auto-event sources](../general/lifestream-auto-event-sources.md)
- [Cron split decision](../compute/cron-split-cf-vs-gh.md)
- [CF Worker quota mitigation playbook](../compute/cf-worker-quota-mitigation.md)
- [Markdown-in-repo only decision](../general/cms-markdown-in-repo-only.md)
- [Cloudflare Web Analytics service](../../../services/analytics/cloudflare-web-analytics.md)
- [GitHub Insights service](../../../services/code-quality/github-insights.md)
- [Tokei service](../../../services/code-quality/tokei.md)
- [Wakatime service](../../../services/productivity/wakatime.md)
- [Auto-only-tracking rule](../../../rules/interaction/auto-only-tracking.md) (forward ref — being added in parallel)
- [Auto-tracking everywhere decision](../general/auto-tracking-everywhere.md) (forward ref — being added in parallel)
- [Family-wide privacy page decision](../../branding/family-wide-privacy-page.md)
