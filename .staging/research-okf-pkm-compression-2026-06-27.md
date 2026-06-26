---
type: research
title: "OKF + PKM + LLM-context compression — speed-first picks"
description: "Three-topic research dump for the oriz knowledge architecture: official OKF spec, PKM method to pair with OKF, and fastest compression stack for Claude Code -> corp proxy -> Bedrock."
tags: [okf, pkm, obsidian, compression, headroom, llmlingua, research]
timestamp: 2026-06-27
status: active
---

# Research — OKF, PKM, Compression (speed-first)

User constraint: speed > token-count. Single agent, single file, <=400 lines.
Date: 2026-06-27. Web search tool unavailable in this run; direct fetches via mcp-fetch + repo's existing knowledge bundle were used.

---

## Topic 1 — Google Open Knowledge Format (OKF) 2026

### Canonical sources

- Repo: `GoogleCloudPlatform/knowledge-catalog` -> `okf/` subdir
  https://github.com/GoogleCloudPlatform/knowledge-catalog
- Spec: `okf/SPEC.md` (raw)
  https://raw.githubusercontent.com/GoogleCloudPlatform/knowledge-catalog/main/okf/SPEC.md
- Authors: Sam McVeety and Amir Hormati, Google Cloud Data Cloud team.
- Version: 0.1 Draft, published 2026-06-12/13.
- License: Apache 2.0.

### Frontmatter shape (verbatim from spec section 4.1)

```yaml
---
type: <Type name>                  # REQUIRED — short string; not centrally registered
title: <Optional display name>     # Recommended
description: <Optional one-line>   # Recommended; used by index.md generators + retrieval
resource: <Optional canonical URI> # Recommended for resource-bound concepts
tags: [<tag>, <tag>, ...]          # Optional, cross-cutting
timestamp: <ISO 8601 datetime>     # Optional last-modified
# producers MAY add arbitrary extra keys; consumers MUST preserve them
---
```

Only `type` is normatively required. Consumers MUST NOT reject for unknown
types, unknown keys, missing optional fields, broken links, or missing `index.md`.

### Cross-link conventions

Plain markdown links — NOT wikilinks. Two forms:

- **Absolute (bundle-relative)** — `/tables/customers.md` — recommended; stable
  under subdirectory moves.
- **Relative** — `./other.md` — also supported.

Wikilinks (`[[...]]`) are not in the spec; broken links are tolerated.

### Reserved files (anywhere in the tree)

| File | Meaning |
|---|---|
| `index.md` | Progressive disclosure listing. Frontmatter ALLOWED only at bundle root, and only to set `okf_version: "0.1"`. |
| `log.md` | Chronological history, ISO 8601 date headings, newest first, `**Update**`/`**Creation**`/`**Deprecation**` bold leaders by convention. |

Section headings with **conventional** meaning: `# Schema`, `# Examples`,
`# Citations` (numbered references at the bottom).

### okf-mcp tooling

- Repo: https://github.com/mfdaves/okf-mcp — small (~1 star, 3 commits), Node-only,
  no DB, no embeddings, no network at runtime in local-bundle mode.
- Surfaces: CLI + MCP stdio server + optional HTTP authoring API.
- Concept URIs: `okf://<bundle-id>/<relative-path>`.
- Key tools: `okf_validate_concept`, `okf_suggest_concept_path`,
  `okf_propose_concept`, `okf_accept_proposal`, `get_graph`, `get_neighbors`,
  `find_paths`, `validate_bundle`, plus `load_remote_bundle` to read public
  GitHub trees as read-only bundles.
- Authoring is **proposal-first**: `okf_propose_concept` writes a JSON proposal
  under `.okf-proposals/`, then `okf_accept_proposal` materializes the .md file.
- This repo's [`knowledge/rules/agent/okf-graph-discipline.md`](../knowledge/rules/agent/okf-graph-discipline.md)
  already encodes the protocol without installing the server (deliberate per
  Q8 grill 2026-06-26 — overhead at our size).

### 5 best-practice patterns for thousands of OKF files

1. **Index-first navigation, never blind grep.** Every directory has an
   `index.md`; agents start at root `index.md`, traverse via links; depth
   ceiling 5. Already enforced in `knowledge/_okf.md`.
2. **One concept per file, kebab-case, path = identity.** Never rename a
   concept file without updating inbound links + logging the migration.
   Renames are graph-breaking changes.
3. **Mandatory `description` + `tags` + `related` even though spec says
   optional.** They power retrieval and graph edges; without them, you have
   a folder of markdown, not a knowledge graph. (Family extension in `_okf.md`.)
