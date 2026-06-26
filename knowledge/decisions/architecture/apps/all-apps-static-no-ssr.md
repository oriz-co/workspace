---
type: decision
title: "All apps static — no SSR"
description: "All 6 surviving apps are `output: 'static'` Astro builds. Cloudflare Pages SSR deprecation (March 2026) doesn't affect us."
tags: [astro, static, ssr, cloudflare-pages]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
---

All 6 surviving apps in the post-scope-cut fleet are static Astro builds (`output: 'static'` in `astro.config.mjs`).

**The 6 apps:** blog, journal, me, oriz-ncert-app, oriz-lore-app, oriz-janaushdhi-app.

**Why this matters:**
- `@astrojs/cloudflare@13` (March 2026) dropped Cloudflare Pages SSR support. SSR users had to migrate to Cloudflare Workers as standalone deployments.
- Since we're static-only, that break is irrelevant. CF Pages serves our static HTML/CSS/JS directly. No adapter at all.
- The locked hosting decision (`hosting-split-cf-and-github-pages`) stands without revision.

**When to revisit:** if any future app genuinely needs SSR (e.g. server-rendered authenticated pages — which won't happen given `no-auth-in-apps-or-apis`, or per-user dynamic data — which also doesn't apply to donations-only public tools). Until that day comes, static stays the rule.

**Related:**
- [`hosting-split-cf-and-github-pages`](../infrastructure/hosting-split-cf-and-github-pages.md) — CF Pages for apps; static output assumed.
- [`no-auth-in-apps-or-apis-2026-06-25`](../security/no-auth-in-apps-or-apis-2026-06-25.md) — no authenticated server-rendered pages.
- [`scope-cut-2026-06-25`](../fleet/scope-cut-2026-06-25.md) — only the static apps survived; the SSR-curious ones (status, packages catalog) were archived.
