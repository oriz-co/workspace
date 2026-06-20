---
type: rule
title: "User prefers deletion over archive for superseded repos (same-day migration)"
description: "When a repo is superseded by another within the same day or migration session, delete it rather than archive. Cleaner repo listing, no zombie repos."
tags: [taste, mcq-learned, repos, github]
timestamp: 2026-06-20
related: [never-delete-empty-placeholder-repos, user-prefers-same-name-repo-and-npm]
---

# User prefers deletion over archive for superseded repos

## The rule

When a repo is superseded by another (renamed, replaced, or rolled into
a different repo) **within the same day or active migration session**,
delete the superseded repo rather than archive it.

## Same-day exception to never-delete-empty-placeholder-repos

The family rule [`never-delete-empty-placeholder-repos.md`](./never-delete-empty-placeholder-repos.md)
treats empty repos as deliberate slug reservations and requires explicit
per-repo authorization for `gh repo delete`. This rule **adds an
exception**: empty or stub-only repos that were superseded the same day
they were created (or during an active migration session) can be
deleted without the standard cooling-off, when the user confirms via
MCQ.

## Evidence

| Date | Repos deleted | Reason |
|---|---|---|
| 2026-06-20 | `oriz-urls-to-md-site` | Content rolled into `dev-tools-site` |
| 2026-06-20 | `oriz-kit` | Superseded by `kit` (same role, drop oriz prefix) |
| 2026-06-20 | `oriz-family` | Auto-redirected to `family` (same slug, was a rename) |

User confirmed all three deletions via MCQ in the same session they were
created. The family-rule cooling-off was waived because the supersession
was unambiguous within minutes of creation.

## When NOT to delete

- Repo has external clones / forks / stars beyond the user themselves.
- Repo has been live for >24 hours.
- Repo has any commits / issues from non-owners.
- Repo is referenced from external blog posts / résumé / npm
  `repository` field of a published package.

In those cases: archive (`gh repo archive`), don't delete.

## How to apply

When the user requests "delete unneeded repos after migration":
1. List the candidates as a multi-select MCQ.
2. For each, check: created same day? Empty or stub-only? No external
   refs? If all yes — delete is safe.
3. Run `gh repo delete <slug> --yes` per confirmed candidate.
4. Update `.gitmodules` and submodule paths in the umbrella repo.
5. Commit + push the umbrella with a clear message naming what was deleted.

## Source

Mined from MCQ confirmation 2026-06-20 per `~/AGENTS.md` AskUserQuestion
learning rule.
