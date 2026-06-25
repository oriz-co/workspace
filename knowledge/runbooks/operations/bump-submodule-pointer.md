---
type: runbook
title: Bump a submodule pointer in master
description: 'After landing a feature inside a submodule, bump the master repo''s
  pointer to it. The standard `feat in submodule, chore: bump in master` two-commit
  workflow.'
tags:
- runbook
- git
- submodule
- workflow
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- rules/development/conventional-commits
- rules/no-push-without-say-so
- rules/development/one-branch-only
---



# Bump a submodule pointer in master

The master `oriz` repo references each `oriz-*` site as a git
submodule. Every change inside a site lands as **two commits**: the
feature commit inside the submodule, and a `chore: bump` commit in
master that moves the pointer.

## Steps

1. **Enter the submodule.**

    ```bash
    cd sites/oriz-<name>
    ```

2. **Verify you're on `main`.** Per
    [`one-branch-only.md`](../../rules/development/one-branch-only.md), no other
    branch should exist.

    ```bash
    git status        # confirms branch and clean tree
    git rev-parse --abbrev-ref HEAD   # must print "main"
    ```

3. **Commit the feature inside the submodule.** Use a conventional
    commit message that describes the actual change.

    ```bash
    git add -A
    git commit -m "feat(<scope>): <one-line summary>"
    ```

4. **Push the submodule** — but only when the user has explicitly
    authorised pushing this turn. See
    [`no-push-without-say-so.md`](../../rules/no-push-without-say-so.md).

    ```bash
    git push origin main
    ```

5. **Capture the short SHA** of the submodule HEAD.

    ```bash
    SHORT_SHA=$(git rev-parse --short HEAD)
    echo "$SHORT_SHA"
    ```

6. **Return to master** and stage the new pointer.

    ```bash
    cd ../..
    git add sites/oriz-<name>
    ```

7. **Commit the pointer bump** with a `chore(submodule)` message that
    names the submodule and the new short SHA.

    ```bash
    git commit -m "chore(submodule): bump oriz-<name> to ${SHORT_SHA}"
    ```

8. **Push master** — again, only when authorised.

    ```bash
    git push origin main
    ```

## Why two commits

The submodule's history records the actual change. The master commit
records *which version of the submodule the family is shipping*. They
serve different audiences (engineers reading the submodule's git log
vs. operators rolling back the family) and should not be squashed.

## See also

- [`add-new-site-to-family.md`](./add-new-site-to-family.md)
- [`../rules/conventional-commits.md`](../../rules/development/conventional-commits.md)
- [`../rules/no-push-without-say-so.md`](../../rules/no-push-without-say-so.md)
