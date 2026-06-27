# AGENTS.md — Oriz fleet agent guide

> Source of truth for every AI agent working in this monorepo.
> Read top-to-bottom on first encounter; skim by section on subsequent visits.
> When this file disagrees with `knowledge/`, `knowledge/` wins.

---

## TL;DR — the 5 things that matter most

1. **`oriz` is a polyrepo with 20 submodules under `repos/{own,frk}/<slug>/`.** Originals in `own/`, forks in `frk/`. Post-scope-cut (2026-06-25): only shipping content survives. See [`knowledge/decisions/architecture/fleet/scope-cut-2026-06-25.md`](./knowledge/decisions/architecture/fleet/scope-cut-2026-06-25.md).
2. **Zero in-house npm packages.** All deps community. Analytics inlined per app via `<script>` tags in `BaseLayout.astro`, env-gated. See [`knowledge/decisions/architecture/packaging/zero-in-house-packages-inline-analytics-2026-06-25.md`](./knowledge/decisions/architecture/packaging/zero-in-house-packages-inline-analytics-2026-06-25.md).
3. **No auth in apps or APIs.** Login lives in a separate TBD project; apps/APIs are 100% public. See [`knowledge/decisions/architecture/security/no-auth-in-apps-or-apis-2026-06-25.md`](./knowledge/decisions/architecture/security/no-auth-in-apps-or-apis-2026-06-25.md).
4. **No card-on-file, ever.** Hard rule. Has killed: CF R2, Vercel Pro, Auth0, Clerk Pro, Firebase Blaze, Twilio. See [`knowledge/rules/interaction/no-card-on-file.md`](./knowledge/rules/interaction/no-card-on-file.md).
5. **Donations only.** No Pro tier, no ads, no recurring fees. Buy Me a Coffee + GitHub Sponsors + UPI. See [`knowledge/decisions/architecture/monetisation/donations-only-2026-06-25.md`](./knowledge/decisions/architecture/monetisation/donations-only-2026-06-25.md).
6. **Search the web at least twice before any non-trivial decision.** No memory-only answers about tool availability, hosting limits, pricing, library status, "does X already exist." Two independent searches; cross-check; only then recommend. See [`knowledge/rules/agent/preferences/always-search-twice-before-deciding.md`](./knowledge/rules/agent/preferences/always-search-twice-before-deciding.md).
7. **No feature branches on own repos.** Commit directly to `main` on `chirag127/*` and `oriz-org/*`. Branches exist only for upstream PRs. See [`knowledge/rules/agent/preferences/no-branches-on-own-repos.md`](./knowledge/rules/agent/preferences/no-branches-on-own-repos.md).

---

## New-laptop bootstrap

If you're setting up oriz on a fresh Windows machine:

1. `gh auth login` (GitHub auth)
2. `git clone https://github.com/oriz-org/workspace.git C:\D\oriz --recurse-submodules`
3. `cd C:\D\oriz\repos\own\backup`
4. `.\bootstrap.ps1`

The script installs all software + Docker + Hr + MCPs + decrypts env (needs age key from Bitwarden).
Full details: `repos/own/backup/README.md` (private repo).

---

## Coding agents wired to this workspace

Five agents are supported. All read this file (`C:\D\oriz\AGENTS.md`) as the workspace source of truth via a per-agent stub at `C:\D\oriz\.agents\<agent>/`:

| Agent | Type | Install | Workspace stub | MCP config |
|---|---|---|---|---|
| **Claude Code** | CLI | (already installed) | `.agents/claude/CLAUDE.md` | `.mcp.json` |
| **OpenCode** | CLI | `npm i -g opencode-ai` | `.agents/opencode/AGENTS.md` | `.opencode/opencode.jsonc` |
| **Kilo Code** | VS Code ext | `code --install-extension kilocode.Kilo-Code` | `.agents/kilocode/rules/00-pointer.md` | `.kilocode/mcp.json` |
| **Cline** | VS Code ext | `code --install-extension saoudrizwan.claude-dev` | `.agents/cline/AGENTS.md` | `.vscode/mcp.json` |
| **Antigravity** | Standalone IDE | https://antigravity.google.com/ (manual) | `.agents/antigravity/AGENTS.md` | `.antigravity/mcp.json` (manual copy) |

