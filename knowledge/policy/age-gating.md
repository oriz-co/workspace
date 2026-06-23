---
type: policy
title: "Age-gating policy (family-wide)"
description: "Adult-content sections across the family require an 18+ cookie attestation with 365-day expiry. Annual jurisdictional review."
tags: [policy, age-gate, privacy, compliance]
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
annual_review: true
related:
  - policy/public-private-line
  - policy/journal-not-public
  - decisions/content/100-year-strategy-locked
---

# Age-gating policy (family-wide)

## The policy

Any page or section that surfaces content legally restricted to adults
in any major audience jurisdiction renders behind a single 18+ cookie
gate before any thumbnail, title, or body text is exposed.

## Scope

- All `*.oriz.in` sites, with `me.oriz.in` as the primary consumer.
- All Chrome / Firefox / Edge extensions that surface lifestream-style
  content from the same data store.
- All listing pages that *might* render an `age-gated-18` row, even on
  days when today's data has zero such rows.

## Rules

- **What is gated.** Movies / TV with upstream rating `18`, `R18+`,
  `NC-17`, `X`, `Adults Only`, or any equivalent national classification
  meaning "restricted to adults"; AniList `is_adult: true` or `Rx`
  hentai; manga flagged `pornographic` on MangaDex; VNDB `erotic` /
  `explicit sexual content` flags; manual log entries Chirag explicitly
  flags as 18+.
- **What is NOT gated.** US R / UK 15 / IN A movies, horror or war,
  profanity-heavy works, mental-health discussion, political content.
  These render publicly with framing where needed, never with a
  confirmation prompt.
- **Mechanism.** A single React island reads cookie
  `oriz-me:age-gate-18`. Value `accepted-YYYY-MM-DD` within the last
  365 days unlocks. Otherwise the gate UI prompts; on accept the cookie
  is rewritten with today's date, `Max-Age=365d`, `SameSite=Lax`,
  `Secure`, `Path=/`.
- **Never collect date-of-birth.** A binary attestation is sufficient
  and DOB collection would trigger children's-data and consent-age
  compliance obligations the family is not equipped for.
- **Listing-level guarding.** If a listing page might contain any
  age-gated row, the listing itself sits behind the gate — thumbnails
  cannot leak ahead of the prompt.
- **Server-side reinforcement.** Gated pages emit
  `<meta name="rating" content="adult">`,
  `<meta name="robots" content="noindex">`, and
  `<body data-oriz-age-gate="required">`. Sitemaps omit gated routes.
- **No SSR leak.** Gated children mount with `client:only="react"` so
  the SSR payload for an unattested visitor contains only the prompt.

## Exceptions

- **Public archive after death.** Per the 100-year strategy, the public
  archive activated after Chirag's death continues to honour the gate
  for any `age-gated-18` row.
- **Per-site mechanism overrides.** A site may swap the cookie name
  (e.g. `oriz-blog:age-gate-18`) but never the duration, attestation
  shape, or listing-level guarding rule.

## Annual review

On every birthday, re-read **UK Online Safety Act**, **EU Digital
Services Act**, **India IT Rules 2021**, and **Australia eSafety Act**.
Update this file in the same review session if any threshold has moved.
The 365-day cookie is intentional — the natural expiry forces a
re-prompt aligned with the review cycle.

## Cross-refs

- [`./public-private-line.md`](./public-private-line.md) — the four-tier visibility model `age-gated-18` slots into
- [`./journal-not-public.md`](./journal-not-public.md) — adjacent gate (auth instead of attestation)
- [`projects/oriz/own/prod/apps/personal/oriz-cs-me-app/knowledge/decisions/age-gating-policy.md`](../../projects/oriz/own/prod/apps/personal/oriz-cs-me-app/knowledge/decisions/age-gating-policy.md) — original app-scoped version (in the oriz-cs-me-app submodule) this file supersedes for family use
