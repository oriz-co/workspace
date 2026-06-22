---
type: decision
title: "Monetisation playbook — only rails that do NOT require a card on file"
description: "Master matrix of every viable monetisation rail for the oriz family in 2026, filtered by the hard no-card-on-file rule. Each row marks card-required Y/N (with source URL), revenue cut, region, setup friction, and best-fit surface. Replaces ad-hoc per-channel decisions with one canonical lookup."
tags: [decision, monetisation, payments, no-card-on-file, play-store, microsoft-store, chrome-web-store, amo, edge-addons, razorpay, paddle, lemon-squeezy, polar-sh, ko-fi, gumroad, leanpub, kdp, github-sponsors, liberapay, substack, patreon, affiliate]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
  - rules/no-card-on-file
  - decisions/monetisation/max-payment-methods
  - decisions/monetisation/razorpay-as-primary-billing
  - decisions/monetisation/no-subscriptions-anywhere
  - decisions/architecture/revenue-channels-2026
  - decisions/architecture/pwabuilder-as-primary-converter
  - decisions/architecture/no-firebase-functions
  - decisions/policy/monetisation-channel-matrix
---

# Monetisation playbook — only rails that do NOT require a card on file

The hard constraint: **no recurring auto-debit card stored anywhere on our side**. One-time prepaid fees are fine (Play $25, CWS $5). Bank-only payout rails are fine. KYC with PAN + bank is fine. UPI-autopay mandate (consent per debit) is fine.

Everything below is filtered against that rule. Card-required = YES rows are listed only for completeness with a "DO NOT USE" tag.

## 1. App store rails (one-time install / paid app / IAP)