Install the 4 CLI/extension agents at once: `C:\D\oriz\scripts\install-agents.cmd`. Idempotent, workspace-only (no global changes). Antigravity is a standalone IDE — install manually from Google's site.

When working in this workspace, every agent picks up this file. Agent-specific overrides go in the per-agent stub, never here.

---

## Agent rules (inlined — no plugin install)

Two prompt-engineering disciplines that all agents follow in this workspace. **These are rules, not skills/plugins.** Summaries inlined here so any agent reading `AGENTS.md` picks them up. Full rule text lives in `knowledge/rules/agent/` (linked per section).

### Ponytail — lazy senior dev (output discipline)

ACTIVE EVERY RESPONSE for code generation. The best code is the code never written.

Full rule: [`knowledge/rules/agent/ponytail.md`](./knowledge/rules/agent/ponytail.md). Summary below.

**The ladder** — stop at the first rung that holds:

1. **Does this need to exist at all?** Speculative need = skip it, say so in one line. (YAGNI)
2. **Already in this codebase?** A helper, util, type, or pattern that already lives here → reuse it.
3. **Stdlib does it?** Use it.
4. **Native platform feature covers it?** `<input type="date">` over a picker lib, CSS over JS, DB constraint over app code.
5. **Already-installed dependency solves it?** Use it. Never add a new one for what a few lines can do.
6. **Can it be one line?** One line.
7. **Only then:** the minimum code that works.

Read the task and trace the real flow end-to-end FIRST. The ladder runs AFTER you understand the problem.

**Rules:**
- No unrequested abstractions (no interface with one impl, no factory for one product).
- No boilerplate "for later" — later can scaffold for itself.

**Output pattern:** `[code] → skipped: [X], add when [Y].` Code first, ≤3 short lines of explanation. If explanation > code, delete the explanation.

**When NOT to be lazy:**
- **Never simplify away** input validation at trust boundaries, error handling that prevents data loss, or anything the user explicitly requested.
- **Never lazy about understanding the problem.** Ask MCQ questions liberally to clarify intent. The ladder shortens the *solution*, never the *reading*.
- **Proactively suggest extra features** the user did not explicitly request — via MCQ, with each feature as a separate option. Don't wait to be asked.

Source: [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) — MIT, adapted.

### Caveman — terse prose (token compression)

ACTIVE EVERY RESPONSE for prose only. Code/commits/PRs written normally.

Full rule: [`knowledge/rules/agent/caveman.md`](./knowledge/rules/agent/caveman.md). Summary below.

**Rules:**
- Drop articles (a/an/the), filler (just/really/basically/actually/simply), pleasantries (sure/certainly/of course), hedging.
- Fragments OK. Short synonyms (big not extensive, fix not "implement a solution for").
- Standard acronyms OK (DB/API/HTTP); never invent new abbreviations.
- Technical terms exact. Code blocks unchanged. Errors quoted exact.
- No tool-call narration, no decorative tables/emoji, no long raw error logs unless asked.
- Preserve user's dominant language (compress style, not language).
- Never name or announce the style. No "caveman mode on" headers. Output caveman-only.

**Pattern:** `[thing] [action] [reason]. [next step].`

❌ "Sure! I'd be happy to help you with that. The issue you're experiencing is likely caused by..."
✅ "Bug in auth middleware. Token expiry check use `<` not `<=`. Fix:"

**Drop terse mode when:**
- Irreversible action confirmations (rm -rf, git push --force, drop table, deploy to prod).
- Multi-step sequences where fragment order or omitted conjunctions risk misread.

Resume terse after the clear part.

