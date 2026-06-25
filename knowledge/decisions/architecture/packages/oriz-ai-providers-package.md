---
type: decision
title: '@chirag127/oriz-ai-providers (18th package) + chirag127/oriz-ai-providers-data
  data repo'
description: "New family package `@chirag127/oriz-ai-providers` aggregates EVERY free\
  \ LLM API (Cerebras, Groq, Cohere, NVIDIA NIM, GitHub Models, Cloudflare Workers\
  \ AI, HuggingFace, Mistral, SambaNova, OpenRouter, LLM7, OVHcloud, Pollinations,\
  \ Kilo Code, Ollama Cloud, Z.AI, Aion Labs, SiliconFlow, ModelScope \u2014 20+ providers).\
  \ Provider data + model lists + rate limits + base URLs maintained in a SEPARATE\
  \ data repo `chirag127/oriz-ai-providers-data` so the package can stay slim and\
  \ the data can be updated independently of the code. Priority order: no-key-required\
  \ providers first (anonymous OVHcloud / LLM7 / Pollinations), then free-with-key\
  \ providers as fallback chain. NIM + OpenRouter demoted from primary."
tags:
- decision
- package
- ai
- providers
- free-tier
- data-repo
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
supersedes_in_part: decisions/architecture/stack-picks-2026-06-22 (the "AI inference"
  section that named NIM primary + OpenRouter fallback only)
related:
- decisions/architecture/stack/stack-picks-2026-06-22
- architecture/packages/the-23-packages
- rules/interaction/never-hit-quotas
- rules/interaction/no-card-on-file
---



# @chirag127/oriz-ai-providers (18th package)

## Decision

Add **`@chirag127/oriz-ai-providers`** as the 18th package in the family. Its job: a thin wrapper around every free LLM API the family uses for blog rewrites, omni-publish drafts, janaushdhi substitute-finder, ncert summaries, etc.

**Why a package + data-repo split:**
- Code (in `@chirag127/oriz-ai-providers-npm-pkg`): wrapper logic, fallback chain, retry, env-var loading, OpenAI-SDK-compatible client. Stable.
- Data (in `chirag127/oriz-ai-providers-data`): JSON list of providers, models, rate limits, base URLs, env-var names, signup URLs. Changes monthly as the LLM API landscape shifts.
- The package fetches the data JSON at build time (or runtime via fetch with a 1-day CF cache).

## Providers list (as of 2026-06-22)

### Tier 1: Anonymous (no key, no signup, no card)
1. **OVHcloud AI Endpoints** — 2 RPM per IP per model, EU-hosted, 20+ models (Qwen3.5, gpt-oss, Llama 3.3, Mistral)
2. **LLM7.io** — 30 RPM per IP, 30+ models (deepseek-r1, gpt-4o-mini, gemini-2.5-flash-lite, etc.)
3. **Pollinations** — anonymous gpt-oss-20b

### Tier 2: Free with no-card signup
4. **Cerebras** — 30 RPM + 1M TPD, ultra-fast (~2,600 tok/s), gpt-oss-120b + Llama 3.1 8B
5. **Groq Cloud** — 30 RPM + 1,000 RPD, llama-3.3-70b-versatile (faster than NIM)
6. **NVIDIA NIM** — 40 RPM, 100+ models, requires phone verification
7. **Google AI Studio** — Gemini 2.5 / 3.x Flash, 5-15 RPM + 20-1,500 RPD per model (free outside EU/UK/Switzerland)
8. **Cohere** — 20 RPM + 1,000 req/month, Command A+ / R+ (non-commercial only)
9. **GitHub Models** — 10-15 RPM + 50-150 RPD, GPT-5 / GPT-4.1 / o4-mini, free with Copilot tier
10. **Cloudflare Workers AI** — 10K neurons/day, Llama 3.3 70B FP8 / GPT-OSS / Qwen3
11. **HuggingFace** — 100K credits/mo, router to Fireworks/Together/Hyperbolic, thousands of models
12. **Mistral La Plateforme** — 500K TPM + ~1B tokens/month (Experiment plan), Mistral Medium 3.5 / Codestral
13. **SambaNova** — 20 RPM + 200K TPD, DeepSeek V3.1 + Llama 3.3 70B
14. **OpenRouter** — 20 RPM + 200 RPD per :free model (Llama 3.3 70B, Qwen3-Coder, Nemotron-Ultra-550B)
15. **Z.AI (Zhipu)** — GLM-4.7-Flash + GLM-4.6V-Flash (Chinese provider)
16. **SiliconFlow** — Qwen3-8B + DeepSeek-R1-Distill (Chinese)
17. **Aion Labs** — 15 RPM + 20K TPD, roleplay-specialized
18. **Ollama Cloud** — qualitative usage, 400+ Ollama-hosted models (not OpenAI SDK)
19. **ModelScope** — 2,000 RPD, Qwen3.5-35B-A3B + Qwen3.5-27B (requires Alibaba real-name)
20. **Kilo Code** — auto-router free models

