---
type: index
title: "Architecture decisions"
description: "Locked decisions about how the oriz family's code and data architecture is shaped."
tags: [decisions, architecture, index]
timestamp: 2026-06-20
format_version: okf-v0.1
---

# Architecture decisions

| Decision | One-line summary |
|---|---|
| [hono-worker-api-umbrella.md](./hono-worker-api-umbrella.md) | One Hono Worker at `api.oriz.in` is the entire API layer |
| [oriz-ui-split-into-5-packages.md](./oriz-ui-split-into-5-packages.md) | UI split into 5 packages + kit shim (`oriz-kit`) |
| [lifestream-jsonl-canonical.md](./lifestream-jsonl-canonical.md) | JSONL in `oriz-me-data` is canonical; Turso is warm cache |
| [firebase-rest-firestore-not-admin.md](./firebase-rest-firestore-not-admin.md) | `firebase-rest-firestore` for Workers compatibility |
| [hono-rpc-for-type-sharing.md](./hono-rpc-for-type-sharing.md) | Type-safe API client via Hono `hc<AppType>` |
| [multi-engine-search-button.md](./multi-engine-search-button.md) | Every site ships `<MultiSearch />` from `@chirag127/oriz-kit` |
| [cross-post-engine.md](./cross-post-engine.md) | `oriz-omnipost` cross-posts blog.oriz.in RSS to every platform with a public API; short-link fallback for length-capped targets |
| [cron-split-cf-vs-gh.md](./cron-split-cf-vs-gh.md) | Cron runs on BOTH Cloudflare Cron Triggers (in-Worker, low-latency) and GitHub Actions schedule (build / publish), picked by job shape |
| [image-cdn-fallback-chain.md](./image-cdn-fallback-chain.md) | 3-tier image CDN chain: Cloudflare Images → wsrv.nl → ImageKit, implemented in `@chirag127/oriz-kit` `<Image>` |
| [queue-cloudflare-native.md](./queue-cloudflare-native.md) | Cloudflare Queues primary for stack cohesion; Upstash QStash + Inngest deferred |
| [object-storage-split.md](./object-storage-split.md) | GitHub Releases for versioned binaries, Backblaze B2 for blobs; Cloudflare R2 rejected |
| [newsletter-split-buttondown-emailoctopus.md](./newsletter-split-buttondown-emailoctopus.md) | Buttondown for technical/dev audience, EmailOctopus for general marketing |
| [notifications-fcm-plus-knock.md](./notifications-fcm-plus-knock.md) | Two-layer notifications — Knock orchestrates multi-channel on top of FCM web-push + Resend email + bundled SMS |
| [perf-monitoring-vercel-speed-insights.md](./perf-monitoring-vercel-speed-insights.md) | Vercel Speed Insights as RUM Web Vitals on every site; works on Cloudflare Pages without Vercel hosting |
| [a11y-three-tools.md](./a11y-three-tools.md) | Every PR runs axe-core + Pa11y + Lighthouse CI in parallel; PR fails on any new violation |
| [og-card-generation-satori.md](./og-card-generation-satori.md) | Non-code OG cards via Satori on `api.oriz.in/og` Hono Worker route; ray.so retained for code posts |
| [seo-three-pillars.md](./seo-three-pillars.md) | Every site ships sitemap + IndexNow + JSON-LD; submitted to Google Search Console + Bing Webmaster |
| [testing-three-layer.md](./testing-three-layer.md) | Three-layer testing stack: Vitest (unit) + Playwright (E2E) + Storybook+Chromatic (visual regression); rides on the same Playwright install as the a11y trio |
| [lifestream-federation.md](./lifestream-federation.md) | Lifestream JSONL canonical → mirrored to BOTH AT Protocol (Bluesky) AND ActivityPub (Fediverse); single source, two protocols |
| [db-add-neon-postgres.md](./db-add-neon-postgres.md) | Add Neon Postgres as the relational tier — 4-tier DB stack (Firestore + JSONL + Turso libSQL + Neon); free, no card, scale-to-zero, branching for previews |
| [ai-puter-plus-cf-workers-ai.md](./ai-puter-plus-cf-workers-ai.md) | AI split by surface: Puter.js for browser, Cloudflare Workers AI for server-side inside Hono Worker (10K neurons / day, zero-egress) |
| [feeds-rss-atom-json.md](./feeds-rss-atom-json.md) | Three-format feed publishing — `/rss.xml` + `/atom.xml` + `/feed.json` on every site; `<FeedDiscovery />` in oriz-kit |
| [utm-attribution-strategy.md](./utm-attribution-strategy.md) | UTM-only marketing attribution — no paid attribution tool; `<UtmLink>` in oriz-kit enforces kebab-case naming |
| [distribution-and-queues-locked.md](./distribution-and-queues-locked.md) | Batch 13 lock — browser ext to Chrome+Firefox+Edge; VS Code ext to VS Code Marketplace + Open VSX (JetBrains walked back); PWA-only via vite-pwa-astro (Capacitor + Tauri walked back); webhook reliability is Hookdeck → CF Queues (Trigger.dev walked back) |
| [backup-restic-to-b2.md](./backup-restic-to-b2.md) | Backups — restic CLI in GH Actions weekly cron, target Backblaze B2; encrypted, deduplicated, retention 7d/4w/12m |
| [linkroll-raindrop-to-links-page.md](./linkroll-raindrop-to-links-page.md) | Linkroll — Raindrop.io is source of truth; `blog.oriz.in/links` built at deploy time from REST API; nightly cron re-deploys |
| [url-shortener-quota-mitigation.md](./url-shortener-quota-mitigation.md) | s.oriz.in Worker emits `Cache-Control: max-age=31536000, immutable` on every 301 — CF edge caches the redirect itself; Worker burned only first-visit-per-POP-per-year |
| [url-shortener-mitigation-tiers.md](./url-shortener-mitigation-tiers.md) | Three-tier free shortener stack — s.oriz.in CF Worker (Tier 1, primary) + TinyURL (Tier 2, fallback) + GitHub Gist meta-refresh (Tier 3, zero-infra). Quota math: ~1.2% of CF Worker free envelope at family scale |
| [analytics-five-tier-stack.md](./analytics-five-tier-stack.md) | 5-tier analytics stack — CFWA + GA4 + PostHog + Microsoft Clarity + UTM; each layer has `ENABLE_<TOOL>` env-var kill-switch; vendor-redundant session replay (PostHog + Clarity) |
| [code-quality-five-tools.md](./code-quality-five-tools.md) | 5-tool code-quality stack — Sonarcloud + CodeRabbit + Codecov + Code Climate + DeepSource; all free for public OSS repos; extends the earlier 4-tool stack |
| [forms-trio.md](./forms-trio.md) | Forms trio — Web3Forms primary + Static Forms fallback (vendor-redundant contact-form pair) + Tally for rich/multi-step |
| [cf-worker-quota-mitigation.md](./cf-worker-quota-mitigation.md) | CF Worker quota mitigation playbook — 8-step recipe (cache aggressively, split per domain, prefer `_headers`, KV hot-path) keeps every Worker safely under the 100K req/day free-tier cap |
| [cms-markdown-in-repo-only.md](./cms-markdown-in-repo-only.md) | Markdown-in-repo only — no headless CMS anywhere; Decap / TinaCMS / Strapi / Sanity / Contentful all REJECTED. Every site stores content as `.md` / `.mdx` in its own repo |
| [image-host-four-tier.md](./image-host-four-tier.md) | 4-tier image origin chain — repo-hosted on CF Pages → ImgBB → Imgur → GitHub user-content. Composes alongside the 3-tier image-CDN delivery chain |
| [status-banner-on-every-site.md](./status-banner-on-every-site.md) | Every site embeds `<StatusBanner />` from oriz-kit consuming Better Stack's incident RSS; invisible by default, dismissible per-incident, falls through to Instatus on Better Stack outage |
| [voice-sms-deferred-to-knock.md](./voice-sms-deferred-to-knock.md) | NO standalone Twilio / Vonage / SMS provider. If/when SMS is needed, route via Knock's bundled SMS channel (already locked for multi-channel notifications). Both Twilio and Vonage rejected on card-on-file grounds |
| [geocoding-deferred.md](./geocoding-deferred.md) | NO geocoding service today. None of the 11 sites need address↔coordinate translation; `CF-IPCountry` header covers every current geo-routing need. Future swap targets documented: OpenStreetMap Nominatim or Mapbox (both free, no card) |
| [data-apis-open-meteo-alpha-vantage.md](./data-apis-open-meteo-alpha-vantage.md) | Open-Meteo (weather, unlimited free, no auth) + Alpha Vantage (finance, 25/day free key) — both fronted by umbrella Hono Worker with KV caching (1h TTL on weather, 1d TTL on finance EOD); cron-driven warm-cache for top tickers |
| [db-admin-console-only.md](./db-admin-console-only.md) | DB admin is browser-console-only — Firebase Console + Neon Console + Turso CLI + libSQL CLI. NO desktop DB tool; Drizzle Studio / Outerbase / Beekeeper Studio / TablePlus all REJECTED. Zero install footprint, no per-user license |
| [api-mocks-msw-plus-mockoon.md](./api-mocks-msw-plus-mockoon.md) | API mocks split by surface — MSW for in-process (Vitest, Storybook, dev) + Mockoon for out-of-process (E2E, manual dev against Razorpay sandbox / Open-Meteo / Alpha Vantage offline). Both free OSS |
| [logs-better-stack-plus-cf-tail.md](./logs-better-stack-plus-cf-tail.md) | Two-layer logs — Cloudflare Workers Tail for live (5-min retention, free) + Better Stack Logs for aggregation + 30-day retention + alerts (3 GB/mo free, same Better Stack account as status + uptime). Quota math: ~30 MB/mo realistic vs 3 GB cap = ~100x headroom |
| [build-cache-gh-actions-plus-pnpm.md](./build-cache-gh-actions-plus-pnpm.md) | Three-layer build cache — pnpm CAS global store (per-machine) + GH Actions cache (per-repo, 10 GB free, lockfile-keyed pnpm store + source-keyed Astro cache). Turbo Remote Cache + Bazel REJECTED (Vercel signup + card / overengineering) |
| [bug-tracker-github-issues-only.md](./bug-tracker-github-issues-only.md) | Bug intake — GitHub Issues only, per-repo. Linear / Trello / Jira / Plane.so / ClickUp / Height / Shortcut all REJECTED. Cross-repo triage via `gh issue list --search "org:chirag127 ..."`; `#123` syntax auto-links to PRs; fits one-branch-only |
| [project-mgmt-github-projects-only.md](./project-mgmt-github-projects-only.md) | Project / task management — single GitHub Projects board on `chirag127/oriz` master with kanban + table + roadmap views. Notion / Obsidian / Linear / Asana / Trello / Monday all REJECTED. Knowledge in OKF bundle, tasks on the board — clean split |
| [local-dev-tunneling-cf-tunnel.md](./local-dev-tunneling-cf-tunnel.md) | Local dev tunneling — Wrangler (Workers) + Astro dev (sites) + Cloudflare Tunnel (`cloudflared`) for persistent `dev.oriz.in` hostname → webhook testing. ngrok / localtunnel / serveo all REJECTED |
| [time-tracking-wakatime-only.md](./time-tracking-wakatime-only.md) | Time tracking — Wakatime ONLY (auto coding via IDE plugin). Toggl Track REJECTED 2026-06-20 same day it was adopted; manual timers violate the auto-only-tracking rule. Non-coding time intentionally NOT tracked. File renamed via `git mv` from `time-tracking-toggl-plus-wakatime.md`. RescueTime / Clockify / Harvest / spreadsheets all REJECTED |
| [auto-tracking-everywhere.md](./auto-tracking-everywhere.md) | Family-wide lock — every tracked metric is auto-captured. For oriz-me lifestream: GitHub commits via webhook → Hookdeck → CF Worker → JSONL; npm publishes via post-publish hook in CI; coding sessions via Wakatime daily summary cron; visits via CF Web Analytics; builds via GH Actions `workflow_run` webhook. Manual = decay; auto = honest. Rejects all manual fallbacks |
| [oriz-me-single-site-not-split.md](./oriz-me-single-site-not-split.md) | `oriz-me-site` stays a SINGLE Astro site at `me.oriz.in` with internal URL sections (`/now`, `/uses`, `/gear`, `/reading`, `/coding`, `/lifestream`, `/cv`, `/contact`). NOT split into `now.oriz.in` / `uses.oriz.in` / `gear.oriz.in` / `resume.oriz.in` / `cv.oriz.in`. Personal-brand sites are facets of one person, not separate products; brianlovin.com / leerob.io / kentcdodds.com all agree. Splitting fragments the lifestream JSONL canonical store, dilutes SEO equity, and ~5x's CI / env-sync / design-token maintenance |
| [tools-site-15-repos.md](./tools-site-15-repos.md) | Tool sites — 15 separate repos (`pdf-site`, `image-site`, ..., `print-site`), each at its own `<category>.oriz.in` subdomain. Tier 1 (8) functional day 1; Tier 2 (7) ships stubs day 1. User overrode the recommended monorepo for portfolio-of-products framing |
| [packages-14-atomic.md](./packages-14-atomic.md) | 14 atomic packages — drop `oriz-` prefix from `@chirag127/*` package names. firebase-init / auth-ui / contact-form / sidebar / family / config / theme / multi-search / footer / header / seo / analytics / consent / kit. Each does one thing; `/kit` re-exports |
| [tool-categories-roadmap.md](./tool-categories-roadmap.md) | Tier 1 (8 functional day 1): pdf, image, finance, dev, text, convert, qr, data. Tier 2 (7 stubs day 1): audio, video, seo, crypto, health, random, print. Tier 3 (15 named, all skipped): legal/music/chess/etc. Anti-list: bg-removers, AI image gen, free VPN, disposable email, URL shorteners, YT downloaders, crypto airdrop trackers |
| [sidebar-4-tier.md](./sidebar-4-tier.md) | Sidebar 4-tier hierarchy — Tier A auto (15 tool sites), Tier B longform (blog/me/journal/oriz-site sub-pages), Tier C catalog (books/ncert/cards), Tier D hub (oriz-site home). One `@chirag127/sidebar` component, four config presets |
| [cards-site-scope.md](./cards-site-scope.md) | `cards-site` = financial cards, India. Credit + debit + forex + prepaid + travel. Six page types (review/comparison/calculators/guides/tools/news) modeled after CardInsider/CardExpert/TechnoFino. Tier C catalog sidebar. Affiliate monetisation with mandatory disclosure. NOT flashcards |
| [journal-site-sources.md](./journal-site-sources.md) | `journal-site` mines features from all 5 reference apps: Day One (calendar+prompts+mood) + Bear (markdown-first) + Notion (blocks+slash+templates) + Obsidian (wikilinks+graph) + Logseq (outliner+block-refs). Manual creative writing = CONTENT (auto-only-tracking applies to METRICS only). Tier B longform sidebar |
| [omni-publish-v0-1-2-followups.md](./omni-publish-v0-1-2-followups.md) | 5 follow-ups deferred from `@chirag127/omni-publish` v0.1.1 → v0.1.2: per-repo per-day rate-limit cache (HIGH, no current dedup so workflow re-runs spam), retry on transient 5xx (MEDIUM), compile TS → `dist/` for non-bundler consumers (MEDIUM), Hashnode tag `_id` resolution (LOW), Threads single-user-token assumption validation (LOW) |
| [market-data-apis.md](./market-data-apis.md) | Two new India-market data APIs as standalone Cloudflare Workers — `flow-fii-dii.api.oriz.in` (NSE primary + Moneycontrol fallback, 24h KV cache) + `mmi.api.oriz.in` (Tickertape MMI mirror, 1h current / 24h history KV cache). Hono router, public CORS, no auth, separate KV per Worker, each gets own 100K/day free envelope per cf-worker-quota-mitigation step 4 |

## Cross-refs

- [architecture/index](../../architecture/index.md) — full architecture concept files
