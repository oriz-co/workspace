---
type: decision
title: MIT license on all 41 chirag127/oriz* repos
description: "All 17 packages + 26 apps + 2 APIs relicensed from source-available-all-rights-reserved\
  \ to MIT on 2026-06-21. Unlocks every free-for-OSS perk (Sentry for OSS, Crowdin\
  \ for OSS, BrowserStack OSS, FOSSA, etc.) and clarifies commercial use is fine \u2014\
  \ the family still monetises via ads/affiliate/subscription, that's orthogonal to\
  \ the source license."
tags:
- decision
- license
- mit
- oss-eligible
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
supersedes:
- free-for-developer-not-for-services
related:
- services/easy-free-tier
- decisions/architecture/free-for-oss-program
---



# MIT license on all 41 chirag127/oriz* repos

## Decision

Every chirag127/oriz* repo is **MIT licensed** as of 2026-06-21.

Scope: 17 npm packages (`repos/oriz/own/lib/npm/*-npm-pkg`) + 26 apps (`repos/oriz/own/prod/apps/*/*/`) + 2 APIs (`repos/oriz/own/svc/api/*`) + any future submodule. The master umbrella (`chirag127/workspace`) is also MIT.

## Why

The previous "source-available all-rights-reserved" stance was vanity. It blocked the family from applying to free-for-OSS programs (Sentry for OSS = 1000× upgrade, Crowdin for OSS = unlimited i18n, BrowserStack for OSS = unlimited cross-browser testing, FOSSA, Mintlify Pro, Greptile, etc.) — all of which require an OSI license.

Commercial-use concerns are **orthogonal to the source license**. MIT licensing the source code doesn't stop the family from monetising the apps via ads / affiliate / subscription — those are services + product offerings, not the source code itself. Anyone can take the MIT source and run their own copy; that has cost them the effort of running it, which is exactly the friction that protects the family's business.

## What changed

- `LICENSE` file in every repo: replaced with standard MIT template, copyright "2026 Chirag Singhal"
- `package.json` `license` field: changed from `"SEE LICENSE IN LICENSE"` to `"MIT"`
- `README.md` license badge: changed from `license: source-available` (red) to `license: MIT` (blue)
- Any "no license granted" / "all rights reserved" prose in READMEs: removed
- The master umbrella's `LICENSE` also updated to MIT

## Memory file `free-for-developer-not-for-services` superseded

The earlier memory note interpreting "free for the developer" as "no license to others" is no longer accurate. Updated interpretation: "free for the developer" means the family doesn't pay recurring service fees (the no-card-on-file rule). The SOURCE LICENSE is now MIT — anyone can use the code; the user just doesn't pay to host any of it.

## OSS programs now applicable

After MIT switch, the family is eligible for:

- Sentry for Open Source (5M errors + Business features)
- BrowserStack for Open Source (unlimited cross-browser)
- Sauce Labs Open Sauce
- LambdaTest for OSS
- FOSSA for OSS
- Crowdin for OSS / Weblate Hosted Libre / Translation.io OSS
- Mintlify OSS Pro ($300/mo value)
- GitBook OSS / Algolia for OSS / Zulip Cloud for OSS
- Atlassian Open Source / JetBrains for OSS / 1Password Teams for OSS
- Docker-Sponsored Open Source
- Greptile for OSS

Apply for each via [[apply-to-oss-programs]] runbook (TODO: revive that runbook now that we're eligible).

## What this does NOT change

- **App monetisation continues**: ads (Ezoic / Mediavine / AdSense), affiliate (cards-app, lore-app), one-subscription-unlocks-all flow (via @chirag127/astro-billing + Razorpay).
- **Source-available-only programs**: a couple of services explicitly only accept "non-commercial OSS" (Mintlify free tier non-commercial, Codeberg Pages FOSS-only). These remain unavailable because the family is commercial. No-card free tiers and "OSS via OSI license" programs are what we just unlocked.

## Cross-refs

- The catalog of newly-eligible services → [[services/easy-free-tier]]
- The runbook for applying → [[apply-to-oss-programs]] (revive)
- Memory: free-for-developer-not-for-services (superseded interpretation)
