---
type: convention
title: "How the oriz family uses the Open Knowledge Format"
description: "The shared conventions every concept file in this knowledge/ bundle follows. OKF v0.1 spec + a small set of family-specific rules so producers and consumers stay in lockstep."
tags: [okf, convention, meta]
timestamp: 2026-06-23
format_version: okf-v0.1
status: active
---

# How the oriz family uses the Open Knowledge Format

This file is the contract for every other file in this `knowledge/` bundle.
If you're an agent or a human about to add or edit a concept file, read this first.

---

## The format we follow

[OKF v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md), published 2026-06-13 by Google Cloud Data Cloud team. The full family-specific application of this spec is explained in [`AGENTS.md`](../AGENTS.md) §"The Open Knowledge Format (OKF v0.1)".

OKF is intentionally minimal: a directory of markdown files with YAML frontmatter at the top.
- No schema registry, no central authority, no required SDK.
- If you can `cat` a file, you can read OKF.
- If you can `git clone` a repo, you can ship it.
- Standard Markdown links create an implicit knowledge graph.

---

## Required frontmatter on every concept file

Per OKF v0.1, only `type` is strictly required. The family adds `title`, `description`, and `tags` as also-required because they make agent retrieval significantly better.

```yaml
---
type: <one of the allowed types — see below>
title: <human-readable title>
description: <one-line summary, used by agents during retrieval>
tags: [<topic tag>, <topic tag>, ...]
timestamp: <ISO-8601, last meaningful update>
format_version: okf-v0.1
status: active | deprecated | superseded | draft
---
```

### Optional frontmatter fields

```yaml
resource: <canonical URL the concept points at, when applicable>
supersedes: <slug or path of an older concept this replaces>
superseded_by: <slug or path of a newer concept that replaces this>
related: [<slug>, <slug>]    # cross-references for graph navigation — used by agents to build the graph
```

---

## Allowed `type` values (the family taxonomy)

Keep this list short and stable. Add new types only when an existing one genuinely doesn't fit, and update this section in the same edit.

| Type | What it is | Example |
|---|---|---|
| `convention` | Meta-rules about how the bundle itself works | this file |
| `rule` | A non-negotiable constraint the family follows | "never enable Firebase Blaze" |
| `decision` | A specific architectural / naming / stack decision the user has locked | "oriz-kit is the package name" |
| `service` | A description of one external service the family uses, with primary/alt/swap-cost | "Cloudflare Pages" |
| `runbook` | A sequence of human-actionable commands | "auth-setup" |
| `design-brief` | One site's v2 design specification | "oriz-blog v2 brief" |
| `architecture` | A description of one piece of the stack | "the Hono Worker at api.oriz.in" |
| `policy` | Rules about content / privacy / monetisation / age-gating | "age-gating policy" |
| `schema` | Data model / type definition that lives outside code | "events table schema" |
| `process` | Multi-step internal process | "deploy the family" |
| `glossary` | Definition of a term used across the family | "lifestream" |
| `index` | Per-OKF spec, an `index.md` overview file at any directory level | `knowledge/index.md` |
| `log` | Per-OKF spec, chronological history of changes | `knowledge/log.md` |

---

## File naming + directory layout

Every concept file is `kebab-case.md`. The path IS the identity:
`knowledge/rules/never-enable-blaze.md` is a stable reference. **Never rename a concept file** unless you update every inbound link and log the migration.

### Hierarchy depth — scales with folder size, ceiling 5

Depth follows the size of the L1 folder. Goal: any single agent read pulls the smallest possible leaf.

| L1 file count | Depth | Path shape |
|---|---|---|
| ≤15 | 2 | `knowledge/<L1>/<file>.md` |
| 16–50 | 3 | `knowledge/<L1>/<L2>/<file>.md` |
| 51–150 | 4 | `knowledge/<L1>/<L2>/<L3>/<file>.md` |
| 151+ | **5** | `knowledge/<L1>/<L2>/<L3>/<L4>/<file>.md` |

Apply the deepest tier the folder qualifies for; never go past 5 — the path stops being a stable, memorable identity. When an L_n grows past ~15 siblings, split into multiple L_n peers, not a deeper L_{n+1}.

`index.md` lives at every directory level and only lists its direct children.

Migration: touch-and-deepen, not big-bang. When a file is edited, move it to the depth its parent now warrants.

---

## Reserved filenames (per OKF spec)

| Filename | Purpose |
|---|---|
| `index.md` | Directory listing for progressive disclosure. Agents read this first at each level before opening concept files. |
| `log.md` | Chronological log of changes to that bundle. Every new/updated concept appends one line: `<date> — <path> — <summary>`. |
| `_okf.md` | Family-specific convention extension (this file). Underscore prefix flags it as meta, not a regular concept. |

