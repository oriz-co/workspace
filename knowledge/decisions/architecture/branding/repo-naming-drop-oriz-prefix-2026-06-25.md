---
type: decision
title: Repo naming — drop the oriz- brand prefix from slugs
description: Locked 2026-06-25. Repo slugs use the service name only — no oriz- prefix. The GitHub org namespace (oriz-org/<slug>) provides the brand. Existing repos migrate via gh repo rename. Type suffix (-api, -npm-pkg, -bs-ext, -ide-ext, -cli, -mcp-server, -app) is kept.
tags:
- decision
- branding
- repo-naming
- slug
- rename
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
related:
- decisions/architecture/infrastructure/workspace-flat-repos-2026-06-25
- decisions/architecture/infrastructure/umbrella-as-clone-entrypoint-2026-06-25
- decisions/architecture/branding/subdomain-path-based-on-category-2026-06-25
---

# Repo naming — drop the oriz- prefix

## Decision

Repo slugs name the service only, never the brand. The slug `oriz-finance-app` becomes `finance-app`. The brand prefix is provided by the GitHub org namespace itself — `oriz-org/finance-app` reads brand-then-service automatically. The type suffix is retained: `-api`, `-npm-pkg`, `-bs-ext`, `-ide-ext`, `-cli`, `-mcp-server`, `-app`. npm packages keep their `@oriz/` scope, so `@oriz/finance` continues to read brand-then-service through the scope.

## Why

- **Org namespace is the brand carrier** — `oriz-org/finance-app` already says "oriz". Prefixing the repo too is double-tagging.
- **Shorter URLs, shorter paths** — `repos/finance-app/` beats `repos/oriz-finance-app/`; same for GitHub URLs.
- **Easier transfer in/out** — a non-prefixed slug travels cleanly if a repo moves owners; brand-prefixed slugs feel orphaned outside the org.
- **npm scope keeps brand** — `@oriz/finance` is unambiguous on npm; repo slug `finance-npm-pkg` is unambiguous in the org.
- **`gh repo rename`** is one command; redirects from old name → new name are automatic for ~365 days.
- **Suffix retained because it sorts** — `ls` and search results cluster type-equal repos.

## Implications

- Every existing `oriz-<slug>` repo needs `gh repo rename`. GitHub maintains the redirect transparently.
- Local clones do `git remote set-url origin git@github.com:oriz-org/<new-slug>`.
- `.gitmodules` `url =` entries update to the renamed URLs; `path = repos/<new-slug>` aligns with the flat layout.
- npm package names DO NOT change — they were always `@oriz/<name>`, never `oriz-<name>`.
- Any hardcoded `oriz-<slug>` references in CI, READMEs, knowledge cross-links need a sed pass.
- This pairs with workspace-flat-repos-2026-06-25 — the rename and the layout change happen in the same migration window to amortise breakage.
