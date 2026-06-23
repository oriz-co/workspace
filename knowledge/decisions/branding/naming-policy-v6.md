---
type: decision
title: "Naming policy v6 — family brand + product brand + category + suffix"
description: "Repos follow oriz-<product-brand>-<category>-<suffix> format. Family brand is single, family-wide (`oriz`), Google-style. Product brand inserted per product. Existing astro-*-npm-pkg packages keep current names. Workspace umbrella keeps bare name as apex exception. Forks always exempt."
tags: [naming, repo, suffix, family, branding, v6, oriz, single-brand]
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
supersedes: [decisions/branding/naming-policy-v5]
related: [decisions/architecture/multi-target-build, decisions/architecture/per-runtime-framework]
---

# Naming policy v6

## Decision

Repo slugs follow:

```
<family-brand>-<product-brand>-<category>-<suffix>
```

- **family brand** = `oriz` (always on family repos)
- **product brand** = a unique short word per product (e.g. `paisa` for finance, `slice` for PDF, `pixie` for image)
- **category** = the function (e.g. `finance-tools`, `pdf-tools`)
- **suffix** = the runtime/role (`-app`, `-game`, `-api`, etc.)

Examples:

| Slug | Reads as |
|---|---|
| `oriz-paisa-finance-tools-app` | Oriz Paisa, finance tools, app |
| `oriz-slice-pdf-tools-app` | Oriz Slice, PDF tools, app |
| `oriz-pixie-image-tools-app` | Oriz Pixie, image tools, app |

Google-style branding: the family brand carries recognition; the product brand provides per-product identity (cf. "Google Maps", "Google Pixel", "Google Workspace").

### Special cases (category IS the brand)

Where the category word already IS the brand, format collapses to `oriz-<category>-<suffix>` (no separate product brand):

| Slug | Reason |
|---|---|
| `oriz-app` (apex) | apex hub, brand IS oriz |
| `oriz-ncert-app` | ncert IS the SEO target |
| `oriz-janaushdhi-app` | janaushdhi IS the brand |

### Games where game-name IS the brand

`oriz-<game-name>-game` (no separate product brand). Game name carries identity.

| Slug | Reasoning |
|---|---|
| `oriz-2048-game` | "2048" IS the searchable name |
| `oriz-tic-tac-toe-game` | "tic-tac-toe" IS the searchable name |
| `oriz-sudoku-game` | "sudoku" IS the searchable name |
| `oriz-snake-game` | "snake" IS the searchable name |
| `oriz-counting-1-10-kids-game` | "counting 1 to 10" IS the search target for parents |
| `oriz-memory-match-kids-game` | "memory match" IS the search target |

## Suffix matrix

Suffixes name the runtime/role of the repo:

`-app`, `-game`, `-kids-game`, `-api`, `-npm-pkg`, `-py-pkg`, `-rs-crate`, `-go-mod`, `-npm-cli`, `-py-cli`, `-rs-cli`, `-browser-ext`, `-vsc-ext`, `-mcp-server`, `-worker`, `-fn`, `-data`, `-skill`, `-rules`, `-dotfiles`, `-gh-action`.

## Live repo slugs

### App repos

| Slug | Local path |
|---|---|
| `oriz-cs-me-app` | `projects/oriz/own/prod/apps/personal/oriz-cs-me-app` |
| `oriz-pages-blog-app` | `projects/oriz/own/prod/apps/content/oriz-pages-blog-app` |
| `oriz-roam-journal-app` | `projects/oriz/own/prod/apps/content/oriz-roam-journal-app` |
| `oriz-lore-app` | `projects/oriz/own/prod/apps/content/oriz-lore-app` |
| `oriz-financial-cards-app` | `projects/oriz/own/prod/apps/content/oriz-financial-cards-app` |
| `oriz-omni-post-app` | `projects/oriz/own/prod/apps/content/oriz-omni-post-app` |
| `oriz-ncert-app` | `projects/oriz/own/prod/apps/content/oriz-ncert-app` |
| `oriz-janaushdhi-app` | `projects/oriz/own/prod/apps/content/oriz-janaushdhi-app` |
| `oriz-portfolio-engine-app` | (apps) |
| `home-app` | `projects/oriz/own/prod/apps/hub/home-app` |

### Tool-app repos

| Slug | Local path |
|---|---|
| `oriz-slice-pdf-tools-app` | `projects/oriz/own/prod/apps/tools/oriz-slice-pdf-tools-app` |
| `oriz-pixie-image-tools-app` | `projects/oriz/own/prod/apps/tools/oriz-pixie-image-tools-app` |
| `oriz-paisa-finance-tools-app` | `projects/oriz/own/prod/apps/tools/oriz-paisa-finance-tools-app` |
| `oriz-forge-dev-tools-app` | `projects/oriz/own/prod/apps/tools/oriz-forge-dev-tools-app` |
| `oriz-scribe-text-tools-app` | `projects/oriz/own/prod/apps/tools/oriz-scribe-text-tools-app` |
| `oriz-shift-convert-tools-app` | `projects/oriz/own/prod/apps/tools/oriz-shift-convert-tools-app` |
| `oriz-grid-qr-tools-app` | `projects/oriz/own/prod/apps/tools/oriz-grid-qr-tools-app` |
| `oriz-pivot-data-tools-app` | `projects/oriz/own/prod/apps/tools/oriz-pivot-data-tools-app` |
| `oriz-echo-audio-tools-app` | `projects/oriz/own/prod/apps/tools/oriz-echo-audio-tools-app` |
| `oriz-reel-video-tools-app` | `projects/oriz/own/prod/apps/tools/oriz-reel-video-tools-app` |
| `oriz-rank-seo-tools-app` | `projects/oriz/own/prod/apps/tools/oriz-rank-seo-tools-app` |
| `oriz-cipher-crypto-tools-app` | `projects/oriz/own/prod/apps/tools/oriz-cipher-crypto-tools-app` |
| `oriz-vitals-health-tools-app` | `projects/oriz/own/prod/apps/tools/oriz-vitals-health-tools-app` |
| `oriz-dice-random-tools-app` | `projects/oriz/own/prod/apps/tools/oriz-dice-random-tools-app` |
| `oriz-paper-print-tools-app` | `projects/oriz/own/prod/apps/tools/oriz-paper-print-tools-app` |

