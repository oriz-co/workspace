---
type: decision
title: "Auth: Firebase via login + account subdomains"
description: "login.oriz.in = auth flow page (Microsoft-style). account.oriz.in = post-auth dashboard (Google-style). Both Firebase Auth via CF Worker."
tags: [auth, firebase, superseded]
timestamp: 2026-06-25
format_version: okf-v0.1
status: superseded
superseded_by: auth-clerk-with-emergency-migrate
---

Two auth-related subdomains: `login.oriz.in` runs the sign-in flow (modeled on login.microsoftonline.com — pure auth, redirects out after) and `account.oriz.in` is the post-auth dashboard for managing profile/sessions/connected apps (modeled on myaccount.google.com). Both are Firebase Auth backed, fronted by a Cloudflare Worker for session/cookie handling. Locked 2026-06-25.

**SUPERSEDED 2026-06-25** by [`auth-clerk-with-emergency-migrate`](./auth-clerk-with-emergency-migrate.md). Switched to Clerk for `<UserProfile/>` DX win; reverts to Firebase before crossing 5000 MAU.
