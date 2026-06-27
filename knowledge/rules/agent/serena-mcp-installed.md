---
type: rule
title: 'Serena MCP server installed for semantic codebase search'
description: oraios/serena (25.8k stars, MIT). LSP-based, no API keys. Indexes c:/D/oriz on first use. Restart Claude Code to activate.
tags: [mcp, serena, codebase-search, lsp, claude-code]
timestamp: 2026-06-27
format_version: okf-v0.1
status: active
related:
  - decisions/architecture/fleet/aggregator-strategy-side-by-side
---

# Serena MCP — semantic codebase search

## What's installed

Serena MCP server (oraios/serena, 25.8k stars, MIT, Python). Registered to
Claude Code via:

```
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena \
  serena start-mcp-server --context ide-assistant --project c:/D/oriz
```

Stored in `~/.claude.json` (per-project: c:/D/oriz).

## Why this one (not others)

Evaluated 7 candidates by stars (2026-06-27):

| Project | Stars | Why ruled out |
|---|---:|---|
| **oraios/serena** | **25,834** | **PICKED** — LSP-based, no API key, free local |
| zilliztech/claude-context | 11,978 | Needs OPENAI_API_KEY + Zilliz Cloud account (blocked by no-card rule) |
| cocoindex-io/cocoindex-code | 2,256 | Newer, AST-only, less mature |
| johnhuang316/code-index-mcp | 974 | Lower stars |
| FarhanAliRaza/claude-context-local | 235 | no-license |
| Helweg/opencode-codebase-index | 121 | OpenCode-focused |
| ViperJuice/Code-Index-MCP | 54 | Lower stars |

Serena uses Language Server Protocol (LSP) to read symbols, references,
definitions across the codebase. No embeddings = no API keys = no cloud
dependency. Fits the no-card-on-file + workspace-scoped rules.

## How it activates

1. Restart Claude Code (close + reopen).
2. Serena indexes c:/D/oriz on first prompt.
3. Use via MCP tools (will appear in tool list after restart).

## Cross-refs

- Upstream: https://github.com/oraios/serena
- `workspace-scoped-agents` — eval-only, scope to c:/D/oriz only
