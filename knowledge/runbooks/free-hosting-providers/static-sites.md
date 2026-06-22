---
type: runbook
title: "Free hosting — static sites (CF Pages, GH Pages, Netlify, Vercel, Surge, Render, Neocities, Bunny, Fleek)"
description: "Provider-by-provider free-tier numbers for static site hosting. Cloudflare Pages stays the family primary; GitHub Pages is the mirror. Verdict column distinguishes KEEP / EVALUATE / DROP for a 50+ project fleet under the no-card-on-file rule."
tags: [runbook, hosting, free-tier, static-sites, cloudflare-pages, github-pages, netlify, vercel]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
  - runbooks/free-hosting-providers/index
  - rules/no-card-on-file
  - decisions/architecture/cloudflare-pages-hosts-every-website-and-app
---

# Static site hosting — free tiers (2026-06-22)

Family primary: **Cloudflare Pages** (every site + app). Family mirror: **GitHub Pages** (same `git push`, public repos only).

## The table

| # | Provider | Projects/Sites | Bandwidth/mo | Builds/mo | Custom domain (free) | HTTPS auto | Card at signup | Card to use free | KYC | Commercial OK | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Cloudflare Pages** ⭐ | Unlimited sites, soft 100 projects/account (raise on request) | **Unlimited** | 500/mo account-wide, 1 concurrent, 20-min timeout | 100 per project | Yes | NO | NO | NO | YES | **KEEP (primary)** |
| 2 | **GitHub Pages** ⭐ | Unlimited (1 per repo, public repos free) | 100 GB/mo (soft) | 10/hour (soft); 1 GB repo size soft | Yes | Yes | NO | NO | NO | YES (no commerce backend) | **KEEP (mirror)** |
| 3 | Netlify Free | Unlimited sites | Credit-pooled (~15 GB / 300 credits/mo), hard cap, no overages | 300 build min/mo (legacy) → credit pool | Yes | Yes | NO | NO | NO | YES | **EVALUATE** — credit model unpredictable across 50+ apps |
| 4 | Vercel Hobby | 200 projects hard cap | 100 GB Fast Data Transfer | 45-min cap, 100 deploys/day, 1 concurrent | 50 per project | Yes | NO | NO | NO | **NO** (commercial, AdSense, donations, affiliate-primary banned) | **DROP** — commercial-use ban |
| 5 | Render Static | 25 services total cap | 5 GB/mo (cut from 100 GB on 2026-04-23) | 500 pipeline min/mo | 2 included; $0.25/mo per extra | Yes | NO | NO | NO | YES | **DROP for static** — fan-out limit + 5 GB cap |
| 6 | Surge.sh | Unlimited | Unmetered for static | Unlimited (CLI) | Yes (CNAME) | Yes (sub) / paid (root) | NO | NO | NO | YES | **KEEP (niche)** — CLI-only, no Git CI |
| 7 | Neocities (free) | 1 site / account | 200 GB/mo | n/a (manual upload / API) | NO (Supporter $5/mo required) | Yes on `*.neocities.org` only | NO | NO | NO | TOS forbids commerce on free | **DROP** — 1 site, no custom domain free |
| 8 | Bunny.net | PAYG, no free static tier | $5 promo credit on signup | n/a | Yes (paid) | Yes | NO | YES for sustained use | NO | YES | **DROP as free** — KEEP as cheap paid CDN |
| 9 | Fleek (IPFS) | Free tier present | $5/mo included credit (PAYG above) | Included in credit | Yes | Yes | Likely NO | NO (within $5) | NO | YES | **EVALUATE** — IPFS niche, $5 credit ceiling |

## Why CF Pages is the family primary

