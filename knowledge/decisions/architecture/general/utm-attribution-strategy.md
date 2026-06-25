---
type: decision
title: UTM-only marketing attribution
description: Marketing attribution rides on UTM query parameters injected into outbound
  links, captured by PostHog + Cloudflare Web Analytics. No paid attribution tool,
  no SaaS click-tracker, no bounce-redirect domain. oriz-kit ships <UtmLink> to enforce
  kebab-case naming.
tags:
- marketing
- attribution
- utm
- analytics
- posthog
- oriz-kit
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/analytics/utm-tracking
- services/analytics/posthog
- services/analytics/cloudflare-web-analytics
- decisions/architecture/general/cross-post-engine
---



# UTM-only marketing attribution

## Decision

The family's only marketing-attribution mechanism is **UTM query
parameters** on every outbound campaign / share / referral link.
UTMs are captured by [PostHog](../../../services/analytics/posthog.md)
(primary) and [Cloudflare Web Analytics](../../../services/analytics/cloudflare-web-analytics.md)
(secondary). No paid attribution tool, no SaaS click-tracker, no
bounce-redirect domain.

`@chirag127/oriz-kit` ships a `<UtmLink>` component +
`buildUtmUrl()` helper that enforce the family's naming convention
at compile time so attribution data stays clean.

## Why

UTM tracking is the universal, free, no-service convention every
analytics tool reads. Picking a paid attribution tool (Bitly,
Branch.io, Rebrandly) would:

- Add a service to maintain + a card / paid plan once tier limits hit.
- Add a redirect hop that hurts perceived load time.
- Lock attribution data to that vendor (swap cost up).

Skipping attribution entirely is the other option, and it's wrong —
it's the only way to know which channels actually move users to the
sites. The middle path is the right path: ride the convention every
analytics tool already knows.

## Naming convention (locked)

| Param | Required? | Meaning | Allowed values |
|---|---|---|---|
| `utm_source` | required | Where the link is | `twitter`, `dev-to`, `hashnode`, `newsletter`, `oriz-extension-<name>`, etc. |
| `utm_medium` | required | What kind of link | `social`, `email`, `cross-post`, `referral`, `cpc` |
| `utm_campaign` | required | Why we shipped this | `2026-q2-launch`, `oriz-finance-beta`, `weekly-2026-06-20` |
| `utm_term` | optional | Paid keywords | rare for us — only on paid placements |
| `utm_content` | optional | A/B variant or link position | `header`, `footer-cta`, `variant-b`, `thread-1` |

Rules:

- Values are **kebab-case, lower-case, ASCII only**. No spaces. No
  underscores in values.
- **Never PII** — never an email or user ID.
- `utm_campaign` should match the date of the campaign or the
  feature being launched, so historical reports stay readable.

## `<UtmLink>` helper in oriz-kit

```tsx
import { UtmLink } from "@chirag127/oriz-kit";

<UtmLink
  href="https://oriz.in/finance"
  source="twitter"
  medium="social"
  campaign="2026-q2-launch"
  content="thread-1"
>
  Try oriz-finance
</UtmLink>;
```

`buildUtmUrl()` is the same logic for non-React contexts (CLI
scripts, omnipost adapters, Worker-side replies).

## Implications

- **Every outbound link in family-controlled surfaces** (newsletters,
  social posts, footer cross-promos, omnipost cross-posts) goes
  through `<UtmLink>` or `buildUtmUrl()`.
- **`oriz-omnipost` adapters auto-tag cross-posts** with
  `utm_source=<platform>&utm_medium=cross-post&utm_campaign=<post-slug>`
  on the way to dev.to / Hashnode / etc. — see
  [`cross-post-engine.md`](./cross-post-engine.md).
- **PostHog `$pageview` event** captures all `utm_*` params as event
  properties; reports group by `utm_source` / `utm_medium` /
  `utm_campaign`.
- **Cloudflare Web Analytics** sees the UTMs inline in the URL (CFWA
  reads the full URL, no special config needed).
- **URL-cleanup script** in oriz-kit rewrites
  `window.history.replaceState` to drop `utm_*` from the URL bar
  after the first event, so the canonical path is what's bookmarked
  / shared next.
- **No PII**, ever — `<UtmLink>` rejects values matching obvious PII
  patterns at type-check time (no `@`, no UUID-shaped values).
- Swap cost is low — UTM is universal. Any future analytics swap
  reads the same convention.

## Cross-refs

- [UTM tracking service](../../../services/analytics/utm-tracking.md)
- [PostHog service](../../../services/analytics/posthog.md)
- [Cloudflare Web Analytics service](../../../services/analytics/cloudflare-web-analytics.md)
- [Analytics services index](../../../services/analytics/index.md)
- [Cross-post engine — auto-UTMs cross-posts](./cross-post-engine.md)
- [oriz-kit glossary](../../../glossary/o-r/oriz-kit.md) — `<UtmLink>` lives here
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
