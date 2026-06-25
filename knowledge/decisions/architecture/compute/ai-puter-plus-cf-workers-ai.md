---
type: decision
title: "AI split \u2014 Puter.js (browser) + Cloudflare Workers AI (server)"
description: Two AI providers, picked by surface. Puter.js for browser-side calls
  (user-pays, no API key client-side). Cloudflare Workers AI for server-side calls
  inside the Hono Worker (10K neurons/day, zero-egress, native binding). Different
  surfaces, different reasons.
tags:
- ai
- puter
- cloudflare-workers-ai
- surface-split
- llm
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/ai/puter-js
- services/ai/cloudflare-workers-ai
- decisions/architecture/compute/hono-worker-api-umbrella
- rules/interaction/no-card-on-file
- rules/interaction/never-hit-quotas
---



# AI split — Puter.js (browser) + Cloudflare Workers AI (server)

## Decision

The family ships **two** AI providers, picked by **surface**:

| Surface | Service | Why this surface |
|---|---|---|
| **Browser** (chat in `oriz-me`, on-page assistants, any client-side AI feature) | [Puter.js](../../../services/ai/puter-js.md) | User-pays free tier; we ship no API key, the family pays nothing per request |
| **Server** (inside the umbrella Hono Worker at `api.oriz.in`) | [Cloudflare Workers AI](../../../services/ai/cloudflare-workers-ai.md) | Native Worker binding, zero-egress within Cloudflare, 10K neurons / day free, no card |

OpenRouter remains rejected (already locked); Firebase AI Logic
(Gemini) is available via the Firebase basics skill if a feature
truly needs Google's specific model, but is not the default.

## Why

A single AI provider can't cover both surfaces well:

- **Browser-only providers** (Puter.js) put auth + billing on the
  user, so the family ships nothing per request. But the API key
  can't ride into a Worker without exposing it.
- **Server-only providers** (Workers AI) bind natively to a Worker
  and run on the same edge node — best p50 of any inference path —
  but can't be called from a static Cloudflare Pages page without a
  relay.

Splitting by surface keeps each free tier reserved for its intended
workload, so neither cliff hits prematurely. Cloudflare Workers AI
also fits the family's stack-cohesion posture (same as
[`queue-cloudflare-native.md`](./queue-cloudflare-native.md) — same
account, same `wrangler.toml`, same no-card billing surface).

## Implications

- **Browser AI features** import the Puter.js script + use its model
  IDs (DeepSeek R1, Llama, Moonshot). No API key in client code.
- **Server AI features** declare an `[ai]` binding in the Hono
  Worker's `wrangler.toml` and call `env.AI.run("@cf/...")`. Inference
  happens on the same edge node as the Worker.
- **Embeddings** (e.g. for any future RAG over `oriz-me-data`) go
  through Workers AI's BGE / Nomic models, cached by content hash so
  re-runs cost zero neurons.
- **Image generation** (occasional og:image fallback alongside
  [Satori](../../../services/social/satori-og-cards.md)) goes through
  Workers AI's Stable Diffusion XL Lightning when needed.
- **Whisper for ASR** (podcast / video transcription) goes through
  Workers AI server-side.
- **Quota headroom** per [`rules/never-hit-quotas.md`](../../../rules/interaction/never-hit-quotas.md):
  the Hono Worker tracks neurons consumed per day in KV; trips a soft
  cap at 50% (5,000 neurons) to flag approach. Browser-side AI never
  burns the server budget — it goes through Puter.js.
- **Encapsulation**: server-side AI calls live in
  `apps/api/src/ai/` so the swap surface to OpenAI / Anthropic /
  Hugging Face is one file if Workers AI's catalog ever falls short.
- **Documentation must clarify the split** — a future contributor
  must not pull the Puter.js SDK into the Worker (it won't work) or
  call Workers AI's binding from the browser (no binding exists).

## Cross-refs

- [Puter.js service](../../../services/ai/puter-js.md)
- [Cloudflare Workers AI service](../../../services/ai/cloudflare-workers-ai.md)
- [AI services index](../../../services/ai/index.md)
- [Hono Worker API umbrella](./hono-worker-api-umbrella.md)
- [Queue — Cloudflare native (sibling stack-cohesion decision)](./queue-cloudflare-native.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
- [Never hit quotas rule](../../../rules/interaction/never-hit-quotas.md)
