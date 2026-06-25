---
type: decision
title: "Zero in-house npm packages — analytics inlined per app"
description: All 23 in-house npm packages archived 2026-06-25. Apps hardcode <script> tags for CF Web Analytics + MS Clarity + PostHog in their BaseLayout.
tags: [npm, packages, analytics, clarity, posthog, cloudflare, no-card, donations-only]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
supersedes:
  - decisions/architecture/packaging/one-package-only-analytics-2026-06-25.md
related:
  - rules/build-gate-top3-must-have-defect
  - decisions/architecture/donations-only-no-pro-no-ads
  - rules/no-card-on-file
---

# Zero in-house npm packages — analytics inlined per app

## Decision

All 23 in-house npm packages are archived as of 2026-06-25. Zero survive on `oriz-org`. Analytics — the last surviving justification for a shared package — is now inlined into each app's `BaseLayout.astro` as 3 `<script>` tags (Cloudflare Web Analytics + Microsoft Clarity + PostHog), totalling ~4 lines per app. A wrapping npm package added pure ceremony and was reversed the same day it was locked.

## Analytics stack

| Tool | LOC | Free tier | Card? | Strength |
|---|---|---|---|---|
| Cloudflare Web Analytics | 1 | Unlimited | None | Real-time pageviews, no cookies |
| Microsoft Clarity | 1 | Unlimited | None | Heatmaps + session replay |
| PostHog Cloud | 3 | 1M events/mo | None | Funnels + retention |

## Why inline beat a package

- Analytics integration is 1-3 lines of `<script>` per tool — a wrapping npm package is pure ceremony.
- Per-app tokens already need to be configured anyway (env vars). A package doesn't simplify that.
- Astro doesn't need an SDK to inject `<script>` tags — `<script is:inline>` in a layout is the idiomatic answer.
- One-less-maintenance-thread per app (no semver coordination, no peer-dep DAG, no security patches to chase across consumers).

## Per-app integration template

```astro
---
// src/layouts/BaseLayout.astro
const { CF_BEACON, CLARITY_ID, POSTHOG_KEY, POSTHOG_HOST } = import.meta.env;
---
<script is:inline defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={`{"token":"${CF_BEACON}"}`}></script>
<script is:inline>(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",import.meta.env.CLARITY_ID);</script>
<script is:inline>!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep on onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
posthog.init(import.meta.env.POSTHOG_KEY,{api_host:import.meta.env.POSTHOG_HOST||"https://us.i.posthog.com"});</script>
```

Each app sets its own `CF_BEACON`, `CLARITY_ID`, and `POSTHOG_KEY` in `.env`. Different apps may use different tokens (per-app dashboards) or share (cross-app funnels) at the operator's discretion.

## Future package rule

Build a new in-house package ONLY when ALL three hold:

1. ≥3 apps need the same logic, AND
2. no community equivalent exists or fits, AND
3. maintenance cost (deps + security patches + version coordination) is justified by use count.

No pre-built SDK packages. No "this will be useful when we have 10 apps." No wrapper packages around `<script>` snippets.

## What got archived (final list)

All 23 below moved to `oriz-archive` on 2026-06-25. The `@oriz/*` npm slug reservations stay (v0.1.0 stubs prevent squatters); only the repos are archived.

| Package | Why this didn't survive |
|---|---|
| `astro-shell-npm-pkg` | Never imported by 2+ apps — each app's astro.config diverged anyway. |
| `astro-chrome-npm-pkg` | Header/sidebar/footer/SEO inline per app; each app's frontend-design pass makes shared chrome a misfit. |
| `astro-tools-npm-pkg` | Tools consolidated into category repos; no cross-repo `<ToolGrid>` consumer. |
| `astro-content-npm-pkg` | Zod schemas and RSS/Atom emit fit in each app's `src/lib/`; reused 0 times across apps. |
| `astro-data-npm-pkg` | Firebase init / Firestore helpers orphaned by no-auth + no-firebase-in-apps. |
| `astro-forms-npm-pkg` | react-hook-form + zod + shadcn Form — community deps cover this directly. |
| `astro-billing-npm-pkg` | Orphaned by donations-only (Razorpay killed; no paywall). |
| `astro-pwa-npm-pkg` | `@vite-pwa/astro` directly + 30 lines per app — no wrapper earns its keep. |
| `astro-distribute-npm-pkg` | PWABuilder is a CLI; thin wrapper added nothing. |
| `astro-widgets-npm-pkg` | `<MultiSearch>` / `<StatusBanner>` inline per app; no cross-repo consumer. |
| `astro-test-utils-npm-pkg` | Test fixtures copied per repo; the wrapper drift cost > the dedup payoff. |
| `auth-core-npm-pkg` | Orphaned by no-auth-in-apps-or-apis — login lives separately. |
| `auth-wxt-npm-pkg` | Same — no auth in extensions either. |
| `auth-vsc-npm-pkg` | Same — no auth in VS Code extensions. |
| `auth-cli-npm-pkg` | Same — no auth in CLIs. |
| `omni-publish-npm-pkg` | Cross-poster is a GH Action + Worker, not a client lib. |
| `oriz-book-build-npm-pkg` | Markua→Pandoc pipeline lives in the books repo; no second consumer. |
| `oriz-ai-providers-npm-pkg` | Narrowed to 2-shim experiment (freellmapi + omniroute); not a published lib. |
| `oriz-rate-limit-npm-pkg` | Orphaned by donations-only — no Free/Pro/Max tiers to enforce. |
| `oriz-seo-npm-pkg` | Per-app SEO inline; each frontend-design pass takes ownership of its head/meta. |
| `oriz-consent-npm-pkg` | Folded into analytics scripts — consent gating belongs with the trackers it gates. |
| `oriz-kit-npm-pkg` | Wordmark + brand tokens copied per repo; the kit umbrella never had a consumer. |
| `oriz-analytics-npm-pkg` | Reversed same day — analytics is 4 `<script>` lines per app; a wrapper was pure ceremony. |

The blog repo is grandfathered: it keeps its 4 `@chirag127/*` deps (archived packages remain installable from npm; only the source repos are archived).

## Cross-refs

- Prior decision (superseded) → [[decisions/architecture/packaging/one-package-only-analytics-2026-06-25]]
- Build-gate rule (now applied to packages too) → [[rules/build-gate-top3-must-have-defect]]
- Donations-only (killed billing/rate-limit packages) → [[decisions/architecture/donations-only-no-pro-no-ads]]
- No-card-on-file rule (constrained the analytics stack pick) → [[rules/no-card-on-file]]
- Memory pointer → `~/.claude/projects/c--D-oriz/memory/zero-in-house-packages-inline-analytics.md`
