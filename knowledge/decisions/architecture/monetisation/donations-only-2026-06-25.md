---
type: decision
title: Donations only — no Pro tier, no ads, no Razorpay checkout
description: Locked 2026-06-25. Monetisation reduced to three donation rails — BuyMeACoffee, GitHub Sponsors, UPI. No Pro/Max paid tier, no AdSense, no Razorpay subscription flow. Reverses the centralized oriz.in/pricing decision and the auth+billing v0 polish lock.
tags:
- decision
- monetisation
- donations
- buymeacoffee
- github-sponsors
- upi
- no-ads
- no-subscriptions
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
related:
- decisions/architecture/security/monetization-centralized-on-oriz-in
- decisions/architecture/security/auth-billing-polish-locks-2026-06-22-evening
- decisions/architecture/security/auth-firebase-login-account-2026-06-25
- decisions/architecture/infrastructure/hosting-split-cf-and-gh-2026-06-25
- rules/interaction/no-card-on-file
supersedes: decisions/architecture/security/monetization-centralized-on-oriz-in
---

# Donations only — no Pro tier, no ads

## Decision

The oriz family is donation-funded only. Three rails: **Buy Me a Coffee**, **GitHub Sponsors**, **UPI** (direct VPA). No paid Pro/Max tier, no Razorpay subscription checkout, no AdSense or any ad network. Every app surfaces the same `@oriz/donate` widget; oriz.in/pricing is deleted.

## Why

- **No-card-on-file rule** stays clean — donation rails never auto-charge, payment gateways stay out of the runtime path.
- **Free hosting tier compatibility** — donation links satisfy BOTH Cloudflare Pages and GitHub Pages free-tier ToS (commercial subscription/checkout flows do not satisfy GH Pages).
- **One Razorpay merchant ID was a single point of failure** — removing checkout removes that risk and the per-app webhook/signature plumbing.
- **Single mental model** — same widget on every app, no per-app pricing copy, no tier-gated features to maintain.
- **India-first friendly** — UPI is the dominant rail for the home audience; BuyMeACoffee handles INR + global; GitHub Sponsors picks up the developer audience.
- **No subscriptions, anywhere** — the family-wide rule now applies in both directions (developer→service and app→user).

## Implications

- Delete `oriz.in/pricing`, the Razorpay webhook CF Pages Function, the 4 launch promo codes, the 15% referral program, the 7-day refund flow, and the GitHub Student Pack STUDENT50 path — all from the 2026-06-22 evening lock.
- Drop AdSense Auto Ads from every app (was previously on all apps except home + me).
- Tier-gated features must be re-evaluated — any "Pro only" feature either ships free for everyone or gets cut.
- New `@oriz/donate` shared package owns the widget; renders BuyMeACoffee + GitHub Sponsors + UPI QR + intent links. Mounted via universal account widget slot.
- Firestore `users/{uid}.tier` field is unused; can be removed once stale paths are cleaned.
- Sign-in remains useful (cross-app sync, history, profile) but never gates a feature behind a paywall — it only personalises the experience.
