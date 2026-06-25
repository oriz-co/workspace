---
type: index
title: Stack
description: Index of concepts in decisions/architecture/stack.
tags:
- index
- stack
timestamp: '2026-06-24'
format_version: okf-v0.1
status: active
---

# Stack

## Concepts

- [Accessibility — three-tool stack (axe + Pa11y + Lighthouse CI)](./a11y-three-tools.md) — Every PR runs axe-core, Pa11y, and Lighthouse CI in parallel. PR fails on any new a11y violation in any tool. Each tool catches a different category.
- [Code quality — 5-tool stack (Sonarcloud + CodeRabbit + Codecov + Code Climate + DeepSource)](./code-quality-five-tools.md) — Locked 2026-06-20: every public repo runs five complementary code-quality tools. Sonarcloud (SAST + smells), CodeRabbit (LLM PR review), Codecov (coverage delta), Code Climate (A — F maintainability), DeepSource (autofix). All five free for the family's public / OSS repos. Builds on the earlier 4-tool stack — adds Codecov + Code Climate + DeepSource alongside the existing Dependabot + biome + CodeRabbit + Sonarcloud.
- [Family stack lock — Astro 6 + React 19 islands + Tailwind v4 + pnpm + Biome](./family-stack-lock.md) — Same stack on every site (longform / catalog / hub / tool). Static output. CF Pages for monetised sites; GH Pages for info-only sites where the product is monetised elsewhere.
- [Newsletter on Substack — single family newsletter, free tier, 10% if paid](./newsletter-substack.md) — Single newsletter for the whole oriz family at chirag127.substack.com (or brand-aligned name). Free tier; Substack takes 10% if a paid tier ever ships. ONE newsletter, NOT per-app. Daily blog feed + weekly digest + book drop announcements. Embed signup form on home-app + every content app footer. Replaces the earlier Buttondown + EmailOctopus split.
- [Public image-upload tool on image.oriz.in — gated by free/pro tier](./public-image-upload-tool.md) — Locked 2026-06-23. oriz-pixie-image-tools-app gets a public /upload page using the 5-host replicate pipeline (Cloudinary + ImageKit + imgbb + freeimage + GH Releases). Free tier: 5 uploads/day, requires sign-in + reCAPTCHA v3. Pro tier: unlimited. Reuses lib/photos.ts from oriz-roam-journal-app. Durability promise: best-effort only, no SLA — free tier compliance limits guarantees. Anonymous users see paywall card.
- [Observability, AI, search, auth, DB stack (Q3 2026 lock)](./stack-picks-2026-06-22.md) — Cross-cutting service picks locked on 2026-06-22. AI: `@chirag127/oriz-ai-providers` (20-provider fallback chain — OVHcloud / LLM7 / Pollinations anonymous first, then Cerebras / Groq / NIM / OpenRouter / etc keyed) — see decisions/architecture/oriz-ai-providers-package. Search: Pagefind for static + Algolia free hybrid. Errors: Sentry free + OSS tier apply. Uptime: UptimeRobot free 50 monitors. Auth: Firebase Auth (Spark). DB: Firestore only. I18n: English-only v0 + Crowdin OSS community translations. Privacy: single family-wide /privacy page. Cookie consent: Klaro EU + DPDP India geo-route.
- [Tool categories roadmap — Tier 1 + Tier 2 + anti-list](./tool-categories-roadmap.md) — The locked list of 15 tool subdomains: 8 Tier 1 (ship working day 1) + 7 Tier 2 (stub day 1, fill in later). Tier 3 is explicitly skipped. Anti-list captures categories deliberately rejected (URL shorteners, AI image gen, etc.).
- [Tool app feature scopes (locked 2026-06-22 — full client-side feature sets per app)](./tool-feature-scopes-2026-06-22.md) — Final feature scope per tool app. All tools are 100% client-side (no server, no upload). Heavy features deferred to v1+ where bundle size would blow budget. Per-app feature list grilled and locked 2026-06-22.
- [Tools shape + priority — 16 single-purpose subdomains, locked ship order](./tools-shape-and-priority.md) — 16 tool apps, each at its own *.oriz.in subdomain (paisa, slice, scribe, pixie, grid, forge, shift, dice, cipher, paper, vitals, rank, reel, echo, pivot + remainder). Anonymous-first auth. Free + opt-in sponsor footer. Affiliate allowed only where ethically clean (Amazon book links on scribe-text; NOT on health tools). Locked ship priority for Wave 2.
- [Tools shipped as 15 separate repos, one per subdomain](./tools-site-15-repos.md) — Each tool category is its own GitHub repo (pdf-site, image-site, ...) deployed to its own Cloudflare Pages project at <category>.oriz.in. No tools-site monorepo. Picked over 'one repo, 15 subdomain builds' for portfolio framing and SEO concentration.
