---
type: architecture
title: "Layer 2 \u2014 survival fallback on GitHub Pages"
description: "Every site builds a static fallback to chirag127.github.io/<site> on\
  \ every push to main. If Cloudflare Pages dies, /work + /me + /legal still serve\
  \ from github.io. Per the 100-year strategy \xA716."
tags:
- architecture
- hosting
- github-pages
- layer-2
- survival
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- architecture/frontend/layer-1-static-hosting
- architecture/database/canonical-store-jsonl
- architecture/ops/extension-distribution
- services/hosting/github-pages
---



# Layer 2 — survival fallback on GitHub Pages

## Concept

Every site mirrors a static fallback build to GitHub Pages so that the
identity-critical pages survive a Cloudflare outage, account
suspension, or pricing change. This is the §16 rule of the 100-year
strategy: "primary host can die; the wiki, work history, and legal
pages must not".

## How it works

- Per-site GitHub Action runs on push to `main`
- It builds a stripped-down static bundle and publishes to
  `chirag127.github.io/<site-name>`
- One custom domain per repo if needed (each site can attach its own
  subdomain)
- Quota: 100 GB/month bandwidth per site, 1 GB site cap — easily within
  reach for a degraded-mode mirror
- Static-only — no APIs, no functions, no client-side calls to the
  primary host. The fallback assumes the primary is down.
- Extension catalog landing pages can run on GitHub Pages full-time
  (not just as fallback) — see [extension-distribution.md](../ops/extension-distribution.md)
- Allowed monetisation: AdSense + content + utility + portfolio. NOT
  allowed: e-commerce / SaaS-checkout primary intent.

## Why this shape

Cloudflare Pages is excellent but is one company's free tier. The
survival rule is "if the primary disappears overnight, the recruiter
clicking through to oriz.in/work tomorrow morning still sees a page".
GitHub Pages is the right second host because the source repos already
live on GitHub — the publish workflow is a few-line YAML, no new
account, no card.

## Cross-refs

- Primary host → [layer-1-static-hosting.md](./layer-1-static-hosting.md)
- Why git is canonical (same survival logic at the data layer) → [canonical-store-jsonl.md](../database/canonical-store-jsonl.md)
- Extensions catalog hosting → [extension-distribution.md](../ops/extension-distribution.md)