These MUST NOT be used as concept documents.

---

## How agents load and traverse OKF (context injection)

**Producer agents (enrichment):** When a decision is made in chat, write/update the concept file immediately. You are the enrichment agent.

**Consumer agents (retrieval):**
1. Start at `knowledge/index.md` — read the bundle overview and directory table.
2. Use `knowledge/_navigation.md` for the "where to look" quick-reference.
3. Follow links to relevant subdirectory `index.md` files (progressive disclosure).
4. Open specific concept files for full detail.
5. Use `related` frontmatter + inline links to traverse the graph.
6. Filter cross-cutting topics using `tags`.

**Never** scan the directory tree blindly. Always start at `knowledge/index.md`.

---

## How agents use OKF when editing code

Before modifying **any** code:

1. **Rules check** — `knowledge/rules/`: is there a rule that constrains this change? If yes, that rule wins.
2. **Decision check** — `knowledge/decisions/`: has this choice been locked? If yes, follow it.
3. **Service check** — `knowledge/services/`: are you adding a third-party integration? Check the free-tier file first.
4. **After locking a decision** — write the concept file, append to `knowledge/log.md`, commit: `docs(knowledge): <one-line summary>`.

---

## Cross-linking conventions

Use plain markdown links, relative to the linking file. Per OKF spec, this is what builds the implicit knowledge graph:

```markdown
This site follows the [no-card-on-file rule](../../knowledge/rules/no-card-on-file.md).
```

When a concept needs many cross-references, list them in frontmatter `related:` so consumers can build the graph without parsing prose:

```yaml
---
type: decision
title: "Stay on Firebase Spark forever — never Blaze"
related:
  - rules/never-hit-quotas
  - rules/no-card-on-file
  - architecture/layer-3-firebase-spark
  - services/firebase-spark
---
```

---

## Per-app knowledge bundles

Every app submodule under `projects/oriz/own/prod/apps/**/<app>/` has its own `knowledge/` folder following an OKF-light shape:

```text
<app-submodule>/
└── knowledge/
    ├── index.md
    ├── decisions/
    ├── runbooks/
    └── services/
```

The per-app bundle only carries facts specific to that app. Cross-cutting family rules, decisions, services, and architecture live HERE at master `knowledge/`. The deprecated master `knowledge/sites/<app>/` location is NOT used — per-app knowledge stays inside the submodule.

Cross-link to family-wide concepts via relative paths (e.g. `../../../../knowledge/rules/no-card-on-file.md` from an app's runbook at depth 3 in a submodule that's at depth 4 from master root).

Richest example: [`projects/c127/own/prod/apps/personal/cs-me-app/knowledge/`](../projects/c127/own/prod/apps/personal/cs-me-app/knowledge/) — lifestream architecture, age-gating, ingester contract, 100-year strategy.

---

## Update protocol — the most important rule

The family AGENTS.md `self-update rule` applies HERE more than anywhere else: **every architectural decision the user makes in chat must be reflected in the relevant concept file (or a new one) in the same conversation.**

When a new decision lands:

1. Decide which directory it belongs in (`rules/`, `decisions/`, etc.).
2. Pick a kebab-case filename that names the concept clearly.
3. Write the file with full frontmatter.
4. Append a one-line entry to `knowledge/log.md` with the date + path.
5. If it supersedes an older concept, set `superseded_by` on the old one and `supersedes` on the new one. Don't delete the old file.
6. Commit with `docs(knowledge): <one-line summary>`.

The bundle is a living wiki. Outdated concepts get marked `status: superseded`, not deleted.

---

## Producers + consumers

Per the OKF "producer/consumer independence" principle:

- **Producers**: Claude Code, Gemini/Antigravity, Cursor, Aider, Copilot, the user (manually), build-time scripts, future ingest agents. None should require special tooling beyond a markdown editor.
- **Consumers**: any LLM-backed agent (Claude, Gemini, ChatGPT, Copilot, Cursor, Aider), the static visualizer Google ships, future search/dashboard tools, the user reading directly.

If you find yourself reaching for a custom tool to read or write a concept file, you've left OKF. Stop and reconsider.

---

## When the spec moves

OKF v0.1 was published 2026-06-13. It will evolve. When it does:

1. Read the migration notes for the new version
2. Update this file's `format_version` field
3. Run a frontmatter audit across the bundle
4. Update concept files where the new spec demands changes
5. Log the migration in `knowledge/log.md`

Until the spec hits 1.0, prefer **additive** frontmatter changes (adding fields) over **structural** ones (renaming or removing fields). Backward compatibility is a feature.
