---
type: rule
title: 'MCP servers: use workspace scope, not global'
description: Workspace-scoped MCP belongs in the committed .mcp.json. `claude mcp add -s project` is the right command. Default scope (local) goes to ~/.claude.json which is wrong for workspace MCP.
tags: [mcp, scope, workspace-only, hard-rule]
timestamp: 2026-06-27
format_version: okf-v0.1
status: active
related:
  - rules/agent/workspace-scoped-agents
  - rules/agent/mcp-no-key-in-repo-keyed-in-smithery
  - rules/agent/serena-mcp-installed
---

# MCP scope: workspace, not global

## Rule

When adding any MCP server for use in this workspace:

- ✅ `claude mcp add <name> -s project -- <command>` — writes to repo `.mcp.json` (committed to git).
- ✅ OR edit `c:/D/oriz/.mcp.json` directly.
- ❌ Do NOT omit `-s project` — the default scope is `local` (writes to `~/.claude.json` projects entry; machine-specific, not committed).
- ❌ Do NOT use `-s user` — writes to `~/.claude.json` global mcpServers (affects every project on this machine).
- ❌ Do NOT hard-code absolute paths like `c:/D/oriz` — use `.` so any clone path works.

The `claude mcp add` command itself is fine. The **`-s` flag** is what matters.

## Scope reference

| Scope flag | Writes to | Visible to | Committed? |
|---|---|---|---|
| `-s local` (default) | `~/.claude.json` projects[`<cwd>`].mcpServers | Just you, on this machine, in this dir | ❌ |
| `-s project` | `<cwd>/.mcp.json` | Anyone who clones the repo | ✅ |
| `-s user` | `~/.claude.json` mcpServers (top-level) | Just you, every project on this machine | ❌ |

**Use `-s project` for everything workspace-related.**

## Why

1. **Reproducible across machines**: clone the repo, MCPs come with it.
2. **No global pollution**: `~/.claude.json` stays minimal.
3. **Same principle as AGENTS.md**: workspace-scoped configuration only.
4. **Visible in git**: anyone reviewing the repo sees which MCPs are wired.

## When to deviate

The exceptions are narrow:

- MCP servers that need user-specific credentials (smithery, github auth) — those live in `~/.claude.json` AND/OR Smithery vault per `mcp-no-key-in-repo-keyed-in-smithery`.
- MCP servers that span all workspaces (rare; would be a true cross-project tool).

## Migration

If `claude mcp add` was used without `-s project` and the MCP landed in `~/.claude.json`:

```bash
# Re-add with the right scope flag — this writes to .mcp.json
claude mcp add <name> -s project -- <command> <args...>

# Then remove the stray local-scope entry from ~/.claude.json
node -e "
const fs=require('fs'); const p=require('os').homedir()+'/.claude.json';
const j=JSON.parse(fs.readFileSync(p));
delete j.projects['C:/d/oriz'].mcpServers['<server-name>'];
fs.writeFileSync(p, JSON.stringify(j, null, 2));
"
```

## Cross-refs

- `workspace-scoped-agents` — same principle for agents (Claude Code, OpenCode, Cline, Kilo Code)
- `mcp-no-key-in-repo-keyed-in-smithery` — secrets go to Smithery, not repo
- `serena-mcp-installed` — concrete example of this rule applied
