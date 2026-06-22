---
type: decision
title: "Domain registrar exception: Spaceship card-on-file auto-renew (oriz.in)"
description: "oriz.in is registered at Spaceship with a card-on-file for auto-renewal. This is a deliberate, documented exception to the no-card-on-file rule. Reason: .in TLD renewals at every registrar require either a card-on-file (auto-renew) or annual manual prepayment, and missing a renewal would lose oriz.in (catastrophic). The exception is bounded to: this single domain + auto-renew only + no other Spaceship product activated."
tags: [decision, exception, domain, registrar, card-on-file]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
  - rules/no-card-on-file
---

# Domain registrar exception (Spaceship oriz.in)

## Decision

`oriz.in` is registered at **Spaceship** with a card-on-file enabling auto-renewal. This is a documented, bounded exception to [[rules/no-card-on-file]].

## Why this exception exists

- Losing `oriz.in` would invalidate the entire family (26 apps + 5 books + 17 packages cross-link the domain). Catastrophic.
- All registrars require either:
  - A card-on-file for auto-renewal, OR
  - Manual annual top-up that can be missed (and `.in` TLDs have aggressive deletion timelines after expiry — 30 days then auctioned).
- The risk of missing a manual renewal > the risk of one card-on-file at one registrar for one product.

## Bounds of this exception

- **Single domain only:** `oriz.in`. Other domains (if any) use no-card-on-file alternatives (.dev via Cloudflare Registrar at-cost, etc.).
- **Single product only:** domain registration. No Spaceship hosting / email / website builder activated.
- **No card-on-file anywhere else.** All other family services (Firebase Spark, CF Free, GitHub Free, Razorpay, etc.) follow the original rule.

## Operational notes

- Set a calendar reminder for 60 days before renewal — verify card still valid.
- Keep Spaceship account email synced to a primary inbox you monitor.
- If Spaceship raises card requirements (e.g. requires CVV recheck), document the new constraint here and revisit.

## Future migration path

If a no-card-on-file registrar offering `.in` TLD emerges (Cloudflare Registrar doesn't currently support `.in`), migrate. As of 2026-06-22, none exists.

## Cross-refs

- The rule this excepts → [[rules/no-card-on-file]]
- The stack-picks decision that references this → [[decisions/architecture/stack-picks-2026-06-22]]
