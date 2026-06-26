---
type: rule
title: "Knowledge: deletion, not supersession"
description: "Superseded knowledge files are hard-deleted; audit trail = git history. Reverses the supersession-not-deletion rule from earlier today."
tags: [feedback, agent-preferences, knowledge, okf]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
---

- Old rule (locked 2026-06-25 morning): keep superseded files with `status: superseded` frontmatter.
- New rule (locked 2026-06-25 evening): hard-delete superseded files. Use `git log --follow <path>` for archaeology.
- Why reversed: 35 superseded files + their pointer lines turned `knowledge/` into a graveyard; harder to know what's current. Git history serves the audit-trail purpose without polluting the live tree.
- How to apply: when a decision is superseded, `git rm` the old file in the same commit that adds the new decision. The new file's `supersedes:` frontmatter field still lists the old paths (for grep-ability).
- Memory + commit message together = full audit trail without dead files.
