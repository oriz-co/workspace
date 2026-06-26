---
type: index
title: "Inbox"
description: New-note dropzone. Obsidian default. Triage to personal/ or OKF dirs.
tags: [pkm, inbox]
timestamp: 2026-06-27
format_version: okf-v0.1
status: active
---

# Inbox

New notes land here by default (Obsidian setting: "Default location for new notes" = "In a specified folder" → `inbox/`).

## Triage rules

- Personal notes → move to `personal/<subtree>/`
- Architectural decisions → move to `decisions/architecture/<area>/<topic>-YYYY-MM-DD.md` with OKF frontmatter
- Rules → move to `rules/<area>/<name>.md` with OKF frontmatter
- Runbooks → move to `runbooks/<area>/`
- Quick reference / glossary entry → move to `glossary/<letter-range>/<term>.md`
- Trash → `git rm`. Don't archive triage debris.

## Targets ≥10 min

If a note has been here >10 minutes during a working session, force a triage decision. Inbox-zero discipline.
