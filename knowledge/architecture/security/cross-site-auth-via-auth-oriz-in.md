---
type: architecture
title: Cross-site auth via auth.oriz.in
description: Firebase Auth's custom domain auth.oriz.in is shared by every *.oriz.in
  subdomain and every Chrome/Firefox/Edge extension. One sign-in, one Firebase user,
  every surface.
tags:
- architecture
- auth
- firebase
- cross-site
- extensions
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- architecture/security/layer-3-auth-firebase-spark
- architecture/ops/extension-distribution
- architecture/ops/subscription-flow
- architecture/packages/the-23-packages
---



# Cross-site auth via auth.oriz.in

## Concept

The Firebase project `oriz-app` exposes its auth handler at the custom
domain `auth.oriz.in`. Every site (`*.oriz.in`) and every browser
extension funnels sign-in through that one domain, so the user signs
in once and is signed in everywhere.

## How it works

- Firebase project `oriz-app` is configured with custom auth domain
  `auth.oriz.in`
- Sites configure the Firebase web SDK with `authDomain: 'auth.oriz.in'`
  (via `@chirag127/firebase-init`)
- Browser tabs on `*.oriz.in` share Firebase's IndexedDB-backed auth
  state through cookie-less, third-party-safe redirect flows centred
  on `auth.oriz.in`
- Chrome / Firefox / Edge extensions use
  `chrome.identity.launchWebAuthFlow()` to bounce through
  `auth.oriz.in`. The returned ID token is stored in
  `chrome.storage.local`
- Every surface — sites and extensions — reads the same
  `users/{uid}/subscription` doc to gate features
- Auth UI lives in `@chirag127/auth-ui` re-exported from
  `@chirag127/oriz-kit`. Each site styles via `[data-oriz-account-*]`
  attribute hooks; oriz-kit ships no styles.

## Why this shape

A custom auth domain achieves three things at once:
1. Recruiters never see a `firebaseapp.com` URL during sign-in
2. Auth state survives browser third-party cookie restrictions, since
   `auth.oriz.in` is same-site with every `*.oriz.in` subdomain
3. Extensions can use the standard `chrome.identity` flow without each
   needing its own OAuth client

The single Firebase project also keeps the user model simple — one
`uid` per human across the entire family, so subscription unlocks
flow naturally.

## Cross-refs

- The Spark plan that hosts this → [layer-3-auth-firebase-spark.md](./layer-3-auth-firebase-spark.md)
- How extensions plug in → [extension-distribution.md](../ops/extension-distribution.md)
- What signing in unlocks → [subscription-flow.md](../ops/subscription-flow.md)
- Where the shared auth UI lives → [the-23-packages.md](../packages/the-23-packages.md)
