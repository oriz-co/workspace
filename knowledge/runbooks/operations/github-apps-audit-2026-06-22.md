---
type: runbook
title: "GitHub Apps audit \u2014 chirag127 account, 2026-06-22"
description: "One-shot audit of every GitHub App installed on the chirag127 account,\
  \ surfaced via check-suite enumeration. Each row: app slug, observed activity, recommendation\
  \ (KEEP/REMOVE/REVIEW). No auto-uninstall \u2014 humans pull the trigger."
tags:
- runbook
- github-apps
- audit
- security
- free-tier
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- runbooks/operations/install-github-apps
- runbooks/operations/dependabot-notification-tuning
- services/free-tier-catalog
- rules/interaction/no-card-on-file
---



# GitHub Apps audit — 2026-06-22

## How this audit was built

The `/user/installations` REST endpoint requires a **GitHub-App-authorised user token**, which our standard `gho_*` OAuth token does not carry. Instead, this audit enumerates apps via **check-suite actors** across a 7-repo sample (`oriz`, `oriz-pages-blog-app`, `oriz-cs-me-app`, `oriz-app`, `oriz-paisa-finance-tools-app`, `astro-shell-npm-pkg`, `agents-md-sync-skill`):

```bash
gh api "repos/chirag127/<repo>/commits/<sha>/check-suites" \
  --jq '.check_suites[] | "\(.app.slug)|\(.status)|\(.conclusion)"'
```

`status=completed` = the app has actually executed on the repo. `status=queued` only = the app is *installed* (so GitHub creates a check-suite stub) but has either no config or no triggering event yet.

**33 apps surfaced. Only 3 actively run (`deepsource-io`, `socket-security`, `github-actions`). 30 sit perpetually queued — installed but inert.**

## The audit table

| # | App slug | Purpose | Status (sample of 7) | Triggered? | Recommendation | Why |
|---|---|---|---|---|---|---|
| 1 | `github-actions` | Built-in CI | 2/2 completed | YES | **KEEP** | Core to the family CI/CD |
| 2 | `dependabot` | Dep updates + security alerts | 1/1 completed | YES | **KEEP** | Source of email noise but kept — config tamed per [`dependabot-notification-tuning.md`](./dependabot-notification-tuning.md) |
| 3 | `deepsource-io` | Static analysis | 5/7 completed | YES | **KEEP** | Already running on most repos; matches install-github-apps.md plan |
| 4 | `socket-security` | Supply-chain SAST | 6/7 completed | YES | **KEEP** | Active; high-value vs Snyk/GitGuardian overlap |
| 5 | `sonarqubecloud` | SAST + quality | 0/7 completed | NO | **REVIEW** | Listed in install-github-apps.md but missing `sonar-project.properties` — fix or remove |
| 6 | `codacy-production` | Lint + complexity | 0/7 completed | NO | **REVIEW** | Listed in install-github-apps.md plan; install consent likely incomplete |
| 7 | `coderabbitai` | AI PR review | 0/7 completed | NO | **REVIEW** | Should run on PRs; no PRs in sample. Check on next real PR |
| 8 | `renovate` | Dep auto-PRs | 0/6 completed | NO | **REVIEW** | Overlaps with Dependabot. Pick one (Dependabot is now well-tuned; consider REMOVE Renovate) |
| 9 | `mergify` | PR queue + auto-merge | 0/6 completed | NO | **REVIEW** | Needs `.mergify.yml` per repo. Either configure or REMOVE |
| 10 | `codecov` | Coverage upload | 0/7 completed | NO | **REMOVE** | Needs per-repo token; never set. Overlaps with future Codacy coverage |
| 11 | `snyk-io` | Vuln scanning | 0/7 completed | NO | **REMOVE** | Overlaps with Dependabot + Socket Security. Free tier requires card-on-file for private repos → conflicts with rule 2 |
| 12 | `gitguardian` | Secrets scanning | 0/7 completed | NO | **REMOVE** | Overlaps with GitHub secret-scanning (free public) + push-protection. Email-noisy when triggered |
| 13 | `codefactor-io` | Lint aggregator | 0/7 completed | NO | **REMOVE** | Pure overlap with DeepSource + Codacy |
| 14 | `sourcery-ai` | Python refactor | 0/7 completed | NO | **REMOVE** | No Python in family (rule: ts-only); inert across all repos |
| 15 | `greptile-apps` | AI code review | 0/7 completed | NO | **REMOVE** | Overlaps with CodeRabbit. Pick one (CodeRabbit is already in install plan) |
| 16 | `kilo-code-bot` | AI coding bot | 0/7 completed | NO | **REMOVE** | No clear use case in this family; not in install plan |
| 17 | `autofix-ci` | Lint autofix | 0/7 completed | NO | **REMOVE** | Overlaps with `biome --fix` in CI; not configured |
| 18 | `check-run-reporter` | Test aggregator | 0/7 completed | NO | **REMOVE** | Inert; replaced by GH Actions native test summary |
| 19 | `nx-cloud` | Nx remote cache | 0/7 completed | NO | **REMOVE** | Not using Nx — Turborepo's catalog mode handles caching |
| 20 | `mintlify` | Docs hosting | 0/5 completed | NO | **REMOVE** | Using Astro Starlight (`packages.oriz.in`); Mintlify needs card-on-file |
| 21 | `vercel` | Hosting | 0/7 completed | NO | **REMOVE** | Rule: CF Pages preferred (`no-paid-self-hosting-only.md`) |
| 22 | `netlify` | Hosting | 0/7 completed | NO | **REMOVE** | Same — CF Pages only |
| 23 | `render` | Hosting | 0/7 completed | NO | **REMOVE** | Same — CF Pages only |
| 24 | `fly-io` | Hosting | 0/7 completed | NO | **REMOVE** | Same — CF Pages only |
| 25 | `railway-app` | Hosting | 0/7 completed | NO | **REMOVE** | Same — CF Pages only |
| 26 | `azure-pipelines` | CI | 0/7 completed | NO | **REMOVE** | Rule 9: Linux-only ubuntu-latest on GH Actions. Azure CI not used |
| 27 | `expo` | Mobile builds | 0/7 completed | NO | **REMOVE** | Family is PWA-first (PWABuilder, not native). No Expo projects |
| 28 | `supabase` | Database hosting | 0/7 completed | NO | **REMOVE** | Using Firebase + CF KV/R2/D1; no Supabase repos |
| 29 | `tembo` | Postgres hosting | 0/7 completed | NO | **REMOVE** | Not using; Postgres only via Firebase Data Connect |
| 30 | `smithery` | MCP registry | 0/7 completed | NO | **REVIEW** | If you publish MCP servers there, KEEP; otherwise REMOVE |
| 31 | `cursor` | Cursor.sh agents | 0/7 completed | NO | **REVIEW** | Useful if you use Cursor; otherwise REMOVE. Doesn't cause noise |
| 32 | `cloudflare-workers-and-pages` | Deploy preview | 6/7 completed | YES (1) | **KEEP** | Active on CF Pages targets — core to hosting rule |
| 33 | `github-pages` | Pages deploy | 0/1 completed | NO | **REMOVE** | CF Pages is the standard, not GH Pages |

