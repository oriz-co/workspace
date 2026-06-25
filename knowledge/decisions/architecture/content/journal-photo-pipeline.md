---
type: decision
title: "Journal photo pipeline \u2014 4-host replicate-everywhere"
description: oriz-roam-journal-app uploads photos to four free hosts in parallel (Cloudinary
  + ImageKit + imgbb + GitHub Releases) with client-side WebP compression, sha256-dedup
  on GH Releases, and first-200-wins HEAD race on read. Replaces the legacy Firebase
  Storage single-host path.
tags:
- decisions
- architecture
- journal
- photos
- image-cdn
- cloudinary
- imagekit
- imgbb
- github-releases
- replication
timestamp: 2026-06-23
format_version: okf-v0.1
status: active
related:
- runbooks/free-hosting-providers/image-cdn
- rules/interaction/no-card-on-file
- decisions/security/secrets-management-doppler
---



# Journal photo pipeline — 4-host replicate-everywhere

The journal app's photo upload was Firebase-Storage-only. Firebase Storage requires Blaze (card on file) at any non-trivial scale and concentrates all photo durability on one provider. We migrated to the family's [4-host image CDN pattern](../../../runbooks/free-hosting-providers/image-cdn.md) so:

1. No card on file anywhere in the photo path.
2. Three rails can die and photos still display.
3. Build-time and runtime sit on different infrastructure (Firestore for metadata, four CDNs for blobs).

## Pipeline

```
Drop / paste image in TipTap editor
  │
  ▼
optimizeImage()              canvas → WebP (q=0.82) ≤2048px long edge,
                             JPEG (q=0.85) fallback. ORIGINAL never stored.
  │
  ▼
sha256(blob)                 used as Photo.id + as GH-Releases asset name
                             (cross-entry dedup — same file uploaded twice
                             collapses to one GH asset via 422-recovery).
  │
  ▼
Promise.allSettled([
  uploadToCloudinary(blob),         POST /v1_1/<name>/image/upload (unsigned)
  uploadToImageKit(blob, name),     POST /api/v1/files/upload + Pages Function
                                    /api/sign-imagekit (HMAC-SHA1, 10-min TTL)
  uploadToImgbb(blob),              POST api.imgbb.com/1/upload?key=...
  uploadToGhReleases(blob, sha),    POST monthly release asset
])
  │
  ▼
Require ≥2 hosts succeed                If <2 → throw, TipTap surfaces error.
  │
  ▼
Photo { id, urls: { cloudinary?, imagekit?, imgbb?, ghRelease? },
        bytes, sha256, createdAt }     persisted on Entry.photos[]
  │
  ▼
TipTap embeds primary URL in <img src>   ImageKit > Cloudinary > imgbb > GH
```

## Read path

`readPhotoUrl(photo)` does a parallel HEAD race; first 200 wins. Order doesn't affect the outcome, but if all four fail we return the first candidate so the `<img>` at least has *something* to render (the browser will surface a broken-image icon — better than blocking).

Accepts three shapes for backward compat:

- `string` — raw URL (oldest legacy)
- `{ url: string }` — single-host legacy
- `Photo` — new shape

## Entry schema change

`Entry.photos?: PhotoRecord[]` was added next to the existing `photoUrls: string[]`. We keep `photoUrls` because:

- TipTap embeds img tags with a single src — `photoUrls` is a cheap derived index of those srcs.
- Legacy entries (Firebase-Storage era) only have `photoUrls`. The new code reads either.
- Querying "entries with any photos" stays a simple `photoUrls != []` check.

`photos[]` carries the authoritative 4-host tuple. The TipTap `<img src>` is *one* of the four URLs (the primary), chosen at insert time via ImageKit > Cloudinary > imgbb > GH Releases. The other three live on the Photo record for read failover.

## Why these four, not three

The image-cdn runbook lists five candidates (4 + Uploadcare). We use four because:

