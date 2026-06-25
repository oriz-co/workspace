---
type: decision
title: "Tools shape + priority \u2014 16 single-purpose subdomains, locked ship order"
description: 16 tool apps, each at its own *.oriz.in subdomain (paisa, slice, scribe,
  pixie, grid, forge, shift, dice, cipher, paper, vitals, rank, reel, echo, pivot
  + remainder). Anonymous-first auth. Free + opt-in sponsor footer. Affiliate allowed
  only where ethically clean (Amazon book links on scribe-text; NOT on health tools).
  Locked ship priority for Wave 2.
tags:
- decision
- tools
- subdomains
- ship-order
- sixteen-tools
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/general/ship-order-2026q3
- decisions/architecture/stack/tools-site-15-repos
- decisions/architecture/stack/tool-categories-roadmap
- decisions/policy/monetisation-channel-matrix
---



# Tools shape + priority

## Shape — 16 subdomains, one per tool

| # | Subdomain | Tool category |
|---|---|---|
| 1 | `paisa.oriz.in` | Finance — calculators, EMI, SIP, tax |
| 2 | `slice.oriz.in` | PDF — merge, split, compress, OCR |
| 3 | `scribe.oriz.in` | Text — word count, case, diff, format |
| 4 | `pixie.oriz.in` | Image — resize, compress, format-convert, bg-info |
| 5 | `grid.oriz.in` | QR — generator, decoder, batch |
| 6 | `forge.oriz.in` | Dev — JSON/YAML/JWT/UUID/hash tools |
| 7 | `shift.oriz.in` | Convert — units, currency, timezone, base |
| 8 | `dice.oriz.in` | Random — strings, numbers, names, picker |
| 9 | `cipher.oriz.in` | Crypto — encode/decode/hash (NOT cryptocurrency) |
| 10 | `paper.oriz.in` | Print — paper sizes, page templates, label sheets |
| 11 | `vitals.oriz.in` | Health — BMI, BMR, calorie, vitals tracker |
| 12 | `rank.oriz.in` | SEO — meta inspector, sitemap audit, schema validator |
| 13 | `reel.oriz.in` | Video — trim, format-info, thumbnail-grab |
| 14 | `echo.oriz.in` | Audio — convert, trim, waveform |
| 15 | `pivot.oriz.in` | Data — CSV viewer, JSON-to-CSV, pivot table |
| 16+ | … | Whatever else exists after the locked 15 |

## Ship order (Wave 2 — after the flagship four)

Exactly the order above: paisa → slice → scribe → pixie → grid → forge → shift → dice → cipher → paper → vitals → rank → reel → echo → pivot → remainder.

Wave 2 starts after Wave 1 (home + janaushdhi + ncert + blog) per [[decisions/architecture/ship-order-2026q3]].

## Per-tool monetisation

| Tool category | Affiliate | Notes |
|---|---|---|
| paisa-finance | YES (disclosed) | Bank / card affiliate networks |
| scribe-text | YES (Amazon book affiliate OK) | Writing-focused; books are on-topic |
| vitals-health | **NO** | Public-health ethics — same posture as janaushdhi-app |
| All others | YES (case-by-case, disclosed) | Tools default per [[decisions/policy/monetisation-channel-matrix]] |

All 16: anonymous-first auth, free, opt-in sponsor footer.

## Why 16 separate subdomains

- Portfolio-of-products framing (one slug = one brand surface)
- Each tool ranks independently on its subdomain
- Maintenance cost is mitigated by shared chrome + shared `@chirag127/astro-tools` package (see [[decisions/architecture/the-23-packages]] or current package set)

## Cross-refs

- Q3 priority → [[decisions/architecture/ship-order-2026q3]]
- Original tools split (15-repos) → [[decisions/architecture/tools-site-15-repos]]
- Tool category roadmap (Tier 1/2/3) → [[decisions/architecture/tool-categories-roadmap]]
- Monetisation matrix → [[decisions/policy/monetisation-channel-matrix]]
