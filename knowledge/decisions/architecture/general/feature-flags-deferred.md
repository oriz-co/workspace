---
type: decision
title: "Feature flags \u2014 deferred (YAGNI) until first real need"
description: 'Locked 2026-06-23. No feature-flag system in the family right now. Reason:
  every concrete need we have today is solved by something else (tier checks via Firebase
  Auth claims for Pro/Max gating; git push for incident response; A/B testing has
  no users yet). Adding a flag system would be infra we''d maintain to solve problems
  we don''t have. Trigger to revisit: first real incident where a runtime kill-switch
  would have helped, OR first product decision that needs per-user A/B.'
tags:
- decision
- feature-flags
- yagni
- deferred
timestamp: 2026-06-23
format_version: okf-v0.1
status: active
related:
- rules/development/community-packages-first
- rules/infrastructure/free-tier-with-cost-controls
- decisions/architecture/security/monetization-centralized-on-oriz-in
---



# Feature flags — deferred

## Decision

We are NOT adding a feature-flag system to the oriz family right now. Not Flagsmith, not Cloudflare Flagship, not OpenFeature, not a `flags.json` file, not a `flag()` helper in `astro-shell`. Nothing.

This is locked. When an agent or future-me proposes "let's add feature flags so we can…" — read this file first.

## Why YAGNI here

A feature-flag system solves four problems. None of them are problems we actually have today:

| Use case | Why we don't need it |
|---|---|
| Kill switch (turn off broken feature instantly) | Single-developer family. Incidents = git push. The Razorpay button being broken is a 30-second deploy fix, not a 2 AM emergency. |
| Gradual rollout (5% → 10% → 100%) | We have no scale to gradually roll out to. First paying user is still TBD. |
| A/B testing | Zero users to A/B against right now. The pricing page just shipped today; we don't even have baseline conversion data. |
| Pro/Max gating | Already solved by Firebase Auth custom claims (`token.claims.tier`). That's tier-checking, not flagging. |

## What would change our mind (triggers to revisit)

1. **First production incident** where a runtime kill-switch would have helped. Specifically: Razorpay outage at 2 AM, can't ssh in, need to flip a switch from a phone. If that ever happens, the next morning we add runtime flags.
2. **First paying customer + first product change** where we want to test "old pricing vs new pricing" or "old onboarding vs new onboarding" on real traffic.
3. **First time we want a feature visible to specific beta users only**, not all signed-in users.

Until one of those three fires, we're not building flag infrastructure.

## When we DO revisit, the chosen path is

Runtime flags via Cloudflare KV (NOT build-time, NOT Flagsmith, NOT Flagship beta):

1. Create CF KV namespace `family-flags`
2. Tiny Worker at `flags.oriz.in/state.json` serves the KV blob with 60s edge cache
3. Tiny admin page at `account.oriz.in/admin/flags` (requires Firebase custom claim `admin: true`) lets us flip values
4. `astro-shell` exports a thin `flag(name, ctx)` helper that fetches once per page load + caches
5. Per-user targeting via passing user tier/uid in the request

Why this when the time comes:
- Stays inside our CF account (no SaaS account, no quota mismatch)
- Fast (KV cached at edge)
- Audit trail via KV history + Workers Logs
- We control everything
- Free (100K KV reads/day is plenty)
- Same `flag()` API regardless of backend, so swapping to Flagship/Flagsmith later if we ever need is a one-line change

## What we ARE doing for tier-based UI gating

`user.tier` is a Firebase Auth custom claim set by the Razorpay webhook. Apps read it like this:

```ts
const tokenResult = await user.getIdTokenResult()
const tier = tokenResult.claims.tier ?? 'free'  // 'free' | 'pro' | 'max'

if (tier !== 'free') {
  // show Pro feature
}
```

This is NOT a feature flag system. It's per-user authorization. Different problem, different tool. Documented in `decisions/architecture/monetization-centralized-on-oriz-in.md`.

## Anti-pattern alarms

If you find yourself doing any of these, STOP and read this file again:

- Adding `flag('whatever')` calls in app code — there's no `flag()` function and there shouldn't be
- Creating a `data/flags.json` — git is not a flag database
- Adding a `FLAG_*` env var convention — env vars are config, not flags
- Installing the OpenFeature SDK — premature
- Signing up for Flagsmith / LaunchDarkly / Flagship — premature

If you genuinely need a flag-shaped solution, one of the three triggers above must have fired. Otherwise: tier check via Firebase claim, OR a git push.

## Cross-refs

- Community packages first → [[rules/community-packages-first]] (this is the case where "don't reach for the dep" wins)
- Free-tier rule → [[rules/free-tier-with-cost-controls]] (still need cost controls if we ever add Flagsmith)
- Monetization → [[decisions/architecture/monetization-centralized-on-oriz-in]] (tier claim definition)
