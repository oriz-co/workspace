# oriz

> A self-built family of free tools, content, and books — 27 web apps, 15 public JSON APIs, 23 npm packages, 5 books. One person. Free forever for users. Hosted on Cloudflare Pages + GitHub Pages + Firebase Spark.

[![hosted on Cloudflare](https://img.shields.io/badge/hosted-Cloudflare%20Pages-orange)](https://pages.cloudflare.com/)
[![auth Firebase](https://img.shields.io/badge/auth-Firebase-yellow)](https://firebase.google.com/)
[![billing Razorpay](https://img.shields.io/badge/billing-Razorpay%20INR-blue)](https://razorpay.com/)
[![license MIT](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

This is the **master umbrella repo** (`oriz-org/workspace`). It is a meta-repo whose `projects/` tree submodules every app, API, package, book, extension, and skill in the family. The user always works from here (`c:/D/oriz/`); per-submodule `pnpm install` is wrong — always `pnpm install -r` from the workspace root.

---

## The 60-second tour

```
oriz.in                  →  this repo's home-app (Astro static + Razorpay checkout)
account.oriz.in          →  oriz-auth-app   (sign-in surface, .oriz.in cookie session)
status.oriz.in           →  oriz-status-app (CF Worker cron + KV-cached uptime)
journal.oriz.in          →  oriz-roam-journal-app (flagship Pro/Max app)
*.api.oriz.in            →  15 JSON APIs (currency-rates, weather-forecast, …)
<slug>.oriz.in           →  25 apps total, each its own CF Pages project
```

| Layer | Count | Lives at |
|---|---|---|
| **Apps** (CF Pages) | 27 | `projects/oriz/own/prod/apps/{hub,content,personal,tools}/` |
| **APIs** (GH Pages JSON + Path D Astro page) | 15 | `projects/oriz/own/svc/api/` |
| **npm packages** | 23 | `projects/oriz/own/lib/npm/` (published as `@chirag127/*`) |
| **Books** | 5 | `projects/oriz/own/content/books/` |
| **Forks** (upstreams we patched) | 2 | `projects/oriz/forks/` |
| **Knowledge** | 58 rules + 181 decisions + 43 runbooks | `knowledge/` |

---

## Repo layout

```
c:/D/oriz/
├── projects/                              # submodules — 74 total
│   ├── c127/                              # chirag127 personal-account repos
│   │   └── own/prod/apps/personal/cs-me-app/   # me.oriz.in / cs.oriz.in (puter.js auth)
│   └── oriz/                              # oriz-org brand-org repos (the family)
│       ├── own/
│       │   ├── prod/                      # products: user-facing artifacts
│       │   │   ├── apps/                  # 26 Astro apps (Cloudflare Pages)
│       │   │   │   ├── hub/               # home-app, oriz-auth-app, oriz-status-app
│       │   │   │   ├── content/           # journal, blog, books, ncert, lore, financial-cards, …
│       │   │   │   ├── personal/          # (cs-me-app moved to c127/ 2026-06-24)
│       │   │   │   └── tools/             # 15 single-purpose tool apps
│       │   │   ├── bs-ext/                # browser extensions (placeholder)
│       │   │   ├── ide-ext/               # IDE / VS Code extensions (placeholder)
│       │   │   └── clis/                  # CLIs (renamed from py-pkg-cli; placeholder)
│       │   ├── svc/                       # services: server-side runtimes
│       │   │   ├── api/                   # 15 free India-data APIs (CF Workers + Pages)
│       │   │   ├── workers/               # oriz-flags-worker (no repo yet)
│       │   │   └── mcp/                   # MCP servers (placeholder)
│       │   ├── lib/                       # libraries: reusable published code
│       │   │   └── npm/                   # 23 packages published as @chirag127/*
│       │   └── content/                   # non-runnable assets
│       │       ├── books/                 # 5 long-form works
│       │       ├── data/                  # oriz-ai-providers-data
│       │       ├── skills/                # 2 agent skills
│       │       └── rules/                 # placeholder
│       └── forks/                         # forks maintained for the brand (Ai-rewrite, oriz-api-docs-template)
├── knowledge/                             # the canonical brain — read this before changing anything
│   ├── rules/                             # hard rules that govern every decision
│   ├── decisions/                         # locked architecture + service + pricing decisions
│   ├── runbooks/                          # step-by-step ops procedures
│   ├── services/                          # per-service free-tier evaluation
│   ├── architecture/                      # cross-cutting topology
│   ├── design/                            # design tokens + per-app briefs
│   ├── policy/                            # legal + ToS + privacy framework
│   ├── glossary/                          # family vocabulary
│   ├── index.md                           # canonical entry point
│   └── _navigation.md                     # "where to look" map
├── scripts/                               # automation (env sync, CF/GH ops, mirrors, audits)
├── templates/                             # per-site-ci + per-lifestream-cron skeletons
├── AGENTS.md                              # 30-line pointer for AI agents → links here
├── CLAUDE.md                              # pointer for Claude Code → links to AGENTS.md
├── .env                                   # SINGLE SOURCE OF TRUTH (gitignored, decrypted)
├── .env.enc                               # sops+age encrypted version (committed)
└── README.md                              # this file
```
├── knowledge/                             # the canonical brain — read this before changing anything
│   ├── rules/                             # hard rules that govern every decision
│   ├── decisions/                         # locked architecture + service + pricing decisions
│   ├── runbooks/                          # step-by-step ops procedures
│   ├── services/                          # per-service free-tier evaluation
│   ├── architecture/                      # cross-cutting topology
│   ├── design/                            # design tokens + per-app briefs
│   ├── policy/                            # legal + ToS + privacy framework
│   ├── glossary/                          # family vocabulary
│   ├── index.md                           # canonical entry point
│   └── _navigation.md                     # "where to look" map
├── scripts/                               # automation (env sync, CF/GH ops, mirrors, audits)
├── templates/                             # per-site-ci + per-lifestream-cron skeletons
├── AGENTS.md                              # 30-line pointer for AI agents → links here
├── CLAUDE.md                              # pointer for Claude Code → links to AGENTS.md
├── .env                                   # SINGLE SOURCE OF TRUTH (gitignored, decrypted)
├── .env.enc                               # sops+age encrypted version (committed)
└── README.md                              # this file
```

Full layout rationale: [`knowledge/decisions/architecture/projects-owner-own-forks-layout.md`](./knowledge/decisions/architecture/projects-owner-own-forks-layout.md).

---

## Tech stack (locked 2026-06-23, verified against npm)

| Layer | Pick | Why |
|---|---|---|
| **Framework** | Astro 7.0.0 | Static-first, multi-framework islands; Rolldown bundler under Vite 8 |
| **Hosting (apps)** | Cloudflare Pages | One project per app; custom domains on `*.oriz.in`; Free plan |
| **Hosting (APIs + non-apps)** | GitHub Pages | Let's Encrypt SSL handles 2-level `*.api.oriz.in` (rule 16) |
| **Auth** | Firebase Auth (4 providers: Google + GitHub + Email/Password + Phone Pro-gated) | 50K MAU free; centralized at `account.oriz.in` per industry pattern (Google/MS/Atlassian/Apple/Cloudflare 5-of-7) |
| **DB** | Firestore Spark | Single `oriz-app` project; 1 GiB + 50K reads/day free |
| **Edge state** | Cloudflare D1 + KV | Same Cloudflare account, no extra signup |
| **Payments** | Razorpay (INR rail) | Centralized checkout only on `oriz.in/pricing` (Razorpay forbids multi-merchant per business PAN) |
| **Image CDN** | 5-host replicate-everywhere | Cloudinary + ImageKit + imgbb + freeimage.host + GitHub Releases; first-200-wins on read |
| **Compute fallback chain** | Workers → Deno → AWS Lambda → Render → Koyeb | All 4 rails verified 2026-06-23; Hono for write-once-deploy-everywhere |
| **GPU batch** | Modal Labs | $30/mo recurring free credits, no card at signup |
| **Logs** | Better Stack + Axiom | Two-tier: search + retention |
| **Analytics** | CF Web Analytics + GA4 + Microsoft Clarity + PostHog | Layered; each layer has `ENABLE_*` killswitch |
| **Error tracking** | Sentry | 5K events/mo free |
| **Email** | Resend | 100/day free, transactional |
| **Feature flags** | Flagsmith | 50K req/mo free |
| **Formatter + linter** | Biome 2.5 | Replaces Prettier + ESLint |
| **TypeScript** | 6.0 strict | Whole family |
| **Package manager** | pnpm 11.8 | Workspaces for the 60+ packages |
| **Node** | 22 LTS | Set via `packageManager` + `engines` |

---

## Start here

| Need to | Open |
|---|---|
| Add a feature (any kind) | [`knowledge/rules/`](./knowledge/rules/) — read relevant rules first |
| Add a dependency | [`knowledge/rules/community-packages-first.md`](./knowledge/rules/community-packages-first.md) |
| Add a 3rd-party service | [`knowledge/rules/free-tier-with-cost-controls.md`](./knowledge/rules/free-tier-with-cost-controls.md) |
| Understand "why are we using X" | [`knowledge/decisions/`](./knowledge/decisions/) — search by service name |
| Run a one-off task (deploy, backup, audit) | [`knowledge/runbooks/`](./knowledge/runbooks/) |
| Spot a service's free-tier numbers | [`knowledge/runbooks/free-hosting-providers/`](./knowledge/runbooks/free-hosting-providers/) |
| Lock a new decision in chat | follow [`knowledge/rules/self-update-rule.md`](./knowledge/rules/self-update-rule.md) |
| Bootstrap a fresh clone | [`knowledge/runbooks/install-and-bootstrap.md`](./knowledge/runbooks/install-and-bootstrap.md) |
| See the "where to look" map | [`knowledge/_navigation.md`](./knowledge/_navigation.md) |

---

## Quick start

```bash
git clone --recurse-submodules https://github.com/oriz-org/workspace c:/D/oriz
cd c:/D/oriz
pnpm install -r                 # installs every submodule's deps via workspaces
pnpm run env:decrypt            # decrypts .env.enc → .env (needs .sops-age-key.txt)
```

Run any app or package:

```bash
pnpm -F <package.json#name> dev
pnpm -F <package.json#name> build
pnpm -F <package.json#name> test
```

Run everything in parallel:

```bash
pnpm -r --parallel <script>
```

Full bootstrap runbook with troubleshooting: [`knowledge/runbooks/install-and-bootstrap.md`](./knowledge/runbooks/install-and-bootstrap.md).

---

## The hard rules (60 active)

The rules in `knowledge/rules/` are not advisory — they are constraints on every decision and code change in the repo. The most load-bearing ones, in roughly the order they bite:

1. **never-hit-quotas** — every quota gets ≥10× headroom; alert at 60% of free tier
2. **free-tier-with-cost-controls** — cards allowed only if perpetual free tier + hard cap + no silent overage *(replaced the old no-card rule on 2026-06-23)*
3. **community-packages-first** — reach for a maintained community dep before hand-rolling
4. **self-update-on-every-decision** — locked decisions land in `knowledge/` in the same conversation
5. **future-overrides-past** — chat decisions override knowledge; update knowledge immediately
6. **parallel-by-default** — fan out subagents for any parallelisable work
7. **grill-to-knowledge** — every locked answer from a grill-me session lands in `knowledge/`
8. **knowledge-first + no README↔knowledge duplication** — durable info lives in `knowledge/`, never both places
9. **tests-parallel-and-master-install** — Vitest + Playwright + Storybook per app; always work from workspace root
10. **linux-ci-only** — `runs-on: ubuntu-latest` on every workflow
11. **MIT license on every repo** — locked 2026-06-21
12. **mirror-everything-weekly** — Friday 03:30 IST cron pushes to GitLab + Codeberg + Bitbucket + GitFlic
13. **grill-on-LOC-removal ≥ 50 lines** — surface as delta + MCQ before deleting
14. **frontend-design skill baked-in** — every UI task approached as design lead at a small studio
15. **org-level-secrets-only** — push to oriz-org with `--visibility all`; never per-repo
16. **shared-tenant-by-default** — ONE Sentry + ONE GA4 + ONE Clarity + ONE Razorpay merchant family-wide
17. **one-level-subdomain-only on `*.oriz.in`** — free CF SSL only covers one level deep
18. **cloudflare-pages-apps-only** — CF Pages for 27 apps; everything else on GitHub Pages
19. **monetization-centralized-on-oriz.in** — Razorpay checkout exists only at `oriz.in/pricing`; apps redirect with `?app=<slug>&return=<url>`
20. **no-separate-dev-prod-projects** — single Firebase project + emulator for dev; flip when first paying user appears

The complete authoritative list with full text is at [`knowledge/rules/`](./knowledge/rules/). The shortlist above is for orientation — when a rule and this README disagree, the file in `knowledge/rules/` wins.

---

## Env vars

`.env` is the **single source of truth**. There is no `.env.example`. The shape of `.env` is documented in [`knowledge/runbooks/env-management.md`](./knowledge/runbooks/env-management.md). It is encrypted to `.env.enc` via sops+age and that file is committed. Local dev decrypts with `pnpm run env:decrypt`; CI receives the age key as `SOPS_AGE_KEY` secret on `oriz-org/workspace`.

The daily sync workflow (`.github/workflows/sync-env-to-org-secrets.yml`) decrypts `.env.enc` and pushes every non-empty value to GitHub Org secrets at `oriz-org` with `visibility: all`. Every app's CI inherits.

Cards on file (post-2026-06-23 cost-controls rule):

- Razorpay (TEST mode active; LIVE keys pending Razorpay approval of the live site)
- AWS Lambda (4th-rail fallback; budget cap at $1/mo, reserved concurrency 10)
- Modal Labs (Workspace budget set to $0; stays inside $30/mo free credits)

---

## Domain map

The full subdomain inventory + DNS state lives in [`knowledge/decisions/infrastructure/flat-subdomain-pattern.md`](./knowledge/decisions/infrastructure/flat-subdomain-pattern.md). Quick reference:

| Surface | Hosting | Owns |
|---|---|---|
| `oriz.in`, `www.oriz.in` | CF Pages `oriz-app` | home-app — landing + pricing + checkout + webhook |
| `account.oriz.in` | CF Pages `oriz-auth-app` | centralized sign-in (4 providers) + cookie at `.oriz.in` |
| `status.oriz.in` + `status-api.oriz.in` | CF Pages + Worker | uptime dashboard, 5-min cron, KV-cached |
| `<slug>.oriz.in` (25 more) | CF Pages, one per app | each app's own surface |
| `<slug>.api.oriz.in` (15) | GitHub Pages | JSON snapshots + Path D Astro docs page |

---

## The directory of agents

This repo is heavily AI-developed. The agent ecosystem:

- **[AGENTS.md](./AGENTS.md)** — generic agent entry point (Cursor, Cline, Aider, etc.); just points here
- **[CLAUDE.md](./CLAUDE.md)** — Claude Code entry point; points to AGENTS.md
- `.claude/skills/` (user-global) — 36+ skills available across the family
- `knowledge/rules/self-update-rule.md` — how agents write decisions back to `knowledge/` automatically

When you (or an agent) lock a decision in chat, the **next message** must add a file in `knowledge/decisions/<area>/<slug>.md`, append a one-line entry to `knowledge/log.md`, commit with `docs(knowledge): <summary>`, and push. This is the `self-update` contract.

---

## Standing authorization

Agents may commit + push to `main` on `oriz-org/workspace` and any submodule **without further prompting**, **except** for:

- Paid API calls
- Repository deletions or transfers
- Domain transfers
- Mass deletions ≥50 LOC (rule 13 triggers a grill-me MCQ first)

For anything in that exception list, the agent stops and asks via `AskUserQuestion` MCQ.

---

## License

[MIT](./LICENSE). The source-available-but-all-rights-reserved framing in earlier versions of this README is **superseded** — every repo in the oriz-org org ships under MIT (locked decision: [`knowledge/decisions/architecture/mit-license-all-repos.md`](./knowledge/decisions/architecture/mit-license-all-repos.md)).

---

## Open source / commercial separation

- Source: MIT, anyone can read/fork/run
- The hosted service at `oriz.in` (with Pro and Max subscriptions) is operated by Chirag Singhal as a one-person company
- Pro/Max tiers fund maintenance; Free tier is the long-term commitment

Contact: hello@oriz.in · [github.com/oriz-org](https://github.com/oriz-org) · status: https://status.oriz.in
