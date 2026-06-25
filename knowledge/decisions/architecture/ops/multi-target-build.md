---
type: decision
title: "Family deploy architecture \u2014 DNS, gating, releases, dashboards"
description: "Per-app GH Actions workflow: main \u2192 prod, PR \u2192 preview subdomain,\
  \ tags \u2192 APK + EXE. DNS auto-provisioned on first deploy. Single Sentry project\
  \ tagged by site. Per-app sitemaps + apex sitemap-of-sitemaps. Allow-all robots.txt\
  \ with /admin disallow. Single aggregate dashboard at home-app/admin. PostHog feature\
  \ flags. Giscus comments with GH-native moderation. AdSense Auto Ads everywhere\
  \ except me + home."
tags:
- architecture
- deploy
- ci
- dns
- sentry
- sitemap
- robots
- dashboard
- posthog
- comments
- monetization
timestamp: 2026-06-21
format_version: okf-v0.1
status: superseded
superseded_by: decisions/architecture/infrastructure/hosting-split-cf-and-gh-2026-06-25.md
related:
- decisions/branding/naming-policy-v6
- decisions/architecture/ops/release-cadence
- decisions/architecture/ops/analytics-five-tier-stack
- decisions/monetisation/adsense-apex-application
---

> **Superseded 2026-06-25** — see [hosting-split-cf-and-gh-2026-06-25](../infrastructure/hosting-split-cf-and-gh-2026-06-25.md). Reasoning preserved below for audit.

# Family deploy architecture

## DNS auto-provisioning

Each `-app` repo's GH Actions workflow checks Cloudflare on first push:
if `<subdomain>.oriz.in` CNAME doesn't exist, the workflow creates it
pointing at `<repo>.pages.dev`. Uses `CLOUDFLARE_API_TOKEN` org secret.
Self-healing — missing DNS records get auto-provisioned.

```yaml
# .github/workflows/deploy.yml (per app)
- name: Ensure DNS record
  run: |
    curl -X POST "https://api.cloudflare.com/client/v4/zones/${{ secrets.CF_ZONE_ID }}/dns_records" \
      -H "Authorization: Bearer ${{ secrets.CLOUDFLARE_API_TOKEN }}" \
      -H "Content-Type: application/json" \
      -d '{"type":"CNAME","name":"${{ inputs.subdomain }}","content":"${{ inputs.repo }}.pages.dev","proxied":true}' \
      || echo "DNS record exists or create failed (idempotent)"
```

## Deploy gating

| Branch / event | Target | Subdomain |
|---|---|---|
| Push to `main` | Cloudflare Pages production | `<subdomain>.oriz.in` |
| PR opened | Cloudflare Pages preview | `<pr-num>.<subdomain>.oriz.in` |
| Tag `v*.*.*` | Production + APK + EXE | `<subdomain>.oriz.in` + GH release artifacts |

Tag protection via GitHub branch ruleset: only the org owner can push
tags matching `v*.*.*`.

## Family-wide package updates

When any npm package bumps version, workspace umbrella's cron runs
`pnpm update --recursive` and opens ONE PR per consumer submodule
(~24 PRs). Manual merge per app.

Trigger: weekly cron OR npm publish webhook.

## npm publish automation

Changesets-based:
1. PR includes `pnpm changeset` declaring version bumps + changelogs.
2. On main merge, `changesets/action` publishes any bumped packages to
   npm + creates GH releases.
3. Uses `NPM_TOKEN` org secret.

Family-wide one workflow at the workspace umbrella covers all 25
npm-pkg repos.

## Sentry single project

ONE Sentry project covers the entire family. All apps share
`PUBLIC_SENTRY_DSN`. Each error tagged by `site_name` from
`src/config/site.ts`. Free plan: 5K errors/month total across family.

Spike Protection ON to cap at 5K/mo.

## Sitemaps

- Each app emits its own `/sitemap.xml` via `@astrojs/sitemap`.
- The apex (`home-app`) emits `/sitemap-of-sitemaps.xml` listing every
  subdomain's sitemap.
- Submit only the apex sitemap-of-sitemaps to Google Search Console +
  Bing Webmaster.

## Robots.txt

Per-app `/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /signin
Disallow: /preview

Sitemap: https://<subdomain>.oriz.in/sitemap.xml
```

Apex robots.txt additionally references `/sitemap-of-sitemaps.xml`.

## Image CDN

Per `decisions/architecture/image-cdn-fallback-chain.md`:
Cloudflare Images → wsrv.nl → ImageKit fallback. astro-chrome's
`<Image>` wraps this. App icons + screenshots committed to repo are
served as-is from CF Pages (no CDN chain needed for repo assets).

## Push notifications

