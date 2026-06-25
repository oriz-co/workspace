---
type: rule
title: "One-level subdomains only \u2014 never two levels deep below oriz.in"
description: "Locked 2026-06-22 evening. Family subdomains live AT MOST one level\
  \ deep below oriz.in. ALLOWED: blog.oriz.in / paisa.oriz.in / fii-dii-api.oriz.in.\
  \ FORBIDDEN: <name>.api.oriz.in (two levels), <name>.<group>.oriz.in. Reason: Cloudflare\
  \ Universal SSL free tier covers *.oriz.in only (one-level wildcard). Two-level\
  \ requires paid ACM ($10/mo) which violates no-card-on-file rule. Current violation:\
  \ 19 *.api.oriz.in subdomains \u2014 workaround: CF DNS-only (grey cloud), GH Pages\
  \ handles SSL at 2 levels via Let's Encrypt. NEW APIs must use `<name>-api.oriz.in`\
  \ one-level pattern."
tags:
- rule
- subdomain
- ssl
- dns
- one-level
- cloudflare
- free-tier
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- rules/interaction/no-card-on-file
- rules/interaction/never-hit-quotas
- decisions/architecture/compute/api-hosting-triple-rail
- runbooks/hosting/cf-dns-add-api-subdomain
---



# One-level subdomains only

## Rule

Family subdomains MUST be at most ONE level deep below `oriz.in`.

| Allowed | Forbidden |
|---|---|
| `blog.oriz.in` | `posts.blog.oriz.in` (2 levels) |
| `paisa.oriz.in` | `india.paisa.oriz.in` (2 levels) |
| `fii-dii-api.oriz.in` | `fii-dii.api.oriz.in` (2 levels) |
| `pdf.oriz.in` | `merge.pdf.oriz.in` (2 levels) |

## Why

**Cloudflare Universal SSL free tier covers `*.oriz.in` only — one-level wildcard.** Two-level wildcards (`*.api.oriz.in`) require paid Advanced Certificate Manager (~$10/mo). That violates `rules/no-card-on-file`.

Free workarounds for already-deployed 2-level subdomains:
- **GH Pages auto-SSL** at 2-level via Let's Encrypt (works; we use this for the 19 existing `*.api.oriz.in`)
- **DNS-only (grey cloud)** so CF doesn't intercept; the underlying host (GH Pages, CF Pages) provisions its own cert
- **Order free ACM per hostname** (limited; 1 cert / zone)

## Current violation

19 API subdomains live at `<name>.api.oriz.in` (two levels):
fii-dii, mmi, mf-nav, pincode, ifsc, holidays, currency, tickers, rbi-rates, gold-silver, irctc, aqi-india, aqi, fuel, exams, rti, judgments, budget, so-trending

**Resolution:** DNS-only (grey cloud) + GH Pages SSL handles the cert. No URL change required.

## New APIs follow the rule

When adding a new API:

- Repo slug: `chirag127/oriz-<service-name>-api`
- Subdomain: `<service-name>-api.oriz.in` (one level; e.g., `mf-nav-api.oriz.in`, `gold-silver-api.oriz.in`)
- CF DNS: CNAME proxied (orange cloud) → `chirag127.github.io`
- CF Universal SSL covers automatically

## Pattern for inevitable nesting needs

If a future feature really needs nesting (e.g. per-region):

- ❌ `india.paisa.oriz.in`
- ✅ `paisa-india.oriz.in`

Prefix instead of subdomain-nesting.

## Cross-refs

- No card on file → [[rules/no-card-on-file]]
- Never hit quotas → [[rules/never-hit-quotas]]
- API hosting triple-rail → [[decisions/architecture/api-hosting-triple-rail]]
- CF DNS runbook → [[runbooks/cf-dns-add-api-subdomain]]
