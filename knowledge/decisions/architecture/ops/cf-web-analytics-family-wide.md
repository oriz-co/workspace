---
type: decision
title: "Cloudflare Web Analytics on every public surface \u2014 single SITE_TAG family-wide"
description: 'Locked 2026-06-23. The existing CF_WEB_ANALYTICS_SITE_TAG (4c365cb8a8b3498b90238196fdfcb7ef)
  covers ALL family domains: the 26 apps on CF Pages, the 19 APIs'' docs/HTML landing
  pages on GitHub Pages, and any package/book/skill landing page. APIs JSON-only responses
  are NOT instrumented (no HTML to beacon). Single site_tag family-wide per Rule 15
  (shared-tenant-by-default); apps separated via the CF Web Analytics ''Hostname''
  filter.'
tags:
- decision
- analytics
- cloudflare-web-analytics
- instrumentation
- single-tenant
timestamp: 2026-06-23
format_version: okf-v0.1
status: active
related:
- decisions/architecture/ops/analytics-five-tier-stack
- rules/infrastructure/shared-tenant-by-default
- rules/infrastructure/cloudflare-pages-apps-only
- services/analytics/cloudflare-web-analytics
---



# Cloudflare Web Analytics — single SITE_TAG family-wide

## Scope

Every public landing page in the family gets the CFWA beacon. ONE site_tag covers all of them; the dashboard filters by hostname.

## What gets instrumented

| Surface | Instrumented? | Why |
|---|---|---|
| 26 CF Pages apps | YES | All HTML pages of every app's chrome get the beacon via astro-shell injection |
| 19 API repo docs (`docs/index.astro` → GH Pages HTML) | YES | The landing page HTML gets the beacon |
| 19 API JSON endpoints (`data/*.json` etc.) | NO | JSON has no HTML beacon target; bloating responses with a script tag breaks content-type |
| npm package landing pages on GH Pages | YES | HTML pages where the user lands when clicking a package link |
| Books on GH Pages | YES | HTML landing page |
| Skills (private repos) | NO | No public landing |
| Forks (under repos/oriz/frk/) | NO | Not user-facing |

## Implementation

### CF Pages apps (26)
Inject the beacon snippet into the shared chrome layout (`@chirag127/astro-shell` `<BaseLayout>` or `<HeadCommon>`). Read from `import.meta.env.PUBLIC_CF_WEB_ANALYTICS_SITE_TAG`. One change → all 26 apps get it on next deploy.

```astro
---
const siteTag = import.meta.env.PUBLIC_CF_WEB_ANALYTICS_SITE_TAG
const enable = import.meta.env.PUBLIC_ENABLE_CF_WEB_ANALYTICS !== 'false'
---
{enable && siteTag && (
  <script defer src="https://static.cloudflareinsights.com/beacon.min.js"
    data-cf-beacon={`{"token": "${siteTag}"}`}></script>
)}
```

### GH Pages sites (APIs docs, packages, books)
Each repo's `docs/index.astro` (or `index.html`) gets the same snippet hardcoded with the site_tag value (or reads from a build-time env var if Astro). No JSON responses are touched.

## Single SITE_TAG (not 1-per-site)

CFWA dashboard groups all traffic under one site_tag but lets you filter by hostname. So:
- One dashboard to monitor 80+ surfaces
- Cross-app traffic comparison trivial
- New apps don't need a new site_tag — just match against `*.oriz.in`

This matches Rule 15: shared-tenant-by-default.

## Env vars

Already in `.env` and `.env.example`:
```
CF_WEB_ANALYTICS_SITE_TAG=4c365cb8a8b3498b90238196fdfcb7ef
CF_WEB_ANALYTICS_TOKEN=82d9ab85d9024cc8b475b9ebda03249f
```

Need to add:
```
PUBLIC_CF_WEB_ANALYTICS_SITE_TAG=4c365cb8a8b3498b90238196fdfcb7ef  # client-readable copy
PUBLIC_ENABLE_CF_WEB_ANALYTICS=true                                # kill-switch per Rule 1
```

## Killswitches

`PUBLIC_ENABLE_CF_WEB_ANALYTICS=false` disables the beacon. Per the 5-tier analytics decision, every layer has an independent kill-switch.

## Cross-refs

- 5-tier analytics → [[decisions/architecture/analytics-five-tier-stack]]
- Shared-tenant → [[rules/shared-tenant-by-default]]
- CF Pages apps-only → [[rules/cloudflare-pages-apps-only]]
- CFWA service profile → [[services/analytics/cloudflare-web-analytics]]
