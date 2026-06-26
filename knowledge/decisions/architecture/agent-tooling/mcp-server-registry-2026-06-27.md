---
type: decision
title: 'MCP server registry — 11 servers installed 2026-06-27'
description: Final MCP set after audit + cleanup. searxng for web search, github via Docker, filesystem/memory/sequential-thinking/context7/playwright via npx, fetch/time/git via uvx, chirag127 hosted toolbox without smart-mode.
tags: [mcp, claude-code, registry, agent-tooling]
timestamp: 2026-06-27
format_version: okf-v0.1
status: active
related:
  - rules/agent/single-claude-config-always-hr
---

# MCP server registry — 11 servers

## Connected (verified via `claude mcp list`)

| # | Server | Transport | Purpose |
|---|---|---|---|
| 1 | searxng | npx mcp-searxng -> baresearch.org | Web search (JSON API) |
| 2 | filesystem | npx @modelcontextprotocol/server-filesystem | Scoped FS RW (c:/D/oriz) |
| 3 | memory | npx @modelcontextprotocol/server-memory | Knowledge-graph cross-session |
| 4 | sequential-thinking | npx @modelcontextprotocol/server-sequential-thinking | Step-by-step reasoning |
| 5 | context7 | npx @upstash/context7-mcp | Library docs grounding |
| 6 | playwright | npx @playwright/mcp@latest | Browser automation (MS official) |
| 7 | fetch | uvx mcp-server-fetch | URL -> markdown |
| 8 | time | uvx mcp-server-time | Timezone / scheduling |
| 9 | git | uvx mcp-server-git | Local git ops |
| 10 | github | docker run ghcr.io/github/github-mcp-server | Full GitHub API (official) |
| 11 | chirag127 (toolbox) | HTTP mcp.smithery.run | Hosted Smithery registry — no ?mode=smart |

## Removed

- `chrome-devtools` MCP — superseded by playwright skill family (per playwright-over-chrome-devtools-mcp rule)

## Install commands (audit-trail)

npx-based:

    claude mcp add --scope user filesystem -- npx -y @modelcontextprotocol/server-filesystem c:/D/oriz
    claude mcp add --scope user memory -- npx -y @modelcontextprotocol/server-memory
    claude mcp add --scope user sequential-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking
    claude mcp add --scope user context7 -- npx -y @upstash/context7-mcp
    claude mcp add --scope user playwright -- npx -y @playwright/mcp@latest

uvx-based (Python) — requires uv from https://astral.sh/uv/install.ps1:

    claude mcp add --scope user fetch -- uvx mcp-server-fetch
    claude mcp add --scope user time -- uvx mcp-server-time
    claude mcp add --scope user git -- uvx mcp-server-git

searxng (needs SEARXNG_URL env in mcpServers config; edit ~/.claude.json):

    claude mcp add --scope user searxng -- npx -y mcp-searxng

Then add `"env": {"SEARXNG_URL": "https://baresearch.org"}` to the searxng block in ~/.claude.json.

github via Docker (needs PAT, anonymous cred config):

    mkdir -p /c/tmp/docker-noauth
    echo '{"credsStore":""}' > /c/tmp/docker-noauth/config.json
    claude mcp add --scope user github \
      -e "GITHUB_PERSONAL_ACCESS_TOKEN=<your-PAT>" \
      -e "DOCKER_CONFIG=C:\\tmp\\docker-noauth" \
      -- "C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe" run -i --rm \
         -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server

toolbox (Smithery hosted) — full schema, no smart-mode:

    claude mcp add --transport http chirag127 "https://mcp.smithery.run/chirag127"

## Working SearXNG instances (JSON API enabled)

- OK https://baresearch.org (current pick)
- FAIL search.disroot.org (429)
- FAIL priv.au (429)
- FAIL searx.be (403)
- FAIL search.inetol.net (429)
- FAIL opnxng.com (429)
- FAIL searx.tiekoetter.com (429)
- FAIL searxng.website (403)

## Reference lists

- https://github.com/BrethofAI/awesome-mcp-servers
- https://github.com/Moh4696/50-essential-mcp-servers
- https://github.com/Claudient/Claudient
- https://github.com/mcpHQ/awesome-mcp-servers