Per `decisions/architecture/notifications-fcm-plus-knock.md`:
Knock orchestrates, FCM transports web push. Each app has its own
Firebase Messaging registration. Per-app trigger via Knock workflow.

## AdSense placement

AdSense Auto Ads enabled on every app EXCEPT `me-app` + `home-app`.
Google decides placement at runtime; no ad-slot divs in markup per
`rules/no-ad-slots-in-markup.md`. Banner ads above the fold disabled.

## A/B testing

PostHog feature flags + experiments. Variants in code via
`useFeatureFlag('experiment-name')`. PostHog dashboard for results.
Free tier covers solo dev usage.

## Comment moderation

Giscus backed by GitHub Discussions on chirag127/<repo>. Spam filter =
GitHub's. Moderation = `gh discussion close` or block user. No third-
party spam service.

## Analytics dashboard

Single aggregate dashboard at `home-app/admin` (auth-gated, only the
owner can view). Reads from all 5 analytics tools' APIs + shows
per-app and family-wide cards. Built once in astro-chrome, available
on every app's `/admin` route as a small embedded widget.

## Forks

Forks always keep the upstream slug — both locally and on the
remote. Local submodule path mirrors upstream slug. No `-fork` suffix.
Upstream attribution stays unambiguous; rename only happens if the
fork diverges hard enough to become a distinct product (rare).

## Tool UX, history, cross-app sync

- **Tool sites lazy-load WASM** only when the island mounts. Per-tool
  dynamic `import()`; no top-level WASM in the page bundle. WASM payload
  doesn't ship until the user actually engages the tool.
- **Tool `/history`** is a metadata-only operation log. No file
  storage; only the recipe of "tool X, params Y, at time Z." Firestore
  for signed-in users, `localStorage` for guests. `/history` page on
  every tool app shows the last 50 ops as cards; click a card to
  re-run with the same params.
- **Cross-app Firestore sync** via the single Firebase project.
  Family-wide sync — sign in on one app, preferences + history
  available on all apps.
- **Firestore layout**: single project, subcollections per data
  type — `users/<uid>/operations/`, `users/<uid>/preferences/`,
  `users/<uid>/profile/`. Operations are the op-log entries;
  preferences are theme / units / locale; profile is the optional
  public profile payload.

## Sign-in monetization, public profiles, content

- **Sign-in removes ads** (donations expected instead). Logged-out
  visitors are monetized by AdSense Auto Ads; logged-in users are
  monetized by donations only. No ad slots render when an auth
  session is present.
- **Public profile** at `oriz.in/u/<username>`, opt-in. Drives
  organic growth via shareable profile cards (tool usage badges,
  donation-supporter badges, custom bio). Profile payload lives at
  `users/<uid>/profile/`.
- **English-only v1**. i18n via Weblate stays deferred per
  `decisions/branding/i18n-weblate-when-ready.md`.
- **Hand-written SEO content** per tool page (300-500 words each).
  ~80 tools × ~400 words = ~32K words. NOT AI-generated. Search
  ranking + user trust both reward original copy.
- **Per-tool OG image** via Satori at build time, edge-cached.
  ~80 OG images, generated once per release, cached at the CF edge.
- **Full offline after first visit.** Service worker caches the
  tool + its WASM. `<meta name="offline-capable" content="true">` for
  crawlers / browser hints. Every tool is install-and-go.

## Registrar + domain posture

- **Spaceship registrar.** No registrar swap; oriz.in stays on Spaceship.
- **Stick with `oriz.in` only** — don't buy `oriz.app`. One apex,
  many subdomains.

## Home vs me role split, CV link, support modal

- **`home-app` (oriz.in)** = personal bio FIRST + tools/apps grid
  SECOND. Bio leads; apps grid follows.
- **GitHub Sponsors** enrolled as one of N donation rails alongside
  Buy Me a Coffee, Liberapay, Open Collective, Polar, Razorpay,
  Lemon Squeezy.
- **Two sites, role split**: `home` = brand + bio + grid;
  `me` = lifelog. `me` is still one site with internal sections
  (see [`oriz-me-single-site-not-split`](../general/oriz-me-single-site-not-split.md)) —
  the home/me boundary is sharp.
- **Home hero gets an explicit "See my full work" CV button**
  linking to `me.oriz.in/cv`. One click from apex to long-form CV.
- **Subtle BottomBar "support" link** opens a modal listing all
  donation rails. No standalone `/support` page on every site — the
  modal is the surface.

## Email, observability, artifact hosting

- **Cloudflare Email Routing + Gmail.** `chirag@oriz.in` / `security@oriz.in` /
  `abuse@oriz.in` all route to the personal Gmail inbox.
