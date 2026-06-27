---
type: rule
title: 'OmniRoute installed for evaluation only - do NOT route Claude Code through it'
description: OmniRoute v3.8.37 installed at %APPDATA%\npm\omniroute. Eval-only. Default Claude Code chain (Hr -> hai -> Bedrock) MUST stay intact. Use OmniRoute only via explicit env vars when testing.
tags: [omniroute, eval, hr-hai-chain, hard-rule]
timestamp: 2026-06-27
format_version: okf-v0.1
status: active
related:
  - rules/agent/workspace-scoped-agents
  - rules/agent/automate-never-runbook
---

# OmniRoute - eval-only install

## What's installed

OmniRoute v3.8.37 (npm package `omniroute`) at:

- `C:\Users\C5420321\AppData\Roaming\npm\omniroute.cmd` (binary)
- `C:\Users\C5420321\AppData\Roaming\npm\node_modules\omniroute\` (source)

Auto-loads env from `C:\D\oriz\.env` if present, else from its own `.env`.

## What it is NOT

- NOT in the Claude Code routing chain. Default chain stays: Claude Code -> http://localhost:8787 (Hr) -> http://localhost:6655 (hai) -> Bedrock.
- NOT installed for any agent's default usage. OpenCode / Cline / Kilo Code do not point at it.
- NOT to be confused with freellmapi at port 3001 (the dev server we already run for that fork).

## When to use

ONLY when:
1. Comparing routing strategies or compression vs freellmapi.
2. Testing a specific provider that's in OmniRoute's 231-list but not in freellmapi's 17.
3. Filing accurate feature-gap issues on diegosouzapw/OmniRoute (we have an open initiative for that).

To use during eval, run it on its default port 20128 (NOT 8787 or 3001) and point ONE specific client at it via env var. Never set its URL as a system-wide ANTHROPIC_BASE_URL.

## Why we did not pick OmniRoute over freellmapi or Hr->hai

- **Hr->hai chain is SAP-mandated** for the corporate routing this machine uses. Replacing it requires re-verifying SAP audit.
- **freellmapi has media APIs OmniRoute lacks** (embeddings, image gen, TTS) - see omniroute issues we filed.
- **OmniRoute has features freellmapi lacks** (231 providers, RTK+Caveman, 17 routing strategies, circuit breakers, MCP) - eval will tell us if we should switch.

Decision deferred until eval data exists.

## Cross-refs

- `workspace-scoped-agents` - 4 agents, none route through OmniRoute by default
- `speed-stack.md` was deleted 2026-06-27; OmniRoute is NOT a speed-stack layer
