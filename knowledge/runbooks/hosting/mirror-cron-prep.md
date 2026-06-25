---
type: runbook
title: "Mirror cron \u2014 pre-flight checklist"
description: Pre-flight checklist for the Friday 03:30 IST 4-host git mirror cron
  at `.github/workflows/mirror-all.yml`. Generate 4 host tokens with write+create-repo
  scope, pre-create 51 empty mirror repos on each host, store all tokens at chirag127
  GH org level, and run a first-pass dry-run to verify the bare-clone push lands on
  every host.
tags:
- runbook
- mirror
- git-host
- gitlab
- codeberg
- bitbucket
- gitflic
- secrets
- pre-flight
timestamp: 2026-06-21
format_version: okf-v0.1
status: superseded
superseded_by: runbooks/mirror-all-hosts-setup
related:
- decisions/architecture/ops/mirror-to-6-git-hosts
- rules/security/github-org-level-secrets
- runbooks/security/set-github-org-level-secrets
- runbooks/operations/migrate-ci-platform
---



# Mirror cron — pre-flight checklist

One-time setup required before the Friday 03:30 IST mirror cron at
`c:/D/oriz/.github/workflows/mirror-all.yml` can run successfully.
The mirror itself is documented in
[[decisions/architecture/mirror-to-4-git-hosts]] — this runbook is
just the pre-flight steps to make it work.

## When to run

- **Once, before enabling the cron.** All four steps must complete before the first scheduled Friday run.
- **Re-run individual steps** when adding a new mirror host or after a token rotation.
- **Re-run step 2** every time a new submodule is added to `.gitmodules` (pre-create the mirror repo on each of the 4 hosts before the next Friday cron).

## Prerequisites

- `gh` CLI authenticated with admin access to `chirag127` org (for step 3).
- Browser access for token generation (steps 1, manual flows).
- Optional: `glab` (GitLab CLI), `curl` for scripted repo creation in step 2.

## 1. Generate 4 host tokens with write+create-repo scope

Each host has a slightly different scope vocabulary. Required minimum: write to existing repos AND create new repos under the same account.

| Host | Token type | Required scopes | Dashboard |
|---|---|---|---|
| **GitLab.com** | Personal Access Token | `api`, `write_repository` | <https://gitlab.com/-/user_settings/personal_access_tokens> |
| **Codeberg.org** | Access Token | `write:repository` | <https://codeberg.org/user/settings/applications> |
| **Bitbucket** | App password | Repositories: **Write** + **Admin** (for create) | <https://bitbucket.org/account/settings/app-passwords/> |
| **GitFlic.ru** | Personal token | repo:write (scope label in Cyrillic UI; "запись в репозиторий") | <https://gitflic.ru/user/settings/tokens> |

Save each token to Doppler under the `prd` config — never paste into chat or commit to disk.

```bash
doppler secrets set MIRROR_GITLAB_TOKEN          --config prd
doppler secrets set MIRROR_GITLAB_USERNAME       --config prd  # gitlab handle
doppler secrets set MIRROR_CODEBERG_TOKEN        --config prd
doppler secrets set MIRROR_BITBUCKET_APP_PASSWORD --config prd
doppler secrets set MIRROR_BITBUCKET_USERNAME    --config prd  # bitbucket handle
doppler secrets set MIRROR_GITFLIC_TOKEN         --config prd
```

## 2. Pre-create 51 empty mirror repos on each host

Currently **51 submodules** per `c:/D/oriz/.gitmodules` (verify the count before scripting; it grows). Each host needs an empty target repo with the same name as the GitHub source.

Shell loop sketch (replace `$HOST_API` per host):

