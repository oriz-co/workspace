---
type: decision
title: "agent-skills monorepo + symlinks"
description: "oriz-org/agent-skills is the single source of truth for all agent skills; mounted as a submodule of oriz at repos/oriz/own/content/skills/agent-skills/; both ~/.claude/skills/ and ~/.agents/skills/ are symlinks into it."
tags: [agent-skills, monorepo, submodule, fleet]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
---

oriz-org/agent-skills (created 2026-06-25) holds every agent skill. It is a git submodule of oriz at `repos/oriz/own/content/skills/agent-skills/` — **the only working copy**. Do NOT clone separately.

**Why:** Two harnesses (Claude Code reads `~/.claude/skills/`, cross-agent shell reads `~/.agents/skills/`) used to have drifting copies of the same skills. Symlinking both into the monorepo kills the sync problem.

**How to apply:** Edit skills in place at the submodule path. The 11 skills as of 2026-06-25: develop-userscripts, frontend-design, github-actions-docs, grill-me, karpathy-guidelines, playwright-cli, secure-linux-web-hosting, smithery-ai-cli, use-my-browser, webapp-testing, web-design-reviewer. `unblock-action` was in CLAUDE.md's inventory but was a dangling symlink — dropped. To add a skill: drop a new top-level dir into the submodule, commit, push, run `scripts/link.sh`. Setup script uses `cmd /c mklink /D` on Windows; needs Developer Mode.

See related architecture notes in this `knowledge/` bundle.
