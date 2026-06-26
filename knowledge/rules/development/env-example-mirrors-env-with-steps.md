---
type: rule
title: ".env.example mirrors .env with obtain-steps comments"
description: Every repo has its own .env.example (checked in, blank values) + .env (gitignored, real values). Identical keys. Every variable has comment block explaining what it does and how to obtain the value.
tags: [env, secrets, development, agent-rule, per-repo]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
related:
  - rules/development/per-repo-independence
  - decisions/architecture/packaging/gh-org-secrets-build-time-inject
---

# .env.example mirrors .env with obtain-steps comments

## Rule

Every repo has TWO env files maintained in lock-step:

1. **`.env.example`** — checked into git. All keys present. All values **blank**.
2. **`.env`** — gitignored. Same keys as `.env.example`. Real values.

When you add a variable to one, you add it to the other in the same edit. The two files have the same keys at all times. The only difference is `.env.example` values are empty strings.

## Mandatory comment block per variable

Every variable in `.env.example` MUST have a comment block immediately above it explaining:

1. **What the variable does** — one line.
2. **How to obtain the value** — exact steps: URL + click path, or CLI command.
3. **Format expected** — `G-XXXXXXXXXX`, hex32, JWT, etc.

## Example

```env
# Google Analytics 4 measurement ID — embedded in every page's <script> tag.
# Get it at: https://analytics.google.com/analytics/web/
#   1. Admin (bottom-left)
#   2. Data Streams → pick your stream
#   3. Copy "Measurement ID" (format: G-XXXXXXXXXX)
PUBLIC_GA4_MEASUREMENT_ID=

# Cloudflare API token with `Pages:Edit` + `Account:Read` scopes.
# Get it at: https://dash.cloudflare.com/profile/api-tokens
#   1. "Create Token" → "Custom token"
#   2. Permissions: Account → Cloudflare Pages → Edit; Account → Account Settings → Read
#   3. Account Resources: include all (or pin to oriz-org)
#   4. Copy the token (40 chars, starts with letters)
CF_API_TOKEN=

# Microsoft Clarity project ID — embedded in every page's <script> tag.
# Get it at: https://clarity.microsoft.com/projects
#   1. Create or open a project
#   2. Settings → "Setup" → copy the project ID (10-char alphanumeric)
PUBLIC_CLARITY_PROJECT_ID=
```

## Scope

- **Apps** (`repos/own/blog`, `repos/own/journal`, …): `PUBLIC_*` vars baked into static output. `PRIVATE_*` for build-time use (webhook secrets, fetch tokens for India-data API calls during build).
- **APIs** (`repos/own/<api>-api`, `repos/frk/freellmapi`, `repos/frk/omniroute`): `.env` is for local `wrangler dev`; production secrets in the Cloudflare Worker dashboard.
- **Packages** (`repos/own/<pkg>-npm-pkg`, `repos/own/<pkg>-py-pkg`): usually no env vars; if any (e.g. `OPENAI_API_KEY` for an LLM-helper package's tests), they live in the package's own `.env`.

## What this is NOT

- **NOT a shared umbrella `.env`.** Each repo is independently runnable; each has its own pair.
- **NOT a substitute for CI secrets.** Production tokens live in GitHub org-level Actions secrets, injected at build time per [[gh-org-secrets-build-time-inject]]. `.env` is for local dev only.
- **NOT for paid-tier-only services.** Env vars for services requiring a card-on-file are forbidden per [[no-card-on-file-prepaid-escape]].

## How to apply when adding a new variable

1. Add `X=<value>` to `.env` (real value).
2. Add `X=` to `.env.example` (blank value).
3. Above BOTH entries, add the comment block (what / how to obtain / format).
4. If there's a CI workflow that uses `X`, add to the workflow's `env:` block reading from GH org secrets.
5. If there's a getting-started doc, update its env-vars table.

## Why

- **Newcomers can clone any repo and run it** — every variable needed is documented inline.
- **No hidden state.** The list of required env vars is `git grep -E '^[A-Z_]+=' .env.example`.
- **Drift detection.** Any var missing from `.env.example` but present in `.env` (or vice versa) is a bug.
- **Self-documenting.** The how-to-obtain steps mean future-me (or any agent) doesn't have to re-derive where each value comes from.
