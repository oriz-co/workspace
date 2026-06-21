---
type: convention
title: "How the oriz family uses the Open Knowledge Format"
description: "The shared conventions every concept file in this knowledge/ bundle follows. OKF v0.1 spec + a small set of family-specific rules so producers and consumers stay in lockstep."
tags: [okf, convention, meta]
timestamp: 2026-06-20
format_version: okf-v0.1
# 2026-06-20 update: depth scales with folder size, ceiling 5.
# Tiny dirs stay at 2-3 levels; big dirs (>50 files) deepen to 5 so any
# one read is the smallest possible leaf. See
# decisions/architecture/knowledge-bundle/depth/5-level-hierarchy.md.
---

# How the oriz family uses the Open Knowledge Format

This file is the contract for every other file in this `knowledge/`
bundle. If you're an agent or a human about to add or edit a concept
file, read this first.

## The format we follow

[OKF v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md), published 2026-06-13 by Google Cloud Data Cloud team.

Each file represents one concept. Plain markdown body, YAML
frontmatter at the top with the small set of structured fields that
need to be queryable.

## Required frontmatter on every concept file

```yaml
---
type: <one of the allowed types — see below>
title: <human-readable title>
description: <one-line summary, used by agents during retrieval>
tags: [<topic tag>, <topic tag>, ...]
timestamp: <ISO-8601, last meaningful update>
---
```

Per OKF v0.1, only `type` is strictly required. The family adds
`title`, `description`, and `tags` as also-required because they
make agent retrieval significantly better.

Optional frontmatter fields:

```yaml
resource: <canonical URL the concept points at, when applicable>
supersedes: <slug or path of an older concept this replaces>
superseded_by: <slug or path of a newer concept that replaces this>
status: active | deprecated | superseded | draft
format_version: okf-v0.1     # default; bump when family adopts a newer OKF version
related: [<slug>, <slug>]    # cross-references for graph navigation
```

## Allowed `type` values (the family taxonomy)

Keep this list short and stable. Add new types only when an existing
one genuinely doesn't fit, and update this section in the same edit.

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

## File naming + directory layout

Every concept file is `kebab-case.md`. The path IS the identity:
`knowledge/rules/never-enable-blaze.md` is a stable reference.

### Hierarchy depth — scales with folder size, ceiling 5

Depth follows the size of the L1 folder. Goal: any single agent read
pulls the smallest possible leaf.

| L1 file count | Depth | Path shape |
|---|---|---|
| ≤15 | 2 | `knowledge/<L1>/<file>.md` |
| 16–50 | 3 | `knowledge/<L1>/<L2>/<file>.md` |
| 51–150 | 4 | `knowledge/<L1>/<L2>/<L3>/<file>.md` |
| 151+ | **5** | `knowledge/<L1>/<L2>/<L3>/<L4>/<file>.md` |

Apply the deepest tier the folder qualifies for; never go past 5 — the
path stops being a stable, memorable identity. When an L_n grows past
~15 siblings, split into multiple L_n peers, not a deeper L_{n+1}.

`index.md` lives at every directory level and only lists its direct
children.

Migration: touch-and-deepen, not big-bang. When a file is edited, move
it to the depth its parent now warrants.

The master `oriz/knowledge/` is structured as:

