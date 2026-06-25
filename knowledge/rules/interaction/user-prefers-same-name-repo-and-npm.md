---
type: rule
title: User prefers same name across GitHub repo and npm package
description: When a project ships as a GitHub repo + npm package, the slugs match
  (modulo @chirag127/ scope). No divergence. Subdomains stay independent.
tags:
- taste
- mcq-learned
- naming
- npm
- github
timestamp: 2026-06-20
related:
- user-prefers-atomic-split
- family-naming-policy
---



# User prefers same name across GitHub repo and npm package

## The rule

When a project exists as both a GitHub repo and an npm package:
- GitHub: `chirag127/<slug>`
- npm: `@chirag127/<slug>` (same slug)

No divergence. Don't ship `chirag127/foo-bar-baz` → `@chirag127/foo`.
The cognitive load of remembering two names per project compounds across
the family.

## Subdomains stay independent

Subdomains follow a different rule (shortest possible single word) and
can differ from both repo and npm. Examples:

- Repo: `pdf-tools-site` | npm: _(not published)_ | Subdomain: `pdf.oriz.in`
- Repo: `astro-shell` | npm: `@chirag127/astro-shell` | Subdomain: _(none)_

## How to apply

When creating a new package:
1. Decide the slug once.
2. Use it as the GitHub repo name AND the npm `package.json#name` (with
   `@chirag127/` scope).
3. Subdomain (if any) gets its own shorter slug.

When renaming:
- Renaming the repo? Rename the npm package on next publish.
- Renaming the npm package? Rename the repo first.
- Never let them drift.

## Source

User-explicit preference per `~/AGENTS.md` AskUserQuestion learning rule.
