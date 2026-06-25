---
type: decision
title: "Object storage split \u2014 GitHub Releases for binaries, Backblaze B2 for\
  \ blobs; Cloudflare R2 rejected"
description: Versioned binaries live in GitHub Releases. Unversioned blobs live in
  Backblaze B2. Cloudflare R2 is rejected because adjacent paid features pull in a
  card-on-file requirement.
tags:
- storage
- github
- backblaze
- b2
- r2
- rejection
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/storage/github-releases
- services/storage/backblaze-b2
- services/storage/cloudflare-r2
- decisions/infrastructure/extensions-cross-store-publish
- rules/interaction/no-card-on-file
---



# Object storage split — GitHub Releases for binaries, Backblaze B2 for blobs; Cloudflare R2 rejected

## Decision

Object storage in the family splits in two:

| Use case | Home |
|---|---|
| Versioned binaries (`(repo, tag, asset-name)` identity) | [GitHub Releases](../../../services/storage/github-releases.md) |
| Unversioned blobs (backups, raw originals, archives) | [Backblaze B2](../../../services/storage/backblaze-b2.md) |

[Cloudflare R2](../../../services/storage/cloudflare-r2.md) is
**explicitly rejected**. The previously-recorded "user policy
exclusion" of Backblaze B2 (see
[`services/backblaze-b2.md`](../../../services/backblaze-b2.md)) is
**reversed** by this decision.

## Why

- **Versioned binaries already have a great home.** GitHub Releases
  gives every artefact a stable, immutable URL keyed by `(repo, tag,
  asset-name)`, a free CDN, server-side checksums, and integration
  with the per-repo CI from
  [`decisions/process/code-quality-stack.md`](../../process/code-quality-stack.md).
  Trying to host extension `.crx` / VSIX / CLI binaries anywhere else
  loses the version-as-URL property for free.
- **Unversioned blobs don't fit Releases.** Backups and raw originals
  aren't keyed by a tag and don't benefit from per-tag immutability;
  Releases caps assets at 2 GB each, which is too small for some
  archive workflows. Backblaze B2 is the cleanest free-tier
  S3-compatible alternative, with email-only signup and no card.
- **Cloudflare R2 was the obvious option but is rejected.** Adjacent
  Workers Paid features that we'd realistically want pull in a card
  on the same account, in violation of the family's
  [`no-card-on-file`](../../../rules/interaction/no-card-on-file.md) hard rule.

## Reversal of prior B2 rejection

The previous file at [`services/backblaze-b2.md`](../../../services/backblaze-b2.md)
recorded B2 as `status: rejected — user policy`. That status was
reversed on 2026-06-20 in light of the R2 rejection. The historical
file remains in place for the record; the live B2 entry is at
[`services/storage/backblaze-b2.md`](../../../services/storage/backblaze-b2.md).

## Implications

- Extension publish pipelines (`oriz-*-ext`) push the built `.crx`,
  `.xpi`, VSIX, etc. to GitHub Releases via
  `softprops/action-gh-release` in their per-repo CI.
- Database backup jobs and any other unversioned-blob workflows write
  to a Backblaze B2 bucket using the S3-compatible API + an app key
  scoped to the bucket.
- Worker code never imports the `R2` binding; existing code in the
  api.oriz.in Worker that did so is to be migrated. The stale
  `services/compute/cloudflare-r2.md` entry remains as `status:
  active` and should be flipped in a follow-up sweep — flagged in
  [`services/storage/cloudflare-r2.md`](../../../services/storage/cloudflare-r2.md).

## Cross-refs

- [GitHub Releases](../../../services/storage/github-releases.md)
- [Backblaze B2](../../../services/storage/backblaze-b2.md)
- [Cloudflare R2 (rejected)](../../../services/storage/cloudflare-r2.md)
- [Extensions cross-store publish](../../infrastructure/extensions-cross-store-publish.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
