---
type: decision
title: "oriz-urls-to-md-site stays as an empty placeholder repo — DO NOT delete"
description: "The chirag127/oriz-urls-to-md-site repo (renamed today from oriz-urls-to-md per the suffix lock) is an empty slug reservation for a future URL→Markdown scraper tool. The repo, the submodule path sites/oriz-urls-to-md, and the slug all stay. No cleanup script may delete it."
tags: [branding, repo, placeholder, urls-to-md, reservation, family]
timestamp: 2026-06-20
format_version: okf-v0.1
status: superseded
superseded_by: rules/user-prefers-deletion-over-archive
related:
  - decisions/branding/repo-naming-suffixes
  - decisions/content/urls-to-md-folds-into-dev-tools
  - rules/never-delete-empty-placeholder-repos
  - rules/user-prefers-deletion-over-archive
  - rules/repo-naming
  - runbooks/rename-repo
---

# oriz-urls-to-md-site stays as an empty placeholder repo — DO NOT delete

> **SUPERSEDED 2026-06-20 evening.** The repo was deleted same day under
> the same-day-migration exception now codified at
> [`rules/user-prefers-deletion-over-archive.md`](../../rules/user-prefers-deletion-over-archive.md).
> The URL→Markdown tool was rolled into `chirag127/dev-tools-site` as
> two routes (URL→MD + URLs→MD batch), per
> [`content/urls-to-md-folds-into-dev-tools`](../content/urls-to-md-folds-into-dev-tools.md).
> The slug `chirag127/oriz-urls-to-md-site` no longer exists.
>
> The original "do not delete" decision below is preserved for audit
> trail. The same-day exception applied because (a) repo had only stub
> README+LICENSE, (b) <24 hours since suffix-rename, (c) user confirmed
> deletion via MCQ.

---

# oriz-urls-to-md-site stays as an empty placeholder repo — DO NOT delete

## Decision

`chirag127/oriz-urls-to-md-site` (renamed 2026-06-20 from
`chirag127/oriz-urls-to-md` per
[`decisions/branding/repo-naming-suffixes.md`](./repo-naming-suffixes.md))
exists as a deliberate **empty slug reservation**. The repo MUST NOT
be deleted, even though it currently contains no application code.

User direction (verbatim):

> *"Keep the orders URL to MD file and I will make the URL, shoe
> empty repository and don't delete it. Don't delete that repository."*

(Speech-to-text rendered "URLs to MD" as "orders URL to MD" and "show"
as "shoe" — the intent is the `oriz-urls-to-md` slug + an empty repo
that is preserved as-is until populated.)

## Why

- **The slug is valuable.** `urls-to-md` is the most natural name for
  a URL → Markdown scraper / converter tool. Releasing it now risks
  someone else (or a future me) picking the same name elsewhere and
  creating a clash when the feature actually ships.
- **The submodule path is wired.** `sites/oriz-urls-to-md` is already
  registered in the master repo's `.gitmodules`, and the master pointer
  bump pattern from
  [`runbooks/bump-submodule-pointer.md`](../../runbooks/bump-submodule-pointer.md)
  works against it without special-casing. Removing the repo would
  break the submodule entry and force a `.gitmodules` edit + pointer
  rewrite.
- **The 100-year strategy** ([`decisions/content/100-year-strategy-locked.md`](../content/100-year-strategy-locked.md))
  treats every reserved slug as part of the surface — gaps don't
  serve the long view.
- **Empty repos cost nothing.** No CI minutes burn on an empty repo;
  GitHub free tier doesn't care. The cost of deletion (slug loss +
  submodule break + audit-trail loss) is strictly higher than the cost
  of keeping it.

## What "empty" looks like today

- README.md — single paragraph "reserved slug; tool TBD" with a link
  back to this decision file.
- LICENSE — MIT, family default.
- `.gitignore` — Node default.
- No `package.json`, no `src/`, no CI workflows.
- Branch: `main` only, per
  [`rules/one-branch-only.md`](../../rules/one-branch-only.md).

## When to populate

Trigger conditions, any one suffices:

1. The user explicitly says "build oriz-urls-to-md" / "the URL → MD
   tool".
2. A dependency in another family site needs a Markdown rendering of
   an arbitrary URL — at that point this slug becomes the home for
   the shared converter rather than rolling it as inline code in the
   consuming site.
3. The
   [`decisions/content/urls-to-md-folds-into-dev-tools.md`](../content/urls-to-md-folds-into-dev-tools.md)
   migration starts — `urls-to-md` may either migrate INTO
   `oriz-dev-tools-site` (current plan) or stay separate (this slug
   reservation keeps that option open).

## Likely future stack (when populated)

These are notes, not commitments — re-evaluate when the trigger fires:

- **Fetcher:** Cloudflare Worker (free tier, fits the family compute
  layer per [`services/compute/cloudflare-workers.md`](../../services/compute/cloudflare-workers.md)).
- **Readability extraction:** [`mozilla/readability`](https://github.com/mozilla/readability) — same library
  Firefox uses for Reader Mode. OSS, MIT, no card.
- **HTML → Markdown:** [`turndown`](https://github.com/mixmark-io/turndown) — OSS, MIT, no card.
- **Hosting:** Cloudflare Pages per
  [`decisions/infrastructure/cloudflare-pages-for-all-sites.md`](../infrastructure/cloudflare-pages-for-all-sites.md).
- **Subdomain:** `urls-to-md.oriz.in` (or fold into
  `dev-tools.oriz.in/urls-to-md` per the
  [content fold decision](../content/urls-to-md-folds-into-dev-tools.md)).

## Implications

- **No "cleanup empty repos" script may touch this slug.** See
  [`rules/never-delete-empty-placeholder-repos.md`](../../rules/never-delete-empty-placeholder-repos.md)
  — the family-wide rule born from this decision.
- **The submodule entry stays.** Master repo's
  [`.gitmodules`](../../../.gitmodules) keeps `sites/oriz-urls-to-md`
  pointing at the renamed remote. The pre-rename URL works via
  GitHub's auto-redirect, but the submodule URL gets bumped to the
  new slug at the next master commit anyway per
  [`runbooks/rename-repo.md`](../../runbooks/rename-repo.md).
- **CI noise stays off.** The empty repo gets no `.github/workflows/`
  until populated — no daily CodeQL run, no Dependabot pings on a
  dependency-less repo.
- **README must point back here.** Any agent inspecting the empty
  repo first lands on a README that links to this decision file, so
  the "is this dead or reserved?" question answers itself.
- **Don't run any 'cleanup empty repos' scripts that would touch this
  slug** — restated for emphasis. The family has a hard rule about
  this; see the rule file linked above.

## Cross-refs

- [Repo naming suffixes lock](./repo-naming-suffixes.md)
- [urls-to-md folds into dev-tools (content fold plan)](../content/urls-to-md-folds-into-dev-tools.md)
- [Never delete empty placeholder repos rule](../../rules/never-delete-empty-placeholder-repos.md)
- [Repo naming rule (audit before publish)](../../rules/repo-naming.md)
- [Rename repo runbook](../../runbooks/rename-repo.md)
- [Push-by-default rule (outward-effect carve-out)](../../rules/push-by-default.md)
- [Archive allowlist (sibling protection — never archive either)](../../policy/archive-allowlist.md)
