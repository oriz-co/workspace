---
type: decision
title: "cs-me-app scope \u2014 personal canon at me.oriz.in / cs.oriz.in"
description: "The personal site at me.oriz.in (aliased as cs.oriz.in to the same site).\
  \ Maximal personal canon: resume + project portfolio + writing + contact + reading\
  \ log + music + books-read + photo dump + movies/watch list. Pulls from knowledge/\
  \ where possible. Wider scope than a classic dev personal site \u2014 treat as the\
  \ user's personal everything-page."
tags:
- decision
- app
- cs-me
- personal-site
- canon
- oriz-cs-me-app
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/general/oriz-me-single-site-not-split
- decisions/architecture/apps/home-app-shape
- rules/interaction/user-prefers-wider-coverage
---



# cs-me-app scope

## Domains

`me.oriz.in` AND `cs.oriz.in` — both DNS-aliased to the same site (`repos/c127/own/prod/apps/personal/cs-me-app/`). Two URLs, one app, identical content. `me.oriz.in` is the canonical; `cs.oriz.in` is the personal-initials variant.

## What lives here

Maximal personal canon. Wider than the classic dev personal site. Sections:

| Section | Source |
|---|---|
| Resume / CV | Render-CV from canonical YAML |
| Project portfolio | Auto-fed from chirag127 GH repos + curated picks |
| Writing | Posts mirror from `blog.oriz.in` filtered by author |
| Contact | Web3Forms-backed form + social handles |
| Reading log | Books-read + currently-reading (manual entry or Goodreads import) |
| Music | Listening history (last.fm + Spotify Wrapped digest) |
| Books read | Year-grouped reading list |
| Photo dump | Lightweight photo gallery (CF Pages-hosted images) |
| Movies / watch list | Watched + want-to-watch; TMDb-enriched |
| Lifestream | Auto-fed JSONL canonical store (commits, npm publishes, builds, etc.) |

Sections pull from the family `knowledge/` bundle where the data exists there (e.g. the user's "100-year strategy" essay lives in master `knowledge/decisions/content/`, gets rendered on `/writing/100-year-strategy`).

## Treat as personal canon

This is the "everything about me, in one place" site. When in doubt about whether some personal-data surface belongs on cs-me-app vs a dedicated subdomain → **default to cs-me-app**, per [[decisions/architecture/oriz-me-single-site-not-split]] and the wider-coverage taste preference [[rules/user-prefers-wider-coverage]].

## Cross-refs

- The single-site-not-split lock → [[decisions/architecture/oriz-me-single-site-not-split]]
- home-app links here as section 5 of the grid → [[decisions/architecture/home-app-shape]]
- Per-app knowledge bundle for this app (richest in the family) → `repos/c127/own/prod/apps/personal/cs-me-app/knowledge/`
