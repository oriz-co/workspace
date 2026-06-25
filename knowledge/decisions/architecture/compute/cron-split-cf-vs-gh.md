---
type: decision
title: "Cron split \u2014 Cloudflare Cron Triggers + GitHub Actions schedule, by job\
  \ shape"
description: Run cron on BOTH substrates. CF Cron Triggers for in-Worker low-latency
  jobs; GH Actions schedule for build / publish jobs that need a runner. Pick by the
  job's shape, not by convenience.
tags:
- decisions
- architecture
- cron
- cloudflare
- github-actions
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/cron/cloudflare-cron-triggers
- services/cron/github-actions-schedule
- services/compute/cloudflare-workers
- services/compute/github-actions
- decisions/architecture/general/cross-post-engine
---



# Cron split — Cloudflare Cron Triggers + GitHub Actions schedule, by job shape

## Decision

The family runs cron jobs on **both** Cloudflare Cron Triggers and
GitHub Actions `schedule:`. The substrate is picked by the job's
shape, not by convenience:

- **Cloudflare Cron Triggers** ← jobs that live inside a Worker.
  Need Worker bindings (KV, R2, D1, Service Bindings), need
  sub-minute latency, run on a 1–60 min cadence, touch only
  first-party state.
- **GitHub Actions `schedule:`** ← jobs that need a build
  environment. Need `pnpm` / `wrangler` / `gh`, need repo
  checkout, need to commit results back, need to publish to npm /
  a registry / a deploy target.

## Why

- They aren't substitutes — they're different substrates. CF Cron has no `pnpm`; GH Actions has 5–15 min jitter and runner cold starts that disqualify it for sub-minute jobs.
- Both are **free** at our scale on the [Spark / Free / public-repo](../../../rules/interaction/no-card-on-file.md) tier — no card, no quota cliff for the volumes the family actually runs.
- Splitting by job shape makes the answer to "where does this cron live" mechanical: read the job description, pick the substrate. No ambiguity, no per-team taste.
- Concretely: oriz-omnipost's RSS cross-post **commits `state.json` back to the repo** — that's a GH Actions job. The Worker's idempotency-table sweep **only touches Worker KV** — that's a CF Cron Triggers job. Same family, two substrates, zero overlap.

## Implications

- New `services/cron/` subdir holds [`cloudflare-cron-triggers.md`](../../../services/cron/cloudflare-cron-triggers.md) and [`github-actions-schedule.md`](../../../services/cron/github-actions-schedule.md). The shared GitHub Actions service entry at [`services/compute/github-actions.md`](../../../services/compute/github-actions.md) keeps documenting CI; the cron-shaped facet lives in `services/cron/`.
- Every cron job in the family declares **which substrate it lives on** in its file header (workflow YAML or `wrangler.toml`).
- Latency-sensitive jobs (RSS poll, idempotency sweeps, cache rebuilds) move to CF Cron when introduced. Build / publish / commit-back jobs stay on GH Actions.
- Heartbeat to [healthchecks.io](../../../services/monitoring/healthchecks-io.md) is fired from **both** substrates — one heartbeat URL per substrate, so a substrate outage shows up as a missed heartbeat for that substrate alone.
- Worker quota math (100K req/day) treats CF Cron invocations as Worker requests; this is fine — every cadence we run sums to <1K invocations/day per Worker, well clear of the cap. Documented in [`never-hit-quotas.md`](../../../rules/interaction/never-hit-quotas.md) headroom math.
- No third cron substrate. Adding one (Vercel Cron, Deno Deploy cron, self-hosted) is rejected — it doesn't unlock a job shape these two can't cover, and it adds another quota to never hit.

## Decision matrix (the on-ramp question for new jobs)

```
Does the job need pnpm / wrangler / gh / repo checkout / npm publish?
├── YES → GitHub Actions schedule
└── NO  → Does it need < 5 min latency or Worker bindings?
         ├── YES → Cloudflare Cron Triggers
         └── NO  → Either; default to CF Cron Triggers (cheaper minutes-budget)
```

## Cross-refs

- [Cloudflare Cron Triggers service entry](../../../services/cron/cloudflare-cron-triggers.md)
- [GitHub Actions schedule service entry](../../../services/cron/github-actions-schedule.md)
- [Cloudflare Workers](../../../services/compute/cloudflare-workers.md)
- [GitHub Actions](../../../services/compute/github-actions.md)
- [Cross-post engine — uses GH Actions schedule today, may move to CF Cron later](../general/cross-post-engine.md)
- [Never hit free-tier quotas](../../../rules/interaction/never-hit-quotas.md)
- [Per-repo CI workflows](../../process/per-repo-ci-workflows.md)
