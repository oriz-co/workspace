---
type: decision
title: "Per-surface monetisation recommendations — what rail to use where"
description: "Per-distribution-surface picks: which payment rail to use for Play Store AABs, Microsoft Store MSIX, Chrome/Firefox/Edge extensions, web PWAs, books, blog, newsletter. Derived from playbook-no-card-rails.md; this is the cookbook view."
tags: [decision, monetisation, per-surface, recommendations, playbook]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
  - decisions/monetisation/playbook-no-card-rails
  - decisions/monetisation/max-payment-methods
  - decisions/architecture/pwabuilder-as-primary-converter
  - decisions/architecture/revenue-channels-2026
---

# Per-surface monetisation recommendations

Lookup-table view of [`playbook-no-card-rails.md`](./playbook-no-card-rails.md). Every row is no-card-on-file safe.

## Play Store apps (AAB built via PWABuilder/Bubblewrap → TWA)

| Pick | Rail | Why | Cut |
|---|---|---|---|
| Primary | One-time paid app + one-time IAP "Pro unlock" via Play Billing in TWA | Native to Play, no external checkout to maintain, refunds handled by Google | 15% (under $1M/yr) |
| 2nd | Free app + single-base-plan subscription via Play Billing (Digital Goods API in TWA) | Recurring revenue without needing our own MoR | 15% |
| 3rd | Free app + AdSense on the underlying web PWA + Play just as a distribution shell | Avoids AdMob-in-TWA policy risk; ad rev comes from `*.oriz.in` traffic | AdSense rev share |

Hard caveat: **multi-base-plan subscriptions are not supported in TWA** — keep one base plan per product.

## Microsoft Store apps (MSIX built via PWABuilder)

| Pick | Rail | Why | Cut |
|---|---|---|---|
| Primary | Free app + external link to Razorpay/LS for Pro unlock (BYO commerce) | Keep 100% non-gaming revenue; MS only takes a cut if we use MS commerce | 0% |
| 2nd | MS Store IAP for IN-app one-time unlock | Native UX, one purchase = one MSFT account licence | 12% |
| 3rd | Paid app via MS commerce | Simpler than IAP if no free tier needed | 12% |

## Chrome Web Store extensions

CWS Payments shut down in 2020 — no in-store paid extensions possible.

| Pick | Rail | Why | Cut |
|---|---|---|---|
| Primary | Free + Razorpay/LS license-key on extension's website + extension validates via API | Same flow as the rest of the family; reuses keygen.sh fulfilment | 2-5% transaction fee |
| 2nd | Free + Gumroad license-key product link | Lower friction for global buyers; Gumroad handles checkout + tax | 10% |
| 3rd | Free + Ko-fi/BMC donation link on options page | For extensions that don't justify a paid tier | 0-5% |

## Firefox Add-ons (AMO)

AMO does not support paid extensions natively. Add a "Contribute" button to the listing pointing to your donation provider.

| Pick | Rail | Why |
|---|---|---|
| Primary | Liberapay button (0% platform, recurring) | Aligns with FLOSS ethos; Mozilla-friendly |
| 2nd | Ko-fi (tips + Gold tier) | Wider audience awareness |
| 3rd | GitHub Sponsors | Already wired for the rest of the family |

## Microsoft Edge Add-ons

Same as AMO — no native payments. Donation-link only. Same three picks.

## Web PWA on `*.oriz.in` (free + Pro tier)

Already locked by [`max-payment-methods.md`](./max-payment-methods.md). Quick re-statement:

| Pick | Rail | Why |
|---|---|---|
| Primary (IN buyer) | Razorpay Payment Pages | UPI + cards + netbanking + wallets; no-code hosted pages |
| Primary (RoW buyer) | Lemon Squeezy | MoR handles VAT for no-entity seller |
| OSS sponsor (any geo) | Polar.sh | 4% + 40¢; GitHub-native |
| Donations grid | GH Sponsors + Ko-fi + BMC + Liberapay + Open Collective + PayPal.me + UPI QR + crypto | Maximum donor choice |

## Books

| Pick | Rail | Why | Cut |
|---|---|---|---|
| Primary | Leanpub (git push from manuscript repo) | 80% royalty, lifetime updates, MEAP-style early access | 20% + 50¢ |
| 2nd | Gumroad | Instant payout, weekly Friday transfer; same checkout as Pro-tier app unlocks | 10% |
| 3rd | Amazon KDP | Reach + discoverability; pays via wire to Indian bank in INR | 30% |
| Fan-out | Draft2Digital → B&N/Kobo/Scribd | Single upload → multiple stores | ~40% (channel-dependent) |
| Skip | Apple Books | Requires Mac + $99/yr ADP = card-on-file. Hard blocked. |

## Blog (`oriz.in/blog`, dev.to, Hashnode, Medium)

| Pick | Rail | Why |
|---|---|---|
| Primary | AdSense on apex web app | Already approved per `adsense-apex-application` |
| 2nd | Affiliate inline (Amazon Associates / Cuelinks / Skimlinks where TOS allows) | Per `monetisation-channel-matrix.md` |
| 3rd | Substack newsletter capture → paid tier 10% cut | Long-form readers self-select into paid digest |

## Newsletter

Single Substack for the family per [`newsletter-substack.md`](../architecture/newsletter-substack.md).

| Pick | Rail | Why |
|---|---|---|
| Primary | Substack free tier; flip on paid tier when there's >1k subs | 10% Substack + Stripe fee; no upfront cost |
| 2nd | Ko-fi Gold monthly tier | Same audience; lower platform fee at 5% |
| 3rd | Liberapay weekly/monthly tips | For donors who hate cards |

## Affiliate (cross-cuts content + tools)

| Pick | Rail | Best for |
|---|---|---|
| Primary | Amazon Associates (.in + .com) | Book recommendations, scribe-text, paisa-finance |
| 2nd | Cuelinks | India e-commerce/finance (cards-site, paisa-finance) |
| 3rd | Skimlinks | Global outbound links on blog content |
| 4th | Impact Radius | Direct-brand SaaS affiliate (when specific tool wanted) |

## Cross-refs

- [Master playbook (no-card rails)](./playbook-no-card-rails.md)
- [Max payment methods](./max-payment-methods.md)
- [Monetisation channel matrix policy](../policy/monetisation-channel-matrix.md)
- [Revenue channels 2026](../architecture/revenue-channels-2026.md)
