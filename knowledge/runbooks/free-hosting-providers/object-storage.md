---
type: runbook
title: "Free hosting — object storage (R2, B2, IDrive, Filebase, Storj, Wasabi)"
description: "Provider-by-provider free-tier numbers for S3-compatible object storage and IPFS pinning. Cloudflare R2 has the best zero-egress economics but REQUIRES a card to activate the R2 service. Backblaze B2 is the pure no-card winner. Storj covers decentralized."
tags: [runbook, hosting, free-tier, object-storage, cloudflare-r2, backblaze-b2, storj]
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
  - runbooks/free-hosting-providers/index
  - rules/no-card-on-file
  - runbooks/restic-backup-setup
---

# Object storage — free tiers (2026-06-22)

The R2 vs B2 split. R2 has unbeatable economics (zero egress!) but Cloudflare gates the R2 service behind a card requirement. B2 is genuinely no-card. The family uses **B2 for backups** and would use R2 for product if the no-card rule ever relaxes.

## The table

| # | Provider | Free tier | Card@signup | Card to use free | KYC | Verdict |
|---|---|---|---|---|---|---|
| 1 | Cloudflare R2 | 10 GB storage, 1M Class A ops, 10M Class B ops/mo, **zero egress** | **YES** (card or PayPal to activate R2 specifically) | YES | NO | **EVALUATE** — best free tier but card-gated |
| 2 | **Backblaze B2** ⭐ | 10 GB storage, 1 GB/day download, 2,500 Class B + 2,500 Class C tx/day | NO | NO | NO | **KEEP** (family default) |
| 3 | **Storj DCS** ⭐ | 25 GB storage + 25 GB egress/mo (was 150 GB pre-Apr 2023) | NO | NO | NO | **KEEP** (decentralized) |
| 4 | Filebase IPFS | 5 GB storage, 1,000 pinned files, IPFS pinning included | NO | NO | NO | **KEEP** (IPFS niche) |
| 5 | **GitHub Releases** ⭐ | Per-asset cap 2 GB; soft repo cap ~5 GB; unlimited public repos. Cold storage. Not CDN-fast. | NO | NO | NO | **KEEP** (cold storage + image durability rail) |
| 6 | IDrive E2 | 10 GB free **discontinued (~2023)**; trial-only now | — | — | — | **DROP (killed)** |
| 7 | Wasabi | Trial only: ~1 TB for 30 days, no perma-free | NO trial / YES post-trial | YES | NO | **DROP** |

## How the family uses object storage

- **Backups (restic → B2)** — already wired per [`restic-backup-setup.md`](../restic-backup-setup.md). 10 GB free covers the family's restic snapshots with room.
- **Static assets (images, fonts) on app sites** — co-located with Cloudflare Pages; assets ship from `public/`, no separate object store needed.
- **Large media (videos, downloadables)** — none of the apps host these yet. If/when they do, Storj DCS gets the slot (25 GB + 25 GB egress free).
- **IPFS archive / web3** — Filebase, only if explicitly needed.

## The R2 trap

Cloudflare R2's free tier (10 GB + zero egress + 1M Class A + 10M Class B ops/mo) is the most generous in the table. The economics are unmatched.

**But:** activating the R2 service in the Cloudflare dashboard requires linking a payment method (credit card or PayPal), even if you stay entirely within the 10 GB free tier. This is a one-time gate, not a charge, but it's still card-on-file.

Per the [no-card-on-file rule](../../rules/no-card-on-file.md): **don't activate R2.** Use B2 instead. Re-evaluate if Cloudflare drops the card-gate or if the family adopts a single managed billing relationship with Cloudflare.

## Quirks per provider

- **R2 card-gate.** Cards / PayPal required to enable R2. The rest of Cloudflare (Pages, Workers, D1, KV, Queues, Workers AI) is no-card.
- **B2 daily download cap (1 GB/day).** Fine for backup restores (rare); not fine for serving public assets. If you need to serve images, use Cloudinary / ImageKit (see [`image-cdn.md`](./image-cdn.md)), not B2.
- **B2 transaction caps.** 2,500 Class B (downloads) + 2,500 Class C (delete/list) per day. Restic typically does <100 ops per backup run, so weekly backups are well under the cap.
- **GitHub Releases as cold storage.** Each release asset is capped at 2 GB; total per-repo cap is soft (~5 GB is typical before GitHub raises eyebrows). Unlimited public repos = unlimited durability rails if you spread across multiple repos. Not CDN-fast (GH Releases edge is fine but not transform-aware), so use it as the **durability rail in the image replication strategy** (see [`image-cdn.md`](./image-cdn.md)) — not as a primary serving CDN.
- **Storj DCS** had 150 GB free pre-April 2023. Cut to 25 GB. Still generous compared to B2.
- **Filebase IPFS** is the only no-card option for IPFS pinning. 5 GB + 1,000 pinned files. Niche.
- **IDrive E2** killed their 10 GB free tier (~2023). Now it's trial-only.
- **Wasabi** has only ever offered a 30-day trial; no perma-free.

## Recommendation for the family

1. **Backups:** Backblaze B2 (already wired via restic).
2. **Large media (when needed):** Storj DCS — 25 GB + 25 GB egress is plenty for one or two video-hosting apps.
3. **IPFS archive (when needed):** Filebase — 5 GB + 1,000 pins.
4. **Image durability rail (cold):** GitHub Releases — part of the 4-host image replication strategy in [`image-cdn.md`](./image-cdn.md).
5. **Do not activate R2** until the no-card rule changes.

## Image-only object hosts (cross-link)

For image-only assets, two no-card hosts live in this category but are documented in [`image-cdn.md`](./image-cdn.md) because their value proposition is image-specific (transforms, on-the-fly resize, image-only API):

- **imgbb** — 32 MB/image cap, no expiry, no signup. Image-only, no general object support.
- **GitHub Releases** — listed in this file's table above; also a node in the image replication strategy.

See [`image-cdn.md`](./image-cdn.md) for the 4-host replicate-everywhere pattern.

## Sources

- [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/) — 10 GB free
- [Cloudflare R2 signup card requirement](https://developers.cloudflare.com/r2/get-started/) (payment method required to enable)
- [Backblaze B2 pricing](https://www.backblaze.com/cloud-storage/pricing) — 10 GB free
- [Storj DCS pricing](https://www.storj.io/pricing) — 25 GB free
- [Filebase pricing](https://filebase.com/pricing/) — 5 GB IPFS free
- [GitHub Releases asset size limits](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases#storage-and-bandwidth-quotas)
- [IDrive E2 pricing](https://www.idrive.com/e2/pricing) (trial-only now)
- [Wasabi pricing](https://wasabi.com/pricing/)
