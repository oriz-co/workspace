---
type: decision
title: "Project management \u2014 GitHub Projects only"
description: "Locked 2026-06-20: family-wide project / task management lives on a\
  \ single GitHub Projects board on chirag127/oriz master, with kanban + table + roadmap\
  \ views. Notion, Obsidian Tasks, Linear, ClickUp, Asana, Trello \u2014 all REJECTED.\
  \ The knowledge/ OKF bundle covers documentation; GitHub Projects covers tasks."
tags:
- decisions
- architecture
- project-management
- github-projects
- kanban
- roadmap
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- decisions/architecture/bug-tracker-github-issues-only.md
- decisions/architecture/general/cms-markdown-in-repo-only
- decisions/process/okf-as-canonical-format
- rules/interaction/no-card-on-file
- rules/infrastructure/no-subscriptions
---



# Project management — GitHub Projects only

## Decision

Family-wide project / task management runs on a **single GitHub
Projects board** on `chirag127/oriz` (the master repo). The board
ships three views: **kanban** (`Backlog → In progress → In review →
Done`), **table** (sortable / filterable across all custom fields),
and **roadmap** (Gantt-style timeline grouped by `Iteration`).

Notion, Obsidian Tasks, Linear, ClickUp, Asana, Trello, Monday.com,
Height, Basecamp, Todoist — **all REJECTED**.

The split between knowledge artifacts and tasks is firm:

- **Documentation / decisions / runbooks / glossary** lives in the
  [`knowledge/` OKF bundle](../../process/okf-as-canonical-format.md)
  inside the master repo.
- **Tasks / sprint plans / roadmap / status** lives in the GitHub
  Projects board on the same master repo.

User direction 2026-06-20: "GitHub Projects only — locked,
decision file only."

## Why

- **Free, GitHub-native, no card.** Projects v2 is part of every
  GitHub account at zero cost — no quota cliff at family scale,
  no card on file ([`rules/no-card-on-file`](../../../rules/interaction/no-card-on-file.md) +
  [`rules/no-subscriptions`](../../../rules/infrastructure/no-subscriptions.md)).
- **Lives next to the code + issues.** Issues filed per
  [`bug-tracker-github-issues-only`](./bug-tracker-github-issues-only.md)
  attach directly to project items via the same web UI;
  cross-repo issues feed into one board without API plumbing.
- **One source of truth for "what's next".** The user has one
  brain working across 11 sites + N extensions + N packages —
  one board. No Notion-vs-Linear-vs-Obsidian fragmentation.
- **OKF bundle covers documentation.** Per
  [`okf-as-canonical-format`](../../process/okf-as-canonical-format.md),
  the family already has a structured documentation system in
  the repo. A separate Notion workspace would duplicate
  glossary / decisions / runbooks against the OKF bundle and
  inevitably drift.
- **Markdown-in-repo posture extends naturally.** Per
  [`cms-markdown-in-repo-only`](./cms-markdown-in-repo-only.md),
  content lives in git. Tasks live next to the issues that
  back them. Both surfaces avoid SaaS lock-in.

## Why not the rejected options

| Tool | Why rejected |
|---|---|
| Notion | Free Personal tier caps blocks / file uploads; Team tier requires card; second editorial surface that drifts vs. the OKF `knowledge/` bundle |
| Obsidian Tasks | Local-vault-first model fights the everything-public-OSS posture; sync requires Obsidian Sync subscription or third-party plugin reliability |
| Linear | Same rejection as in [`bug-tracker-github-issues-only`](./bug-tracker-github-issues-only.md) — caps + card + duplicate tracker |
| ClickUp | Card past free; UI overhead; second source of truth |
| Asana / Monday.com | Both card-required at family scale |
| Trello | Card-shaped, no issue-link, no roadmap view on free tier |
| Height / Basecamp | Card past free / Basecamp paid-only |
| Todoist | Free tier caps projects; card past 5 projects; not multi-repo-aware |
| Jira | Already rejected for issues; same applies for projects |

## Implications

### Board structure

**Single board** at `https://github.com/users/chirag127/repos/<n>`
(user-scoped so it spans every repo in the org). Item sources:

