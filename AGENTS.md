# AGENTS.md

> **Read [`README.md`](./README.md) first.** It is the canonical entry point — repo layout, tech stack, hard-rule shortlist, env management, domain map, license, and the standing authorization that govern every action you take here. This file used to duplicate that content; it now defers entirely.

After `README.md`, the next files to load in order are:

1. [`knowledge/index.md`](./knowledge/index.md) — the canonical brain (58 rules + 181 decisions + 43 runbooks)
2. [`knowledge/_navigation.md`](./knowledge/_navigation.md) — "where to look" map
3. [`knowledge/_okf.md`](./knowledge/_okf.md) — the file-format spec for `knowledge/`

When a rule and any other file conflict, the file in [`knowledge/rules/`](./knowledge/rules/) wins. When a decision is locked in chat, follow [`knowledge/rules/self-update-rule.md`](./knowledge/rules/self-update-rule.md) immediately.

Standing authorization for commit + push to `main` is in [`README.md`](./README.md#standing-authorization). The exceptions list (paid APIs, repo deletes, domain transfers, mass deletions ≥50 LOC) is binding on you.