### API repos

| Slug | Local path |
|---|---|
| `oriz-mmi-tickertape-mmi-api` | `projects/oriz/own/svc/api/oriz-mmi-tickertape-mmi-api` |
| `oriz-flow-fii-dii-activity-api` | `projects/oriz/own/svc/api/oriz-flow-fii-dii-activity-api` |

## Why single family brand

- **Google-style branding wins recognition.** A user who knows "Oriz" recognises every Oriz product on sight.
- **Cross-product link-building** is stronger with one family brand. `oriz.in` linking to every `oriz-*-app` repo accumulates domain authority faster.
- **Recruiter scanning** still works — the suffix tells the type, the category tells the function, the `oriz-` prefix tells the family.
- **No brand-naming bikeshedding per new repo.** New tool ships? `oriz-<product-brand>-<category>-<suffix>`. Quick decisions.

## Exceptions

Three classes of repos escape the `oriz-` prefix:

### 1. Apex umbrella keeps bare name

`chirag127/workspace` stays as `workspace` (no `oriz-` prefix, no suffix). It's the meta umbrella holding everything; adding a brand prefix would be circular.

### 2. Existing astro-*-npm-pkg packages keep current names

The 8 shipped Astro packages keep their `astro-<role>-npm-pkg` form:

| Repo |
|---|
| `astro-shell-npm-pkg` |
| `astro-chrome-npm-pkg` |
| `astro-tools-npm-pkg` |
| `astro-config-npm-pkg` |
| `astro-icons-npm-pkg` |
| `astro-ai-npm-pkg` |
| `astro-forms-npm-pkg` |
| `astro-data-npm-pkg` |

Rationale: `astro-` is a meaningful brand prefix on its own (Astro framework family). New npm packages going forward DO get the `oriz-` prefix unless they are specifically Astro framework adapters; those keep the `astro-` prefix to read as part of the Astro ecosystem.

### 3. Forks always keep upstream slug

Forks of upstream repos keep their original GitHub name. No `-fork` suffix. No `oriz-` prefix.

## Per-category nuance

The category portion behaves differently per repo type:

### Tool apps — keep category in slug for SEO

Tool apps benefit from the category word being searchable. Google ranks `oriz-pdf-tools` for "pdf tools" the way it ranks "Google Images" for "images." Pattern: `oriz-<product-brand>-<category>-<suffix>`.

| Example | SEO target |
|---|---|
| `oriz-slice-pdf-tools-app` | "pdf tools" |
| `oriz-pixie-image-tools-app` | "image tools" |
| `oriz-paisa-finance-tools-app` | "finance tools / calculators" |
| `oriz-forge-dev-tools-app` | "developer tools" |

### Games — game-name + suffix (no category word)

Games don't benefit from a generic category word — the GAME NAME itself is what users search for. Pattern: `oriz-<game-name>-game`.

### Content apps — product-brand + function + suffix

Content apps where the function name carries the brand:

| Example | Reasoning |
|---|---|
| `oriz-pages-blog-app` | "blog" IS the function |
| `oriz-roam-journal-app` | "journal" IS the function |
| `oriz-cs-me-app` | "me" IS the role (personal portfolio) |
| `oriz-lore-app` | "lore" is the product brand for book summaries |
| `oriz-financial-cards-app` | "financial-cards" IS the function (India financial cards: credit/debit/prepaid/travel/corporate) |
| `oriz-omni-post-app` | "post" IS the function (cross-poster) |

### Decision tree for new repos

```
Is the repo a tool app where users search for "X tools"?
  YES → oriz-<product-brand>-<category>-tools-app
  NO  → Is it a game (named entity is the product)?
        YES → oriz-<game-name>-game (or -kids-game)
        NO  → oriz-<product-brand>-<role-or-function>-<suffix>
```

### API + website combo repos

Some repos ship BOTH a server-side API (Cloudflare Worker / Function /
scheduled job) AND a public-facing website (examples: `tickertape-mmi`,
`fii-dii-tracker` — both scrape Indian financial data, expose a REST
endpoint, AND host a small dashboard site showing the same data).

Pattern: **primary = the artifact that drives revenue / users.**

- If the API is what gets consumed (other services call it): primary is `-worker`.
- If the dashboard is what users see (humans visit it): primary is `-app`.
- Both shipped from one repo.

Final pattern for API+site combos:
- **One artifact only**: pick the dominant role's suffix.
- **Dataset shipped to oriz-*-data repo** if the data is also reused elsewhere (separate repo).

## Vendor-convention exceptions

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
- `envpact-action` → `envpact-gh-action`

## Cross-refs

- [naming-policy-v5](./naming-policy-v5.md) — predecessor (status: superseded by v6)
- [multi-target-build](../architecture/multi-target-build.md) — release cadence, deploy gating, sentry, sitemap, dashboard locks
- [per-runtime-framework](../architecture/per-runtime-framework.md) — framework matrix per runtime
- [keep-knowledge-fresh](../../rules/keep-knowledge-fresh.md) — meta-rule