## Recommended actions (in priority order)

### Batch 1: KEEP (no action)

`github-actions`, `dependabot`, `deepsource-io`, `socket-security`, `cloudflare-workers-and-pages`.

### Batch 2: REMOVE these 20 inert apps (manual, ~5 min)

Go to <https://github.com/settings/installations> and click **Configure** on each, then **Uninstall**:

`codecov`, `snyk-io`, `gitguardian`, `codefactor-io`, `sourcery-ai`, `greptile-apps`, `kilo-code-bot`, `autofix-ci`, `check-run-reporter`, `nx-cloud`, `mintlify`, `vercel`, `netlify`, `render`, `fly-io`, `railway-app`, `azure-pipelines`, `expo`, `supabase`, `tembo`, `github-pages`.

### Batch 3: REVIEW + decide (~10 min)

| App | Question | Default if unclear |
|---|---|---|
| `sonarqubecloud` | Add `sonar-project.properties` template + workflow? | KEEP if doing it this week, else REMOVE (DeepSource covers SAST) |
| `codacy-production` | Same — needs config | REMOVE (DeepSource + Socket cover the niche) |
| `coderabbitai` | Run on next PR? Free tier OK? | KEEP — install plan explicitly chose this |
| `renovate` | Dependabot is now batch-grouped — Renovate adds what? | REMOVE — Dependabot tamed is enough |
| `mergify` | Worth adding `.mergify.yml` to all repos? | KEEP if auto-merge is a goal; REMOVE if manual merges are fine |
| `smithery` | Publish any MCP servers? | KEEP if yes (per `oriz-omni-post` plans); else REMOVE |
| `cursor` | Use Cursor.sh? | KEEP if yes; REMOVE if Claude Code only |

## Email-noise impact estimate

Of the 1,300+ email backlog, the breakdown is approximately:

- **~90%** = Dependabot daily updates from 41+ repos = **already fixed** by the `dependabot.yml` sweep + user notification setting changes (Phase 1 + 2 of [`dependabot-notification-tuning.md`](./dependabot-notification-tuning.md))
- **~5%** = `snyk-io` / `gitguardian` alerts that overlap with Dependabot — removing both kills this
- **~3%** = Failed deploy notifications from Vercel/Netlify/Render/Fly/Railway/Azure that nobody monitors — removing kills this
- **~2%** = Misc (mintlify, expo, sourcery) — removing kills this

Total expected reduction after Batch 2 removals: **>97%** of the daily Dependabot/security-app email volume.

## Why no auto-uninstall

GitHub deliberately requires human consent to install AND uninstall apps. There is no API endpoint to uninstall on someone's behalf — that's a security feature (matches the install-github-apps.md note). Each uninstall is one click on the user's account settings page.

## Related

- [`dependabot-notification-tuning.md`](./dependabot-notification-tuning.md) — Phase 1 + 2 fixes
- [`install-github-apps.md`](./install-github-apps.md) — what we WANTED installed (7 apps); reality is 33 (this audit reveals the 26 we never planned)
- [`rotate-leaked-secret.md`](../security/rotate-leaked-secret.md) — adjacent security runbook
- Rule [`no-card-on-file.md`](../../rules/interaction/no-card-on-file.md) — disqualifies Mintlify/Snyk-private/etc.
- Rule [`no-paid-self-hosting-only.md`](../../rules/infrastructure/no-paid-self-hosting-only.md) — Vercel Hobby/Netlify free/Render free/Fly free now ALLOWED (post-2026-06-22 reversal); paid tiers still banned
