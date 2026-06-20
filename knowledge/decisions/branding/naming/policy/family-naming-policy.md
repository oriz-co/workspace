---
type: decision
title: "Family-wide naming policy — repo, npm, subdomain"
description: "GitHub repo slug = npm package name (when both exist). Subdomains are independent and shorter. Role-suffix every repo. No brand prefix on new repos. -mcp added to the suffix matrix."
tags: [naming, repo, npm, subdomain, family, branding]
timestamp: 2026-06-20
related: [repo-naming-suffixes]
supersedes:
---

# Naming policy across the family

## The three name spaces

| Layer | Convention | Example |
|---|---|---|
| GitHub repo slug | `<role-name>-<suffix>` (lowercase, kebab-case) | `chirag127/pdf-tools-site` |
| npm package name | `@chirag127/<same-as-repo-slug>` (when published) | `@chirag127/firebase-init` |
| Subdomain | Shortest single word possible | `pdf.oriz.in` |

**Rule of identity (when both exist):** GitHub repo slug == npm package
name (modulo the `@chirag127/` scope). No divergence. If the package
needs a different display name, that goes in `package.json#name` for the
import path (which equals the repo slug) and `package.json#publishConfig`
or README for the prose.

**Rule of brevity for subdomains:** Subdomains are typed by users every
day. Optimize for typing speed. `pdf.oriz.in` not `pdf-tools.oriz.in`.

## The role-suffix matrix (hybrid)

Sites and npm packages drop the suffix; everything else keeps it.

| Category | Suffix | Example |
|---|---|---|
| Static site | _(none)_ | `pages`, `lore`, `tabs` |
| Astro / JS / TS npm package | _(none)_ | `astro-shell`, `firebase-init` |
| Browser extension | `-ext` | `kagi-summarizer-ext` |
| VS Code extension | `-vsc-ext` | `snippets-vsc-ext` |
| CLI tool | `-cli` | `deploy-cli` |
| Cloudflare Worker | `-worker` | `api-worker` |
| Cloudflare Function | `-fn` | `og-image-fn` |
| Model Context Protocol server | `-mcp` | `knowledge-mcp` |
| Static data repo | `-data` | `redirects-data` |

Sites + scoped npm packages drop the suffix because:
- Subdomain + homepage URL already mark a repo as a site.
- The `@chirag127/` scope already disambiguates packages from public unscoped names.

Other categories keep the suffix because the brand alone doesn't tell
you the runtime, and the suffix is the cheapest possible way to
communicate it.

## What goes in the suffix vs. inside the slug

The **suffix** names the runtime category — what kind of thing this is,
where it deploys. The **slug body** names the function — what it does.

- Bad: `chirag127/pdf-tools` (no suffix; what kind of thing is it?)
- Bad: `chirag127/site-pdf-tools` (suffix as prefix; sorts wrong in repo listings)
- Good: `chirag127/pdf-tools-site` (function then category)

## Brand prefix posture

- **New repos**: no `oriz-` prefix in the slug. The org slug `chirag127/`
  is already the prefix. `chirag127/oriz-pdf-tools-site` is redundant.
- **Legacy repos**: `oriz-*` survives until next deliberate rename. Don't
  rename just for cosmetics.
- **Exception**: when the slug body is a generic English word that would
  collide with public packages or be ambiguous on its own, prefix with
  `oriz-` for disambiguation. E.g. `oriz-snippets-vsc-ext` (because
  `snippets-vsc-ext` would shadow other VS Code extensions).

## Cross-platform identity

The same project may exist as a repo, an npm package, a subdomain, and
a binary. Names align like this:

| Project | Repo | npm | Subdomain | Binary |
|---|---|---|---|---|
| PDF tools site | `pdf-tools-site` | _(not published)_ | `pdf.oriz.in` | _(none)_ |
| Astro shell pkg | `astro-shell` | `@chirag127/astro-shell` | _(none)_ | _(none)_ |
| Deploy CLI | `oriz-deploy-cli` | `@chirag127/oriz-deploy-cli` | _(none)_ | `oriz-deploy` |
| Knowledge MCP | `oriz-knowledge-mcp` | `@chirag127/oriz-knowledge-mcp` | _(none)_ | _(stdio)_ |

The CLI binary name CAN be shorter than the package — `oriz-deploy`
binary from `@chirag127/oriz-deploy-cli` is fine, since the binary is
typed daily but the package is referenced rarely.

(Decided 2026-06-20.)
