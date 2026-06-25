---
type: decision
title: "Newsletter split \u2014 Buttondown for technical, EmailOctopus for marketing"
description: Two newsletter senders side by side. Buttondown handles the technical
  / dev audience (Markdown + API). EmailOctopus handles general marketing (visual
  editor, larger free tier).
tags:
- email
- newsletter
- buttondown
- emailoctopus
- omnipost
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/email/buttondown
- services/email/email-octopus
- services/email/resend
- decisions/architecture/general/cross-post-engine
- rules/interaction/no-card-on-file
---



# Newsletter split — Buttondown for technical, EmailOctopus for marketing

## Decision

The family runs **two newsletter senders side by side**:

| Sender | Audience | Free tier | Why |
|---|---|---|---|
| [Buttondown](../../../services/email/buttondown.md) | Technical / developer | 100 subs | Markdown native, REST API, RSS-to-email |
| [EmailOctopus](../../../services/email/email-octopus.md) | General marketing / announcements | 2,500 subs | Visual editor, automations, landing pages |

[Resend](../../../services/email/resend.md) remains transactional-only
(sign-in links, receipts, contact-form replies) — not a newsletter
sender. Resend, Buttondown, EmailOctopus are three distinct roles.

## Why two

- **Different audiences.** A deep-dive engineering digest and a
  general product announcement want different tones, frequencies, and
  unsubscribe pools. Stuffing both into one provider's audience
  segment couples the lifecycle of two communities that should be
  decoupled.
- **Different content workflows.** Markdown deep-dives in a git repo
  belong in Markdown-native, API-driven Buttondown. WYSIWYG visual
  campaigns belong in EmailOctopus's editor. Forcing one tool to do
  both fights the source of truth.
- **Already wired in.** The
  [`@chirag127/oriz-omnipost`](../../../glossary/o-r/omnipost.md) cross-post
  engine already includes a Buttondown adapter for the technical
  digest path, per
  [`decisions/architecture/cross-post-engine.md`](../general/cross-post-engine.md).
- **Free-tier ceilings stack.** 100 + 2,500 = 2,600 unique
  subscribers across two free tiers without ever asking for a card.

## Implementation

- `oriz-blog-site` (technical content) → Buttondown digest, RSS-to-email
  driven, sent on new-post via the omnipost adapter.
- General announcement / product launches → EmailOctopus, hand-composed
  in their editor, list-managed via embedded signup forms across the
  family.
- The signup widgets live as separate primitives — a
  `<TechNewsletterSignup />` (Buttondown form embed) and a
  `<MarketingNewsletterSignup />` (EmailOctopus form embed) — both
  surface from `@chirag127/oriz-kit` so per-site placement is
  uniform.

## Implications

- Two API tokens to manage in envpact: `BUTTONDOWN_API_KEY` and
  `EMAILOCTOPUS_API_KEY`.
- Two unsubscribe footers, two compliance surfaces — fine because
  the audiences don't overlap by design.
- The omnipost adapter for Buttondown follows the standard adapter
  contract from
  [`decisions/architecture/cross-post-engine.md`](../general/cross-post-engine.md):
  idempotent on RSS `<guid>`, canonical URL preserved.

## Cross-refs

- [Buttondown](../../../services/email/buttondown.md)
- [EmailOctopus](../../../services/email/email-octopus.md)
- [Resend](../../../services/email/resend.md) — transactional only
- [Cross-post engine decision](../general/cross-post-engine.md)
- [oriz-omnipost glossary](../../../glossary/o-r/omnipost.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
