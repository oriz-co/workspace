---
type: runbook
title: Sync .env.example from master to every repo
description: 'Step-by-step procedure for adding / removing / renaming a family-wide
  env var: edit templates/.env.example on master, run scripts/sync-env-example.sh
  to fan the change to every submodule, commit + push each touched repo + bump master
  pointers, verify with scripts/verify-env-example-sync.sh.'
tags:
- runbook
- env
- dotenv
- sync
- submodules
- master
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- rules/security/env-example-synced-from-master
- rules/security/github-org-level-secrets
- decisions/security/env-and-secrets-single-source
- runbooks/security/set-github-org-level-secrets
- runbooks/operations/bump-submodule-pointer
- services/secrets/doppler
---



# Sync .env.example from master to every repo

One-page procedure to add / remove / rename a family-wide env var
across every repo in the family. Implements
[`rules/env-example-synced-from-master.md`](../../rules/security/env-example-synced-from-master.md)
and the Track A half of
[`decisions/security/env-and-secrets-single-source.md`](../../decisions/security/env-and-secrets-single-source.md).

## Prerequisites

- Working tree of master `chirag127/oriz` is clean (or has only the
  intended `templates/.env.example` change in flight).
- Every submodule is initialised (`git submodule update --init
  --recursive`).
- The new key (if adding) has a value already written at
  [Doppler](../../services/secrets/doppler.md) — the runbook
  [`set-github-org-level-secrets.md`](../security/set-github-org-level-secrets.md)
  is run AFTER this one to push the value into the
  `chirag127`-org-level GH Actions secrets.

## Steps

### 1. Edit the master template

Open [`templates/.env.example`](../../templates/.env.example) on
master and add / remove / rename the key. One `KEY=` line per
addition. No comments. Order is append-at-end for additions; for
renames, edit the existing line in place.

```bash
# example: adding WAKATIME_API_KEY for the lifestream pipeline
$EDITOR templates/.env.example
```

### 2. Dry-run the sync

```bash
bash scripts/sync-env-example.sh --dry-run
```

Prints, for every submodule, the path it WOULD overwrite and the
diff. Confirm the list matches the family inventory (every site,
every package, `oriz-omnipost`, `oriz-lifestream` when present,
every extension and worker submodule).

### 3. Run the sync

```bash
bash scripts/sync-env-example.sh
```

The script:

1. Resolves `MASTER="$REPO_ROOT/templates/.env.example"`.
2. Reads every submodule path from `.gitmodules`.
3. For each submodule path (and the master repo itself's
   `.env.example` at the root if you choose to keep one), copies
   `MASTER` over the existing file, overwriting.
4. Prints a one-line summary per repo.

### 4. Commit + push each touched submodule

`git submodule foreach` is the safe loop. From master:

```bash
git submodule foreach --recursive '
    if ! git diff --quiet -- .env.example; then
        git add .env.example
        git commit -m "chore: sync .env.example from master"
        git push origin main
    else
        echo "no .env.example change in $sm_path"
    fi
'
```

(Per [`rules/push-by-default.md`](../../rules/development/push-by-default.md),
push immediately after commit. No feature branches per
[`rules/one-branch-only.md`](../../rules/development/one-branch-only.md).)

### 5. Bump the master pointers

```bash
git -C "$REPO_ROOT" status   # confirms every touched submodule shows as a pointer bump
git add sites/* packages/* .gitmodules templates/.env.example
git commit -m "chore(env): add <KEY> to templates/.env.example + sync to every submodule"
git push origin main
```

For more detail on the pointer-bump mechanic, see
[`bump-submodule-pointer.md`](./bump-submodule-pointer.md).

### 6. Verify

```bash
bash scripts/verify-env-example-sync.sh
```

The script `diff`s every submodule's `.env.example` against
`templates/.env.example`. Exits 0 on full match, non-zero with a
list of drifting paths otherwise. **Verify must exit 0 before this
runbook is considered complete.**

### 7. (If adding a key) push the value to org-level GH secrets

The `.env.example` change adds the **key surface**; the value still
needs to land at the `chirag127`-org-level GitHub Actions secrets
list. Run
[`set-github-org-level-secrets.md`](../security/set-github-org-level-secrets.md)
for the new key.

### 8. Update the log

Append a one-liner to
[`knowledge/log.md`](../../log.md):

```markdown
- 2026-06-20 — added <KEY> to templates/.env.example + synced to every repo + pushed value to chirag127 org secrets
```

## Don'ts

- **Don't hand-edit a child repo's `.env.example`.** It will be
  overwritten on the next sync, and the CI drift check will fail
  the PR until you re-sync.
- **Don't skip `verify-env-example-sync.sh`.** Master CI runs the
  same script — a green local run prevents a red PR.
- **Don't combine multiple key changes in one commit-and-push** if
  any of them touches a key the other repos' CI immediately
  references — it can stampede if the org-secret value isn't in
  place yet. Add the value to Doppler + GH org first, then sync the
  example.

## See also

- [`../rules/env-example-synced-from-master.md`](../../rules/security/env-example-synced-from-master.md)
- [`../rules/github-org-level-secrets.md`](../../rules/security/github-org-level-secrets.md)
- [`../decisions/security/env-and-secrets-single-source.md`](../../decisions/security/env-and-secrets-single-source.md)
- [`./set-github-org-level-secrets.md`](../security/set-github-org-level-secrets.md)
- [`./bump-submodule-pointer.md`](./bump-submodule-pointer.md)
- [`../services/secrets/doppler.md`](../../services/secrets/doppler.md)
- [`../../templates/.env.example`](../../templates/.env.example)
- [`../../scripts/sync-env-example.sh`](../../scripts/sync-env-example.sh)
- [`../../scripts/verify-env-example-sync.sh`](../../scripts/verify-env-example-sync.sh)
