---
type: policy
title: "No paid tier in the dependency stack"
description: "No service the family depends on may require a paid subscription or card on file. Free-tier walls fail closed gracefully."
tags: [policy, free-tier, billing, no-card-on-file]
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
annual_review: false
related:
  - rules/no-card-on-file
  - rules/never-hit-quotas
  - architecture/layer-3-auth-firebase-spark
  - decisions/monetisation/no-subscriptions-anywhere
---

# No paid tier in the dependency stack

## The policy

No service in the family's hosting, auth, database, compute, observability,
or delivery stack may require a paid subscription, a credit-card-on-file,
or a paid plan to function; quota walls fail closed gracefully so that the
worst outcome is "service stops" and never "card gets charged thousands".

## Scope

- Every layer of the free-forever stack (static hosting, fallback host,
  auth, database, compute, observability, ads, billing, email, search,
  analytics, error tracking).
- Every external service in the AGENTS.md service catalog.
- All Chrome / Firefox / Edge extension dependencies.

## Rules

- **Free tier or nothing.** Cloudflare Free, GitHub Free, Firebase
  Spark only. Never Cloudflare paid plans, never Firebase Blaze.
- **No card-on-file.** Per [no-card-on-file rule](../rules/no-card-on-file.md),
  the failure mode "service stops at quota" is acceptable; the failure
  mode "card gets charged thousands due to abuse / bug / DDoS" is not.
- **Fail-closed graceful degradation.** When a quota wall is hit:
  - Cloudflare Pages serves HTTP 1027 — fine.
  - Workers Free returns 429 — site falls back to GitHub Pages mirror
    static content.
  - Firestore Spark returns `resource-exhausted` — site renders cached
    UI without user-specific data; "try again tomorrow" message.
  - The site never appears "broken"; it appears "degraded".
- **Architect for headroom.** Per [never-hit-quotas](../rules/never-hit-quotas.md):
  add a second cache layer, switch to a different free provider, push
  work to GitHub Actions build time, before the wall is in sight.
- **Subscription billing for users is allowed.** Razorpay charges
  *users* for the family's product — that does NOT put a card on
  *Chirag's* file with a pay-as-you-go service. The family takes
  payments; the family does not pay platform bills.
- **Survival fallback host.** Every site has a GitHub Pages mirror so
  that even if the primary host's free tier evaporates, `/work` +
  `/me` + `/legal` keep serving.

## Exceptions

- **Microsoft Azure for Students** — free credits, time-limited. May
  be used for build-time ML / data tasks (e.g. computer-vision API
  calls during image-tools build). Production hosting stays on
  Cloudflare Pages.
- **Domain registration at cost.** Cloudflare Registrar is at-cost not
  free; a yearly domain renewal is the only billing-touching service
  in the stack and the spend is bounded by the number of domains owned.
- **One-off purchases.** A perpetual-license tool (e.g. a font, a
  one-time icon-pack purchase) is not a "subscription or card on file"
  and is allowed.

## Annual review

Not on the annual cycle — re-evaluate on free-tier policy change
announcements from any provider in the catalog. AGENTS.md service
catalog is the live record.

## Cross-refs

- [`../rules/no-card-on-file.md`](../rules/no-card-on-file.md) — the foundational rule
- [`../rules/never-hit-quotas.md`](../rules/never-hit-quotas.md) — the architectural posture this policy enforces
- [`../architecture/layer-3-auth-firebase-spark.md`](../architecture/layer-3-auth-firebase-spark.md) — the canonical "Spark forever, never Blaze" application
- [`../decisions/monetisation/no-subscriptions-anywhere.md`](../decisions/monetisation/no-subscriptions-anywhere.md) — the decision-version of this policy
