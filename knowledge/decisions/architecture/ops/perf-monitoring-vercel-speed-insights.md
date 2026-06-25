---
type: decision
title: "Perf monitoring \u2014 Vercel Speed Insights as RUM"
description: Vercel Speed Insights captures Real-User Monitoring Web Vitals on every
  site, complementing Cloudflare's edge-measured metrics and Sentry's API traces.
  Free, no Vercel hosting required.
tags:
- decisions
- architecture
- perf
- rum
- web-vitals
- vercel
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/perf/vercel-speed-insights
- services/monitoring/sentry
- services/analytics/cloudflare-web-analytics
- services/a11y/lighthouse-ci
---



# Perf monitoring — Vercel Speed Insights as RUM

## Decision

Every family site ships
[Vercel Speed Insights](../../../services/perf/vercel-speed-insights.md)
as the **Real-User Monitoring (RUM)** layer for Web Vitals. The
client script (`@vercel/speed-insights`) loads from
`@chirag127/oriz-kit` behind a per-site env-var toggle
(`ENABLE_SPEED_INSIGHTS=true|false`). Vercel hosting is **not**
required — the script works on
[Cloudflare Pages](../../../services/hosting/cloudflare-pages.md) (the
family's primary host).

This pairs with two existing perf signals:

- [Cloudflare Web Analytics](../../../services/analytics/cloudflare-web-analytics.md) — server-side / edge-measured
- [Sentry Performance](../../../services/monitoring/sentry.md) — sampled API + Worker traces
- [Lighthouse CI](../../../services/a11y/lighthouse-ci.md) — lab-only, in PRs

Together = full perf picture.

## Why

- **Web Vitals are the only perf signal Google ranks SEO on.** Lab
  metrics (Lighthouse) miss real users; edge metrics (Cloudflare)
  miss client-side layout shift and interaction lag.
- **Speed Insights is RUM** — captures LCP, INP, CLS, FCP, TTFB
  from real visitors on real devices and real networks. The only
  one of our perf tools that does this.
- **Cloudflare Web Vitals is server-side** — measured at the edge,
  tells us what the network delivered, not what the user saw. Misses
  CLS entirely (CLS happens after paint).
- **Sentry Performance** is trace-focused — great for "why is this
  API slow" but its JS Web Vitals capture is sample-based and less
  detailed.
- **Free** with no card. 10K data points/month per project; per-site
  env-var toggle keeps low-traffic sites silent for headroom.
- **Vendor-neutral** — the underlying library is `web-vitals` (W3C
  standard), so swapping Speed Insights for a self-rolled endpoint
  is mechanical.

## Implications

### Architecture

- `@chirag127/oriz-kit` exports `injectSpeedInsights()` behind the
  `ENABLE_SPEED_INSIGHTS` env var.
- Each site has its own Vercel project ID for Speed Insights;
  project IDs land in [Doppler](../../../services/secrets/doppler.md)
  and sync to Cloudflare Pages env vars at build time.
- `@vercel/speed-insights` registers a CSP `connect-src` entry for
  `vitals.vercel-insights.com` — added to the
  [security-headers preset](../../../services/security/cloudflare-headers.md).

### Quota strategy (never-hit-quotas)

- 10K data points / project / month is generous for low-traffic
  sites; high-traffic sites (oriz-blog-site, oriz.in apex) may need
  the toggle off until usage is understood.
- Per-site `ENABLE_SPEED_INSIGHTS=true|false` env var (mirrors the
  [Sentry pattern](../../../services/monitoring/sentry.md#per-site-env-var-toggle-the-never-hit-quotas-pattern))
  prevents a runaway visitor spike from burning the quota.
- Per-page sampling can be configured via `injectSpeedInsights({ sampleRate: 0.5 })`
  if a single site's traffic outgrows the cap.

### Three perf layers, each in its own tool

| Layer | Tool | Why this tool here |
|---|---|---|
| Real-user Web Vitals (RUM) | [Speed Insights](../../../services/perf/vercel-speed-insights.md) | Free RUM with no Vercel hosting requirement |
| Server-side / edge | [Cloudflare Web Analytics](../../../services/analytics/cloudflare-web-analytics.md) | Already in use; free unlimited |
| API + Worker traces | [Sentry Performance](../../../services/monitoring/sentry.md) | Already in use; same dashboard as errors |
| Lab perf in PR | [Lighthouse CI](../../../services/a11y/lighthouse-ci.md) | Already in use; perf budget per PR |

### What we don't do

- **No DebugBear / SpeedCurve / Calibre** — Speed Insights covers
  RUM free; lab is covered by Lighthouse CI.
- **No self-rolled endpoint** — re-implementing dashboards / alerts
  costs more than the Speed Insights free tier.
- **No card-on-file** at Vercel — free tier sign-up is GitHub OAuth.
- **No Vercel hosting** — Cloudflare Pages stays primary host.

## Cross-refs

- [Vercel Speed Insights service entry](../../../services/perf/vercel-speed-insights.md)
- [perf services index](../../../services/perf/index.md)
- [Sentry — error tracking + perf traces](../../../services/monitoring/sentry.md)
- [Cloudflare Web Analytics](../../../services/analytics/cloudflare-web-analytics.md)
- [Lighthouse CI — lab-only score in PRs](../../../services/a11y/lighthouse-ci.md)
- [Cloudflare Pages — primary host](../../../services/hosting/cloudflare-pages.md)
- [Never hit quotas rule](../../../rules/interaction/never-hit-quotas.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
