---
type: rule
title: "\"Free for the developer\" means services we consume, not license"
description: "When user says \"free for the developer\" they mean the services WE consume must be free (no card, no quota walls) — NOT that the code we ship must be OSS. License stays \"all rights reserved\" / \"source-available.\""
tags: [feedback, agent-preferences, licensing, no-card]
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
---

User clarification 2026-06-21 when grilled on package license choice: "Free for the developer doesn't mean that it is free for everyone. Free for only me. The developer as a me only me as a developer only. For me everything is free. Everything should be free or whatever external services I'm using if I'm using. I am using cloud player or any other. Should be in the making of the websites apps from extension VS code extension. Whatever I am making it should be free. Supported for the services I am provided."

**Why this is non-obvious:** "Free for developer" naturally reads as "MIT / Apache / OSS license so other devs can use my packages." User means the opposite — the COST OF BUILDING the family must be $0 (free tiers, no card, no subscriptions), but the code itself stays source-available all-rights-reserved.

**How to apply:**
- License questions: default to current LICENSE (source-available, all rights reserved). Don't propose MIT / Apache / GPL unless user explicitly asks.
- "Free" decisions about tooling: interpret as "no recurring cost to chirag127" (servers, services, build minutes, API quotas).
- README badges: "License: source-available" not "License: MIT."
- When evaluating a new service for the stack: free tier check is mandatory; OSS-ness of the service is irrelevant.

Related: [`no-card-on-file-prepaid-escape`](../../interaction/no-card-on-file-prepaid-escape.md), the family rule [`no-card-on-file`](../../interaction/no-card-on-file.md).
