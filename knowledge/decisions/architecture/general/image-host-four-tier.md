---
type: decision
title: "Image host \u2014 chained 4-tier origin (repo + ImgBB + Imgur + GitHub user-content)"
description: "Image origin storage uses a 4-tier chain \u2014 repo-hosted on CF Pages\
  \ \u2192 ImgBB \u2192 Imgur \u2192 GitHub user-content. Composes alongside the 3-tier\
  \ image-CDN chain in the oriz-kit <Image> wrapper."
tags:
- images
- host
- origin
- fallback
- oriz-kit
- never-hit-quotas
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/image-host/repo-hosted-cf-pages
- services/image-host/imgbb
- services/image-host/imgur
- services/image-host/github-user-content
- decisions/architecture/frontend/image-cdn-fallback-chain
- decisions/architecture/general/cms-markdown-in-repo-only
- decisions/infrastructure/cloudflare-pages-for-all-sites
- rules/interaction/never-hit-quotas
- rules/interaction/no-card-on-file
- glossary/o-r/oriz-kit
---



# Image host — chained 4-tier origin (repo + ImgBB + Imgur + GitHub user-content)

## Decision

Image **origin** storage uses a **4-tier fallback chain**, distinct
from (and composed with) the
[3-tier image-CDN chain](../frontend/image-cdn-fallback-chain.md) that handles
**delivery / transformation**:

1. **[repo-hosted on Cloudflare Pages](../../../services/image-host/repo-hosted-cf-pages.md)** — default for everything that fits in the repo. Image lives next to the `.mdx` that embeds it.
2. **[ImgBB](../../../services/image-host/imgbb.md)** — uploaded by CI for blog-post images that don't belong in the repo (large screenshots, automated batch uploads).
3. **[Imgur](../../../services/image-host/imgur.md)** — mirror of Tier 2; same payload pushed in parallel from CI for hot-link backup.
4. **[GitHub user-content](../../../services/image-host/github-user-content.md)** — rare; assets > 25 MB, large animated GIFs we don't want in the site repo, PNG-must-stay-PNG cases. Uses an orphan `assets` branch of any family repo, hot-linked via `raw.githubusercontent.com`.

User direction 2026-06-20: "use all of them and add all imgbb and
imgur and github user content and repo hosted" — locked.

## Why

- **Quota survivability.** Each tier has independent operators,
  edges, and billing surfaces. ImgBB outage doesn't take Imgur down;
  CF Pages outage doesn't take GitHub raw down. Per
  [`rules/never-hit-quotas.md`](../../../rules/interaction/never-hit-quotas.md).
- **Cost control.** All four tiers are free at our scale; no card on
  file required at any tier. See
  [`rules/no-card-on-file.md`](../../../rules/interaction/no-card-on-file.md).
- **Authoring ergonomics.** Tier 1 (repo-hosted) is the natural fit
  for [markdown-in-repo authoring](./cms-markdown-in-repo-only.md):
  drop image next to `.mdx`, embed via relative path, deploy ships
  it. Higher tiers only kick in for the cases where Tier 1 doesn't
  fit.
