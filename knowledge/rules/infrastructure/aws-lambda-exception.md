---
type: rule
title: AWS Lambda EXCEPTION to no-card-on-file rule
description: "User-approved exception. AWS Lambda is the 3rd-rail fallback in the\
  \ serverless chain (promoted from 4th on 2026-06-23). AWS account requires a card\
  \ at signup (identity verification) and account MUST be on Paid Plan to keep the\
  \ perpetual 1M req/mo + 400K GB-sec quota past 6 months (Free Plan auto-closes).\
  \ Lambda ONLY \u2014 no other AWS services covered."
tags:
- rules
- billing
- free-tier
- aws
- aws-lambda
- exception
- serverless
timestamp: 2026-06-23
format_version: okf-v0.1
status: active
related:
- rules/interaction/no-card-on-file
- runbooks/free-hosting-providers/serverless-functions
- runbooks/free-hosting-providers/index
---



# AWS Lambda EXCEPTION to no-card-on-file rule

User-approved, explicit, narrow exception to [`no-card-on-file`](../interaction/no-card-on-file.md). AWS Lambda is admitted as the **4th-rail fallback** in the family's serverless chain.

## Why this exception exists

The 4-rail fallback chain for serverless functions (2026-06-23 order):

1. **Cloudflare Worker** (primary; 100K req/day, 10 ms CPU per invocation; no card)
2. **Deno Deploy** (secondary; 1M req/mo, 15 CPU-h/mo, 350 GB-h memory; no card)
3. **AWS Lambda** (tertiary; user-approved exception — 1M req/mo + 400K GB-sec/mo perpetual; card required)
4. **Render Free** (quaternary; 750 inst-h/mo, 15-min idle spin-down; no card)

**Order changed 2026-06-23:** Lambda was 4th; promoted to 3rd because (a) no cold-sleep penalty (Render sleeps after 15 min idle), (b) Lambda 1M req/mo is the family's biggest free quota, (c) AWS infrastructure is genuinely uncorrelated with CF/Deno. Render stays in the chain as the truly-last-resort rail when even Lambda is unreachable (rare but possible — AWS region-wide outage).

Four independent rails give the family meaningful resilience for critical serverless paths. A possible 5th candidate (no-card alternative) is **Koyeb's free instance** (512 MB RAM / 0.1 vCPU / 2 GB SSD) — replacing Fly.io, which killed its free tier in 2024-2025.

## The specific compromise

**AWS account creation requires a valid payment method on both the Free Plan and the Paid Plan** (AWS Free Tier FAQ Q10, verified 2026-06-23). This nominally violates [`no-card-on-file`](../interaction/no-card-on-file.md). The user has explicitly accepted this compromise because:

1. **Lambda quota is genuinely perpetual** within an active AWS account. 1M req/mo + 400K GB-sec/mo is listed under "30+ Always Free services" — not a promotional 12-month trial.
2. **Charged $0 if staying inside the quota.** No silent escalation, no quota-overflow charges *if* you architect for headroom (per [`never-hit-quotas`](../interaction/never-hit-quotas.md)).
3. **Spending alarms + budget caps + Service Quotas** can be wired to harden against runaway. (Not bulletproof — see [`no-card-on-file`](../interaction/no-card-on-file.md) on bill-shock incidents — but the 3rd-rail role limits exposure.)
4. **3rd rail only.** This is a fallback, not a primary. Traffic only reaches Lambda if rails 1-2 both fail simultaneously.

## **NEW 2026 trap — AWS Free Plan auto-closes after 6 months**

AWS restructured the free tier in 2025-2026. New accounts now choose between:

- **Free Plan**: $200 in credits over 6 months, account **closes automatically** at 6 months or when credits are exhausted, whichever comes first. Access limited to ~30 services.
- **Paid Plan**: full AWS service catalogue, pay-as-you-go, Always-Free quotas apply on top.

