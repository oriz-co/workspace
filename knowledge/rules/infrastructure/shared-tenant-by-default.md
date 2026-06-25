---
type: rule
title: Shared-tenant-by-default for every 3rd-party service
description: "Locked 2026-06-22 evening. For every 3rd-party SaaS (Sentry / GA4 /\
  \ Microsoft Clarity / PostHog / UptimeRobot / Algolia / etc.) create ONE tenant\
  \ family-wide. Apps separate via tags / labels / custom-dimensions / project-properties.\
  \ NEVER create per-app accounts/projects when a tag-based shared tenant works. Prevents\
  \ N\xD7M signup burden (26 apps \xD7 8 services = 208 manual setups \u2192 8 setups)\
  \ and consolidates billing/limits."
tags:
- rule
- shared-tenant
- third-party
- observability
- no-per-app-projects
- scale
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- rules/security/org-level-secrets-only-no-per-repo
- rules/interaction/never-hit-quotas
- rules/interaction/no-card-on-file
- decisions/architecture/stack/stack-picks-2026-06-22
---



# Shared-tenant-by-default for every 3rd-party service

## Rule

For every 3rd-party SaaS service (Sentry, GA4, Microsoft Clarity, PostHog, UptimeRobot, Algolia, Substack, Stripe, Razorpay, Paddle, Cloudinary, ImageKit, etc.) the family uses **ONE tenant**. Apps separate by **tag / label / custom-dimension / project-property**, NOT by per-app account.

NEVER create per-app accounts/repos/properties when a tag-based shared tenant achieves the same separation.

## Why

- 26 apps × ~10 SaaS services = 260 per-app accounts → 260 manual signups + 260 env vars + 260 KYC checks → impossible at our scale
- Shared tenant: 10 signups + 10 env vars + 10 KYC checks. Linear cost.
- Most SaaS bill on usage (events / requests / sessions) not on project count → no economic reason to split
- Free tiers typically apply to the TENANT, not the project — shared tenant = full free tier across all apps

## Implementation per service

| Service | Shared tenant | Separation by |
|---|---|---|
| **Sentry** | 1 project for entire family | `tags: { app: '<slug>' }` set in @chirag127/oriz-analytics init |
| **GA4** | 1 property | `app_slug` custom dimension on every event |
| **Microsoft Clarity** | 1 project | `app: <slug>` session-mask via `clarity('set', 'app', slug)` |
| **PostHog** (if adopted) | 1 project | `$lib_app` property |
| **UptimeRobot** | 1 account | monitor name = `<app>:<endpoint>` |
| **Algolia** | 1 application | separate INDEXES per app |
| **CF Web Analytics** | already auto-aggregated by zone | n/a |
| **Substack** | 1 newsletter | tags within posts |
| **Razorpay** | 1 merchant account | webhooks identify app via `notes.app` |
| **Cloudinary** | 1 account | folder-per-app |

## Apply via @chirag127/oriz-analytics

The analytics wrapper package handles the tag-injection automatically. Every app calls:

```ts
import { analytics } from '@chirag127/oriz-analytics';

analytics.init({
  app: 'oriz-paisa-finance-tools-app',  // ← single param; auto-tags all events
});

analytics.track('pdf.merge', { pages: 5 });
// Sentry: { app: 'oriz-paisa-finance-tools-app', event: 'pdf.merge', pages: 5 }
// GA4: app_slug = 'oriz-paisa-finance-tools-app', event_name = 'pdf.merge'
// Clarity: app set to 'oriz-paisa-finance-tools-app' for this session
```

One init call. Zero per-app account setup.

## env vars

ONE set of env vars family-wide:

```
SENTRY_DSN=...                        # ONE Sentry project DSN
PUBLIC_GA4_MEASUREMENT_ID=G-...       # ONE GA4 measurement ID
PUBLIC_CLARITY_PROJECT_ID=...         # ONE Clarity project ID
PUBLIC_POSTHOG_KEY=...                # ONE PostHog project (if adopted)
PUBLIC_ALGOLIA_APP_ID=...             # ONE Algolia app
PUBLIC_ALGOLIA_SEARCH_KEY=...
RAZORPAY_KEY_ID=...                   # ONE Razorpay merchant
...
```

Set once. Synced via env-sync to all repos. Apps consume via `process.env.SENTRY_DSN` etc.

## Exception: legitimate per-app separation

If two apps have legally-incompatible data (e.g. one is GDPR-strict EU-only, the other is India-only DPDP) → separate Sentry projects MAY be justified. Document the carve-out in the per-app knowledge folder.

Default = shared. Per-app = exceptional.

## Cross-refs

- Org-level secrets rule → [[rules/org-level-secrets-only-no-per-repo]]
- Never hit quotas → [[rules/never-hit-quotas]]
- No card on file → [[rules/no-card-on-file]]
- Stack picks → [[decisions/architecture/stack-picks-2026-06-22]]
