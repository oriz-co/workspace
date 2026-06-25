---
type: decision
title: "Weekly release train \u2014 Wednesday 9 AM IST, CalVer per app, hot-fix bypass,\
  \ git-cliff changelog"
description: Every app rides a weekly release train on Wednesday 9 AM IST via a workspace-level
  cron that tags + releases each app that has commits since its last tag. Versioning
  is CalVer per app (v2026.06.21). Hot-fixes bypass the train via [hotfix] in the
  commit message, triggering an immediate tag + deploy. Changelogs auto-generated
  by git-cliff from conventional commits.
tags:
- architecture
- release
- ci
- cron
- calver
- git-cliff
- hotfix
- cadence
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/ops/multi-target-build
- decisions/branding/naming-policy-v6
---



# Release cadence — weekly Wednesday train + hot-fix bypass

## Decision

Every `-app` repo in the family ships on a **weekly Wednesday release
train**. A workspace-level cron at **Wednesday 9 AM IST** scans each
submodule for new commits since its last tag, and for each app with
new commits:

1. Computes the next CalVer tag (`v2026.06.21`, with a `.N` suffix when
   multiple releases land the same date).
2. Runs `git cliff` against conventional commits to generate the
   changelog section.
3. Tags the commit, pushes the tag, and triggers the per-app deploy
   workflow (per [multi-target-build](./multi-target-build.md)).

Apps with no new commits since the last tag are **skipped** — the train
doesn't drag dead cars.

## The five sub-locks

### Wednesday cadence

Weekly is the right cadence for solo-dev scale: fast enough to keep
shipped surface fresh, slow enough that a stale Tuesday merge doesn't
ship until it's been read with rested eyes. Wednesday picked over
Friday (Friday releases break weekends) and Monday (Monday releases
collide with weekly planning).

### Cron trigger

```yaml
# workspace umbrella .github/workflows/release-train.yml
on:
  schedule:
    - cron: "30 3 * * 3"  # 03:30 UTC Wed = 09:00 IST Wed
  workflow_dispatch:
```

The job runs at the workspace umbrella; per-app deploy workflows are
triggered by the tag push, not by this cron directly. Manual dispatch
(`workflow_dispatch`) for off-cycle ceremonies.

### Hot-fix bypass

Any commit message containing the literal token `[hotfix]` (in the
subject or body) triggers an immediate tag + deploy on push to `main`.
The weekly train still runs — it just finds the hot-fix app already
tagged and skips it.

```bash
git commit -m "fix(pdf-tools): font cache crash on Edge [hotfix]"
git push origin main
# → per-app workflow detects [hotfix], tags + deploys immediately
```

### CalVer per app

Format: `vYYYY.MM.DD` from the tag date in UTC. Multiple releases on
the same day get `.N` suffix starting at `.2` (the first is
unsuffixed): `v2026.06.21`, `v2026.06.21.2`, `v2026.06.21.3`.

CalVer over SemVer because:
- Solo-dev family scale doesn't need SemVer's compatibility contract.
- CalVer makes "when did this ship?" a one-glance answer.
- Apps don't have an API surface — they're end-user apps; the version
  is for the developer's audit trail, not consumer dependency
  resolution.

NPM packages stay on **SemVer** — they have an API surface; CalVer
would break consumer version-range pins.

### git-cliff auto-changelog

[git-cliff](https://git-cliff.org) generates `CHANGELOG.md` from
conventional-commit history. Config lives in `cliff.toml` at each
app's repo root (or, more likely, synced from a master template in
the workspace). Runs in the release workflow before the tag is pushed,
so the changelog lands with the tag.

No hand-written changelogs. If a commit isn't a conventional-commit,
it won't show up in the changelog — that's the forcing function.

## Cross-refs

- [multi-target-build](./multi-target-build.md) — per-app deploy workflow that the tag triggers
- [naming-policy-v6](../../branding/naming-policy-v6.md) — `-app` suffix is what the cron filter selects on
- [rules/keep-knowledge-fresh](../../../rules/agent/keep-knowledge-fresh.md)
