---
type: rule
title: "No Firebase Cloud Functions \u2014 Blaze requires a card on file"
description: 'Firebase Cloud Functions only run on the Blaze pay-as-you-go plan, which
  requires a card on file. Per the no-card-on-file rule, Functions are hard-banned
  family-wide. Replacements: GitHub Actions cron, Cloudflare Workers REST APIs, CF
  Pages Functions per-page logic, and Firestore client SDK direct from the browser.
  Firebase Auth + Firestore stay (Spark free, no card).'
tags:
- rule
- firebase
- no-functions
- no-card-on-file
- cloudflare-workers
- github-actions
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- rules/interaction/no-card-on-file
- decisions/architecture/general/no-firebase-functions
- decisions/architecture/compute/cf-worker-quota-mitigation
- decisions/architecture/compute/hono-worker-api-umbrella
---



# No Firebase Cloud Functions — Blaze requires a card on file

## Rule

Firebase Cloud Functions are **never** used in the family. Functions
only runs on Blaze (pay-as-you-go), Blaze requires a card on file,
and [`no-card-on-file.md`](../interaction/no-card-on-file.md) is non-negotiable.

Firebase **Auth** and **Firestore** stay — both work on Spark with
no card and cover the family's auth + persistence needs.

## What to use instead (priority order)

1. **GitHub Actions** — cron, build, CI, batch jobs, scrapers. Unlimited
   minutes on public repos.
2. **Cloudflare Workers** — REST APIs, webhook receivers, edge logic.
   100K req/day free per Worker (split per domain for headroom — see
   [`cf-worker-quota-mitigation.md`](../../decisions/architecture/compute/cf-worker-quota-mitigation.md)).
3. **Cloudflare Pages Functions** — per-page server logic on a Pages
   site. Shared 100K/day envelope with Workers.
4. **Firestore client SDK** — read/write directly from the browser with
   Firebase Auth + Security Rules. No server tier needed for most CRUD.

## Why

Documented Blaze bill-shock incidents (simmer.io ~$98K, Tamara ~$70K,
€54K Gemini-key leak) all involved card-on-file Firebase / GCP
projects. Cloud Spend Caps are still private preview at Cloud Next '26
and do not cover Functions. The only real defense is "no Blaze, ever".

## Cross-refs

- [`no-card-on-file.md`](../interaction/no-card-on-file.md) — parent rule
- [`no-firebase-functions.md`](../../decisions/architecture/general/no-firebase-functions.md) — full decision artefact
- [`cf-worker-quota-mitigation.md`](../../decisions/architecture/compute/cf-worker-quota-mitigation.md) — Worker free-tier playbook
- [`hono-worker-api-umbrella.md`](../../decisions/architecture/compute/hono-worker-api-umbrella.md) — the API replacement
