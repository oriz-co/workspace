---
type: index
title: Packages
description: Index of concepts in decisions/architecture/packages.
tags:
- index
- packages
timestamp: '2026-06-24'
format_version: okf-v0.1
status: active
---

# Packages

## Concepts

- [Add 4 packages to family — oriz-rate-limit, oriz-analytics, oriz-seo, oriz-consent (22 packages total)](./four-more-packages-22-total.md) — Grilled 2026-06-22. Family expands from 18 to 22 packages. New packages: (1) oriz-rate-limit — Free/Pro/Max tier usage caps across apps (10/100/unlimited PDF merges etc.); (2) oriz-analytics — single wrapper around CF Web Analytics + GA4 + Microsoft Clarity + Sentry (one init call per app); (3) oriz-seo — sitemap + IndexNow + JSON-LD + OG image generator; (4) oriz-consent — Klaro consent manager pre-configured for EU/UK + India DPDP + US GPC. Each replaces inlined per-app code.
- [Legal pages package: @chirag127/astro-chrome/legal/* mounted in-domain per app](./legal-pages-package-in-domain.md) — 8+ legal pages (/privacy /terms /contact /about /refunds /disclaimer /sitemap /security.txt) shipped as Astro page components in `@chirag127/astro-chrome/legal/`. Every app mounts them at its own domain (not external legal.oriz.in) so AdSense + Play Store + MS Store + Razorpay approval gates are satisfied. Single source of legal text; same content everywhere; design adapts to each app's theme.
- [@chirag127/omni-publish package — auto-blog releases to 8+ platforms](./omni-publish-package.md) — New npm package @chirag127/omni-publish handles auto-publishing release notes / blog posts to dev.to + hashnode + medium + X + LinkedIn + Bluesky + Mastodon + Reddit on tag push or release create. Triggered by GitHub Actions reusable workflow per repo. Platforms are env-gated — if DEVTO_API_KEY isn't set globally, dev.to is skipped automatically. Lives alongside the existing oriz-omni-post-app (the orchestrator UI / catalog of cross-posts).
- [omni-publish v0.1.2 follow-ups (deferred from v0.1.1)](./omni-publish-v0-1-2-followups.md) — Five follow-ups deferred from @chirag127/omni-publish v0.1.1 → v0.1.2: per-repo per-day rate-limit cache (high), retry on transient 5xx (medium), compile TS → dist/ for non-bundler consumers (medium), Hashnode tag _id resolution (low), Threads single-user-token assumption validation (low).
- [@chirag127/oriz-ai-providers (18th package) + chirag127/oriz-ai-providers-data data repo](./oriz-ai-providers-package.md) — New family package `@chirag127/oriz-ai-providers` aggregates EVERY free LLM API (Cerebras, Groq, Cohere, NVIDIA NIM, GitHub Models, Cloudflare Workers AI, HuggingFace, Mistral, SambaNova, OpenRouter, LLM7, OVHcloud, Pollinations, Kilo Code, Ollama Cloud, Z.AI, Aion Labs, SiliconFlow, ModelScope — 20+ providers). Provider data + model lists + rate limits + base URLs maintained in a SEPARATE data repo `chirag127/oriz-ai-providers-data` so the package can stay slim and the data can be updated independently of the code. Priority order: no-key-required providers first (anonymous OVHcloud / LLM7 / Pollinations), then free-with-key providers as fallback chain. NIM + OpenRouter demoted from primary.
- [packages.oriz.in shape — auto-discovery Starlight catalog with showcase pages](./packages-catalog-shape.md) — packages.oriz.in is the auto-discovery Starlight catalog. A GitHub Action lists every chirag127/*-npm-pkg repo, fetches README + version + bundle metadata, and renders per-package showcase pages with live demo iframe, copy-paste install snippet, badge wall, and StackBlitz playground link. Rebuilds daily via cron + on tag push from any package repo.
- [Dual-location package surfacing — oriz.in overview + packages.oriz.in catalog](./packages-oriz-in-catalog.md) — Packages are surfaced in TWO places: (1) oriz.in renders an /apps + /packages + /mobile + /desktop + /extensions overview with cards per app + store/channel badges (Play Store, Microsoft Store, Chrome Web Store, etc.) with 'Coming soon' for unreleased channels; (2) packages.oriz.in is a standalone Astro Starlight catalog that auto-discovers every chirag127/*-npm-pkg repo and renders the full README + npm/GH/bundlephobia metadata per package. Channels metadata lives in home-app/src/data/apps.ts (manual) + auto-discovery from GitHub Releases for native installer URLs.
- [Single family-wide pricing page (ad-free is the only paid feature)](./single-pricing-page-package.md) — One pricing page shared across all oriz apps, served from a package so it's identical everywhere. The ONLY paid feature family-wide is 'ad-free' — remove AdSense + AdMob. Same price tier across web + Play + MS Store. Single Razorpay/Paddle/Play-Billing link. No per-app paywall complexity.
