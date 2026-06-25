---
type: runbook
title: Install free GitHub Apps to all 39+ chirag127/oriz* repos in one pass
description: "GitHub Apps cannot be installed via API (security policy \u2014 install\
  \ needs human consent). What we CAN do: install each app ONCE to the chirag127 org\
  \ with 'All repositories' selected, and it auto-applies to every existing + future\
  \ repo. This runbook lists the 8 apps to install with one click each, plus what\
  \ to do after install (configure tokens / enable features). Total time: ~10 minutes."
tags:
- runbook
- github-apps
- ci
- bulk-install
- oss-services
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- services/free-tier-catalog
- decisions/security/env-and-secrets-single-source
- rules/interaction/no-card-on-file
---



# Install free GitHub Apps to all 39+ chirag127/oriz* repos in one pass

## Why this can't be fully automated

GitHub deliberately requires human consent to install an app to an org or account. There is no API endpoint to install an app on someone's behalf — that's a security feature. The CLI `gh` cannot do it either.

The trick is: **install each app ONCE at the chirag127 org level with "All repositories" selected, and it auto-applies to every existing + future repo.** That gets you 39 repos for 1 click per app.

## The 7 apps to install (one click each)

For each, click "Install" → choose "chirag127" (your user/org) → choose "All repositories" → confirm.

| # | App | Install URL | Purpose | Post-install action |
|---|---|---|---|---|
| 1 | **CodeRabbit** | <https://github.com/apps/coderabbitai> | AI PR reviews on every PR | None — works automatically |
| 2 | **Codacy** | <https://github.com/apps/codacy-production> | Cloud lint + complexity | None — automatic on push |
| 3 | **DeepSource** | <https://github.com/apps/deepsource-io> | Static analysis | Add `.deepsource.toml` per repo (template below) |
| 4 | **SonarCloud** | <https://github.com/apps/sonarcloud> | SAST + quality | Add `sonar-project.properties` per repo (template below) + workflow |
| 5 | **Renovate (Mend)** | <https://github.com/apps/renovate> | Dep auto-PRs (alt to Dependabot) | Add `renovate.json` per repo (template below) |
| 6 | **Mergify** | <https://github.com/apps/mergify> | PR queue + auto-merge | Add `.mergify.yml` per repo (template below) |
| 7 | **All Contributors** | <https://github.com/apps/allcontributors> | Contributor recognition | None — works automatically |

(Codecov needs a manual auth + token per repo rather than an app — see below.)

## One-shot install URLs

Click each in order. Each opens the install consent screen:

```text
https://github.com/apps/coderabbitai/installations/new
https://github.com/apps/codacy-production/installations/new
https://github.com/apps/deepsource-io/installations/new
https://github.com/apps/sonarcloud/installations/new
https://github.com/apps/renovate/installations/new
https://github.com/apps/mergify/installations/new
https://github.com/apps/allcontributors/installations/new
```

In each, choose **"All repositories"** then click **Install**. Done.

## What you can automate (after the app installs)

The per-repo CONFIG files (`.deepsource.toml`, `renovate.json`, etc.) can be added via `gh` API. Script below.

### Bulk-add config files to every repo

```bash
#!/usr/bin/env bash
# bulk-add-config-files.sh — for every chirag127/oriz* repo, add the standard
# config files for SonarCloud + DeepSource + Renovate + Mergify if missing.

REPOS=$(gh repo list chirag127 --limit 200 --json name --jq '.[].name' | grep -E '(astro|auth)-.*-npm-pkg|.*-app$')

for repo in $REPOS; do
  echo "=== $repo ==="

  # Renovate
  gh api -X PUT "/repos/chirag127/$repo/contents/renovate.json" \
    -f message="chore: add renovate config" \
    -f content="$(printf '{\n  "$schema": "https://docs.renovatebot.com/renovate-schema.json",\n  "extends": ["config:recommended"]\n}' | base64 -w0)" \
    >/dev/null 2>&1 && echo "  ✓ renovate.json"

  # DeepSource (TypeScript projects)
  gh api -X PUT "/repos/chirag127/$repo/contents/.deepsource.toml" \
    -f message="chore: add deepsource config" \
    -f content="$(printf 'version = 1\n\n[[analyzers]]\nname = "javascript"\n\n[analyzers.meta]\nplugins = ["react"]\nenvironment = ["nodejs", "browser"]' | base64 -w0)" \
    >/dev/null 2>&1 && echo "  ✓ .deepsource.toml"

  # Mergify
  gh api -X PUT "/repos/chirag127/$repo/contents/.mergify.yml" \
    -f message="chore: add mergify config" \
    -f content="$(printf 'queue_rules:\n  - name: default\n    queue_conditions:\n      - check-success=check\n    merge_conditions:\n      - check-success=check\n    merge_method: squash\n\npull_request_rules:\n  - name: automatic merge on approval\n    conditions:\n      - "#approved-reviews-by>=1"\n      - check-success=check\n      - -draft\n    actions:\n      queue: {}' | base64 -w0)" \
    >/dev/null 2>&1 && echo "  ✓ .mergify.yml"

  # SonarCloud properties (uses chirag127_<repo> as project key)
  cont=$(printf 'sonar.projectKey=chirag127_%s\nsonar.organization=chirag127\nsonar.sources=src\nsonar.exclusions=**/*.test.ts,**/*.test.tsx,**/__tests__/**' "$repo")
  gh api -X PUT "/repos/chirag127/$repo/contents/sonar-project.properties" \
    -f message="chore: add sonarcloud config" \
    -f content="$(echo "$cont" | base64 -w0)" \
    >/dev/null 2>&1 && echo "  ✓ sonar-project.properties"
done
```

