---
type: runbook
title: "npm publish \u2014 token setup for chirag127/* packages"
description: How to generate an npm Granular Access Token with publish + unpublish
  bypass-2FA, store it in c:/D/oriz/.env as NPM_TOKEN, and use it for unattended publish/unpublish
  across the family's @chirag127/* packages.
tags:
- runbook
- npm
- publish
- 2fa
- token
- automation
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- architecture/packages/the-23-packages
- rules/security/no-hardcoded-secrets
- decisions/security/env-and-secrets-single-source
---



# npm publish — token setup for chirag127/* packages

## When to use

You need to `npm publish` (or `npm unpublish --force`) a `@chirag127/*` package from a CI runner, an automation script, or unattended local shell. The npm account has 2FA enabled, which by default blocks `publish` / `unpublish` unless an OTP is provided. A Granular Access Token with the right toggles bypasses the OTP prompt.

## The token

Generate once, store in `c:/D/oriz/.env` as `NPM_TOKEN=npm_xxxxx`. Rotate every 365 days. NEVER commit `.env`.

## Steps

### 1. Generate the token

1. Go to <https://www.npmjs.com/settings/chirag127/tokens>.
2. Click **Generate New Token** → **Granular Access Token**.
3. Fill in:
   - **Token name**: `oriz-automation-YYYY-MM`
   - **Expiration**: 365 days
   - **Allowed IP ranges**: leave blank
   - **Packages and scopes**:
     - Permission: **Read and write**
     - Scope: **Selected packages and scopes** → add `@chirag127` (the whole scope, NOT a single package).
   - **Organizations**: leave blank.
4. **Critical settings** under the same form:
   - **"Bypass 2FA for publish"** = **ON**
   - **"Bypass 2FA for unpublish"** = **ON** (separate toggle — both must be ON)
5. Click **Generate Token**. Copy the `npm_xxxxx` string. You won't see it again.

If you only see one combined "Bypass 2FA" toggle, that one switch covers both publish and unpublish — turn it on.

### 2. Store it

Paste into `c:/D/oriz/.env`:

```ini
NPM_TOKEN=npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

For GitHub Actions, also set at the org level (per [[github-org-level-secrets]]):

```bash
gh secret set NPM_TOKEN --org chirag127 --visibility all --body "$NPM_TOKEN"
```

### 3. Use it for unattended publish

Write a temp `~/.npmrc` from the env var at the top of any publish script:

```bash
NPM_TOKEN=$(grep '^NPM_TOKEN=' c:/D/oriz/.env | sed 's/^NPM_TOKEN=//')
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > "$HOME/.npmrc"
npm whoami    # must print: chirag127
npm publish --access public
```

For unpublish:

```bash
npm unpublish "@chirag127/<name>" --force
```

The `--force` is required to delete a package that has multiple versions. Without it, only the latest version unpublishes. Note: npm blocks **republishing the same version** of an unpublished package for 24h; bump the version (e.g. 0.1.0 → 0.1.1) when reviving a deleted slug.

### 4. Verify the token works for both ops

```bash
# Publish test (dry-run is enough)
cd repos/oriz/own/lib/npm/<name>-npm-pkg
npm publish --access public --dry-run

# Real publish test (creates a real 0.1.x)
npm publish --access public

# Unpublish test (within 72h of publish)
npm unpublish "@chirag127/<name>" --force
```

If any step fails with `403 ... Two-factor authentication or granular access token with bypass 2fa enabled is required`, the bypass toggle wasn't set on the token. Generate a new one with the toggle ON; the old token can be left in place (npm allows multiple active tokens).

## Failure modes seen

| Error | Cause | Fix |
|---|---|---|
| `403 ... bypass 2fa enabled is required to publish` | Token missing publish-bypass toggle | Regenerate token with toggle ON |
| `403 ... DELETE ... requires TFA and provide an OTP` | Token missing unpublish-bypass toggle | Regenerate with BOTH toggles |
| `400 Cannot publish over previously published version "X.Y.Z"` | npm blocks republish-same-version for 24h+ after unpublish | Bump to next patch version |
| `404 Not Found - GET .../@chirag127%2f<name>` | Already unpublished | No action; package is gone |
| `npm whoami` prints empty / random | `~/.npmrc` has wrong token / no token | Rewrite `~/.npmrc` from `.env` |

## Cross-refs

- The 18-package set this enables → [[the-23-packages]]
- Secrets management pattern → [[env-and-secrets-single-source]]
- Org-level secret setup → [[set-github-org-level-secrets]]
- No-hardcoded-secrets rule → [[no-hardcoded-secrets]]
