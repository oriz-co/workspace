---
type: rule
title: "Profile README must cross-link chirag127 \u2194 oriz-org"
description: "The chirag127 GitHub profile README must include a one-line cross-link\
  \ to oriz-org (the brand org), and the oriz-org profile README must include a 'Founded\
  \ by Chirag Singhal' line linking back. Both surfaces \u2014 personal account and\
  \ brand org \u2014 must lead a visitor to the other in one click."
tags:
- rule
- branding
- recruiter
- github
- readme
- profile
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
- rules/interaction/recruiter-strategy
- decisions/branding/oriz-org-rename-from-co
- decisions/architecture/general/projects-owner-own-forks-layout
---



# Profile README must cross-link chirag127 ↔ oriz-org

## Rule

Both GitHub profile README surfaces must cross-link to the other so a
visitor (recruiter or otherwise) who lands on either page reaches the
other in one click.

### On `github.com/chirag127` (personal profile README)

Required line in the README header section:

```markdown
Hi, I'm Chirag — I build [oriz.in](https://oriz.in) ([@oriz-org](https://github.com/oriz-org)).
```

The pinned-repo gallery on the personal profile may include repos
from `oriz-org/*` (pinning org repos is allowed and they DO appear on
the personal profile — recruiters skim pinned repos, see
[`recruiter-strategy`](./recruiter-strategy.md)).

### On `github.com/oriz-org` (org profile README via `.github/profile/README.md` in `oriz-org/.github`)

Required line in the README footer section:

```markdown
Founded and built by [Chirag Singhal](https://github.com/chirag127).
```

## Why both directions

Recruiters arrive from either entry point. LinkedIn → personal
GitHub. A search for `oriz.in` → org GitHub. Either route must
surface "this is one person's work + this is a real shipping product"
in under 10 seconds.

A recruiter scrolling chirag127 sees pinned org repos and "I build
oriz.in." A recruiter scrolling oriz-org sees real repos and
"Founded by Chirag Singhal." Both reads land the same conclusion.

## When to update

- On any org rename (e.g. when `oriz-co` became `oriz-org` on
  2026-06-24, both READMEs needed sed-replace)
- When the brand name itself changes (rare)
- When new pinned repos are added/removed
- When the founder/maintainer changes (currently never — solo)

## Anti-rule (do NOT do)

- Do NOT hide that the org is one person's work — recruiters
  research backgrounds; pretending to be a team backfires
- Do NOT list "Engineers: 5" or other padding on the org page
- Do NOT remove the personal-account cross-link "to make the org
  look bigger" — the personal account is the resume signal
