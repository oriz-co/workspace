---
type: rule
title: "AWS Lambda EXCEPTION to no-card-on-file rule"
description: "User-approved exception. AWS Lambda is the 4th-rail fallback in the serverless chain. AWS account requires a card at signup (identity verification) but charged $0 if staying in forever-free 1M req/mo + 400K GB-sec. Lambda ONLY — no other AWS services covered."
tags: [rules, billing, free-tier, aws, aws-lambda, exception, serverless]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
  - rules/no-card-on-file
  - runbooks/free-hosting-providers/serverless-functions
  - runbooks/free-hosting-providers/index
---

# AWS Lambda EXCEPTION to no-card-on-file rule

User-approved, explicit, narrow exception to [`no-card-on-file`](./no-card-on-file.md). AWS Lambda is admitted as the **4th-rail fallback** in the family's serverless chain.

## Why this exception exists

The 4-rail fallback chain for serverless functions:

1. **Cloudflare Worker** (primary; 100K req/day, 10 ms CPU)
2. **Deno Deploy** (secondary; 1M req/mo, 50 ms CPU)
3. **Render Free** (tertiary; with 15-min sleep)
4. **AWS Lambda** (quaternary; user-approved exception — 1M req/mo + 400K GB-sec FOREVER-FREE)

Four independent rails give the family meaningful resilience for critical serverless paths. Three rails leave a one-vendor failure mode (CF + Deno + Render are independent companies, but all three are small relative to AWS). The fourth rail is AWS, which makes the chain genuinely uncorrelated.

## The specific compromise

**AWS account creation requires a credit card** for identity verification. This nominally violates [`no-card-on-file`](./no-card-on-file.md). The user has explicitly accepted this compromise because:

1. **Lambda free tier is genuinely forever-free** (not 12-month-trial). 1M req/mo + 400K GB-sec/mo is a perpetual quota tied to the account, not a promotional offer.
2. **Charged $0 if staying inside the quota.** No silent escalation, no quota-overflow charges *if* you architect for headroom (which we already do per [`never-hit-quotas`](./never-hit-quotas.md)).
3. **Spending alarms + budget caps + Service Quotas** can be wired to harden against runaway. (Not bulletproof — see [`no-card-on-file`](./no-card-on-file.md) on bill-shock incidents — but the 4th-rail role limits exposure.)
4. **4th rail only.** This is a fallback, not a primary. Traffic only reaches Lambda if rails 1-3 all fail simultaneously.

## Scope — Lambda ONLY

This exception **does NOT extend to any other AWS service**. Specifically EXCLUDED:

- **S3** — DROP. Use Backblaze B2 (no card) per [`object-storage.md`](../runbooks/free-hosting-providers/object-storage.md).
- **EC2** — DROP. Use Render / Koyeb (no card) per [`web-services.md`](../runbooks/free-hosting-providers/web-services.md).
- **RDS** — DROP. Use Neon (no card) per [`databases.md`](../runbooks/free-hosting-providers/databases.md).
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

When/if Lambda is actually deployed as the 4th rail:

1. **Budget alarm at $1/mo.** AWS Budgets is free for the first two budgets. Wire SNS → email.
2. **Service Quotas set to floor (1M req/mo)** — request quota DECREASE so even a runaway can't escape free tier.
3. **Reserved concurrency cap** on every Lambda function (e.g., 10) to box-in burst behaviour.
4. **CloudWatch billing alarm** as backstop ($5 hard alarm, separate from budgets).
5. **Provisioned concurrency: NEVER.** That's how the free tier breaks.
6. **Lambda@Edge: NEVER.** Use CF Workers instead.

## Why this is logged as a rule, not a one-off

This is a permanent, family-wide exception. Future agents reading [`no-card-on-file`](./no-card-on-file.md) will see Lambda mentioned in [`free-hosting-providers/serverless-functions.md`](../runbooks/free-hosting-providers/serverless-functions.md) as KEEP-EXCEPTION rather than DROP, and need a rule file to trace the authority for that delta. This file is that authority.

If the user later revokes this exception, mark this file `status: superseded` with a pointer to the revoking conversation; do NOT delete it (audit trail).

## See also

- [`no-card-on-file.md`](./no-card-on-file.md) — the rule this is an exception to
- [`runbooks/free-hosting-providers/serverless-functions.md`](../runbooks/free-hosting-providers/serverless-functions.md) — the 4-rail chain definition
- [`never-hit-quotas.md`](./never-hit-quotas.md) — paired headroom rule
