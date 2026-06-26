---
type: rule
title: '4-agent workspace setup: OpenCode, Kilo Code, Cline, Claude Code'
description: Workspace supports exactly these 4 agents. All config inside C:\D\oriz\. Never touch global files (~/.claude/, ~/AGENTS.md, ~/.config/).
tags: [agents, claude-code, opencode, kilocode, cline, scope, hard-rule]
timestamp: 2026-06-27
format_version: okf-v0.1
status: active
related:
  - rules/agent/automate-never-runbook
  - rules/agent/fork-minimize-conflict-surface
---

# 4-agent workspace setup

## Scope

This workspace (`C:\D\oriz\`) supports **exactly 4** coding agents:

| Agent | Type | How it sees this workspace |
|---|---|---|
| Claude Code | CLI | reads `C:\D\oriz\CLAUDE.md` + `C:\D\oriz\AGENTS.md` |
| OpenCode | CLI | reads `C:\D\oriz\AGENTS.md` natively |
| Kilo Code | VS Code ext | reads `C:\D\oriz\.kilocode\rules\*.md` (symlinked to `.agents/kilocode/rules/`) |
| Cline | VS Code ext | reads `C:\D\oriz\AGENTS.md` natively |

Other agents (Codex, Crush, Gemini, Aider, Cursor) are NOT supported here. If user wants to add one later, write a new rule first.

## Workspace-local only — never touch globals

The installer `scripts/install-agents.cmd` ONLY touches:
- `C:\D\oriz\.agents\*` — per-agent stubs
- `C:\D\oriz\.kilocode\rules\` — symlink for Kilo Code
- Installs binaries via winget/npm (system-level package install is fine; that's not config)

It explicitly does NOT touch:
- `~/.claude/` (global Claude Code config)
- `~/AGENTS.md` (user-global rules)
- `~/.config/opencode/`, `~/.gemini/`, `~/.codex/`, etc.

If user wants a global setup, they'd run a different installer outside this workspace. This rule binds workspace work to workspace files.

## Single source of truth

`C:\D\oriz\AGENTS.md` is read by 3 of 4 agents natively. The 4th (Kilo Code) gets there via a symlink. Per-agent overrides go in `.agents/<agent>/` only.

## Anti-patterns

- ❌ Add a 5th agent without writing a new rule first
- ❌ Edit `~/.claude/CLAUDE.md` from a workspace installer
- ❌ Copy rules from `AGENTS.md` into per-agent stubs (duplication = drift)
- ❌ Create a `<repo>/AGENTS.md` in any submodule's fork (per `fork-minimize-conflict-surface`)