## Priority order (default fallback chain)

For text completion at low rate:
1. **OVHcloud anonymous** (zero friction, EU-hosted)
2. **LLM7 anonymous**
3. **Cerebras** (key required, ultra-fast)
4. **Groq Cloud** (key, also fast)
5. **NVIDIA NIM** (key + phone verified, more model variety)
6. **OpenRouter free** (key, broad coverage)
7. **Google AI Studio Gemini** (key, Gemini-flavored output)
8. **CF Workers AI** (key, lives in our infra)

For high-volume (>30 RPM):
- Spread load across multiple providers in parallel
- LLM7 token + Cerebras + Groq concurrently

For reasoning tasks:
- DeepSeek-R1 via NIM or SambaNova or Hugging Face router
- o4-mini via GitHub Models

For vision/multimodal:
- Llama 4 Scout (CF Workers AI, GitHub Models, OpenRouter)
- Pixtral Large (Mistral)
- Qwen2.5-VL (OVHcloud, HF)

## Data repo shape

`chirag127/oriz-ai-providers-data`:
```
providers.json    # one entry per provider
models.json       # one entry per model (with provider link)
rate-limits.json  # provider × model × tier
env-vars.json     # which env var maps to which provider
signup-urls.json  # for the README + onboarding doc
priority.json     # default fallback chain (the order above)
```

Updated via PR. Each change creates a new release tag. Package fetches latest tag (or `main`) at build/runtime.

## Wrapper API

```ts
import { ai } from "@chirag127/oriz-ai-providers";

const result = await ai.complete({
  prompt: "Rewrite this blog post for Twitter",
  task: "rewrite-short",  // mapped to priority chain
  maxTokens: 280,
  // optional overrides:
  preferProvider: "cerebras",
  fallback: true,
});

// result.text, result.provider, result.model, result.tokensUsed
```

The wrapper:
1. Loads provider data from data-repo (cached 24h)
2. Picks the highest-priority provider with a configured env var
3. Calls it via OpenAI SDK (most providers are OpenAI-compatible)
4. On 429/5xx: falls back to next provider
5. Returns first successful result

## Master pointer

Adding this package brings the family count to **18 packages** (was 17 per `the-23-packages.md`). Rename + update count in:
- `knowledge/architecture/the-23-packages.md` → `the-23-packages.md` (rename via `git mv` to keep history)
- `knowledge/services/family-inventory.md` — bump count
- AGENTS.md "Where to look" if referenced

## Supersedes in part

`decisions/architecture/stack-picks-2026-06-22.md` — its "AI inference" section named NIM primary + OpenRouter fallback only. That's now superseded by this decision (priority chain in this file). Update that file to point here.

## Cross-refs

- The 18-package family → [[architecture/the-23-packages]]
- Stack picks (superseded-in-part) → [[decisions/architecture/stack-picks-2026-06-22]]
- Never hit quotas → [[rules/never-hit-quotas]]
- No card on file → [[rules/no-card-on-file]]
- Source list reference: [awesome-free-llm-apis](https://github.com/mnfst/awesome-free-llm-apis) + [free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources)
