---
type: decision
title: "Add 4 packages to family \u2014 oriz-rate-limit, oriz-analytics, oriz-seo,\
  \ oriz-consent (22 packages total)"
description: "Grilled 2026-06-22. Family expands from 18 to 22 packages. New packages:\
  \ (1) oriz-rate-limit \u2014 Free/Pro/Max tier usage caps across apps (10/100/unlimited\
  \ PDF merges etc.); (2) oriz-analytics \u2014 single wrapper around CF Web Analytics\
  \ + GA4 + Microsoft Clarity + Sentry (one init call per app); (3) oriz-seo \u2014\
  \ sitemap + IndexNow + JSON-LD + OG image generator; (4) oriz-consent \u2014 Klaro\
  \ consent manager pre-configured for EU/UK + India DPDP + US GPC. Each replaces\
  \ inlined per-app code."
tags:
- decision
- packages
- expansion
- 22-packages
- rate-limit
- analytics
- seo
- consent
timestamp: 2026-06-22
format_version: okf-v0.1
status: superseded
superseded_by: decisions/architecture/packaging/one-package-only-analytics-2026-06-25
supersedes: architecture/the-23-packages (count update only)
related:
- architecture/packages/the-23-packages
- services/family-inventory
- decisions/pricing/three-tier-free-pro-max
- decisions/architecture/ops/seo-a11y-cdn-ssl
- decisions/security/consent-management-multi-category
---



# 4 new packages → 22 total

**SUPERSEDED 2026-06-25** by [[decisions/architecture/packaging/one-package-only-analytics-2026-06-25]]. The 22-package model archived; only `oriz-analytics-npm-pkg` survives.

## New packages

### 1. `@chirag127/oriz-rate-limit`

**Purpose:** Per-user, per-app usage caps enforcing Free / Pro / Max tier limits (10/100/unlimited PDF merges, image conversions, AI completions, etc.).

**Surface:**
```ts
import { rateLimit } from '@chirag127/oriz-rate-limit';

const result = await rateLimit.check({
  userId,
  action: 'pdf.merge',
  tier: 'free',  // from Firestore subscription
});
if (!result.allowed) throw new RateLimitError(result.resetAt);
```

**Storage:** Firestore `users/{uid}/usage/{action-YYYY-MM-DD}` doc counters. Daily reset.

**Tier defaults:**
```ts
const limits = {
  free: { 'pdf.merge': 10, 'image.convert': 10, 'ai.complete': 10 },
  pro:  { 'pdf.merge': 100, 'image.convert': 100, 'ai.complete': 50 },
  max:  { 'pdf.merge': Infinity, 'image.convert': Infinity, 'ai.complete': Infinity },
};
```

### 2. `@chirag127/oriz-analytics`

**Purpose:** Single wrapper around Cloudflare Web Analytics + GA4 + Microsoft Clarity + Sentry. One init call per app.

**Surface:**
```ts
import { analytics } from '@chirag127/oriz-analytics';

analytics.init({
  app: 'oriz-paisa-finance-tools-app',
  ga4: process.env.PUBLIC_GA4_MEASUREMENT_ID,
  clarity: process.env.PUBLIC_CLARITY_PROJECT_ID,
  cfBeacon: process.env.PUBLIC_CF_BEACON_TOKEN,
  sentryDsn: process.env.PUBLIC_SENTRY_DSN,
});

analytics.track('pdf.merge', { pages: 5 });
```

Klaro consent gating built in (per consent rule).

### 3. `@chirag127/oriz-seo`

**Purpose:** Sitemap + IndexNow auto-submission + JSON-LD per page-type + OG image generator (satori).

**Surface:**
```astro
---
import { SEO } from '@chirag127/oriz-seo';
---
<SEO
  title="My PDF Slicer"
  description="..."
  type="WebApplication"
  ogImage={generated}
/>
```

Build-time: writes per-app `sitemap.xml`; family-wide `sitemap-index.xml` aggregates.

### 4. `@chirag127/oriz-consent`

**Purpose:** Klaro consent manager pre-configured for EU/UK (default-DENIED), India DPDP (banner with India copy), US GPC honor, ROW (no banner). Geo-routed via CF.

**Surface:**
```astro
---
import { ConsentBanner } from '@chirag127/oriz-consent';
---
<ConsentBanner services={[...]} />
```

5-category Klaro config baked in (per existing decision).

## Updated count

**Total packages: 22** (was 18 → +4)

| Old 18 | + New 4 |
|---|---|
| astro-shell, astro-chrome, astro-tools, astro-content, astro-data, astro-forms, astro-billing, astro-pwa, astro-distribute, astro-widgets, astro-test-utils, auth-core, auth-wxt, auth-vsc, auth-cli, omni-publish, oriz-book-build, oriz-ai-providers | oriz-rate-limit, oriz-analytics, oriz-seo, oriz-consent |

## Migration plan

For each new package:
1. `gh repo create chirag127/<slug>-npm-pkg --public --license MIT --description "..."`
2. Scaffold per `oriz-app-template` for packages (or hand-scaffold)
3. Initial v0.1.0 stub publish to npm (reserve the slug)
4. Add as submodule under `repos/oriz/own/lib/npm/`
5. Real implementation in v0.2.0 once consumed by a real app

## Cross-refs

- Now `the-22-packages.md` (rename from `the-23-packages.md` after migration completes)
- Three-tier pricing (rate-limit enforces tiers) → [[decisions/pricing/three-tier-free-pro-max]]
- SEO decision → [[decisions/architecture/seo-a11y-cdn-ssl]]
- Consent management → [[decisions/security/consent-management-multi-category]]
- Family inventory → [[services/family-inventory]]
