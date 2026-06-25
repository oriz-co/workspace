---
type: decision
title: Tools shipped as 15 separate repos, one per subdomain
description: Each tool category is its own GitHub repo (pdf-site, image-site, ...)
  deployed to its own Cloudflare Pages project at <category>.oriz.in. No tools-site
  monorepo. Picked over 'one repo, 15 subdomain builds' for portfolio framing and
  SEO concentration.
tags:
- architecture
- tools
- repos
- seo
timestamp: 2026-06-20
---



# Tools shipped as 15 separate repos, one per subdomain

## The decision

Every tool category gets its own dedicated GitHub repo and its own Cloudflare Pages project at its own subdomain. **No tools-site monorepo.**

The 15 repos:

| Repo | Subdomain | Modality | Tier |
|---|---|---|---|
| `pdf-site` | `pdf.oriz.in` | files | 1 |
| `image-site` | `image.oriz.in` | files | 1 |
| `audio-site` | `audio.oriz.in` | files | 2 |
| `video-site` | `video.oriz.in` | files | 2 |
| `data-site` | `data.oriz.in` | files | 1 |
| `text-site` | `text.oriz.in` | text | 1 |
| `dev-site` | `dev.oriz.in` | text | 1 |
| `seo-site` | `seo.oriz.in` | text | 2 |
| `crypto-site` | `crypto.oriz.in` | text | 2 |
| `finance-site` | `finance.oriz.in` | numbers | 1 |
| `convert-site` | `convert.oriz.in` | numbers | 1 |
| `health-site` | `health.oriz.in` | numbers | 2 |
| `qr-site` | `qr.oriz.in` | generators | 1 |
| `random-site` | `random.oriz.in` | generators | 2 |
| `print-site` | `print.oriz.in` | generators | 2 |

## Day-1 scope

**All 15 repos created on day 1, all 15 with stub homepages, all 15 Cloudflare Pages projects spun up.** Tier 1 (the 8 marked above) ships with working tools; Tier 2 (the 7) ships with a "coming soon" landing page that lists planned tools and links back to the family.

This maximises early SEO claim — Google starts indexing all 15 subdomains immediately, so when Tier 2 tools ship they land on already-aged domains.

## Why 15 repos, not a monorepo

The recommended option was a `tools-site` monorepo with subdomain-split CI builds (one repo, 15 subdomain deploys). User overrode for **15 separate repos** despite higher maintenance cost. Reasons that survived the override:

- **Portfolio-of-products framing** — each polished domain reads as a shipped product to recruiters; a 15-app monorepo reads as one project with feature creep.
- **Independent rollback per tool** — a bad deploy at `pdf.oriz.in` can't take down `qr.oriz.in`.
- **Independent commercialisation** — sell, sunset, or move any subdomain without touching the others.
- **Maximum SEO concentration** — each repo's README, Pages info site, and stars accrue topical authority independently.
- **Matches the existing per-site repo pattern** — `oriz-blog`, `oriz-me`, etc. are all separate repos already; tools follow the same shape.

The cost (15× CI configs, 15× dependabot updates, 15× version bumps for shared packages) is mitigated by the 14-package shared library plan ([packages-14-atomic.md](../packages-14-atomic.md)) — only configs vary, not code.

## What "shared chrome" means

Every tool repo imports `@chirag127/header`, `@chirag127/footer`, `@chirag127/sidebar`, `@chirag127/multi-search`, `@chirag127/seo`, `@chirag127/theme`, `@chirag127/config`, `@chirag127/family`. Visiting `pdf.oriz.in` then `image.oriz.in` should feel like clicking between sections of one product.

The only per-repo state is: the tool list (routes), the OG image, and category-specific meta tags. Everything else is consumed from the shared packages.

## Sidebar tier

Tools sites use **Tier A: auto-generated** — the sidebar lists all tools in the current site, plus an "Other Oriz tools" section linking to the other 14 subdomains. See [sidebar-4-tier.md](../frontend/sidebar-4-tier.md).

## Migration of existing 4 tool sites

`oriz-finance`, `oriz-image-tools`, `oriz-pdf-tools`, `oriz-urls-to-md` all already exist as standalone repos. Migration:

1. `gh repo rename oriz-finance finance-site` (preserves issues, stars, forks, history, gh-pages).
2. Update `.gitmodules` in `oriz/` umbrella to point at the new name.
3. Move into the new shared-chrome shape (import `@chirag127/header` etc.).
4. `oriz-urls-to-md` content lives at `dev.oriz.in/url-to-md` (it's a dev utility, not its own subdomain). The old repo gets renamed to `dev-site` and the URL→MD tool becomes one of dev-site's many tools.

See [oriz-restructure-2026-06-20.md](../../../runbooks/oriz-restructure-2026-06-20.md) for the step-by-step rename runbook. (The historical `site-rename-matrix.md` was deleted 2026-06-21 — its mapping is fully superseded by the fourth-pass slugs in [`branding/repo-naming-suffixes.md`](../../branding/repo-naming-suffixes.md).)

## Why this is the right time

The existing 4 tool repos are still tiny (sub-1000 LOC each). Splitting later would mean teasing apart shared utility code from per-tool code; doing it now means each tool starts in its target shape.

## Related

- [tool-categories-roadmap.md](./tool-categories-roadmap.md) — Tier 1/2/3 + anti-list
- [packages-14-atomic.md](../packages-14-atomic.md) — the shared chrome packages
- [sidebar-4-tier.md](../frontend/sidebar-4-tier.md) — sidebar shape per site type
- [branding/repo-naming-suffixes.md](../../branding/repo-naming-suffixes.md) — fourth-pass slug taxonomy (replaces the deleted `site-rename-matrix.md`)
