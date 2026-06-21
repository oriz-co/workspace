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

## Decision

Repo slugs are `oriz-<category>-<suffix>` where:
- **`oriz`** = single family-wide brand prefix on every repo. Google-style: Google Maps, Google Journal, Google Photos — same brand, different products.
- **category** = the function or domain (e.g. `pdf-tools`, `image-tools`, `chrome`, `forms`, `blog`, `journal`)
- **suffix** = the runtime / role / language category (per the v5 suffix matrix: `-app`, `-game`, `-kids-game`, `-npm-pkg`, `-py-pkg`, `-rs-crate`, `-go-mod`, `-npm-cli`, `-py-cli`, `-rs-cli`, `-browser-ext`, `-vsc-ext`, `-mcp-server`, `-worker`, `-fn`, `-data`, `-skill`, `-rules`)

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

## What changed from v5

- v5: "no brand prefix in slug, the chirag127/ org is the prefix"
- v6: `oriz-` brand prefix REQUIRED on every repo (with the 3 exceptions above)

The v5 rationale (org slug carries the brand) holds for SHORT repo listings where readers see `chirag127/<slug>` together. But in `gh repo list`, search results, social shares, recruiter scanning, the slug appears alone. v6 adds visible family brand to each slug.

## Cross-refs

- [naming-policy-v5](./naming-policy-v5.md) — predecessor (status: superseded by v6)
- [multi-target-build](../architecture/multi-target-build.md) — release cadence, deploy gating, sentry, sitemap, dashboard locks
- [per-runtime-framework](../architecture/per-runtime-framework.md) — framework matrix per runtime
- [keep-knowledge-fresh](../../rules/keep-knowledge-fresh.md) — meta-rule that triggered writing this file before continuing the audit
