---
type: runbook
title: "Auth bug: 'Sign in shows even after login' \u2014 root causes + fix layers"
description: 'Diagnostic + fix runbook for the cross-domain auth-state-not-reflected
  bug. Primary fix shipped 2026-06-24 (e4dc935): wire startCookieSync into BaseLayout/DashboardLayout
  so cookie stays fresh across all account.oriz.in pages, not just sign-in. Secondary
  causes documented (cookie domain, SameSite, race conditions) for the next time this
  regresses.'
tags:
- runbook
- auth
- firebase
- cookie
- debugging
- cross-domain
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
- decisions/architecture/security/monetization-centralized-on-oriz-in
- runbooks/security/feature-flags-storage-2026-06-23
---



# Auth bug: 'Sign in' still showing after login

## Symptom

User signs in successfully at https://account.oriz.in/sign-in/. Dashboard works briefly. Sometime later (immediately on cross-app, or after ~1 h on same-app) the chrome on every *.oriz.in app shows "Sign in" CTA as if the user is signed out. Re-signing in fixes it for another hour.

## Architecture refresher

Cookie name: `oriz_auth`. Set at domain `.oriz.in` (with leading dot — applies to all subdomains). 1 h `Max-Age`. Contains JSON: `{uid, email, displayName, photoURL, idToken, exp}`. Set by `startCookieSync` (in `oriz-auth-app/src/lib/firebase.ts`) which listens to Firebase's `onAuthStateChanged` and re-writes the cookie every time Firebase rotates the ID token (~hourly).

Apps read the cookie via `authGateInit` (string of inline JS shipped in every chrome) which queries `document.cookie` on `DOMContentLoaded`. Two element classes drive visibility:
- `[data-auth-signed-in]` — visible when cookie exists + not expired
- `[data-auth-signed-out]` — visible when no valid cookie

## Root causes (in order of likelihood)

### 1. `startCookieSync` not invoked on every auth-surface page  ✅ FIXED 2026-06-24 (e4dc935)

The original wiring put `startCookieSync()` only on `/sign-in`, `/account`, `/verify-email`. If a user signed in then navigated to `/dashboard/personal-info` and stayed there, no listener was refreshing the cookie. After 1 h the cookie expired and the chrome on every other app saw the user as signed out.

**Fix:** move `startCookieSync()` into `BaseLayout.astro` + `DashboardLayout.astro` so EVERY page on the auth surface keeps the cookie alive.

### 2. Cookie domain too narrow

If the cookie is set with `Domain=account.oriz.in` instead of `Domain=.oriz.in`, then `crypto.oriz.in` can't read it. Current code is correct (`.oriz.in`); verify by opening DevTools → Application → Cookies on any app and checking the `Domain` column on `oriz_auth`. If it shows the wrong domain, the bug is here.

### 3. `SameSite=Lax` blocking cross-site reads

`SameSite=Lax` allows the cookie to be sent on top-level navigations BUT some browser versions treat redirects between subdomains as "site changes." If sign-in completes on `account.oriz.in` then redirects to `crypto.oriz.in/?return=...`, the cookie may not be visible on first render. Verify: open DevTools Network tab on the destination URL and check request cookies.

**If this regresses, change SameSite to `None` (requires `Secure`, which is already set):**
```ts
'SameSite=None',
```

### 4. Race condition: cookie set AFTER `authGateInit` reads

`onAuthStateChanged` is async (~50–500 ms after page load). `authGateInit` reads `document.cookie` on `DOMContentLoaded`. If the user just signed in and immediately navigated to another app, the destination app's chrome reads the cookie BEFORE the account.oriz.in callback has fired. Result: chrome reads stale "no cookie" state.

**Fix (not shipped yet):** authGateInit should also listen to `visibilitychange` and `pageshow` events, plus re-read the cookie on a `setInterval(apply, 5000)` for the first 30s of page life. Or: use `BroadcastChannel('oriz-auth')` for instant cross-tab sync.

### 5. Firebase project mismatch between auth surface and consumer

If `account.oriz.in` signs into Firebase project A and a different app reads from project B's auth state, neither cookie exchange nor Firebase SDK will agree. Check `PUBLIC_FIREBASE_PROJECT_ID` in each app's `.env` — must be `oriz-app` everywhere.

## Diagnostic ladder (when this regresses)

1. **DevTools → Application → Cookies → oriz.in**. Is `oriz_auth` there? What's its Expires/Domain/SameSite?
2. **DevTools → Console**: `JSON.parse(decodeURIComponent(document.cookie.split('oriz_auth=')[1]?.split(';')[0] || 'null'))`. Returns the cookie payload if present.
3. **DevTools → Network → reload**: does the request to the page have `oriz_auth` in its cookie header?
4. **DevTools → Network → filter "tokeninfo"** while on account.oriz.in/dashboard: do you see Firebase token refreshes every ~50min? If not, `startCookieSync` isn't running.
5. **Hard refresh on the broken app** (Ctrl+Shift+R) — if the bug goes away, it was a race on first render (#4 above).

## What's NOT the bug (already verified)

- The HTML `hidden` attribute toggling in `authGateInit` is correct. It's a boolean attribute, `el.hidden = false` removes it from the DOM. Logic in `auth-gate.ts` matches.
- Cookie write code in `lib/firebase.ts` correctly URL-encodes the JSON. No double-encoding.
- The `exp` field is unix seconds (not ms), and the read-side comparison `u.exp * 1000 < Date.now()` correctly compares them.

## Manual reproduction recipe

```
1. Open account.oriz.in/sign-in in fresh incognito.
2. Sign in with Google.
3. Navigate to crypto.oriz.in. Expect: chrome shows avatar + "Account" link.
4. If shows "Sign in" instead: open DevTools → Application → Cookies. Look for oriz_auth.
5. Bug is #1 if cookie is missing entirely.
6. Bug is #2 if cookie exists but `Domain` is "account.oriz.in" (no leading dot).
7. Bug is #4 if cookie exists, Domain ".oriz.in", but the page rendered before it propagated.
8. Reload the page. If chrome now shows avatar, it was #4. If still "Sign in", it's #1/#2.
```

## Cross-refs

- Monetization sign-in surface → [[decisions/architecture/monetization-centralized-on-oriz-in]]
- Family chrome (where the read happens) → `repos/oriz/own/lib/npm/astro-shell-npm-pkg/src/components/FamilyChrome.astro`
- Cookie write → `repos/oriz/own/prod/apps/hub/oriz-auth-app/src/lib/firebase.ts` `startCookieSync`
