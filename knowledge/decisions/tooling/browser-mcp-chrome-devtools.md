---
type: decision
title: "Browser MCP: Chrome DevTools MCP, not browsermcp or playwright-mcp"
description: "Use Google's official chrome-devtools-mcp (npx chrome-devtools-mcp@latest) as the single browser-control MCP. Chrome DevTools Protocol gives lower-level access (network log, console errors, performance traces) than browsermcp's high-level click/type primitives. Replaces @browsermcp/mcp. The playwright-cli skill remains for scriptable automation (different use case: deterministic test runs vs interactive debugging). Setup: start Chrome with --remote-debugging-port=9222, then the MCP server connects via CDP."
tags: [decision, mcp, browser, chrome-devtools, debugging, automation]
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
  - rules/agent-minimum-context
supersedes:
  - none
---

# Browser MCP — Chrome DevTools MCP

## Decision

Single browser-control MCP across all sessions: **`chrome-devtools-mcp`** (published by Google Chrome team).

Configured globally in `~/.claude.json` under `mcpServers`:

```json
"chrome-devtools": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "chrome-devtools-mcp@latest"],
  "env": {}
}
```

Replaces the prior `browsermcp` entry (which was higher-level click/type primitives but lacked CDP-level access to network log, console, performance traces).

## Why this over browsermcp

| Need | browsermcp | chrome-devtools-mcp |
|---|---|---|
| Click a button, type into a field | ✅ ergonomic | ⚠️ possible via evaluate, less ergonomic |
| Read console errors after page load | ❌ | ✅ |
| Snapshot network requests during user flow | ❌ | ✅ |
| Read performance profile | ❌ | ✅ |
| Debug a soft-404 / auth wall / anti-bot block | partial | ✅ full |

The debugging workloads are higher-value for our use cases (verifying deploys, debugging Cloudflare Pages routing, inspecting Firebase Auth flows) than the automation ergonomics. The playwright-cli skill covers the deterministic-test-run case that benefits from the cleaner click/type API.

## Setup steps

1. **Start Chrome with remote debugging** (do this once per machine, every session):

   - Windows: `start chrome.exe --remote-debugging-port=9222`
   - macOS: `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222`
   - Linux: `google-chrome --remote-debugging-port=9222`

2. **The MCP server auto-discovers the running Chrome** via `localhost:9222/json/version`. No additional auth needed.

3. **Restart Claude Code** (or any MCP client) so it picks up the new server config.

## When to reach for this vs playwright-cli skill vs the use-my-browser skill

- **`chrome-devtools-mcp`** — interactive debugging during a live conversation; you want the agent to see what YOU are seeing in the browser right now.
- **`playwright-cli` skill** — scriptable automation, repeatable test runs, headless CI workloads, signed-binary builds (avoids the Defender ASR block on agent-browser).
- **`use-my-browser` skill** — high-level "drive my logged-in browser to do X" without writing test code; uses the live session including cookies + extensions.

Default pick when uncertain: `chrome-devtools-mcp`. Reach for playwright when you need repeatable scripts, use-my-browser when you need a UX-layer task automated.

## Anti-patterns

- **Running multiple browser-control MCPs at once.** They compete for the same CDP port + Chrome process. Pick one per session.
- **Forgetting to start Chrome with `--remote-debugging-port=9222`.** The MCP fails silently with "no Chrome instance found". The setup step above is required.
- **Reaching for chrome-devtools-mcp for headless CI.** Use playwright there instead — chrome-devtools-mcp expects an interactive Chrome window.

## Rollback

Backup of the prior config saved at `~/.claude.json.bak-pre-chromedevtools-mcp`. To restore browsermcp:

```bash
cp ~/.claude.json.bak-pre-chromedevtools-mcp ~/.claude.json
```

## Cross-refs

- Agent minimum context (the master operating rule): [[rules/agent-minimum-context]]
- Why use-my-browser skill exists: built into ~/.claude/skills/use-my-browser/
- Why playwright-cli skill exists: built into ~/.claude/skills/playwright-cli/ (signed binaries, avoids Defender ASR)
