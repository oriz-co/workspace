---
type: decision
title: Hosting split — Cloudflare Pages for apps, GitHub Pages for software landing
description: Locked 2026-06-25. Apps, PWAs, and end-user websites deploy to Cloudflare Pages on custom subdomains. Software-package landing pages (npm, CLI, extension, MCP-server homes) deploy to GitHub Pages. Both targets are compatible with the donations-only monetisation posture under each provider's ToS.
tags:
- decision
- hosting
- cloudflare-pages
- github-pages
- infrastructure
- deploy
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
related:
- decisions/architecture/ops/multi-target-build
- decisions/architecture/monetisation/donations-only-2026-06-25
- decisions/architecture/infrastructure/workspace-flat-repos-2026-06-25
- decisions/architecture/branding/subdomain-path-based-on-category-2026-06-25
supersedes: decisions/architecture/ops/multi-target-build
---

# Hosting split — CF Pages for apps, GH Pages for software landing

## Decision

Two hosting targets, partitioned by repo type. **Cloudflare Pages** hosts every app, PWA, and end-user website (anything with a `<category>.oriz.in` or `<app>.oriz.in` subdomain). **GitHub Pages** hosts the landing page for every software artifact (npm package, CLI, browser extension, IDE extension, MCP server). Both are donation-compatible under their respective ToS now that the family is donations-only.

## Why

- **GH Pages ToS** allows project landing pages and personal sites but explicitly forbids commercial checkout flows. Donations are not commerce in the ToS sense, so software landing pages can stay on GH Pages.
- **CF Pages** carries no such restriction and offers per-project preview deploys, wildcard subdomains, and Pages Functions for any future server-side need.
- **Build minutes** — CF Pages free tier is 500 builds/month *per project*; GH Pages builds on GH Actions minutes (free on public repos). Splitting offloads the long tail of low-traffic software landing pages from the CF Pages 500/mo bucket.
- **Discoverability** — `github.io/<repo>` URL pattern is a recognised software-homepage convention. CF custom subdomains are the recognised app convention. Each medium signals what it is.
- **No registrar swap** — `oriz.in` apex stays on Spaceship; CNAMEs point at Pages or GH Pages per repo type.

## Implications

- Per-repo deploy workflow picks its target by the repo's type suffix: `-app`, `-pwa`, `-website` → CF Pages; `-npm-pkg`, `-cli`, `-bs-ext`, `-ide-ext`, `-mcp-server` → GH Pages.
- The single-target `multi-target-build.md` decision is superseded; the DNS auto-provisioning step now only fires for CF Pages-bound repos. GH Pages uses `<repo>.github.io` by default.
- Wildcard CNAME `*.oriz.in` continues to point at CF for app subdomains. Software landing pages keep `github.io` URLs unless they also need a branded subdomain.
- Sentry, sitemap-of-sitemaps, robots.txt conventions from the old multi-target-build decision still apply per app on the CF Pages side. GH Pages software landing pages follow a lighter shape (no admin panel, no analytics dashboard).
- Build-time hooks for the umbrella deploy workflow need a `target: cf-pages | gh-pages` matrix axis.