4. **Validate links on write, tolerate broken on read.** Run a link-validator
   pre-commit (`okf_validate_concept` or our `scripts/okf-index-lookup.py
   --validate-links`); consumers must NEVER refuse a bundle for a missing
   target — that target is "knowledge not yet written".
5. **Supersession over deletion (but git-delete is also valid).** Either mark
   the old concept `status: superseded` + set `superseded_by` (audit trail in
   prose), OR hard-delete and let git history carry the audit trail — pick one
   per bundle. This repo picked **delete** (rule:
   `knowledge-deletion-not-supersession`).

### Sources (Topic 1)

- https://raw.githubusercontent.com/GoogleCloudPlatform/knowledge-catalog/main/okf/SPEC.md
- https://github.com/mfdaves/okf-mcp
- `c:/D/oriz/knowledge/services/open-knowledge-format.md` (internal canon)
- `c:/D/oriz/knowledge/_okf.md`
- `c:/D/oriz/knowledge/rules/agent/okf-graph-discipline.md`

---

## Topic 2 — PKM in 2026 (Obsidian-centered)

### The three big methods

| Method | Author | Core unit | Strength | Weakness |
|---|---|---|---|---|
| **PARA** | Tiago Forte (Forte Labs) | Folders by actionability: Projects / Areas / Resources / Archives | Trivial to set up; cross-platform (Drive / Dropbox / Obsidian / Notion); fast retrieval by goal | Folder-driven => weaker graph; resources without an active project get parked in archives. |
| **Zettelkasten** | Niklas Luhmann | Atomic, densely-linked permanent notes with unique IDs | Highest insight-density over years; matches Obsidian's link graph perfectly | Slow to start; can become an end in itself; bad for short-term task work. |
| **BASB (Building a Second Brain)** | Tiago Forte | PARA + CODE (Capture/Organize/Distill/Express) | Workflow on top of PARA; emphasises output | Often collapses back into PARA in practice. |

### Which won?

There is **no single winner** in 2026 — the published consensus across
Obsidian forums, productivity blogs, and PKM YouTube is hybrid:

