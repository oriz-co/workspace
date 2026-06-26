---
type: decision
title: "Analytics stack: no card, no self-host"
description: "Industry-standard analytics only — no card on file, no self-hosting. Stack — GA4 + CF Web Analytics + MS Clarity + PostHog + Fathom Lite + GoatCounter."
tags: [analytics, no-card, ops]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
---

# Analytics stack: no card, no self-host

Two hard constraints: (1) no card on file (matches the no-card rule across the fleet), (2) no self-hosting (we don't run servers for analytics — too much ops for a donations-only project). That eliminates a lot of the field. What remains is the industry-standard hosted free tier set.

## Stack — the 6 tools we ship

1. **Google Analytics 4 (GA4)** — baseline session + event analytics; the lingua franca everyone reads.
2. **Cloudflare Web Analytics** — privacy-friendly pageviews, no cookies, free with CF Pages hosting.
3. **Microsoft Clarity** — session replay + heatmaps, free unlimited tier.
4. **PostHog Cloud** — product analytics, funnels, feature flags; free tier on hosted cloud.
5. **Fathom Lite** — free tier of the privacy-first analytics product.
6. **GoatCounter** — free OSS-hosted plan (we use their hosting, not ours).

## Considered and rejected

- **Plausible** — would require self-hosting to stay free → rejected (no self-host rule).
- **Umami** — same self-host blocker → rejected.
- **Mixpanel** — needs card on file for any meaningful tier → rejected.
- **Amplitude** — card required → rejected.
- **Heap** — card required → rejected.
- **Hotjar** — card required → rejected.
- **FullStory** — card required → rejected.

Related:
- [`zero-in-house-packages-inline-analytics-2026-06-25`](../packaging/zero-in-house-packages-inline-analytics-2026-06-25.md) — inline-scripts decision (no in-house wrapper packages; embed the vendors' snippets directly)
- [`no-card-on-file-prepaid-escape`](../../../rules/interaction/no-card-on-file-prepaid-escape.md) — the card-rule this enforces
