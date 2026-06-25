---
type: decision
title: Observability, AI, search, auth, DB stack (Q3 2026 lock)
description: "Cross-cutting service picks locked on 2026-06-22. AI: `@chirag127/oriz-ai-providers`\
  \ (20-provider fallback chain \u2014 OVHcloud / LLM7 / Pollinations anonymous first,\
  \ then Cerebras / Groq / NIM / OpenRouter / etc keyed) \u2014 see decisions/architecture/oriz-ai-providers-package.\
  \ Search: Pagefind for static + Algolia free hybrid. Errors: Sentry free + OSS tier\
  \ apply. Uptime: UptimeRobot free 50 monitors. Auth: Firebase Auth (Spark). DB:\
  \ Firestore only. I18n: English-only v0 + Crowdin OSS community translations. Privacy:\
  \ single family-wide /privacy page. Cookie consent: Klaro EU + DPDP India geo-route."
tags:
- decision
- stack
- observability
- ai
- search
- auth
- db
- privacy
- i18n
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- rules/interaction/never-hit-quotas
- rules/interaction/no-card-on-file
- rules/interaction/auto-only-tracking
- decisions/security/consent-management-multi-category
---



# Stack picks 2026-06-22

## AI inference

**Superseded by [[decisions/architecture/oriz-ai-providers-package]] (2026-06-22).**

The original NIM-primary + OpenRouter-fallback two-tier picked here is now subsumed by the new `@chirag127/oriz-ai-providers` aggregator package, which fans out across **20** free LLM APIs with a richer priority chain (anonymous OVHcloud / LLM7 / Pollinations first, then Cerebras / Groq / NIM / OpenRouter / Google AI Studio / etc keyed).

**Use cases (unchanged):** blog draft rewrites (omni-publish), janaushdhi substitute-finder, ncert subject summaries, general content rewrites.

**Migration:** consumers should `pnpm add @chirag127/oriz-ai-providers` and call `ai.complete({ prompt })` instead of hand-rolling NIM/OpenRouter fetch calls. Env vars are listed in the package's README + the data repo's `env-vars.json`.

## Search

**Static-first apps** (home, blog, lore, ncert, me-app, tabs-cards): **Pagefind** — built at deploy time via `astro-pagefind` integration. Zero infra cost.
**Dynamic-data apps** (janaushdhi, paisa-finance, packages-catalog): **Algolia free** (10K records + 100K searches/mo + InstantSearch UI). No card on signup.
**Hybrid:** apps with both static and dynamic content use both side-by-side.

## Error tracking

**Sentry** free tier (5K errors/mo + 50 replays/mo) with GitHub social login (no card on signup). Apply for OSS tier on 2026-06-23 (now that MIT relicense is locked) to unlock 50K errors + 500 replays + 100K transactions.
**One Sentry project per repo** (51 projects) — group via Sentry's Project Settings; cross-project search works.
**SDK:** `@sentry/astro` for web apps, `@sentry/node` for CF Workers (where supported).

## Uptime monitoring

**UptimeRobot** free 50 monitors (5-min intervals, no card on signup). One monitor per `*.oriz.in` subdomain.
**Status page:** UptimeRobot's free hosted status page at `status.oriz.in` (custom CNAME).
**Alerts:** Telegram → @oriz_ops channel via webhook.

## Auth

**Firebase Auth (Spark plan, no card).** Providers: Google, GitHub, Email-link. Domain: `auth.oriz.in` (custom).
**Cross-site SSO:** via Firebase custom token + cookie at `.oriz.in`. Single sign-in across all 26 apps.

## Database

**Firestore only.** Free Spark tier (1 GB storage + 50K reads/day + 20K writes/day + 20K deletes/day).
**Collections:**
- `users/{uid}` — profile + subscription tier
- `users/{uid}/sync/<app>` — per-app sync data (history, bookmarks, themes, etc.)
- `users/{uid}/subscriptions` — billing state (synced from Razorpay/Paddle webhooks via CF Pages Functions)
**No Postgres.** If relational becomes critical later, revisit (Neon / Supabase / Turso candidates — all free no-card on signup).

## I18n

**v0: English-only.** Single locale, no i18n complexity.
**v1+ (post-launch): Crowdin Community** (free for OSS now that MIT-licensed; community translates). Languages picked by demand:
- Hindi (India audience, especially janaushdhi + ncert + paisa)
- Spanish + French + German (EU + LatAm reach)
- Others as Crowdin community contributes.

## Privacy + ToS

**Single canonical privacy policy** at `oriz.in/privacy`. All 26 apps link via `<Footer>` package. Generated initially via Termly/iubenda free, then maintained in-repo.
**Single ToS** at `oriz.in/terms`.
**Cookies / consent:** Klaro JS lazy-loaded only for EU+UK visitors (geo-routed via CF). India: DPDP-compliant banner (different copy, same Klaro engine). US: GPC-honor only. ROW: no banner.

## Domain

**oriz.in registered at Spaceship** with auto-renewal ON. This is a deliberate violation of `no-card-on-file` because **domain registration is the one place a card-on-file is mandatory** (no prepaid mechanism on .in TLDs). Documented as a `superseded-in-part` exception in `no-card-on-file.md`.

## Backup

**Multi-rail backup, weekly cron** (Friday 03:30 IST per existing mirror cron, EXTENDED to cover non-git data):
1. **Git mirror to 4 hosts** (GitLab + Codeberg + Bitbucket + GitFlic.ru) — already in place per `mirror-to-4-git-hosts.md`.
2. **Firestore export** to CF R2 free 10GB tier — weekly GH Action.
3. **Restic snapshot** of master + critical configs to Backblaze B2 free 10GB tier — weekly.
4. **Stats dashboard:** new project `oriz-backup-status-app` (post-MVP) that shows: total backed-up bytes, per-rail health, last-success timestamps, per-source breakdown.

## Cross-refs

- Never hit quotas → [[rules/never-hit-quotas]]
- No card on file (with domain exception noted) → [[rules/no-card-on-file]]
- Auto-only tracking (Sentry is auto) → [[rules/auto-only-tracking]]
- Mirror to 4 git hosts → [[decisions/architecture/mirror-to-4-git-hosts]]
- Consent management → [[decisions/security/consent-management-multi-category]]
