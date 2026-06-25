---
type: decision
title: "Auth — Clerk with emergency-migrate trigger at 5000 MAU"
description: Clerk Auth on login.oriz.in + account.oriz.in. Hard rule to migrate to Firebase before crossing 5k MAU (Clerk free tier caps at 10k).
tags: [auth, clerk, firebase, mau, card-rule]
timestamp: 2026-06-25
format_version: okf-v0.1
status: superseded
superseded_by: decisions/architecture/security/no-auth-in-apps-or-apis-2026-06-25.md
supersedes:
  - decisions/architecture/security/auth-firebase-login-account-2026-06-25.md
related:
  - rules/interaction/no-card-on-file
---

> **Superseded 2026-06-25 (same day, ~1 hour later)** — user reversed: NO auth anywhere in apps/APIs. See [no-auth decision](./no-auth-in-apps-or-apis-2026-06-25.md).

# Auth — Clerk with emergency-migrate trigger at 5000 MAU

## Decision

Adopt Clerk for the fleet's auth surface: `login.oriz.in` hosts the Clerk sign-in flow and `account.oriz.in` mounts Clerk's `<UserProfile/>` widget. A hard operational trigger commits us to migrate auth off Clerk to Firebase before any single app crosses 5000 MAU (50% of Clerk's 10k free-tier cap), because the next tier requires a card on file and violates the no-card-on-file rule.

## Why

- Clerk's `<UserProfile/>` widget IS `account.oriz.in` for free — zero dashboard code to write, ship, or maintain. Firebase would need a hand-built UI.
- Clerk's sign-in components match the Microsoft-style multi-step UX we already wanted at `login.oriz.in`.
- Token verification at the edge (CF Worker checks Clerk-issued JWTs) keeps app code provider-agnostic — the migration blast radius is one widget + one worker.
- 5000 MAU (not 10k) is the trigger so there's runway to swap providers before the cap forces a card.
- The no-card-on-file rule is absolute (see veto history) — building the trigger into the decision up front prevents a panic migration.

## Migration plan when 5000 MAU triggers

- Stand up Firebase Auth project, mirror provider list (Google, GitHub, Email-link, Phone OTP, Apple, Twitter).
- Swap the sign-in widget at `login.oriz.in` from Clerk to Firebase Auth UI; rebuild `account.oriz.in` with a custom dashboard (the part Clerk was giving us for free).
- Update CF Worker JWT verifier to accept Firebase ID tokens instead of Clerk session tokens — app code unchanged because it only consumes the worker's session cookie.
- Dual-run period: issue both Clerk and Firebase sessions during cutover, then revoke Clerk.

## Implications

- App code MUST NOT import the Clerk SDK except inside the `login.oriz.in` and `account.oriz.in` shells. All other apps trust the CF-Worker-set session cookie.
- The `@oriz/account-widget` package becomes a thin wrapper around Clerk's `<UserButton/>` today; the wrapper interface stays stable across the Firebase migration.
- MAU monitoring is now a fleet-level metric — needs a Clerk dashboard check in the monthly runbook.
- The previously-locked Firebase auth decision (same day) is superseded; CF Worker fronting design is retained because it survives the provider swap.

## Cross-refs

- Supersedes: [auth-firebase-login-account-2026-06-25](./auth-firebase-login-account-2026-06-25.md)
- Related rule: [no-card-on-file](../../../rules/interaction/no-card-on-file.md)
- Related memory: [[no-card-rule-veto-history]], [[auth-clerk-with-emergency-migrate]]