```
knowledge/
├── _okf.md                      ← this file (convention)
├── index.md                     ← bundle overview (OKF reserved name)
├── log.md                       ← chronological change history (OKF reserved name)
├── rules/                       ← 3-level (flat)
│   ├── index.md                 ← what rules are, the 5 non-negotiables
│   ├── never-hit-quotas.md
│   ├── no-card-on-file.md
│   ├── self-update-rule.md
│   └── ...
├── decisions/                   ← 4-level (grouped by topic)
│   ├── index.md
│   ├── architecture/
│   ├── branding/
│   ├── content/
│   ├── infrastructure/
│   ├── monetisation/
│   ├── process/
│   └── tooling/
├── services/                    ← 4-level (grouped by role)
│   ├── index.md                 ← the service catalog table
│   ├── hosting/                 ← cloudflare-pages, github-pages, vercel, ...
│   ├── auth/                    ← firebase-spark, app-check-firebase, recaptcha-enterprise, ...
│   ├── database/                ← turso
│   ├── compute/                 ← cloudflare-workers, cloudflare-r2, github-actions
│   ├── email/                   ← resend, email-octopus, mailerlite
│   ├── forms/                   ← web3forms, tally, formspree
│   ├── monitoring/              ← better-stack, healthchecks-io, glitchtip
│   ├── analytics/               ← cloudflare-web-analytics, microsoft-clarity, posthog
│   ├── ai/                      ← puter-js, openrouter
│   ├── domain/                  ← cloudflare-dns, cloudflare-registrar
│   ├── ads/                     ← ezoic, mediavine
│   ├── payment/                 ← razorpay
│   ├── search/                  ← pagefind
│   ├── tooling/                 ← envpact, imagekit, axiom, hypertune, hookdeck, azure-for-students
│   └── code-quality/            ← dependabot, coderabbit, sonarcloud
├── architecture/                ← 3-level (flat)
│   ├── index.md
│   ├── layer-1-static-hosting.md
│   └── ...
├── design/                      ← 3-level (flat, one per site)
│   ├── index.md
│   ├── _family-rules.md
│   └── ...
├── policy/                      ← 3-level (flat)
│   ├── index.md
│   └── ...
├── runbooks/                    ← 3-level (flat)
│   ├── index.md
│   └── ...
└── glossary/                    ← 4-level (grouped alphabetically)
    ├── index.md
    ├── a-c/
    ├── d-h/
    ├── i-n/
    ├── o-r/
    └── s-z/
```

## Per-app knowledge bundles

Every app submodule under `projects/apps/**/<app>/` has its own `knowledge/` folder following an OKF-light shape:

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

Richest example: [`projects/apps/personal/oriz-cs-me-app/knowledge/`](../projects/apps/personal/oriz-cs-me-app/knowledge/) — lifestream architecture, age-gating, ingester contract, 100-year strategy.

## Cross-linking conventions

Use plain markdown links, relative to the linking file. Per OKF spec,
this is what builds the implicit knowledge graph:

```markdown
This site follows the [no-card-on-file rule](../../knowledge/rules/no-card-on-file.md).
```

When a concept needs many cross-references, list them in frontmatter
`related:` so consumers can build the graph without parsing prose:

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

## Reserved filenames (per OKF spec)

- `index.md` — overview / progressive disclosure for an entire directory
- `log.md` — chronological log of changes for that directory's bundle
- `_okf.md` — family-specific convention extension (this file). Underscore prefix flags it as meta, not a regular concept.

## When the spec moves

OKF v0.1 was published 2026-06-13. It will evolve. When it does:

1. Read the migration notes for the new version
2. Update this file's `format_version` field
3. Run a frontmatter audit across the bundle
4. Update concept files where the new spec demands changes
5. Log the migration in `knowledge/log.md`

Until the spec hits 1.0, prefer **additive** frontmatter changes
(adding fields) over **structural** ones (renaming or removing
fields). Backward compatibility is a feature.

## Update protocol — the most important rule

The family AGENTS.md `self-update rule` applies HERE more than
anywhere else: **every architectural decision the user makes in chat
must be reflected in the relevant concept file (or a new one) in the
same conversation.**

When a new decision lands:

1. Decide which directory it belongs in (`rules/`, `decisions/`, etc).
2. Pick a kebab-case filename that names the concept clearly.
3. Write the file with full frontmatter.
4. Append a one-line entry to `knowledge/log.md` with the date + path.
5. If it supersedes an older concept, set `superseded_by` on the old
   one and `supersedes` on the new one. Don't delete the old file.
6. Commit with `docs(knowledge): <one-line summary>`.

The bundle is a living wiki. Outdated concepts get marked
`status: superseded`, not deleted.

## Producers + consumers

Per the OKF "producer/consumer independence" principle:

- **Producers**: Claude Code (this agent), the user (manually), build-time scripts, future ingest agents. None should require special tooling beyond a markdown editor.
- **Consumers**: any LLM-backed agent (Claude, Gemini, ChatGPT), the static visualizer Google ships, future search/dashboard tools, the user reading directly.

If you find yourself reaching for a custom tool to read or write a
concept file, you've left OKF. Stop and reconsider.
