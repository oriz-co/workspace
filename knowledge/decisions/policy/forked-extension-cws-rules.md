---
type: decision
title: "Shipping a forked extension to Chrome Web Store under our name"
description: "GPL-3.0 forks (e.g. DeArrow) can be re-shipped to the Chrome Web Store under our developer account if we (1) keep GPL-3.0, (2) state it's a modified version in listing + about, (3) use a different name + icons, (4) host our own backend OR ask upstream maintainer for API permission, (5) pay the one-time $5 CWS developer fee (covered by no-card-on-file prepaid escape)."
tags: [decision, policy, forks, chrome-web-store, gpl, licensing]
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
  - rules/fork-discipline
  - rules/no-card-on-file
---

# Shipping a forked extension to Chrome Web Store

When publishing a fork of someone else's extension under our own
Chrome Web Store developer account:

## Hard requirements (license-level)

For **GPL / AGPL / LGPL** forks:
- Keep the original LICENSE file. Do not relicense.
- Make our source public (already satisfied — fork is on GitHub).
- State it's a modified version in the listing description **and**
  in any in-extension About / Settings text. Template:
  > "Forked from `<original-name>` by `<original-author>`.
  > Modified to `<one-line summary>`. Source: `github.com/<us>/<repo>`.
  > Original: `github.com/<upstream-owner>/<repo>`."

For **MIT / BSD / Apache** forks: only attribution is required.

For **proprietary / no-license / Apple-license-restricted** sources:
do NOT republish. Hard stop.

## Hard requirements (CWS-level)

- Use a **different extension name** — CWS rejects duplicates anyway.
- Use **different icons** (don't ship the upstream's logo files).
- One-time **$5 developer registration fee** to Chrome Web Store
  (covered by the prepaid-OK clause in [`no-card-on-file`](../../rules/no-card-on-file.md)).

## Soft requirement (API backend)

If the upstream extension talks to upstream's API (e.g. DeArrow
talks to `sponsor.ajay.app`), check the API ToS. For DeArrow
specifically, the API ToS says **"free to use for all non
browser-extensions"** — i.e. browser-extension use needs explicit
permission. Two paths:

1. **Ask upstream maintainer** by opening an issue on their repo
   describing the fork + traffic estimate. Free, polite, usually
   approved if the fork is non-commercial.
2. **Self-host the backend.** DeArrow's API is open-source and
   stateless (per its docs); the database is downloadable. Hosting
   costs are minimal (read-only edge cache).

Without either, the fork risks rate-limiting / blocking by upstream
at their discretion.

## What does NOT need permission

- Republishing the fork **source** on our GitHub — GPL already
  grants this.
- Putting the fork in our `projects/<owner>/frk/` tree as a
  submodule — internal only, no redistribution.

## Decision context

This rule was extracted on 2026-06-24 while planning the
chirag127/DeArrow CWS upload. Applies to any future fork we might
ship to CWS, App Store (different rules — see Apple Developer
program separately), Firefox Add-ons, or VS Code Marketplace.
