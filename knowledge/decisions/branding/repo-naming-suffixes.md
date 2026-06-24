---
type: decision
title: "Repo naming locked: <subdomain-prefix>-site for every site + role suffix matrix for everything else"
description: "Every site repo is named <subdomain-prefix>-site (the subdomain prefix on oriz.in, suffixed with -site). Browser extensions get -bs-ext (revised 2026-06-24 from -ext to match the bs-ext/ folder convention), VS Code extensions -vsc-ext, CLIs -cli, Workers -worker, Cloud Functions -fn, MCP servers -mcp, data repos -data, agent skills -skill, rule bundles -rules. NPM packages stay clean (no suffix). Convention applies to forks too — see fork-discipline's product-rename exception."
tags: [naming, repo, packages, suffix, family, branding]
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
  - decisions/branding/keep-oriz-add-site-suffix
  - decisions/branding/oriz-me-added-to-family
  - decisions/branding/oriz-kit-package-name
  - decisions/infrastructure/chrome-extensions-as-submodules
  - rules/repo-naming
  - runbooks/rename-repo
  - glossary/o-r/oriz-kit
---

# Repo naming — subdomain-prefix for sites + role suffix for everything else

## Decision (revised 2026-06-21, fourth pass)

Every chirag127 repo carries a suffix that names its runtime category.
**Site repos are named `<subdomain-prefix>-site`** — the slug mirrors the
public subdomain on `oriz.in`. The repo for `blog.oriz.in` is
`chirag127/blog-site`, for `journal.oriz.in` it's
`chirag127/journal-site`, etc. This replaces the prior brand-only slugs
(`pages-site`, `tabs-site`, `roam-site`, `echo-site`) that didn't track
their public URL.

Everything else keeps its role suffix from the third-pass matrix: npm
packages stay bare scoped (`@chirag127/<name>`), browser extensions get
`-bs-ext` (revised 2026-06-24 from `-ext` to match the disk folder
`bs-ext/`), VS Code extensions get `-vsc-ext`, CLIs get `-cli`, MCP
servers get `-mcp`, Cloudflare Workers get `-worker`, Cloudflare /
Firebase Functions get `-fn`, static-data repos get `-data`, agent
skills get `-skill`, agent rule bundles get `-rules`.

| Role | Suffix | Examples |
|---|---|---|
| Static site | `<subdomain-prefix>-site` | `blog-site` (blog.oriz.in), `journal-site` (journal.oriz.in), `pdf-tools-site` (pdf.oriz.in) |
| Astro / JS / TS npm package | _(none — scoped only)_ | `@chirag127/astro-shell`, `@chirag127/astro-chrome` |
| Browser extension | `-bs-ext` | `kagi-summarizer-bs-ext`, `bookmarks-bs-ext`, `dearrow-plus-bs-ext` |
| VS Code extension | `-vsc-ext` | `snippets-vsc-ext` |
| CLI tool | `-cli` | `deploy-cli`, `echo-cli` |
| Cloudflare Worker | `-worker` | `api-worker` |
| Cloudflare / Firebase Function | `-fn` | `og-image-fn` |
| Model Context Protocol server | `-mcp` | `knowledge-mcp` |
| Static data repo | `-data` | `redirects-data` |
| Agent skill (Claude Code, etc.) | `-skill` | `grill-me-skill`, `agents-md-sync-skill` |
| Agent rule bundle | `-rules` | `family-rules` |

**No brand prefix.** The `chirag127/` org slug is already the prefix.
**Same name across GitHub repo and npm package** when both exist
(modulo `@chirag127/` scope on npm).
**Subdomains stay descriptive and shortest** (`pdf.oriz.in` not
`pdf-tools-site.oriz.in`). The suffix is a repo-only identifier.

## Why universal suffix (this pass)

- **Recruiter scanning**: every repo at-a-glance reveals its runtime
  category from the slug alone. No need to open the repo to learn what
  it is.
- **Organization listing readability**: repos sort + group by suffix in
  `gh repo list` output and on the GitHub user page.
- **Stamp wordmark**: the family-wide rubber-stamp signature on every
  site reads `ORIZ · pages-site` / `ORIZ · pdf-tools-site` — the suffix
  becomes part of the visible brand (per user MCQ this session).
- **Skill discovery**: `chirag127/*-skill` is grep-able for the agent
  skills CLI; `chirag127/skill-*` was the old npm-skills convention but
  inconsistent with the rest of the family.

## Skill repo prefix flip (added 2026-06-20 evening)

Old: `chirag127/skill-<name>` (npm skills CLI install target).
New: `chirag127/<name>-skill` (consistent with universal suffix).

Renamed this session:
- `skill-agents-md-sync` → `agents-md-sync-skill`
- `skill-claude-code-mcq-notes` → `claude-code-mcq-notes-skill`

GitHub auto-redirects keep old `npx skills add chirag127/skill-<name>`
URLs working until the next `gh repo rename` round.

## Site rename (this session, fourth pass)

