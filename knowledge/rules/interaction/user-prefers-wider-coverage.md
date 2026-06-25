---
type: rule
title: User prefers wider topical coverage over narrow SEO concentration
description: 'When a content-site scope question offers narrow-but-deep vs wide-but-shallow,
  the user picks wide. Cost: more content to write. Benefit: domain owns a category,
  not a niche. Apply as default.'
tags:
- meta
- taste
- preferences
- seo
timestamp: 2026-06-20
---



# User prefers wider topical coverage over narrow SEO concentration

## The rule

When designing scope for a content site, the user picks **wider topical coverage** over **narrow-but-deep SEO concentration** — when the only cost is more content, not more risk.

## The evidence

On 2026-06-20, the `cards-site` scope question:

- Recommended: "Credit cards only, India" (highest SEO concentration)
- Chosen: **"All financial cards, India"** (credit + debit + forex + prepaid + travel)

User chose to own "cards" as a category vs just "credit cards", accepting lower per-page rank for a wider topical net. See [cards-site-scope.md](../../decisions/architecture/apps/cards-site-scope.md).

## How to apply

When the next content-site scope question comes up (e.g. "what's the scope of `learn-site`? `health-site`? `food-site`?"):

- Make the wider scope the Recommended option when:
  - The wider scope doesn't introduce regulatory risk (legal advice, medical advice with PHI)
  - The wider scope doesn't double the audience research effort (e.g. India + US is double-effort, not "more content")
  - The narrower-deeper option is just a subset of the wider option
- Make the narrower scope the Recommended option when:
  - Going wider crosses an audience boundary (Indian + US markets are different)
  - Going wider crosses a compliance line (medical claims, financial advice that requires SEBI/SEC registration)
  - The narrower option is genuinely a different product

## When the rule does NOT apply

- **Tools sites** — already split by category by design. The split is the structure; "wider" doesn't apply.
- **Geographic split** — US + India is "wider" by geography but doubles audience research; that's not what this rule is about.
- **Risk-bearing scope** — never expand into legal/medical/financial-advice categories on autopilot just because they're "wider".

## Related taste rules

- [user-prefers-atomic-split.md](./user-prefers-atomic-split.md) — same session, structural split preference
- [self-update-rule.md](../agent/self-update-rule.md) — meta-rule that generated this rule
