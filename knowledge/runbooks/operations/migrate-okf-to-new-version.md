---
type: runbook
title: Migrate the knowledge bundle to a new OKF spec version
description: Run when the OKF spec moves beyond v0.1. Read migration notes, update
  _okf.md format_version, find every concept file with the old version stamp, batch-update,
  and log the migration.
tags:
- runbook
- okf
- migration
- knowledge
- schema
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- _okf
- runbooks/operations/add-new-decision
- log
---



# Migrate the knowledge bundle to a new OKF spec version

OKF v0.1 was published 2026-06-13 and will evolve. When the spec
ships a new version, run this runbook to bring the family bundle up to
date.

## Steps

1. **Read the migration notes** for the new spec version. They live
    alongside the spec on the OKF GitHub repo (linked from
    [`../_okf.md`](../../_okf.md)). Make sure you understand:

    - which frontmatter fields are added, renamed, removed
    - which `type` values are added, deprecated
    - whether reserved filenames change (`index.md`, `log.md`, `_okf.md`)
    - whether cross-link conventions change

    Until OKF hits 1.0, prefer additive over structural — the family
    convention is to lag breaking changes by one minor version unless
    a security or correctness issue forces immediate adoption.

2. **Update `_okf.md`.** Bump the `format_version` field in the
    frontmatter and rewrite the body section that documents the
    spec version + reserved fields. This is the canonical pointer
    every other file refers to.

    ```bash
    # then commit on its own
    git commit -m "docs(knowledge): adopt OKF v0.X — see _okf.md"
    ```

3. **Find every file stamped with the old version.**

    ```bash
    grep -rl 'format_version: okf-v0.1' knowledge/
    ```

    Inspect the count. If it's small (under ~20), update by hand. If
    it's large, go to step 4.

4. **Batch-update.** Two options depending on scope of the change:

    - **Pure version bump** (no frontmatter shape change): use sed.

        ```bash
        grep -rl 'format_version: okf-v0.1' knowledge/ | \
          xargs sed -i 's/format_version: okf-v0.1/format_version: okf-v0.2/g'
        ```

    - **Schema migration** (renamed / added / removed fields): fan
        out subagents per
        [`../rules/parallel-by-default.md`](../../rules/interaction/parallel-by-default.md).
        Split the file list into ~5 chunks; spawn one general-purpose
        agent per chunk with the migration notes inline. Each agent
        updates its chunk and reports back.

5. **Re-validate.** Spot-check 3-5 random files from each top-level
    directory (`rules/`, `decisions/`, `services/`, etc.) to confirm
    the migration produced valid frontmatter. If the spec ships a
    validator, run it.

6. **Update `knowledge/log.md`** with one dated entry summarising the
    migration:

    ```markdown
    - 2026-06-20 — migrated knowledge/ from OKF v0.1 → v0.2 (N files updated)
    ```

7. **Commit and (when authorised) push.** Conventional commit:

    ```bash
    git add knowledge/
    git commit -m "docs(knowledge): migrate to OKF v0.X"
    ```

## Don'ts

- **Don't migrate piecemeal.** The bundle should never be in a
  half-migrated state across a commit boundary. Either the whole
  migration commits together, or nothing does.
- **Don't delete superseded fields immediately.** If the spec
  deprecates a field, keep it for one minor version before removing
  it from existing files; new files can omit it.

## See also

- [`../_okf.md`](../../_okf.md)
- [`add-new-decision.md`](./add-new-decision.md)
- [`../log.md`](../../log.md)
