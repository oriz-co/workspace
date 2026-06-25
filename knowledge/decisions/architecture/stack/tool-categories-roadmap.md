---
type: decision
title: "Tool categories roadmap \u2014 Tier 1 + Tier 2 + anti-list"
description: 'The locked list of 15 tool subdomains: 8 Tier 1 (ship working day 1)
  + 7 Tier 2 (stub day 1, fill in later). Tier 3 is explicitly skipped. Anti-list
  captures categories deliberately rejected (URL shorteners, AI image gen, etc.).'
tags:
- architecture
- tools
- roadmap
timestamp: 2026-06-20
---



# Tool categories roadmap — Tier 1 + Tier 2 + anti-list

## The decision

15 tool subdomains, grouped by input modality. Tier 1 ships with working tools day 1; Tier 2 ships as stubs day 1 and fills in over weeks. Tier 3 is **skipped entirely**.

## Tier 1 — ship working tools day 1 (8 subdomains)

Modality groups:

| Modality | Subdomains | Why Tier 1 |
|---|---|---|
| **Files** | `pdf-site` (pdf.oriz.in), `image-site` (image.oriz.in), `data-site` (data.oriz.in) | Highest search volume; PDF + image already have working tools to migrate. |
| **Text** | `text-site` (text.oriz.in), `dev-site` (dev.oriz.in) | Cheap to build, fast to ship, very recruiter-readable. |
| **Numbers** | `finance-site` (finance.oriz.in), `convert-site` (convert.oriz.in) | Finance has working tools to migrate. Convert is broad SEO surface. |
| **Generators** | `qr-site` (qr.oriz.in) | Tiny scope, ships in days, ranks fast. |

Per-site tool seeds:

- **pdf-site** — merge, split, compress, rotate, watermark, password, edit, sign, OCR, page extract, redact
- **image-site** — resize, compress, convert format, crop, rotate, filter, remove background, palette extract, EXIF strip
- **finance-site** — EMI, SIP, mutual fund returns, tax (India + US), retirement, mortgage, currency, crypto-converter, P/E, NPS
- **dev-site** — JSON↔YAML↔TOML↔CSV, base64, JWT decode, regex tester, URL encode, UUID gen, hash (SHA/MD5), color-palette, cron explainer, .env validator, **URL→Markdown** (migrated from `oriz-urls-to-md`)
- **text-site** — word count, case convert, lorem ipsum, slug, diff, sort lines, dedupe, find/replace, markdown→HTML, reading-time, readability score
- **convert-site** — unit converter (length/weight/temp), timezone, time-format, number-base, color-format, audio/video format (FFmpeg.wasm), file-size
- **qr-site** — generate (text/url/wifi/vcard/upi), decode, batch CSV→QR, custom logo/colors
- **data-site** — CSV viewer, CSV→JSON, JSON→CSV, sort, filter, pivot, dedupe, merge two CSVs, schema diff, fake-data generator

## Tier 2 — stubs day 1, fill in later (7 subdomains)

Day 1: each Tier 2 repo exists with stub `index.astro` listing planned tools as cards labelled "coming soon". Cloudflare Pages projects spun up so the subdomains start aging in Google's index.

| Subdomain | Category | Planned tools |
|---|---|---|
| `audio-site` (audio.oriz.in) | Audio | trim, merge, format convert, normalize loudness, silence trim, BPM detect, pitch shift — all FFmpeg.wasm |
| `video-site` (video.oriz.in) | Video | trim, compress, format convert, gif↔mp4, frame extract, audio strip, subtitle burn-in — FFmpeg.wasm |
| `seo-site` (seo.oriz.in) | SEO / web | meta-tag preview, sitemap generator, robots.txt validator, schema.org JSON-LD generator, keyword density, broken-link check |
| `crypto-site` (crypto.oriz.in) | Cryptography | encrypt/decrypt (AES/RSA), key-pair gen, sign/verify, password gen, password-strength, BIP39 mnemonic, HOTP/TOTP |
| `health-site` (health.oriz.in) | Health & fitness | BMI, BMR, calorie/macros, body-fat, water intake, HR zones, pace, ovulation, due-date — pure-JS, no PHI stored |
| `random-site` (random.oriz.in) | Random / picker | dice, coin, roulette, name picker, team divider, decision wheel |
| `print-site` (print.oriz.in) | Print-ready | label maker, name-tag, ID-card, business-card, planner-page, graph-paper, dot-grid |

Promotion rule: a Tier 2 site moves to "Tier 1 functional" when it has ≥6 working tools.

## Tier 3 — SKIPPED

The Tier 3 categories (legal, music, chess, paint, game, food, resume, invoice, social, ai, network, accessibility) are **explicitly rejected** for the day-1 plan. Reasons:

- Most are highly specialised — they only work if the operator personally uses them.
- Some have hidden costs (legal needs compliance tone; ai needs inference cost; network needs server-side; accessibility overlaps with the existing `a11y-three-tools` decision).
- Day-1 scope of 15 is already aggressive; adding more dilutes focus.

If any Tier 3 category is later promoted, it becomes a separate decision with its own concept file.

## Anti-list — explicitly DO NOT ship

These categories must not be added to the family even if requested casually later. Reasons documented per-row:

| Category | Why NOT |
|---|---|
| Background remover (free) | Fully commoditised by nano-banana, Adobe, 50 others. AI inference cost real. Differentiation = zero. |
| AI image generation | Inference cost violates no-paid-services rule. |
| Free VPN / proxy | Server cost, abuse vector, legal risk in some markets. |
| Disposable email | Server cost, abuse magnet, hosting providers will ban you. |
| URL shorteners (general purpose) | Abuse magnet, server cost, keyword saturated. The internal `s.oriz.in` from [cross-post-engine.md](../general/cross-post-engine.md) is internal-only — not a public shortener. |
| YouTube downloader | TOS violation, recruiter-negative, takedowns. |
| Torrent / piracy adjacent | Recruiter risk, legal risk. |
| Crypto airdrop trackers / shitcoin tools | Recruiter-negative in 2026; reputational drift. |

## Related

- [tools-site-15-repos.md](./tools-site-15-repos.md) — repo shape for these 15
- [branding/repo-naming-suffixes.md](../../branding/repo-naming-suffixes.md) — current slug taxonomy for the existing tool repos
- [a11y-three-tools.md](./a11y-three-tools.md) — covers the accessibility work elsewhere
