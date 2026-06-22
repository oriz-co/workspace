---
type: runbook
title: "Free hosting — image CDN + transforms (Cloudinary, ImageKit, Uploadcare, Bunny, Imgix)"
description: "Provider-by-provider free-tier numbers for image CDN + on-the-fly transforms. Cloudinary (25 credits/mo) and ImageKit (20 GB + 20 GB) are the no-card winners. Bunny Optimizer and Imgix are trial-only — DROP."
tags: [runbook, hosting, free-tier, image-cdn, cloudinary, imagekit]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
  - runbooks/free-hosting-providers/index
  - rules/no-card-on-file
---

# Image CDN + transforms — free tiers (2026-06-22)

Family pattern: **most images ship as static assets from the Pages build**, no CDN needed. For user-uploaded images that need on-the-fly resize/transform/format-convert, Cloudinary and ImageKit are the no-card picks.

## The table

| # | Provider | Free tier | Card@signup | Card to use free | KYC | Verdict |
|---|---|---|---|---|---|---|
| 1 | **Cloudinary** ⭐ | 25 credits/mo (1 credit = 1K transforms OR 1 GB storage OR 1 GB bandwidth), 3 users | NO | NO | NO | **KEEP** |
| 2 | **ImageKit** ⭐ | 20 GB storage + 20 GB bandwidth/mo, unlimited transforms, free-forever | NO | NO | NO | **KEEP** |
| 3 | Uploadcare | "Trial" plan (de-facto perma-free): 10K ops + 10 GB storage + 10 GB traffic/mo | NO | NO (adding card auto-upgrades to Pro) | NO | **KEEP** |
| 4 | Bunny Optimizer | 14-day trial only; post-trial $9.50/mo + $1/mo minimum | NO | — | NO | **DROP** |
| 5 | Imgix | 30-day trial only; paid after ($0.25/credit) | NO | — | NO | **DROP** |

## How the family uses image CDNs

Today: not at all. Every site ships its images as static assets from the Pages build. The Pages CDN does the bandwidth + edge cache. Image optimization happens at build time (Astro / Next image components → AVIF / WebP / multiple sizes).

When this changes:

- **User-uploaded avatars / profile pics** → ImageKit (free tier covers easily; unlimited transforms is the killer feature)
- **Heavy on-the-fly video thumbnail extraction, complex AI tagging** → Cloudinary (more transform types; 25 credits supports a small-to-mid app)
- **Tiny one-off image services / Markdown preview** → Uploadcare

## Quirks per provider

- **Cloudinary credit math.** 25 credits/mo can be spent as 25K transforms OR 25 GB storage OR 25 GB bandwidth — or any blend. The 3-user limit is per workspace.
- **ImageKit unlimited transforms** is the niche edge. 20 GB storage + 20 GB bandwidth caps the total throughput, but unlimited transforms means you can experiment freely.
- **Uploadcare "Trial".** Officially called a trial, but it has no time limit. Adding a card silently upgrades to Pro pricing — careful with the dashboard.
- **Bunny Optimizer** is a 14-day trial, then paid. Not free.
- **Imgix** is a 30-day trial, then paid. Not free.

## Recommendation for the family

1. **First reach:** keep doing build-time image optimization in Astro / Next.
2. **When you need runtime image CDN:** ImageKit (20 GB free + unlimited transforms).
3. **When you need more transform types or bigger pool:** Cloudinary (25 credits).
4. **Tiny one-offs:** Uploadcare (don't add a card or you auto-upgrade).

## Sources

- [Cloudinary pricing](https://cloudinary.com/pricing) — 25 credits/mo free
- [ImageKit pricing](https://imagekit.io/plans) — 20 GB + 20 GB free
- [Uploadcare pricing](https://uploadcare.com/pricing/) — trial plan
- [Bunny Optimizer pricing](https://bunny.net/optimizer/) — 14-day trial
- [Imgix pricing](https://www.imgix.com/pricing) — 30-day trial
