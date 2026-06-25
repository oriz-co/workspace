---
type: decision
title: Status banner on every site
description: Every site embeds a thin, dismissible <StatusBanner /> from oriz-kit
  that consumes Better Stack's RSS incident feed; visible only when an incident is
  live, with severity + link to status.oriz.in.
tags:
- status
- banner
- monitoring
- oriz-kit
- comms
- ux
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/monitoring/better-stack
- services/monitoring/instatus
- services/monitoring/healthchecks-io
- decisions/infrastructure/monitor-apex-only
- glossary/o-r/oriz-kit
- rules/interaction/never-hit-quotas
- rules/interaction/no-card-on-file
---



# Status banner on every site

## Decision

Every site in the family embeds a thin, dismissible **status banner**
component (1 line, full-width, top of viewport) that consumes
[Better Stack](../../../services/monitoring/better-stack.md)'s public
incident feed. The banner is **invisible by default** (no incident =
no DOM, no CLS, no render cost) and renders only when an incident is
live, showing severity + a link to
[`status.oriz.in`](../../../services/monitoring/better-stack.md).

User direction 2026-06-20: "+ Status banner on every site" — locked.

## Why

- **Status pages are useless if visitors don't know to look.** When a
  user hits an outage on `oriz-blog.oriz.in`, they bounce — they
  don't think "let me check status.oriz.in". An in-page banner
  closes that loop without requiring the user to know the status
  domain.
- **Better Stack is already the source of truth.** The same monitor
  graph that powers the [primary status page](../../../services/monitoring/better-stack.md)
  feeds the banner via the public incidents RSS. No second status
  source, no drift.
- **Vendor-redundant comms.** When combined with the
  [two-status-page redundancy](../../../services/monitoring/instatus.md)
  (Better Stack primary + Instatus mirror) and a
  [healthchecks.io heartbeat](../../../services/monitoring/healthchecks-io.md),
  the banner gives a third **in-page** comms surface that survives
  even if one of the upstream surfaces is the outage.
- **Built once in [oriz-kit](../../../glossary/o-r/oriz-kit.md), shipped to all 11+ sites.** Single
  source of truth for the comms component; per-site config is one prop.

## Banner contract

| State | Render | Notes |
|---|---|---|
| No active incident | `null` (no DOM) | Zero CLS, zero render cost |
| `degraded` | `[Degraded] Some features may be slow — details →` | Yellow background |
| `partial_outage` | `[Partial outage] Some sites are unreachable — details →` | Orange background |
| `major_outage` | `[Major outage] We're working on it — details →` | Red background |
| `maintenance` | `[Maintenance] Scheduled work in progress — details →` | Blue background |

The "details →" link goes to `status.oriz.in` (Better Stack primary)
with a `?ref=banner-<sitename>` UTM tag for [attribution](../general/utm-attribution-strategy.md).
On Better Stack outage, the banner falls back to `status-backup.oriz.in`
([Instatus](../../../services/monitoring/instatus.md)) automatically.

The banner is **dismissible** per-incident (sets a cookie keyed on
the incident ID; banner re-appears on the next distinct incident).

## Implementation

```tsx
// inside @chirag127/oriz-kit
import { useEffect, useState } from 'react';

const FEED = 'https://status.oriz.in/feed.rss';
const FALLBACK_FEED = 'https://status-backup.oriz.in/feed.rss';

export function StatusBanner({ siteId }: { siteId: string }) {
  const [incident, setIncident] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchFeed = async () => {
      const feed = await tryFetch(FEED).catch(() => tryFetch(FALLBACK_FEED));
      if (!cancelled) setIncident(parseLatestActive(feed));
    };
    fetchFeed();
    const t = setInterval(fetchFeed, 60_000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  if (!incident) return null;
  if (isDismissedFor(incident.id)) return null;

  return (
    <div data-oriz-status={incident.severity}>
      [{labelFor(incident.severity)}] {incident.title}
      {' — '}
      <a href={`https://status.oriz.in/?ref=banner-${siteId}`}>details →</a>
      <button onClick={() => dismiss(incident.id)}>dismiss</button>
    </div>
  );
}
```

- **Build-time fetch** also runs at site build so the banner is
  rendered server-side for the very first paint when an incident is
  ongoing during deploy. Client-side then takes over with 60-second
  polling.
- **No styles ship from the kit** (per the kit's no-styles invariant) —
  every site styles via the `[data-oriz-status]` attribute hook to
  its own brand.
- **Fetched feed is small** (Better Stack RSS is ~5 KB during
  incidents, even smaller when idle); polling at 60 s costs ~1
  fetch/min × user, negligible at family scale.
- **Cache.** The polled fetch uses `Cache-Control: max-age=30, stale-while-revalidate=300` — CF edge caches it; a viral page during an incident burns ~30 s of CF requests, not 1-per-user-per-minute.

## Implications

- **Component lands in `@chirag127/oriz-kit`** as `<StatusBanner />`.
  Every site mounts it once at the layout root; one prop = `siteId`.
- **No new monitoring service required** — rides the existing Better
  Stack + Instatus pair. Better Stack's public incidents RSS is
  already enabled by default.
- **`/feed.rss` shape is the standard public Better Stack RSS** —
  documented at [Better Stack docs](https://betterstack.com/docs/uptime/api/incidents-rss/).
  No auth required; same surface used by the
  [Better Stack service file](../../../services/monitoring/better-stack.md).
- **Dismissal cookie** uses the per-site cookie pattern; falls under
  `necessary` category in
  [`Klaro`](../../../services/security/klaro.md) consent (no banner
  needed for this cookie).
- **No card** on any layer. Both Better Stack and Instatus are on
  free tiers per [`rules/no-card-on-file.md`](../../../rules/interaction/no-card-on-file.md).

## Cross-refs

- [Better Stack (primary status page + incidents RSS)](../../../services/monitoring/better-stack.md)
- [Instatus (redundant status page mirror)](../../../services/monitoring/instatus.md)
- [healthchecks.io (heartbeat fallback)](../../../services/monitoring/healthchecks-io.md)
- [Monitor apex only](../../infrastructure/monitor-apex-only.md)
- [oriz-kit glossary](../../../glossary/o-r/oriz-kit.md)
- [UTM attribution strategy](../general/utm-attribution-strategy.md) — `?ref=banner-<sitename>` convention
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
- [Never-hit-quotas rule](../../../rules/interaction/never-hit-quotas.md)
