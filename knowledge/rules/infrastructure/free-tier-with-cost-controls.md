---
type: rule
title: Card-on-file allowed BUT only on free-tier-safe providers with hard cost controls
description: "REVERSED 2026-06-23. Card-on-file is permitted, but ONLY with providers\
  \ that (a) have a real perpetual free tier, (b) support a hard $0 spending cap or\
  \ budget that auto-shuts-down on overshoot, (c) don't auto-charge for quota overages\
  \ with no opt-out. The goal isn't card-avoidance \u2014 it's avoiding any bill we\
  \ didn't plan to pay. AWS Lambda exception remains active. Supersedes the absolute\
  \ no-card-on-file rule."
tags:
- rules
- billing
- free-tier
- cost-controls
- card-allowed
timestamp: 2026-06-23
format_version: okf-v0.1
status: active
supersedes: rules/no-card-on-file (this rule REPLACES the absolute no-card rule)
related:
- rules/interaction/never-hit-quotas
- rules/infrastructure/aws-lambda-exception
- rules/infrastructure/no-subscriptions
---



# Card-on-file allowed — with hard cost controls

## What changed 2026-06-23

The absolute "no card-on-file" rule is **lifted**. User decision: cards are fine, but a service must meet ALL three criteria before adding it:

1. **Real perpetual free tier** — not a 30-day trial, not a credit grant. Tier must be `$0/mo when usage = X`.
2. **Hard cost cap available** — budgets, spending limits, quotas that REJECT overages instead of charging for them. Or a service that simply stops working when free quota is exhausted.
3. **No silent overage charges** — service must NOT auto-charge for quota overflow without explicit opt-in.

## The new triage matrix

| Provider | Free tier | Cost cap available | Verdict |
|---|---|---|---|
| **Cloudflare** (Workers, Pages, KV, D1, R2*) | Yes (per-product) | Workers stops at 100K/day on Free plan; R2 needs Paid plan with caps | KEEP — R2 conditional |
| **AWS Lambda** | 1M req/mo + 400K GB-sec FOREVER | AWS Budgets + reserved concurrency = hard cap | KEEP (rule: `aws-lambda-exception`) |
| **GCP Cloud Run** | 2M req/mo always-free | Cloud Billing Budget alerts + spending limit (account-level) | EVALUATE — user has no-Google rule, separate decision |
| **Azure Functions Consumption** | 1M execs always-free | Azure Budgets + spending limit | EVALUATE — student account quirks |
| **Firebase Blaze** | Spark generous; Blaze adds pay-as-you-go | Daily quota cap available in Cloud Console | EVALUATE — only if Spark caps bite |
| **Fly.io** (killed free tier 2024) | None | n/a | DROP — no free tier |
| **Render Free** | 750 inst-h/mo, 15-min sleep | Service just stops if quota exhausted | KEEP — no card needed |
| **Hugging Face Spaces** | 16 GB RAM / 2 CPU free | Just stops; no overage | KEEP |
| **Modal Labs** | $30/mo compute credits free | Hard cap | KEEP |
| **Val.town** | 100K runs/day | Just stops | KEEP |
| **Vercel Hobby** | 1M invocations | Commercial-use BAN | DROP — license, not cost |
| **Netlify** | Credit-pooled (300/mo) | Just stops | KEEP — but unpredictable for 25+ sites |
| **Razorpay** | TEST mode free; LIVE charges per-txn | Per-txn, predictable | KEEP |
| **Cloudflare R2** | 10 GB free | Requires Paid plan to ACTIVATE service | EVALUATE — now permitted under new rule |

## What we lift from the old rule

- Cloudflare R2 — **NOW EVALUATING**. Free tier is real (10 GB + zero egress). The card-gate was the only blocker.
- GCP Cloud Run — NOW EVALUATING (the user's no-Google rule still drops it, but the no-card rule no longer does).
- Backblaze B2 default stays — it's still no-card AND free.

## The 5 cheap defensive moves (still apply)

These don't change — they're now even MORE important since cards are allowed:

1. **GCP project lien** on Firebase project → prevents accidental deletion
2. **AWS Budgets** at $1/mo for Lambda exception → email alert before any spend
3. **Service Quotas DECREASE** on AWS → cap requests below free tier so overshoot is rejected, not charged
4. **CloudFlare account billing alarm** at $0.10/mo via dash → catches R2 if activated
5. **1Password / Doppler for credentials** → cards stay encrypted, not in plaintext .env

## What this DOESN'T allow

- Pay-as-you-go services with no cap (e.g. some AI APIs that meter by output token with no built-in stop)
- Services charging for quota OVERFLOW without explicit opt-in (silent escalation)
- Subscriptions / monthly minimums (separate `no-subscriptions` rule still applies)
- Setting up notifications that we don't act on — alerts must trigger automated shutdown OR be in a channel we read

## Migration impact

- `rules/no-card-on-file.md` → mark `status: superseded by rules/free-tier-with-cost-controls.md`
- `services/*.md` files marked "card-gated DROP" → re-evaluate
- Knowledge runbooks → update verdicts where the only blocker was card-at-signup

## Cross-refs

- AWS Lambda exception → [[rules/aws-lambda-exception]] (special case still applies; this rule generalizes the principle)
- Never hit quotas → [[rules/never-hit-quotas]] (paired rule)
- No subscriptions → [[rules/no-subscriptions]] (separate concern about recurring fees)
