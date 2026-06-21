---
type: decision
title: "GitHub repo naming best practices — consolidated rules for the family"
description: "Single source covering every naming rule across v5 + v6 + the web-search-derived best practices. Use this file to check a proposed repo name before gh repo create."
tags: [naming, repo, branding, best-practices, github, seo]
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related: [decisions/branding/naming-policy-v6, decisions/branding/naming-policy-v5]
---

# GitHub repo naming best practices

## Checklist before `gh repo create`

Every new repo slug must pass ALL of these checks:

| # | Rule | Pattern |
|---|---|---|
| 1 | **lowercase kebab-case** | `pdf-tools-app` ✓ `PdfToolsApp` ✗ `PDF_Tools_App` ✗ |
| 2 | **No special chars** | letters + digits + hyphens only. No `.`, `_`, `/`, `@`. |
| 3 | **No version numbers in slug** | `oriz-pdf-tools-app` ✓ `oriz-pdf-tools-app-v2` ✗ — version lives in tags |
| 4 | **Brand prefix** | `oriz-` for family repos (per v6). Exceptions: `workspace`, `agents-md`, `setup`, `envpact-*`, `astro-*-npm-pkg`, forks. |
| 5 | **Category in slug for SEO** | tool apps keep "tools" (`oriz-pdf-tools-app`); games drop category (`oriz-2048-game`); content apps name the function (`oriz-blog-app`). |
| 6 | **Role/runtime suffix** | from the locked v5 matrix: `-app`, `-game`, `-kids-game`, `-api`, `-npm-pkg`, `-py-pkg`, `-rs-crate`, `-go-mod`, `-npm-cli`, `-py-cli`, `-rs-cli`, `-browser-ext`, `-vsc-ext`, `-mcp-server`, `-worker`, `-fn`, `-data`, `-skill`, `-rules`, `-dotfiles`, `-gh-action`. |
| 7 | **Max 60 chars** | GitHub allows 100; UI truncates ~60. Keep under 60 for clean listings. |
| 8 | **Descriptive — not cute** | Recruiter / future-me / agents must understand the role from the slug. |
| 9 | **No abbreviation past 2 letters** | `oriz-img-tools-app` ✗ `oriz-image-tools-app` ✓ (exception: well-known acronyms like `pdf`, `qr`, `fii`, `dii`, `mmi`). |
| 10 | **Description ALWAYS set** | Every `gh repo create` includes `--description "..."` naming the tech + role + positioning. |
| 11 | **Topics (5-10) ALWAYS set** | `gh repo edit --add-topic ...` for discoverability. Family-wide topics: `oriz`, `chirag127`, plus per-repo techs (`astro`, `react`, `typescript`, `firebase`, `cloudflare-pages`). |
| 12 | **Homepage URL set when deployed** | `--homepage "https://<subdomain>.oriz.in"` |

## Format

```
[brand-]<category>-<suffix>
```

Examples by category (see [`naming-policy-v6.md`](./naming-policy-v6.md) for the full matrix):

| Type | Pattern | Example |
|---|---|---|
| Tool app | `oriz-<category>-tools-app` | `oriz-pdf-tools-app` |
| Content app | `oriz-<function>-app` | `oriz-blog-app` |
| Game (adult) | `oriz-<game-name>-game` | `oriz-2048-game` |
| Game (kids) | `oriz-<game-name>-kids-game` | `oriz-counting-1-10-kids-game` |
| Static JSON API | `oriz-<dataset>-api` | `oriz-mmi-tracker-api` |
| npm package | `oriz-<role>-npm-pkg` | `oriz-share-npm-pkg` (future) |
| Astro npm package | `astro-<role>-npm-pkg` | `astro-shell-npm-pkg` (Astro framework family convention) |
| npm CLI | `oriz-<name>-npm-cli` | `oriz-deploy-npm-cli` (future) |
| Python CLI | `oriz-<name>-py-cli` | `oriz-scrape-py-cli` (future) |
| Browser extension | `oriz-<name>-browser-ext` | `oriz-bookmarks-browser-ext` (future) |
| VS Code extension | `oriz-<name>-vsc-ext` | `oriz-snippets-vsc-ext` (future) |
| MCP server | `oriz-<name>-mcp-server` | `oriz-knowledge-mcp-server` (future) |
| CF Worker | `oriz-<name>-worker` | `oriz-api-worker` (future) |
| Cloud Function | `oriz-<name>-fn` | `oriz-og-image-fn` (future) |
| Data repo | `oriz-<name>-data` | `oriz-redirects-data` (future) |
| Agent skill | `<name>-skill` | `grill-me-skill` (no oriz- prefix — skills aren't oriz-family products) |
| Agent rules | `<name>-rules` | `family-rules` (no oriz- prefix) |
| Dotfiles | `<name>-dotfiles` or bare `setup` | `setup` (vendor convention) |
| GH Action | `<name>-gh-action` | `envpact-gh-action` |

## Description format

Long, recruiter-readable, contains:
1. **What** the repo is in plain English
2. **Tech stack** explicitly named (e.g. "Astro 6 + React 19 islands + Tailwind v4")
3. **Deploy target** when relevant (e.g. "static, Cloudflare Pages")
4. **Positioning** when it differs from the obvious (e.g. "free, no card-on-file")

GitHub renders the full string. Long descriptions ARE encouraged. Short
vague descriptions ("PDF tools") are a rule violation.

## Topics

Required topics per repo (5-10):

| Tier | Topics | Always-on |
|---|---|---|
| **Family** | `oriz`, `chirag127` | YES |
| **Stack** | `astro`, `react`, `typescript`, `tailwindcss-v4`, `firebase`, `cloudflare-pages` | one or more per repo |
| **Domain** | `pdf-tools`, `image-tools`, `finance`, `kids-game`, `cli`, `mcp-server` | per-repo |
| **Category badge** | `static-site`, `pwa`, `monorepo`, `oss` | per-repo |

Set via `gh repo edit chirag127/<repo> --add-topic oriz --add-topic chirag127 --add-topic <stack> ...`.

## Anti-patterns to reject

- ❌ CamelCase: `FilterList` → renamed or deleted
- ❌ Underscores: `Personal_Site` → `personal-site`
- ❌ No-description repos
- ❌ Slugs longer than 60 chars (e.g. `AdguardFilters-Issue-Automation-Python-CLI` at 42 chars is borderline OK; `CogniLearn-Applied-ML-Algorithms-Python-Notebooks-Repository` at 60 is too long for clean scanning)
- ❌ Version in slug (`-v2`, `-2-0`)
- ❌ "Final" / "new" / "old" qualifiers in slug

## Cross-refs

- [naming-policy-v6](./naming-policy-v6.md) — the canonical sixth-pass naming policy
- [github-pages-as-json-api](../architecture/github-pages-as-json-api.md) — `-api` suffix usage
- [keep-knowledge-fresh](../../rules/keep-knowledge-fresh.md) — meta-rule that triggered consolidating this file
