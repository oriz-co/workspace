## Add FreeTheAi as a provider

[freetheai.xyz](https://freetheai.xyz) is a free aggregator of ~50 model aliases behind a single OpenAI-compatible base URL. It's a strong fit alongside the existing 16 providers in this project.

### Why it fits freellmapi

- **Single OpenAI-compat base URL**: `https://api.freetheai.xyz/v1` — the same shape every other provider in this project uses.
- **Standard bearer auth**: `Authorization: Bearer YOUR_API_KEY`.
- **Cross-format routes already implemented**: `/v1/chat/completions` (OpenAI), `/v1/messages` (Anthropic Messages), `/v1/responses` (Responses-style). Same key, same model alias, all three.
- **Audio routes**: `/v1/audio/speech` and `/v1/audio/transcriptions` for TTS and STT (e.g. `xai/grok-stt`, `xai/grok-tts`, `mim/mimo-v2.5-tts`).
- **Audience overlap**: their setup guides target SillyTavern, OpenCode, Cline, Kilo Code, Zed, Continue.dev, RisuAI, Janitor AI, Chub AI — the same clients many freellmapi users plug into.
- **No card-on-file required for the free tier.** Paid tier ($5/mo "Curated Chat") is optional and gates separate aliases (`cuh/*`, `frw/*`); the free path is genuinely free.

### Catalog snapshot (50 free aliases across 11 prefixes)

Pulled from [freetheai.xyz/models](https://freetheai.xyz/models/) on 2026-06-26:

| Prefix | Count | Examples |
|---|---|---|
| `kai/*` | 10 | `kai/openrouter/owl-alpha` (1.0M ctx), `kai/nvidia/nemotron-3-ultra-550b-a55b:free` (1M ctx), `kai/nvidia/nemotron-3-super-120b-a12b:free`, `kai/stepfun/step-3.7-flash:free`, `kai/cohere/north-mini-code:free`, `kai/poolside/laguna-m.1:free`, `kai/kilo-auto/free` |
| `bbl/*` | 9 | `bbl/gemini-3.5-flash`, `bbl/gemini-3.0-flash`, `bbl/gemini-2.5-flash`, `bbl/gemini-2.5-flash-lite`, `bbl/gpt-5.5-mini`, `bbl/gpt-4.1`, `bbl/grok-4.1-fast-non-reasoning` |
| `mim/*` | 9 | `mim/mimo-v2-pro` (1.0M ctx), `mim/mimo-v2.5-pro`, `mim/mimo-v2-omni`, plus TTS/STT variants: `mim/mimo-v2.5-tts`, `mim/mimo-v2.5-tts-voiceclone`, `mim/mimo-v2.5-tts-voicedesign`, `mim/mimo-v2.5-asr` |
| `glm/*` | 7 | `glm/glm-5.2` (1M ctx), `glm/glm-5-turbo`, `glm/glm-5`, `glm/glm-4.7`, `glm/glm-4.6`, `glm/glm-4.5`, `glm/glm-4.5-air` |
| `opc/*` | 7 | `opc/big-pickle`, `opc/deepseek-v4-flash-free`, `opc/mimo-v2.5-free`, `opc/minimax-m3-free`, `opc/nemotron-3-super-free`, `opc/nemotron-3-ultra-free`, `opc/north-mini-code-free` |
| `exa/*` | 3 | `exa/search`, `exa/search-deep`, `exa/search-fast` — web-search models |
| `wsf/*` | 3 | `wsf/kimi-k2.6`, `wsf/swe-1.5`, `wsf/swe-1.6` |
| `xai/*` | 2 | `xai/grok-stt`, `xai/grok-tts` — audio-only |
| `agr/*` | 2 | `agr/deepseek-v4-pro`, `agr/glm-5.1` |
| `pplx/*` | 1 | `pplx/search` |
| `olm/*` | 3 | `olm/deepseek-v3.1`, `olm/deepseek-v4-pro`, `olm/kimi-k2.7-code` |

Context windows range from 16k (search aliases) to 1.0M (kai/owl-alpha, glm-5.2, nemotron-3-super). Total 49 free aliases visible without verification; additional aliases unlock for "Verified members" (orange-outlined in the live catalog).

### What's different from the other 16 providers in freellmapi

Worth a heads-up because the signup flow has friction not seen elsewhere:

1. **Discord-gated signup.** Keys are issued via a Discord slash command (`/signup`) in their server, not a web form. The bot opens a modal asking for use case, a bot-disclosure answer, and a randomized human challenge. There's no public signup URL.
2. **Daily check-in required.** `/checkin` once per UTC day with a randomized challenge or the key stops working for the free tier. The `/v1/checkin` API route exists for programmatic check-in but the challenge is human-solveable, not automatable.
3. **Key rotation** via `/resetkey` keeps account history.

The check-in friction is a real downside for a fully-headless integration. But the model set (multiple 1M-ctx free aliases, both chat and audio, multiple search APIs) is rare enough at zero cost that operators who don't mind a 30-second daily click will likely take the trade.

### Suggested integration shape

Standard OpenAI-compatible provider plugin — no new contract needed:

```env
# .env
FREETHEAI_API_KEY=YOUR_KEY
FREETHEAI_BASE_URL=https://api.freetheai.xyz/v1
```

```yaml
# providers config (mirroring the existing 16)
- name: freetheai
  base_url: https://api.freetheai.xyz/v1
  auth: bearer
  models_endpoint: /v1/models   # or /v1/models/full for capability metadata
  routes:
    chat: /v1/chat/completions
    messages: /v1/messages       # Anthropic-compat — could replace 2 providers for that path
    responses: /v1/responses
    speech: /v1/audio/speech
    transcriptions: /v1/audio/transcriptions
  models: <auto-discovered>
```

Their `/v1/models/full` endpoint returns context size, output cap, image-support flag, and access metadata — would fit nicely into the existing capability-override surface from issue #381.

### What this would add to the free-token pool

Hard to quantify without a per-model budget reading, but the headline is:
- **Three 1M-context free models** (`kai/owl-alpha`, `glm/glm-5.2`, `kai/nvidia/nemotron-3-ultra-550b-a55b:free`).
- **First-party Anthropic Messages route** alongside OpenAI chat — useful for Claude clients that don't accept OpenAI translations.
- **TTS + STT aliases** for `xai/grok-stt`, `xai/grok-tts`, `mim/mimo-v2.5-tts*` — the only audio-only models on a free aggregator I've seen.
- **Web-search aliases** (`exa/*`, `pplx/search`) — also rare on free aggregators.

### Reference / scrape

- Catalog page: https://freetheai.xyz/models/
- API docs: https://freetheai.xyz/docs/
- Pricing (paid tier is optional): https://freetheai.xyz/pricing/
- Setup guides for popular clients: https://freetheai.xyz/setup/

### Standing offer

Happy to draft a PR adding FreeTheAi as a provider following the shape of the existing 16. The Discord-signup friction is real but the catalog upside is substantial — happy to discuss whether you'd want a "manual_signup: discord" flag in the provider config so the README warns users instead of trying to automate around it.

### Not asking for

- Any urgency. Filing as a heads-up since the catalog has a few models (1M-ctx Nemotron Ultra, the audio aliases, the search APIs) that don't appear on any of the existing 16 providers.
- Automation around the daily check-in. That's something the operator does manually; a wrapper would invite a ToS conflict.
