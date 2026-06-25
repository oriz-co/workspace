---
type: decision
title: "ncert-app scope \u2014 merge per-chapter NCERT PDFs into one-per-book, all\
  \ classes, EN + HI"
description: "ncert.oriz.in catalogs every NCERT textbook (Pre-Primary + classes 1-12),\
  \ all subjects, English + Hindi. Daily GH Action URL-merges per-chapter PDFs from\
  \ ncert.nic.in into one PDF per book using qpdf/pdftk, publishes as GH Release artefacts\
  \ (NOT CF Pages \u2014 25MB limit). Catalog UI shows class/subject grid \u2192 download\
  \ links."
tags:
- decision
- app
- ncert
- pdf
- education
- india
- gh-releases
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- decisions/architecture/general/ship-order-2026q3
- decisions/architecture/database/object-storage-split
- rules/infrastructure/cloudflare-pages-only
---



# ncert-app scope

## What it does

Catalogs every NCERT-published textbook, automates the "I just want the whole book as one PDF" workflow.

NCERT publishes per-chapter PDFs on `ncert.nic.in`. Students perpetually want one-PDF-per-book. This app produces and hosts that artefact.

## Pipeline

1. GH Action (daily 04:00 IST) walks the NCERT URL tree.
2. Downloads every chapter PDF per `{class, subject, language}` triple.
3. Merges via `qpdf --empty --pages a.pdf b.pdf c.pdf -- merged.pdf` (or `pdftk` fallback).
4. Names output `{class}-{subject}-{en|hi}.pdf` — e.g. `class-9-science-en.pdf`, `class-11-physics-hi.pdf`.
5. Publishes as **GitHub Release artefacts** under tag `ncert-YYYY-MM-DD`. NOT CF Pages — CF Pages has a 25 MB per-file limit; merged textbooks routinely exceed.

## Scope

- **Classes:** Pre-Primary + 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 + 11 + 12 (every class NCERT publishes).
- **Languages:** English + Hindi (every NCERT-published language pair).
- **Subjects:** every NCERT-published subject per class (Math, Science, Social Science, English, Hindi, Sanskrit, Urdu, Physics, Chemistry, Biology, Accountancy, Business Studies, Economics, History, Geography, Political Science, Sociology, Psychology, Philosophy, etc.).

## Catalog UI at `ncert.oriz.in`

- Class/subject grid (rows: classes, columns: subjects).
- Each cell links to the GH Release download URL for that `{class, subject, lang}` PDF.
- Language toggle (EN/HI) at top.
- Search box across class+subject.
- "Last updated" timestamp per row from the GH Release.

## Why GH Releases not CF Pages

CF Pages = 25 MB per asset. Merged Class 11 Physics in Hindi alone = ~80 MB. GH Releases = 2 GB per asset, unlimited download bandwidth, free for public repos. Compliant with [[rules/cloudflare-pages-only]] for the CATALOG (which IS on CF Pages); the storage for large binaries follows the existing rule in [[decisions/architecture/object-storage-split]].

## Monetisation

Free + sponsor footer per family default. No ads on an education resource serving students.

## Cross-refs

- GH Releases for large binaries → [[decisions/architecture/object-storage-split]]
- Q3 priority → [[decisions/architecture/ship-order-2026q3]]
