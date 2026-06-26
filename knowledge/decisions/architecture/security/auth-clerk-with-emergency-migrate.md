---
type: decision
title: "Auth: Clerk with emergency-migrate at 5k MAU"
description: "Clerk Auth for now; emergency-migrate to Firebase before crossing 5000 MAU on any app."
tags: [auth, clerk, firebase, superseded]
timestamp: 2026-06-25
format_version: okf-v0.1
status: superseded
superseded_by: no-auth-in-apps-or-apis-2026-06-25
---

- Clerk for `login.oriz.in` (auth flow page) + `account.oriz.in` (`<UserProfile/>` widget).
- Hard trigger: when ANY single app crosses 5000 MAU (= 50% of Clerk's 10k cap), migrate auth to Firebase.
- App code MUST NOT import Clerk SDK except in the sign-in widget. JWT verified server-side by a CF Worker so the migration surface stays minimal.
- Why: Clerk's `<UserProfile/>` widget IS `account.oriz.in` for free (no code), Firebase needs hand-built dashboard.
- Why 5000 not 10k: gives time to migrate before card-on-file is forced.
- Supersedes [`auth-firebase-login-and-account-subdomains`](./auth-firebase-login-and-account-subdomains.md).
- Related: [`no-card-on-file-prepaid-escape`](../../../rules/interaction/no-card-on-file-prepaid-escape.md), [`no-card-rule-veto-history`](../../../services/no-card-rule-veto-history.md).

**SUPERSEDED 2026-06-25 (same day)** by [`no-auth-in-apps-or-apis-2026-06-25`](./no-auth-in-apps-or-apis-2026-06-25.md). Reversed: NO auth in apps/APIs at all. Login moves to a separate project.