| Rail | Card on file? | Setup fee | Cut | Region | Notes | Source |
|---|---|---|---|---|---|---|
| **Google Play — dev account** | NO (one-time $25, debit card OK, no recurring) | $25 lifetime | n/a | Global | Pay $25 once via debit/credit. No yearly renewal. | [Play Console help](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en) |
| **Google Play — paid app + IAP + subs** | NO (payout via wire to bank; need PAN + bank only) | $0 extra | 15% (under $1M/yr), 30% above | Global | Merchant payouts to Indian bank via wire from US. No card-on-file. | [Play merchant bank info](https://support.google.com/googleplay/android-developer/answer/7161440?hl=en) |
| **Google Play Billing in TWA (Bubblewrap/PWABuilder)** | NO | included | included | Global | Works for one-time IAP + base subs via Digital Goods API + Payment Request API. Caveat: **multi-base-plan subs are NOT supported in TWA** — only the default base plan resolves. Use one-time IAP + one default sub. | [chromeos/pwa-play-billing](https://github.com/chromeos/pwa-play-billing), [Stack Overflow](https://stackoverflow.com/questions/77293542/are-google-play-billing-subscription-base-plans-supported-in-bubblewrap-twa) |
| **AdMob in PWA-TWA** | NO (payout-only) | $0 | Google takes ad rev share | Global | Officially unsupported via Web AdSense JS inside TWA (policy risk: "ads as a result of any action of a software application"). Use AdMob native SDK only if you eject from TWA → native; otherwise stick to AdSense on the apex web app. | [r/PWA discussion](https://www.reddit.com/r/PWA/comments/k90owi/ads_on_pwa/) |
| **Microsoft Store — individual dev** | NO | **$0** (fee removed Sept 2025) | n/a | Global | Microsoft removed the $19 individual fee in Sept 2025. | [MS Learn](https://learn.microsoft.com/en-us/windows/apps/publish/whats-new-individual-developer), [Extremetech](https://www.extremetech.com/internet/microsoft-store-eliminates-registration-fees-for-individual-developers) |
| **Microsoft Store — paid apps + IAP + subs** | NO | $0 | 0% if you bring your own commerce (non-gaming); 12% if MS commerce | Global | "Choose your own commerce platform and keep 100% of the revenue for non-gaming apps." Or use MS commerce for built-in IAP/subs/ads/tips. | [MS Learn — get-started](https://learn.microsoft.com/en-us/windows/apps/publish/get-started) |
| **Chrome Web Store — dev fee** | NO (one-time $5) | $5 lifetime | n/a | Global | Already paid per existing knowledge. | n/a |
| **Chrome Web Store — paid extensions** | DEAD (deprecated Feb 2020) | n/a | n/a | n/a | DO NOT USE. CWS Payments shut down. Use external license-key + Gumroad/LS/Razorpay for paid extensions; or donation link from listing. | [The Verge 2020](https://www.theverge.com/2020/9/22/21451111/google-paid-chrome-extension-monetize-shut-down-end), [Chromium groups](https://groups.google.com/a/chromium.org/g/chromium-extensions/c/sS3W-7QdaX4) |
| **Mozilla AMO (Firefox)** | NO | $0 | n/a | Global | Free to publish. Cannot charge on AMO. "Contribute" button on listing links to your donation provider. | [Firefox Extension Workshop](https://extensionworkshop.com/documentation/publish/make-money-from-browser-extensions/) |
| **Microsoft Edge Add-ons** | NO | $0 | n/a | Global | Free dev account, free to publish. No native paid store. | [MS Learn — Edge register](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/create-dev-account) |

## 2. Web payment rails (PWA on `*.oriz.in`)

| Rail | Card on file? | Setup fee | Cut | Region | KYC shape | Source |
|---|---|---|---|---|---|---|
| **Razorpay (Payment Pages, no-code)** | NO | $0 | 2% domestic / 3% intl (transaction fee, not subscription) | India primary; intl card accept | PAN + Aadhaar + bank proof; no card-on-file | [Razorpay Payment Pages](https://razorpay.com/payment-pages/), [Razorpay KYC docs](https://razorpay.com/blog/documents-required-for-payment-gateway) |
| **Lemon Squeezy** | NO at signup ("no card required") | $0 | 5% + 50¢ | Global; MoR handles VAT | KYC + identity verify required before activation | [LS help — sign up free, no card](https://www.lemonsqueezy.com/help), [LS verify identity](https://docs.lemonsqueezy.com/help/getting-started/verify-your-identity) |
| **Paddle** | NO at signup; identity check (sole-trader OK) | $0 | 5% + 50¢ (default) | Global; MoR | Sole-trader path: individual identity verification, no business reg required. Some solo founders rejected — pre-flight test recommended. | [Paddle identity verification](https://www.paddle.com/help/start/account-verification/what-is-identity-verification), [Paddle sole-trader Reddit](https://www.reddit.com/r/SaaS/comments/1o94icz/) |
| **Polar.sh** | NO ("free signup, no credit card required") | $0 | 4% + 40¢ | Global; MoR | GitHub OAuth + bank/payout setup | [Polar docs](https://polar.sh/docs/introduction) |
| **Gumroad** | NO ("no credit card or monthly fee is required to get started") | $0 | 10% flat | Global | PayPal or Stripe Connect for payout | [Gumroad signup overview](https://contentcreators.com/tools/gumroad-review) |
| **Ko-fi** | NO | $0 | 0% on tips (creator's PayPal/Stripe fees only); 5% on Gold features | Global | Direct PayPal OR Stripe Connect; no Ko-fi-side card | [Ko-fi how I get paid](https://help.ko-fi.com/hc/en-us/articles/115003980093-How-do-I-get-paid) |
| **Buy Me a Coffee** | NO | $0 | 5% on transactions | Global (Stripe-supported countries) | Stripe Connect Standard; payouts every Wednesday | [BMC payouts setup](https://help.buymeacoffee.com/en/articles/10025793-how-do-you-set-up-payouts-on-your-buy-me-a-coffee-page) |
| **GitHub Sponsors** | NO | $0 | 0% (GitHub waives) | Global (Stripe Connect Express, 30+ countries incl. India) | Bank account in same region as residence | [GitHub Sponsors docs](https://help.github.com/en/github/supporting-the-open-source-community-with-github-sponsors/setting-up-github-sponsors-for-your-user-account), [r/developersIndia](https://www.reddit.com/r/developersIndia/comments/1nkx5qv/) |
| **Liberapay** | NO (recurring tips, no cards from creator side) | $0 | 0% platform | Global; SEPA-friendly for EU | Email-only signup; payout via Stripe/PayPal/Wise | [Liberapay sign-up](https://en.liberapay.com/sign-up) |
| **Open Collective** | NO | $0 | 5-10% via fiscal host | Global | Fiscal-host-based; public ledger | (existing knowledge) |
| **PayPal.me / UPI Direct QR / Crypto address** | NO | $0 | 0% (PayPal F&F + UPI free; crypto = network fee) | Global / India / Global | Personal accounts only | (existing knowledge) |
| **Patreon** | NO (creator side); members pay with cards | $0 | 5–12% + processing | Global; Stripe/PayPal/Payoneer | Payoneer alt-payout for non-US | [Patreon payouts](https://support.patreon.com/hc/en-us/articles/208656246-How-payouts-work) |
| **Substack (paid newsletter)** | NO | $0 | 10% + Stripe (2.9% + 30¢ + 0.7% billing fee) | Global | Stripe Connect | [Substack pricing](https://support.substack.com/hc/en-us/articles/360037607131) |

## 3. Book channels

| Rail | Card on file? | Royalty | Region | KYC | Source |
|---|---|---|---|---|---|
| **Leanpub** | NO | 80% minus 50¢ above $7.99 | Global | PayPal min $20 OR Wise min $100 payout | [Leanpub royalties](https://help.leanpub.com/en/articles/110527-how-and-when-do-you-pay-royalties) |
| **Gumroad** | NO | 90% (10% Gumroad fee) | Global | PayPal/Stripe Connect | (above) |
| **Amazon KDP** | NO | 35-70% depending on price band | Global (India: wire to local bank) | Tax interview (PAN for India) + bank | [KDP India guide](https://blog.bookautoai.com/amazon-kdp-india-taxes-payouts/), [KDP when paid](https://kdp.amazon.com/en_US/help/topic/GK2MKZUL6U3SFBPZ) |
| **Google Play Books Partner Centre** | NO | 70% | Global | Same payments profile as Play Console | (existing) |
| **Draft2Digital** (aggregator → B&N, Kobo, Scribd, etc.) | NO | ~60% net (channel-dependent) | Global | EIN/PAN + bank or PayPal | (existing knowledge) |
| **Apple Books** | SKIP | n/a | n/a | requires Mac + $99/yr ADP recurring = card-on-file | per `ios-pwa-only-no-mac` memory |

## 4. Affiliate networks

| Network | Card on file? | Setup | Region | Best fit |
|---|---|---|---|---|
| **Amazon Associates (.in + .com)** | NO | PAN + bank for IN; ITIN/SSN for .com (or W-8BEN) | Both | Book pages, tools-site reviews, scribe-text reviews |
| **Cuelinks** | NO | PAN + bank | India aggregator | India-targeted content sites (cards-site, paisa-finance) |
| **Skimlinks** | NO | Bank payout via Tipalti | Global aggregator | Blog content, journal-site |
| **Impact Radius** | NO | Tax form + bank | Global | Brand-direct affiliate (specific SaaS) |

Source for Cuelinks-as-India-affiliate-route: [Geniuslink guide](https://intercom.geni.us/en/articles/1821915-cuelinks-amazon-india-how-to-get-setup-and-receive-affiliate-payments).

## 5. Cards-required (DO NOT USE)

Listed once so future prompts don't re-suggest them:

| Service | Why excluded |
|---|---|
| Apple Developer Program | $99/yr recurring; requires card on file. Also need Mac. |
| Firebase Blaze | Card on file mandatory. See [`firebase-spark-forever`](../infrastructure/firebase-spark-forever.md). |
| X API Basic ($100+/mo) | Recurring card. |
| Stripe direct subscriptions (without an MoR wrapper) | Operationally fine, but we have no entity → MoR via LS/Paddle/Polar handles VAT for us; Stripe direct dumps the burden on us. |
| Vercel Pro / Sentry Team / any paid SaaS dev tier | Recurring. See [`no-subscriptions-anywhere`](./no-subscriptions-anywhere.md). |

## 6. UNKNOWNs — pre-flight test before relying on

| Item | Why UNKNOWN | Test |
|---|---|---|
| **Paddle for Indian sole proprietor with no GST/no entity** | Reddit reports inconsistent — some accepted, some rejected | Sign up and run identity verification before announcing; have LS as fallback |
| **Lemon Squeezy KYC for Indian individual** | KYC review is per-merchant manual; published policy says "individuals welcome" but India + no-entity is a thin case | Sign up, submit ID, see whether KYC clears within 7 days |
| **Google Play subscription multi-base-plans in TWA** | StackOverflow says base-plan selection unsupported in TWA | Use single-base-plan subs only; reject the feature if real product needs >1 base plan |

## 7. Lowest-friction picks per surface

(See [`per-surface-recommendations.md`](./per-surface-recommendations.md) for the full per-surface breakdown.)

Top-3 per surface, ranked:

- **Play Store AAB (PWA via PWABuilder)** → one-time paid app · one-time IAP (Pro unlock ₹99) · single-base-plan sub via Play Billing in TWA
- **Microsoft Store MSIX** → free app + own-commerce link to Razorpay/LS · MS Store IAP (12%) · paid app
- **Chrome Web Store extension** → free + Razorpay donation link · free + Gumroad license-key for Pro · free + Ko-fi link
- **AMO (Firefox)** → free + Liberapay button · free + Ko-fi button · free + GitHub Sponsors button
- **Edge Add-ons** → same as AMO
- **Web PWA on `*.oriz.in`** → Razorpay Payment Pages (IN) · Lemon Squeezy (RoW) · Polar.sh (OSS) — already locked by [`max-payment-methods`](./max-payment-methods.md)
- **Books** → Leanpub (git push, 80% royalty) · Gumroad (10% cut, instant payout) · Amazon KDP (reach)
- **Blog / newsletter** → Substack 10% (paid tier on demand) · Ko-fi monthly Gold · Liberapay recurring tip
- **Affiliate** → Amazon Associates (IN + .com) · Cuelinks (India aggregator) · Skimlinks (global)

## 8. Reconciliation notes against existing files

Read but NOT edited — these contradictions flagged for user reconciliation:

- [`revenue-channels-2026.md`](../architecture/revenue-channels-2026.md) lists `Microsoft Store cut: 12%`. **Update**: Microsoft now allows 0% cut if you bring your own commerce platform for non-gaming apps. The 12% only applies if you use MS commerce. → may want to switch to "bring own commerce" via Razorpay/LS link to keep 100%.
- [`revenue-channels-2026.md`](../architecture/revenue-channels-2026.md) lists `Chrome Web Store: 5% Google fee`. **Update**: CWS Payments were fully shut down in 2020 — no in-store paid extensions are possible. 5% is no longer a valid cut. → External license-key flow only.
- [`razorpay-as-primary-billing.md`](./razorpay-as-primary-billing.md) lists fallback order: `Stripe → Lemon Squeezy → Paddle`. **Conflict**: Stripe direct dumps VAT burden on us with no entity. Recommend fallback order be: `Lemon Squeezy → Paddle → Polar.sh` (all MoR). Stripe direct is incompatible with no-entity + no-card-on-file posture.
- [`monetisation-channel-matrix.md`](../policy/monetisation-channel-matrix.md) is consistent with this playbook.
- [`no-subscriptions-anywhere.md`](./no-subscriptions-anywhere.md) — user-facing subs (Free/Pro/Ultra/Max) are explicitly allowed; this playbook only covers HOW to charge for them, not whether to.

## Cross-refs

- [No card-on-file rule](../../rules/no-card-on-file.md)
- [Max payment methods (existing rail list)](./max-payment-methods.md)
- [Per-surface recommendations](./per-surface-recommendations.md)
- [No Firebase Functions](../architecture/no-firebase-functions.md)
- [Revenue channels 2026](../architecture/revenue-channels-2026.md)
- [Monetisation channel matrix policy](../policy/monetisation-channel-matrix.md)
