---
type: runbook
title: "Free hosting — image CDN + transforms + durability replication (Cloudinary, ImageKit, imgbb, GitHub Releases, Uploadcare)"
description: "4-host replicate-everywhere image strategy: Cloudinary + ImageKit + imgbb + GitHub Releases. Image compressed once at upload (optimisation only — original never stored), then replicated across all 4 hosts. Client tries each in order; first 200 wins. Cloudinary + ImageKit are CDN-fast with transforms; imgbb is no-signup durability; GH Releases is cold storage."
tags: [runbook, hosting, free-tier, image-cdn, cloudinary, imagekit, imgbb, github-releases, replication]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
  - runbooks/free-hosting-providers/index
  - runbooks/free-hosting-providers/object-storage
  - runbooks/free-hosting-providers/databases
  - rules/no-card-on-file
---

# Image CDN + transforms + durability replication — free tiers (2026-06-22)

Family pattern for user-uploaded images: **compress once at upload, replicate across 4 no-card hosts, first-200-wins on the client**. Cloudinary + ImageKit serve transforms and edge bandwidth; imgbb and GitHub Releases are durability rails.

Build-time images on static sites stay where they are — bundled into the Pages build and served from the Cloudflare Pages CDN. Replication is for runtime user-uploads only.

## The table

