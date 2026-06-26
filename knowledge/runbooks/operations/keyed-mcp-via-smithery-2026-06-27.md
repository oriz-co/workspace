---
title: Keyed MCPs via Smithery CLI
type: runbook
area: operations
created: 2026-06-27
tags: [mcp, smithery, secrets, runbook]
---

# Keyed MCPs via Smithery CLI

## Why

Per the dual-bucket MCP rule: **no-key MCPs go in repo `.mcp.json` (public-repo safe); keyed MCPs go in Smithery** so the token is held by smithery.ai and never lands in a public commit. `.mcp.json` is checked into a public repo — any `env: { API_KEY: "sk-..." }` block leaks instantly.

Smithery proxies the MCP over HTTPS, injects the key server-side, and exposes a local stdio shim — so the client (`claude`) sees a keyless local command, while the key lives in your Smithery profile.

## Install pattern

```bash
npx -y @smithery/cli@latest install <slug> --client claude
```

The CLI prompts for the key (or reads from env), writes a stub MCP server to the client's config, and registers your account → key mapping at smithery.ai. To install for Claude Code project-scope rather than user-scope, add `--profile <name>` and pick the project on prompt; otherwise it lands in `~/.claude.json` user config.

To list installed: `npx -y @smithery/cli list --client claude`. To remove: `npx -y @smithery/cli uninstall <slug> --client claude`.

## 8 keyed MCPs worth installing later

| Slug | Smithery package | What |
|---|---|---|
| `brave` | `@smithery-ai/brave-search` | Brave web + news search (2k free queries/mo) |
| `tavily` | `@tavily-ai/tavily-mcp` | LLM-tuned search w/ summaries (1k free/mo) |
| `exa` | `exa` | Neural search, paper + company finders (free tier) |
| `firecrawl` | `@mendableai/firecrawl-mcp-server` | Full-page web scrape → markdown (free 500 credits) |
| `linkup` | `@linkup-ai/linkup-mcp` | Real-time web answers (free tier) |
| `jina` | `jina-ai/jina-mcp-tools` | Reader API (URL → markdown), embeddings (free tier) |
| `groundroute` | `@groundroute/mcp` | Multi-engine search router with citation grounding |
| `bright-data` | `@brightdata/mcp` | Scraping + SERP + unblocker (paid; trial credit) |

All 8 are free-tier eligible at signup — no card required, fits the no-card rule.

## Rotate / revoke keys

1. Go to https://smithery.ai/profile → **Integrations**.
2. Find the keyed MCP row → **Revoke** (kills the old key everywhere) or **Rotate** (generates new, asks you to paste replacement upstream key).
3. Local clients keep working — Smithery's proxy URL doesn't change; only the upstream key behind it.

If a key is suspected leaked, **revoke first, regenerate upstream second, paste back via Smithery UI third**. Never re-run `@smithery/cli install` to "fix" a leak — that doesn't rotate the stored key, it just re-registers the client stub.

## Related

- Decision: `decisions/architecture/agent-tooling/mcp-server-registry-2026-06-27.md`
- Rule: `rules/agent/preferences/rules-mcp-no-key-in-repo-keyed-in-smithery.md` (to be added)
- In-repo no-key entries: `.mcp.json` at umbrella root.
