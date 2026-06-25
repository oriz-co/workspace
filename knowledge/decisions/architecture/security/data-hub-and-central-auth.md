---
type: decision
title: data.oriz.in aggregator app + centralized auth.oriz.in + Phone-Auth Pro-tier-only
description: "Locked 2026-06-22 evening. (1) New CF Pages app `oriz-data-aggregator-app`\
  \ at `data.oriz.in` renders ECharts dashboards + JSON browser for all 14+ API repos\
  \ (separate from per-API GH Pages). (2) `auth.oriz.in` is the central Firebase Auth\
  \ domain; all apps redirect there for sign-in; redirect back after success. (3)\
  \ Firebase Phone Auth is enabled but UI-gated to Pro tier (Phone SMS costs $0.05/SMS\
  \ ~ \u20B94/SMS \u2014 not free; rate-limit free users to 0/day, Pro to 5/day, Max\
  \ unlimited). (4) Authentication ONLY in apps, never APIs (APIs serve pure JSON,\
  \ no auth)."
tags:
- decision
- data-hub
- auth
- firebase
- phone-sms
- central-auth
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- decisions/architecture/compute/api-hosting-triple-rail
- decisions/architecture/stack/stack-picks-2026-06-22
- decisions/pricing/three-tier-free-pro-max
- rules/infrastructure/one-level-subdomain-only
---



# Data hub + central auth + Phone gating

## data.oriz.in aggregator

NEW app `oriz-data-aggregator-app` at `c:/D/oriz/repos/oriz/own/prod/apps/content/oriz-data-aggregator-app/`. Hosted on Cloudflare Pages (one-level subdomain — Universal SSL works).

### Scope

- Lists all 14+ API repos (FII/DII + MMI + 12 new APIs) with live preview
- Per-API page: docs + schema + interactive JSON browser + ECharts chart of recent data + "copy fetch URL" snippet
- Status check: server-side fetch each API's GH Pages URL daily; flag stale via Telegram alert
- Auto-updates from FAMILY_APIS registry (no manual edit when new API added)
- NO authentication (data is public)
- NO user-data storage (it's a read-only catalog)

### Tech

- Astro 6 static build
- ECharts (lazy, only on chart-page)
- Fetches data at BUILD TIME from each API's GH Pages JSON; commits a snapshot to `data/` per build
- Daily GH Action triggers rebuild
- Single CF Pages project (`oriz-data-aggregator`); branch `main` → `data.oriz.in` (custom domain)

## auth.oriz.in central auth

`auth.oriz.in` is the central Firebase Auth domain. ALL apps redirect here for sign-in:

### Flow

1. User clicks "Sign in" on any app (e.g. `paisa.oriz.in`)
2. Browser redirects to `auth.oriz.in/sign-in?return=https://paisa.oriz.in/account`
3. auth.oriz.in shows the unified sign-in UI (Google + GitHub + Email-link [+ Phone for Pro tier])
4. User picks provider, signs in, Firebase issues token
5. auth.oriz.in redirects back to `return` URL with Firebase ID token in URL fragment
6. Originating app captures token + sets Firebase Auth state locally
7. Cross-app SSO works via Firebase's `signInWithCustomToken` + cookie at `.oriz.in`

### Why centralize

- ONE Firebase Auth domain to configure (not 26)
- Cross-app SSO trivial (single token + cookie)
- Single set of OAuth redirect URLs in Firebase Console (not 26 per provider)
- All apps trust `auth.oriz.in` as the identity provider

### Implementation

`@chirag127/auth-core` package gains a `<SignInButton />` component that always redirects to `https://auth.oriz.in/sign-in?return=<current-url>`. The `oriz-auth-app` (NEW; at `repos/oriz/own/prod/apps/hub/oriz-auth-app/`) hosts the sign-in UI itself, mounted at `auth.oriz.in`.

## Phone Auth gating

Firebase Phone Auth is **technically enabled** in the Console (per user request: Google + GitHub + Email + Phone all on). BUT:

- Firebase charges $0.05 per SMS in India (~₹4/SMS)
- Free tier doesn't include free SMS — every SMS costs from day 1
- If we expose Phone to Free users, 100 sign-ins = ~₹400 unbudgeted

### Tier-gated UI

| Tier | Phone Auth visible? | SMS quota |
|---|---|---|
| Free | NO | 0/day |
| Pro | YES | 5/day |
| Max | YES | Unlimited |

Implementation: `oriz-auth-app`'s sign-in UI conditionally renders the Phone provider button based on the requesting app's user tier (determined from Firestore on first auth attempt OR not shown if anonymous).

OR simpler: Phone is shown ONLY when user has an existing Pro/Max subscription that they're logging back into (the auth flow loads subscription state before deciding which providers to render).

## Authentication scope

ONLY in apps. NEVER in APIs.

- Apps (`*.oriz.in`): can be auth-required for personal content (roam-journal, cs-me-private, financial-cards saved-list)
- APIs (`*.api.oriz.in` or `*-api.oriz.in`): always public JSON serve, no auth

This avoids:
- Auth tokens in API requests (none needed)
- Rate-limiting per-user (just per-IP via CF)
- Subscription gating on data (which would break the "free open data" promise)

## Cross-refs

- API hosting triple-rail → [[decisions/architecture/api-hosting-triple-rail]]
- Stack picks → [[decisions/architecture/stack-picks-2026-06-22]]
- 3-tier pricing → [[decisions/pricing/three-tier-free-pro-max]]
- One-level subdomain rule → [[rules/one-level-subdomain-only]]
