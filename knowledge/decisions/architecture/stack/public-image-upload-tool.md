---
type: decision
title: "Public image-upload tool on image.oriz.in \u2014 gated by free/pro tier"
description: "Locked 2026-06-23. oriz-pixie-image-tools-app gets a public /upload\
  \ page using the 5-host replicate pipeline (Cloudinary + ImageKit + imgbb + freeimage\
  \ + GH Releases). Free tier: 5 uploads/day, requires sign-in + reCAPTCHA v3. Pro\
  \ tier: unlimited. Reuses lib/photos.ts from oriz-roam-journal-app. Durability promise:\
  \ best-effort only, no SLA \u2014 free tier compliance limits guarantees. Anonymous\
  \ users see paywall card."
tags:
- decision
- image-upload
- public
- pricing-tier
- image-cdn
- photos
- pixie-app
timestamp: 2026-06-23
format_version: okf-v0.1
status: active
related:
- decisions/architecture/content/journal-photo-pipeline
- decisions/architecture/security/monetization-centralized-on-oriz-in
- decisions/pricing/three-tier-free-pro-max
- runbooks/free-hosting-providers/image-cdn
---



# Public image-upload tool — gated by tier

## Scope

`image.oriz.in/upload` exposes the family's 5-host replicate pipeline as a public tool. User drops an image, gets back the URL(s). Powered by the same `lib/photos.ts` orchestration that journal-app uses.

## Tier gating

| Tier | Uploads/day | Sign-in | reCAPTCHA v3 | Notes |
|---|---|---|---|---|
| Anonymous | 0 | n/a | n/a | Sees paywall card with "Sign in to upload" CTA |
| Free | 5 | Required | Required | Quota tracked in Firestore (`users/{uid}.image_uploads_today`) |
| Pro | Unlimited | Required | Required | No quota check |
| Max | Unlimited | Required | Required | + extras: signed delete links, expiration settings |

## Why gated

- **Quota protection**: Cloudinary 25 credits/mo could burn through fast on anonymous traffic. ImageKit 20 GB cap. imgbb has no rate limit advertised but spammers will find it.
- **User data capture**: anonymous tools don't convert. Sign-in gate forces user record creation for analytics + upsell.
- **reCAPTCHA v3** filters bots without UX friction.
- **Pro tier upgrade path** lives at oriz.in/pricing per the centralized monetization decision.

## Durability promise

**Best-effort only.** Stated on the upload page: *"Images are mirrored across 5 free-tier hosts. We retain image URLs but cannot guarantee permanent availability. Keep your own backup of important originals."*

This is the lawyer-safe stance. Reasons:
- Free-tier TOS on every host can change without notice
- Cloudinary credits reset monthly; image storage isn't expiration-promised
- ImageKit 20 GB cap could be hit if a user-base grows
- imgbb has no stated retention promise
- freeimage.host TOS is light
- GH Releases is the only truly durable host (2 GB/asset, repo not abandoned)

If 2/5 hosts survive, the image is still served via first-200-wins read path. So practical durability is high, but **we promise nothing**.

## Implementation

Lives in `repos/oriz/own/prod/apps/tools/oriz-pixie-image-tools-app/`:
- `src/pages/upload.astro` — the public upload page
- Uses `import { uploadPhoto } from '@chirag127/oriz-image-pipeline'` (extracted from journal-app's lib/photos.ts into a shared npm package — TODO)
- reCAPTCHA v3 site key via `PUBLIC_RECAPTCHA_SITE_KEY` (already in .env)
- Firestore quota check: `getDoc(doc(db, 'users', uid))` → `image_uploads_today` field reset daily by Cloud Function or client-side timestamp comparison

## Upgrade flow

Free user hits 5/day cap → "Upgrade to Pro for unlimited uploads" → redirects to `oriz.in/pricing?app=pixie-image&return=https://image.oriz.in/upload`. Razorpay checkout on oriz.in. Tier updated in Firestore. Next refresh, user has unlimited.

## Cross-refs

- 5-host image pipeline → [[decisions/architecture/journal-photo-pipeline]]
- Centralized monetization → [[decisions/architecture/monetization-centralized-on-oriz-in]]
- 3-tier pricing → [[decisions/pricing/three-tier-free-pro-max]]
- Image CDN free tiers → [[runbooks/free-hosting-providers/image-cdn]]
