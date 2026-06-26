---
type: rule
title: "Playwright over chrome-devtools MCP"
description: "For any browser automation — scraping, screenshots, page parsing, UI driving — use the playwright-cli skill or playwright-persistent-sessions skill. NOT the chrome-devtools MCP tools."
tags: [feedback, agent-preferences, browser-automation, playwright, mcp]
timestamp: 2026-06-26
format_version: okf-v0.1
status: active
---

For ALL browser automation tasks, use the Playwright skills:

- `playwright-cli` — one-shot scraping, screenshots, page parsing
- `playwright-persistent-sessions` — authenticated long-running automation with state.json

**Do NOT use:**
- `mcp__chrome-devtools__*` tools (navigate_page, evaluate_script, take_snapshot, etc.) — captured 2026-06-26 when user said "use playwright skill instead of the chrome web tools delete chrome web tools".

**Why playwright wins for this user:**
- Playwright binaries are signed → bypass the Defender Exploit Guard ASR that blocks `agent-browser` and similar unsigned-binary npm postinstalls (per the global CLAUDE.md note).
- Playwright headless runs don't pop a visible Chrome window; cleaner for sessions where the user doesn't want browser tabs opening on their primary screen.
- Persistent-session pattern (cookies + localStorage as JSON state) makes authenticated scraping reproducible across runs.
- Single skill family covers scraping AND screenshots AND multi-step UI driving — Chrome DevTools MCP is split across many tools with overlapping scopes.

**Migration:**
- Any future "scrape this URL" / "open this page" / "click this button" → invoke `playwright-cli` skill.
- Multi-step authenticated flows (filing a form, customizing GitHub pins, etc.) → `playwright-persistent-sessions`.
- If `playwright-cli` skill is missing what's needed, EXTEND THE SKILL rather than fall back to Chrome DevTools MCP.

**Chrome DevTools MCP tool removal:**
- The `chrome-devtools` MCP server may be removable from `~/.claude.json` via `claude mcp remove chrome-devtools`.
- If the user runs `claude mcp list` and `chrome-devtools` appears, that's the next cleanup step.
- After removal, `mcp__chrome-devtools__*` tools disappear from the available toolbox, removing the temptation.

**Related:**
- [`agent-skills-monorepo`](../../../decisions/architecture/fleet/agent-skills-monorepo.md) — playwright-cli + playwright-persistent-sessions both live at `repos/own/agent-skills/`.
- Global CLAUDE.md note about Defender Exploit Guard ASR blocking unsigned browser binaries — Playwright sidesteps this.