- **Single Sentry DSN env-var** with `site_name` tag. One project,
  family-wide, tagged by site for filtering.
- **GH Releases as artifact host**: `.apk` + `.exe` + `dist.zip` +
  sourcemaps. Per-app, per-tag. No separate artifact CDN; releases are
  the canonical archive.
- **GH Actions free tier** (2000 min/mo on public repos). All
  family repos are public per the OSS posture, so CI minutes are free.

## Release cadence + hot-fix + versioning + changelog

Captured in full at [`release-cadence`](./release-cadence.md).

- **Weekly release train cadence — Wednesday.**
- **Wednesday 9 AM IST cron** triggers tag + release of changed
  apps (skip unchanged).
- **Hot-fix** via `[hotfix]` in commit message — bypasses the
  weekly train, immediate deploy.
- **CalVer per app** (`v2026.06.21`). Year.month.day from the tag
  date; multiple releases on the same day get a `.N` suffix.
- **git-cliff auto-changelog** from conventional commits. Runs in
  the release workflow; no hand-written changelogs.

## Design surface, browser support, a11y/perf gates

- **`body[data-app]` CSS hook** for future per-app differentiation.
  Default: family looks identical (per the Oriz Datasheet Dark design
  system). The hook is reserved for the day an app needs to deviate
  (e.g. a finance app with green/red semantic colours).
- **Browser support** = last 2 versions of Chrome / Firefox /
  Safari / Edge. Build target derives from this support matrix.
- **Mobile-first responsive design** (375px+ first). Desktop
  treatments are progressive enhancements.
- **Lighthouse CI on every PR**, fails below WCAG 2.2 AA + LH ≥ 95
  a11y + LH ≥ 80 perf. PR cannot merge if any threshold fails.

## CF Worker quota is account-wide, NOT per-Worker

Cloudflare Workers' free-tier 100K requests/day quota is **shared
account-wide across all Workers**, not per-Worker. Adding more
`-worker` repos does not multiply the quota ceiling. They all draw
from the same 100K/day pool.

What IS isolated on the free tier:
- **CF Pages builds**: 500/month **per project** → 15 projects = 7,500
  builds/month effective ceiling (real isolation).
- **CF Pages file count**: 20,000 files **per project**.
- **CF Pages bandwidth + requests**: unlimited account-wide.

What is NOT isolated:
- **CF Worker requests**: 100K/day account-wide.
- **CF Worker CPU time**: 10ms/request, account-wide CPU pool.
- **CF Pages concurrent builds**: 1 at a time across the whole account.

**Implication**: stay with a single family Worker at `api.oriz.in` per
`hono-worker-api-umbrella.md`. Per-app Workers buy nothing on the
quota axis; they only add operational complexity.

## "No subscriptions" rule applies to developer side only

The `monetisation/no-subscriptions-anywhere.md` constraint binds:

- **Developer → service provider** subscription: forbidden (the rule).
- **App → end user** subscription: allowed and encouraged (revenue).

Apps can ship Google-style Free / Pro / Ultra / Max subscription tiers
to their users via Razorpay / Lemon Squeezy. See
[`monetisation/no-subscriptions-anywhere.md`](../../monetisation/no-subscriptions-anywhere.md)
§ Scope clarification.

## Games + kids-games suffixes

Two suffix categories alongside the app family:

- **`-game`** — adult / general-audience games. Multi-target (web + PWA + APK + EXE via Phaser 3). AdMob standard ads on free tier; one-time-unlock paid tier.
- **`-kids-game`** — COPPA + DPDP-Children + Play Families compliant. AdMob Kids-Approved ads only; no PII analytics (Sentry errors only, no PostHog / Clarity / GA4). No auth required (anonymous play). One-time unlock paid tier (no subscriptions per Play Families).

## Play Store enrollment

Play Store enrollment fee ($25 Google Play Developer) paid as a one-time
exception. Currently in Play Store verification. See
[`rules/no-card-on-file.md`](../../../rules/interaction/no-card-on-file.md) § One-time
fees paid.

## Cross-refs

- [decisions/architecture/release-cadence](./release-cadence.md)
- [decisions/branding/naming-policy-v6](../../branding/naming-policy-v6.md)
- [decisions/architecture/analytics-five-tier-stack](./analytics-five-tier-stack.md)
- [decisions/architecture/oriz-me-single-site-not-split](../general/oriz-me-single-site-not-split.md)
- [decisions/monetisation/adsense-apex-application](../../monetisation/adsense-apex-application.md)
- [decisions/architecture/notifications-fcm-plus-knock](../general/notifications-fcm-plus-knock.md)
- [rules/keep-knowledge-fresh](../../../rules/agent/keep-knowledge-fresh.md)
