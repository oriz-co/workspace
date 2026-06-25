# COPILOT.md

> **Read [`AGENTS.md`](./AGENTS.md) and [`README.md`](./README.md) first — they are the source of truth.**

This file is a pointer to avoid duplication of rules, decisions, or conventions.

All repository rules, architecture, hosting, and developer guidelines are documented in:
- [`AGENTS.md`](./AGENTS.md) — Open Knowledge Format (OKF) explanation & agent self-regulation guidelines.
- [`knowledge/index.md`](./knowledge/index.md) — The canonical brain (rules, decisions, runbooks, services).

## GitHub Copilot Specific Instructions
1. **Load Context Wisely:** Read `knowledge/index.md` first to locate relevant decisions and rules rather than scanning files ad-hoc.
2. **Follow self-update:** Ensure all architectural, stack, or naming decisions locked in chat are documented in `knowledge/` during the same session, as per [`knowledge/rules/self-update-rule.md`](./knowledge/rules/agent/self-update-rule.md).
3. **Copilot Settings:** The `.github/copilot-instructions.md` file (if present) defers to this file and `AGENTS.md`.
