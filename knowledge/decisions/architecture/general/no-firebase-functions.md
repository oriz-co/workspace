---
type: decision
title: "No Firebase Functions \u2014 Blaze requires a card on file, hard blocked"
description: 'Cloud Functions for Firebase requires the Blaze pay-as-you-go plan,
  which requires a card on file with no real spend cap. Per the no-card-on-file rule,
  Functions are excluded. Replaces with: GitHub Actions cron (free for public repos),
  Cloudflare Workers (100K req/day free), Cloudflare Pages Functions (shared 100K/day
  free), browser-side compute, static JSON in Pages.'
tags:
- decision
- architecture
- firebase
- no-functions
- no-card-on-file
- cloudflare-workers
- cloudflare-pages-functions
- github-actions
- serverless
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- rules/interaction/no-card-on-file
- decisions/infrastructure/firebase-spark-forever
- decisions/monetisation/no-subscriptions-anywhere
- decisions/architecture/compute/hono-worker-api-umbrella
- decisions/architecture/compute/cron-split-cf-vs-gh
---



# No Firebase Functions — Blaze requires a card on file

## Decision

**Firebase Cloud Functions are never used by any product in the family.** This is a hard exclusion, not a "prefer not to" — Functions only runs on Blaze, Blaze requires a card on file, and the no-card-on-file rule is non-negotiable.

This closes the loop on [`firebase-spark-forever.md`](../../infrastructure/firebase-spark-forever.md): Spark forever implies Functions never.

## Why

- Cloud Functions for Firebase is the one Firebase service that **does not run on Spark at all**. There is no free quota on Spark for Functions — calling it requires Blaze enabled.
- Blaze requires a credit/debit card on file. Cloud Spend Caps are still in private preview at Cloud Next '26 and do not cover Firestore/Storage/Hosting/Functions in practice.
- Documented bill-shock cases (simmer.io ~$98K, Tamara ~$70K, €54K Gemini-key incident) all involved Blaze-tier services and confirm the catastrophic failure mode.
- Functions are not architecturally required: every workload that one would put on Functions has a card-free home elsewhere.

## What replaces Functions

| Workload type | Replacement | Free-tier limit | Source |
|---|---|---|---|
| HTTPS endpoint / webhook receiver | **Cloudflare Workers** | 100,000 requests/day | [CF Workers limits](https://developers.cloudflare.com/workers/platform/limits/) |
| Edge function on a Pages site | **Cloudflare Pages Functions** | Shared 100K/day with Workers | [CF Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/) |
| Scheduled cron job (>1/min granularity) | **Cloudflare Workers cron triggers** | Included in Workers free | [CF Workers limits](https://developers.cloudflare.com/workers/platform/limits/) |
| Heavy scheduled batch (long-running, package builds, scrapers) | **GitHub Actions** on public repo | Unlimited minutes on public repos; 2000 min/mo on private free | [GH Actions billing](https://docs.github.com/en/actions/concepts/billing-and-usage), [GH Actions pricing 2026](https://resources.github.com/actions/2026-pricing-changes-for-github-actions/) |
| Per-user compute (auth-gated, requires fresh data) | **Client-side fetch + Firestore REST direct from browser** | Spark Firestore: 50K reads/day, 20K writes/day | [`firebase-rest-firestore-not-admin`](../database/firebase-rest-firestore-not-admin.md) |
| Static-ish derived data (sitemaps, search index, OG image cache) | **Build-time generation → static JSON in Cloudflare Pages** | CF Pages free unlimited static | (existing knowledge) |
| Inbound webhook reliability (retries, replay) | **Hookdeck free tier** → CF Worker | per [`hookdeck-for-webhook-reliability`](../../infrastructure/hookdeck-for-webhook-reliability.md) |

## Concrete payment-flow consequences

Payment webhooks (Razorpay, Lemon Squeezy, Polar.sh) **must not** be in the hot path of a CF Worker that could fail closed on quota. Concrete rule:

- Webhooks hit **Hookdeck** first (free tier handles retries) → forward to **GitHub Actions** via `repository_dispatch` for durable processing, OR to a CF Worker that only writes to Firestore REST and returns 200 fast.
- License-key fulfilment via `keygen.sh` is decoupled (already in [`max-payment-methods.md`](../../monetisation/max-payment-methods.md)).
- A failed worker run does NOT mean a failed payment — Hookdeck retries; the customer's payment is already complete at the processor.

## What changes vs prior decisions

- [`hono-worker-api-umbrella.md`](../compute/hono-worker-api-umbrella.md): unchanged. Hono Workers were already the chosen umbrella API layer; this decision just rules out the Functions alternative explicitly.
- [`cron-split-cf-vs-gh.md`](../compute/cron-split-cf-vs-gh.md): unchanged. CF Workers cron + GH Actions cron continue to split the cron load.
- [`firebase-spark-forever.md`](../../infrastructure/firebase-spark-forever.md): this decision is its corollary — Functions specifically singled out as the most-tempting-to-enable trap.

## Implications

- Service-catalog entries for Firebase products must show "Functions: NOT USED" in their free-tier-coverage row.
- Any prompt suggesting "deploy this as a Firebase Function" is rejected at design review.
- The `@chirag127/firebase-rest-firestore` package handles all server-style mutations from CF Workers via the REST API — no Admin SDK, no Functions.
- Any team-onboarding doc should call this out as one of the 5 things-you-cannot-do.

## Cross-refs

- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
- [Firebase Spark forever](../../infrastructure/firebase-spark-forever.md)
- [Hono Worker as umbrella API](../compute/hono-worker-api-umbrella.md)
- [Cron split: CF Workers + GH Actions](../compute/cron-split-cf-vs-gh.md)
- [Firestore via REST not Admin SDK](../database/firebase-rest-firestore-not-admin.md)
- [Monetisation playbook (no-card rails)](../../monetisation/playbook-no-card-rails.md)
