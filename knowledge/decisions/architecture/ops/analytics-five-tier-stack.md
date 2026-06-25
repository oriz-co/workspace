---
type: decision
title: "Analytics \u2014 5-tier stack (CFWA + GA4 + PostHog + Clarity + UTM)"
description: "Locked 2026-06-20: every site runs five analytics layers in parallel\
  \ \u2014 Cloudflare Web Analytics (raw load), Google Analytics 4 (marketing funnel),\
  \ PostHog (product + session replay + flags), Microsoft Clarity (heatmaps + Microsoft-side\
  \ session replay), UTM tracking (attribution convention). Each layer covered by\
  \ an `ENABLE_<TOOL>` env-var kill-switch so no single quota pinch can break a site."
tags:
- analytics
- decisions
- architecture
- clarity
- ga4
- posthog
- cloudflare-analytics
- utm
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/analytics/cloudflare-web-analytics
- services/analytics/microsoft-clarity
- services/analytics/posthog
- services/analytics/utm-tracking
- decisions/architecture/general/utm-attribution-strategy
- rules/interaction/never-hit-quotas
- rules/interaction/no-card-on-file
---



# Analytics — 5-tier stack (CFWA + GA4 + PostHog + Clarity + UTM)

## Decision

Every site in the family runs **five** analytics layers in parallel,
each covering a different question with no overlap. All five are
free, no card, and each can be killed by a per-site
`ENABLE_<TOOL>=true|false` env-var without affecting the others.

| # | Layer | Service | Question it answers |
|---|---|---|---|
| 1 | Edge / raw load | [Cloudflare Web Analytics](../../../services/analytics/cloudflare-web-analytics.md) | How many real visitors, from where, on what URL? (cookieless) |
| 2 | Marketing funnel | Google Analytics 4 (GA4) | Acquisition / engagement / conversion against the same definitions advertisers use |
| 3 | Product analytics | [PostHog](../../../services/analytics/posthog.md) | Funnels, retention, feature-flag usage, **session replay** (product side) |
| 4 | Heatmaps + session replay (vendor-redundant) | [Microsoft Clarity](../../../services/analytics/microsoft-clarity.md) | Where do users click / scroll / rage-click; second replay so a PostHog quota miss never blinds us |
| 5 | Attribution convention | [UTM tracking](../../../services/analytics/utm-tracking.md) | Which channel / campaign drove this session — read by tiers 2-4 from the URL |

## Why five and not fewer

The user's direction was: *"I want to use all of the analytics and
all of the Google practices, Microsoft Clarity and everything … I
want a free service for everything."* Picking only one layer leaves
real questions unanswered:

- **CFWA alone** = no funnels, no replay, no heatmaps.
- **GA4 alone** = privacy-hostile, no replay, sampled at scale.
- **PostHog alone** = single-vendor risk; 1M-events/mo cap blinds the
  family the moment a post goes viral.
- **Clarity alone** = no funnels, no flags, no acquisition reports.
- **UTM alone** = a convention, not a tool — needs a tool to read it.

The five layers together answer every operationally interesting
question with **vendor redundancy on session replay** (PostHog +
Clarity) and **funnel redundancy** (GA4 + PostHog). Each layer
preserves the family's [no-card-on-file rule](../../../rules/interaction/no-card-on-file.md)
and each runs at a different vendor, so a single outage / quota
trip never goes dark across the board.

## Quota safeguards (per [`rules/never-hit-quotas.md`](../../../rules/interaction/never-hit-quotas.md))

Each layer has a per-site env-var kill-switch:

```bash
ENABLE_CFWA=true            # Cloudflare Web Analytics (no real cap)
ENABLE_GA4=true             # GA4 — sampled past 10M events/mo (free)
ENABLE_POSTHOG=true         # PostHog — 1M events/mo, 5K replays/mo
ENABLE_CLARITY=true         # Microsoft Clarity — no documented cap
ENABLE_UTM_HELPER=true      # <UtmLink> validation in @chirag127/oriz-kit
```

Set any to `false` per site if a quota cliff approaches. The
`<Analytics />` component in [`@chirag127/oriz-kit`](../../../glossary/o-r/oriz-kit.md)
reads these flags at build time and tree-shakes the unused scripts.

## Implications

- **One `<Analytics />` component** in `oriz-kit` injects all five
  scripts based on the env-vars; sites do not hand-wire vendor SDKs.
- **PostHog is the primary** for session replay (fed flags +
  PostHog Insights); **Clarity is the redundant second** so a
  PostHog quota trip / outage doesn't blind us to user behaviour.
- **GA4 is configured to read UTMs** as the standard
  `utm_source` / `utm_medium` / `utm_campaign` dimensions; PostHog +
  CFWA do the same per
  [`utm-attribution-strategy.md`](../general/utm-attribution-strategy.md).
- **CSP allow-list in [`_headers` preset](../../../services/security/cloudflare-headers.md)**
  covers all five vendor origins (cloudflareinsights, googletagmanager,
  posthog, clarity.ms). No per-site CSP exception.
- **Cookie banner** ([`Klaro` already locked](../../../services/security/klaro.md))
  gates GA4 + Clarity + PostHog behind explicit consent in regions
  that need it; CFWA is cookieless and runs without consent. UTM
  capture is read-only off the URL — no cookie required.
- **No paid tier ever.** If any layer hits its quota:
  1. Toggle the env-var off on the highest-traffic site.
  2. Document in [`log.md`](../../../log.md) which site / which layer.
  3. Consider sampling (`ENABLE_<TOOL>=true` only on 10% of sites) before turning back on.

## Cross-refs

- [Analytics services index](../../../services/analytics/index.md) — per-service detail
- [Cloudflare Web Analytics service](../../../services/analytics/cloudflare-web-analytics.md)
- [Microsoft Clarity service](../../../services/analytics/microsoft-clarity.md)
- [PostHog service](../../../services/analytics/posthog.md)
- [UTM tracking service](../../../services/analytics/utm-tracking.md)
- [UTM-only attribution decision](../general/utm-attribution-strategy.md)
- [Cookie banner policy decision](../../security/cookie-banner-policy.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
- [Never hit quotas rule](../../../rules/interaction/never-hit-quotas.md)
