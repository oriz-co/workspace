---
type: decision
title: "Markdown-in-repo only \u2014 no headless CMS, anywhere"
description: Every site stores content as .md / .mdx files in its own repo. Decap
  CMS, TinaCMS, Strapi, Sanity, Contentful, Storyblok and every other headless CMS
  are explicitly REJECTED.
tags:
- cms
- content
- markdown
- mdx
- no-vendor-lock-in
- monorepo
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- decisions/architecture/feeds-rss-atom-json.md
- decisions/branding/repo-naming-suffixes
- decisions/infrastructure/cloudflare-pages-for-all-sites
- decisions/process/one-branch-only-rule
- rules/interaction/never-hit-quotas
- rules/interaction/no-card-on-file
- rules/infrastructure/no-subscriptions
---



# Markdown-in-repo only — no headless CMS, anywhere

## Decision

Every site in the family stores **all** of its content as `.md` /
`.mdx` files committed to that site's own GitHub repository. The
build (Astro / Vite) reads the markdown at build time, renders to
static HTML, and ships to [Cloudflare Pages](../../infrastructure/cloudflare-pages-for-all-sites.md).
**No** headless CMS sits between the writer and the repo. Decap CMS,
TinaCMS, Strapi, Sanity, Contentful, Storyblok, Hygraph, Payload,
Directus, Keystatic, Outstatic, Pages CMS, Front Matter CMS — all
explicitly REJECTED.

User direction 2026-06-20: "Markdown-in-repo only (RECOMMENDED)" —
locked.

## Why

- **Zero infra cost.** No CMS server, no hosted-CMS subscription, no
  card on file. A `.md` file is the cheapest possible content store
  ([never-hit-quotas](../../../rules/interaction/never-hit-quotas.md) + [no-card-on-file](../../../rules/interaction/no-card-on-file.md) + [no-subscriptions](../../../rules/infrastructure/no-subscriptions.md)).
- **Version control IS the editorial workflow.** Git history = revision
  history; PRs = drafts; `main` = published; `git revert` = unpublish.
  The same workflow already used for code, applied to content.
- **MDX = full React power.** When prose needs an interactive widget,
  drop a component into the `.mdx` file. No CMS rich-text-block
  dance, no JSON-roundtrip, no preview-vs-prod drift.
- **No vendor lock-in.** `.md` is the most portable text format on
  earth. If GitHub disappears, the content still renders from any
  static-site generator on any host.
- **No CMS-specific schema migration.** Frontmatter is the schema;
  it lives next to the content; changing it is a `find -name '*.md' -exec sed`.
- **Deploy parity.** The same files that deploy the site deploy the
  content. No second authentication system, no second CDN, no second
  outage surface.

## Why not the rejected options

| Tool | Why rejected |
|---|---|
| Decap CMS (formerly Netlify CMS) | Adds a JS-heavy admin UI on top of git that does what `git commit` already does for free; abandoned-feel since the Netlify rebrand |
| TinaCMS | Free tier caps at 2 editors / 1K Tina Cloud documents — fights [`never-hit-quotas`](../../../rules/interaction/never-hit-quotas.md); paid tier requires card |
| Strapi (Cloud) | Hosted Strapi requires card; self-host fights [`no-self-host`] (we use only managed serverless) |
| Sanity / Contentful / Storyblok / Hygraph | Hosted SaaS with free tiers that cap; require credit card upgrade path; introduce a content-API runtime dependency the static site doesn't need |
| Payload / Directus / Keystone | Self-host or paid cloud; add a Postgres dependency we'd otherwise avoid for content |
| Keystatic / Outstatic / Pages CMS / Front Matter CMS | All git-backed CMSes that wrap `git commit` in a UI — solving a problem we don't have (we like writing markdown in our editor) |

## Implications

- **Authoring tools.** Use any markdown editor (VS Code is the family
  default). Front-matter validation runs in CI per
  [`decisions/process/code-quality-stack.md`](../../process/code-quality-stack.md).
- **Site-shaped content lives in the site's repo.** `oriz-blog-site/posts/*.mdx`,
  `oriz-books-site/reviews/*.mdx`, etc. No content lives in the
  master `chirag127/oriz` repo.
- **Cross-site content gets canonical-URL'd.** If two sites need the
  same fact, one site owns the source of truth as `.mdx` and the
  other links via canonical URL — never duplicates the file.
- **The `oriz-me` lifestream is the ONLY exception.** It uses
  newline-delimited JSON, not markdown — see
  [`lifestream-jsonl-canonical.md`](../database/lifestream-jsonl-canonical.md).
  That's a stream of timestamped events, not prose, so the data shape
  is genuinely different.
- **Image embedding follows the [4-tier image-host chain](./image-host-four-tier.md)** — Tier 1 puts images alongside the `.md` file in the same repo for the simple case.
- **Feed generation reads the markdown directly** — see
  [`feeds-rss-atom-json.md`](../content/feeds-rss-atom-json.md) for how
  `/rss.xml`, `/atom.xml`, `/feed.json` are generated at build time
  from the same source files.
- **Revisit trigger.** Re-open this decision only if a non-technical
  collaborator joins the family and explicitly cannot work in
  markdown-in-git. Until then, the answer is no.

## Cross-refs

- [4-tier image-host chain](./image-host-four-tier.md) — origin storage for images embedded in markdown
- [3-format feeds](../content/feeds-rss-atom-json.md) — RSS / Atom / JSON Feed generated from markdown at build time
- [Cloudflare Pages for all sites](../../infrastructure/cloudflare-pages-for-all-sites.md)
- [One-branch-only rule](../../process/one-branch-only-rule.md)
- [Repo-naming suffixes](../../branding/repo-naming-suffixes.md)
- [No subscriptions rule](../../../rules/infrastructure/no-subscriptions.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
- [Never-hit-quotas rule](../../../rules/interaction/never-hit-quotas.md)