- Uploadcare is technically a perma-trial and silently upgrades to Pro if a card is ever added. We don't want a footgun in the auth path.
- Four uncorrelated rails is the sweet spot — three felt tight (cascading bad month on Cloudinary + ImageKit isn't impossible), five was diminishing returns.
- imgbb has no signed delete API. We accept that — see "Deletion" below.
- GH Releases is the durability anchor (same uptime profile as the rest of GitHub).

## Env vars

| Key | Where | Notes |
|---|---|---|
| `PUBLIC_CLOUDINARY_CLOUD_NAME` | client | from dashboard |
| `PUBLIC_CLOUDINARY_UPLOAD_PRESET` | client | unsigned preset — no admin key in browser |
| `PUBLIC_IMAGEKIT_PUBLIC_KEY` | client | public-key half of the pair |
| `PUBLIC_IMAGEKIT_URL_ENDPOINT` | client | `https://ik.imagekit.io/<id>` |
| `IMAGEKIT_PRIVATE_KEY` | Pages Function only | HMAC-SHA1 signature — NEVER in client bundle |
| `PUBLIC_IMGBB_API_KEY` | client | public-uploads-only — fine in browser |
| `PUBLIC_GH_RELEASES_REPO` | client *or* function | `chirag127/oriz-image-cdn` |
| `GH_RELEASES_TOKEN` | Pages Function / migration script | PAT with `contents:write` |

ImageKit signature flow:

```
Browser  ──POST──▶  /api/sign-imagekit  (Cloudflare Pages Function)
                       │  HMAC_SHA1(IMAGEKIT_PRIVATE_KEY, token+expire)
                       ▼
Browser  ◀──{ signature, expire, token }
Browser  ──POST──▶  upload.imagekit.io/api/v1/files/upload
                    body: file + publicKey + signature + expire + token
```

10-minute TTL on the signature is well within ImageKit's documented 1-hour cap and tight enough to limit replay.

## GH Releases dedup

Asset filename = `<sha256[0..16]>.bin` inside a per-month release tagged `images-YYYY-MM`. Uploading an asset whose name already exists returns 422; we treat 422 as a successful dedup and synthesize the download URL ourselves. This avoids the gh-releases "soft 5 GB" repo cap by collapsing duplicates and rotating the tag monthly (so old months can be pruned independently).

The runbook calls out the **one release per app per month** rule explicitly — never one-release-per-image, GitHub will rate-limit. We comply.

## Deletion

We don't actively delete photo blobs. Reasons:

- **imgbb** has no signed delete API at all.
- **Cloudinary** unsigned upload presets can't be deleted from the browser without an admin signature (which can't ship to the client).
- **ImageKit** delete requires the private key (server-only) plus a per-file fileId we don't persist.
- **GitHub Releases** asset deletion needs a per-asset id we don't persist either.

Orphaned blobs age out via host-side quotas (Cloudinary credit pool resets monthly; ImageKit 20 GB total cap; imgbb has no expiry but a 32 MB/file cap; GH Releases rotates monthly tags). The journal app holds the metadata and the user owns the Firestore record — deleting their account removes the index. The blob orphans are an accepted leak.

If we ever need server-side reaping: stand up a Worker that on a cron walks tombstoned entries and uses the per-host admin APIs. Not built; deferred until volume justifies it.

## Migration

`scripts/migrate-photos-to-4-host.mjs` is a one-shot Node script that:

1. Walks every `users/*/entries/*` doc via firebase-admin.
2. For each photoUrl pointing at `firebasestorage.googleapis.com`, downloads it.
3. Replicates to all four hosts.
4. Writes `photos: PhotoRecord[]` back via merge — leaves `photoUrls` alone so legacy clients still render until they refresh.

Runs with `--dry-run` by default-safe; `--uid <uid>` for one user. Not wired into package.json scripts (once-or-never). Needs `GOOGLE_APPLICATION_CREDENTIALS` pointing at a service-account JSON with Firestore + Storage read.

## Trade-offs we accept

- Browser-side compression burns ~50-200ms of main-thread time per image. Worth it to never send originals over the wire.
- Four parallel uploads tax the user's uplink. Mitigated by compressing first (<500 KB typical).
- No server-side dedup across users (each user's same-image upload hits all four hosts again). Acceptable for family-scale.
- Read race issues four HEAD requests for every image render. Cached after first hit; PWA workbox keeps `firebasestorage.googleapis.com` cache too for back-compat.

## Related changes

- `src/lib/photos.ts` — full rewrite
- `functions/api/sign-imagekit.ts` — new Pages Function
- `src/lib/types.ts` — `PhotoRecord` + `Entry.photos?`
- `src/components/TipTapEditor.tsx` — drop handler uses new pipeline
- `src/components/DeleteAccountView.tsx` — copy updated (we no longer delete blobs)
- `.env.example` + `templates/.env.example` — new image-host keys

## Sources

- [image-cdn runbook](../../../runbooks/free-hosting-providers/image-cdn.md)
- [ImageKit upload-API docs](https://docs.imagekit.io/api-reference/upload-file-api/client-side-file-upload)
- [Cloudinary unsigned uploads](https://cloudinary.com/documentation/upload_images#unsigned_upload)
- [imgbb API](https://api.imgbb.com/)
- [GitHub Releases upload-asset API](https://docs.github.com/en/rest/releases/assets#upload-a-release-asset)
