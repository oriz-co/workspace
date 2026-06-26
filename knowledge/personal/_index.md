---
type: index
title: 'Personal PKM index — PARA + Zettelkasten hybrid'
description: PARA top-level folders for active work; flat zettel/ for atomic notes. Hybrid pick from 2026-06-27 research.
tags: [pkm, personal, para, zettelkasten]
timestamp: 2026-06-27
format_version: okf-v0.1
status: active
---

# Personal — PARA + Zettelkasten hybrid

Per 2026 research (see `.staging/research-okf-pkm-compression-2026-06-27.md`).

## Layout

```
personal/
├── projects/   # active, time-boxed, with deadline
├── areas/      # ongoing responsibilities (health, finance, career, learning)
├── resources/  # reference material, articles saved for later
├── archive/    # done projects, expired areas, dead resources
└── zettel/     # atomic notes — flat dir, one idea per file
```

## Conventions

- **Projects**: `projects/<short-slug>/` with `_index.md` per project
- **Areas**: `areas/<area>.md` — one file per area, append daily
- **Resources**: `resources/<source>-<slug>.md`
- **Archive**: move when done; `git rm` if truly dead (per knowledge-deletion-not-supersession applied at personal level too)
- **Zettel**: flat. Each file = one atomic idea. Heavy internal linking via `[[wiki]]` or relative `[md](path)`. Filename: `<short-slug>.md` (NOT date-stamped; titles change but ideas persist)

## Daily notes

`daily/YYYY-MM-DD.md` — capture + triage. Goes through Inbox first, then routed to Projects/Areas/Zettel.

## Privacy

PUBLIC repo. Discipline-only per `decisions/architecture/security/personal-notes-public-discipline-2026-06-27.md`. NO secrets, health-detail, finance-detail, third-party PII.
