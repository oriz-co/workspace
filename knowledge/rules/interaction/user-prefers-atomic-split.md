---
type: rule
title: User prefers atomic split over consolidation
description: When given a choice between fewer-bigger-units and more-smaller-units,
  the user consistently picks more-smaller. Apply as default when the choice is open.
tags:
- meta
- taste
- preferences
timestamp: 2026-06-20
---



# User prefers atomic split over consolidation

## The rule

When a decision involves picking between "consolidate into N bigger units" vs "split into M smaller units" (with M > N), default to the **more-smaller** option unless there's a specific reason not to.

## The evidence

Three independent decisions on 2026-06-20 all picked the more-aggressive split over the recommendation:

1. **Tools shape** (recommended: 1 tools-site monorepo with 15 subdomain builds; chosen: **15 separate repos**). [tools-site-15-repos.md](../../decisions/architecture/stack/tools-site-15-repos.md).
2. **Package count** (recommended: 5 packages; chosen: **14 atomic packages**). [packages-14-atomic.md](../../decisions/architecture/packages-14-atomic.md).
3. **Day-1 tool scope** (recommended: ship Tier 1 only as 8 repos, scaffold rest; chosen: **all 15 repos + Pages projects on day 1**). [tool-categories-roadmap.md](../../decisions/architecture/stack/tool-categories-roadmap.md).

That's not a one-off — it's the third time in one session, on three independent decisions. It's a **taste**.

## How to apply

When designing the next AskUserQuestion:

- If the question is "how to split this" with a clear "fewer vs more" axis, **make the more-aggressive split the Recommended option** by default. Save the user the override.
- Still surface the consolidated option as 2nd choice with an honest cost assessment.
- If a domain reason makes more-split worse (e.g. version-coordination cost dominates), explicitly call that out in the question stem so the user can override knowingly.

## When the rule does NOT apply

The taste isn't unconditional. It's about *structural* splits — repos, packages, subdomains, knowledge files. It's NOT about:

- **Operational complexity** — the user still wants ONE Hono Worker at api.oriz.in, not one per route. ([cf-worker-quota-mitigation.md](../../decisions/architecture/compute/cf-worker-quota-mitigation.md).)
- **External services** — the user picks the FEWEST services that meet the need, not the most. ([analytics-five-tier-stack.md](../../decisions/architecture/ops/analytics-five-tier-stack.md).)
- **Auth surfaces** — single sign-in, single account, single subscription unlocks all. ([max-payment-methods.md](../../decisions/monetisation/max-payment-methods.md) — one sub unlocks all sites.)

The pattern: split the *artifacts* (code + repos + content), unify the *runtime* (auth + workers + accounts).

## Related taste rules

- [user-prefers-wider-coverage.md](./user-prefers-wider-coverage.md) — same session, broader topical net over narrow SEO
- [self-update-rule.md](../agent/self-update-rule.md) — meta-rule that generated this rule