Source: [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) — MIT, adapted.

---

## How agents update knowledge

- **Code-level facts** (file structure, signatures, current behaviour) → don't write; derive on read.
- **Durable architectural decisions** → write to `knowledge/decisions/<area>/<topic>-YYYY-MM-DD.md` using OKF frontmatter (see below).
- **User-specific feedback / preferences** → write to `~/.claude/projects/c--D-oriz/memory/<slug>.md` (per-session-loaded, not committed).
- **Superseded knowledge is HARD-DELETED.** `git log --follow <path>` is the audit trail. See [`knowledge/rules/agent/knowledge-deletion-not-supersession.md`](./knowledge/rules/agent/knowledge-deletion-not-supersession.md).
- **Read knowledge before changing anything.** Start at [`knowledge/index.md`](./knowledge/index.md) (1285 lines, 792 files indexed). Never scan ad-hoc.
- **One commit, one decision.** When a decision lands in chat, write the concept file + commit `docs(knowledge): <summary>` in the SAME turn.

---

## OKF frontmatter spec (Open Knowledge Format v0.1)

Every file in `knowledge/` starts with:

```yaml
---
type: decision | rule | runbook | service | glossary | index
title: "Human-readable title"
description: "One-sentence description (extracted into the index)."
tags: [keyword1, keyword2]
timestamp: YYYY-MM-DD
format_version: okf-v0.1
status: active                      # always 'active'; superseded files are deleted
supersedes:                         # optional list of paths this replaces
  - decisions/architecture/<other>
related:
  - decisions/architecture/<other>
  - services/<other>
---
```

`type` is the only required field. Full spec: [`knowledge/_okf.md`](./knowledge/_okf.md).

---

## Repo layout

```
c:/D/oriz/
├── repos/                           # 20 submodules total
│   ├── own/                         # originals (oriz-org/<slug>)
│   │   ├── agent-skills/            # symlinked into ~/.claude/skills and ~/.agents/skills
│   │   ├── backup/                  # restic→B2 keys + RECOVERY.md (private)
│   │   ├── blog, home, journal, me  # content + hub apps
│   │   ├── bookmark-mind-bs-ext     # browser extension
│   │   ├── oriz-janaushdhi-app, oriz-ncert-app, oriz-lore-app
│   │   ├── oriz-janaushdhi-book, oriz-me-book
│   │   ├── oriz-mmi-tickertape-mmi-api
│   │   ├── sops-lens-vsc-ext
│   │   └── userscripts/             # Tampermonkey/Violentmonkey scripts
│   └── frk/                         # upstreams we patched
│       ├── ai-rewrite-bs-ext
│       ├── claude-notifications-cli
│       ├── dearrow-plus-bs-ext
│       ├── freellmapi, omniroute    # 2-LLM-shim experiment
├── knowledge/                       # 792 files — the canonical brain
├── scripts/, templates/             # automation + scaffolds
├── README.md, AGENTS.md, CLAUDE.md
├── .env, .env.enc                   # sops+age encrypted single source of truth
```

Full rationale: [`knowledge/decisions/architecture/infrastructure/workspace-flat-repos-2026-06-25.md`](./knowledge/decisions/architecture/infrastructure/workspace-flat-repos-2026-06-25.md) + [`knowledge/decisions/architecture/infrastructure/umbrella-as-clone-entrypoint-2026-06-25.md`](./knowledge/decisions/architecture/infrastructure/umbrella-as-clone-entrypoint-2026-06-25.md).

---

## Rules (71 total) — non-negotiable

