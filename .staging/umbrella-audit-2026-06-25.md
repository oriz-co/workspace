# Umbrella audit — c:\D\oriz\ root

Read-only audit. No file was modified. All recommendations are for human review.
Date: 2026-06-25. Scope: top-level only; `repos/<slug>/`, `.git/`, `node_modules/` excluded.

## Summary

- **Total top-level entries: 46**  (22 dirs + 24 files including hidden)
- **KEEP: 18**  (core/docs/knowledge/config + active scripts dir)
- **DELETE candidates: 13**  (total size: ~43 MB — dominated by `.tmp-scaffold/` 15 MB, `.playwright-cli/` 22 MB, `.tmp-screenshots/` 5.6 MB)
- **MOVE candidates: 4**
- **REVIEW: 11**

The dominant cleanup wins are the three `.tmp-*` / sandbox dirs (~43 MB), the empty scratch files at root, and the duplicate rule files inside `knowledge/rules/` (the root copies appear superseded by the categorized subdirs).

---

## Inventory

### KEEP (core)

- `.git/` — git data (out of scope)
- `.gitignore` — well-curated; already ignores `.tmp-*`, `.playwright-cli/`, `logs`, `pnpm-lock.yaml`, scratch markdown, etc.
- `.gitmodules` — submodule registry (6.8 KB; matches current flat `repos/` layout)
- `.sops.yaml` — SOPS config (119 B)

### KEEP (docs / knowledge)

- `README.md` (16 KB, 2026-06-24) — top-level readme
- `AGENTS.md` (11 KB, 2026-06-25) — agent OKF rules
- `CLAUDE.md` (1.1 KB) — pointer to AGENTS.md (Claude Code)
- `AIDER.md`, `COPILOT.md`, `CURSOR.md`, `GEMINI.md` (~1 KB each, 2026-06-24) — per-agent pointer files mirroring `CLAUDE.md`
- `knowledge.md` (1.8 KB) — root-level pointer redirecting to `knowledge/` (intentional, documented inside)
- `knowledge/` (6.4 MB) — OKF brain. Stale items flagged in section below.

### KEEP (config)

- `.github/workflows/` — 6 workflow files (ci.yml, deploy.yml, mirror-all.yml, backup-restore-test.yml, backup-metadata-b2.yml, sync-env-to-org-secrets.yml)
- `.vscode/envpact.json` (124 B) — small editor config
- `package.json` (445 B), `pnpm-workspace.yaml` (988 B) — monorepo config
- `pnpm-lock.yaml` (708 KB, 2026-06-25) — current lockfile (gitignored, but needed locally)
- `scripts/` — active scripts directory (audited below)

### KEEP (secrets — local only)

- `.env` (17 KB) — gitignored
- `.env.enc` (38 KB) — SOPS-encrypted env (committed)
- `.sops-age-key.txt` (189 B) — gitignored age key (local)

---

### DELETE candidates