| # | Provider | Free tier | Card@signup | Card to use free | KYC | Role | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | **Cloudinary** ⭐ | 25 credits/mo (1 credit = 1K transforms OR 1 GB storage OR 1 GB bandwidth), 3 users | NO | NO | NO | CDN + transforms | **KEEP** |
| 2 | **ImageKit** ⭐ | 20 GB storage + 20 GB bandwidth/mo, unlimited transforms, free-forever | NO | NO | NO | CDN + transforms | **KEEP** |
| 3 | **imgbb** ⭐ | No expiry, no signup required, 32 MB per image cap | NO | NO | NO | Durability + no-account fallback | **KEEP** |
| 4 | **GitHub Releases** ⭐ | 2 GB per asset, soft repo cap ~5 GB, unlimited public repos | NO | NO | NO | Cold-storage durability rail | **KEEP** |
| 5 | Uploadcare | "Trial" plan (de-facto perma-free): 10K ops + 10 GB storage + 10 GB traffic/mo | NO | NO (adding card auto-upgrades to Pro) | NO | CDN + transforms | **KEEP** (don't add card) |
| 6 | Bunny Optimizer | 14-day trial only; post-trial $9.50/mo + $1/mo minimum | NO | — | NO | — | **DROP** |
| 7 | Imgix | 30-day trial only; paid after ($0.25/credit) | NO | — | NO | — | **DROP** |

## The 4-host replicate-everywhere pattern

```
Upload flow (client → master upload Worker):
  1. Compress + optimise image to AVIF/WebP at target sizes (max 2400px long edge)
     — ORIGINAL is NEVER stored. Optimisation is the only step.
  2. Fan-out upload to all 4 hosts in parallel:
       a. Cloudinary       (POST signed upload, get publicId)
       b. ImageKit          (POST upload API, get fileId)
       c. imgbb             (POST https://api.imgbb.com/1/upload?key=..., get url)
       d. GitHub Releases   (gh release upload <tag> <file>, get browser_download_url)
  3. Persist tuple in Firestore:
       imageUrls: {
         cloudinary: "https://res.cloudinary.com/.../image.avif",
         imagekit:   "https://ik.imagekit.io/.../image.avif",
         imgbb:      "https://i.ibb.co/.../image.jpg",
         ghRelease:  "https://github.com/.../releases/download/.../image.avif"
       }

Read flow (client <Img4Way> wrapper):
  1. Try cloudinary URL  → if 200, done.
  2. Else imagekit       → if 200, done.
  3. Else imgbb          → if 200, done.
  4. Else ghRelease      → if 200, done.
  5. Else error placeholder.
```

This gives 4 independent uncorrelated rails. If Cloudinary credit-pool exhausts mid-month, ImageKit picks up. If both transform-CDNs go down, imgbb (a no-signup public bucket) and GitHub (the most durable host in the world for a hobby family) cover. Same image, 4 hosts, first 200 wins.

**Optimisation is the only mutation.** We compress once at upload-time (AVIF preferred, WebP fallback) and store ONLY the optimised version. The original RAW upload is never persisted anywhere. This:

- Keeps storage cheap (AVIF/WebP at 2400px ≈ 100-300 KB vs. 5-20 MB original)
- Keeps egress cheap (same)
- Means we don't need on-the-fly transforms for the common case (the stored AVIF is already display-ready)
- Sacrifices: cannot reprocess at higher quality later. Acceptable for a family-scale hobby fleet.

## Why each host has a role

- **Cloudinary** — best transform feature-set, AI tagging, video thumbnails. Credit-pooled so usage is rationable.
- **ImageKit** — unlimited transforms (the killer free-tier feature), 20 GB + 20 GB monthly. Sustained-throughput champion.
- **imgbb** — zero-signup public-image API. Drop-in: `POST https://api.imgbb.com/1/upload?key=<API_KEY>&image=<base64>`. Returns a permanent URL, no expiry, no auth. Perfect durability rail because it's so simple it can't really break.
- **GitHub Releases** — same durability profile as the rest of GitHub. Asset URLs are `https://github.com/<owner>/<repo>/releases/download/<tag>/<file>`. 2 GB per asset, no per-repo or org-level hard cap on releases storage (soft cap ~5 GB before GitHub asks questions). Bandwidth is unlimited.

## How the family uses image CDNs today

Build-time static images: bundled into the Pages build, served from Cloudflare Pages CDN. No replication needed because the binary lives in git, mirrored across `chirag127/<repo>` on GitHub + Cloudflare Pages deploy storage.

User-uploaded runtime images (avatars, journal photos, content app uploads): use the 4-host pattern above. The master upload Worker wraps the fan-out; the `<Img4Way>` component in `astro-shell-npm-pkg` wraps the read.

## Quirks per provider

- **Cloudinary credit math.** 25 credits/mo can be spent as 25K transforms OR 25 GB storage OR 25 GB bandwidth — or any blend. The 3-user limit is per workspace.
- **ImageKit unlimited transforms** is the niche edge. 20 GB storage + 20 GB bandwidth caps total throughput, but unlimited transforms means free experimentation.
- **imgbb 32 MB cap.** Per image. We compress to <500 KB at upload so this is never a wall in practice.
- **imgbb API key.** Free API key from the imgbb dashboard. Stored in envpact under `IMGBB_API_KEY`. Yes, embedding it client-side is fine — imgbb keys are public-uploads-only by design.
- **GitHub Releases tag strategy.** One release per app per month (e.g., `images-2026-06`); never one-release-per-image (GitHub will rate-limit you).
- **GitHub Releases asset size.** 2 GB per asset is the hard cap. Compress to <500 KB and this is never close.
- **Uploadcare "Trial".** Officially called a trial, but it has no time limit. Adding a card silently upgrades to Pro pricing — careful with the dashboard. Listed as a fallback only.
- **Bunny Optimizer** is a 14-day trial, then paid. Not free.
- **Imgix** is a 30-day trial, then paid. Not free.

## Recommendation for the family

1. **All user-uploaded images** flow through the 4-host replicate-everywhere pattern. Master upload Worker handles fan-out; `<Img4Way>` handles read failover.
2. **Build-time images** stay on Cloudflare Pages CDN (no replication needed; git + Pages mirrors are durable enough).
3. **Never store the original.** Compress at upload, replicate the AVIF/WebP. Saves storage, egress, and on-the-fly transform credits.
4. **Don't add a card to Uploadcare** if you ever sign up — it auto-upgrades to Pro.

## Sources

- [Cloudinary pricing](https://cloudinary.com/pricing) — 25 credits/mo free
- [ImageKit pricing](https://imagekit.io/plans) — 20 GB + 20 GB free
- [imgbb API docs](https://api.imgbb.com/) — no expiry, 32 MB/image
- [GitHub Releases storage + bandwidth quotas](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases#storage-and-bandwidth-quotas) — 2 GB/asset
- [Uploadcare pricing](https://uploadcare.com/pricing/) — trial plan
- [Bunny Optimizer pricing](https://bunny.net/optimizer/) — 14-day trial
- [Imgix pricing](https://www.imgix.com/pricing) — 30-day trial
