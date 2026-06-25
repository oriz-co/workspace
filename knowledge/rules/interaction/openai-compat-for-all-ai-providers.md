---
type: rule
title: Every AI provider adapter must be OpenAI-compatible (SDK schema)
description: Every adapter in @chirag127/oriz-ai-providers must use the OpenAI SDK
  schema (`chat.completions.create({model, messages, ...})`, `completions.create()`,
  etc.) so we have minimum code per provider and a single calling convention. Providers
  that don't natively support the OpenAI schema (e.g. Ollama Cloud's native API) get
  a thin shim that translates the OpenAI request shape to the provider's native shape.
  No bespoke per-provider request shapes.
tags:
- rule
- ai
- openai-compatible
- sdk
- adapters
- minimum-code
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- decisions/architecture/packages/oriz-ai-providers-package
- architecture/packages/the-23-packages
- rules/interaction/never-hit-quotas
---



# OpenAI-compatible AI provider adapters

## Rule

Every adapter in `@chirag127/oriz-ai-providers` (and any future AI-related package in the family) MUST use the **OpenAI SDK schema**:

```ts
import OpenAI from "openai";
const client = new OpenAI({ baseURL, apiKey });
const r = await client.chat.completions.create({
  model: "<provider-model-slug>",
  messages: [{ role: "user", content: "..." }],
});
```

Most free LLM providers ALREADY support this schema (see source: [awesome-free-llm-apis](https://github.com/mnfst/awesome-free-llm-apis) — labeled "OpenAI SDK-compatible unless noted"). Specifically OpenAI-compatible:

- OVHcloud AI Endpoints (anonymous)
- LLM7
- Cerebras
- Groq Cloud
- NVIDIA NIM
- Cohere (`v2/chat`)
- GitHub Models (`https://models.github.ai/inference`)
- CF Workers AI (`/ai/run` is OpenAI-compatible via the `@openai/compat` route)
- HuggingFace Inference Providers (router)
- Mistral La Plateforme
- SambaNova
- OpenRouter
- Z.AI (Zhipu, `bigmodel.cn/api/paas/v4`)
- SiliconFlow
- Aion Labs
- ModelScope
- Kilo Code

Providers needing a translation shim:
- **Ollama Cloud** — uses Ollama's own API. Shim required: translate OpenAI request → `/api/generate` payload, translate response back.
- **Google AI Studio (Gemini)** — has an OpenAI-compatible endpoint at `https://generativelanguage.googleapis.com/v1beta/openai/`. Use that, NOT the native Gemini SDK.

## Why

- **Minimum code per provider** — adapter is ~30 LOC (base URL + auth header + model list).
- **Single calling convention** — package consumers learn one API, use 20 providers.
- **Easy fallback chain** — same response shape across all providers; fallback wrapper doesn't need per-provider parsing.
- **Future-proof** — when a new free provider emerges and it's OpenAI-compatible (most are), adding it is a 5-minute task.

## How adapters are structured

Every adapter file at `src/providers/<slug>.ts` exports:

```ts
export const provider = {
  slug: "groq",
  baseURL: "https://api.groq.com/openai/v1",
  envVar: "GROQ_API_KEY",
  models: ["llama-3.3-70b-versatile", "qwen3-32b", "gpt-oss-120b"],
  rateLimit: { rpm: 30, rpd: 1000 },
};
```

The shared `createClient(providerSlug)` function:
1. Looks up provider config
2. Loads `process.env[envVar]`
3. Returns `new OpenAI({ baseURL, apiKey })`

That's it. Zero per-provider request-shape code.

## Schema for "Other" message context

Whenever the user later pastes a Free LLM API schema, list, or table — incorporate it under the existing structure here. The data lives in the separate `chirag127/oriz-ai-providers-data` repo (per the package decision). Pasted schemas should be added to that data repo, not this rule file.

## Cross-refs

- The package decision → [[decisions/architecture/oriz-ai-providers-package]]
- Never hit quotas → [[rules/never-hit-quotas]]
- 17 (soon 18) packages → [[architecture/the-23-packages]]
