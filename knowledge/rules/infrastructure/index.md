---
type: index
title: Infrastructure
description: Index of concepts in rules/infrastructure.
tags:
- index
- infrastructure
timestamp: '2026-06-24'
format_version: okf-v0.1
status: active
---

# Infrastructure

## Concepts

- [AWS Lambda EXCEPTION to no-card-on-file rule](./aws-lambda-exception.md) — User-approved exception. AWS Lambda is the 3rd-rail fallback in the serverless chain (promoted from 4th on 2026-06-23). AWS account requires a card at signup (identity verification) and account MUST be on Paid Plan to keep the perpetual 1M req/mo + 400K GB-sec quota past 6 months (Free Plan auto-closes). Lambda ONLY — no other AWS services covered.
- [Cloudflare Pages = apps only. Everything else = GitHub Pages](./cloudflare-pages-apps-only.md) — Locked 2026-06-23. CF Pages hosts the 25 apps under repos/oriz/own/prod/apps/ ONLY (content + hub + personal + tools). All other surface area — npm package READMEs, API JSON catalogs, books, extensions, skills, forks — uses GitHub Pages with the repo's CNAME pointing to its <repo>.github.io target. Any subdomain that surfaces 'more information' style content for a non-app links to oriz.in. Removes confusion about which CF Pages projects should exist; bounds the 100-project CF Pages soft cap; matches the 'subdomain per app, GH Pages for everything else' shape.
- [Cloudflare Pages only — every website and every app hosts on CF Pages](./cloudflare-pages-only.md) — Family hosting lock. See the decision file for full rationale.
- [Card-on-file allowed BUT only on free-tier-safe providers with hard cost controls](./free-tier-with-cost-controls.md) — REVERSED 2026-06-23. Card-on-file is permitted, but ONLY with providers that (a) have a real perpetual free tier, (b) support a hard $0 spending cap or budget that auto-shuts-down on overshoot, (c) don't auto-charge for quota overages with no opt-out. The goal isn't card-avoidance — it's avoiding any bill we didn't plan to pay. AWS Lambda exception remains active. Supersedes the absolute no-card-on-file rule.
- [No firebase-admin inside Cloudflare Workers](./no-firebase-admin-in-workers.md) — Cloudflare's workerd runtime does not fully support gRPC, which firebase-admin requires. Use firebase-rest-firestore (REST + Web SDK) instead inside any Worker.
- [No Firebase Cloud Functions — Blaze requires a card on file](./no-firebase-functions-blaze.md) — Firebase Cloud Functions only run on the Blaze pay-as-you-go plan, which requires a card on file. Per the no-card-on-file rule, Functions are hard-banned family-wide. Replacements: GitHub Actions cron, Cloudflare Workers REST APIs, CF Pages Functions per-page logic, and Firestore client SDK direct from the browser. Firebase Auth + Firestore stay (Spark free, no card).
- [No PAID self-hosting — free + no-card-on-file providers are fine](./no-paid-self-hosting-only.md) — Reversal 2026-06-22: self-hosting is FINE as long as the provider is free / no-card-on-file. The hard constraint is 'no card on file', not 'no servers'. This rule is now effectively merged with no-card-on-file.md and kept as a thin pointer + provider allowlist.
- [No subscriptions — no service requiring a recurring paid plan](./no-subscriptions.md) — Family monetisation constraint. See the decision file for full rationale.
- [One-level subdomains only — never two levels deep below oriz.in](./one-level-subdomain-only.md) — Locked 2026-06-22 evening. Family subdomains live AT MOST one level deep below oriz.in. ALLOWED: blog.oriz.in / paisa.oriz.in / fii-dii-api.oriz.in. FORBIDDEN: <name>.api.oriz.in (two levels), <name>.<group>.oriz.in. Reason: Cloudflare Universal SSL free tier covers *.oriz.in only (one-level wildcard). Two-level requires paid ACM ($10/mo) which violates no-card-on-file rule. Current violation: 19 *.api.oriz.in subdomains — workaround: CF DNS-only (grey cloud), GH Pages handles SSL at 2 levels via Let's Encrypt. NEW APIs must use `<name>-api.oriz.in` one-level pattern.
- [Shared-tenant-by-default for every 3rd-party service](./shared-tenant-by-default.md) — Locked 2026-06-22 evening. For every 3rd-party SaaS (Sentry / GA4 / Microsoft Clarity / PostHog / UptimeRobot / Algolia / etc.) create ONE tenant family-wide. Apps separate via tags / labels / custom-dimensions / project-properties. NEVER create per-app accounts/projects when a tag-based shared tenant works. Prevents N×M signup burden (26 apps × 8 services = 208 manual setups → 8 setups) and consolidates billing/limits.
