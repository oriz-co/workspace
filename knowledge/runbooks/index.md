---
type: index
title: "Runbooks index — every operational procedure"
description: "Step-by-step procedures for the family. Auth setup, adding new sites/extensions, rotating leaked secrets, bumping submodule pointers, and the OKF self-update workflow. Each runbook is one concept file with numbered commands."
tags: [index, runbook, meta]
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
---

# Runbooks index

Operational procedures for the family. Each entry is a `type: runbook`
concept file with numbered commands and dashboard URLs.

A **runbook** is a sequence of human-actionable commands that a
person (or a sufficiently authenticated agent) can run to accomplish
a specific operational outcome. Runbooks are distinct from
`process` files (which describe *how the team operates*) and
`decision` files (which lock in *what we chose*).

## Active runbooks

| File | When to run | Run by |
|---|---|---|
| [`auth-setup.md`](./auth-setup.md) | First-time setup of a new machine, or after a multi-tool token rotation | User (interactive browser flows) |
| [`clean-install.md`](./clean-install.md) | Bootstrap the entire family on a fresh machine — recursive clone + pnpm install loop | User or agent (one-shot) |
| [`add-new-site-to-family.md`](./add-new-site-to-family.md) | Adding a new `oriz-<name>` site as a submodule | User (some steps), agent (most) |
| [`add-new-extension.md`](./add-new-extension.md) | Adding a new Chrome / Firefox / Edge extension as a submodule | User (some steps), agent (most) |
| [`add-new-decision.md`](./add-new-decision.md) | The OKF self-update workflow — capturing a chat decision into the knowledge bundle | Agent (always) |
| [`rotate-leaked-secret.md`](./rotate-leaked-secret.md) | When a secret has entered any transcript, screenshot, or untrusted log | User (revoke + reissue), agent (verify) |
| [`bump-submodule-pointer.md`](./bump-submodule-pointer.md) | After landing a feature in a submodule, bumping the master pointer | Agent (always) |
| [`rename-repo.md`](./rename-repo.md) | Renaming a repo to its role-suffixed slug (`-site` / `-ext` / `-vsc-ext` / etc.) and threading the rename through `.gitmodules`, package.json, README, and the master pointer | Agent (most), user (push + Cloudflare Pages reconnect) |
| [`rename-all-sites-to-suffix.md`](./rename-all-sites-to-suffix.md) | One-shot bulk migration of all 11 site repos to the `-site` suffix (driven by `scripts/rename-sites-to-suffix.sh`) | User-supervised (script pauses between sites) |
| [`apply-per-site-ci.md`](./apply-per-site-ci.md) | Land the per-repo CI scaffold (CI lint/typecheck/build + CF Pages deploy + GH Pages mirror + Dependabot + CodeQL + CodeRabbit + SonarCloud + Biome) into each of the 11 site submodules and 6 package submodules from `templates/per-site-ci/` | Agent (copy + commit), user (CF Pages project creation + secret setup + push) |
| [`restic-backup-setup.md`](./restic-backup-setup.md) | Set up the weekly restic → Backblaze B2 backup loop in a data-bearing repo (init repo, add weekly workflow, restore drill, retention policy) | Agent (copy + commit), user (one-shot `restic init` + first `gh workflow run`) |
| [`sync-env-example-to-all-repos.md`](./sync-env-example-to-all-repos.md) | Add / remove / rename a family-wide env var: edit master `templates/.env.example`, run `scripts/sync-env-example.sh`, commit + push every touched submodule + bump master pointers, verify with `scripts/verify-env-example-sync.sh` | Agent (run script + commit), user (push, especially for new keys) |
| [`set-github-org-level-secrets.md`](./set-github-org-level-secrets.md) | Pull a secret value from Doppler and set it at the `chirag127` ORG level for GitHub Actions (`gh secret set --org chirag127 --visibility all`); used after adding a new key to `templates/.env.example`, after a rotation, and on the quarterly audit | Agent (script run + verify), user (initial Doppler write) |
| [`add-package-to-catalog.md`](./add-package-to-catalog.md) | After publishing a new `chirag127/*-npm-pkg` repo, ensure it appears in packages.oriz.in catalog (auto-discovery handles 95%; this documents the speed-up `repository_dispatch` + group keyword) | Agent (config), user (PAT setup once) |
| [`cf-dns-add-api-subdomain.md`](./cf-dns-add-api-subdomain.md) | Wire a new `<sub>.api.oriz.in` CNAME → `chirag127.github.io` (DNS-only / grey cloud) via `scripts/cf-dns-set-api-cnames.mjs`. Idempotent. Includes DoH verification + GH Pages cert checklist. | Agent (script + verify), user (set Pages custom domain in target repo) |
| [`migrate-ci-platform.md`](./migrate-ci-platform.md) | Plan-B runbook: if GitHub Actions becomes unusable, translate every workflow to GitLab CI or CircleCI. Mirror cron keeps source on 4 hosts already. | User + agent |
| [`mirror-cron-prep.md`](./mirror-cron-prep.md) | Pre-flight checklist before the Friday 03:30 IST 4-host mirror cron can run: generate 4 host tokens (GitLab / Codeberg / Bitbucket / GitFlic), pre-create 51 empty mirror repos on each host, store 6 tokens at chirag127 GH org level, first-run dry-run via `workflow_dispatch`. | User (token gen), agent (scripted repo creation + verify) |
| [`install-and-bootstrap.md`](./install-and-bootstrap.md) | Fresh-clone OR existing-clone-update for the umbrella workspace — recursive submodule init + recursive pnpm install. THE canonical install procedure. | User (any session start), agent (any session start) |
| [`npm-publish-token-setup.md`](./npm-publish-token-setup.md) | First-time npm Granular Access Token setup with bypass-2FA toggles for publish + unpublish; used by every `@chirag127/*` package release | User (one-time token gen), agent (per-publish flow) |
| [`build-distributable.md`](./build-distributable.md) | Build PWA + Android APK (Bubblewrap TWA) + desktop EXE/dmg/AppImage (Tauri) from a single app via `@chirag127/astro-distribute` | Agent (CI), user (signing key setup) |
| [`migrate-okf-to-new-version.md`](./migrate-okf-to-new-version.md) | Placeholder for when OKF v0.1 → v0.2 happens | Agent + user |

## Where runbooks sit relative to the rest

- [`../policy/`](../policy/) — what the family does (the rules)
- [`../decisions/`](../decisions/) — what the family chose (the locks)
- [`./`](./) — how the family does it (the procedures)
- [`../glossary/`](../glossary/) — terms used in runbooks

## Cross-links

- Family conventions: [`../_okf.md`](../_okf.md)
- Family rules + mission: [`../../AGENTS.md`](../../AGENTS.md)
- Secrets policy: [`../policy/secrets-handling.md`](../policy/secrets-handling.md)
