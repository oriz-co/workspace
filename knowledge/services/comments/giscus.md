---
type: service
title: "Giscus"
description: "GitHub-Discussions-backed comments — free forever, no card. Click-to-load privacy posture, light/dark theme aware."
tags: [comments, giscus, github-discussions, primary]
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
role: blog-comments
provider: giscus (OSS, app.giscus.app)
free_tier: "Free forever — no quota, no card; backed by per-site GitHub Discussions tab"
swap_cost: low
related:
  - decisions/security/consent-management-multi-category
  - decisions/branding/repo-naming-suffixes
  - services/comments/index
  - rules/no-card-on-file
---

# Giscus

## Role

Comment system for long-form content sites in the family —
[`oriz-blog-site`](../../decisions/branding/repo-naming-suffixes.md)
and `oriz-book-lore-site`. App sites
(`oriz-finance-site` / `oriz-image-tools-site` /
`oriz-home-site` / `oriz-me-site`) do **NOT** carry comments.

Giscus stores every thread as a **GitHub Discussion** in the same
per-site repo (e.g. `chirag127/blog-site`'s `Discussions` tab),
mapped 1:1 to the post's URL/path/title via Giscus's `mapping`
config. There is no separate comment database, no separate moderation
console — the GitHub Discussions tab is the storage and the moderation
UI.

## Free tier

- Free forever, no card, no usage quota
- Unlimited comments / discussions / sites / threads
- Storage = the per-site repo's GitHub Discussions tab (also free)
- Backed by the GitHub `giscus-app` GitHub App — no server we run

## Card / subscription required?

**NO.** Giscus is OSS at [`giscus/giscus`](https://github.com/giscus/giscus).
Setup = enable Discussions on the per-site repo + install the
`giscus` GitHub App on it. Auth on the reader side is GitHub login;
no Giscus account exists.

## Click-to-load contract (per consent decision)

Per [`decisions/security/consent-management-multi-category.md`](../../decisions/security/consent-management-multi-category.md),
the Giscus iframe is **NOT** loaded on first paint. The post page
renders a placeholder:

```astro
<!-- in @chirag127/oriz-kit/comments/Giscus.astro -->
<div id="comments">
  <button data-load-giscus>Load comments</button>
</div>
<script>
  document.querySelector('[data-load-giscus]')?.addEventListener('click', () => {
    const s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.dataset.repo = import.meta.env.PUBLIC_GISCUS_REPO;
    s.dataset.repoId = import.meta.env.PUBLIC_GISCUS_REPO_ID;
    s.dataset.category = 'Comments';
    s.dataset.categoryId = import.meta.env.PUBLIC_GISCUS_CATEGORY_ID;
    s.dataset.mapping = 'pathname';
    s.dataset.theme = matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark_protanopia' : 'light_protanopia';
    s.crossOrigin = 'anonymous';
    s.async = true;
    document.getElementById('comments')?.appendChild(s);
  }, { once: true });
</script>
```

Until the user clicks, **zero** Giscus / GitHub bytes are fetched, no
iframe, no `github.com` session cookie. This sidesteps the consent
banner gate entirely — no third-party load, no consent question.

## Theme awareness

Giscus's `theme` parameter is set per page-load from
`prefers-color-scheme`. The site's existing dark-mode toggle dispatches
a `setConfig` postMessage to the iframe (after it loads) so theme
changes flow through without a reload.

## Used on

- [`chirag127/blog-site`](../../decisions/branding/repo-naming-suffixes.md)
  — blog post discussions, mapped by `pathname`
- [`chirag127/lore`](../../decisions/branding/repo-naming-suffixes.md)
  — per-book review discussions, mapped by `title`

NOT on app sites — utility apps don't carry a comments surface (see
[`services/comments/index.md`](./index.md) for the rationale).

## Alternatives

- utterances (predecessor; uses GitHub Issues — Discussions is
  threadier and has reactions)
- Disqus (ad-injected, privacy-hostile, requires consent banner)
- Cusdis / Remark42 self-hosted (extra infra to run; fights
  [`rules/no-card-on-file`](../../rules/no-card-on-file.md) only if
  hosted on paid tiers)
- Hyvor Talk (paid past trial)

## Swap cost

Low — the `<Giscus />` Astro component in
[`@chirag127/oriz-kit`](../../glossary/o-r/oriz-kit.md) isolates the
script-load surface. Swap = replace the `client.js` URL + the
data-attributes; comment data does not migrate (lives in GitHub
Discussions and stays there even if the widget changes).

## Why this is our pick

- Free forever, no card.
- Storage = GitHub Discussions on the SAME repo we already use for
  the site's source — zero new vendor surface.
- Auth = GitHub login (the family's audience already has a GitHub
  account; recruiters and OSS readers are the target).
- Click-to-load fits the family's
  [consent posture](../../decisions/security/consent-management-multi-category.md)
  — no third-party load until the user asks for it.

## Cross-refs

- [Comments services index](./index.md)
- [Consent management multi-category decision](../../decisions/security/consent-management-multi-category.md)
- [Repo naming suffixes decision](../../decisions/branding/repo-naming-suffixes.md)
- [oriz-kit glossary](../../glossary/o-r/oriz-kit.md) — `<Giscus />` lives here
- [No card-on-file rule](../../rules/no-card-on-file.md)
