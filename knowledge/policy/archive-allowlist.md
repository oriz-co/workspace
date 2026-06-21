---
type: policy
title: "Repos never to archive"
description: "Audit-trail allowlist of every chirag127 repo that any archive script (or any future cleanup automation) MUST refuse to touch. Built from .gitmodules + npm publications + manual hand-adds for load-bearing infrastructure. Read by scripts/archive-stale-2021-2022.sh and any future archive scripts."
tags: [policy, repo, archive, allowlist, safety, family]
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
  - decisions/branding/oriz-urls-to-md-site-empty-placeholder
  - decisions/branding/repo-naming-suffixes
  - rules/never-delete-empty-placeholder-repos
  - rules/push-by-default
  - rules/repo-naming
---

# Repos never to archive

This allowlist is checked before any `gh repo archive` operation by any
script under [`scripts/`](../../scripts/). Anything listed here is
load-bearing in the `chirag127/oriz*` family — submodule, npm-published
package, or critical dev tooling — and MUST NOT be archived even if
GitHub stats (zero stars, no recent push) would otherwise mark it as a
cleanup candidate.

The same logic that protects [empty placeholder repos from
deletion](../rules/never-delete-empty-placeholder-repos.md) applies
here: low GitHub activity is not a signal of low importance in this
family. Most submodules are private-purpose code with audience of one
(me) and zero stars by design.

`gh repo archive` is reversible (unlike delete), but archived repos
lose Issues/PRs as a working surface, get an "Archived" banner that
confuses anyone landing from a doc link, and break agents that expect
the repo to be writable. The cost of archiving a load-bearing repo is
real even if recoverable.

## Generated from .gitmodules + npm + manual

### Master

- `chirag127/oriz`

### 11 site submodules (all `oriz-<name>-site`)

- `chirag127/home`
- `chirag127/blog-site`
- `chirag127/ncert`
- `chirag127/lore`
- `chirag127/cards-site`
- `chirag127/finance-tools-site`
- `chirag127/journal-site`
- `chirag127/dev-tools-site`
- `chirag127/image-tools-site`
- `chirag127/pdf-tools-site`
- `chirag127/me`

`oriz-urls-to-md-site` is currently an empty slug reservation — see
[`decisions/branding/oriz-urls-to-md-site-empty-placeholder.md`](../decisions/branding/oriz-urls-to-md-site-empty-placeholder.md).
Empty does not mean abandoned.

### Package submodules (npm-published or shared library)

- `chirag127/oriz-kit` (mounted at `packages/oriz-ui`)
- `chirag127/firebase-init`
- `chirag127/auth-ui`
- `chirag127/contact-form`
- `chirag127/sidebar`
- `chirag127/oriz-family`

### Active future submodules

- `chirag127/post-site` (active submodule at `packages/oriz-omnipost`)
- `chirag127/oriz-lifestream` (planned; will become a submodule when
  the lifestream service is wired)

### MCP servers + dev tooling (npm-published, load-bearing across the family)

- `chirag127/envpact-mcp` — secrets MCP server, listed in `.mcp.json` everywhere
- `chirag127/envpact-cli` — secrets CLI, used by the env-example sync workflow
- `chirag127/secenv-mcp` — predecessor MCP server for secrets, kept for back-compat
- `chirag127/agentflow` — parallel agent orchestrator used in dev

### Brand / org-level

- `chirag127/oriz-family` (already listed above; restated here for the
  family-wide grep).

## How to update this file

When a new repo joins the family — becomes a submodule, gets
npm-published under `chirag127`, or becomes a critical dev-tool —
add it here in the **same chat / same PR** that introduces the
dependency. The
[self-update rule](../rules/self-update-rule.md) applies.

The
[`scripts/archive-stale-2021-2022.sh`](../../scripts/archive-stale-2021-2022.sh)
script (and any future archive scripts) reads this file as input by
grepping for `chirag127/<name>` bullets, taking the union of every
slug found, and refusing to archive anything in that set. Adding a
new bullet here is the only way to extend the allowlist — there is no
secondary list inside the script.

## Defense in depth

The archive script also hard-skips any repo whose name starts with
`oriz-`, regardless of whether it appears in this file. That
double-coverage means:

1. A new `oriz-*` repo that the agent forgot to add here is still
   protected.
2. This file is the audit trail; the script's `oriz-` prefix check is
   the belt-and-braces fallback.

If the two ever disagree (e.g. an `oriz-` repo is intentionally
deprecated and should be archived), update **both** the script and
this file in the same commit, with a one-line `## Removed from
allowlist` section here noting the slug, the date, and the
authorising user message.

## Cross-refs

- [`../decisions/branding/oriz-urls-to-md-site-empty-placeholder.md`](../decisions/branding/oriz-urls-to-md-site-empty-placeholder.md) — canonical "empty but reserved" example
- [`../rules/never-delete-empty-placeholder-repos.md`](../rules/never-delete-empty-placeholder-repos.md) — sibling rule, deletion side
- [`../rules/push-by-default.md`](../rules/push-by-default.md) — outward-effect carve-out that gates `gh repo archive`
- [`../decisions/branding/repo-naming-suffixes.md`](../decisions/branding/repo-naming-suffixes.md) — slug taxonomy this allowlist is built around
- [`../../scripts/archive-stale-2021-2022.sh`](../../scripts/archive-stale-2021-2022.sh) — first script that reads this file