- **Unlimited bandwidth** — every other provider in this table has a per-month cap. For a 50+ site fleet, Pages is the only one where one viral post doesn't cost money.
- **No card at signup** — the only requirement is a Cloudflare account (email + password).
- **Custom domains + HTTPS free** — 100 domains per project, automatic Let's Encrypt.
- **Soft 100-project cap is raisable** — once we cross it (we're at ~30 currently), one support ticket lifts it.
- **Build cap is the real ceiling** — 500 builds/mo across the account. With 30+ active sites doing daily-ish deploys, we're already at ~60% utilization. Mitigation: only deploy on `main` branch push, skip dependency-only PRs.

## Why GitHub Pages is the mirror (not primary)

- **No build minute cap that bites at our scale** — Pages builds via GitHub Actions and the actions quota is 2,000 min/mo on the free tier, which we share with CI.
- **Soft 100 GB/mo bandwidth + 100 GB repo soft cap** — fine for mirror duty, would not survive primary traffic.
- **No commerce backend** — TOS says no e-commerce backends on Pages. Static product pages with a Stripe/Razorpay link are fine; running checkout flows is not.

## Quirks per provider

- **Cloudflare Pages soft 100-project cap.** Already raised on request for several customers in 2025. Open a ticket via dash → Support.
- **GitHub Pages "soft" limits.** 100 GB/mo bandwidth + 10 builds/hour are documented but not hard-enforced; GitHub will email-warn before throttling.
- **Netlify Sept 2025 credit model.** Old plan had 100 GB bandwidth + 300 build min; new plan has a single credit pool with hard caps and zero overage charges. Predictable but unpredictably distributed across a fleet.
- **Vercel Hobby's commercial ban** is enforced as of 2025+ — includes AdSense, donation links, affiliate-as-primary-purpose. Personal portfolios still fine.
- **Render's 2026-04-23 cut.** Static-site bandwidth went from 100 GB to 5 GB and total services capped at 25. Effectively unusable for fan-out.
- **Surge.sh** has no Git CI integration — pure CLI deploy (`surge ./dist mysite.surge.sh`). Useful as a one-off mirror when CF + GH are both down.
- **Neocities free tier** forbids commerce in its TOS. Supporter ($5/mo) lifts custom-domain restriction; we don't do recurring fees.
- **Bunny.net** is genuinely cheap (~$0.005/GB) but it's PAYG, not free. Promo $5 credit on signup; no minimum deposit. If we ever need a "second CDN for failover" beyond CF + GH, Bunny is the answer.
- **Fleek $5/mo credit** caps usage. Real value is IPFS pinning for web3 / archive use cases; not a fit for plain HTML sites.

## Recommendation for the family

1. **Primary host (every site + app):** Cloudflare Pages.
2. **Mirror (every site):** GitHub Pages, identical content from the same git push.
3. **Backup-of-mirrors (emergency only):** Surge.sh CLI deploy from CI runner if both CF + GH fail.
4. **Niche:** Fleek for any IPFS-anchored archive site if we ever need one.

## Sources

- [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/) — projects, build cap, custom domain count
- [Cloudflare Pages pricing](https://pages.cloudflare.com/) — unlimited bandwidth claim
- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) — 100 GB/mo soft, 1 GB repo, 10 builds/hr
- [Netlify pricing](https://www.netlify.com/pricing/) + [credit-based plans docs](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/) — Sep 2025 model
- [Vercel Hobby](https://vercel.com/docs/plans/hobby) + [Fair use](https://vercel.com/docs/limits/fair-use-guidelines) — commercial-use prohibition
- [Render new workspace plans](https://render.com/docs/new-workspace-plans) — Apr 2026 cut to 5 GB
- [Surge.sh pricing](https://surge.sh/pricing) + [custom domains](https://surge.sh/help/adding-a-custom-domain)
- [Neocities limits](https://en.wikipedia.org/wiki/Neocities) — 200 GB/mo, 1 site
- [Bunny.net pricing](https://bunny.net/pricing/) — PAYG model
- [Fleek pricing](https://shallow-market-straight.on-fleek.app/pricing) — $5 credit