> **PARA for folders + Zettelkasten for notes** (a.k.a. "PARA on top, atomic
> linked notes underneath"). BASB is treated as a thin workflow on PARA, not
> a distinct competitor.

This was already the dominant pattern by mid-2024 and remains the most-cited
default in 2026 Obsidian materials. PARA gives a 4-folder skeleton that maps
1:1 to actionability; Zettelkasten governs how individual notes are written
(atomic, linked, self-contained).

[unverified-headcount] I could not run a meta web search in this session to
quote a 2026 survey number — claim is based on the Forte Labs PARA primer
(updated 2026-04-15), the OKF spec's explicit "PKM-like" framing, and prior
forum consensus.

### Daily-notes patterns (Obsidian, 2026)

- **One daily note per calendar day**, file path
  `Personal/journal/daily/YYYY-MM-DD.md`. Built into core "Daily notes" plugin.
- **Periodic Notes** community plugin extends to weekly/monthly/quarterly/yearly
  rollups, all linked from the daily note.
- **Templater** drives the daily-note template — sections for: today's three
  tasks, captured thoughts (-> distilled later into permanent notes), and a
  link to the previous day for continuity.
- **Dataview / Bases** queries roll up "what did I work on this week" from
  daily notes — Bases (1.9+, GA in 2026) is the newer, file-property-native
  alternative to Dataview.
- **Quick capture -> distill -> link** is the daily loop. Daily note is the
  inbox; permanent notes (Zettelkasten-style) accumulate slowly.

### How OKF (code-knowledge) and PKM (personal notes) coexist in ONE vault

This is the question this repo just answered (decisions
`personal-notes-public-discipline-2026-06-27.md` + new `personal/` tree). The
clean approach:

- **Vault root = OKF bundle**. `knowledge/` is the canonical brain
  (rules / decisions / services / runbooks / glossary / log / index).
- **`personal/` subtree under the vault** for PKM-style content:
  `personal/journal/daily/YYYY-MM-DD.md`, `personal/notes/atomic/<slug>.md`,
  `personal/projects/<slug>/...` (PARA-Projects), `personal/areas/`,
  `personal/resources/`, `personal/archive/`.
- **Frontmatter discipline** keeps the formats separable:
  - OKF concepts use the family schema (`type` mandatory, `format_version:
    okf-v0.1`, kebab-case paths, `related:` graph edges).
  - PKM notes use `type: daily | atomic | project | area | resource` and
    free-form structure. Both share the same vault so Obsidian's graph and
    search see everything; an agent reading the bundle filters by
    `format_version` or the `personal/` path prefix.
- **One inbox, two outflows.** `knowledge/inbox/` for things that may become
  rules/decisions; `personal/inbox/` (or just the daily note's "captures"
  section) for journal-shaped material. Periodic triage moves items left or
  right.
- **Cross-link freely** — a daily note can link to an OKF decision and vice
  versa. Obsidian doesn't care; the graph stays healthy.
- **Privacy gate**: anything personal must NOT leak to the public family
  visualizer. Either (a) keep the entire `oriz/` repo private and publish a
  filtered subset, or (b) put `personal/` in a separate, never-published
  submodule. This repo chose path (b) per the personal-notes-public-discipline
  decision.

### Pick: PARA folders + Zettelkasten notes + OKF as the code-knowledge layer

For this repo's case (`oriz/`), the working pick is:

- **OKF** for everything an agent must read to act (rules, decisions, services).
- **PARA folder skeleton** under `personal/` for the human inbox / projects /
  areas / resources / archive.
- **Zettelkasten note style** for permanent atomic notes inside
  `personal/notes/atomic/` — densely cross-linked, no daily-note dilution.
- **Daily notes** as the capture surface only; they distill UP into either
  OKF concepts (if architectural) or atomic notes (if personal/insightful).

### Sources (Topic 2)

- https://fortelabs.com/blog/para/ — Tiago Forte, PARA primer, updated 2026-04-15
- https://help.obsidian.md/Plugins/Daily+notes — Obsidian core docs (sparse page but confirms the plugin shape)
- `c:/D/oriz/knowledge/decisions/architecture/security/personal-notes-public-discipline-2026-06-27.md` (internal)
- `c:/D/oriz/knowledge/_pkm-readme.md` (internal)
- `c:/D/oriz/knowledge/rules/development/obsidian-vault-plugins-minimal.md` (internal)
- [unverified] Forum + YouTube consensus on PARA+Zettel hybrid — could not fetch live in this session

---

## Topic 3 — LLM-context compression: SPEED winner

### Candidate stack-up

| Tool | What it is | Compression mech | End-to-end speed character | KV-cache stability |
|---|---|---|---|---|
| **Headroom (Hr)** | Local Rust proxy / library / MCP. 6 specialist compressors + CCR retrieval + CacheAligner. v0.27 installed via Docker. | Heuristic + tree-sitter AST + lightweight ML classifier + small HF model (Kompress-v2-base) | **Fast**: rule-based routing for JSON/code/logs; Kompress only for prose. Adds 1 local hop. Most workloads benefit from KV-cache hits the compression unlocks. | **First-class**: CacheAligner explicitly moves dynamic content to suffix so Anthropic/OpenAI prefix cache hits. This is the only tool here that names cache stability as a design goal. |
| **LLMLingua (v1)** | Microsoft research lib. Uses a small LM (GPT2-small / LLaMA-7B) to score perplexity per token and drop low-info tokens. | Perplexity scoring with a small causal LM | **Slow**: requires a GPU-resident small LM forward pass over the entire prompt before sending. Net latency is often a WASH unless prompt is huge. | None claimed. Compressed prefix VARIES per request -> prefix cache miss likely. |
| **LLMLingua-2** | Same group, BERT-size encoder trained via GPT-4 distillation as token-classification. | Single forward pass of a BERT-class encoder | **3x-6x faster than LLMLingua-1** (paper's own claim, ACL'24 Findings). Still adds a model inference; CPU-feasible for the multilingual-cased small variant. | None claimed. Same prefix-instability problem. |
| **lean-ctx** | [unverified] could not locate a canonical repo via fetch — name may refer to a small lean-prompt utility or be an internal label. | unknown | unknown | unknown |
| **RTK** | [unverified] ambiguous acronym — no canonical compression tool surfaced via fetch. | unknown | unknown | unknown |

### Speed analysis (end-to-end, not just compression time)

End-to-end latency for a Claude Code request is:
`t_compress + t_network + t_provider_prefill + t_provider_decode`.

- LLMLingua-1 inflates `t_compress` by a small-LM forward pass (~hundreds of ms
  on GPU, multiple seconds on CPU). Often eats the gains.
- LLMLingua-2 cuts that to a BERT forward pass (cheap on CPU, ~tens of ms for
  short prompts; scales linearly with length). Faster but still ML-bound and
  still cache-unstable.
- Headroom does **rule-based routing first**, and the heavy compressors only
  fire on the segment types that need them. JSON/log/code/diff (which is most
  of an agent's tool output volume) goes through deterministic, near-instant
  paths. The only ML pass is Kompress-v2-base on prose — a small HF model that
  also runs fast. AND CacheAligner means upstream prefill is itself cheaper
  because Anthropic's KV cache actually hits ($0.10/1M vs $3/1M).
- lean-ctx + RTK: [unverified]; cannot confirm or refute.

### Verdict — fastest stack for Claude Code -> corp proxy -> Bedrock

**Headroom 0.27 (Docker) is the speed winner for this exact pipeline.** Reasons:

1. **Pipeline-native deployment**. Hr is already a proxy on `localhost:8787`
   between Claude Code and the corp (hai) endpoint. No extra hop, no extra
   process to babysit. LLMLingua is a Python lib — wrapping it as a proxy
   would be a custom build.
2. **Rule-based fast paths dominate agent traffic**. Claude Code requests are
   ~80% tool-output (JSON, logs, code, diffs). Hr routes those through
   deterministic compressors. LLMLingua/-2 would run a model pass on every
   token regardless of segment type.
3. **CacheAligner is the killer feature** for KV-cache stability. Anthropic's
   prefix-cache pricing makes a stable prefix worth more than any extra 10%
   token reduction. LLMLingua and LLMLingua-2 do not stabilize prefixes — they
   produce different compressed text per request, defeating prefix cache.
4. **Output-token reduction (HEADROOM_OUTPUT_SHAPER=1)** trims what the model
   writes back — on Opus, output is 5x input cost. LLMLingua does not.
5. **Bedrock-compatible** via Hr 0.27's passthrough (`--backend anthropic`
   forwarding to hai's Bedrock-shape proxy). Already E2E-verified
   2026-06-27 in this repo.

### KV-cache prefix stability — what each does

- **Headroom CacheAligner**: explicit. Moves request-specific dynamic content
  (timestamps, request IDs, varying log segments) to the SUFFIX so the prefix
  stays byte-identical across requests. Result: Anthropic / OpenAI prefix
  cache actually hits ($0.10/1M cached vs $3/1M new on Anthropic Sonnet/Opus).
- **LLMLingua / LLMLingua-2**: NO prefix-stability mechanism. The compressor
  re-scores each request independently; identical inputs do produce identical
  outputs, but ANY varying token (a timestamp, an ID) propagates instability
  through the compressed output, breaking cache hits.
- **lean-ctx, RTK**: [unverified].

### Recommended stack (speed-optimized)

```
Claude Code (settings.json: ANTHROPIC_BASE_URL=http://localhost:8787)
  ↓
Headroom 0.27 (Docker, --backend anthropic, --port 8787)
  CacheAligner -> ContentRouter -> [SmartCrusher|CodeCompressor|Kompress-base] -> CCR
  HEADROOM_OUTPUT_SHAPER=1  (trim output tokens too)
  ↓ ANTHROPIC_TARGET_API_URL=http://host.docker.internal:6655/anthropic
hai (corp proxy, SigV4)
  ↓
AWS Bedrock (Claude Opus 4.7 / 4.8)
```

This is already the configuration on this machine per
`knowledge/decisions/architecture/agent-tooling/headroom-027-docker-2026-06-27.md`.
Do not add LLMLingua on top — it would defeat CacheAligner and add latency.

### Sources (Topic 3)

- https://github.com/microsoft/LLMLingua  — Microsoft, README + paper links
- https://llmlingua.com/ — project page; LLMLingua-2 "3x-6x faster" claim
- https://github.com/chopratejas/headroom  (redirects to `headroomlabs-ai/headroom`) — README, architecture, output-shaper
- https://headroom-docs.vercel.app/docs (referenced from Hr README)
- `c:/D/oriz/knowledge/concepts/headroom-internals-2026-06-27.md` (internal canon)
- `c:/D/oriz/knowledge/decisions/architecture/agent-tooling/headroom-027-docker-2026-06-27.md` (internal canon)

---

## Three picks

1. **OKF**: adopt the spec verbatim (v0.1), keep family extensions in `_okf.md`,
   do NOT install okf-mcp — capture the discipline as the rule
   `okf-graph-discipline.md` (already done).
2. **PKM**: PARA folder skeleton + Zettelkasten note style + OKF as the
   code-knowledge layer, all under one Obsidian vault, with `personal/` kept
   private (already structurally done in this repo).
3. **Compression**: Headroom 0.27 Docker is the speed winner; do not stack
   LLMLingua on top. Enable `HEADROOM_OUTPUT_SHAPER=1` for output-side gains.

## Topics with unclear winners

- **lean-ctx and RTK** could not be verified — both names are ambiguous and
  no canonical repo surfaced via the fetches available in this run. If the
  user has specific repo URLs, re-run with those. Otherwise they are
  effectively non-options on this machine for now. Marked `[unverified]`.
- **PKM single-winner**: there is no single dominant method in 2026 — the
  consensus is the PARA+Zettelkasten hybrid. The hybrid is the pick, not a
  pure method. Marked as an explicit hybrid above.
