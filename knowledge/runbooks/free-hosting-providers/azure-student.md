---
type: runbook
title: "Free hosting — Azure for Students (student-verified, NO card at signup)"
description: "User has an active Azure for Students subscription (offer code MS-AZR-0170P). $100/yr credit, renewable while enrolled, NO credit card required at signup (student-verified instead). Documents what's free, what's USEFUL for the family, what we'll use vs SKIP, and the commercial-use caveat."
tags: [runbook, hosting, free-tier, azure, azure-students, student-account, no-card-on-file]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
  - runbooks/free-hosting-providers/index
  - runbooks/free-hosting-providers/serverless-functions
  - runbooks/free-hosting-providers/databases
  - rules/no-card-on-file
  - rules/aws-lambda-exception
---

# Azure for Students — 2026-06-22

The user holds an active **Azure for Students** subscription (offer code `MS-AZR-0170P`). This is the rare cloud account that passes our [`no-card-on-file`](../../rules/no-card-on-file.md) rule, because Microsoft verifies eligibility via institutional email instead of a credit card.

This file documents what's actually free, what's USEFUL for the oriz family, and what we'll use vs SKIP.

## Eligibility + signup

- **Offer code:** `MS-AZR-0170P` (full Azure for Students). A separate `MS-AZR-0144P` (Starter) exists for 13+/16+ users who don't qualify for the full offer; no credit, no time limit.
- **Who qualifies:** 18+ verified full-time student at an accredited degree-granting institution. 140+ countries.
- **Credit card: NOT REQUIRED at signup.** Verification is Microsoft's own institutional-email check (NOT SheerID). User confirmed empirically.
- **Email used:** institutional academic email (`.edu`, `.ac.in`, `.ac.uk`, etc.). Document upload is the fallback if email auto-check fails.
- **Sign in with a personal Microsoft account, not the college work account** (work accounts have org policies that block the offer).
- **Credit:** **$100 USD**, valid 12 months. Globally USD-denominated.
- **Renewal:** annual; Microsoft notifies up to 30 days before the anniversary. Fresh $100 + new 12 months as long as you re-verify as an active student. Unused credit does NOT carry forward.
- **At graduation:** renewal blocked. No auto-conversion. Only path is manual PAYG upgrade (which then requires a card — DON'T).

## What's included — specific quotas

| Service | Quota | Type |
|---|---|---|
| **App Service F1** | Shared CPU, 60 CPU min/day, 1 GB RAM, 1 GB storage, 165 MB egress/day, 10 apps/region. No custom-domain SSL, no always-on, no scale-out. | Always free |
| **Azure Functions (Consumption Y1)** | **1,000,000 executions/mo + 400,000 GB-seconds/mo** per subscription | Always free |
| **Cosmos DB Free Tier** | **1,000 RU/s + 25 GB** per account, lifetime, opt-in at account creation, 1/subscription, provisioned-throughput only (not serverless) | Always free / lifetime |
| **Static Web Apps Free** | 100 GB bandwidth/mo, 10 apps, 2 custom domains/app, free auto-renewing SSL, 250 MB storage/env, 3 preview envs | Always free |
| **AKS Free tier** | Control plane free (no SLA). VM nodes, disks, LB, egress all charged. One B2s ≈ $30/mo eats credit fast. | Control plane only |
| **Blob Storage** | 5 GB LRS hot + 20k reads + 10k writes/mo | 12-month free |
| **Azure SQL Database free offer** | **100,000 vCore-seconds + 32 GB data + 32 GB backup** per database/mo, up to 10 GP databases per subscription, auto-pause when exhausted | Always free / lifetime |
| **Azure DevOps** | 5 Basic users, unlimited private Git repos, 1 MS-hosted parallel job (1,800 min/mo) | Always free |
| **Container Apps Consumption** | 180k vCPU-seconds + 360k GiB-seconds + 2M requests/mo per subscription | Always free |
| **Entra External ID (B2C successor)** | 50,000 MAU free | Always free |
| **Egress** | 100 GB/mo outbound across account | Always free |
| **Visual Studio Community + dev tools** | VS Community, VS Code, SQL Server Dev, Windows Server, Visio, etc. (Software Download Benefits — no-commercial clause) | Bundled |

## Always-free vs 12-month-free split

**Always-free (perpetual):** App Service F1, Functions consumption grant, Static Web Apps Free, Container Apps grant, Cosmos DB free tier, Azure SQL free offer (10 DBs × 32 GB), AKS control plane, DevOps, Entra ID Free, 100 GB egress.

**12-month / time-bombed:** VMs (B1S 750h), Azure SQL standard 250 GB, Container Registry Standard, Load Balancer Standard, PostgreSQL/MySQL Flexible Server, AKS managed add-ons, blob storage 5 GB grant.

## Card-free safety mechanism

- **Spending limit is ON by default** and unremovable without PAYG upgrade. This is what makes the account safe under our no-card rule.
- **$100 exhausted:** subscription enters read-only, then disabled. **No card on file → no charges. EVER.**
- **12 months expired:** if still a student, renew. If not, 90-day grace period to upgrade (we won't) before resources are decommissioned.
- **Mid-period PAYG upgrade:** remaining credit consumed first before any card charge — but we don't upgrade.

## Commercial-use policy — strict on paper, loosely enforced

**Official wording (program-faq):**
> "Azure for Students provides access to all Azure products **expressly for the support of education or teaching, noncommercial research, or efforts to design, develop, test, and demonstrate software applications for these purposes.**"

**Software Download Benefits clause (applies to bundled VS / SQL Server / Windows Server):**
> "You may not use Software Download Benefits to provide any services to others (such as hosting, web agency, integration or outsourced development, etc.)."

**Enforcement reality:**
- Microsoft runs automated audits. Crypto-mining is the explicit #1 trigger.
- Heavy policy locks restrict regions/SKUs/Azure OpenAI by default.
- Hobby SaaS with low QPS that "looks like learning" tends to survive — but Microsoft reserves unilateral termination rights.
- **Not safe for monetised production reliance:** no SLA, no migration window if flagged, 12-month credit cliff.

**Family stance:** Azure Student is for **learning, prototyping, side-project demos, portfolio items, and dev-only stages**. Anything that needs production reliability stays on Cloudflare Pages + Workers + Firebase Spark (our primary stack).

## What we'll USE

| Layer | Service | Why |
|---|---|---|
| Backup serverless rail | **Azure Functions Consumption** | 1M execs + 400k GB-s/mo always-free. Useful as a 5th-rail fallback under the [AWS Lambda exception](../../rules/aws-lambda-exception.md) chain for v0.1 prototype work. Not a production rail. |
| Prototype Postgres | **Azure SQL free offer** | 10 DBs × 32 GB lifetime — more generous than Neon's 0.5 GB/project for any single DB. Useful for learning Azure SQL specifically. |
| Per-app NoSQL prototype | **Cosmos DB free tier** | 1,000 RU/s + 25 GB lifetime. ONLY useful if we want to learn Cosmos; Firestore Spark covers production. |
| Side-project static demo | **Static Web Apps Free** | 100 GB/mo, 2 custom domains. Useful for one-off Azure-integrated demos. Cloudflare Pages stays the primary host per [`cloudflare-pages-only`](../../rules/cloudflare-pages-only.md). |

## What we'll SKIP

| Service | Why skip |
|---|---|
| **AKS** | One B2s node ≈ $30/mo eats credit. Not free in practice. |
| **VMs (B1S 750h/mo)** | 12-month only, then dies. No reason vs Render/Koyeb free. |
| **PostgreSQL/MySQL Flexible Server** | 12-month only. Neon (Postgres) is lifetime no-card. |
| **Blob Storage** | 12-month grant only. B2 + Storj are lifetime no-card. |
| **Azure Front Door** | $35/mo flat base fee even at zero traffic. Hard avoid. |
| **App Service F1** | 165 MB egress/day is too tight to serve assets. Pages handles this. |
| **VS Community / Software Download Benefits** | No-commercial clause. We're commercial-use-OK only on Cloudflare/Firebase. |

## Cloudflare-Pages-only rule still wins

Per [`cloudflare-pages-only.md`](../../rules/cloudflare-pages-only.md), **every website and every app in the family hosts on Cloudflare Pages**. No exceptions. Azure Static Web Apps is a learning/prototype playground, not a production destination.

Similarly, Azure Functions is a **5th-rail prototype fallback only**. The [serverless 4-rail chain](./serverless-functions.md) (CF Workers → Deno Deploy → Render → AWS Lambda) is the production order.

## Gotchas that burn $100 credit fast

1. **Azure Front Door Standard = $35/mo flat base fee** even at zero traffic. Hard avoid.
2. **Public IPs ≈ $3-4/mo each** — let managed services hide them.
3. **AKS worker nodes:** one B2s ≈ $30/mo. Use Container Apps if needed at all.
4. **Cosmos DB free tier** is one-per-subscription, NOT available for serverless accounts — opt in at account creation.
5. **App Service F1 egress = 165 MB/day** — never serve assets from it.
6. **Functions Premium / Flex have no free grant** — stay on classic Consumption.
7. **Quota increases NOT available on Students** — must PAYG to raise limits. So just don't try.

## Recommendation for the family

1. **Treat Azure Student as a side-pocket experiment account**, not part of the production stack. Use it to:
   - Learn Azure Functions / Cosmos / SQL for skill-building.
   - Prototype an app that genuinely benefits from one Azure-native service.
   - Spin up a one-off demo for a portfolio item that needs to say "Azure".
2. **Production destination remains Cloudflare Pages + Workers + Firebase Spark.**
3. **Re-verify enrollment annually** to keep the renewal flowing. Calendar reminder 30 days before anniversary.
4. **Never enable any service that has a flat-fee base cost** (Front Door, public IPs, paid SKUs).
5. **If subscription is disabled** (audit flag, $100 exhausted), do NOT upgrade to PAYG. Migrate the workload off Azure or write it off — no card goes on file.

## Sources

- [Azure for Students landing](https://azure.microsoft.com/en-us/free/students)
- [Offer details MS-AZR-0170P](https://azure.microsoft.com/en-us/pricing/offers/ms-azr-0170p)
- [Education Hub Program FAQ](https://learn.microsoft.com/en-us/azure/education-hub/azure-dev-tools-teaching/program-faq) (updated 2026-03-25)
- [Reactivate disabled Azure for Students subscription](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/azurestudents-subscription-disabled)
- [Free Azure services catalogue](https://azure.microsoft.com/en-us/pricing/free-services)
- [Cosmos DB Free Tier docs](https://learn.microsoft.com/en-us/azure/cosmos-db/free-tier)
- [Azure SQL Database free offer + FAQ](https://learn.microsoft.com/en-us/azure/azure-sql/database/free-offer)
- [Static Web Apps quotas](https://learn.microsoft.com/en-us/azure/static-web-apps/quotas)
- [Container Apps billing (free grant)](https://learn.microsoft.com/azure/container-apps/billing#consumption-plan)
- [AKS Free vs Standard tier pricing](https://learn.microsoft.com/en-us/azure/aks/free-standard-pricing-tiers)