- Issues from any `chirag127/oriz*` repo (auto-add via workflow).
- Draft items typed directly in the board (convert to issue when
  scoped to a specific repo).
- Pull requests from any `chirag127/oriz*` repo.

### Custom fields

| Field | Type | Values |
|---|---|---|
| `Status` | single-select | `Backlog` / `In progress` / `In review` / `Blocked` / `Done` |
| `Priority` | single-select | `P0 (now)` / `P1 (this week)` / `P2 (this month)` / `P3 (someday)` |
| `Site` | single-select | every active `chirag127/oriz*` repo + `family-wide` |
| `Iteration` | iteration | 1-week iterations rolling forward |
| `Effort` | single-select | `XS` / `S` / `M` / `L` / `XL` |
| `Blocked by` | text | issue / PR ref or external dependency |

### Views

- **Kanban** (default) — grouped by `Status`, filtered to current
  `Iteration`.
- **Table** — full sortable / filterable grid; the spreadsheet
  view for triage sweeps.
- **Roadmap** — grouped by `Iteration`, scaled by `Effort`,
  Gantt-style timeline.
- **By site** — table view filtered to one `Site` for site-specific
  status checks.

### Automation

- Issue opened on any `chirag127/oriz*` repo → auto-added to board
  with `Status: Backlog` (workflow file in `chirag127/oriz/.github/workflows/`).
- PR opened → auto-added with `Status: In review`.
- PR merged → linked issue auto-set to `Status: Done`.
- All automations use built-in GitHub Projects workflows — no
  third-party action, no external script.

### What we don't do

- **No second project tool** — even for "personal" / "scratch" /
  "ideas". The board's `Backlog` is the single inbox.
- **No external roadmap site** (Productboard / Canny / Trello) for
  public roadmap surfacing — the GitHub Projects board itself is
  shareable as a public URL when the user opts to make it public.
  Until then, roadmap stays internal-but-everyone's-an-internal
  given the OSS posture.
- **No time tracking on the board.** That lives separately under
  [`time-tracking-toggl-plus-wakatime`](../time-tracking-toggl-plus-wakatime.md);
  the Projects board tracks plan + status, not effort actuals.
- **No Notion / Obsidian "second brain"** for project context.
  The OKF bundle is the second brain; the Projects board is the
  active work surface.

### Knowledge vs. tasks split

| Surface | Lives in | Examples |
|---|---|---|
| Architectural decisions | `knowledge/decisions/` | "We use GitHub Projects" (this file) |
| Service catalog | `knowledge/services/` | "Toggl Track is the manual time tracker" |
| Glossary / concepts | `knowledge/glossary/` | What `oriz-kit` means |
| Runbooks | `knowledge/runbooks/` | How to rotate a leaked secret |
| **Active tasks** | **GitHub Projects board** | "Wire up Klaro on oriz-blog-site" |
| **Bugs** | **GitHub Issues per repo** | "Auth callback returns 500 on Edge" |
| **Roadmap** | **GitHub Projects roadmap view** | Q3 milestone targets |

## Revisit trigger

Re-open this decision only if **any one** of these holds:

1. GitHub Projects v2 develops a quota cliff hitting family scale
   (no signal of this in 2026-06).
2. A non-GitHub collaborator joins and explicitly cannot work on
   the Projects board.
3. The user explicitly asks for a swap.

Until then, GitHub Projects is the answer.

## Cross-refs

- [Bug tracker — GitHub Issues only](./bug-tracker-github-issues-only.md)
- [CMS markdown-in-repo only](./cms-markdown-in-repo-only.md) — sister "no SaaS sidecar" decision for content
- [OKF as canonical format](../../process/okf-as-canonical-format.md) — `knowledge/` bundle covers docs
- [Per-repo CI workflows](../../process/per-repo-ci-workflows.md) — workflows live in each repo, not a central scheduler
- [Time tracking — Toggl + Wakatime](../time-tracking-toggl-plus-wakatime.md) — separate concern, separate tools
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
- [No subscriptions rule](../../../rules/infrastructure/no-subscriptions.md)
