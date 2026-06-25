---
type: index
title: Hosting
description: Index of concepts in runbooks/hosting.
tags:
- index
- hosting
timestamp: '2026-06-24'
format_version: okf-v0.1
status: active
---

# Hosting

## Concepts

- [Cf Dns Add Api Subdomain](./cf-dns-add-api-subdomain.md) — No description available.
- [Cf Dns Audit 2026 06 23](./cf-dns-audit-2026-06-23.md) — No description available.
- [Cloudflare Pages — branch deploys mitigation for 100-project limit](./cf-pages-branch-deploys.md) — CF Pages caps free tier at 100 projects per account. Family has 26 apps → 26 projects, well under the limit. Use branch-based environments inside each project (main = production, staging = staging.<project>.pages.dev, PR branches = auto preview URLs) instead of creating separate projects per environment.
- [Codeberg as 2nd git remote — DR mirror for the family](./codeberg-mirror-2026-06-23.md) — Set up Codeberg.org as a passive read-only mirror for the 60+ oriz family repos. Mirror runs nightly via GitHub Actions in the meta-repo. Free, no payment. If GitHub becomes unavailable (DDoS, account lockout, takedown), clone from Codeberg and re-deploy in <30 min. Locked 2026-06-23.
- [Manage a private organization repository mirroring public upstream releases](./git-upstream-merge-private-fork.md) — How to clone a public Chrome extension to a private organization repository and merge upstream updates smoothly with minimal conflicts.
- [Migrate chirag127/* repos to oriz-org GitHub Organization (one-time)](./migrate-to-oriz-org.md) — Step-by-step: create the `oriz-org` GH Organization (both `oriz` and `oriz-in` were taken), transfer all 76 chirag127/* repos under it, set org-level secrets ONCE (61 keys), delete per-repo duplicates. Eliminates the 3,770-API-call sync storm and enables true org-level env management.
- [Mirror all hosts setup — one-time token generation + repo pre-creation for all 6 hosts](./mirror-all-hosts-setup.md) — One-time setup runbook to configure the 6-host automatic git mirror for oriz-org and chirag127. Covers: token generation for GitLab, Codeberg, Bitbucket (API Token, NOT App Password), GitFlic, Azure DevOps, and AWS CodeCommit; pre-creating mirror repos on each host; storing tokens at chirag127 GitHub org level; and running the first dry-run. All steps automated except the token generation (browser UI). No manual recurring sync.
- [Mirror cron — pre-flight checklist](./mirror-cron-prep.md) — Pre-flight checklist for the Friday 03:30 IST 4-host git mirror cron at `.github/workflows/mirror-all.yml`. Generate 4 host tokens with write+create-repo scope, pre-create 51 empty mirror repos on each host, store all tokens at chirag127 GH org level, and run a first-pass dry-run to verify the bare-clone push lands on every host.
