---
type: decision
title: "Queue \u2014 Cloudflare Queues, picked for stack cohesion"
description: Cloudflare Queues is the family's primary durable queue. Picked for native
  Worker bindings + same-account billing surface, not for feature richness. Upstash
  QStash + Inngest documented as deferred alternatives.
tags:
- queue
- cloudflare
- workers
- stack-cohesion
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/queue/cloudflare-queues
- services/queue/upstash-qstash
- services/queue/inngest
- decisions/infrastructure/cloudflare-pages-for-all-sites
- rules/interaction/no-card-on-file
---



# Queue — Cloudflare Queues, picked for stack cohesion

## Decision

The family uses [Cloudflare Queues](../../../services/queue/cloudflare-queues.md)
as its sole durable message queue. The user direction was *"unsure,
no recommendation given"* — this decision file records the
reasoning behind the recommendation.

[Upstash QStash](../../../services/queue/upstash-qstash.md) and
[Inngest](../../../services/queue/inngest.md) are documented as
`status: deferred` alternatives if the primary's quota cliff hits or
the programming model becomes a constraint.

## Why

The justification is **stack cohesion, not feature richness**:

- Every other layer of the family runs on Cloudflare — Pages, Workers,
  DNS, Registrar, KV (used by the [s.oriz.in shortener](../../../services/short-link/cloudflare-worker.md)).
  See [`cloudflare-pages-for-all-sites.md`](../../infrastructure/cloudflare-pages-for-all-sites.md).
- Cloudflare Queues binds **natively** from a Worker — no HTTP hop, no
  separate credentials surface, no extra DNS resolution. Producer
  and consumer share the same `wrangler.toml`.
- Same account → same billing surface (and same `no-card-on-file`
  posture — see [`rules/no-card-on-file.md`](../../../rules/interaction/no-card-on-file.md)).
- 1,000,000 ops/month free is an order of magnitude above realistic
  family traffic.

QStash and Inngest each have feature edges (HTTP-from-anywhere,
durable multi-step workflows respectively) but neither edge applies
to current workloads, and both add a separate account, separate
credentials surface, and an HTTP hop.

## Implications

- The api.oriz.in umbrella Worker declares the queue binding in its
  `wrangler.toml` and produces directly. Consumer Workers declare the
  same queue as a consumer binding.
- Upstream of the queue, [Hookdeck](../../../services/tooling/hookdeck.md)
  remains the webhook-reliability layer for external producers
  (Razorpay etc.) — Hookdeck's retry-and-replay precedes the queue,
  the queue handles back-pressure within the Worker.
- If the 1M ops/month cap is approached, revisit and consider QStash
  for low-volume bursts or Inngest if multi-step durable workflows
  become a real need.

## Cross-refs

- [Cloudflare Queues](../../../services/queue/cloudflare-queues.md)
- [Upstash QStash (deferred)](../../../services/queue/upstash-qstash.md)
- [Inngest (deferred)](../../../services/queue/inngest.md)
- [Cloudflare Pages for all sites](../../infrastructure/cloudflare-pages-for-all-sites.md)
- [Hookdeck for webhook reliability](../../infrastructure/hookdeck-for-webhook-reliability.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