This script is at [`scripts/bulk-add-config-files.sh`](../../scripts/bulk-add-config-files.sh).

### Bulk-enable security features per repo

```bash
#!/usr/bin/env bash
# bulk-enable-security.sh — turn on the GitHub-native security features
# (secret scanning, push protection, vuln alerts, code scanning default setup)
# for every chirag127/oriz* repo.

REPOS=$(gh repo list chirag127 --limit 200 --json name --jq '.[].name' | grep -E '(astro|auth)-.*-npm-pkg|.*-app$')

for repo in $REPOS; do
  echo "=== $repo ==="

  # Vulnerability alerts
  gh api -X PUT "/repos/chirag127/$repo/vulnerability-alerts" >/dev/null 2>&1 && echo "  ✓ vuln alerts"

  # Automated security fixes (Dependabot auto-PRs)
  gh api -X PUT "/repos/chirag127/$repo/automated-security-fixes" >/dev/null 2>&1 && echo "  ✓ auto-security-fixes"

  # Secret scanning + push protection
  gh api -X PATCH "/repos/chirag127/$repo" \
    -F 'security_and_analysis[secret_scanning][status]=enabled' \
    -F 'security_and_analysis[secret_scanning_push_protection][status]=enabled' \
    >/dev/null 2>&1 && echo "  ✓ secret scanning"
done
```

This script is at [`scripts/bulk-enable-security.sh`](../../scripts/bulk-enable-security.sh).

## Codecov setup (not a GitHub App — needs token per repo)

Codecov requires a per-repo upload token (not an app install). Easiest path:

1. Visit <https://app.codecov.io/gh/chirag127> → click each repo → copy upload token
2. Set as repo-level secret: `gh secret set CODECOV_TOKEN --repo chirag127/<repo> --body "$TOKEN"`
3. CI's existing `vitest run --coverage` produces `coverage/lcov.info`
4. Add to CI workflow: `codecov/codecov-action@v5` with `files: ./coverage/lcov.info`

Bulk-set token if all repos use same `CODECOV_TOKEN` env var:

```bash
TOKEN=$(grep '^CODECOV_TOKEN=' c:/D/oriz/.env | sed 's/.*=//')
for repo in $REPOS; do
  gh secret set CODECOV_TOKEN --repo "chirag127/$repo" --body "$TOKEN"
done
```

## Skipped — programs requiring OSI license

The family's source-available all-rights-reserved LICENSE makes us INELIGIBLE for:

- Sentry for Open Source (would give 5M errors but checks license)
- BrowserStack / Sauce Labs / LambdaTest OSS programs (OSI required)
- FOSSA for OSS, Crowdin for OSS, Weblate Hosted Libre (libre/OSI required)
- Mintlify OSS, GitBook OSS, Algolia for OSS (OSS-only)
- Atlassian / JetBrains / 1Password for OSS (OSI required)
- Docker DSOS (OSS-only)

These are documented in [[services/free-tier-catalog]] §"Programs we are INELIGIBLE for." Don't waste effort applying unless we switch the repo LICENSE.

## Order of operations

1. Click the 7 install URLs above (~5 minutes)
2. Run `scripts/bulk-add-config-files.sh` (~2 minutes for 39 repos)
3. Run `scripts/bulk-enable-security.sh` (~1 minute)
4. Codecov per repo (~3 minutes — one token copy per repo)

Total: ~10 minutes for all 39 repos.

## Cross-refs

- The full catalog of services → [[services/free-tier-catalog]]
- The license posture → [[free-for-developer-not-for-services]] memory
- Env + secrets management → [[decisions/security/env-and-secrets-single-source]]
- Org-level GH secrets → [[runbooks/set-github-org-level-secrets]]