Grouped by subdirectory of `knowledge/rules/`. The full table with descriptions lives in [`knowledge/index.md`](./knowledge/index.md#rules-71-total).

### Agent behaviour (11) — `knowledge/rules/agent/`
- `agent-minimum-context` — operate on this repo with minimum upfront token cost.
- `auto-grill-on-architectural-decisions` — before any multi-file architectural choice, grill first.
- `confirm-knowledge-deltas` — when user contradicts/narrows/reverses knowledge, confirm before writing.
- `grill-on-loc-removal` — ≥50 LOC delete needs a grill-me MCQ first.
- `grill-to-knowledge` — every locked grill answer lands in `knowledge/`.
- `keep-knowledge-fresh` — read before acting, write decisions back same session.
- `knowledge-deletion-not-supersession` — `git rm` superseded files; git history is the audit trail.
- `knowledge-first` — durable info goes to `knowledge/`, never README/AGENTS.
- `read-before-edit` — always Read before Edit; harness enforces.
- `self-update-rule` — every locked decision = concept file + log line + commit in the same conversation.
- `agents-md-2025-discipline` — AGENTS.md short, sharp; bulk in `knowledge/`.

### Design (5) — `knowledge/rules/design/`
- `design-divergence-vs-dedup` — per-app variants where it matters; shared where it doesn't.
- `frontend-design-skill-baked-in` — every UI task approached as design lead at a small studio.
- `no-ad-slots-in-markup` — no empty `<div class="ad-slot">` reservations.
- `no-emoji-in-chrome` — no emoji in nav, headers, footers, wordmarks, `<title>`.
- `per-app-distinctive-frontend-design` — each app gets its own palette/type/signature.

### Development (20) — `knowledge/rules/development/`
- `always-latest-deps`, `astro-version-pin`, `community-packages-first`, `conventional-commits`, `env-example-mirrors-env-with-steps` (per-repo `.env.example` + `.env` in lock-step; every var documented with how-to-obtain steps), `fork-customization-minimum-conflict`, `fork-discipline`, `git-identity-chirag127-noreply`, `no-force-push-to-main`, `no-rebuilding-free-software`, `no-web3forms-server-side`, `one-branch-only`, `playwright-persistent-sessions`, `push-by-default`, `readme-star-badge-required`, `repo-naming`, `repos-work-independently`, `tests-parallel-and-master-install`, `use-pnpm`, `userscript-author-handle`.

### Infrastructure (10) — `knowledge/rules/infrastructure/`
- `aws-lambda-exception` (3rd-rail fallback), `cloudflare-pages-apps-only`, `cloudflare-pages-only`, `free-tier-with-cost-controls` (cards OK only with hard caps), `no-firebase-admin-in-workers`, `no-firebase-functions-blaze`, `no-paid-self-hosting-only`, `no-subscriptions`, `one-level-subdomain-only`, `shared-tenant-by-default` (one Sentry/GA4/Clarity family-wide).

### User interaction (21) — `knowledge/rules/interaction/`
- `auto-only-tracking`, `communication-stt-friendly`, `future-overrides-past`, `linux-ci-only`, `match-surrounding-style`, `never-delete-empty-placeholder-repos`, `never-hit-quotas` (≥10× headroom, alert at 60%), `no-card-on-file`, `openai-compat-for-all-ai-providers`, `parallel-by-default`, `parallel-fan-out-by-default`, `parse-mcq-other-for-context`, `profile-readme-cross-link`, `recruiter-strategy`, `telegram-channels-and-roles`, `user-prefers-atomic-split`, `user-prefers-deletion-over-archive`, `user-prefers-pure-tool-brand`, `user-prefers-same-name-repo-and-npm`, `user-prefers-strict-no-toggle`, `user-prefers-wider-coverage`.

### Security (4) — `knowledge/rules/security/`
- `github-org-level-secrets` — secrets at oriz-org level, not per-repo.
- `no-hardcoded-secrets` — all secrets via envpact + sops+age.
- `org-level-secrets-only-no-per-repo` — don't hit the GH API thousands of times.
- `submodule-env-files-three-file-pattern` — `.env` / `.env.development` / `.env.production` split.

> **Note 2026-06-25:** the older `env-example-synced-from-master` rule (single canonical `.env.example` at `templates/.env.example`) is superseded by [`rules/development/env-example-mirrors-env-with-steps`](knowledge/rules/development/env-example-mirrors-env-with-steps.md). Each repo now owns its own `.env.example` + `.env` independently; no umbrella-master template.

---

## Decisions — Architecture (301 total)

Read [`knowledge/decisions/architecture/`](./knowledge/decisions/architecture/) by subdir. Full list at [`knowledge/index.md`](./knowledge/index.md#decisions---architecture-301-total).

| Subdir | Count | Notable / recent |
|---|---|---|
| `apps/` | 17 | `fleet-strategy-build-gate-2026-06-25`, `finance-one-repo-ten-routes-2026-06-25`, `eleven-saturated-archived-2026-06-25` |
| `branding/` | 2 | `repo-naming-drop-oriz-prefix-2026-06-25`, `subdomain-path-based-on-category-2026-06-25` |
| `compute/` | 22 | `api-umbrella-hono-worker`, `hono-write-once-deploy-all-rails`, `cf-worker-quota-mitigation` |
| `content/` | 9 | `blog-cross-post-strategy`, `feeds-rss-atom-json`, `newsletter-split-buttondown-emailoctopus` |
| `database/` | 9 | `lifestream-jsonl-canonical`, `cloud-dbs-as-caches`, `db-add-neon-postgres` |
| `fleet/` | 1 | `scope-cut-2026-06-25` — 33 in-progress repos archived; ~20 production-content repos survive |
| `frontend/` | 16 | `framework-astro-react-tailwind-shadcn-2026-06-25`, `four-nav-surfaces-every-app`, `pwabuilder-as-primary-converter` |
| `general/` | 36 | `agent-skills-monorepo`, `mit-license-all-repos`, `maximum-libraries-policy`, `per-runtime-framework` |
| `infrastructure/` | 3 | `hosting-split-cf-and-gh-2026-06-25`, `umbrella-as-clone-entrypoint-2026-06-25`, `workspace-flat-repos-2026-06-25` |
| `knowledge-bundle/` | 1 | `depth-5-level-hierarchy` |
| `monetisation/` | 1 | `donations-only-2026-06-25` |
| `ops/` | 17 | `analytics-five-tier-stack`, `mirror-to-6-git-hosts`, `backup-restic-to-b2`, `seo-three-pillars` |
| `packages/` | 9 | `the-23-packages` (largely SUPERSEDED by zero-in-house-packages), `oriz-ai-providers-package`, `omni-publish-package` |
| `packaging/` | 1 | `zero-in-house-packages-inline-analytics-2026-06-25` |
| `security/` | 7 | `no-auth-in-apps-or-apis-2026-06-25`, `cross-site-auth-via-auth-oriz-in`, `payment-architecture-direct-links` |
| `stack/` | 22 | `automation`, `cli-tools`, `databases`, `extensions`, `hosting`, `javascript-typescript`, `python`, `rust`, `cpp`, `csharp`, `go`, `java`, `family-stack-lock`, `stack-picks-2026-06-22`, `tools-shape-and-priority` |
| `uncategorised/` | 128 | older flat files — see [`knowledge/index.md`](./knowledge/index.md#uncategorised-architecture-128) (being progressively re-homed) |

---

## Decisions — Other (84 total)

Process, branding, content, design, monetisation, policy, pricing, security, tooling subdirs of `knowledge/decisions/`.

| Subdir | Count | Themes |
|---|---|---|
| `branding/` | 12 | naming-policy-v6, oriz-org rename, title-case-oriz, oriz-me added |
| `content/` | 8 | 100-year strategy, age-gating, per-extension subdomains, journal-stays-auth-gated |
| `design/` | 12 | per-app design briefs (datasheet-dark, oriz-blog, oriz-books, oriz-cards, oriz-finance, oriz-home, oriz-image-tools, oriz-journal, oriz-me, oriz-pdf-tools) |
| `infrastructure/` | 11 | cloudflare-pages-for-all-sites, flat-subdomain-pattern, firebase-spark-forever, spaceship-registrar |
| `monetisation/` | 7 | playbook-no-card-rails, max-payment-methods (now SUPERSEDED by donations-only), adsense-apex-application |
| `policy/` | 15 | age-gating, commercial-use, journal-not-public, secrets-handling, public-private-line |
| `pricing/` | 1 | `three-tier-free-pro-max` (SUPERSEDED 2026-06-25 by donations-only) |
| `process/` | 6 | okf-as-canonical-format, one-branch-only-rule, per-repo-ci-workflows, code-quality-stack |
| `security/` | 12 | env-and-secrets-single-source, sops-plus-doppler-hybrid, security-headers-strategy, multi-provider-auth |
| `tooling/` | 1 | browser-mcp-chrome-devtools |

---

## Runbooks (49 total)

Step-by-step procedures. Read before running. Full list at [`knowledge/index.md`](./knowledge/index.md#runbooks-49-total).

| Subdir | Count | Highlights |
|---|---|---|
| `free-hosting-providers/` | 9 | static-sites, serverless-functions, databases, image-cdn, monitoring, object-storage, queues-pubsub, web-services, azure-student — per-provider free-tier numbers, adversarially verified |
| `hosting/` | 7 | `mirror-all-hosts-setup` (6-host git mirror), `cf-pages-branch-deploys`, `cf-dns-add-api-subdomain`, `codeberg-mirror-2026-06-23`, `git-upstream-merge-private-fork`, `cf-dns-audit-2026-06-23`, `mirror-cron-prep` |
| `operations/` | 22 | `add-new-decision` (OKF self-update flow), `install-and-bootstrap`, `clean-install`, `env-management`, `migrate-okf-to-new-version`, `bump-submodule-pointer`, `publish-userscript-to-greasyfork`, `publish-vscode-extension-to-marketplace`, `rename-repo`, `sync-env-example-to-all-repos` |
| `scaffolding/sites/` | 1 | `scaffold-tool-site` — bootstrap a tool site from stub to deployable |
| `security/` | 10 | `auth-setup`, `rotate-leaked-secret`, `set-github-org-level-secrets`, `restic-backup-setup`, `npm-publish-token-setup`, `razorpay-end-to-end-setup`, `credentials/rotate-cf-and-npm-tokens` |

---

## Services (171 total)

One file per third-party service, with free-tier numbers + role + swap cost. Read before adopting any new dep. Full list at [`knowledge/index.md`](./knowledge/index.md#services-171-total).

| Area | Count | Keepers (active) |
|---|---|---|
| **Hosting** | 11 | cloudflare-pages (primary), github-pages (survival mirror), 5 mirror hosts (gitlab, codeberg, bitbucket, gitflic, azure-devops, codecommit) |
| **Compute** | 3 | cloudflare-workers, github-actions, cloudflare-r2 |
| **Database** | 2 | neon-postgres, turso |
| **Auth** | 8 | firebase-auth (6 providers), passkeys, microsoft-sign-in, app-check-firebase, firebase-spark, recaptcha-enterprise |
| **Analytics** | 5 | cloudflare-web-analytics, google-analytics, microsoft-clarity, posthog, utm-tracking |
| **Monitoring** | 7 | better-stack (uptime + status + logs), sentry, cloudflare-workers-tail, healthchecks-io, instatus |
| **Payment** | 12 | buymeacoffee, github-sponsors, upi-direct, ko-fi, liberapay, opencollective, polar-sh (Razorpay/Lemon Squeezy on shelf) |
| **Email** | 4 | buttondown (tech), email-octopus (marketing), resend (transactional), mailerlite (fallback) |
| **Forms** | 4 | web3forms, static-forms, tally, formspree (fallback) |
| **Code quality** | 9 | codeclimate, codecov, coderabbit, deepsource, dependabot, github-insights, lines-of-code-badge, sonarcloud, tokei |
| **A11y** | 3 | axe-core, lighthouse-ci, pa11y |
| **AI** | 3 | puter-js (browser-side), cloudflare-workers-ai (server-side); openrouter REJECTED |
| **Image CDN** | 3 | cloudflare-images → wsrv-nl → imagekit (3-tier fallback) |
| **Image host** | 4 | repo-hosted-cf-pages → imgbb → imgur → github-user-content (4-tier replicate) |
| **Extension stores** | 5 | chrome-web-store, edge-add-ons, firefox-add-ons, vs-code-marketplace, open-vsx-registry |
| **Domain** | 4 | spaceship (registrar), cloudflare-dns, cloudflare-email-routing, cloudflare-registrar |
| **Cron** | 2 | cloudflare-cron-triggers, github-actions-schedule |
| **Queue** | 4 | cloudflare-queues (primary), upstash-qstash, inngest, deferred |
| **Other** | varies | ads (ezoic/mediavine), cdn (jsdelivr), code-embed (codepen/gists/stackblitz), comments (giscus), data-api (open-meteo/alpha-vantage), dev-tools (cloudflare-tunnel/wrangler), i18n (weblate), legal (privacy-page), perf (vercel-speed-insights), productivity (wakatime), push (fcm/knock), pwa (vite-pwa-astro), seo, secrets, security, short-link, social, storage, testing, tooling, video |

**Rejected services** (kept on disk for archaeology, status: rejected): openrouter, aws (general), azure-paid-tiers, backblaze-b2 (subsumed), firebase-hosting, tolgee, glitchtip, oracle-cloud, toggl-track, cloudflare-r2.

---

## Glossary

Family vocabulary under [`knowledge/glossary/`](./knowledge/glossary/) — split alphabetically: `a-c/`, `d-h/`, `i-n/`, `o-r/`, `s-z/`. Read when an unfamiliar term shows up.

---

## Memory file (not in this repo)

`~/.claude/projects/c--D-oriz/memory/MEMORY.md` carries ~44 personal/feedback memories, auto-loaded per session, not committed. Themes:

- Framework picks (React > Preact, Astro + Tailwind + shadcn)
- Build-gate (top-3 results must have a documented defect)
- No-card rule + kill history (CF R2, Vercel Pro, Auth0, Clerk Pro, Firebase Blaze)
- No-auth-in-apps-or-apis rule
- Hosting split (CF Pages for apps; GitHub Pages for landing pages)
- Donations only (no Pro, no ads, no recurring)
- Scope-cut (33 archived 2026-06-25; 20 survive)
- File-system layout (`own/` vs `frk/`, flat repos)
- Analytics stack (CF Web Analytics + Clarity + PostHog inline)
- Storage decisions need explicit grill (don't pre-pick around concerns)
- Knowledge supersession via DELETION (not status flag)

---

## How to commit

- **Branch first if on `main`.** Then `git checkout -b <slug>`.
- **Conventional commits.** `feat(scope): …`, `fix: …`, `docs(knowledge): …`, `refactor: …`, `chore: …`.
- **Push by default after pushing on this session's authorisation.** Otherwise: never push without explicit user say-so. Standing authorisation applies to `oriz-org/workspace` and submodules — but stops at paid API calls, repo deletions/transfers, domain transfers, and ≥50 LOC mass deletions (grill-me first).
- **Use `gh` CLI**, not the web UI, for GitHub ops.
- **One decision = one commit.** `docs(knowledge): <summary>` for every concept file write.

---

## Skills available

Skills live at `repos/own/agent-skills/<skill>/SKILL.md` (canonical) and are symlinked into `~/.claude/skills/` and `~/.agents/skills/`. The current set on this machine:

| Skill | Purpose |
|---|---|
| `frontend-design` | UI/UX component design patterns; one palette/type/signature per repo. |
| `playwright-cli` + `playwright-persistent-sessions` | Browser automation; signed binaries (works around Defender ASR on this machine). |
| `grill-me` | Adversarial decision-grilling pattern; outputs land in `knowledge/`. |
| `develop-userscripts` | Tampermonkey/Violentmonkey authoring conventions. |
| `karpathy-guidelines` | Karpathy's LLM/agent wiki guidelines. |
| `github-actions-docs` | GH Actions reference. |
| `secure-linux-web-hosting` | Linux server hardening. |
| `webapp-testing` | Full web app testing workflows. |
| `web-design-reviewer` | Review web design for UX/accessibility. |
| `smithery-ai-cli` | Smithery AI CLI usage. |
| `use-my-browser` | Drive the user's live browser session (auth-walled / localhost). |

Plus Claude-Code-specific skills installed in `~/.claude/skills/`: `code-review`, `security-review`, `verify`, `simplify`, `deep-research`, `update-config`, `fewer-permission-prompts`, `claude-api`, `run`, `loop`, `init`, `review`, `keybindings-help`.

Full skills inventory: [`knowledge/decisions/architecture/general/agent-skills-monorepo.md`](./knowledge/decisions/architecture/general/agent-skills-monorepo.md).

---

## Tooling

- **`pnpm`** for the workspace (`pnpm install -r` from `c:/D/oriz/`, never per-submodule).
- **`gh`** for GitHub ops (org secrets, repo create/rename/transfer, PRs, issues).
- **`wrangler`** for Cloudflare Workers / Pages / KV / R2 / D1 / Queues.
- **`playwright-cli`** skill for browser automation (signed binaries pass Defender ASR).
- **`sops` + `age`** for `.env.enc` ↔ `.env` decryption.
- **`restic`** + Backblaze B2 for backup (`runbooks/security/restic-backup-setup.md`).

---

## Where to find more

| Need | Open |
|---|---|
| Full file-by-file index | [`knowledge/index.md`](./knowledge/index.md) (1285 lines, 792 files) |
| OKF format spec | [`knowledge/_okf.md`](./knowledge/_okf.md) |
| Where-to-look map | [`knowledge/_navigation.md`](./knowledge/_navigation.md) |
| Claude-Code overlay | [`CLAUDE.md`](./CLAUDE.md) |
| Repo overview, tech stack, env management | [`README.md`](./README.md) |
| User session memories (not committed) | `~/.claude/projects/c--D-oriz/memory/MEMORY.md` |
| Bootstrap a fresh clone | [`knowledge/runbooks/operations/install-and-bootstrap.md`](./knowledge/runbooks/operations/install-and-bootstrap.md) |
| Lock a new decision in chat | [`knowledge/rules/agent/self-update-rule.md`](./knowledge/rules/agent/self-update-rule.md) |

---

## Standing authorisation

Agents may commit + push to `main` on `oriz-org/workspace` and any submodule **without further prompting**, **except** for:

- Paid API calls
- Repository deletions or transfers
- Domain transfers
- Mass deletions ≥50 LOC (rule [`grill-on-loc-removal`](./knowledge/rules/agent/grill-on-loc-removal.md) triggers a grill-me MCQ first)

For anything in that exception list, stop and ask via `AskUserQuestion` MCQ.

---

## OKF grounding rules

- **Ground every non-trivial answer in `knowledge/`.** Don't reason from memory when a concept file exists for the topic.
- **Query the index first.** Start at [`knowledge/index.md`](./knowledge/index.md) — it is the single source-of-truth catalogue of all 793 concept files. Do NOT grep the whole `knowledge/` tree before reading the index.
- **Lookup helper.** `python scripts/okf-index-lookup.py <term>` returns matching concept-file paths from the index. Stdlib-only, no proxy or LLM dependency. Use it before broad searches.
- **Cite concept files inline.** When an answer rests on a decision/rule/runbook, link the file (e.g. `knowledge/rules/agent/self-update-rule.md`) so the user can audit.
- **If `knowledge/` is silent on a decisive question,** invoke the self-update rule: write the concept file in the same turn the decision lands.
