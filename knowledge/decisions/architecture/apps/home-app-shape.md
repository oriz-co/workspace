---
type: decision
title: "home-app shape \u2014 marketing landing, 5-section grid, not a dashboard"
description: oriz.in is the marketing landing page for the family. Single hero + 5-section
  grid linking to /apps, /tools, /books, /packages, /me. Minimal copy. Designed for
  first impression and discovery. NOT a logged-in dashboard, NOT a personal home,
  NOT a status overview.
tags:
- decision
- home-app
- landing
- marketing
- oriz-in
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/apps/cs-me-app-scope
- decisions/architecture/packages/packages-catalog-shape
- decisions/architecture/stack/tools-shape-and-priority
- decisions/architecture/packages/packages-oriz-in-catalog
---



# home-app shape

## The decision

`oriz.in` (the home-app at `repos/oriz/own/prod/apps/hub/home-app/`) is a **marketing landing page**: single hero + 5-section grid. Minimal copy. Optimised for first impression.

## The 5 sections (grid cards)

| Section | Links to | One-line purpose |
|---|---|---|
| `/apps` | apps overview | All 24+ apps, cards per app, store badges |
| `/tools` | tools overview | 16 single-purpose tool subdomains |
| `/books` | books.oriz.in | Static book catalog (5 books) |
| `/packages` | packages.oriz.in | npm package catalog (auto-discovered) |
| `/me` | me.oriz.in / cs.oriz.in | Personal canon — resume, writing, lifestream |

## What it is NOT

- NOT a dashboard. No logged-in stats, no charts, no "your activity".
- NOT a personal home. The personal site is `me.oriz.in` — see [[decisions/architecture/cs-me-app-scope]].
- NOT a status page. Status lives at `status.oriz.in` via Better Stack.
- NOT a search interface. Search is per-app via Pagefind.

## Why marketing-landing shape

First-time visitors arrive via "what is oriz?". They need 5 seconds to a portfolio overview, not a list of features. Brand-first framing matches abc.xyz / leerob.io / brianlovin.com.

## Cross-refs

- Personal site is a sibling, not folded into home → [[decisions/architecture/cs-me-app-scope]]
- Packages get their own subdomain → [[decisions/architecture/packages-oriz-in-catalog]]
