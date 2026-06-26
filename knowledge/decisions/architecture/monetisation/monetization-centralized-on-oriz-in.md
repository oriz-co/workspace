---
type: decision
title: "Monetization centralized on oriz.in"
description: "Razorpay checkout lives ONLY on oriz.in/pricing. Apps redirect for paid upgrades. Single merchant."
tags: [monetisation, razorpay, superseded]
timestamp: 2026-06-23
format_version: okf-v0.1
status: superseded
superseded_by: donations-only-no-pro-no-ads
---

Razorpay checkout exists on oriz.in/pricing only. Every app's "Upgrade" CTA redirects to `https://oriz.in/pricing?app=<slug>&return=<url>`. Razorpay structurally forbids multiple merchant accounts per business PAN, so this is the only legal shape. Sign-in encouraged everywhere to capture analytics; strictly required for: Pro/Max features, stateful apps (journal, financial-cards, omni-post, packages-catalog), settings persistence. Stateless tools (PDF, dice, QR, currency) allow anonymous use. Locked 2026-06-23.

**SUPERSEDED 2026-06-25** by [`donations-only-no-pro-no-ads`](./donations-only-no-pro-no-ads.md). No Pro tier exists anymore; donations only.
