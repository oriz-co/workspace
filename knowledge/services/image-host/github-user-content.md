---
type: service
title: "GitHub user-content (raw.githubusercontent.com)"
description: "Tier 4 image origin — push images to a dedicated `assets` branch of any family repo and hot-link from raw.githubusercontent.com. Free unlimited; rare-use tier for > 25 MB assets and large animated GIFs."
tags: [images, host, origin, github, raw, user-content, fallback]
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
role: image-host-fallback-3
provider: github
free_tier: "Free unlimited bandwidth via raw.githubusercontent.com; soft 100 MB per-file ceiling (Git LFS for larger), 1 GB recommended per repo"
swap_cost: low
related:
  - services/image-host/repo-hosted-cf-pages
  - services/image-host/imgbb
  - services/image-host/imgur
  - decisions/architecture/image-host-four-tier
  - rules/no-card-on-file
  - rules/never-hit-quotas
---

# GitHub user-content (raw.githubusercontent.com)

## Role

**Tier 4 origin** in the [4-tier image-host chain](../../decisions/architecture/image-host-four-tier.md).
The rare-use tier — invoked when:

- An asset is too large to commit alongside the post (> 25 MB
  Cloudflare Pages per-asset ceiling), OR
- An animated GIF would inflate the site repo's clone size, OR
- The PNG-must-stay-PNG case where [Imgur](./imgur.md) would re-encode

## Approach

Push the asset to a dedicated `assets` branch of any
`chirag127/oriz*` repository. The branch is **orphan** (no shared
history with `main`) so it doesn't bloat working clones — fetch only
on explicit need. Reference the asset via:

```
https://raw.githubusercontent.com/<user>/<repo>/<branch>/<path>
```

For example:

```
https://raw.githubusercontent.com/chirag127/blog-site/assets/2026/06/big-animation.gif
```

## Free tier

- Free unlimited bandwidth via `raw.githubusercontent.com` for public
  repos (rate-limited per IP for abusive patterns; nowhere near
  family scale)
- Soft 100 MB ceiling per file in Git (above that → Git LFS, which
  has its own free 1 GB / month bandwidth — adequate for the rare
  case)
- 1 GB recommended ceiling per repo; the orphan-branch pattern lets
  us spread across repos as needed

## Card / subscription required?

**NO.** Free GitHub account; same account that hosts the site repos.
No card on file.

## How it's used

1. Asset goes to `<repo>/assets` branch via `git push --force` (orphan branch is rebuild-able).
2. Stable raw URL committed to the post's frontmatter as `image_tier_4:`.
3. The [`<Image>` chain](../../glossary/o-r/oriz-kit.md) treats it as the deepest fallback.
4. Optional: front the raw URL with [jsDelivr's GitHub mirror](../cdn/jsdelivr.md) (`https://cdn.jsdelivr.net/gh/<user>/<repo>@<branch>/<path>`) for better edge cache; jsDelivr is already in our stack for npm packages.

## Methods supported

Anything `git push` can do. Standard CI flow uses
`actions/checkout@v4` with `ref: assets` + commit-and-push.

## Alternatives

- [repo-hosted Tier 1](./repo-hosted-cf-pages.md) — when ≤ 25 MB
- [ImgBB Tier 2](./imgbb.md) — when the asset shouldn't bloat git history
- [Imgur Tier 3](./imgur.md) — same as ImgBB except size + re-encode quirks

## Swap cost

Low — branch + path naming convention is a pure git rename. URLs
remain stable as long as the branch exists.

## Why this is our pick

- Free unlimited; same account as the rest of the family
- Survives every other tier's outage (different operator from
  Cloudflare / ImgBB / Imgur)
- Permanent, content-addressable URLs (commit SHA pin available:
  `raw.githubusercontent.com/<user>/<repo>/<sha>/<path>`)
- No upload API; just `git push` — fits the markdown-in-repo authoring
  ergonomics

## Caveats

- Default `Content-Type` from raw.githubusercontent.com is
  `text/plain` for unrecognized extensions — stick to standard image
  extensions (`.png`, `.jpg`, `.gif`, `.webp`, `.avif`).
- Browsers can hot-link, but `Cache-Control` is short — front with
  jsDelivr for CDN-caching when latency matters.
- Don't put the family's binary firmware / installers here; those go
  to [GitHub Releases](../storage/github-releases.md) per the
  [object-storage-split](../../decisions/architecture/object-storage-split.md).

## Cross-refs

- [4-tier image-host decision](../../decisions/architecture/image-host-four-tier.md)
- [repo-hosted Tier 1](./repo-hosted-cf-pages.md)
- [ImgBB Tier 2](./imgbb.md)
- [Imgur Tier 3](./imgur.md)
- [jsDelivr (npm + GitHub mirror CDN)](../cdn/jsdelivr.md)
- [Object-storage split](../../decisions/architecture/object-storage-split.md) — different domain (versioned binaries vs. images)
- [No card-on-file rule](../../rules/no-card-on-file.md)
- [Never-hit-quotas rule](../../rules/never-hit-quotas.md)
