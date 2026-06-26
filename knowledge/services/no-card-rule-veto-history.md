---
type: service
title: "No-card-on-file rule veto history"
description: "Services killed by the no-card-on-file rule — running list."
tags: [no-card, reference, history]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
---

- Cloudflare R2 — killed in object-storage-split decision
- Vercel Pro — killed when considering hosting tiers
- Auth0 — killed in auth-backend grill
- Clerk Pro — would be killed at 10k MAU; hence the 5000 MAU migration trigger
- Macrium Reflect Free — discontinued, unrelated to card rule but listed for completeness
- Rule: [`no-card-on-file-prepaid-escape`](../rules/interaction/no-card-on-file-prepaid-escape.md) is absolute
