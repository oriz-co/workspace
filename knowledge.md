# knowledge.md

> **This is a root-level redirect.** The actual knowledge bundle lives in the [`knowledge/`](./knowledge/) directory.

This file exists because some AI agents look for a flat `knowledge.md` at the repo root. There is none — all durable knowledge lives inside the structured OKF bundle.

## Start Here

The entry points are:

1. **[`knowledge/index.md`](./knowledge/index.md)** — the canonical brain: rules, decisions, services, architecture, design, policy, runbooks, glossary.
2. **[`knowledge/_navigation.md`](./knowledge/_navigation.md)** — "where to look" quick-reference map.
3. **[`knowledge/_okf.md`](./knowledge/_okf.md)** — the Open Knowledge Format spec and code-editing workflow for agents.
4. **[`AGENTS.md`](./AGENTS.md)** — OKF explanation + self-regulation guidelines for AI agents.

## What Is in `knowledge/`

| Directory | What |
|---|---|
| `rules/` | Non-negotiable constraints on every decision and code change |
| `decisions/` | Locked architectural, naming, and stack decisions |
| `services/` | One file per external service with free tier + swap cost |
| `architecture/` | Stack topology, API umbrella, canonical store |
| `design/` | v2 design briefs per site + family design rules |
| `policy/` | Legal, privacy, monetisation, content guidelines |
| `runbooks/` | Step-by-step ops sequences (deploy, rotate secrets, add a site) |
| `glossary/` | Family-specific vocabulary definitions |

## Format

All files follow [Open Knowledge Format v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) — plain Markdown with YAML frontmatter. No SDK required. Every file is readable by any text editor, any LLM, any agent.

Do **not** add durable information to this file. It is a redirect only.