Brand-only slugs that didn't track the public subdomain are dropped.
Every site repo now mirrors its `oriz.in` subdomain prefix. Sites whose
slug already matched (`me`, `home`, `ncert`, `lore`, `janaushdhi`, and
all `*-tools-site` repos) are unchanged. Four sites renamed:

| Old slug | New slug | Subdomain |
|---|---|---|
| `chirag127/pages-site` | `chirag127/blog-site` | blog.oriz.in |
| `chirag127/tabs-site` | `chirag127/cards-site` | cards.oriz.in |
| `chirag127/roam-site` | `chirag127/journal-site` | journal.oriz.in |
| `chirag127/echo-site` | `chirag127/post-site` | post.oriz.in (planned) |

Full current table:

| Repo | Subdomain |
|---|---|
| `chirag127/blog-site` | blog.oriz.in |
| `chirag127/lore-site` | (TBD) |
| `chirag127/ncert-site` | ncert.oriz.in |
| `chirag127/cards-site` | cards.oriz.in |
| `chirag127/home-site` | oriz.in (apex) |
| `chirag127/journal-site` | journal.oriz.in |
| `chirag127/me-site` | me.oriz.in |
| `chirag127/post-site` | post.oriz.in (planned) |
| `chirag127/janaushdhi-site` | (TBD) |

`home-site` is grandfathered for the apex domain — no public subdomain
prefix exists for `oriz.in`. Sites without a locked subdomain
(`lore-site`, `janaushdhi-site`) keep their current slug until the
subdomain is decided.

## Rejected this session

- Brand-only sites (`pages-site`, `tabs-site`, `roam-site`, `echo-site`)
  whose slug didn't track the public subdomain — fourth-pass reversal.
- Dropping `-site` suffix entirely (bare `blog`, `journal`, etc.) — kept
  for at-a-glance role typing in `gh repo list`.
- Stripping `-tools-` from the tools sites (e.g. `pdf-site` instead of
  `pdf-tools-site`) — kept because the `-tools-` infix signals the
  shared tools/ directory and shared scaffold.

## Why

The earlier `-site` / `-ext` decision (see
[keep-oriz-add-site-suffix](./keep-oriz-add-site-suffix.md)) covered
two roles. As the family grew (CLIs, Workers, VS Code extensions on
the roadmap, Cloud Functions migrating off Firebase Spark) two-suffix
coverage became insufficient. Locking the full suffix matrix now
prevents ad-hoc names from leaking into the org listing as new repo
types appear, and it gives the parallel-by-default agent a single
table to consult before any `gh repo create`.

## Implications

- Site repos completed in the fourth pass: `pages-site` → `blog-site`,
  `tabs-site` → `cards-site`, `roam-site` → `journal-site`, `echo-site`
  → `post-site`. All four renames ran through
  [`runbooks/rename-repo.md`](../../runbooks/rename-repo.md) and the
  local submodule paths under `repos/websites/` flipped to match.
  GitHub auto-redirects keep old `chirag127/<old>-site` clone URLs
  working.
- New sites: pick the public subdomain first, then the repo slug is
  `<subdomain-prefix>-site`. If the subdomain isn't locked, defer the
  rename until it is — don't ship a brand-only slug.

- New extensions get `oriz-<slug>-ext` from day one; new VS Code
  extensions get `oriz-<slug>-vsc-ext`.
- Workers (e.g. the Hono umbrella at `api.oriz.in`) carry `-worker`
  suffix when migrated off whatever ad-hoc name they currently use.
- NPM package repos stay clean: `@chirag127/oriz-kit`, `oriz-firestream`,
  `@chirag127/firebase-init`, etc. The `@chirag127/` scope (or, for
  unscoped, the absence of a suffix table entry) is the disambiguator.
- Data repos already use `-data` — that suffix is now formalised in
  the table above.
- GitHub repo redirects on rename keep old clones working — all
  rename steps go through [`runbooks/rename-repo.md`](../../runbooks/rename-repo.md)
  which sets them up automatically.
- Audit gate: every `git push` to a *new* repo URL must verify the
  slug ends in one of the seven suffixes (or is a clean npm-package
  name) — see [`rules/repo-naming.md`](../../rules/repo-naming.md).

## Cross-refs

- [keep-oriz-add-site-suffix](./keep-oriz-add-site-suffix.md) — the
  earlier two-suffix decision this one supersedes-by-extension
- [oriz-me added to the family](./oriz-me-added-to-family.md)
- [@chirag127/oriz-kit package name](./oriz-kit-package-name.md)
- [Chrome extensions as submodules](../infrastructure/chrome-extensions-as-submodules.md)
- [`rules/repo-naming.md`](../../rules/repo-naming.md) — the audit-before-publish rule
- [`runbooks/rename-repo.md`](../../runbooks/rename-repo.md) — the rename procedure
- [oriz-kit glossary entry](../../glossary/o-r/oriz-kit.md)
- [AGENTS.md](../../../AGENTS.md)
