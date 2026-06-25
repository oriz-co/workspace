---
type: service
title: Open Knowledge Format (OKF)
description: "Vendor-neutral, open specification (v0.1, June 2026) from Google Cloud for representing knowledge as Markdown files with YAML frontmatter — the canonical format for all family knowledge bundles."
tags:
  - okf
  - standard
  - knowledge
  - google-cloud
  - format
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
  - decisions/process/okf-as-canonical-format
  - glossary/o-r/okf-bundle
  - convention
  - services/secrets/sops-age
---

# Open Knowledge Format (OKF)

## What It Is

OKF is an **open, vendor-neutral specification** published by **Google Cloud** on **June 12, 2026** as version **0.1 (Draft)**. It formalizes Andrej Karpathy's "LLM wiki" pattern (a Markdown knowledge base an agent reads and maintains like code) into a portable standard.

- **Authors**: Sam McVeety & Amir Hormati (Google Cloud Data Cloud team)
- **Repo**: [`GoogleCloudPlatform/knowledge-catalog`](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf)
- **Spec**: [`okf/SPEC.md`](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) (451 lines, 14.7 KB)
- **License**: Apache 2.0

### Design Principles

| Principle | Meaning |
|---|---|
| **Just Markdown** | Readable in any editor, renders on GitHub, indexable by any search tool |
| **Just files** | Shippable as tarball, hostable in any git repo, mountable on any filesystem |
| **Just YAML frontmatter** | Minimal structured fields; no schema registry, no SDK, no runtime |

### The Three Properties

| Property | Description |
|---|---|
| **Readable** by humans without tooling | Any text editor works |
| **Parseable** by agents without bespoke SDKs | `cat` a file to read it; `git clone` to ship it |
| **Diffable** in version control | Plain text + structured frontmatter = meaningful diffs |
| **Portable** across tools, organizations, and time | No vendor lock-in |

## Problems OKF Solves

### The Context-Assembly Problem

Before an AI agent can act, it must assemble context — schemas, metric definitions, runbooks, join paths — from scattered, incompatible sources:

- Metadata catalogs with proprietary APIs
- Wikis behind login walls (Confluence, Notion, SharePoint)
- Code comments and docstrings
- The heads of senior engineers

OKF solves this by providing a **lingua franca**: a shared format any producer can write and any consumer can read, without translation.

### The Stack OKF Fits Into

```
robots.txt / sitemap.xml  → tells crawlers which URLs exist
llms.txt                  → points agents at pages worth reading
AGENTS.md / CLAUDE.md     → tells coding agents how to behave
Open Knowledge Format     → hands agents the knowledge itself
```

## Bundle Structure

An OKF bundle is a directory tree of Markdown files:

```
path/to/bundle/
├── index.md              # Optional. Directory listing (progressive disclosure)
├── log.md                # Optional. Chronological update history
├── <concept>.md          # A concept at bundle root
└── <subdirectory>/
    ├── index.md
    ├── <concept>.md
    └── ...
```

### Reserved Filenames

| Filename | Purpose |
|---|---|
| `index.md` | Directory listing for progressive disclosure |
| `log.md` | Chronological update history (ISO 8601 headings) |

### Hierarchy Depth

| L1 file count | Max depth |
|---|---|
| ≤15 | 2 (`knowledge/<L1>/<file>.md`) |
| 16–50 | 3 (`knowledge/<L1>/<L2>/<file>.md`) |
| 51–150 | 4 |
| 151+ | 5 (absolute ceiling) |

## Concept Document Format

### YAML Frontmatter

```yaml
---
type: <Type name>                  # REQUIRED
title: <Display name>
description: <One-line summary>
resource: <Canonical URI>
tags: [<tag>, <tag>, …]
timestamp: <ISO 8601 datetime>
---
```

| Field | Required | Purpose |
|---|---|---|
| `type` | **YES** | Identifies the kind of concept. Unknown types tolerated. |
| `title` | Recommended | Human-readable display name |
| `description` | Recommended | One-line summary for retrieval |
| `resource` | Recommended | Canonical URI to the asset |
| `tags` | Recommended | Cross-cutting categorization |
| `timestamp` | Recommended | Last-modified ISO 8601 |

### Body

Standard Markdown. Favor structural elements (headings, lists, tables, fenced code blocks) over freeform prose.

Conventional section headings (SHOULD use when applicable):

| Heading | Purpose |
|---|---|
| `# Schema` | Structured description of fields/columns |
| `# Examples` | Concrete usage examples |
| `# Citations` | External sources backing claims |

### Cross-linking

- Standard Markdown links between concepts form a knowledge graph
- Absolute bundle-relative links (`/tables/customers.md`) are recommended
- Relative links (`./other.md`) also supported
- Consumers MUST tolerate broken links (target may not exist yet)

## Conformance (v0.1)

A bundle is conformant if:

1. Every non-reserved `.md` file has parseable YAML frontmatter
2. Every frontmatter has a non-empty `type` field
3. Reserved filenames follow spec when present

Consumers MUST NOT reject bundles for missing optional fields, unknown types, extra keys, broken links, or missing index files.

## Relationship to Other Standards

| Standard | Relationship to OKF |
|---|---|
| **llms.txt** | Points agents at pages to read. OKF goes deeper — hands over content. |
| **AGENTS.md / CLAUDE.md** | Tell agents rules of behavior. OKF supplies the knowledge graph. |
| **MCP (Model Context Protocol)** | Connection layer for tools at runtime. OKF is the curated knowledge layer. Complementary. |
| **RAG (Retrieval-Augmented Generation)** | RAG retrieves chunks from large corpuses. OKF gives RAG cleaner structured source material. Complementary. |
| **Schema.org** | Structured data for search engines. OKF is for AI agent context, not SEO. |

## What Google Shipped with the Spec

- **Reference enrichment agent**: Walks BigQuery datasets, drafts OKF concepts, enriches with citations
- **Reference visualizer**: Static HTML graph browser for bundles
- **3 sample bundles**: GA4 e-commerce, Stack Overflow public dataset, Bitcoin blocks/transactions

## Versioning

- Format: `<major>.<minor>` (currently `0.1` Draft)
- Minor bumps = backward-compatible additions
- Major bumps = breaking changes
- Until v1.0: prefer additive frontmatter changes over structural ones

## Adoption in This Family

This `knowledge/` directory IS an OKF bundle. See:

- [`decisions/process/okf-as-canonical-format`](../decisions/process/okf-as-canonical-format.md) — decision to adopt OKF
- [`_okf.md`](../_okf.md) — family-specific conventions extending OKF v0.1
- [`glossary/o-r/okf-bundle`](../glossary/o-r/okf-bundle.md) — definition of an OKF bundle
- [`index.md`](../index.md) — bundle root index
- [`log.md`](../log.md) — bundle change log