```bash
# Read submodule paths from .gitmodules and extract the slug
git config --file c:/D/oriz/.gitmodules --get-regexp '^submodule\..*\.url$' \
  | awk '{print $2}' \
  | sed 's#.*/##; s#\.git$##' \
  > /tmp/mirror-repos.txt

# GitLab — uses glab
while read -r REPO; do
  glab repo create "chirag127/$REPO" --public \
    --description "Mirror of github.com/chirag127/$REPO"
done < /tmp/mirror-repos.txt

# Codeberg — REST API
while read -r REPO; do
  curl -X POST "https://codeberg.org/api/v1/user/repos" \
    -H "Authorization: token $MIRROR_CODEBERG_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$REPO\",\"private\":false,\"description\":\"Mirror of github.com/chirag127/$REPO\"}"
done < /tmp/mirror-repos.txt

# Bitbucket — REST API v2.0
while read -r REPO; do
  curl -X POST "https://api.bitbucket.org/2.0/repositories/$MIRROR_BITBUCKET_USERNAME/$REPO" \
    -u "$MIRROR_BITBUCKET_USERNAME:$MIRROR_BITBUCKET_APP_PASSWORD" \
    -H "Content-Type: application/json" \
    -d "{\"scm\":\"git\",\"is_private\":false,\"description\":\"Mirror of github.com/chirag127/$REPO\"}"
done < /tmp/mirror-repos.txt

# GitFlic — REST API (docs at https://gitflic.ru/help/api)
while read -r REPO; do
  curl -X POST "https://api.gitflic.ru/project" \
    -H "Authorization: token $MIRROR_GITFLIC_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"$REPO\",\"alias\":\"$REPO\",\"private\":false}"
done < /tmp/mirror-repos.txt
```

204 repos created total (4 hosts × 51). Idempotent on re-run: each host returns a "repo already exists" 4xx that the script can `|| true` past.

## 3. Store all 6 tokens at chirag127 GH org level

The cron runs in master's GitHub Actions and needs the tokens injected as env vars. Per [[rules/github-org-level-secrets]] secrets live ONCE at org level, never per-repo.

Use [[runbooks/set-github-org-level-secrets]]:

```bash
for NAME in \
    MIRROR_GITLAB_USERNAME \
    MIRROR_GITLAB_TOKEN \
    MIRROR_CODEBERG_TOKEN \
    MIRROR_BITBUCKET_USERNAME \
    MIRROR_BITBUCKET_APP_PASSWORD \
    MIRROR_GITFLIC_TOKEN; do
  VALUE="$(doppler secrets get "$NAME" --plain --config prd)"
  printf '%s' "$VALUE" | gh secret set "$NAME" --org chirag127 --visibility all
done
```

Verify:

```bash
gh secret list --org chirag127 | grep -E '^MIRROR_'
```

Expected: 6 rows with `updated_at` set to the current minute.

## 4. First-run dry-run

Don't trust the cron to run cleanly on a Friday in the middle of the night. Force a no-push dry-run first.

1. **Edit** `c:/D/oriz/.github/workflows/mirror-all.yml` and add `--dry-run` to the `git push` step (or comment the push step entirely).
2. **Add** `workflow_dispatch:` to the workflow's `on:` trigger so it can be manually fired.
3. **Trigger**:
   ```bash
   gh workflow run mirror-all.yml --repo chirag127/oriz
   gh run watch --repo chirag127/oriz
   ```
4. **Verify** the logs show every host's `git push --dry-run` exit 0. Any non-zero is a mis-configured token or a missing mirror repo — fix before re-enabling the cron.
5. **Re-enable**: remove `--dry-run` (or restore the push step) + commit + push.
6. **Force one real run** via `gh workflow run` to confirm each host's repo got the bare-clone push.

After the first real run, check each host's web UI for the repo's commit list — should match GitHub's HEAD per submodule.

## Failure modes + escape hatches

| Symptom | Cause | Fix |
|---|---|---|
| `403 Forbidden` on push | Token lacks `write_repository` scope | Regenerate with correct scope (step 1) |
| `404 Not Found` on push | Mirror repo missing on host | Re-run step 2 for that host |
| GitFlic returns 451 (sanctions) | Geographic block | Accept loss for now; document in [[decisions/architecture/mirror-to-4-git-hosts]] |
| Cron runs but Telegram silent | Mirror webhook secret missing | Add `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` to org secrets |
| One host fails 3 weeks in a row | Auto-issue in master | Triage in `chirag127/oriz` issues |

## See also

- The mirror decision itself → [[decisions/architecture/mirror-to-4-git-hosts]]
- The migration runbook if GH itself becomes unusable → [[runbooks/migrate-ci-platform]]
- Org-level GH secrets pattern → [[runbooks/set-github-org-level-secrets]] + [[rules/github-org-level-secrets]]
- Env keys mirrored to `templates/.env.example` per [[runbooks/sync-env-example-to-all-repos]]
