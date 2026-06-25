---
type: decision
title: "Three-format feed publishing \u2014 RSS 2.0 + Atom 1.0 + JSON Feed"
description: 'Every content-bearing site publishes three feed formats: /rss.xml (RSS
  2.0, source-of-truth for oriz-omnipost), /atom.xml (Atom 1.0), /feed.json (JSON
  Feed v1.1). oriz-kit ships <FeedDiscovery /> + generators.'
tags:
- feeds
- rss
- atom
- json-feed
- syndication
- seo
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/seo/atom-feed
- services/seo/json-feed
- services/seo/index
- decisions/architecture/general/cross-post-engine
- decisions/architecture/ops/seo-three-pillars
---



# Three-format feed publishing — RSS 2.0 + Atom 1.0 + JSON Feed

## Decision

Every content-bearing site in the family publishes **three feed
formats** at fixed paths:

| Path | Format | Spec | Service file |
|---|---|---|---|
| `/rss.xml` | RSS 2.0 | RSS Advisory Board | (Astro built-in / oriz-kit helper) |
| `/atom.xml` | Atom 1.0 | RFC 4287 | [services/seo/atom-feed.md](../../../services/seo/atom-feed.md) |
| `/feed.json` | JSON Feed v1.1 | jsonfeed.org | [services/seo/json-feed.md](../../../services/seo/json-feed.md) |

RSS 2.0 stays the **source-of-truth** for
[`oriz-omnipost`](../../../glossary/o-r/omnipost.md) cross-posting (locked
in [`cross-post-engine.md`](../general/cross-post-engine.md)); Atom + JSON
Feed are for human readers / modern feed-tooling that prefers those
formats.

## Why

Different feed readers / crawl pipelines auto-discover different
formats. Publishing only one loses subscribers using a reader that
can't auto-discover it. Concretely:

- **RSS 2.0** has the largest install base (Feedly, Inoreader,
  legacy readers, every podcast app), so it stays the canonical
  source.
- **Atom 1.0** is preferred by some older newsreaders + a few
  search-engine crawl pipelines that expect strict, namespaced XML
  with required IDs and timestamps.
- **JSON Feed v1.1** is preferred by modern dev-friendly readers
  (NetNewsWire, Feedbin, custom tooling that wants plain JSON instead
  of an XML parser).

Cost to publish all three: one build-step helper per format. There is
no runtime service, no quota, no card — they are static files served
by Cloudflare Pages.

## Implementation

`@chirag127/oriz-kit` ships:

- `<FeedDiscovery />` component — injects all three
  `<link rel="alternate">` tags into `<head>`:
  - `<link rel="alternate" type="application/rss+xml" href="/rss.xml" />`
  - `<link rel="alternate" type="application/atom+xml" href="/atom.xml" />`
  - `<link rel="alternate" type="application/feed+json" href="/feed.json" />`
- `generateRssFeed(posts)`, `generateAtomFeed(posts)`,
  `generateJsonFeed(posts)` helpers — each consumes the same `Post[]`
  shape, emits valid output.
- A single Astro integration that wires all three into `dist/` at
  `astro build` time on every site.

## Implications

- Every site repo's build step writes `dist/rss.xml`, `dist/atom.xml`,
  `dist/feed.json`.
- `<FeedDiscovery />` lands in the layout component every site
  inherits from oriz-kit — no per-site wiring.
- `oriz-omnipost` continues to read `/rss.xml` as the canonical feed
  for cross-posting; Atom + JSON Feed do NOT need omnipost adapters
  (they are for direct subscribers, not for fan-out).
- IndexNow ping ([`services/seo/indexnow.md`](../../../services/seo/indexnow.md))
  fires once per published canonical URL — independent of feed
  format.
- If a feed format spec evolves (Atom moves to a successor, JSON
  Feed v2), swap the generator helper in oriz-kit; every site picks
  it up via dependency bump.
- Per-extension changelogs (subdomains under `oriz.in`) follow the
  same three-format rule — readers should be able to subscribe to
  any extension's release stream in their preferred format.

## Cross-refs

- [Atom 1.0 feed service](../../../services/seo/atom-feed.md)
- [JSON Feed service](../../../services/seo/json-feed.md)
- [SEO services index](../../../services/seo/index.md)
- [Cross-post engine](../general/cross-post-engine.md) — RSS 2.0 is its source-of-truth
- [SEO three pillars](../ops/seo-three-pillars.md) — discovery / instant-indexing / semantic-markup; feeds ride alongside
- [oriz-kit glossary](../../../glossary/o-r/oriz-kit.md) — `<FeedDiscovery />` + generators live here
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
