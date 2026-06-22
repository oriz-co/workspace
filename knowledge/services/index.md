---
type: index
title: "Service catalog — oriz family"
description: "One-line index of every external service the chirag127/oriz family uses. Grouped by role into 20 subdirectories — see each subdir's index.md for the per-service detail."
tags: [services, catalog, index]
timestamp: 2026-06-20
format_version: okf-v0.1
---

# Service catalog — oriz family

This catalog runs at **4-level hierarchy** (`services/<role>/<file>.md`) — see [`../_okf.md`](../_okf.md#hierarchy-depth--3-levels-by-default-4-levels-for-big-dirs) for the rule. The canonical service rules (no card-on-file, never enable Blaze, etc.) live in [`../rules/`](../rules/index.md). Architectural pairings live in [`../architecture/`](../architecture/index.md).

**Status legend:** `active` = currently used primary, `fallback` = documented swap target if primary fails, `rejected` = explicitly excluded (card-required, user policy, or quota too tight).

## Subdirectories (by role)

| Role | Subdir | Active picks |
|---|---|---|
| Static hosting | [hosting/](./hosting/index.md) | Cloudflare Pages (primary), GitHub Pages (survival fallback) |
| Auth + bot defense | [auth/](./auth/index.md) | Firebase Spark, 6-provider stack (Email link / Google / GitHub / Anonymous / Microsoft / Passkeys), App Check, reCAPTCHA Enterprise |
| Cron | [cron/](./cron/index.md) | Cloudflare Cron Triggers (in-Worker), GitHub Actions schedule (build/publish) |
| Database | [database/](./database/index.md) | Turso libSQL (warm cache), Neon Postgres (relational) — 4-tier stack with Firestore + JSONL canonical |
| Edge + build compute | [compute/](./compute/index.md) | Cloudflare Workers, Cloudflare R2, GitHub Actions |
| Secrets | [secrets/](./secrets/index.md) | Doppler (source of truth), GitHub Secrets (runtime mirror) |
| Email | [email/](./email/index.md) | Resend (transactional), EmailOctopus (marketing), Buttondown (technical newsletter) |
| Forms | [forms/](./forms/index.md) | Web3Forms (primary), Static Forms (fallback), Tally (rich) — locked trio |
| Video | [video/](./video/index.md) | YouTube (public), gumlet (privacy-sensitive) |
| Monitoring | [monitoring/](./monitoring/index.md) | Better Stack (HTTP uptime + status page), Instatus (status mirror), healthchecks.io (cron heartbeat — primary for cron liveness), Sentry (errors), Cloudflare Workers Tail (live logs), Better Stack Logs (log aggregation 3 GB/mo) |
| Analytics | [analytics/](./analytics/index.md) | 5-tier stack — Cloudflare Web Analytics + GA4 + PostHog (replay primary) + Microsoft Clarity (heatmaps + redundant replay) + UTM (attribution) |
| AI | [ai/](./ai/index.md) | Puter.js (browser surface) + Cloudflare Workers AI (server surface) — split by surface; OpenRouter rejected |
| Domain | [domain/](./domain/index.md) | Spaceship (registrar), Cloudflare DNS, Cloudflare Email Routing |
| Ads | [ads/](./ads/index.md) | Ezoic, Mediavine (both fallback) |
| Payment | [payment/](./payment/index.md) | Razorpay (India), Lemon Squeezy (international MoR), Polar.sh (OSS-friendly MoR), keygen.sh (licenses), GitHub Sponsors / Ko-fi / Buy Me a Coffee / Liberapay / Open Collective / PayPal.me / UPI Direct / crypto (8 donation rails) |
| Search | [search/](./search/index.md) | Algolia (large-corpus sites), Pagefind (rest); Orama Cloud deferred (vector-search candidate) |
| CDN | [cdn/](./cdn/index.md) | jsDelivr (npm package delivery) |
| Image CDN | [image-cdn/](./image-cdn/index.md) | Cloudflare Images (primary) → wsrv.nl (fallback 1) → ImageKit (fallback 2) — 3-tier chain |
| Image host (origin) | [image-host/](./image-host/index.md) | repo-hosted on CF Pages (Tier 1) → ImgBB (Tier 2) → Imgur (Tier 3) → GitHub user-content (Tier 4) — 4-tier origin chain |
| Queue | [queue/](./queue/index.md) | Cloudflare Queues (fan-out primary) + Hookdeck (webhook ingress); Upstash QStash + Inngest deferred; Trigger.dev walked back |
| Storage | [storage/](./storage/index.md) | GitHub Releases (versioned binaries), Backblaze B2 (unversioned blobs), restic (backup engine) — Cloudflare R2 rejected |
| Tooling / utilities | [tooling/](./tooling/index.md) | envpact, ImageKit, Cloudinary, Axiom, Hypertune, Hookdeck, Read the Docs, Azure for Students |
| Code quality + code stats | [code-quality/](./code-quality/index.md) | 9-tool stack on every public repo — Sonarcloud + CodeRabbit + Codecov + Code Climate + DeepSource + biome + Dependabot + GitHub Insights + Tokei + LoC badge |
| Code embed | [code-embed/](./code-embed/index.md) | StackBlitz (full-stack), CodePen (CSS), GitHub Gists (static) |
| Comments | [comments/](./comments/index.md) | Giscus (GitHub-Discussions-backed; blog + book-lore only, click-to-load) |
| Social | [social/](./social/index.md) | Satori OG cards (default), Ray.so (code posts), AT Protocol firehose mirror, ActivityPub federation mirror, Raindrop.io (linkroll source) |
| Short-link | [short-link/](./short-link/index.md) | Three-tier free shortener stack — `s.oriz.in` Cloudflare Worker (Tier 1, primary) + TinyURL (Tier 2, fallback) + GitHub Gist meta-refresh (Tier 3, zero-infra) |
| Testing | [testing/](./testing/index.md) | Vitest (unit), Playwright (E2E), Storybook + Chromatic (visual regression), MSW (in-process mocks), Mockoon (out-of-process mocks) |
| Push + notifications | [push/](./push/index.md) | Knock (multi-channel orchestration) + FCM (web-push transport) |
| Performance / RUM | [perf/](./perf/index.md) | Vercel Speed Insights (real-user Web Vitals) |
| Security headers + audit | [security/](./security/index.md) | Cloudflare `_headers` preset + securityheaders.com + Mozilla Observatory in CI; Cloudflare Turnstile primary captcha + hCaptcha fallback; Klaro consent manager; Cloudflare WAF (edge) + Hono rate-limit (API) — 3-layer anti-bot defense |
| Legal | [legal/](./legal/index.md) | Self-hosted family-wide privacy page on `oriz.in/privacy` (no third-party legal-doc tool) |
| Accessibility (a11y) | [a11y/](./a11y/index.md) | axe-core + Pa11y + Lighthouse CI (three-tool stack on every PR) |
| i18n / translation | [i18n/](./i18n/index.md) | English-only today; Weblate Hosted Libre when ready (Tolgee deferred) |
| SEO | [seo/](./seo/index.md) | @astrojs/sitemap + IndexNow + JSON-LD; submitted to Google Search Console + Bing Webmaster; 3-format feeds (RSS 2.0 + Atom 1.0 + JSON Feed) |
| Data APIs (read-only upstreams) | [data-api/](./data-api/index.md) | Open-Meteo (weather, unlimited free no-auth) + Alpha Vantage (finance, 25/day free key); geocoding deferred (CF-IPCountry covers today) |
| Dev-tools | [dev-tools/](./dev-tools/index.md) | Wrangler (Worker dev), Cloudflare Tunnel (webhook testing), Astro dev (sites) — three substrates picked by surface; ngrok rejected |
| Productivity | [productivity/](./productivity/index.md) | Toggl Track (manual non-coding) + Wakatime (auto coding) — split tracker stack |

## Active picks (flat view)

| Role | Service | File |
|---|---|---|
| Static hosting (primary) | Cloudflare Pages | [hosting/cloudflare-pages.md](./hosting/cloudflare-pages.md) |
| Survival fallback host | GitHub Pages | [hosting/github-pages.md](./hosting/github-pages.md) |
| Auth + user DB | Firebase Spark | [auth/firebase-spark.md](./auth/firebase-spark.md) |
| Auth provider list (6 active) | Firebase Auth | [auth/firebase-auth.md](./auth/firebase-auth.md) |
| Auth — Microsoft / Entra ID | Microsoft sign-in (via Firebase) | [auth/microsoft-sign-in.md](./auth/microsoft-sign-in.md) |
| Auth — passwordless / WebAuthn | Passkeys | [auth/passkeys.md](./auth/passkeys.md) |
| Bot defense (Firestore) | Firebase App Check | [auth/app-check-firebase.md](./auth/app-check-firebase.md) |
| Bot defense (assessments) | reCAPTCHA Enterprise | [auth/recaptcha-enterprise.md](./auth/recaptcha-enterprise.md) |
| Event read cache | Turso libSQL | [database/turso.md](./database/turso.md) |
| Relational DB | Neon Postgres | [database/neon-postgres.md](./database/neon-postgres.md) |
| Edge compute | Cloudflare Workers | [compute/cloudflare-workers.md](./compute/cloudflare-workers.md) |
| Object storage | Cloudflare R2 | [compute/cloudflare-r2.md](./compute/cloudflare-r2.md) |
| Build-time cron | GitHub Actions | [compute/github-actions.md](./compute/github-actions.md) |
| Cron — in-Worker / low-latency | Cloudflare Cron Triggers | [cron/cloudflare-cron-triggers.md](./cron/cloudflare-cron-triggers.md) |
| Cron — build / publish | GitHub Actions schedule | [cron/github-actions-schedule.md](./cron/github-actions-schedule.md) |
| Secrets — source of truth | Doppler | [secrets/doppler.md](./secrets/doppler.md) |
| Secrets — CI runtime mirror | GitHub Secrets | [secrets/github-secrets.md](./secrets/github-secrets.md) |
| Transactional email | Resend | [email/resend.md](./email/resend.md) |
| Marketing newsletter | EmailOctopus | [email/email-octopus.md](./email/email-octopus.md) |
| Technical newsletter | Buttondown | [email/buttondown.md](./email/buttondown.md) |
| Contact form backend | Web3Forms | [forms/web3forms.md](./forms/web3forms.md) |
| Contact form backend (fallback) | Static Forms | [forms/static-forms.md](./forms/static-forms.md) |
| Rich form builder | Tally.so | [forms/tally.md](./forms/tally.md) |
| Uptime + status page | Better Stack | [monitoring/better-stack.md](./monitoring/better-stack.md) |
| Status page (redundant mirror) | Instatus | [monitoring/instatus.md](./monitoring/instatus.md) |
| Heartbeat monitoring | healthchecks.io | [monitoring/healthchecks-io.md](./monitoring/healthchecks-io.md) |
| Error tracking | Sentry | [monitoring/sentry.md](./monitoring/sentry.md) |
| Web analytics | Cloudflare Web Analytics | [analytics/cloudflare-web-analytics.md](./analytics/cloudflare-web-analytics.md) |
| Marketing-funnel analytics | Google Analytics 4 | [analytics/google-analytics.md](./analytics/google-analytics.md) |
| Heatmaps + redundant session replay | Microsoft Clarity | [analytics/microsoft-clarity.md](./analytics/microsoft-clarity.md) |
| Product analytics + replay primary + flags | PostHog | [analytics/posthog.md](./analytics/posthog.md) |
| Marketing attribution | UTM tracking | [analytics/utm-tracking.md](./analytics/utm-tracking.md) |
| Browser-side AI | Puter.js | [ai/puter-js.md](./ai/puter-js.md) |
| Server-side AI (in Hono Worker) | Cloudflare Workers AI | [ai/cloudflare-workers-ai.md](./ai/cloudflare-workers-ai.md) |
| DNS | Cloudflare DNS | [domain/cloudflare-dns.md](./domain/cloudflare-dns.md) |
| Domain registrar | Spaceship | [domain/spaceship.md](./domain/spaceship.md) |
| Email forwarding (inbound → Gmail) | Cloudflare Email Routing | [domain/cloudflare-email-routing.md](./domain/cloudflare-email-routing.md) |
| Subscription billing (India) | Razorpay | [payment/razorpay.md](./payment/razorpay.md) |
| Subscription billing (international, MoR) | Lemon Squeezy | [payment/lemon-squeezy.md](./payment/lemon-squeezy.md) |
| Checkout — OSS-friendly MoR | Polar.sh | [payment/polar-sh.md](./payment/polar-sh.md) |
| License-key fulfilment | keygen.sh | [payment/keygen-sh.md](./payment/keygen-sh.md) |
| Donations — developer | GitHub Sponsors | [payment/github-sponsors.md](./payment/github-sponsors.md) |
| Donations — creator (0% fee) | Ko-fi | [payment/ko-fi.md](./payment/ko-fi.md) |
| Donations — creator (5% fee) | Buy Me a Coffee | [payment/buymeacoffee.md](./payment/buymeacoffee.md) |
| Donations — recurring-only (0% fee) | Liberapay | [payment/liberapay.md](./payment/liberapay.md) |
| Donations — transparent ledger | Open Collective | [payment/opencollective.md](./payment/opencollective.md) |
| P2P payout (international) | PayPal.me | [payment/paypal-me.md](./payment/paypal-me.md) |
| P2P direct (India, 0% fee) | UPI Direct (static QR) | [payment/upi-direct.md](./payment/upi-direct.md) |
| Crypto fallback | BTC / ETH / USDC self-custody | [payment/crypto-bitcoinaddr.md](./payment/crypto-bitcoinaddr.md) |
| Static-site search (small) | Pagefind | [search/pagefind.md](./search/pagefind.md) |
| Hosted search (large corpus) | Algolia | [search/algolia.md](./search/algolia.md) |
| npm package CDN | jsDelivr | [cdn/jsdelivr.md](./cdn/jsdelivr.md) |
| Image CDN — primary | Cloudflare Images | [image-cdn/cloudflare-images.md](./image-cdn/cloudflare-images.md) |
| Image CDN — fallback 1 | wsrv.nl | [image-cdn/wsrv-nl.md](./image-cdn/wsrv-nl.md) |
| Image CDN — fallback 2 | ImageKit (CDN role) | [image-cdn/imagekit.md](./image-cdn/imagekit.md) |
| Image host — Tier 1 (origin) | repo-hosted on Cloudflare Pages | [image-host/repo-hosted-cf-pages.md](./image-host/repo-hosted-cf-pages.md) |
| Image host — Tier 2 (origin) | ImgBB | [image-host/imgbb.md](./image-host/imgbb.md) |
| Image host — Tier 3 (origin) | Imgur | [image-host/imgur.md](./image-host/imgur.md) |
| Image host — Tier 4 (origin) | GitHub user-content (raw.githubusercontent.com) | [image-host/github-user-content.md](./image-host/github-user-content.md) |
| Queue | Cloudflare Queues | [queue/cloudflare-queues.md](./queue/cloudflare-queues.md) |
| Webhook ingress (queue layer) | Hookdeck (queue facet) | [queue/hookdeck.md](./queue/hookdeck.md) |
| Storage — versioned binaries | GitHub Releases | [storage/github-releases.md](./storage/github-releases.md) |
| Storage — unversioned blobs | Backblaze B2 | [storage/backblaze-b2.md](./storage/backblaze-b2.md) |
| Backup engine | restic (OSS, target = B2) | [storage/restic.md](./storage/restic.md) |
| URL shortener (self-hosted, Tier 1) | Cloudflare Worker @ `s.oriz.in` | [short-link/cloudflare-worker.md](./short-link/cloudflare-worker.md) |
| URL shortener (Tier 2 fallback) | TinyURL public API | [short-link/tinyurl.md](./short-link/tinyurl.md) |
| URL shortener (Tier 3 zero-infra) | GitHub Gist meta-refresh | [short-link/github-gist-redirect.md](./short-link/github-gist-redirect.md) |
| Feature flags + A/B testing | Hypertune | [tooling/hypertune.md](./tooling/hypertune.md) |
| Webhook reliability | Hookdeck | [tooling/hookdeck.md](./tooling/hookdeck.md) |
| Image CDN | ImageKit | [tooling/imagekit.md](./tooling/imagekit.md) |
| Image CDN (fallback) | Cloudinary | [tooling/cloudinary.md](./tooling/cloudinary.md) |
| Video hosting (public) | YouTube | [video/youtube.md](./video/youtube.md) |
| Video hosting (privacy-sensitive) | gumlet | [video/gumlet.md](./video/gumlet.md) |
| SDK / API docs | Read the Docs | [tooling/readthedocs.md](./tooling/readthedocs.md) |
| Log management | Axiom | [tooling/axiom.md](./tooling/axiom.md) |
| Secrets vault | envpact | [tooling/envpact.md](./tooling/envpact.md) |
| Dependency updates | Dependabot | [code-quality/dependabot.md](./code-quality/dependabot.md) |
| AI code review | CodeRabbit | [code-quality/coderabbit.md](./code-quality/coderabbit.md) |
| Static analysis (SAST) | Sonarcloud | [code-quality/sonarcloud.md](./code-quality/sonarcloud.md) |
| Coverage tracking | Codecov | [code-quality/codecov.md](./code-quality/codecov.md) |
| Maintainability grade (A — F) | Code Climate Quality | [code-quality/codeclimate.md](./code-quality/codeclimate.md) |
| Static analysis + autofix PRs | DeepSource | [code-quality/deepsource.md](./code-quality/deepsource.md) |
| Code stats — native repo insights | GitHub Insights | [code-quality/github-insights.md](./code-quality/github-insights.md) |
| Code stats — line counts (Rust CLI) | Tokei | [code-quality/tokei.md](./code-quality/tokei.md) |
| Code stats — LoC README badge | Lines of Code badge (GitHub Action) | [code-quality/lines-of-code-badge.md](./code-quality/lines-of-code-badge.md) |
| Code playground (full-stack) | StackBlitz | [code-embed/stackblitz.md](./code-embed/stackblitz.md) |
| Code playground (CSS) | CodePen | [code-embed/codepen.md](./code-embed/codepen.md) |
| Code snippet (static) | GitHub Gists | [code-embed/github-gists.md](./code-embed/github-gists.md) |
| Comments (blog + book-lore only) | Giscus (GitHub Discussions) | [comments/giscus.md](./comments/giscus.md) |
| OG card generator (templated, non-code) | Satori on `api.oriz.in/og` | [social/satori-og-cards.md](./social/satori-og-cards.md) |
| Code-screenshot og:image | Ray.so | [social/ray-so.md](./social/ray-so.md) |
| i18n — when ready | Weblate Hosted Libre | [i18n/weblate-hosted-libre.md](./i18n/weblate-hosted-libre.md) |
| SEO — sitemap | @astrojs/sitemap | [seo/astrojs-sitemap.md](./seo/astrojs-sitemap.md) |
| SEO — instant indexing | IndexNow | [seo/indexnow.md](./seo/indexnow.md) |
| SEO — structured data | JSON-LD (`<JsonLd>` in oriz-kit) | [seo/json-ld-structured-data.md](./seo/json-ld-structured-data.md) |
| SEO — Google console | Google Search Console | [seo/google-search-console.md](./seo/google-search-console.md) |
| SEO — Bing console | Bing Webmaster Tools | [seo/bing-webmaster.md](./seo/bing-webmaster.md) |
| Feed — Atom 1.0 | Atom 1.0 (RFC 4287) | [seo/atom-feed.md](./seo/atom-feed.md) |
| Feed — JSON Feed | JSON Feed v1.1 | [seo/json-feed.md](./seo/json-feed.md) |
| Multi-channel notifications | Knock | [push/knock.md](./push/knock.md) |
| Web-push transport | Firebase Cloud Messaging | [push/fcm.md](./push/fcm.md) |
| RUM Web Vitals | Vercel Speed Insights | [perf/vercel-speed-insights.md](./perf/vercel-speed-insights.md) |
| Security headers (static) | Cloudflare `_headers` | [security/cloudflare-headers.md](./security/cloudflare-headers.md) |
| CI auditor — headers grade | securityheaders.com | [security/securityheaders-com.md](./security/securityheaders-com.md) |
| CI auditor — comprehensive | Mozilla Observatory | [security/mozilla-observatory.md](./security/mozilla-observatory.md) |
| a11y rule engine (static) | axe-core | [a11y/axe-core.md](./a11y/axe-core.md) |
| a11y dynamic runner | Pa11y | [a11y/pa11y.md](./a11y/pa11y.md) |
| a11y score + lab perf | Lighthouse CI | [a11y/lighthouse-ci.md](./a11y/lighthouse-ci.md) |
| Captcha — primary | Cloudflare Turnstile | [security/cloudflare-turnstile.md](./security/cloudflare-turnstile.md) |
| Captcha — fallback (regional auto-detect) | hCaptcha | [security/hcaptcha.md](./security/hcaptcha.md) |
| Cookie consent — EU + tracker only | Klaro (OSS, jsDelivr) | [security/klaro.md](./security/klaro.md) |
| Anti-bot — edge / WAF | Cloudflare WAF + Bot Fight Mode | [security/cloudflare-waf.md](./security/cloudflare-waf.md) |
| Anti-bot — API rate-limit | Hono rate-limit middleware | [security/hono-rate-limit.md](./security/hono-rate-limit.md) |
| Legal — family privacy page | oriz.in/privacy (self-hosted) | [legal/privacy-page.md](./legal/privacy-page.md) |
| Lifestream mirror — AT Protocol / Bluesky | AT Protocol firehose | [social/atproto-firehose.md](./social/atproto-firehose.md) |
| Lifestream mirror — Fediverse / Mastodon | ActivityPub | [social/activitypub.md](./social/activitypub.md) |
| Linkroll source-of-truth | Raindrop.io | [social/raindrop-io.md](./social/raindrop-io.md) |
| Testing — unit / integration | Vitest | [testing/vitest.md](./testing/vitest.md) |
| Testing — E2E + cross-browser | Playwright | [testing/playwright.md](./testing/playwright.md) |
| Testing — component sandbox | Storybook | [testing/storybook.md](./testing/storybook.md) |
| Testing — visual regression | Chromatic | [testing/chromatic.md](./testing/chromatic.md) |
| Testing — API mocks (in-process) | MSW (Mock Service Worker) | [testing/msw.md](./testing/msw.md) |
| Testing — API mocks (out-of-process) | Mockoon (CLI + desktop) | [testing/mockoon.md](./testing/mockoon.md) |
| Logs — live tail | Cloudflare Workers Tail | [monitoring/cloudflare-workers-tail.md](./monitoring/cloudflare-workers-tail.md) |
| Logs — aggregation + search + alerts | Better Stack Logs | [monitoring/better-stack-logs.md](./monitoring/better-stack-logs.md) |
| Weather data API | Open-Meteo | [data-api/open-meteo.md](./data-api/open-meteo.md) |
| Finance / market data API | Alpha Vantage | [data-api/alpha-vantage.md](./data-api/alpha-vantage.md) |
| Dev — Worker CLI (local + remote) | Wrangler | [dev-tools/wrangler.md](./dev-tools/wrangler.md) |
| Dev — public hostname tunnel | Cloudflare Tunnel (cloudflared) | [dev-tools/cloudflare-tunnel.md](./dev-tools/cloudflare-tunnel.md) |
| Time tracking — manual (non-coding) | Toggl Track | [productivity/toggl-track.md](./productivity/toggl-track.md) |
| Time tracking — auto (coding) | Wakatime | [productivity/wakatime.md](./productivity/wakatime.md) |
| Family inventory (canonical counts SSoT) | apps / packages / books / APIs / submodules | [family-inventory.md](./family-inventory.md) |

## Fallback picks

| Role | Service | File |
|---|---|---|
| Static hosting | Vercel hobby | [hosting/vercel.md](./hosting/vercel.md) |
| Static hosting | Netlify | [hosting/netlify.md](./hosting/netlify.md) |
| Auth + Postgres | Supabase | [auth/supabase.md](./auth/supabase.md) |
| Auth | Clerk | [auth/clerk.md](./auth/clerk.md) |
| Domain registrar (swap target) | Cloudflare Registrar | [domain/cloudflare-registrar.md](./domain/cloudflare-registrar.md) |
| Marketing email | MailerLite | [email/mailerlite.md](./email/mailerlite.md) |
| Contact form | Formspree | [forms/formspree.md](./forms/formspree.md) |
| Ads | Ezoic | [ads/ezoic.md](./ads/ezoic.md) |
| Ads | Mediavine | [ads/mediavine.md](./ads/mediavine.md) |

## Conditional / available extras

| Role | Service | File |
|---|---|---|
| Free Azure credits (student) | Azure for Students | [tooling/azure-for-students.md](./tooling/azure-for-students.md) |

## Deferred (documented future option)

| Role | Service | File |
|---|---|---|
| Hybrid search (BM25 + vector) | Orama Cloud | [search/orama-cloud.md](./search/orama-cloud.md) |

## Rejected

| Service | Reason | File |
|---|---|---|
| Firebase Hosting | Spark daily bandwidth cap shifted to 360 MB/day | [hosting/firebase-hosting.md](./hosting/firebase-hosting.md) |
| GlitchTip | Replaced by Sentry on 2026-06-20 — Sentry has best integration coverage; env-var per-site toggle handles 5K/mo cap | [monitoring/glitchtip.md](./monitoring/glitchtip.md) |
| OpenRouter | Puter.js is sole Gen AI pick — model IDs mirror OpenRouter's catalog so calling OpenRouter directly would duplicate capability and require account + credit signup | [ai/openrouter.md](./ai/openrouter.md) |
| Cloudflare R2 | Adjacent paid Workers features pull in card-on-file requirement (Batch 8 lock); replaced by GitHub Releases + Backblaze B2 split | [storage/cloudflare-r2.md](./storage/cloudflare-r2.md) |
| Oracle Cloud | User policy | [oracle-cloud.md](./oracle-cloud.md) |
| Backblaze B2 (historical) | Old `services/backblaze-b2.md` flat-level rejection — REVERSED Batch 8; live entry is `storage/backblaze-b2.md` | [backblaze-b2.md](./backblaze-b2.md) |
| AWS | Requires card | [aws.md](./aws.md) |
| Azure (paid tiers) | Requires card | [azure-paid-tiers.md](./azure-paid-tiers.md) |
| Tolgee | Earlier i18n deferral; on 2026-06-20 revisit, Weblate Hosted Libre picked as the when-ready primary instead | [i18n/tolgee.md](./i18n/tolgee.md) |
| Otterwatch | Free tier covers only 5 domains; family has 11+ sites — Better Stack covers 10 monitors instead | (no file — never adopted) |

## Cross-refs

- [No card-on-file rule](../rules/no-card-on-file.md)
- [Never hit quotas rule](../rules/never-hit-quotas.md)
- [AGENTS.md service catalog](../../AGENTS.md#service-catalog--picks--alternatives)
