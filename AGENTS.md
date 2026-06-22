# AGENTS.md — pointer to `knowledge/`

> **Read [`knowledge/index.md`](./knowledge/index.md) first.** That bundle is
> the canonical source of truth for every rule, decision, service pick,
> design brief, runbook, and policy in the chirag127/oriz family.

This file used to hold the entire family rule-book. As of 2026-06-20
the rule-book lives in [`knowledge/`](./knowledge/) as an
[Open Knowledge Format v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
bundle — 167 small concept files organised across 8 directories with
clean cross-links.

## The 14 hard rules (full versions in `knowledge/rules/`)

**NEW (2026-06-22 evening):**

**Rule 14: Env vars ORG-level only — per-repo secrets FORBIDDEN** — env vars are pushed to GitHub ORG-level secrets with `--visibility all`. NEVER per-repo. Per-repo writes cause N×M API calls (3,770 per sync at our scale) and hit the 5K/hr rate limit. CI/CD pipelines inherit org secrets automatically. `chirag127` is a USER account today (no org secrets); migrate to a real GH Org (`oriz`) per [`knowledge/runbooks/migrate-to-oriz-org.md`](./knowledge/runbooks/migrate-to-oriz-org.md). Env-sync workflow is PAUSED until migration. Full body in [`knowledge/rules/org-level-secrets-only-no-per-repo.md`](./knowledge/rules/org-level-secrets-only-no-per-repo.md).

**Rule 13: Frontend-design skill is baked-in agent philosophy** — every UI task approached as design lead at a small studio. Ground in subject. Hero is thesis. Typography carries personality. Structure is information. Motion deliberate. Match complexity to vision. AVOID AI-cluster defaults (cream+serif+terracotta / near-black+acid / broadsheet-hairlines) unless brief calls for them. Process: brainstorm → explore → plan → critique → build → critique again. Restraint: spend boldness in one place; Chanel's mirror — remove one accessory before publishing. Writing IS design material: active voice, end-user side, name by what people control. Full body in [`knowledge/rules/frontend-design-skill-baked-in.md`](./knowledge/rules/frontend-design-skill-baked-in.md).

**Rule 12: Grill on LOC removal >= 50 lines per sweep** (TIGHTENED from 1000 → 50) — when a dedup/refactor/cleanup sweep removes ≥50 lines of code in a single agent action, the agent MUST surface this as a delta, ask the user MCQs about what was removed + why, offer restoration paths, and confirm before deleting. Reason: 50-LOC sweeps can hide substantive functional removal (an entire component, a route, a feature). Design pattern consolidation safe ONLY after grill; content/feature deletion NEVER safe without grill.

**Full rule** in [`knowledge/rules/grill-on-loc-removal.md`](./knowledge/rules/grill-on-loc-removal.md).

---

## The 11 hard rules (full versions in `knowledge/rules/`)

1. **Never hit a free-tier quota** — architect for headroom, not survival
2. **No card-on-file** — every service must work without billing data linked
3. **Self-update on every decision** — chat decisions land in `knowledge/` in the same conversation
4. **Future overrides past** — if `knowledge/` and recent chat contradict, chat wins; update `knowledge/` immediately
5. **Parallel by default** — fan out subagents for any parallelisable work
6. **Grill-to-knowledge** → [[knowledge/rules/grill-to-knowledge.md]] — every locked answer from a grill-me session must land in knowledge/.
7. **Knowledge-first + no README ↔ knowledge duplication** → [[knowledge/rules/knowledge-first.md]] — durable info in knowledge/, never both places.
8. **Tests in parallel, master `pnpm install -r` is THE install** → [[knowledge/rules/tests-parallel-and-master-install.md]] — Vitest+Playwright+Storybook per app/pkg; always work from c:/D/oriz/.
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
| Revenue channels 2026 — every product (26 apps + 18 packages + 5 books + future ext/CLI/MCP) auto-publishes to as many channels as 2026 APIs allow via `@chirag127/omni-publish` on every tag push. AI copy via the new `@chirag127/oriz-ai-providers` aggregator (20-provider fallback chain — see [`knowledge/decisions/architecture/oriz-ai-providers-package.md`](./knowledge/decisions/architecture/oriz-ai-providers-package.md)). Dead-in-2026 platforms (Reddit OAuth, X free tier, LinkedIn /v2, Medium tokens, KDP) drop into 1 Telegram drafts channel split into 4 sections. Max 1 auto-post per channel per day per repo. | [`knowledge/decisions/architecture/revenue-channels-2026.md`](./knowledge/decisions/architecture/revenue-channels-2026.md) |
| Book publish pipeline — Markua-flavoured `.md` → Pandoc → EPUB+PDF+MOBI via `@chirag127/oriz-book-build` (17th family package). 5 channels per book: Leanpub (80% royalty) + Gumroad (10%) + LemonSqueezy (5%+50¢ MoR) + D2D aggregator (manual) + KDP (browser-bot). Google Play Books manual. Prose CC-BY-NC-ND 4.0 + code samples MIT. 5 first books locked, all brand-first: Oriz Stack, Oriz Paisa, Oriz PDF, Oriz Janaushdhi, Oriz Me. | [`knowledge/decisions/architecture/book-publish-pipeline.md`](./knowledge/decisions/architecture/book-publish-pipeline.md) |
| Design divergence is NOT duplication — per-app `Header` / `Footer` / `Wordmark`, blog's `MultiSearch`, blog's `astro.config` are intentionally divergent and must NOT be forced into generic slot-based components. The 25-lines × 3-apps dedup threshold applies to TRUE duplicates only. | [`knowledge/rules/design-divergence-vs-dedup.md`](./knowledge/rules/design-divergence-vs-dedup.md) |
| Monetisation channel matrix — single canonical per-channel + per-app matrix. dev.to/Hashnode/Medium = affiliate + sponsor + native. Bluesky/Mastodon/Threads = bio-only, organic only. X/Reddit/LinkedIn/Medium = manual via GH Issues drafts. janaushdhi + vitals-health + ncert = sponsor footer ONLY (public-health/education ethics). Single Substack newsletter family-wide. | [`knowledge/decisions/policy/monetisation-channel-matrix.md`](./knowledge/decisions/policy/monetisation-channel-matrix.md) |
| Drafts queue host — private GitHub repo `chirag127/oriz-drafts` with Issues. One issue per (post × manual-channel platform), labelled `platform:x` / `platform:reddit` / `platform:linkedin` / `platform:medium`. Replaces Telegram (banned in India). Body = ready-to-paste copy + canonical URL + cover image URL. Close issue when posted. Requires `OMNI_DRAFTS_GH_PAT`. | [`knowledge/decisions/architecture/drafts-queue-host.md`](./knowledge/decisions/architecture/drafts-queue-host.md) |
| Telegram is banned in India — do NOT propose Telegram bots, channels, or OAuth for India-resident users. Drafts → GH Issues. Notifications → GH repo notifications + email. | [`knowledge/rules/no-telegram-india-banned.md`](./knowledge/rules/no-telegram-india-banned.md) |
| No self-hosting outside Cloudflare — no VPSes, Docker hosts, k8s, Fly.io, Render. CF Pages (static) + CF Workers (logic) + CF KV/R2/D1 (data) is the ceiling. Hosted free tiers preferred over self-hosted Listmonk / Plausible / Umami / PostHog / Discourse. | [`knowledge/rules/no-self-hosting-outside-cf.md`](./knowledge/rules/no-self-hosting-outside-cf.md) |
| No Firebase Cloud Functions — Blaze requires a card on file, hard banned. Use GH Actions (cron / build / CI), CF Workers (REST APIs), CF Pages Functions (per-page server logic), or Firestore client SDK direct from the browser. Auth + Firestore stay (Spark free). | [`knowledge/rules/no-firebase-functions-blaze.md`](./knowledge/rules/no-firebase-functions-blaze.md) |
| Family inventory (canonical counts SSoT) — 26 apps (1 hub + 1 personal + 8 content + 16 tools) + 18 npm packages + 5 books (Oriz Learnings first) + 2 APIs scaffolded + 53 submodules total. Every other file's count claim MUST cite this file. | [`knowledge/services/family-inventory.md`](./knowledge/services/family-inventory.md) |

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
