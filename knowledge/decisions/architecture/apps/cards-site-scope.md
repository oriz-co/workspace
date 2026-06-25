---
type: decision
title: "cards-site \u2014 all financial cards, India"
description: 'cards-site (cards.oriz.in) covers all financial cards in the Indian
  market: credit + debit + forex + prepaid + travel. Inspired by CardInsider / TechnoFino
  / Paisabazaar / BookMyForex. Reviews + comparisons + calculators + guides + offers
  + tools. Affiliate-monetisable.'
tags:
- architecture
- sites
- cards
- finance
- india
timestamp: 2026-06-20
---



# cards-site — all financial cards, India

## The decision

`cards-site` at `cards.oriz.in` covers **all financial cards in the Indian market**: credit, debit, forex, prepaid, travel. Not flashcards. Not playing cards. Not business-card-design tools.

Scope is "all cards, India" — wider than credit-only, narrower than India + US. Picked over the recommended "credit cards only, India" because the user wants to own "cards" as a category vs just "credit cards".

## The 6 page shapes

To rank against incumbents (CardInsider, CardExpert, TechnoFino, Paisabazaar, BankBazaar, BookMyForex), the site needs all six:

| Page type | What it holds | SEO target |
|---|---|---|
| **Card review** (one per card) | Fees, rewards rate per category, milestones, lounge access count, fuel/movie discounts, lost-card liability, eligibility, real screenshots | Long-tail: "axis magnus benefits", "hdfc infinia review" |
| **Comparison** | Side-by-side N cards on one criterion | Money-keyword: "best credit card for fuel", "best lifetime free credit card" |
| **Calculators** | Reward-rate calculator, milestone-spend tracker, statement-cycle planner, EMI vs lump-sum, forex markup vs flat-fee | Tool-keyword + repeat traffic |
| **Guides** | "First credit card", "credit score", "balance transfer", "annual-fee waiver hacks", "lounge access via debit cards" | Top-of-funnel |
| **Tools** | Card-name search, BIN lookup, rewards-program comparator, transaction-categoriser | Brand differentiation |
| **News / offers** | Card launches, devaluations, milestone changes, festive offers | Recency + retention |

## Why all 5 card types, not just credit

Credit cards alone is the SEO-strongest single category, but limiting to credit means:

- The domain name `cards.oriz.in` undersells what's there.
- Forex cards (BookMyForex's market) and prepaid cards (FamPay-era audience) have meaningful search volume in India.
- Debit-card lounge-access content is currently underserved on the major sites.

Trade-off accepted: lower per-page rank for any single card category, but a wider topical net.

## Why not India + US

US credit-card market (Chase, Amex, Capital One) is structurally different — no Indian site competes there well, and US competitors (NerdWallet, The Points Guy, Doctor of Credit) have ~15 years of authority. Splitting attention halves the India SEO and never wins US SEO.

If a US-card-specific site ever ships, it becomes a separate `us-cards-site` repo at a `.com` domain — not bolted on here.

## Sidebar tier

Tier C — browse-by-section + search. See [sidebar-4-tier.md](../frontend/sidebar-4-tier.md). Section tree:

```
Credit Cards
├── By Bank (HDFC, ICICI, Axis, SBI, Amex, ...)
├── By Network (Visa, Mastercard, RuPay, Diners, Amex)
├── By Feature (lounge, fuel, travel, cashback, lifetime free)
└── By Spend Tier (entry, mid, premium, super-premium)
Debit Cards
├── By Bank
└── By Feature (lounge access, forex markup)
Forex Cards
Prepaid Cards
Travel Cards
Tools
├── Reward Calculator
├── BIN Lookup
└── Comparator
Guides
News & Offers
```

## Monetisation

Affiliate-monetisable via Bankbazaar / Paisabazaar / IndusInd / HDFC affiliate networks. Per existing rules:

- **No card-on-file** — affiliate networks pay you, not the other way around. Compliant.
- **No paid subscriptions** — N/A.
- **Disclosure required** — every page that contains an affiliate link must disclose. Per [policy/](../../../policy/index.md). The honesty matters more than the revenue.

## Why the user overrode the recommendation

Recommended option was "Credit cards only, India" (highest SEO concentration). User picked "all financial cards, India" instead — same India scope but broader card-type coverage.

Pattern observed: **user prefers wider topical coverage over narrow SEO concentration when the cost is just more content, not more risk**. Captured as a meta-preference candidate. See [user-prefers-wider-coverage.md](../../../rules/interaction/user-prefers-wider-coverage.md).

## Related

- [tools-site-15-repos.md](../stack/tools-site-15-repos.md) — cards-site is NOT in the tools family; it's a content site
- [branding/repo-naming-suffixes.md](../../branding/repo-naming-suffixes.md) — current slug is `chirag127/cards-site` (fourth-pass naming; renamed from `oriz-cards` → `tabs` → `cards-site`)
- [sidebar-4-tier.md](../frontend/sidebar-4-tier.md) — Tier C config
- [max-payment-methods.md](../../monetisation/max-payment-methods.md) — affiliate fits within the existing monetisation matrix
