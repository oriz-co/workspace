# AGENTS.md — pointer to `knowledge/`

> **Read [`knowledge/index.md`](./knowledge/index.md) first.** That bundle is
> the canonical source of truth for every rule, decision, service pick,
> design brief, runbook, and policy in the chirag127/oriz family.

This file used to hold the entire family rule-book. As of 2026-06-20
the rule-book lives in [`knowledge/`](./knowledge/) as an
[Open Knowledge Format v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
bundle — 167 small concept files organised across 8 directories with
clean cross-links.

## The 11 hard rules (full versions in `knowledge/rules/`)

1. **Never hit a free-tier quota** — architect for headroom, not survival
2. **No card-on-file** — every service must work without billing data linked
3. **Self-update on every decision** — chat decisions land in `knowledge/` in the same conversation
4. **Future overrides past** — if `knowledge/` and recent chat contradict, chat wins; update `knowledge/` immediately
5. **Parallel by default** — fan out subagents for any parallelisable work
6. **Grill-to-knowledge** — every locked answer from a `grill-me` session (question, chosen option, rejected options, "why") MUST land in `knowledge/` in the same conversation
7. **Knowledge-first + no README ↔ knowledge duplication** — durable info goes in `knowledge/` first. README is entry-point only. If info is in `knowledge/` it's NOT also in README, and vice versa. Per-app knowledge lives in each submodule's own `knowledge/` (OKF-light: `index.md` + `decisions/` + `runbooks/` + `services/`); cross-cutting knowledge stays at master `knowledge/`. Master `knowledge/sites/<app>/` is NOT used for app-specifics
8. **Tests in parallel, master `pnpm install -r` is THE install command** — Vitest + Playwright + Storybook per app and per package; master CI matrix-fans all suites in parallel. Always work from `c:/D/oriz/` (the umbrella). Fresh clone: `git clone --recurse-submodules https://github.com/chirag127/workspace c:/D/oriz && cd c:/D/oriz && pnpm install -r`. Update existing: `cd c:/D/oriz && git submodule update --init --recursive --remote && pnpm install -r`
9. **Linux/Ubuntu only on CI runners** — `runs-on: ubuntu-latest` on every workflow. macOS/Windows runners forbidden (10×/2× cost, no native build in scope per [[pwabuilder-as-primary-converter]]). Full rule in [`knowledge/rules/linux-ci-only.md`](./knowledge/rules/linux-ci-only.md)
10. **MIT license on all 41+ repos** — locked 2026-06-21. Source-available was vanity; commercial use is orthogonal to source license. Unlocks every free-for-OSS perk. Full decision in [`knowledge/decisions/architecture/mit-license-all-repos.md`](./knowledge/decisions/architecture/mit-license-all-repos.md)
11. **Mirror everything to 4 git hosts weekly** — master cron pushes every submodule + master to GitLab.com + Codeberg.org + Bitbucket + GitFlic.ru every Friday 03:30 IST. Insurance against GitHub becoming unusable. Full decision in [`knowledge/decisions/architecture/mirror-to-4-git-hosts.md`](./knowledge/decisions/architecture/mirror-to-4-git-hosts.md). Migration runbook if GitHub Actions ever becomes unusable: [`knowledge/runbooks/migrate-ci-platform.md`](./knowledge/runbooks/migrate-ci-platform.md)

## Where to look in `knowledge/`

| Looking for | Read |
|---|---|
| Why we do (or don't do) something | [`knowledge/rules/`](./knowledge/rules/) |
| When + why a specific decision was locked | [`knowledge/decisions/`](./knowledge/decisions/) |
| Which external services we use + free-tier limits + alternatives | [`knowledge/services/`](./knowledge/services/) |
| The 5-layer stack + API umbrella + canonical store | [`knowledge/architecture/`](./knowledge/architecture/) |
| Age-gating, monetisation, ingester contract, secrets handling | [`knowledge/policy/`](./knowledge/policy/) |
| Step-by-step actions (auth setup, add a site, rotate secrets) | [`knowledge/runbooks/`](./knowledge/runbooks/) |
| Per-site v2 design briefs + family design rules | [`knowledge/design/`](./knowledge/design/) |
| Family-specific term definitions | [`knowledge/glossary/`](./knowledge/glossary/) |
| Multi-engine "Search the web" button — every site ships one (in `@chirag127/oriz-kit` as `<MultiSearch />`) | [`knowledge/decisions/architecture/multi-engine-search-button.md`](./knowledge/decisions/architecture/multi-engine-search-button.md) |
| Repo naming — sites are `<subdomain-prefix>-site` (slug mirrors the public oriz.in subdomain: `blog.oriz.in` → `chirag127/blog-site`, `journal.oriz.in` → `chirag127/journal-site`, etc.); extensions `-ext`, VS Code extensions `-vsc-ext`, CLIs `-cli`, MCP servers `-mcp`, Workers `-worker`, Cloud Functions `-fn`, data repos `-data`, agent skills `-skill`, rule bundles `-rules`. NPM packages stay clean (no suffix). | [`knowledge/decisions/branding/repo-naming-suffixes.md`](./knowledge/decisions/branding/repo-naming-suffixes.md) |
| Geo-routed payment matrix — Razorpay (India) + Lemon Squeezy (international, MoR) + keygen.sh (licenses) + six donation rails (GitHub Sponsors / Ko-fi / Buy Me a Coffee / PayPal.me / UPI Direct / crypto) | [`knowledge/decisions/monetisation/max-payment-methods.md`](./knowledge/decisions/monetisation/max-payment-methods.md) |
| RSS → every-platform cross-poster — `@chirag127/oriz-omnipost` watches `blog.oriz.in/rss.xml`, adapter-per-platform, idempotent, canonical URL preserved, short-link fallback via `s.oriz.in` | [`knowledge/decisions/architecture/cross-post-engine.md`](./knowledge/decisions/architecture/cross-post-engine.md) |
| Secrets management — Doppler is the source of truth; GitHub Secrets / Cloudflare Worker secrets / Firebase config are runtime mirrors synced from Doppler. Free 5 users, no card. Rotation runbook + audit log centralised. | [`knowledge/decisions/security/secrets-management-doppler.md`](./knowledge/decisions/security/secrets-management-doppler.md) |
| Consent management for many categories — 5-category Klaro config (necessary / analytics / marketing / functional / social) × per-service map; geo-routed defaults (EU default-DENIED, US/CA default-ACCEPTED honouring `Sec-GPC: 1`, ROW no banner); Klaro JS lazy-loads only for EU+UK+CCPA visitors; cookie-less mode used by default everywhere it exists. | [`knowledge/decisions/security/consent-management-multi-category.md`](./knowledge/decisions/security/consent-management-multi-category.md) |
| Auto-only tracking — every tracked metric in the family must be auto-captured (Wakatime for coding time, CF Web Analytics for visits, Sentry for errors, Better Stack for uptime, GH webhooks for commits / npm publishes / builds). Manual entry / manual timer / manual journal NOT allowed for system metrics. Rejects Toggl Track. Applies to METRICS, not content (`oriz-journal-site` entries are intentionally manual creative writing — that's CONTENT). | [`knowledge/rules/auto-only-tracking.md`](./knowledge/rules/auto-only-tracking.md) |
| Env keys + GH Actions secrets — single source of truth, two delivery tracks. Track A: `.env.example` synced from master `templates/.env.example` to every repo (CI fails on drift). Track B: GitHub Actions secrets set ONCE at `chirag127` org level (`--visibility all`). Doppler stays upstream. | [`knowledge/decisions/security/env-and-secrets-single-source.md`](./knowledge/decisions/security/env-and-secrets-single-source.md) |
| packages.oriz.in catalog hub — auto-discovery catalog of every `@chirag127/*-npm-pkg` GitHub repo, embeds each README + npm/GH/bundlephobia metadata, 5 sidebar groups, Astro Starlight on CF Pages, daily cron + on-tag rebuild | [`knowledge/decisions/architecture/packages-oriz-in-catalog.md`](./knowledge/decisions/architecture/packages-oriz-in-catalog.md) |
| Brand capitalisation — Title-Case **"Oriz"** in user-facing copy (homepage wordmark, page titles, meta, READMEs, social, OG, status page, email "from"). Repo slugs / npm package names / DOM attrs / CSS vars / env-var prefixes / shell scripts stay lowercase — they are identifiers, not display strings. | [`knowledge/decisions/branding/title-case-oriz.md`](./knowledge/decisions/branding/title-case-oriz.md) |

## Per-site knowledge

Per-app knowledge lives INSIDE each app submodule under its own `knowledge/` folder (OKF-light: `index.md` + `decisions/` + `runbooks/` + `services/`). The richest example is [`projects/apps/personal/oriz-cs-me-app/knowledge/`](./projects/apps/personal/oriz-cs-me-app/knowledge/) — lifestream architecture, age-gating, ingester contract, 100-year strategy. Each per-app bundle follows the same OKF contract ([`knowledge/_okf.md`](./knowledge/_okf.md)). Master `knowledge/` holds family-wide rules / decisions / architecture only; the deprecated `knowledge/sites/<app>/` location is NOT used.

## Update protocol

When a decision is made in chat, write the relevant concept file in
`knowledge/<area>/<slug>.md`, append a one-line entry to
[`knowledge/log.md`](./knowledge/log.md), commit on `main` with
`docs(knowledge): <one-line summary>`, then push immediately. Standing
authorisation: agents may commit + push to `main` without further
prompting. Hard-to-reverse external actions (paid APIs, repo deletes,
domain transfers) still require user confirmation.

The full convention spec is at [`knowledge/_okf.md`](./knowledge/_okf.md).
