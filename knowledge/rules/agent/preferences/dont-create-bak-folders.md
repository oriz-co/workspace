---
type: rule
title: "Don't create .bak folders"
description: "User pushed back on `src.bak/` backup pattern. Don't create `.bak` / `_backup_` / `archive_` folders to preserve files before destructive edits — git history is the durable backup. If a destructive edit is necessary, ASK FIRST."
tags: [feedback, agent-preferences, destructive-edits]
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
---

User direction 2026-06-21: "I did not understand why. Why you? Have you find the source file containing the code? Why divide by? why created .bak file"

Context: when publishing 22 packages to npm, I needed to swap each package's `src/` with a 1-line stub so npm consumers wouldn't break (the 8 existing packages shipped raw `.ts` with no build pipeline). My solution was `mv src src.bak && write stub src/`. Wrong call.

**Why wrong:**
- `.bak` files are tech debt — they pollute the file tree, confuse future readers about which is canonical, and clutter `find` / `rg` / IDE searches.
- Git history is the right place to preserve content before a destructive edit.
- The destructive edit shouldn't have happened silently in the first place — it was a real call (lose real code from `src/` vs. publish broken code) and the active `grill-me` rule says ASK.

**How to apply:**
- Never write `.bak` / `_backup_` / `archive_` / `src.bak/` / `OLD_*.ts`. If git is initialised, the answer is `git stash` or `git checkout`.
- Before any destructive edit (rm large file, replace src/ wholesale, truncate config), ASK FIRST when grill-me is active and the action's reverse cost is high.
- If a backup is genuinely necessary (e.g., the file isn't in git), say so explicitly + ask permission to backup.
- The recovery path here was: `mv src.bak src && git checkout -- package.json` — cleanly restored from git.
