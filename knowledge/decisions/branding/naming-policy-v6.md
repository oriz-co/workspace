---
type: decision
title: "Naming policy v6 — brand + category + suffix per repo, with family exceptions"
description: "Sixth-pass naming. Repos follow oriz-<category>-<suffix> format. Brand is single, family-wide (`oriz`), Google-style (Google Maps, Google Journal, Google Photos). Existing astro-*-npm-pkg packages keep their current names. Workspace umbrella keeps its bare name as apex exception. Forks always exempt."
tags: [naming, repo, suffix, family, branding, v6, oriz, single-brand]
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
supersedes: [decisions/branding/naming-policy-v5]
related: [decisions/architecture/multi-target-build, decisions/architecture/per-runtime-framework]
---

# Naming policy v6

## v6.2 amendment — product brand inserted between family brand and category (2026-06-21 late)

Format expanded from `<family-brand>-<category>-<suffix>` to:

```
<family-brand>-<product-brand>-<category>-<suffix>
```

- **family brand** = `oriz` (carried)
- **product brand** = a unique short word per product (e.g. `paisa` for finance, `slice` for PDF, `pixie` for image)
- **category** = the function (e.g. `finance-tools`, `pdf-tools`)
- **suffix** = the runtime/role (`-app`, `-game`, `-api`, etc.)

Examples:

| Old (v6.1) | New (v6.2) |
|---|---|
| `oriz-finance-tools-app` | `oriz-paisa-finance-tools-app` |
| `oriz-pdf-tools-app` | `oriz-<brand>-pdf-tools-app` |
| `oriz-image-tools-app` | `oriz-<brand>-image-tools-app` |
| `oriz-blog-app` | `oriz-<brand>-blog-app` |
| `oriz-2048-game` | `oriz-<brand>-2048-game` (or `oriz-2048-game` if "2048" IS the brand) |

The earlier "Google-style single brand" rationale from v6.1 was a simplification — Google ALSO has product brand layers ("Google Maps" not "Google Map App"; "Google Pixel"; "Google Workspace"). v6.2 restores the product-brand layer the family had partially attempted in pre-v6.1.

### Special cases

- **Where the category word IS already the brand** (e.g. `me`, `home`, `journal`, `blog` if no separate product brand) → format collapses to `oriz-<category>-<suffix>` (no product brand). This is v6.1's form, preserved for these.
- **Games where the game-name IS the brand** (e.g. `2048`, `tic-tac-toe`, `sudoku`) → `oriz-<game-name>-game` (no separate brand). Game name carries identity.
- **Tool apps** SHOULD have a product brand because "PDF tools" is a generic SEO target, but `paisa-finance-tools` is brandable + memorable.

### Existing renames to revise under v6.2

All 10 family `-app` repos renamed on 2026-06-21 late session with product brands:

