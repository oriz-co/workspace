---
type: rule
title: "Keep knowledge fresh \u2014 read first, write current truth, delete obsoletes"
description: Every session reads knowledge before acting, writes decisions into knowledge
  as CURRENT TRUTH (not historical logs), and deletes obsoleted content same-turn.
  Knowledge files are snapshots of what IS, not journeys of how we got here.
tags:
- rules
- knowledge
- okf
- self-update
- family
- current-truth
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- rules/agent/self-update-rule
- rules/interaction/future-overrides-past
- _okf
---



# Keep knowledge fresh

## The rule

The OKF knowledge bundle at `knowledge/` is the family's persistent
memory. Every chat session, every agent, every subagent reads from it
before acting, writes to it whenever a decision lands, and prunes it
whenever a prior decision is obsolete.

Knowledge files read as **CURRENT TRUTH SNAPSHOTS**, not as journey
logs. A reader landing on any file sees what IS today, not how we got
here. Git commit history is the durable record of "how."

Four obligations on every session:

### 1. Read first

Before suggesting any architectural or naming change, read:
- `knowledge/index.md` (always)
- `knowledge/decisions/index.md` for any architecture / naming /
  stack question
- `knowledge/rules/index.md` for any policy question
- The specific decision file the question touches (e.g.
  `decisions/branding/naming-policy-v5.md` for repo names)

If knowledge already locks the answer, DO NOT ask the user — surface
the locked answer and proceed.

### 2. Write every chat decision

When the user makes a decision in chat (MCQ answer, free-text choice,
override), the decision lands in knowledge SAME TURN:
- New decisions → new file under `knowledge/decisions/<topic>/`
- Reaffirmations → no new file, but log in `knowledge/log.md`
- Reversals → mark prior file `status: superseded`, write new file

Per `rules/self-update-rule.md`. The chat is ephemeral; knowledge is
durable.

### 3. Delete obsoletes same-day

When a decision is superseded, **delete the old file outright.** The
git commit history preserves what was there. Banner-superseded stubs
are forbidden — they pollute knowledge with stale references.

When a single section inside a file is obsoleted, **rewrite the section
in place** to state the new truth. Delete the prior version in the same
commit.

Per `rules/user-prefers-deletion-over-archive.md`.

### 4. Current truth only — no historical logs

Every concept file reads as a snapshot of what IS today.

Forbidden in knowledge prose:

- Rename-history tables (`Old slug | New slug`).
- "v5 was X, v6 is Y" comparison sections.
- `## Q47-Q77 additions (2026-06-21 grill round 2)` log-style headers.
- `(LOCKED 2026-06-21)` inline date stamps.
- `(added 2026-06-21)` subheader annotations.
- `previously locked at`, `earlier in this session`, `fourth-pass / fifth-pass` progression language.
- Per-repo audit status columns (`CREATED 2026-06-21`, `LIVE`, `in verification`).
- Evidence tables with date+choice pairs.
- `Decided YYYY-MM-DD` tag lines on bullets.
- `## The audit / ## Audit progress` sections.
- Sentence-level "this was renamed from X" asides.

Permitted:

- The frontmatter `timestamp:` field (file-level audit-trail).
- `supersedes:` / `superseded_by:` frontmatter (current pointer relationships).
- Tables describing CURRENT state (`current slug | current subdomain`).

When you change a decision, rewrite the section in place. When you
supersede a file entirely, delete it. Apply both to new content and
retroactively when touching any existing file.

## How to apply per session

```
START
├── Read knowledge/index.md
├── Read knowledge/log.md (last 10 entries)
├── For each user request:
│   ├── Identify which knowledge area applies
│   ├── Read the relevant decision/rule files
│   ├── If answer is locked → use it
│   ├── If not → ask user MCQ, then write decision to knowledge
│   └── If reversal → delete obsolete + write new
├── At session end (or every 10 turns):
│   ├── Sweep for orphaned references to deleted files
│   └── Commit + push knowledge changes
END
```

## Required reading on first turn of every session

Every agent's first action in a session is:
1. `Read C:/D/oriz/knowledge/index.md`
2. `Read C:/D/oriz/knowledge/decisions/index.md`
3. `Read C:/D/oriz/knowledge/rules/index.md`
4. `Read C:/D/oriz/knowledge/log.md` (most recent 20 entries)

Without these reads, the agent cannot know what's already decided. Acting
without reading first violates this rule.

## When NOT to apply

- Trivial typo fixes (no decision content).
- One-shot bug fixes in code that don't change architecture.
- Pure code refactors that don't touch a locked decision.

Everything else triggers the read-write-prune cycle.

## What goes WHERE

| Type | Goes in | Example |
|---|---|---|
| Locked architectural / stack / naming choice | `decisions/<topic>/<slug>.md` | `decisions/branding/naming-policy-v5.md` |
| Non-negotiable family-wide constraint | `rules/<slug>.md` | `rules/no-card-on-file.md` |
| Service pick with alternatives + swap cost | `services/<category>/<service>.md` | `services/auth/firebase-spark.md` |
| Step-by-step actionable sequence | `runbooks/<slug>.md` | `runbooks/scaffold-a-new-site.md` |
| Family-specific term definition | `glossary/<letter>/<term>.md` | `glossary/o-r/oriz-kit.md` |
| Per-app scoped concept | inside the app submodule at `<app-path>/knowledge/<slug>.md` | see [`repos/oriz/own/prod/apps/personal/oriz-cs-me-app/knowledge/`](../../repos/oriz/own/prod/apps/personal/oriz-cs-me-app/knowledge) |
| Time-stamped history | `log.md` | (append-only) |

## Cross-refs

- [rules/self-update-rule](./self-update-rule.md) — every chat
  decision lands in knowledge same turn
- [rules/future-overrides-past](../interaction/future-overrides-past.md) — chat
  wins when it contradicts knowledge
- [rules/user-prefers-deletion-over-archive](../interaction/user-prefers-deletion-over-archive.md)
  — delete superseded same-day
- [_okf.md](../../_okf.md) — the OKF conventions every concept file
  follows
