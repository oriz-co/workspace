---
type: runbook
title: Set / update GitHub Actions secrets at the chirag127 org level
description: Pull a secret value from Doppler, push it to the chirag127-org-level
  GitHub Actions secrets list with `gh secret set --org chirag127 --visibility all`,
  then verify with `gh secret list`. Idempotent. Used after adding a new key to templates/.env.example,
  after a rotation, and on the quarterly audit cadence.
tags:
- runbook
- github
- secrets
- org-level
- doppler
- sync
- ci
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- rules/security/github-org-level-secrets
- rules/security/env-example-synced-from-master
- decisions/security/env-and-secrets-single-source
- decisions/security/secrets-management-doppler
- runbooks/operations/sync-env-example-to-all-repos
- runbooks/security/rotate-leaked-secret
- services/secrets/doppler
- services/secrets/github-secrets
---



# Set / update GitHub Actions secrets at the chirag127 org level

One-page procedure for pushing a secret value from
[Doppler](../../services/secrets/doppler.md) to the
`chirag127`-org-level GitHub Actions secrets list. Implements
[`rules/github-org-level-secrets.md`](../../rules/security/github-org-level-secrets.md)
and the Track B half of
[`decisions/security/env-and-secrets-single-source.md`](../../decisions/security/env-and-secrets-single-source.md).

## When to run

- **Adding a new family-wide env var** — after running
  [`sync-env-example-to-all-repos.md`](../operations/sync-env-example-to-all-repos.md)
  for the key surface, run this to push the value.
- **Rotating a leaked secret** — per
  [`rotate-leaked-secret.md`](./rotate-leaked-secret.md), the new
  value lands at Doppler then propagates here.
- **Quarterly audit** — verify the org-level secret list matches
  the keys in
  [`templates/.env.example`](../../templates/.env.example).
- **First-time bootstrap** — running through every key in
  `templates/.env.example` once.

## Prerequisites

- `gh` CLI authenticated as a user with admin access to the
  `chirag127` org (`gh auth status` is clean).
- `doppler` CLI authenticated against the user's Doppler workplace
  (`doppler whoami` is clean).
- The key already exists in
  [`templates/.env.example`](../../templates/.env.example) — that's
  the source of truth for "which keys live at org level". Anything
  not in the example is either a Doppler-internal credential or an
  orphan — don't sync it.

## Steps

### 1. Get the secret value from Doppler

```bash
NAME="<KEY>"
VALUE="$(doppler secrets get "$NAME" --plain --config prd)"
```

`--plain` strips formatting. `--config prd` selects the production
environment in the relevant Doppler project (substitute `dev` if
the key is dev-only).

Don't `echo "$VALUE"`. Don't paste it anywhere.

### 2. Set the org-level secret

```bash
printf '%s' "$VALUE" | gh secret set "$NAME" \
    --org chirag127 \
    --visibility all
```

`printf '%s'` instead of `echo` avoids appending a stray newline on
some shells.

For repo-narrow keys (extension publishers, VS Code marketplace
tokens), use `--visibility selected --repos <comma-list>` instead:

```bash
printf '%s' "$VALUE" | gh secret set "CHROME_WEBSTORE_REFRESH_TOKEN" \
    --org chirag127 \
    --visibility selected \
    --repos "oriz-omnipost,oriz-blog-ext,oriz-cards-ext"
```

### 3. Verify

```bash
gh secret list --org chirag127 \
    | grep -E "^$NAME\b" \
    || { echo "missing: $NAME"; exit 1; }
```

The `updated_at` timestamp on the matched line should be the
current minute.

### 4. (For new keys) repeat for every NEW key

When bootstrapping or after multiple keys have entered
`templates/.env.example`, the bulk path is the helper script:

```bash
bash scripts/set-org-secrets-from-doppler.sh --dry-run
bash scripts/set-org-secrets-from-doppler.sh
```

The script reads every key from
[`templates/.env.example`](../../templates/.env.example), pulls the
value from Doppler, and runs `gh secret set --org chirag127
--visibility all` for each. Idempotent — re-running with no value
changes is a no-op (the GH API still records an `updated_at` bump
per write, but the value is unchanged).

### 5. Audit

```bash
gh secret list --org chirag127 --json name,visibility,updatedAt > /tmp/org-secrets.json
```

Diff against the keys in `templates/.env.example`. Two failure
modes:

- **Missing at org.** Key is in the example, not in the org list.
  CI will fail next time the key is referenced. Fix: run steps 1-3
  for that key.
- **Orphan at org.** Key is in the org list, not in the example.
  Possibly stale. Audit who set it and when (`updated_at`); if
  unused, delete with
  `gh secret delete <NAME> --org chirag127` after confirming no
  CI run references it.

### 6. Update the log

Append a one-liner to [`knowledge/log.md`](../../log.md):

```markdown
- 2026-06-20 — set <KEY> at chirag127 org level (visibility: all) sourced from Doppler
```

(Don't include the value, even partially.)

## Don'ts

- **Don't `gh secret set --repo <name>` for any key in
  `templates/.env.example`.** Per
  [`rules/github-org-level-secrets.md`](../../rules/security/github-org-level-secrets.md),
  per-repo writes are forbidden — they cause drift.
- **Don't paste the value into chat** to "verify it set". The
  verification is `gh secret list` (which shows name + updated_at,
  not value). The CI run is the runtime verification.
- **Don't manually re-type a value.** Always pipe from
  `doppler secrets get`. Manual re-typing is a leak risk and a
  drift risk (typos).
- **Don't skip the audit step on rotations.** A rotation that
  forgets the org-level write leaves the value out-of-date in CI
  while local dev (Doppler-backed) sees the new one — confusing
  failure mode.

## See also

- [`../rules/github-org-level-secrets.md`](../../rules/security/github-org-level-secrets.md)
- [`../rules/env-example-synced-from-master.md`](../../rules/security/env-example-synced-from-master.md)
- [`../decisions/security/env-and-secrets-single-source.md`](../../decisions/security/env-and-secrets-single-source.md)
- [`../decisions/security/secrets-management-doppler.md`](../../decisions/security/secrets-management-doppler.md)
- [`./sync-env-example-to-all-repos.md`](../operations/sync-env-example-to-all-repos.md)
- [`./rotate-leaked-secret.md`](./rotate-leaked-secret.md)
- [`../services/secrets/doppler.md`](../../services/secrets/doppler.md)
- [`../services/secrets/github-secrets.md`](../../services/secrets/github-secrets.md)
- [`../../templates/.env.example`](../../templates/.env.example)
- [`../../scripts/set-org-secrets-from-doppler.sh`](../../scripts/set-org-secrets-from-doppler.sh)