| Previous (v6.1) | Locked v6.2 form |
|---|---|
| `oriz-me-app` | `oriz-cs-me-app` |
| `oriz-blog-app` | `oriz-pages-blog-app` |
| `oriz-journal-app` | `oriz-roam-journal-app` |
| `oriz-lore-app` | `oriz-lore-book-summaries-app` |
| `oriz-cards-app` | `oriz-tabs-cards-app` |
| `oriz-post-app` | `oriz-omni-post-app` |
| `oriz-pdf-tools-app` | `oriz-slice-pdf-tools-app` |
| `oriz-image-tools-app` | `oriz-pixie-image-tools-app` |
| `oriz-finance-tools-app` | `oriz-paisa-finance-tools-app` |
| `oriz-portfolio-engine-py-pkg` | `oriz-portfolio-engine-app` (suffix corrected — not py-pkg, it's an app with automation) |

Product brand picks locked for the 12 tool-app slugs still to be created:

| Category | v6.2 slug | Status |
|---|---|---|
| dev-tools | `oriz-forge-dev-tools-app` | CREATED 2026-06-21 |
| text-tools | `oriz-scribe-text-tools-app` | CREATED 2026-06-21 |
| convert-tools | `oriz-shift-convert-tools-app` | CREATED 2026-06-21 |
| qr-tools | `oriz-grid-qr-tools-app` | CREATED 2026-06-21 |
| data-tools | `oriz-pivot-data-tools-app` | CREATED 2026-06-21 |
| audio-tools | `oriz-echo-audio-tools-app` | CREATED 2026-06-21 |
| video-tools | `oriz-reel-video-tools-app` | CREATED 2026-06-21 |
| seo-tools | `oriz-rank-seo-tools-app` | CREATED 2026-06-21 |
| crypto-tools | `oriz-cipher-crypto-tools-app` | CREATED 2026-06-21 |
| health-tools | `oriz-vitals-health-tools-app` | CREATED 2026-06-21 |
| random-tools | `oriz-dice-random-tools-app` | CREATED 2026-06-21 |
| print-tools | `oriz-paper-print-tools-app` | CREATED 2026-06-21 |

All 12 new tool-app repos seeded with README + LICENSE + .gitignore via 12 parallel subagents. Registered as workspace submodules under `projects/apps/tools/`.

API repos (renames executed 2026-06-21 after cooling-off):

| Previous slug | v6.2 form (LIVE) |
|---|---|
| `oriz-mmi-tracker-api` | `oriz-mmi-tickertape-mmi-api` ✓ |
| `oriz-fii-dii-activity-api` | `oriz-flow-fii-dii-activity-api` ✓ |

Both registered as workspace submodules under new `projects/apis/` subdir.

Repos that stay WITHOUT a product brand (category IS the brand):

| Slug | Reason |
|---|---|
| `oriz-app` (apex) | apex hub, brand IS oriz |
| `oriz-ncert-app` | ncert IS the SEO target (renamed from `ncert-app` 2026-06-21 late) |
| `oriz-janaushdhi-app` | janaushdhi IS the brand (created fresh 2026-06-21 late; previous `janaushdhi-app` was a stub, deleted in earlier audit pass) |

---

## Decision (v6.1 base, retained)

Repo slugs are `oriz-<category>-<suffix>` where:
- **`oriz`** = single family-wide brand prefix on every repo. Google-style: Google Maps, Google Journal, Google Photos — same brand, different products.
- **category** = the function or domain (e.g. `pdf-tools`, `image-tools`, `chrome`, `forms`, `blog`, `journal`)
- **suffix** = the runtime / role / language category (per the v5 suffix matrix + v6 additions: `-app`, `-game`, `-kids-game`, `-api`, `-npm-pkg`, `-py-pkg`, `-rs-crate`, `-go-mod`, `-npm-cli`, `-py-cli`, `-rs-cli`, `-browser-ext`, `-vsc-ext`, `-mcp-server`, `-worker`, `-fn`, `-data`, `-skill`, `-rules`, `-dotfiles`, `-gh-action`)

Examples:
- `oriz-pdf-tools-app` (Oriz PDF Tools)
- `oriz-image-tools-app` (Oriz Image Tools)
- `oriz-blog-app` (Oriz Blog)
- `oriz-me-app` (Oriz Me)
- `oriz-journal-app` (Oriz Journal)
- `oriz-tic-tac-toe-game` (Oriz Tic-Tac-Toe)
- `oriz-counting-1-10-kids-game` (Oriz Counting 1-10)

This replaces both the v5 "no brand prefix" rule AND the earlier-this-session "unique brand per product" attempt. Single brand. Whole family.

## Why single brand instead of unique-per-product

The earlier draft of v6 proposed unique brand words per product (e.g. `slice-pdf-tools-app`, `pixie-image-tools-app`). Reverted same session because:

- **Google-style branding wins recognition.** A user who knows "Oriz" recognises every Oriz product on sight. Unique brands per product fragment recognition.
- **Cross-product link-building** is stronger with one brand. `oriz.in` linking to every `oriz-*-app` repo accumulates domain authority faster.
- **Recruiter scanning** still works — the suffix tells the type, the category tells the function, the `oriz-` prefix tells the family.
- **No brand-naming bikeshedding per new repo.** New tool ships? `oriz-<category>-<suffix>`. No 30-minute "what's the brand word" debate.

## Exceptions (locked 2026-06-21)

Three exceptions to `oriz-<category>-<suffix>`:

### 1. Apex umbrella keeps bare name

`chirag127/workspace` stays as `workspace` (no `oriz-` prefix, no suffix). It's the meta umbrella holding everything; adding a brand prefix would be circular.

### 2. Existing astro-*-npm-pkg packages keep current names

The 8 shipped Astro packages keep their `astro-<role>-npm-pkg` form:

| Repo | Status |
|---|---|
| `astro-shell-npm-pkg` | kept |
| `astro-chrome-npm-pkg` | kept |
| `astro-tools-npm-pkg` | kept |
| `astro-config-npm-pkg` | kept |
| `astro-icons-npm-pkg` | kept |
| `astro-ai-npm-pkg` | kept |
| `astro-forms-npm-pkg` | kept |
| `astro-data-npm-pkg` | kept |

Rationale: `astro-` is a meaningful brand prefix on its own (Astro framework family). New npm packages going forward DO get the `oriz-` prefix unless they are specifically Astro framework adapters; those keep the `astro-` prefix to read as part of the Astro ecosystem.

### 3. Forks always keep upstream slug

Forks of upstream repos keep their original GitHub name. No `-fork` suffix. No `oriz-` prefix. Per `naming-policy-v5.md` § Fork exception (carried forward).

## The audit

A 100-most-recently-pushed audit is in progress on `chirag127/*` (non-forks). Each repo gets a per-repo MCQ asking: keep current name / rename per v6 / private / archive / delete. Audit done serial, 10 repos per turn.

| Repo # | Slug | v6 Decision |
|---|---|---|
| 1 | workspace | KEEP (apex exception) |
| 2 | astro-chrome-npm-pkg | KEEP (astro-* family) |
| 3 | astro-forms-npm-pkg | KEEP (astro-* family) |
| 4 | astro-shell-npm-pkg | KEEP (astro-* family) |
| 5 | astro-ai-npm-pkg | KEEP (astro-* family) |
| 6 | astro-data-npm-pkg | KEEP (astro-* family) |
| 7 | astro-tools-npm-pkg | KEEP (astro-* family) |
| 8 | astro-config-npm-pkg | KEEP (astro-* family) |
| 9 | astro-icons-npm-pkg | KEEP (astro-* family) |
| 10 | me-app | RENAME → `oriz-me-app` |
| 11 | image-tools-app | RENAME → `oriz-image-tools-app` |
| 12 | finance-tools-app | RENAME → `oriz-finance-tools-app` |
| 13-100 | ... | (audit in progress) |

The earlier per-repo MCQ answers under the unique-brand-per-product draft (`cs-me-app`, `pixie-image-tools-app`, `paisa-finance-tools-app`) are SUPERSEDED. Final decisions under v6 single-brand are in the table above.

## Format details

- **`oriz`** is the only brand. No per-product brands.
- **Category**: kebab-case, names the function. May include compound words (`pdf-tools`, `image-tools`, `kids-game`).
- **Suffix**: from the locked role-suffix matrix in `naming-policy-v5.md` (carried forward).

## Per-category nuance (added 2026-06-21 mid-audit)

The category portion behaves differently per repo type:

### Tool apps — keep category in slug for SEO

Tool apps benefit from the category word being searchable. Google ranks `oriz-pdf-tools` for "pdf tools" the way it ranks "Google Images" for "images." Pattern: `oriz-<category>-<suffix>`.

| Example | Why |
|---|---|
| `oriz-pdf-tools-app` | SEO target: "pdf tools" |
| `oriz-image-tools-app` | SEO target: "image tools" |
| `oriz-finance-tools-app` | SEO target: "finance tools / calculators" |
| `oriz-dev-tools-app` | SEO target: "developer tools" |

### Games — brand + game-name + suffix (no category word)

Games don't benefit from a generic category word — the GAME NAME itself is what users search for. Pattern: `oriz-<game-name>-game`. No "category" between brand and game-name.

| Example | Reasoning |
|---|---|
| `oriz-tic-tac-toe-game` | "tic-tac-toe" IS the searchable name |
| `oriz-2048-game` | "2048" IS the searchable name |
| `oriz-sudoku-game` | "sudoku" IS the searchable name |
| `oriz-snake-game` | "snake" IS the searchable name |
| `oriz-counting-1-10-kids-game` | "counting 1 to 10" IS the search target for parents |
| `oriz-memory-match-kids-game` | "memory match" IS the search target |

### Non-tool apps — brand + app-name + suffix

Content apps (blog, journal, lore, etc.) where the app name carries the brand:

| Example | Reasoning |
|---|---|
| `oriz-blog-app` | The "blog" name IS the function |
| `oriz-journal-app` | "journal" IS the function |
| `oriz-me-app` | "me" IS the role (personal portfolio) |
| `oriz-lore-app` | "lore" IS the brand/role |
| `oriz-cards-app` | "cards" IS the function (India financial cards) |
| `oriz-ncert-app` | "ncert" IS the searchable keyword |
| `oriz-post-app` | "post" IS the function (cross-poster) |

### Decision tree for new repos

```
Is the repo a tool app where users search for "X tools"?
  YES → oriz-<category>-tools-app (keep "tools" in slug)
  NO  → Is it a game (named entity is the product)?
        YES → oriz-<game-name>-game (or -kids-game)
        NO  → oriz-<role-or-function>-<suffix>
```

### API + website combo repos (added 2026-06-21 mid-audit)

Some repos ship BOTH a server-side API (Cloudflare Worker / Function /
scheduled job) AND a public-facing website. Examples discovered in the
audit: `tickertape-mmi`, `fii-dii-tracker` — both scrape Indian
financial data, expose a REST endpoint, AND host a small dashboard
site showing the same data.

These repos take **dual suffixes** via a slash separator:
`oriz-<name>-worker/-site` reads as "Worker + Site combo." But this
breaks the one-suffix rule. Cleaner option: pick the PRIMARY artifact
suffix and document the secondary in the description.

Pattern adopted: **primary = the artifact that drives revenue / users.**
For a scraper-with-dashboard:
- If the API is what gets consumed (other services call it): primary is `-worker`.
- If the dashboard is what users see (humans visit it): primary is `-app`.
- Both shipped from one repo.

Examples (locked 2026-06-21 audit):
- `oriz-mmi-tracker-py-cli` — primary CLI; produces JSON dataset; dashboard separate
- `oriz-fii-dii-tracker-worker` — primary Worker (scraper); /dashboard route is the site

Final pattern for API+site combos:
- **One artifact only**: pick the dominant role's suffix.
- **Dataset shipped to oriz-*-data repo** if the data is also reused elsewhere (separate repo).

## Vendor-convention exceptions (carried)

Some repo names match a vendor or community convention better than `oriz-*` would. These keep their bare slugs:

| Repo | Convention |
|---|---|
| `workspace` | Apex umbrella |
| `agents-md` | The well-known AGENTS.md filename convention |
| `setup` | Personal dotfiles + install scripts |
| `envpact*` (7 repos) | Separate brand (envpact is its own product line) |
| `astro-*-npm-pkg` (8 repos) | Astro framework family |

For envpact specifically, the 7 repos keep their `envpact-*` prefix but add the v5 role suffix to each:
- `envpact` (umbrella) → keep
- `envpact-cli` → `envpact-npm-cli`
- `envpact-registry-publisher` → `envpact-registry-publisher-npm-cli`
- `envpact-python` → `envpact-py-pkg`
- `envpact-dashboard` → `envpact-dashboard-app`
- `envpact-vscode` → `envpact-vscode-vsc-ext`
- `envpact-action` → `envpact-gh-action` (new suffix for GH Actions)

## What changed from v5

- v5: "no brand prefix in slug, the chirag127/ org is the prefix"
- v6: `oriz-` brand prefix REQUIRED on every repo (with the 3 exceptions above)

The v5 rationale (org slug carries the brand) holds for SHORT repo listings where readers see `chirag127/<slug>` together. But in `gh repo list`, search results, social shares, recruiter scanning, the slug appears alone. v6 adds visible family brand to each slug.

## Cross-refs

- [naming-policy-v5](./naming-policy-v5.md) — predecessor (status: superseded by v6)
- [multi-target-build](../architecture/multi-target-build.md) — release cadence, deploy gating, sentry, sitemap, dashboard locks
- [per-runtime-framework](../architecture/per-runtime-framework.md) — framework matrix per runtime
- [keep-knowledge-fresh](../../rules/keep-knowledge-fresh.md) — meta-rule that triggered writing this file before continuing the audit
