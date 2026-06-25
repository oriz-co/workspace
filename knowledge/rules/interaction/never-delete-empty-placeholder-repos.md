---
type: rule
title: Never delete an empty placeholder repo without explicit user authorisation
description: An empty repo in the chirag127/oriz* family is a deliberate slug reservation,
  NOT a cleanup candidate. Before running gh repo delete (or any destructive remote
  action) against any family repo, even an empty one, the agent MUST get an explicit,
  repo-named confirmation from the user.
tags:
- rule
- repo
- delete
- placeholder
- slug-reservation
- family
- safety
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- decisions/branding/oriz-urls-to-md-site-empty-placeholder
- decisions/branding/repo-naming-suffixes
- rules/development/push-by-default
- rules/development/repo-naming
- runbooks/operations/rename-repo
---



# Never delete an empty placeholder repo without explicit user authorisation

## What

An empty repo in the `chirag127/oriz*` family is a deliberate **slug
reservation**, not a cleanup candidate. Before running
`gh repo delete <slug>` (or any equivalent destructive remote action —
`gh repo transfer`, archive-then-delete, branch deletion on `main`,
mass `git push --delete`) against ANY family repo — even one that
contains no application code beyond a README and LICENSE — the agent
MUST obtain explicit, repo-named, current-conversation confirmation
from the user.

"It looked empty so I assumed it was abandoned" is not a defence.
Empty in this family means **reserved**, not **dead**.

## Why

- **Slugs are scarce.** Once a `chirag127/oriz-<name>` repo is
  deleted, the name is recoverable only by recreating the repo —
  there's no penalty for being wrong, but in the meantime any
  submodule pointing at the deleted repo is broken, every PR / issue
  link is dead, and the GitHub auto-redirect for renamed-then-deleted
  URLs evaporates.
- **The family treats empty repos as deliberate.** See
  [`decisions/branding/oriz-urls-to-md-site-empty-placeholder.md`](../../decisions/branding/oriz-urls-to-md-site-empty-placeholder.md)
  for the canonical example: `oriz-urls-to-md-site` is empty today,
  reserved for a URL → Markdown scraper feature that hasn't shipped
  yet, and explicitly named "do not delete" by the user.
- **Outward-effect actions are already gated** by
  [`rules/push-by-default.md`](../development/push-by-default.md) — `gh repo
  delete` is on the explicit confirmation list. This rule narrows
  the carve-out so "the repo is empty so the confirmation isn't
  needed" can never be argued.
- **The audit trail matters.** Even if a deletion is later reversed
  (rare and lossy), the gap in master pointer history, in cross-repo
  link graphs, and in the family's
  [knowledge log](../../log.md) is permanent.

## How to apply

Before any destructive remote action against a family repo:

1. **List what would change** — repo slug, current submodule paths
   that reference it, README links, any cross-repo link in
   `knowledge/`.
2. **Surface that list to the user** with the proposed command
   verbatim.
3. **Wait for explicit, repo-named confirmation.** "Yes delete it" is
   sufficient if the user named the repo in the previous turn;
   ambiguous "go ahead" is not.
4. **Only then** run the command.
5. **Log the deletion** in
   [`knowledge/log.md`](../../log.md) with the reason and the user
   message that authorised it.

## What does NOT count as authorisation

- A general "clean up the org" / "tidy things" instruction.
- An instruction that names a different repo.
- An instruction issued in a previous session that didn't follow
  through to deletion.
- The repo being empty, archived, or unused.
- A README that says "TODO" or "reserved".

## Same-day migration exception

When a repo is **superseded the same day it was created** (or during an
active migration session) by another repo with the same role, the
standard cooling-off is waived **if the user confirms the deletion via
MCQ in that same session**. See
[`user-prefers-deletion-over-archive.md`](./user-prefers-deletion-over-archive.md).

Conditions for the exception (all must hold):

- Repo created < 24 hours ago, OR created during the current session
- No external clones, forks, or stars beyond the user themselves
- No commits or issues from non-owners
- Not referenced from external blog posts / résumé / npm `repository` field of a published package
- User confirmed deletion via MCQ (not implicit "clean up" instruction)

This exception does NOT cover:

- Repos older than 24 hours
- Repos with any external traction
- Repos where the deletion is implicit (e.g. "clean up unused stuff" — no)

When in doubt, fall back to archive (`gh repo archive`) instead of delete.

## Cross-references

- [oriz-urls-to-md-site empty placeholder decision](../../decisions/branding/oriz-urls-to-md-site-empty-placeholder.md) — the canonical empty-but-reserved repo
- [Repo naming suffixes](../../decisions/branding/repo-naming-suffixes.md) — the slug taxonomy this rule defends
- [Push-by-default rule](../development/push-by-default.md) — outward-effect carve-out this rule narrows
- [Repo naming rule](../development/repo-naming.md) — audit before publish; audit before delete is the symmetric ask
- [Rename repo runbook](../../runbooks/operations/rename-repo.md) — the right way to retire a slug (rename, don't delete)
- [Archive allowlist](../../policy/archive-allowlist.md) — sibling protection on the archive side; same set of repos, same logic
