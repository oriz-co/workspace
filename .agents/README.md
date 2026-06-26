# `.agents/` — workspace-local pointers for 4 coding agents

Each subdir is a stub pointing the agent at `C:\D\oriz\AGENTS.md` (workspace root, single source of truth).

| Agent | Stub | Native lookup path for AGENTS.md |
|---|---|---|
| Claude Code | `claude/CLAUDE.md` | `<repo>/CLAUDE.md` (already exists at `c:/D/oriz/CLAUDE.md`) |
| OpenCode | `opencode/AGENTS.md` | `<repo>/AGENTS.md` (already exists at `c:/D/oriz/AGENTS.md`) |
| Kilo Code | `kilocode/rules/00-pointer.md` | `<repo>/.kilocode/rules/*.md` — installer symlinks |
| Cline | `cline/AGENTS.md` | `<repo>/AGENTS.md` (already exists at workspace root) |

## Why this directory exists

Three of the four agents already read `c:/D/oriz/AGENTS.md` natively because it sits at the workspace root. The stubs in this directory exist for **two reasons**:

1. **Kilo Code** reads `<repo>/.kilocode/rules/`, not `AGENTS.md`. The installer symlinks that path to here.
2. **Symmetric documentation** — each agent has a per-agent override file in one predictable location, ready for agent-specific tweaks when they're needed.

## Adding a new override

Don't add rules here that apply across all agents — those belong in `c:/D/oriz/AGENTS.md`. Only put **agent-specific** behaviour overrides here (e.g. "Cline should auto-approve git commands").

## Install

```cmd
C:\D\oriz\scripts\install-agents.cmd
```

Idempotent; sets up VS Code extensions for Cline + Kilo Code, installs OpenCode via npm, creates the `.kilocode/rules/` symlink.
