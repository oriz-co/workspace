---
type: rule
title: Conventional commits
description: 'Every commit message uses a Conventional Commits prefix: feat, fix,
  chore, docs, refactor, test.'
tags:
- rules
- git
- commits
- style
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- rules/development/one-branch-only
---



# Conventional commits

Every commit in every repo uses a [Conventional Commits](https://www.conventionalcommits.org/)
prefix. The allowed types in this family are:

| Prefix | When to use |
|---|---|
| `feat:` | A new feature for users |
| `fix:` | A bug fix for users |
| `chore:` | Tooling, deps, infra, anything not user-facing |
| `docs:` | Documentation only — README, AGENTS.md, knowledge/ |
| `refactor:` | Code change that neither fixes a bug nor adds a feature |
| `test:` | Adding or updating tests only |

## Why

The single-branch ([`one-branch-only`](./one-branch-only.md)) workflow
means there are no PR titles to summarise change intent. The commit
message IS the changelog. Without a structured prefix, scrolling
`git log` is unreadable.

Tooling also benefits: release-please, conventional-changelog, and
any future automation can parse the log directly.

## Optional scope

Add a scope in parentheses when the change is localised:

- `feat(books): add NCERT class-12 datasheet`
- `fix(api): handle missing reCAPTCHA token`
- `chore(submodule): bump oriz-me to <sha>`
- `docs(knowledge): add jsonl-canonical-store decision`

## Body

Optional. Use it when the *why* is non-obvious. Don't restate the
*what* — the diff already shows that.

## Exceptions

None for normal commits. Merge commits (rare in single-branch land,
but possible when pulling from a fresh-clone branch) follow git's
default format.

## See also

- AGENTS.md "Git" section
- [`one-branch-only.md`](./one-branch-only.md)
