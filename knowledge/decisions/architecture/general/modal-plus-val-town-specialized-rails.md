---
type: decision
title: Modal Labs for GPU batch + Val.town for utility scripts
description: Locked 2026-06-23 after fact-checking Modal Labs free tier still exists
  (verified). Modal handles GPU-heavy batch jobs ($30/mo recurring credits = ~50 T4-hours,
  no card at signup, hard Workspace budget cap). Val.town handles utility scripts
  + webhook receivers + cron reminders (100K runs/day free, GitHub OAuth signup).
  Modal is NOT part of the 4-rail HTTP fallback chain; it's a specialized rail.
tags:
- decision
- gpu
- modal
- val-town
- batch
- specialized-rails
- free-tier
timestamp: 2026-06-23
format_version: okf-v0.1
status: active
related:
- rules/infrastructure/free-tier-with-cost-controls
- rules/infrastructure/aws-lambda-exception
- decisions/architecture/compute/hono-write-once-deploy-all-rails
- runbooks/free-hosting-providers/serverless-functions
---



# Modal Labs + Val.town as specialized rails

## Modal Labs (GPU batch rail)

### Free tier (verified 2026-06-23)
- **$30/month recurring credits** (refreshed monthly, not one-time signup grant)
- ~50 T4-hours/mo at $0.59/hr, ~7.6 H100-hours/mo at $3.95/hr
- Generic "compute" budget applies to GPU, CPU, memory, volume storage all in one wallet
- Signup via GitHub OAuth — **no card required at signup**
- Card enforced only when usage exceeds $30 free credit
- **Workspace budget cap** is a first-class feature: set to $0 to stay strictly free

### When to use
- Bulk OG image generation (1 cron run scheduled via Modal, batches 1000 images, writes to R2/imgbb)
- Daily ML model retraining for analytics
- Video transcoding for the future `audio.oriz.in` / `video.oriz.in` apps
- Image processing that exceeds Cloudflare Workers' 10ms CPU OR Deno's 50ms
- Anything GPU that Workers AI's 10K Neurons/day can't cover

### When NOT to use
- Real-time HTTP requests (use Workers / Deno — Modal cold starts are slow)
- Anything in the 4-rail HTTP fallback chain
- Anything that fits in Workers AI free quota (use that first)

### Setup
- Sign up at https://modal.com via GitHub OAuth
- `pip install modal-client` then `modal token new`
- Set Workspace budget to $0 immediately in Usage & Billing
- Env vars (already added to .env / .env.example):
  - `MODAL_TOKEN_ID`
  - `MODAL_TOKEN_SECRET`
  - `MODAL_WORKSPACE=oriz`

## Val.town (utility scripts + webhook rail)

### Free tier
- Unlimited public vals
- 100,000 runs/day
- 15-minute minimum cron interval
- No custom domains (vals served at val.run/<user>/<val>)
- GitHub OAuth signup, no card

### When to use
- Quick webhook receivers (Telegram, GitHub, Razorpay test mode)
- Cron-based reminders / pings (e.g. weekly health checks)
- Blog code samples that should be runnable in-browser
- API mocks for demos
- Glue scripts that don't deserve a full Worker repo

### When NOT to use
- Private business logic (vals are public by default)
- Anything user-facing (no custom domains)
- Anything where 100K/day is a real ceiling (use Workers instead)

### Setup
- Sign up at https://www.val.town via GitHub OAuth
- Generate API token in dashboard
- Env vars:
  - `VAL_TOWN_API_TOKEN`
  - `VAL_TOWN_USERNAME`

## What about HF Spaces?

**Skipped 2026-06-23.** Sleep windows (48h idle) and infrastructure variance make Spaces unreliable for production. Modal covers GPU; Workers AI covers real-time inference. HF Spaces stays in the "evaluate when needed" pile.

## Rail summary post-2026-06-23

| Rail | Role | Where |
|---|---|---|
| CF Workers (primary HTTP) | rail 1 | api.oriz.in |
| Deno Deploy (HTTP) | rail 2 | deno.dev fallback |
| AWS Lambda (HTTP) | rail 3 | aws Function URL fallback |
| Render Free (HTTP) | rail 4 | onrender.com last-resort |
| Koyeb (no-card alt) | rail 5 | spare slot |
| **Modal Labs** | **GPU batch** | NOT in HTTP chain |
| **Val.town** | **Utility scripts** | NOT in HTTP chain |
| GitHub Actions | scheduled jobs | nightly cron, depend-on-secrets |
| Workers AI | real-time inference | 10K Neurons/day free |

## Cross-refs

- Cost-controls rule → [[rules/free-tier-with-cost-controls]]
- AWS Lambda exception → [[rules/aws-lambda-exception]]
- Hono portability → [[decisions/architecture/hono-write-once-deploy-all-rails]]
- 4-rail chain → [[runbooks/free-hosting-providers/serverless-functions]]
