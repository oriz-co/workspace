# CLAUDE.md

> **Read [`AGENTS.md`](./AGENTS.md) first — it is the single source of truth for this repo and the entire `chirag127/oriz*` family.**

This file exists only to point Claude Code at `AGENTS.md`. All architecture, conventions, hosting, auth, secrets, design system, and submodule rules are documented there.

---

## Three rules every agent must follow at all times

1. **Self-update rule.** Every architectural / naming / stack decision the user makes in chat MUST be reflected in AGENTS.md before that conversation ends. If AGENTS.md and a recent chat contradict, the chat wins and AGENTS.md is wrong — update it in the same turn.

2. **Parallel-by-default rule.** Any work that can be parallelised MUST be fanned out via subagents. Sequential is the exception, justified in the commit message or task description when used.

3. **Grill-to-knowledge rule.** When the user invokes `grill-me` or asks a sequence of design questions, EVERY locked answer (including the question stem, the chosen option, the rejected options, and the "why") MUST land in `knowledge/` in the same conversation — either appended to the relevant existing decision file or written as a new `decisions/architecture/<topic>.md`. No locked answer may live only in chat history. The conversation context is the audit trail; the decision file is the durable truth.

All three rules are documented in full in AGENTS.md. They take precedence over individual prompts that contradict them.