**To keep the Lambda perpetual free quota past month 6, the AWS account MUST be on the Paid Plan.** This means:

- The card on file is no longer just "identity verification" — it is an active billing instrument.
- A Paid-Plan account with $0 usage inside Always-Free quotas still costs $0/mo — quota math hasn't changed.
- **All hardening from this rule applies with extra urgency** on a Paid Plan account.

Sources verified 2026-06-23:
- [AWS Free Tier FAQs](https://aws.amazon.com/free/free-tier-faqs/) (Q1, Q9, Q10)
- [AWS Free Tier overview](https://aws.amazon.com/free/)
- [Lambda pricing](https://aws.amazon.com/lambda/pricing/)

## Scope — Lambda ONLY

This exception **does NOT extend to any other AWS service**. Specifically EXCLUDED:

- **S3** — DROP. Use Backblaze B2 (no card) per [`object-storage.md`](../../runbooks/free-hosting-providers/object-storage.md).
- **EC2** — DROP. Use Render / Koyeb (no card) per [`web-services.md`](../../runbooks/free-hosting-providers/web-services.md).
- **RDS** — DROP. Use Neon (no card) per [`databases.md`](../../runbooks/free-hosting-providers/databases.md).
- **DynamoDB** — DROP. Use Firestore Spark or Cloudflare D1.
- **CloudFront** — DROP. Use Cloudflare Pages.
- **API Gateway** — only as the public surface for the same Lambda functions covered by this exception. No standalone API Gateway use.
- **Lambda@Edge** — DROP. Use Cloudflare Workers.
- **Any other AWS managed service** — DROP unless this rule is amended in a future conversation.

## Enforcement

- **Code reviewer rejects any AWS dep that isn't `@aws-sdk/client-lambda` / `aws-lambda` types / Lambda runtime packages.**
- **Grep alarm:** `@aws-sdk/client-s3`, `@aws-sdk/client-dynamodb`, `@aws-sdk/client-ec2`, etc. in any oriz repo = automatic reject.
- **CI fail:** any `package.json` listing AWS SDK packages other than the Lambda-runtime/-client/-types trio.

## Hardening required when wiring Lambda

When/if Lambda is actually deployed as the 3rd rail:

0. **Sign up on the Paid Plan (NOT Free Plan)** — Free Plan auto-closes at 6 months and you lose the perpetual quota. Paid Plan with $0 usage inside Always-Free quotas is still $0/mo.
1. **Budget alarm at $1/mo.** AWS Budgets is free for the first two budgets. Wire SNS → email.
2. **Service Quotas set to floor (1M req/mo)** — request quota DECREASE so even a runaway can't escape free tier.
3. **Reserved concurrency cap** on every Lambda function (e.g., 10) to box-in burst behaviour.
4. **CloudWatch billing alarm** as backstop ($5 hard alarm, separate from budgets).
5. **Provisioned concurrency: NEVER.** That's how the free tier breaks.
6. **Lambda@Edge: NEVER.** Use CF Workers instead.

## Why this is logged as a rule, not a one-off

This is a permanent, family-wide exception. Future agents reading [`no-card-on-file`](../interaction/no-card-on-file.md) will see Lambda mentioned in [`free-hosting-providers/serverless-functions.md`](../../runbooks/free-hosting-providers/serverless-functions.md) as KEEP-EXCEPTION rather than DROP, and need a rule file to trace the authority for that delta. This file is that authority.

If the user later revokes this exception, mark this file `status: superseded` with a pointer to the revoking conversation; do NOT delete it (audit trail).

## See also

- [`no-card-on-file.md`](../interaction/no-card-on-file.md) — the rule this is an exception to
- [`runbooks/free-hosting-providers/serverless-functions.md`](../../runbooks/free-hosting-providers/serverless-functions.md) — the 4-rail chain definition
- [`never-hit-quotas.md`](../interaction/never-hit-quotas.md) — paired headroom rule
