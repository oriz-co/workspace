---
type: decision
title: "No auth in apps or APIs — login is a separate project"
description: Apps and APIs are 100% public. Login moves to a dedicated login-manager project; apps/APIs that need authenticated users redirect to it, never embed.
tags: [auth, public, login-manager, simplicity, donations-only]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
supersedes:
  - decisions/architecture/security/auth-clerk-emergency-migrate-2026-06-25.md
  - decisions/architecture/security/auth-firebase-login-account-2026-06-25.md
related:
  - rules/interaction/donations-only
  - rules/interaction/no-card-on-file
---

# No auth in apps or APIs — login is a separate project

## Decision

Apps and APIs across the fleet are 100% public. No sign-in UI, no session check, no auth SDK imports in any app shell or API handler. Login functionality moves to a dedicated **login-manager** project (separate repo, separate subdomain) — apps that need an authenticated user redirect to it and never embed the auth flow.

## Why

- **Simpler shells:** every app drops its auth wiring, session middleware, and user-context plumbing — the shell is just the tool.
- **Kill cross-repo coupling:** no more shared `@oriz/account-widget` package, no Clerk SDK pinned across 18+ apps, no JWT verifier worker in every API.
- **Donations-only is coherent without accounts:** donors don't need a logged-in identity to give via BuyMeACoffee / GitHub Sponsors / UPI — auth was solving a problem we don't have.
- **No paid users yet:** embedded auth is a maintenance tax with zero revenue against it. The minute we charge, login-manager spins up — until then, friction = lost users.
- **Friction-free for visitors:** the fleet's pitch is "free public tools" — a sign-in wall (even optional) signals lock-in and contradicts the build-gate-vs-paywalled-competitors stance.

## What this kills

- The Clerk JWT pattern locked an hour ago (`auth-clerk-emergency-migrate-2026-06-25`).
- `login.oriz.in` + `account.oriz.in` subdomain plan.
- The `repos/infra/auth` integration repo (mark for deletion or repurpose as the login-manager skeleton).
- `AccountWidget` React island in the template.
- `apps.ts` `AccountWidget` references.
- The `@oriz/account-widget` package (if it exists; drop from dependency arrays).

## What stays

- The 24 npm packages — none of them assumed auth in the first place.
- The 18 APIs — already public per Spark plan; just confirm no auth code crept in.

## Login-manager project (TBD)

- Lives at TBD subdomain (probably one of: `login.oriz.in`, `accounts.oriz.in`, `id.oriz.in`).
- Hosted as its own repo (probably `repos/infra/login-manager/` — to be created).
- Apps that need login redirect: `https://login.oriz.in/?return=<encoded-url>` → callback to app's `/auth/callback` route.
- Decision deferred: which backend (still TBD, could be Clerk, Lucia, or self-rolled JWT).

## Implications

- Audit pass: grep every app and API for Clerk/Firebase SDK imports, session middleware, JWT verifier code — strip on sight.
- Template repo: remove the auth island and any `useUser()` hooks from the Astro+React baseline.
- `repos/infra/auth` repo: either delete or rename to `login-manager` as the skeleton for the future separate project.
- Rate limiting on APIs: switch to IP-based throttling (per `oriz-rate-limit-npm-pkg`) since there's no API key check.
- Donation footers stay anonymous — no "logged-in donor" tracking.
- When the login-manager project ships, it'll be a single OAuth/redirect surface; apps never embed it, only redirect to it.

## Cross-refs

- Supersedes: [auth-clerk-emergency-migrate-2026-06-25](./auth-clerk-emergency-migrate-2026-06-25.md)
- Supersedes: [auth-firebase-login-account-2026-06-25](./auth-firebase-login-account-2026-06-25.md)
- Related rule: [donations-only](../../../rules/interaction/donations-only.md)
- Related rule: [no-card-on-file](../../../rules/interaction/no-card-on-file.md)
- Related memory: [[no-auth-in-apps-or-apis]], [[donations-only-no-pro-no-ads]]
