---
type: rule
title: 'Recruiter strategy: optimize pinned repos + contribution graph, not the repo
  list'
description: "GitHub recruiters skim a profile in 30\u201360 seconds: pinned repos\
  \ (you choose them), contribution graph (greens from any owned/contributed repo),\
  \ bio. They rarely scroll the Repositories tab. Layout decisions should optimize\
  \ for that \u2014 keep the personal account populated and cross-linked to the brand\
  \ org, but don't reorganize the world around the assumption that recruiters browse\
  \ repo lists."
tags:
- rule
- branding
- recruiter
- github
- profile
- signal
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
- rules/interaction/profile-readme-cross-link
- decisions/branding/oriz-org-rename-from-co
- decisions/branding/cs-me-app-moved-to-chirag127
- decisions/architecture/general/projects-owner-own-forks-layout
---



# Recruiter strategy — pinned + graph wins; repo list is a tiebreaker

## Rule

When making layout/branding/repo-ownership decisions that affect
"how this looks to a recruiter," optimize for these three surfaces in
this order:

1. **Pinned repos** (6 max, you choose them) — biggest single signal.
   Pinning an `oriz-org/*` repo from `chirag127` works fine; the org
   doesn't hide it.
2. **Contribution graph** — green squares from any repo where you're
   a member, public or private. Org commits count.
3. **Profile README** — first thing visitors read; must cross-link
   to the brand org (see [`profile-readme-cross-link`](./profile-readme-cross-link.md)).

After those, decreasing in importance:

4. Bio (short, name + role + brand link)
5. Repositories tab — only personal repos appear; rarely scrolled
6. Organizations sidebar — recruiters notice; click-through rare

## What this rule rejects

- "Move everything to chirag127 so it appears in the repo list" —
  the repo list is rarely the deciding factor. Org repos surface
  through pinned + graph.
- "Move everything to the org so the brand looks bigger" — empties
  the personal account; chirag127 then looks dead.
- "Add a fake teammate to the org" — recruiters research; backfires.

## What this rule supports

- The owner-split layout
  ([`projects-owner-own-forks-layout`](../../decisions/architecture/general/projects-owner-own-forks-layout.md))
  — keeps both surfaces populated. Brand work under `oriz-org/`,
  personal work under `chirag127/`. Each surface tells the right
  story.
- Moving `oriz-cs-me-app` off the brand org back to chirag127
  ([`cs-me-app-moved-to-chirag127`](../../decisions/branding/cs-me-app-moved-to-chirag127.md))
  — the personal account needs 5–10 real repos to look alive.

## Sources of evidence

This is a belief, not a measured fact. Sources:

- Every dev-hiring engineering-blog post mentions a 30–60 sec
  profile skim (search "github profile what recruiters look at")
- GitHub's product team has stated pinned repos drive most profile
  engagement (GitHub blog, 2020+)
- The repo list page has no recruiter-targeted ranking — repos are
  sorted by update time, not relevance

If a measurement contradicts this rule (e.g. GitHub Insights shows
recruiters scrolling repo lists), revise.

## How this rule got formed

Grilled on 2026-06-24 during the layout migration. The concern
"recruiters won't see my work if it's under an org name they don't
recognize" surfaced. Resolution: pinned repos survive the move to
org. Graph counts org commits. So the move is safe. This rule
captures the underlying *taste*: optimize the 3 high-signal surfaces,
not the long-tail ones.
