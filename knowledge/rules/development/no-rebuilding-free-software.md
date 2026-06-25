---
type: rule
title: "Don't rebuild software that already exists completely free"
description: "Family-wide constraint: do NOT build a userscript / extension / tool that replicates existing free software. Only exception: the existing free version paywalls a feature we want behind a payment. Save the build budget for things that don't exist yet OR have a real moat."
tags: [rule, scope, build-or-buy, anti-reinvention]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
related:
  - rules/development/community-packages-first
  - services/family-inventory
---

# Don't rebuild free software

## Rule

**Do NOT build software that already exists completely free elsewhere.**

This applies to userscripts, browser extensions, CLIs, web apps, libraries, and APIs.

Before building anything that mirrors an existing tool's behavior:

1. **Search.** Chrome Web Store, AMO, Greasyfork, GitHub, npm. Did someone already ship this and put it on a free tier with no paywall, no rate-limited "free for personal use" gotcha, no telemetry surcharge?
2. **If yes → STOP.** Use theirs. Add a one-line pointer in `knowledge/services/` if it's worth referencing later.
3. **If no, or if the existing one has a paywall on a feature we need → build.** Document the paywall / gap in the new project's README so future agents know why this exists.

## Exception: paywalled features

The rule is "no rebuilding *completely free* software". If the existing tool's free tier is missing a feature that the paid tier has — and we want that feature — building a free alternative IS allowed. Examples that would qualify:

- A free extension that adds a "Pro" tier behind a payment for the one feature you want
- A free SaaS with a 100-request/day rate limit and a $9/mo unlock for more
- An open-source project whose free version is feature-locked from a paid hosted version

When invoking the exception: name the specific paywalled feature in the new project's README's "Why this exists" section. "There's already X" isn't a sufficient justification on its own — the paywall is.

## Why

- **Build budget is finite.** Every hour cloning a free thing is an hour NOT spent on something that doesn't exist yet (the actual moat).
- **Maintenance multiplies.** Every cloned tool is a forever-maintenance commitment. Upstream gets a security fix, a new browser API, a regression — we have to track it.
- **Naming/branding/inventory bloat.** The family-inventory file grows linearly with clones, but the value those clones add is near-zero.
- **Honest framing.** Shipping a clone with a "we made this better" claim that isn't actually true wastes the user's trust budget.

## When in doubt

Ask the user the explicit question: "There's already a free X that does this. Build anyway, or skip?" Don't assume the user wants a clone just because they pointed at an extension and said "make this".

## What to do instead when the rule blocks a build

- **Extend an existing internal tool** if the family already has something close. Cheaper than a new repo.
- **Add a service-tier `knowledge/services/` entry** linking the external free tool, so we don't keep "discovering" it.
- **File the idea** in `knowledge/log.md` with a one-line "considered, rejected: rule [[no-rebuilding-free-software]]" so the rejection is auditable.

## Cross-refs

- Prefer community packages over rebuilding: [[rules/development/community-packages-first]]
- The 5 userscripts that exist family-wide: `repos/oriz/own/prod/userscripts/README.md`
- Family inventory of repos: [[services/family-inventory]]
