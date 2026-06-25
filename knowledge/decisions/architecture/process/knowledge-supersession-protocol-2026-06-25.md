---
type: decision
title: Knowledge supersession protocol — mark, point, never delete
description: Locked 2026-06-25. When a decision is reversed, the old file is marked status superseded with a superseded_by frontmatter entry and a one-line pointer at the top. The old file is never deleted. The new decision file takes status active and supersedes the old one in its frontmatter.
tags:
- decision
- process
- knowledge
- okf
- supersession
- self-update
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
related:
- _okf
- rules/agent/keep-knowledge-fresh
- rules/agent/self-update-rule
---

# Knowledge supersession protocol

## Decision

When a previously-locked decision is reversed in chat:

1. Find the old concept file in `knowledge/`.
2. Edit ONLY its frontmatter: change `status: active` to `status: superseded`. Add `superseded_by: decisions/<path>/<new-file>.md`.
3. Insert one line immediately after the frontmatter: `> **Superseded YYYY-MM-DD** — see [<new-file-title>](<relative-path>). Reasoning preserved below for audit.`
4. Leave the body of the old file untouched — it is the audit trail of the reasoning that was true at the time.
5. Write a new decision file at the path indicated by `superseded_by`. Its frontmatter takes `status: active` and `supersedes: decisions/<path>/<old-file>.md`.
6. Append both files to `knowledge/log.md` and update `knowledge/index.md` where appropriate.

Never delete the old file. Never rewrite the body. The supersession is an audit-trail operation.

## Why

- **OKF stability rule** — paths are identity; deleting breaks every inbound link in the bundle and on GitHub.
- **Audit trail matters** — future-Chirag (and future agents) need to see what was decided, when, and why it changed.
- **Frontmatter is queryable** — `status: superseded` lets agents filter the bundle without reading the body.
- **Symmetric pointers** — `superseded_by` on the old and `supersedes` on the new makes the graph traversable in both directions.
- **Header pointer is human-readable** — the one-line note at the top tells anyone landing on the old file (e.g. via an old chat link) where to go without parsing YAML.
- **Same protocol as the _okf.md spec already implies** — this file codifies the existing convention into an enforceable process.

## Implications

- Every supersession requires a Phase-1 (mark old) and a Phase-2 (write new) pass in the same chat session.
- The supersession-not-deletion rule applies to ALL concept types, not just decisions — rules, services, architecture pages all follow it.
- `knowledge/log.md` gets two entries per supersession event (one for the mark, one for the new file).
- Agents reading the bundle treat `status: superseded` files as historical context only — they do not influence current behaviour.
- When a path needs the same filename for the new decision (rare), the new file gets a date suffix (`-2026-06-25.md`) to preserve the old path. Date-suffixed files are the common pattern in the bundle going forward.
- Bulk supersession (one new file replaces many) is allowed: each old file points to the same new file via `superseded_by`.