| Path | Size | Last touched | Why delete |
|---|---|---|---|
| `.tmp-scaffold/` | 15 MB | 2026-06-23 | Scaffold output for `oriz-india-train-schedules-api`. Contains a 14 MB `trains-raw.json` raw dump. Already gitignored (`.tmp-*`). Workflow output — the repo has moved on. |
| `.tmp-screenshots/` | 5.6 MB | 2026-06-22 | Visual audit screenshots from 2026-06-22. Two folders `audit-2026-06-22-late-evening/` + `audit-final/` plus a handful of one-off snap scripts. Already gitignored. Audit superseded by later work. |
| `.playwright-cli/` | 22 MB | 2026-06-23 | Playwright sandbox: 100+ `page-2026-06-23T17-*.yml` console/page dumps, console logs, nested `node_modules/`. Already gitignored (`.playwright-cli/`). Pure scratch. |
| `screenshots/` | 0 B | 2026-06-23 | Empty directory. |
| `2026-06-23.md` | 0 B | 2026-06-23 | Empty Obsidian daily note. Already matches `/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9].md` gitignore pattern. |
| `a.md` | 0 B | 2026-06-25 | Empty scratch file. Already gitignored (`/a.md`). |
| `Untitled.base` | 39 B | 2026-06-23 | Obsidian artifact. Matches `*.base` gitignore. |
| `Untitled 1.base` | 39 B | 2026-06-23 | Obsidian artifact. Matches `*.base` gitignore. |
| `Untitled.canvas` | 2 B | 2026-06-23 | Obsidian artifact. Matches `*.canvas` gitignore. |
| `.obsidian/` | 22 KB | 2026-06-24 | Obsidian app config (workspace.json, graph.json, etc.). Gitignored. Keep on disk if Chirag still opens this folder in Obsidian; otherwise delete. |
| `.claude/tmp_monorepo_fetch.txt` | 130 KB | 2026-06-20 | Tool-call scratch dump. Not loaded by Claude Code anymore. |
| `cf_cleanup.py` | 18 KB | 2026-06-23 | One-off cleanup script. Already gitignored (`/cf_cleanup.py` in scratch section). |
| `logs/` | 340 KB | 2026-06-23 | `cf-recreate/` log dumps from a one-off migration. Already gitignored (`logs`). |

Total: ~43 MB of low-value transient data.

### MOVE candidates

| Path | Suggested destination | Why |
|---|---|---|
| `oriz-desktop.yml` (24 KB, 2026-06-23) | `templates/oriz-desktop.yml` or DELETE | Looks like a Playwright/CDP page dump (filename suggests a snapshot of `oriz` desktop). Not referenced by workflows. |
| `pkg-snap.yml` (36 KB, 2026-06-23) | `.staging/` or DELETE | Page snapshot artifact (matches `page-...yml` shape inside `.playwright-cli/`). Not config. |
| `DEPLOY.md` (9.7 KB, 2026-06-22) | `knowledge/runbooks/deploy.md` or merge into existing | Top-level deploy doc; OKF home is `knowledge/runbooks/`. Confirm not duplicated there before move. |
| `.staging/template/` + `.staging/backup-repo/` | `templates/` or delete after diff | Two project skeletons sitting in `.staging/`. `backup-repo/` mirrors the new `repos/backup` submodule — confirm it's not stale before move. |

### REVIEW

| Path | Why ambiguous | Decision needed |
|---|---|---|
| `.staging/` (557 KB) | Mixed: 5 fresh plan/commit-message files dated 2026-06-25 (today) + 2 stale subdirs (template/, backup-repo/). Today's files are session scratch. | Sweep on session end: archive the plan/commit-message txt files, decide what to do with the two subdirs. |
| `.staging/dns-fix-plan.md` (12 KB, 2026-06-25) | Fresh today | Keep through end of session; move/delete after DNS fix lands. |
| `.staging/github-state-verification.md` (3.9 KB, 2026-06-25) | Fresh today | Same — current session work. |
| `.staging/github-topics-plan.md` (14 KB, 2026-06-25) | Fresh today | Same — current session work. |
| `.staging/final-commit-message.txt` + `.staging/replan-commit-message.txt` (2026-06-25) | Pending-commit scratch | Delete after the corresponding commit lands. |
| `templates/` (56 KB) | Has `.github/dependabot.yml`, `per-site-ci/biome.json` + `sonar-project.properties`, but `per-lifestream-cron/` is empty. | Confirm consumers reference these (likely `scaffold-*.sh` scripts). Drop the empty `per-lifestream-cron/` directory. |
| `node_modules/` | At top level. Workspace install for the pnpm monorepo. | Keep (regenerable) — outside scope. |
| `.vscode/` (gitignored) but kept | Already matches the rule "keep small editor config locally" | Keep. |
| `.claude/settings.local.json` (680 B, 2026-06-25) | Active local Claude Code permissions | Keep. |
| `pnpm-lock.yaml` (gitignored, but committed conventionally elsewhere) | Gitignore line `pnpm-lock.yaml` in `.gitignore` is unusual for a pnpm monorepo | Verify intent — lockfiles usually ARE checked in. If accidental, drop the gitignore entry. |
| `repos/oriz/own/lib/npm/astro-test-utils-npm-pkg` in `.gitignore` | Old nested path from before flatten | Now that `repos/` is flat, this gitignore line targets a non-existent path. Drop it. |

