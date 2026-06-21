---
type: service
title: "Family privacy page (oriz.in/privacy)"
description: "Self-built family-wide privacy page hosted on oriz.in. Single canonical /privacy URL every site, extension, and CLI references with optional per-surface addendum. Free — runs on existing Cloudflare Pages, no third-party tool, no card."
tags: [legal, privacy, compliance, oriz-in, primary]
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
role: legal-privacy
provider: self-hosted
free_tier: "Self-built static page on Cloudflare Pages — no third-party tool, no per-month cap, no quota"
swap_cost: low
related:
  - decisions/branding/family-wide-privacy-page
  - policy/privacy-policy-per-extension
  - services/hosting/cloudflare-pages
  - rules/no-card-on-file
---

# Family privacy page (oriz.in/privacy)

## Role

The single canonical privacy policy for the entire `chirag127/oriz*`
family. Lives at `https://oriz.in/privacy` on the master oriz-me-site
deployment (apex). Every site, extension, CLI, and worker in the
family links to this URL; per-surface addenda (extension permission
lists, site-specific data flows) live as nested pages
(`oriz.in/privacy/extension/<name>`, `oriz.in/privacy/<site>`) so
the boilerplate stays in one place.

## What it covers

- **Operator identity** — Chirag Singhal, India.
- **Contact email** for privacy-related questions.
- **Categorical "never collected" list** — full browsing history,
  keystrokes, payment details, government IDs.
- **GDPR / DPDP / CCPA** data-subject request process and timeline.
- **Complaint / takedown** process.
- **Cookie + analytics disclosure** — references the
  [5-tier analytics stack](../../decisions/architecture/analytics-five-tier-stack.md)
  (CFWA + GA4 + PostHog + Clarity + UTM) and which tools require
  consent vs. cookieless.
- **Per-surface addenda links** — one row per extension / site /
  worker that has surface-specific disclosures.
- **Effective date + revision log.**

## Why self-hosted

- **No third-party** — privacy-policy-as-a-service tools require
  monthly fees past ~3 sites or stamp the family with their branding.
  The family runs 11+ sites + 6+ extensions + workers; none qualify
  for free tier on hosted privacy-page tools.
- **One source of truth** — every surface in the family is bound by
  the same operator + same data-flow patterns; rewriting the policy
  per surface means drift.
- **Static page on Cloudflare Pages** — already in use for every site;
  no new infra, no card, no quota.

## Card / subscription required?

**NO.** Static markdown rendered by Astro on the existing
[Cloudflare Pages free tier](../hosting/cloudflare-pages.md). No
third-party tool involved.

## Alternatives

- **Termly / iubenda / Privacy Policies Generator** — paid past free
  tier (3-site limit), inject vendor branding, no control over
  content, fights [`no-subscriptions-anywhere`](../../decisions/monetisation/no-subscriptions-anywhere.md).
- **GitHub Gist + linkify** — works but no styling cohesion with the
  rest of the family.

## Swap cost

**Low.** Markdown source lives in
`projects/apps/personal/oriz-cs-me-app/src/content/legal/privacy.md` (master site). If
the family ever moves off the self-built path, the markdown is
portable to any hosted privacy-policy tool.

## Why this is our pick

The user's direction was *"+ family-wide /privacy on oriz.in"* —
locked at
[`decisions/branding/family-wide-privacy-page.md`](../../decisions/branding/family-wide-privacy-page.md).
Self-built keeps the legal content under family control,
zero-cost, and aligned with the
[no-paid-tier rule](../../rules/no-card-on-file.md).

## Cross-refs

- [Family-wide privacy page decision](../../decisions/branding/family-wide-privacy-page.md)
- [Per-extension privacy policy policy](../../policy/privacy-policy-per-extension.md)
- [Cloudflare Pages — host](../hosting/cloudflare-pages.md)
- [No card-on-file rule](../../rules/no-card-on-file.md)
- [Public/private line policy](../../policy/public-private-line.md)
