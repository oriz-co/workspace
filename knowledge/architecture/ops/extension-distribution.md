---
type: architecture
title: "Extension distribution \u2014 Chrome, Firefox, Edge, automated"
description: Every extension is its own GitHub repo, submoduled under extensions/.
  Each repo has its own CI workflow that publishes to Chrome Web Store, Firefox Add-ons,
  and Edge Add-ons on release. Landing pages live on extensions.oriz.in (with a copy
  at oriz.in/extensions).
tags:
- architecture
- extensions
- distribution
- ci
- chrome
- firefox
- edge
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- architecture/ops/repo-layout
- architecture/ops/submodule-pattern
- architecture/security/cross-site-auth-via-auth-oriz-in
- architecture/frontend/layer-2-survival-fallback
---



# Extension distribution — Chrome, Firefox, Edge, automated

## Concept

Browser extensions are published to all three major stores (Chrome,
Firefox, Edge). Each extension is its own repo, submoduled under
`extensions/<name>/`. Each repo owns its own CI + cross-store publish
workflow. ONE catalog at `extensions.oriz.in` lists every extension
and is also rendered on `oriz.in/extensions` for cross-promo.

## How it works

- Per-extension repo at `chirag127/<extension-name>`
- Submoduled under `extensions/<name>/` in the master oriz repo
- Each repo's `.github/workflows/publish.yml` packages the build and
  pushes to Chrome Web Store, Firefox Add-ons, and Edge Add-ons —
  triggered by tag push or release
- Landing pages: ONE catalog site at `extensions.oriz.in` (lives in
  its own submodule, hosted on GitHub Pages — see below) listing every
  extension at route `/<slug>/`. The same content is mirrored on
  `oriz.in/extensions` for the home-site cross-promo.
- Extension landing pages are **hosted on GitHub Pages**, not
  Cloudflare Pages — they're not monetised individually so the
  Cloudflare slot can stay reserved for the actual sites. GitHub
  Pages limits (100 GB/month, 1 GB cap) are plenty.
- GitHub Pages and "commercial intent": describing a paid extension
  on a landing page is NOT "primarily directed at facilitating
  commercial transactions" — checkout happens inside the extension,
  not on the landing page. GitHub Pages is fine.
- Auth in extensions:
  - Primary: Firebase Auth via
    `chrome.identity.launchWebAuthFlow()` bouncing through
    `auth.oriz.in`. ID token in `chrome.storage.local`
  - Fallback: license-key system. User pays once, gets a key, pastes
    into the extension. No Firebase dependency. For paranoid privacy
    users.

## Why this shape

Three forces shape this:
- Each store has its own review queue and signing key. Per-repo CI
  isolates a rejection so it doesn't block the whole family.
- Landing pages need to be discoverable but they're cheap and
  slow-changing — GitHub Pages is the right tier.
- Auth re-uses the family's `auth.oriz.in` flow so an extension user
  is the same Firebase user as a site user, and ONE subscription
  unlocks both surfaces.

## Cross-refs

- Where extensions sit in the repo layout → [repo-layout.md](./repo-layout.md)
- The submodule mechanics → [submodule-pattern.md](./submodule-pattern.md)
- How extension auth shares state with sites → [cross-site-auth-via-auth-oriz-in.md](../security/cross-site-auth-via-auth-oriz-in.md)
- The GitHub-Pages-as-fallback pattern → [layer-2-survival-fallback.md](../frontend/layer-2-survival-fallback.md)