---

## Inside `knowledge/`

The OKF brain is largely current, but `knowledge/rules/` shows a clear "old at root, new in categorized subdir" pattern. Top 10 stale candidates:

1. **`knowledge/rules/aws-lambda-exception.md`** — also exists at `knowledge/rules/infrastructure/aws-lambda-exception.md`. Likely the categorized copy is canonical.
2. **`knowledge/rules/agents-md-2025-discipline.md`** — duplicate of `knowledge/rules/agent/agents-md-2025-discipline.md`.
3. **`knowledge/rules/confirm-knowledge-deltas.md`** — duplicate of `knowledge/rules/agent/confirm-knowledge-deltas.md`.
4. **`knowledge/rules/free-tier-with-cost-controls.md`** — duplicate of `knowledge/rules/infrastructure/free-tier-with-cost-controls.md`.
5. **`knowledge/rules/future-overrides-past.md`** — duplicate of `knowledge/rules/interaction/future-overrides-past.md`.
6. **`knowledge/rules/keep-knowledge-fresh.md`** — duplicate of `knowledge/rules/agent/keep-knowledge-fresh.md`.
7. **`knowledge/architecture/packages/the-23-packages.md`** — flagged `status: superseded` (per supersession rule); confirm a successor file exists and its pointer line is intact.
8. **`knowledge/decisions/architecture/security/monetization-centralized-on-oriz-in.md`** — supersession-flagged. Memory `monetization-centralized-on-oriz-in` is also marked SUPERSEDED 2026-06-25 by `donations-only-no-pro-no-ads`. Confirm the new decision file exists in `decisions/monetisation/`.
9. **`knowledge/decisions/architecture/security/auth-firebase-login-account-2026-06-25.md`** — supersession-flagged (matches memory `auth-firebase-login-and-account-subdomains` → `auth-clerk-with-emergency-migrate`).
10. **`knowledge/decisions/architecture/packages/four-more-packages-22-total.md`** — supersession-flagged. Likely superseded by `five-shared-npm-packages-2026-06-25.md`.

Total files with `status: superseded` frontmatter: **35**. The supersession-not-deletion rule is being honored; just make sure each one has a pointer line to its successor. The 6 root-level duplicates in `knowledge/rules/` above appear to be older flat copies left behind when the rules tree was categorized — they should be merged or removed (after verifying the categorized copies are at least as fresh).

`knowledge/runbooks/free-hosting-providers/`, `hosting/`, `operations/`, `scaffolding/`, `security/` subdirs exist alongside flat files in the same dir — same flat-vs-categorized split pattern. Worth a focused pass.

---

## Inside `scripts/`

48 files, 388 KB total. One-line purposes + recommendations:

