---
type: decision
title: "oriz-me added to the family as the 11th site"
description: "On 2026-06-19, oriz-me (me.oriz.in — personal digital twin / lifestream) was added as a submodule under sites/, bringing the site count to 11."
tags: [oriz-me, family, lifestream, sites, milestone]
timestamp: 2026-06-19
format_version: okf-v0.1
status: active
related:
  - decisions/content/100-year-strategy-locked
  - decisions/architecture/lifestream-jsonl-canonical
  - decisions/process/v2-design-implementation
  - design/oriz-me
---

# oriz-me added to the family as the 11th site

## Decision

On 2026-06-19, `oriz-me` was added to the master `chirag127/oriz`
repo as the 11th site, mounted as a git submodule at
`projects/oriz/own/prod/apps/personal/oriz-cs-me-app/`. It hosts at `me.oriz.in` and serves as Chirag's
personal digital-twin / lifestream — career, code, books, music,
numeric-only journal aggregates per [journal-stays-auth-gated](../content/journal-stays-auth-gated.md).

## Why

`oriz-me` is the family's primary impress-recruiters surface and the
secondary-mission's lifelong personal archive. It needed to join the
family's shared infra (umbrella API, oriz-kit, Cloudflare Pages
deploy, GitHub Pages mirror, AdSense apex, master matrix CI) rather
than running in its own ecosystem. Adding it as a submodule applies
the same workflow patterns the other 10 sites already use, so a
single mental model covers everything.

## Implications

- Site count goes from 10 to 11 across all family-level docs.
- `me.oriz.in` deploys to Cloudflare Pages free; static GitHub Pages mirror at `chirag127.github.io/oriz-me-site` (per the 100-year strategy §16).
- `oriz-me` carries a separate canonical-store concept: the `chirag127/oriz-me-data` git repo (JSONL year-files), distinct from any other site.
- `oriz-me` brings the locked 100-year strategy doc into the family. The doc's 16 points cascade into family-wide decisions where they apply (e.g. GitHub Pages mirror everywhere).
- The site has its own v2 design brief at `knowledge/design/oriz-me.md` and its own per-app `knowledge/` bundle inside the submodule at `projects/oriz/own/prod/apps/personal/oriz-cs-me-app/knowledge/`.
- `me.oriz.in` does NOT publish journal entries — entries live at `journal.oriz.in` (separate site). Journal numeric aggregates surface on `me.oriz.in/me`.

## Cross-refs

- [100-year strategy locked](../content/100-year-strategy-locked.md)
- [Lifestream JSONL canonical](../architecture/lifestream-jsonl-canonical.md)
- [Journal stays auth-gated](../content/journal-stays-auth-gated.md)
- [v2 design implementation](../process/v2-design-implementation.md)
- [oriz-me design brief](../../design/oriz-me.md)
