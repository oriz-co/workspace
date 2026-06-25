---
type: architecture
title: "Layer 5 \u2014 compute, in three tiers"
description: Compute work is split across GitHub Actions cron (build-time), Cloudflare
  Workers (edge runtime), and the user's browser. Each tier has a free quota and a
  clear remit.
tags:
- architecture
- compute
- workers
- github-actions
- browser
- layer-5
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- architecture/compute/api-umbrella-hono-worker
- architecture/database/cloud-dbs-as-caches
- architecture/database/canonical-store-jsonl
- rules/interaction/never-hit-quotas
- decisions/architecture/compute/cf-worker-quota-mitigation
---



# Layer 5 — compute, in three tiers

## Concept

Compute is split across three free tiers by where the work runs:
build-time (GitHub Actions), edge runtime (Cloudflare Workers), and
user runtime (the browser). Each tier has a clear remit, so no tier
sees enough load to threaten its quota.

## How it works

### Tier 1 — GitHub Actions cron

- Free for public repos; 2000 min/month on private
- Daily rebuild of JSON snapshots from external APIs (Last.fm, GitHub,
  Lichess, Hardcover, Open Library, simkl, AniList, Letterboxd, Steam,
  Fitbit, etc.)
- Rebuilds the lifestream JSONL → Turso warm-cache
- On-push CI runs typecheck/lint/build for every site
- Per-repo CI workflows live in each submodule's `.github/workflows/`

### Tier 2 — Cloudflare Workers Free

- 100K req/day account-wide, fails-closed
- ONE Hono Worker at `api.oriz.in` (see [api-umbrella-hono-worker.md](../compute/api-umbrella-hono-worker.md))
- Handles: Razorpay webhooks, contact form relay, reCAPTCHA verify,
  cross-site session check, subscription verification
- Most reads are CACHED to Cloudflare KV / read from static JSON, so
  100K req/day covers high traffic

### Tier 3 — browser runtime

- Free, scales infinitely with users
- Firestore client SDK direct from browser for per-user reads/writes
- Pagefind / Fuse.js / MiniSearch for in-page search
- Image-tools / PDF-tools heavy compute is already client-side
- Web3Forms ONLY from the browser (server-side calls require their
  paid plan + IP whitelist)

## Why this shape

Each tier has a different cost model. Build-time work is "free until
the runner-minutes cap"; edge runtime is "free until the request cap";
browser runtime is "free, and scales with the user paying for their
own browser CPU". Pushing each piece of work to the cheapest tier that
can do it keeps every quota deep in the green.

## Cross-refs

- The Worker that owns Tier 2 → [api-umbrella-hono-worker.md](../compute/api-umbrella-hono-worker.md)
- What the cron jobs build → [canonical-store-jsonl.md](../database/canonical-store-jsonl.md), [cloud-dbs-as-caches.md](../database/cloud-dbs-as-caches.md)
- The non-negotiable that drives this → [`../rules/never-hit-quotas.md`](../../rules/interaction/never-hit-quotas.md)
- The Tier-2 quota-headroom playbook → [`../decisions/architecture/cf-worker-quota-mitigation.md`](../../decisions/architecture/compute/cf-worker-quota-mitigation.md)
