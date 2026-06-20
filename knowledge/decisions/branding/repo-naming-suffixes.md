---
type: decision
title: "Repo naming suffixes locked: -site / -ext / -vsc-ext / -cli / -worker / -fn"
description: "Every chirag127/oriz* repo gets a role-typed suffix. Sites end -site, browser extensions -ext, VS Code extensions -vsc-ext, CLIs -cli, Workers -worker, Cloud Functions -fn. NPM packages stay clean (no suffix)."
tags: [naming, repo, packages, suffix, family, branding]
timestamp: 2026-06-20
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

# Repo naming — hybrid suffix policy (sites + npm packages drop, others keep)

## Decision (revised 2026-06-20)

Suffixes are kept ONLY where the brand alone doesn't make the repo's
runtime category obvious. Sites and scoped npm packages drop suffixes
because their identity is unambiguous from context (subdomain or
`@chirag127/` scope). Everything else keeps the suffix because the
type is invisible from the brand alone.

| Role | Suffix | Examples |
|---|---|---|
| Static site | _(none)_ | `pages`, `lore`, `tabs`, `oriz` |
| Astro / JS / TypeScript npm package | _(none)_ | `astro-shell`, `astro-icons`, `firebase-init` |
| Browser extension (Chrome / Firefox / Edge / Safari) | `-ext` | `kagi-summarizer-ext`, `bookmarks-ext` |
| VS Code extension | `-vsc-ext` | `snippets-vsc-ext` |
| CLI tool | `-cli` | `deploy-cli`, `echo-cli` |
| Cloudflare Worker | `-worker` | `api-worker` |
| Cloudflare Function (or Firebase Function) | `-fn` | `og-image-fn` |
| Model Context Protocol server | `-mcp` | `knowledge-mcp` |
| Static data repo | `-data` | `redirects-data` |

**No brand prefix.** The `chirag127/` org slug is already the prefix.
`oriz-` survives only on legacy repos until next rename.

**Same name across GitHub and npm** (when both exist). Subdomains are
independent and stay descriptive (`pdf.oriz.in` not `slice.oriz.in`)
even when the repo brand is something different.

**Apex hub exception.** The hub at `oriz.in` is published from
`chirag127/oriz` (no suffix, brand IS the family name).

## Why hybrid

Suffixes pay off where the brand is ambiguous:

- **Browser extensions** — `kagi-summarizer-ext` is unambiguously a
  Chrome/Firefox extension. `kagi-summarizer` could be a CLI, web app,
  or script.
- **CLI tools** — `deploy-cli` clearly publishes a binary. `deploy`
  could be 10 things.
- **MCP servers / Workers / Functions / data repos** — distinctive
  runtime categories, recruiter-readable signal, and the brand alone
  doesn't tell you the runtime.

Suffixes are noise where context already disambiguates:

- **Sites** — the subdomain (`blog.oriz.in`, `pages.oriz.in`) and the
  homepage URL in the description tell you it's a site. `pages-site`
  adds nothing over `pages`.
- **Scoped npm packages** — `@chirag127/firebase-init` — the scope
  already disambiguates from the public unscoped registry. No
  additional suffix needed.
- **Apex** — `chirag127/oriz` reads better than `chirag127/oriz-site`.

The earlier all-suffix policy (decided 2026-06-19, see git log) was
re-evaluated 2026-06-20 against [`naming/policy/family-naming-policy.md`](../naming/policy/family-naming-policy.md)
and the user's brand-rename pivot. The hybrid policy keeps the
readability win on extensions/CLIs/MCP/workers/data while letting
sites and packages have clean brand-only names.

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

- Every existing site repo migrates to its new `-site` form. Migration
  list (current → target):

  | Current | Target |
  |---|---|
  | `chirag127/oriz-home` | `chirag127/oriz-home-site` |
  | `chirag127/oriz-blog` | `chirag127/oriz-blog-site` |
  | `chirag127/oriz-books` | `chirag127/oriz-books-site` |
  | `chirag127/oriz-book-lore` | `chirag127/oriz-book-lore-site` |
  | `chirag127/oriz-cards` | `chirag127/oriz-cards-site` |
  | `chirag127/oriz-finance` | `chirag127/oriz-finance-site` |
  | `chirag127/oriz-journal` | `chirag127/oriz-journal-site` |
  | `chirag127/oriz-urls-to-md` | `chirag127/oriz-urls-to-md-site` |
  | `chirag127/oriz-image-tools` | `chirag127/oriz-image-tools-site` |
  | `chirag127/oriz-pdf-tools` | `chirag127/oriz-pdf-tools-site` |
  | `chirag127/oriz-me` | `chirag127/oriz-me-site` |

  Submodule **paths** stay `sites/oriz-<name>` for ergonomics — only
  the remote URL flips. Run renames per
  [`runbooks/rename-repo.md`](../../runbooks/rename-repo.md).

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
