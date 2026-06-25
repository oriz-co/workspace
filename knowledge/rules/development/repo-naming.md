---
type: rule
title: Apply the role suffix to every new repo, and audit before publish
description: "Every chirag127/oriz* repo slug must end in -site, -ext, -vsc-ext, -cli,\
  \ -worker, -fn, -data \u2014 or be a clean npm-package name. Audit the slug before\
  \ the first push to a new repo."
tags:
- rules
- naming
- repo
- suffix
- audit
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- decisions/branding/repo-naming-suffixes
- rules/no-push-without-say-so
- runbooks/operations/rename-repo
---



# Apply the role suffix to every new repo, and audit before publish

When creating any new repo under `chirag127/oriz*`, apply the role
suffix from [`decisions/branding/repo-naming-suffixes.md`](../../decisions/branding/repo-naming-suffixes.md):
`-site` for websites, `-ext` for browser extensions, `-vsc-ext` for
VS Code extensions, `-cli` for command-line tools, `-worker` for
Cloudflare Workers, `-fn` for Firebase Cloud Functions, `-data` for
canonical-store data repos. NPM packages are the only allowed
suffix-free names because the `@chirag127/` scope already
disambiguates them. **Audit before publish: every `git push` to a
new repo URL must verify the repo slug ends in one of those suffixes,
OR is a clean npm-package name (no suffix).** A slug that doesn't
match is a naming mistake — rename via
[`runbooks/rename-repo.md`](../../runbooks/operations/rename-repo.md) before the
first push, not after, because GitHub repo redirects only fire after
the rename and won't retroactively rewrite a wrong name that was
already cloned.

## See also

- [`decisions/branding/repo-naming-suffixes.md`](../../decisions/branding/repo-naming-suffixes.md) — the full suffix table and migration plan
- [`runbooks/rename-repo.md`](../../runbooks/operations/rename-repo.md) — how to rename safely
- [`no-push-without-say-so.md`](../no-push-without-say-so.md) — the audit happens *before* the user-authorised push