| Script | Last modified | Purpose | Recommendation |
|---|---|---|---|
| `.api-repo-map.json` | 2026-06-22 | api-repo lookup table | KEEP |
| `_scaffold-apps-data.mjs` | 2026-06-22 | apps-data scaffolder | REVIEW — is data-apps work still live? |
| `bring-back-22-plus-4-auth.sh` | 2026-06-24 | one-off submodule recovery | DELETE (one-off, completed) |
| `bulk-add-config-files.sh` | 2026-06-21 | bulk add CI configs | DELETE (one-off) |
| `bulk-enable-security.sh` | 2026-06-21 | enable repo security settings | DELETE (one-off) |
| `cf-audit-orphan-cnames.mjs` | 2026-06-24 | audit orphan CF CNAMEs | KEEP (utility) |
| `cf-dns-flip-proxy.mjs` | 2026-06-22 | toggle CF proxy | KEEP (utility) |
| `cf-dns-set-api-cnames.mjs` | 2026-06-22 | set API CNAMEs | KEEP |
| `cf-emergency-recreate.sh` | 2026-06-24 | recreate Pages projects | KEEP (runbook companion) |
| `cf-recreate.sh` + `cf-recreate-all.sh` | 2026-06-24 / 06-23 | CF Pages recreate | DELETE (matches DELETE'd `logs/cf-recreate/`) — or keep if still used |
| `cf-status-domains.mjs` | 2026-06-24 | domain status check | KEEP |
| `cf-zone-rules-api.mjs` | 2026-06-22 | CF zone rules | KEEP |
| `commit-all-submodules.sh` | 2026-06-24 | commit + push every submodule | KEEP |
| `commit-push-22-pkgs.sh` | 2026-06-24 | one-off (22 pkgs commit) | DELETE (one-off) |
| `delete-per-repo-secrets.mjs` | 2026-06-24 | per-repo secret cleanup | KEEP (matches org-secrets rule) |
| `dev-all.mjs` | 2026-06-24 | run dev across submodules | KEEP |
| `download-cws-extension.mjs` | 2026-06-24 | fetch Chrome Web Store ext | KEEP |
| `firebase-auth-domains.mjs` | 2026-06-24 | configure Firebase auth domains | REVIEW — Firebase auth was superseded by Clerk |
| `fix_broken_links.py` | 2026-06-24 | knowledge link fixer | KEEP |
| `fix-gh-pages-certs.mjs` + v2 + v3 + result JSONs | 2026-06-23 | GH Pages cert fix iterations | DELETE — already in gitignore (`/scripts/fix-gh-pages-certs*`) |
| `fix-package-json-repo-urls.sh` | 2026-06-24 | one-off repo-url fix | DELETE (one-off) |
| `gh-pages-cname-and-https.mjs` | 2026-06-22 | GH Pages CNAME + HTTPS | KEEP |
| `init-and-push-14-packages.sh` | 2026-06-24 | one-off 14-pkgs init | DELETE |
| `migrate-to-oriz-org.mjs` | 2026-06-24 | transfer repos to oriz-org | KEEP (matches fleet-owner rule; reusable for new fleet items) |
| `polish-{14,22,26}-repos.sh` | 2026-06-24 | one-off polish runs | DELETE (3 files) |
| `purge-22.sh` | 2026-06-21 | one-off | DELETE |
| `push-books.sh` | 2026-06-24 | push books submodules | REVIEW |
| `razorpay-bootstrap.mjs` | 2026-06-22 | Razorpay setup | DELETE — Razorpay killed per memory `donations-only-no-pro-no-ads` |
| `recover-22-from-npm.sh` | 2026-06-24 | one-off recovery | DELETE |
| `recover-and-scaffold-8.sh` | 2026-06-24 | one-off | DELETE |
| `relicense-to-mit.sh` | 2026-06-24 | one-off relicense | DELETE |
| `restructure_knowledge.py` | 2026-06-24 | one-off OKF restructure | DELETE (one-off; restructure done) |
| `rollout-api-docs.sh` | 2026-06-23 | API docs rollout | Already gitignored — DELETE |
| `scaffold-14-packages.sh` + `scaffold-3-missing.sh` + `scaffold-books.sh` + `scaffold-empty-tools.mjs` | 2026-06-24 | scaffolders | KEEP if `templates/` is still consumed; otherwise DELETE |
| `stub-and-publish-22.sh` | 2026-06-24 | npm stub publish | DELETE (one-off completed per memory) |
| `sync-env-to-org-secrets.mjs` | 2026-06-24 | env → GH org secrets | KEEP (matches `sync-env-to-org-secrets.yml` workflow) |
| `test-dev-mobile-debug.mjs` + `test-dev-oriz.mjs` | 2026-06-23 | local dev smoke | REVIEW |

Net: ~16 one-off scripts are safe DELETE candidates. The rest are reusable utilities matching runbook entries.

---

## Inside `.staging/`

| File | Created / Modified | Notes |
|---|---|---|
| `dns-fix-plan.md` | 2026-06-25 (today) | Current session — keep through end of session |
| `final-commit-message.txt` | 2026-06-25 (today) | Pending commit — delete after commit lands |
| `github-state-verification.md` | 2026-06-25 (today) | Current session |
| `github-topics-plan.md` | 2026-06-25 (today) | Current session |
| `replan-commit-message.txt` | 2026-06-25 (today) | Pending commit |
| `backup-repo/` | 2026-06-25 | Project skeleton — likely mirror of new `repos/backup` submodule. Confirm before delete. |
| `template/` | 2026-06-25 | Astro template skeleton (astro.config.mjs, components.json, tailwind.config.cjs, src/, public/). Move to `templates/`. |

Nothing older than 7 days — `.staging/` was apparently swept recently. Today's files stay; the two subdirs need a one-shot decision.

---

## Inside `tmp/`

| File | Last modified | Recommendation |
|---|---|---|
| `12-apis-deploy.log` | 2026-06-22 | DELETE (3 days old, one-off log) |
| `add-12-submodules.sh` | 2026-06-24 | DELETE (one-off — flatten and 12-api work is done) |
| `create-12-repos.sh` | 2026-06-24 | DELETE (one-off) |
| `flatten-submodules.py` | 2026-06-25 | DELETE — flatten done; matches memory `polyrepo-with-category-consolidation`/`fs-flat-over-nested` |
| `nest-submodules-by-category.py` | 2026-06-25 | DELETE — reverse migration already inverted by `unnest-submodules-to-flat.py` |
| `phase-e-resume.py` | 2026-06-25 | DELETE (one-off resume helper) |
| `run-all-scrapers.sh` | 2026-06-24 | REVIEW — is the per-repo scraper loop still useful? |
| `sample-data.sh` | 2026-06-24 | REVIEW |
| `scaffold-12-apis.mjs` | 2026-06-24 | DELETE (companion to `add-12-submodules.sh`, one-off) |
| `submodules-snapshot.txt` | 2026-06-25 | KEEP for now (audit artifact, useful for cross-check) or move to `.staging/` |
| `unnest-submodules-to-flat.py` | 2026-06-25 | DELETE after current flatten is committed |

Everything in `tmp/` is from a multi-day migration that just landed. Sweep after the current session's commits.

---

## Open questions

1. **Do you still use the `.obsidian/` vault** at the umbrella root? If yes, keep `.obsidian/` and the empty Untitled.base/canvas; if no, delete the lot.
2. **`pnpm-lock.yaml` is in `.gitignore`** — is that intentional? Pnpm monorepos normally check in the root lockfile so CI gets deterministic installs.
3. **`.gitignore` references `repos/oriz/own/lib/npm/astro-test-utils-npm-pkg`** — a path from the old nested layout. Drop it.
4. **`.staging/backup-repo/`** — is this the source for the new `repos/backup` submodule (now committed as `A repos/backup` in git status)? If so, delete; if not, move to `templates/`.
5. **`templates/per-lifestream-cron/` is empty** — drop the directory, or land the template files that were planned for it.
6. **Per-agent pointer files** (AIDER.md, COPILOT.md, CURSOR.md, GEMINI.md): all 4 are near-identical pointers. Confirm they're each consumed by their respective tool — if any agent ignores its file, drop it.
7. **`knowledge/rules/` flat-vs-categorized duplicates** (6 files identified) — confirm the categorized copy is canonical and remove the root copy, or vice versa.
8. **`oriz-desktop.yml` (24 KB) + `pkg-snap.yml` (36 KB)** at root — these read like Playwright page-snapshot dumps. Either move to `.tmp-screenshots/` (then delete with the rest) or confirm they're checked-in artifacts.
9. **`DEPLOY.md` at root** vs `knowledge/runbooks/` — should DEPLOY.md be merged into a runbook or kept as a quick-glance root pointer?
10. **`razorpay-bootstrap.mjs`** in scripts/ — Razorpay is killed per the donations-only memory. Safe to delete?
