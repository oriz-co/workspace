---
type: rule
title: "No PAID self-hosting \u2014 free + no-card-on-file providers are fine"
description: 'Reversal 2026-06-22: self-hosting is FINE as long as the provider is
  free / no-card-on-file. The hard constraint is ''no card on file'', not ''no servers''.
  This rule is now effectively merged with no-card-on-file.md and kept as a thin pointer
  + provider allowlist.'
tags:
- rule
- hosting
- no-card
- free-tier
- self-hosting
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
merged_with: rules/no-card-on-file
supersedes: rules/no-self-hosting-outside-cf
related:
- rules/interaction/no-card-on-file
- rules/infrastructure/cloudflare-pages-only
- rules/infrastructure/no-subscriptions
- decisions/architecture/compute/cf-worker-quota-mitigation
---



# No PAID self-hosting — free is fine

## Rule

Self-hosting is **fine**. The only hard constraint is the underlying
provider must be **free and require no card on file**. The previous
"no self-hosting outside Cloudflare" rule is **reversed** — it was
over-strict and is now merged with [`no-card-on-file.md`](../interaction/no-card-on-file.md).

If a provider's free tier needs no card, you may run a long-running
container, a VPS, a managed Postgres, a Docker host — anything.

## Allowlist (free + no-card-on-file)

- **Cloudflare** Pages / Workers / KV / R2 / D1 (free tier)
- **Firebase** Spark plan (Auth + Firestore + Hosting)
- **Supabase** free tier (Postgres + Auth + Storage; no card)
- **Render** free tier (web services + static + cron; no card)
- **Fly.io** free tier (no card required for hobby)
- **Oracle Cloud Always-Free** (2 AMD VMs + 4 ARM VMs forever; card NOT required for Always-Free)
- **GitHub Pages** (static only)
- **Netlify** free tier (100 GB bandwidth/mo; no card)
- **Vercel** Hobby (no card required)
- **Deno Deploy** free tier
- **Glitch** free tier
- Any future provider whose free tier requires **no card**

## Banlist (require card)

- AWS / GCP / Azure (card required even for free tier)
- DigitalOcean (card required)
- Linode (card required)
- Heroku (card required since 2022)
- Firebase Blaze (card required)
- Any "free trial then pay" model

## Why the reversal

The original rule conflated "card on file" risk with "self-hosting"
operational tax. They're orthogonal:

- **Card on file** is a financial risk (4-5 figure bill-shock incidents documented in `no-card-on-file.md`)
- **Self-hosting** is an ops-tax risk (patching, monitoring, backups)

Ops tax is acceptable on a free provider; bill-shock is never
acceptable. So the only line that matters is the card line.

## Cross-refs

- [`no-card-on-file.md`](../interaction/no-card-on-file.md) — the actual binding constraint
- [`cloudflare-pages-only.md`](./cloudflare-pages-only.md) — kept for primary web hosting
- [`no-subscriptions.md`](./no-subscriptions.md) — stricter cousin (no recurring billing of any kind)
