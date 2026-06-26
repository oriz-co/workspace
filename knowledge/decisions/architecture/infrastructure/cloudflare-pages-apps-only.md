---
type: decision
title: "CF Pages = apps only"
description: "CF Pages projects are for the 25 apps under projects/apps/ ONLY. Everything else uses GitHub Pages."
tags: [hosting, cloudflare-pages, github-pages, superseded]
timestamp: 2026-06-23
format_version: okf-v0.1
status: superseded
superseded_by: hosting-split-cf-and-github-pages
---

CF Pages projects = projects/apps/ submodules only (hub/content/personal/tools). All other surface area — npm packages, APIs, books, extensions, skills, forks, data repos — lives on GitHub Pages instead. Non-app subdomains that want a "for more info" landing page link to oriz.in. Total 26 CF Pages projects (25 apps + www.oriz.in shares oriz-app). Refines [`cloudflare-pages-hosts-every-website-and-app`](./cloudflare-pages-hosts-every-website-and-app.md). Locked 2026-06-23.

**REFINED 2026-06-25** by [`hosting-split-cf-and-github-pages`](./hosting-split-cf-and-github-pages.md). CF Pages = apps/PWAs/websites; GitHub Pages = software landing pages. Both donation-OK.
