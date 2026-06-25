---
type: rule
title: Never hit a free-tier quota
description: Architect for headroom. Surprise quota walls are a design failure, not
  a billing event.
tags:
- rules
- quotas
- architecture
- free-tier
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- rules/interaction/no-card-on-file
- architecture/security/layer-3-auth-firebase-spark
- architecture/general/layer-4-database-by-shape
---



# Never hit a free-tier quota

Architect every layer with enough headroom that we never approach the
free-tier ceiling under realistic load.

## Why

The point of staying on free tiers is **predictable failure mode**:
when we hit a quota, the service stops — it does NOT silently bill us.
But hitting a quota is still a customer-visible outage. Outages are
design failures, not billing events. We should never be surprised.

The layered defense:

1. **Pick services whose free tier is 10× our forecast load**, not 1.1×.
2. **Cache aggressively** at one layer down (build-time JSON, KV,
   browser localStorage, static HTML) so the upstream quota is never
   the hot path.
3. **Push work to build-time GitHub Actions** when possible — cron-rebuilt
   static JSON files have effectively infinite read quota.
4. **Spread load across data-shape-specific stores** so no single
   quota becomes the bottleneck (see [layer-4](../../architecture/general/layer-4-database-by-shape.md)).
5. **Monitor approach to quotas**, not just hits. If usage crosses 50%
   of any free-tier ceiling, that's the trigger to add the next layer.

## Exceptions

None. If a feature can only work by riding a quota wall close, the
feature is wrong.

## See also

- [`no-card-on-file.md`](./no-card-on-file.md) — the failure-mode pair
- AGENTS.md "five non-negotiable rules" §1