- **Independence from the CDN chain.** Origin (where the byte lives)
  and CDN (how it's resized + edge-cached) are different concerns
  with different failure modes. Two chains, composed cleanly.

## Origin vs CDN — composition with the existing chain

```
[ Tier 1 origin: /posts/2026/hero.png on CF Pages         ]
                              │
                              ▼
[ CDN Tier 1: Cloudflare Images /cdn-cgi/image/<opts>/... ]
   ↓ on 5xx
[ CDN Tier 2: wsrv.nl?url=<encoded origin url>            ]
   ↓ on 5xx
[ CDN Tier 3: ImageKit                                    ]
```

If the ORIGIN itself goes 404 (Tier 1 missing, e.g. a typo'd path
that escaped review), the kit falls to the next ORIGIN tier:

```
Tier 1 origin 404
   ↓
Tier 2 origin (ImgBB URL from frontmatter)
   ↓
Tier 3 origin (Imgur URL from frontmatter)
   ↓
Tier 4 origin (GitHub raw URL from frontmatter)
```

## Implementation hint

The `<Image>` component in [`@chirag127/oriz-kit`](../../../glossary/o-r/oriz-kit.md)
ships a `src` chain. Frontmatter on a post (or asset metadata) lists
all available tiers; the wrapper tries Tier 1 → on `error` falls
through to Tier 2 → etc. Each origin URL is then wrapped by the
CDN chain on the way out.

```tsx
// inside @chirag127/oriz-kit
const ORIGIN_KEYS = ['src', 'imageTier2', 'imageTier3', 'imageTier4'] as const;

export function Image({ origins, ...opts }) {
  const [tier, setTier] = useState(0);
  const origin = origins[ORIGIN_KEYS[tier]];
  const wrapped = wrapWithCdnChain(origin, opts);   // existing 3-tier CDN chain
  return (
    <img
      src={wrapped}
      onError={() => setTier(t => Math.min(t + 1, ORIGIN_KEYS.length - 1))}
      {...opts}
    />
  );
}
```

The frontmatter shape for a post embedding an image:

```yaml
---
title: "..."
images:
  hero:
    src: ./hero.png                          # Tier 1 — repo-hosted
    imageTier2: https://i.ibb.co/.../...     # Tier 2 — ImgBB
    imageTier3: https://i.imgur.com/....png  # Tier 3 — Imgur mirror
    imageTier4: https://raw.githubusercontent.com/chirag127/blog-site/assets/2026/06/hero.png  # Tier 4
---
```

CI mirrors Tier 1 → Tiers 2 + 3 + 4 on every post merge so the
chain is populated for new content automatically.

## Implications

- **Three accounts to provision** beyond the CF account we already
  have: ImgBB (email), Imgur (email + Client-ID), GitHub (already
  exists). All free, no card.
- **CI mirroring step** added to oriz-blog-site (and any
  content-bearing site) — uploads new images to Tier 2 / 3 / 4 and
  writes URLs back to the post's frontmatter as a single PR. Lives
  in `.github/workflows/mirror-images.yml`; secrets via
  [Doppler](../../../services/secrets/doppler.md) → GH Secrets.
- **`<Image>` wrapper composes** origin chain (this decision) with
  CDN chain (the [existing decision](../frontend/image-cdn-fallback-chain.md)) — sites stay unaware of either chain.
- **Storage caveat.** This decision governs **images only**.
  Versioned binaries still go to [GitHub Releases](../../../services/storage/github-releases.md);
  unversioned blobs / backups still go to
  [Backblaze B2](../../../services/storage/backblaze-b2.md) per
  [`object-storage-split.md`](../database/object-storage-split.md). Different
  asset class, different chain.
- **No card on file** at any tier (Tier 1 = same CF account as Pages,
  Tier 2 + 3 = email-only signup, Tier 4 = same GitHub account).

## Cross-refs

- [Tier 1 — repo-hosted on CF Pages](../../../services/image-host/repo-hosted-cf-pages.md)
- [Tier 2 — ImgBB](../../../services/image-host/imgbb.md)
- [Tier 3 — Imgur](../../../services/image-host/imgur.md)
- [Tier 4 — GitHub user-content](../../../services/image-host/github-user-content.md)
- [3-tier image-CDN chain](../frontend/image-cdn-fallback-chain.md) — delivery layer composed alongside this origin chain
- [Markdown-in-repo only CMS decision](./cms-markdown-in-repo-only.md) — authoring story behind Tier 1
- [Object-storage split](../database/object-storage-split.md) — different asset class (binaries / blobs vs. images)
- [Cloudflare Pages for all sites](../../infrastructure/cloudflare-pages-for-all-sites.md)
- [oriz-kit glossary](../../../glossary/o-r/oriz-kit.md)
- [Never-hit-quotas rule](../../../rules/interaction/never-hit-quotas.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
