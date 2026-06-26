---
type: rule
title: ".env.example mirrors .env with steps to obtain each value"
description: "Every repo has its own `.env.example` + `.env`. Identical keys; `.env.example` values are blank. Every variable is documented with steps to obtain it. When I add a var to one, I add it to both."
tags: [feedback, env, agent-preferences, security]
timestamp: 2026-06-25
format_version: okf-v0.1
status: superseded
superseded_by: rules-centralized-at-umbrella-no-per-repo
---

Every repo has its own pair of env files:

1. **`.env.example`** — checked into git. Keys present, values BLANK. Every variable has a comment block above it explaining what it does and how to obtain it.
2. **`.env`** — gitignored. Same keys as `.env.example`, with the real values filled in. Lives only on disk.

**Parity rule:** whenever a variable is added to one, it's added to the other in the same edit. The two files are kept in lock-step. Difference is only the values.

**Variable documentation rule:** every variable in `.env.example` MUST have a comment above it explaining:
1. What the variable does (1 line).
2. Exact steps to obtain the value (URL + click path or CLI command).
3. The format expected (e.g. `G-XXXXXXXXXX` for GA4, hex32 for HMAC, etc.).

**Example shape:**

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
```

**Per-repo rule:** every repo has its OWN `.env.example` + `.env`. NOT one shared file at the umbrella level. Each repo is independently runnable.

**Reverses (partially):** any pattern where vars were pulled from a parent umbrella `.env`. Future cross-repo shared secrets flow via GitHub org-level Actions secrets at build time (per `gh-org-secrets-build-time-inject`), NOT via a shared local `.env`.

**Generalizes:**
- Apps: `PUBLIC_*` vars are baked into the static output. `PRIVATE_*` vars stay in CI for build-time use (e.g. webhook secrets, fetch tokens for India-data API calls).
- APIs: Cloudflare Workers env vars. The `.env` is for local `wrangler dev`; CF Worker dashboard for production.
- Packages: usually NO env vars; if any (e.g. `OPENAI_API_KEY` for an LLM-helper package's tests), they live in the package's own `.env`.

**How to apply when user says "add env var X":**
1. Add `X=<value>` to `.env` (with real value).
2. Add `X=` to `.env.example` (blank value).
3. Above BOTH entries, add a comment block: what it does, where to get it, what format.
4. If there's a doc site, update its "Getting Started" page.
5. If there's a CI workflow that needs it, add to the workflow's `env:` block reading from GH secrets.

**SUPERSEDED 2026-06-26** by [`rules-centralized-at-umbrella-no-per-repo`](./rules-centralized-at-umbrella-no-per-repo.md) — only the umbrella has `.env.example`, submodules have none.
