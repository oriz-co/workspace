---
type: concept
title: 'Headroom AI — how it works internally'
description: Hr is a 3-layer transparent compression proxy for LLM agents. CacheAligner stabilizes prefixes for KV cache hits; ContentRouter dispatches by content type; SmartCrusher/CodeCompressor/Kompress-base compress per-type; CCR keeps originals retrievable.
tags: [headroom, compression, proxy, ccr, mcp, cache-aligner]
timestamp: 2026-06-27
format_version: okf-v0.1
status: active
related:
  - decisions/architecture/agent-tooling/headroom-install-all-paths-2026-06-26
  - decisions/architecture/agent-tooling/headroom-always-on-proxy-2026-06-26
  - decisions/architecture/agent-tooling/hr-out-of-path-hai-direct-2026-06-27
---

# Headroom AI internals

## TL;DR

Hr runs locally as a proxy or library. Every request's messages array passes through a pipeline:

```
CacheAligner -> ContentRouter -> IntelligentContext -> CCR -> Upstream LLM
   stabilize     route by type    score & drop      retrieval tool
```

Result: 60-95% input token reduction, same answers, fully local, reversible.

## The 6 engines

### 1. CacheAligner
Anthropic/OpenAI cache prompt prefixes (5K tokens common). Cache hit = $0.10/1M vs $3/1M. But cache requires EXACT prefix match. CacheAligner moves dynamic content (timestamps, request IDs, varying log segments) to the SUFFIX, leaving the prefix stable across requests. Compounds savings.

### 2. ContentRouter
Inspects each block, classifies (JSON / source code / logs / search results / prose / image / diff), routes to specialist:

| Type | Compressor | Typical savings |
|---|---|---|
| JSON arrays | SmartCrusher | 70-90% |
| Source code | CodeAwareCompressor (tree-sitter AST) | 40-70% |
| Build/test logs | LogCompressor | 85%+ |
| Search results | SearchCompressor | 60-80% |
| Prose | Kompress-base (HF model) | 50%+ |
| Diff | DiffCompressor | 60-80% |

Detection uses heuristic rules (extensions, MIME, structural signatures) + a lightweight ML classifier trained on agentic traces.

### 3. SmartCrusher
For JSON arrays. Scores each item across 5 axes: first/last, errors, anomalies (>2 sigma outliers), query-relevance (BM25/embeddings), change points. A 1000-item array -> ~50 items with all the info preserved. Errors never dropped (100% preservation).

### 4. CodeCompressor
tree-sitter AST parsing for Python/JS/Go/Rust/Java/C++. Prunes docstrings, comments, unreferenced imports. Preserves structure (whitespace matters).

### 5. Kompress-base
HuggingFace model trained on agentic traces. Prose-only fallback when no structured compressor fits.

### 6. CCR (Compression with Content Retrieval)
The reversible layer. Original content stored in local content-addressed cache. LLM gets compressed summary + a `retrieve_original_content` tool. When LLM needs detail (e.g., compressed stack trace -> needs full vars), it calls the tool, proxy fetches from cache, streams the original in a follow-up turn. Benchmarks: Claude 3.5 invokes retrieval on 12% of compressed requests; task accuracy 94.3% vs 94.1% uncompressed.

## 3 deployment shapes

1. **Library** — `compress(messages, model=...)` inline (Python/TS).
2. **Proxy** — `headroom proxy --port 8787` — OpenAI-compatible; zero code changes.
3. **MCP server** — exposes `headroom_compress`, `headroom_retrieve`, `headroom_stats`.

## Output token reduction

Hr also trims what the model writes back (output costs 5x input on Opus). Two mechanisms:
- **Verbosity steering** — appends 'be terse, don't restate' to system prompt (cache-safe at end).
- **Effort routing** — on tool-result resumes (file reads, passing tests), dials thinking effort down. New questions / errors keep full effort.

Enable: `HEADROOM_OUTPUT_SHAPER=1 headroom proxy --port 8787`. Measure with 10% holdout: `HEADROOM_OUTPUT_HOLDOUT=0.1`.

## Pipeline lifecycle (stable across library/SDK/proxy)

`Setup -> Pre-Start -> Post-Start -> Input Received -> Input Cached -> Input Routed -> Input Compressed -> Input Remembered -> Pre-Send -> Post-Send -> Response Received`

Plugins hook these via `on_pipeline_event(...)`.

## Backend support (Hr 0.27+)

`--backend anthropic | bedrock | openrouter | anyllm | litellm-*`. Hr 0.19 (installed here) supports `anthropic` only — direct Anthropic.com API shape. For SAP `hai` proxy (Bedrock-shape), Hr 0.27 needed (`--backend bedrock`). Build requires MSVC + Rust on Windows.

## How requests flow when wrapped

```
Claude Code (or any OpenAI-compat client)
  v ANTHROPIC_BASE_URL=http://localhost:8787
Headroom proxy
  v compress messages, store CCR
  v ANTHROPIC_TARGET_API_URL=<upstream>
Upstream (Anthropic / Bedrock / hai SAP proxy)
  v
LLM response
  ^ proxy streams back, may serve retrieve_original_content calls inline
```

## Cross-refs

- Docs: https://headroom-docs.vercel.app/docs
- GitHub: https://github.com/chopratejas/headroom
- Architecture: https://headroom-docs.vercel.app/docs/architecture
- CCR deep-dive: https://headroom-docs.vercel.app/docs/ccr
- Compression mechanics: https://headroom-docs.vercel.app/docs/how-compression-works
- Kompress-v2-base: https://huggingface.co/chopratejas/kompress-v2-base
