---
type: index
title: Security
description: Index of concepts in runbooks/security.
tags:
- index
- security
timestamp: '2026-06-24'
format_version: okf-v0.1
status: active
---

# Security

## Categories

- [Credentials](./credentials/index.md)

## Concepts

- [Auth setup — log in once, publish + deploy forever](./auth-setup.md) — Every login command and dashboard URL needed to publish the @chirag127 packages and deploy the 11 oriz-family sites. Run these on YOUR terminal. Tokens go into envpact (the vault); none of them are pasted into agent chats. Re-run any section when a token is rotated.
- [Auth bug: 'Sign in shows even after login' — root causes + fix layers](./auth-signin-still-showing-2026-06-24.md) — Diagnostic + fix runbook for the cross-domain auth-state-not-reflected bug. Primary fix shipped 2026-06-24 (e4dc935): wire startCookieSync into BaseLayout/DashboardLayout so cookie stays fresh across all account.oriz.in pages, not just sign-in. Secondary causes documented (cookie domain, SameSite, race conditions) for the next time this regresses.
- [Backup metadata to Backblaze B2 (weekly, single umbrella workflow)](./backup-metadata-to-b2.md) — Single .github/workflows/backup-metadata-b2.yml in oriz-org/workspace enumerates all repos in oriz-org + chirag127, calls the GitHub Migration API to capture issues/PRs/wiki/releases per repo, and uploads .tar.gz archives to a single B2 bucket via S3-compatible CLI. Workspace is PUBLIC so Actions minutes are unlimited free. Code is already mirrored 6 hosts via mirror-all.yml — this workflow handles ONLY the metadata (which mirrors don't capture). Monthly restore test verifies one random tarball is unpackable + readable.
- [Feature-flag storage — Firestore vs CF KV vs D1 vs hybrid (with redundancy)](./feature-flags-storage-2026-06-23.md) — Audit of database choice for the family's feature-flag system. Locks in CF D1 (source-of-truth, SQL audit + LD-style targeting rules) + CF KV (edge cache for 50ms reads) + daily GitHub JSON snapshot (disaster recovery), all on the free tier. Addresses user concern that Firestore has poor performance and isn't a good fit. Includes per-option grilling, free-tier ceilings, backup strategy, and the exact reasons we did NOT pick the alternatives.
- [npm publish — token setup for chirag127/* packages](./npm-publish-token-setup.md) — How to generate an npm Granular Access Token with publish + unpublish bypass-2FA, store it in c:/D/oriz/.env as NPM_TOKEN, and use it for unattended publish/unpublish across the family's @chirag127/* packages.
- [Razorpay end-to-end setup — TEST keys + 4 plans + 4 promos + webhook + E2E test + LIVE](./razorpay-end-to-end-setup.md) — Step-by-step checklist for wiring Razorpay subscriptions into the oriz family: generate TEST API keys, verify the 4 pre-created plans, add a webhook with the right event set, create 4 promo codes, integrate via @chirag127/astro-billing, test E2E with a test card + ngrok, and finally flip to LIVE. Plain English, checklist style; assumes signup is already done.
- [Set up Razorpay Subscriptions + Paddle Checkout (Pro Monthly/Yearly + Max Monthly/Yearly)](./razorpay-paddle-subscriptions-setup.md) — Step-by-step guide to set up Razorpay Subscriptions (India INR rail) and Paddle Checkout (rest-of-world USD rail) for the 4 oriz subscription tiers: Pro Monthly ₹99/$1.19, Pro Yearly ₹799/$9.59, Max Monthly ₹299/$3.59, Max Yearly ₹2499/$30. Both go through monthly+yearly only (no lifetime). Razorpay: Sole-proprietor PAN-only KYC. Paddle: Vendor signup with W-8BEN.
- [Set up the weekly restic → Backblaze B2 backup](./restic-backup-setup.md) — One-page setup for the family's weekly encrypted backup: install restic in a GH Actions runner, init the repo against a Backblaze B2 bucket, schedule the weekly cron, set the retention policy. Secrets sourced from Doppler.
- [Rotate a leaked secret](./rotate-leaked-secret.md) — Run when a secret is suspected leaked, has entered any chat transcript, or has appeared in an untrusted log. Revoke at the dashboard, reissue, re-login locally, store via envpact, verify, then audit recent activity.
- [Set / update GitHub Actions secrets at the chirag127 org level](./set-github-org-level-secrets.md) — Pull a secret value from Doppler, push it to the chirag127-org-level GitHub Actions secrets list with `gh secret set --org chirag127 --visibility all`, then verify with `gh secret list`. Idempotent. Used after adding a new key to templates/.env.example, after a rotation, and on the quarterly audit cadence.
