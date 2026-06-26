---
type: decision
title: "Cloudflare Pages hosts every website and app"
description: "Every website AND every app in the family hosts on Cloudflare Pages. No exceptions. GitHub Pages is the per-site survival mirror only. Firebase Hosting / Vercel / Netlify / Render / Fly all rejected. Decision tightened 2026-06-21."
tags: [hosting, cloudflare-pages, superseded]
timestamp: 2026-06-21
format_version: okf-v0.1
status: superseded
superseded_by: cloudflare-pages-apps-only
---

User direction 2026-06-21: "every website or app will be hosted on cloudflare pages only."

This widened the prior "all sites + extensions catalog → CF Pages" lock to also cover every entry under `projects/apps/content/`, `projects/apps/tools/`, `projects/apps/hub/`, `projects/apps/personal/`. The scope is no longer ambiguous.

**How to apply:**
- New site/app scaffold: `wrangler.toml` with `name = "<slug>"`, `compatibility_date`, `[assets] directory = "./dist"`.
- Deploy: `pnpm wrangler pages deploy dist` (or via master matrix workflow).
- DNS: `*.oriz.in` subdomain → CNAME → `<slug>.pages.dev`, proxied through Cloudflare DNS free.
- Server logic stays in `apps/api/` (Hono Worker umbrella), never on a second hosting provider.
- If a new feature seems to need server hosting (Render, Fly, Railway): that's a wrong shape — refactor toward the Worker umbrella or a static + Worker split.

Related: [`no-card-on-file-prepaid-escape`](../../../rules/interaction/no-card-on-file-prepaid-escape.md), [`twenty-two-packages-on-npm`](./twenty-two-packages-on-npm.md).
