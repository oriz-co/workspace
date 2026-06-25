---
type: decision
title: "Image CDN \u2014 chained 3-tier fallback (Cloudflare Images \u2192 wsrv.nl\
  \ \u2192 ImageKit)"
description: 'Every image rendered through the @chirag127/oriz-kit <Image> wrapper
  resolves through a 3-tier fallback: Cloudflare Images first, wsrv.nl on 5xx, ImageKit
  on 5xx.'
tags:
- images
- cdn
- fallback
- oriz-kit
- never-hit-quotas
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/image-cdn/cloudflare-images
- services/image-cdn/wsrv-nl
- services/image-cdn/imagekit
- decisions/infrastructure/cloudflare-pages-for-all-sites
- rules/interaction/never-hit-quotas
- rules/interaction/no-card-on-file
- glossary/o-r/oriz-kit
---



# Image CDN — chained 3-tier fallback (Cloudflare Images → wsrv.nl → ImageKit)

## Decision

Every image in the family resolves through a **3-tier chained
fallback**:

1. **[Cloudflare Images](../../../services/image-cdn/cloudflare-images.md)** — primary. Same edge as our Pages deploys, bundled with the free Pages plan, no extra signup.
2. **[wsrv.nl](../../../services/image-cdn/wsrv-nl.md)** — fallback 1. Public URL-transform proxy, no signup, no auth — survives outages of any authenticated provider.
3. **[ImageKit](../../../services/image-cdn/imagekit.md)** — fallback 2. 20 GB/mo + DAM, email-only signup.

The chain is implemented as the `<Image>` component wrapper inside
[`@chirag127/oriz-kit`](../../../glossary/o-r/oriz-kit.md). On image
load failure (5xx, transformation error, network) the wrapper rewrites
the `src` to the next rung's URL and retries.

## Why

- **Quota survivability.** Each rung has independent operators, edges,
  billing surfaces. If Cloudflare Images hits a quota or has an edge
  failure, the next rung must work without operator intervention. wsrv.nl
  is deliberately the no-account middle rung so the chain survives even
  when an authenticated provider is the failure mode.
- **Cost control.** All three rungs are free at our scale. No card on
  file is required at any rung — see
  [`rules/no-card-on-file.md`](../../../rules/interaction/no-card-on-file.md).
- **Latency-first ordering.** Cloudflare Images sits on the same edge
  as our Pages sites, so it has the lowest p50 latency. We try fast
  before we try resilient.

## Implementation hint

```tsx
// inside @chirag127/oriz-kit
import { useState } from 'react';

const CHAIN = [
  (src, opts) => `/cdn-cgi/image/${cfImageOpts(opts)}/${src}`,
  (src, opts) => `https://wsrv.nl/?url=${encodeURIComponent(src)}&${wsrvOpts(opts)}`,
  (src, opts) => `https://ik.imagekit.io/oriz/${imagekitOpts(opts)}${src}`,
];

export function Image({ src, ...opts }) {
  const [tier, setTier] = useState(0);
  return (
    <img
      src={CHAIN[tier](../src, opts)}
      onError={() => setTier(t => Math.min(t + 1, CHAIN.length - 1))}
      {...opts}
    />
  );
}
```

The Astro variant follows the same shape — `is:inline` script swaps
`src` on `error`. The kit owns this logic so individual sites are
unaware of the chain.

## Implications

- Three separate accounts to provision: Cloudflare (already exists),
  wsrv.nl (no account), ImageKit (email-only signup).
- All image upload flows still target a single canonical home — see
  [`object-storage-split.md`](../database/object-storage-split.md). The CDN
  chain only governs **delivery**, not storage.
- `<picture>` / `srcset` and width-set generation must repeat per
  rung so each tier gets the correct transform syntax. The kit
  helper handles this — sites don't see it.
- Older [`services/tooling/imagekit.md`](../../../services/tooling/imagekit.md)
  and [`services/tooling/cloudinary.md`](../../../services/tooling/cloudinary.md)
  entries continue to document those services in the **tooling**
  role (DAM, image manipulation). The new
  [`services/image-cdn/`](../../../services/image-cdn/index.md) entries
  document them specifically as **CDN fallback** rungs.

## Cross-refs

- [Cloudflare Images](../../../services/image-cdn/cloudflare-images.md)
- [wsrv.nl](../../../services/image-cdn/wsrv-nl.md)
- [ImageKit (CDN role)](../../../services/image-cdn/imagekit.md)
- [Cloudflare Pages for all sites](../../infrastructure/cloudflare-pages-for-all-sites.md)
- [oriz-kit glossary](../../../glossary/o-r/oriz-kit.md)
- [Never hit quotas rule](../../../rules/interaction/never-hit-quotas.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
