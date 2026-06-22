---
type: rule
title: "No self-hosting outside Cloudflare Pages / Workers"
description: "The family does not run servers on VPSes, Docker hosts, Kubernetes, Fly.io, Render, or any other compute substrate. Cloudflare Pages (static), Cloudflare Workers (logic), and CF KV/R2/D1 (data) are the ceiling. Hosted free tiers are preferred over self-hosted equivalents of Listmonk / Plausible / Umami / PostHog / Discourse."
tags: [rule, hosting, cloudflare, no-self-hosting, free-tier]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
  - rules/no-card-on-file
  - rules/cloudflare-pages-only
  - rules/no-subscriptions
  - decisions/architecture/cf-worker-quota-mitigation
---

# No self-hosting outside Cloudflare Pages / Workers

## Rule

No service in the family is ever self-hosted on a VPS, Docker host,
Kubernetes cluster, Fly.io machine, Render instance, or any
long-running box. The only compute the family runs is on Cloudflare's
free tier.

## Allowed

- **Static sites** on Cloudflare Pages
- **Logic** on Cloudflare Workers (and Pages Functions)
- **Storage** on Cloudflare KV / R2 / D1

## Banned (self-hosted variants of)

Listmonk, Plausible, Umami, PostHog, Discourse, Ghost, WriteFreely,
Matomo, Sentry self-hosted, Grafana self-hosted, Mastodon instance,
Mautic, n8n self-hosted, anything that requires a long-running
container.

## Why

- The user has **no VPS budget** — no card on file means no
  pay-as-you-go cloud spend ([`no-card-on-file.md`](./no-card-on-file.md)).
- **No ops appetite** — patching, monitoring, backups for a long-running
  box is a tax the family does not pay.
- Cloudflare's free tier (Pages + Workers + KV/R2/D1) is the ceiling.
  Hosted free tiers of the above products (Buttondown, Plausible Cloud,
  PostHog Cloud) are preferred over running our own.

## Cross-refs

- [`no-card-on-file.md`](./no-card-on-file.md) — the funding constraint
- [`cloudflare-pages-only.md`](./cloudflare-pages-only.md) — the hosting lock
- [`cf-worker-quota-mitigation.md`](../decisions/architecture/cf-worker-quota-mitigation.md) — playbook for staying inside the free Worker envelope
