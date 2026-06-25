---
type: decision
title: "Bug tracker \u2014 GitHub Issues only"
description: "Locked 2026-06-20: every site / extension / package / worker / data\
  \ repo uses its own GitHub Issues as the sole bug tracker. Linear, Trello, Jira,\
  \ Plane.so, Asana, Height \u2014 all REJECTED. Cross-repo triage via repo:org searches.\
  \ Free unlimited, GitHub-native, integrates with PRs and commits via #123 syntax."
tags:
- decisions
- architecture
- bug-tracker
- github-issues
- intake
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- decisions/architecture/project-mgmt-github-projects-only.md
- decisions/process/per-repo-ci-workflows
- decisions/process/one-branch-only-rule
- rules/development/one-branch-only
- rules/interaction/no-card-on-file
- rules/infrastructure/no-subscriptions
---



# Bug tracker — GitHub Issues only

## Decision

Every repo in the `chirag127/oriz*` family uses its **own GitHub
Issues tab** as the sole bug intake surface. Bugs against
`oriz-blog-site` go to `chirag127/blog-site/issues`; bugs
against `@chirag127/oriz-kit` go to that package's repo; bugs
against the `s.oriz.in` Worker go to `chirag127/oriz-s-worker/issues`.

Linear, Trello, Jira, Plane.so, Asana, Height, ClickUp, Shortcut,
Pivotal Tracker — **all REJECTED**. No external bug tracker exists
anywhere in the family.

User direction 2026-06-20: "GitHub Issues only — locked, decision
file only."

## Why

- **Zero new infra.** Every repo already has Issues enabled by
  default; no account, no billing, no card on file
  ([`rules/no-card-on-file`](../../../rules/interaction/no-card-on-file.md) +
  [`rules/no-subscriptions`](../../../rules/infrastructure/no-subscriptions.md)).
- **GitHub-native integrations** — `#123` in a commit message
  auto-links; `Closes #123` in a PR description auto-closes on
  merge; `Fixes #123` in the merge commit closes too. Same syntax
  works in CodeRabbit comments per
  [`code-quality-five-tools`](../stack/code-quality-five-tools.md) and in
  Dependabot security advisories.
- **Free unlimited** — GitHub Issues has no per-issue cap, no
  per-user cap, no quota cliff. The family's everything-is-public-OSS
  posture (per [`rules/repos-work-independently`](../../../rules/development/repos-work-independently.md))
  means external contributors can file bugs without needing a
  Linear / Jira seat.
- **One-branch-only fits naturally.** Per
  [`rules/one-branch-only`](../../../rules/development/one-branch-only.md) +
  [`decisions/process/one-branch-only-rule`](../../process/one-branch-only-rule.md),
  every repo runs on `main` only — issue → fix on `main` → close
  on push. No cross-tracker sync, no Linear-issue-to-GitHub-PR
  reconciliation, no double bookkeeping.
- **Repo-scoped issues match repo-scoped responsibility.** Per
  [`repos-work-independently`](../../../rules/development/repos-work-independently.md),
  each repo is its own deployment unit. A bug filed against the
  wrong repo gets transferred via GitHub's built-in "Transfer
  issue" — no API juggle.

## Why not the rejected options

| Tool | Why rejected |
|---|---|
| Linear | Free tier 250 issues / 2 users — fights [`never-hit-quotas`](../../../rules/interaction/never-hit-quotas.md); paid tier requires card. Adds a second tracker the family has to keep in sync with GitHub PRs |
| Jira (Cloud) | Card-on-file required past free 10 users; UI overhead vs. Issues; primarily an enterprise tool |
| Trello | Card-shaped, not issue-shaped — no inline code refs, no PR auto-close, no commit linking |
| Plane.so | Self-host only on free tier (fights no-self-host posture); cloud requires card |
| Asana / ClickUp / Height / Shortcut | All hosted SaaS with free tiers that cap users / projects, paid tier requires card |
| Pivotal Tracker | EOL'd 2024 |
| Bugzilla / Mantis | Self-host overhead; the family runs only managed serverless |

## Implications

### Triage flow

- **Single repo bug**: file on the affected repo's Issues tab.
- **Multi-repo bug** (e.g. a regression in `oriz-kit` that breaks
  three sites): file on `oriz-kit`'s Issues, link affected sites
  via `gh issue comment`. The PR that fixes `oriz-kit` bumps the
  pinned version in dependent sites per
  [`rules/always-latest-deps`](../../../rules/development/always-latest-deps.md).
- **Family-wide audit / sweep** (e.g. "every site is missing a
  cookie banner"): file as a **task** on the
  [GitHub Projects board](./project-mgmt-github-projects-only.md)
  on `chirag127/oriz`, not as an issue on a specific repo.
  Project items can convert to repo issues when scoped down.

### Cross-repo search

- `gh issue list --search "is:open org:chirag127 cms" --json title,url,repository`
- `https://github.com/issues?q=is%3Aopen+org%3Achirag127+is%3Aissue+label%3Abug`
- Saved searches in browser bookmarks; no Linear "view" needed.

### Labels (family-standard, every repo)

- `bug` / `enhancement` / `question` / `documentation` —
  GitHub's defaults, kept.
- `priority:p0` / `priority:p1` / `priority:p2` / `priority:p3` —
  added family-wide via a repo-template push.
- `area:auth` / `area:ui` / `area:billing` / `area:seo` /
  `area:perf` / `area:a11y` — per-repo as needed.
- `good-first-issue` — kept; the everything-is-public-OSS posture
  per [`repos-work-independently`](../../../rules/development/repos-work-independently.md)
  invites contributions.

### What we don't do

- **No external bug tracker.** Even for "internal-only" tracking —
  the family is fully public-OSS so there is no internal/external
  divide.
- **No bug-bounty platform** (HackerOne / Bugcrowd) today. Security
  reports go to `chirag@oriz.in` per the per-repo `SECURITY.md`,
  triaged into a private security-advisory on the affected repo.
- **No bug intake forms / Tally / Web3Forms surfaces.** Public
  GitHub Issues is the only intake; the per-extension website's
  "Report a bug" link points straight at the repo's `/issues/new`.

### Revisit trigger

Re-open this decision only if **all three** hold:

1. A non-GitHub-using collaborator joins and explicitly cannot
   file via Issues.
2. GitHub Issues develops a quota cliff that hits family scale
   (no signal of this in 2026-06).
3. The user explicitly asks for a swap.

Until then, GitHub Issues is the answer.

## Cross-refs

- [Project management — GitHub Projects only](./project-mgmt-github-projects-only.md) — task tracking on the master repo
- [Per-repo CI workflows](../../process/per-repo-ci-workflows.md) — same per-repo posture for CI
- [One-branch-only rule](../../../rules/development/one-branch-only.md)
- [Repos work independently rule](../../../rules/development/repos-work-independently.md)
- [Conventional commits rule](../../../rules/development/conventional-commits.md) — commit messages reference `#123`
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
- [No subscriptions rule](../../../rules/infrastructure/no-subscriptions.md)
- [Code quality 5-tool stack](../stack/code-quality-five-tools.md) — CodeRabbit + Sonarcloud surface findings as issue-style comments
