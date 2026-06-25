---
type: decision
title: Auth — Firebase via CF Worker, login.oriz.in + account.oriz.in split
description: Locked 2026-06-25. Firebase Auth fronted by a Cloudflare Worker. login.oriz.in hosts the auth flow (Microsoft-style sign-in page). account.oriz.in hosts the dashboard (Google-style account view). Every app loads the universal optional account widget; sign-in stays opt-in family-wide.
tags:
- decision
- auth
- firebase
- cloudflare-worker
- login
- account
- widget
timestamp: 2026-06-25
format_version: okf-v0.1
status: superseded
superseded_by: decisions/architecture/security/auth-clerk-emergency-migrate-2026-06-25.md
related:
- decisions/architecture/security/auth-billing-polish-locks-2026-06-22-evening
- decisions/architecture/security/data-hub-and-central-auth
- decisions/architecture/monetisation/donations-only-2026-06-25
- decisions/architecture/packages/five-shared-npm-packages-2026-06-25
---

> **Superseded 2026-06-25 (same day)** — see [Clerk decision](./auth-clerk-emergency-migrate-2026-06-25.md). Switched to Clerk for `<UserProfile/>` DX; emergency-migrate trigger at 5000 MAU preserves no-card rule.

# Auth — Firebase via CF Worker, login + account split

## Decision

Auth is Firebase Auth, proxied through a Cloudflare Worker at the edge. The user-facing surface splits into two subdomains: **`login.oriz.in`** is the Microsoft-style sign-in flow page (multi-step provider picker, dedicated page, no chrome distractions). **`account.oriz.in`** is the Google-style account dashboard (profile, connected providers, sessions, signed-in apps). Every other app mounts the universal optional `@oriz/account-widget` in its header; the widget is always optional, never gates a feature.

## Why

- **CF Worker fronting Firebase** centralises CORS, cookie scoping to `.oriz.in`, and ID-token refresh — apps never call Firebase SDK endpoints directly.
- **Separate login + account domains** matches the mental model users already have (MS / Google) and lets each page evolve independently — login optimises for funnel, account optimises for breadth.
- **Universal optional widget** keeps sign-in encouraged everywhere without forcing it; donations-only monetisation means no auth-gated paywall to drag users through.
- **Single Firebase project, single cookie domain** — token issued at login.oriz.in is valid on every subdomain.
- **Auth providers retained** from the 2026-06-22 lock (Google, GitHub, Email-link, Phone OTP, Apple, Twitter) — the maximalist provider set was the right call; only the billing half changes.

## Implications

- New CF Worker at `auth-worker.oriz.in` (or routed via `api.oriz.in/auth/*`) handles `/sessionLogin`, `/sessionLogout`, `/refresh`. Replaces direct Firebase Auth REST from clients.
- Two new repos: `login` (Astro shell, login.oriz.in) and `account` (Astro shell, account.oriz.in). Both consume `@oriz/account-widget` internally.
- The previously-locked auth + billing v0 polish doc is split: auth half lives here; billing/promo/referral/refund half is superseded by donations-only-2026-06-25.
- Universal optional widget = always optional. App slugs DO NOT issue forced redirects to login.oriz.in unless the feature is intrinsically stateful (journal, profile, cross-app history).
- Firestore stays the user data home (`users/<uid>/preferences/`, `users/<uid>/operations/`, `users/<uid>/profile/`). The `tier` field is removed (no paid tiers under donations-only).
- Microsoft-style multi-step login is the agreed UX; provider buttons appear after the email is entered, not before.
