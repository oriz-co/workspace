---
type: index
title: Content
description: Index of concepts in decisions/architecture/content.
tags:
- index
- content
timestamp: '2026-06-24'
format_version: okf-v0.1
status: active
---

# Content

## Concepts

- [Blog cross-post strategy — daily post, omni-publish fan-out, GH Issues drafts (not Telegram)](./blog-cross-post-strategy.md) — pages-blog-app posts daily to blog.oriz.in. omni-publish v0.1.1+ fans out automatically to dev.to + Hashnode + Bluesky + Mastodon + Threads. Drafts for manual channels (X, Reddit, LinkedIn, Medium) queue to GitHub Issues in private chirag127/oriz-drafts repo — NOT Telegram (banned in India). Per-channel AI rewrite via NVIDIA NIM primary + OpenRouter fallback. Canonical URL = oriz.in on every channel for SEO.
- [Book publish pipeline — Markua .md → 5 channels via @chirag127/oriz-book-build + omni-publish](./book-publish-pipeline.md) — Books in the chirag127/oriz family are written as Markua-flavoured Markdown (Leanpub-compatible), built by the new @chirag127/oriz-book-build npm package (17th family package) which wraps Pandoc to emit EPUB3 + PDF + MOBI artefacts. omni-publish takes those artefacts and fans out to 5 channels: Leanpub (Markua git push, 80% royalty) + Draft2Digital aggregator (manual upload, documented) + Gumroad (API auto, 10%) + LemonSqueezy (API auto, 5%+50¢ MoR) + Amazon KDP (browser-uploader bot, no API). Plus Google Play Books Partner Center (manual upload, ISBN-recommended). 5 first books locked, all brand-first naming. Prose licensed CC-BY-NC-ND 4.0 + code samples MIT.
- [books.oriz.in shape — static catalog, Oriz Me drafts first, others outlines](./books-publishing-shape.md) — books.oriz.in is a static catalog showing cover + price + buy-links per book. First book to draft fully: Oriz Me (PWYW $9, personal essays, biographical). Other 4 (Oriz Stack, Oriz Paisa, Oriz PDF, Oriz Janaushdhi) get chapter outlines initially. Per-book channels per book-publish-pipeline. Substack is the newsletter platform; free chapter drops via Substack.
- [Three-format feed publishing — RSS 2.0 + Atom 1.0 + JSON Feed](./feeds-rss-atom-json.md) — Every content-bearing site publishes three feed formats: /rss.xml (RSS 2.0, source-of-truth for oriz-omnipost), /atom.xml (Atom 1.0), /feed.json (JSON Feed v1.1). oriz-kit ships <FeedDiscovery /> + generators.
- [First book: 'My Learnings from the Oriz Project family' — replaces Oriz Me as first draft](./first-book-oriz-learnings.md) — User changed first-book pick on 2026-06-22 from Oriz Me (PWYW personal) to 'My Learnings from the Oriz Project family' — a memoir + manual hybrid documenting building the oriz family. Quality bar: 'good books, not bad books'. Minimum publishing setup: KDP + Play Books Partner Center + Leanpub + Draft2Digital (all free signup, all royalty-on-sale, no card). ISBN free from KDP/D2D; not required for digital-only on Leanpub/Gumroad.
- [Journal photo pipeline — 4-host replicate-everywhere](./journal-photo-pipeline.md) — oriz-roam-journal-app uploads photos to four free hosts in parallel (Cloudinary + ImageKit + imgbb + GitHub Releases) with client-side WebP compression, sha256-dedup on GH Releases, and first-200-wins HEAD race on read. Replaces the legacy Firebase Storage single-host path.
- [journal-site — best features of all five journal apps](./journal-site-sources.md) — journal-site (journal.oriz.in) mines the best features of Day One, Bear, Notion, Obsidian, and Logseq into one journaling experience. Big scope chosen knowingly; flagship-grade polish target.
- [Newsletter split — Buttondown for technical, EmailOctopus for marketing](./newsletter-split-buttondown-emailoctopus.md) — Two newsletter senders side by side. Buttondown handles the technical / dev audience (Markdown + API). EmailOctopus handles general marketing (visual editor, larger free tier).
- [stats.oriz.in family-wide-stats dashboard + per-app feeds + Changesets + single oriz-app-template](./stats-feeds-versioning-template.md) — Single dashboard app `oriz-stats-app` at stats.oriz.in shows family-wide aggregate metrics (visits, npm downloads, GitHub stars, books sold, Sentry errors). RSS published from blog app only (not all 26 apps — too noisy). Package versioning via Changesets per-package; auto-bump on merge. Single `chirag127/oriz-app-template` repo used for every new app via `gh repo create --template`.
