---
type: decision
title: "Family-wide /privacy page on oriz.in"
description: "Locked 2026-06-20: master oriz.in publishes a single canonical /privacy that the entire family (sites + extensions + workers + CLIs) references. Per-surface addenda (extension permission lists, site-specific data flows) live as nested pages so boilerplate stays in one place."
tags: [privacy, legal, branding, decisions, oriz-in, compliance]
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
  - services/legal/privacy-page
  - policy/privacy-policy-per-extension
  - policy/public-private-line
  - rules/no-card-on-file
---

# Family-wide /privacy page on oriz.in

## Decision

The master site at the apex (`oriz.in`) publishes **one** canonical
privacy policy at `oriz.in/privacy`. Every other surface in the
family — every site (`*.oriz.in`), every browser / VS Code
extension, every Cloudflare Worker, every CLI — links to that URL
as the legal source of truth and adds a per-surface addendum only
where the surface introduces new disclosures (e.g. extension
permission lists, site-specific data flows).

The pre-existing
[per-extension privacy policy policy](../../policy/privacy-policy-per-extension.md)
is **refined** by this decision, not superseded:

- **Before**: each extension page inlined common boilerplate by
  reference to a `oriz.in/privacy-base` page.
- **After**: the boilerplate page is renamed to `oriz.in/privacy`
  (the canonical family-wide policy); each extension page becomes an
  addendum at `oriz.in/privacy/extension/<name>` with permission
  list + data flow, linking back to `/privacy`.

## Why

The user's direction was: *"+ family-wide /privacy on oriz.in"*.
Three reasons make it the right shape:

1. **One operator, one policy** — every family surface is operated
   by the same person; data-flow patterns are common (Firebase Auth
   + Firestore + Cloudflare Pages); rewriting boilerplate per
   surface means drift.
2. **One URL to update** — when GDPR / DPDP / CCPA disclosure
   requirements change (annual review per existing policy),
   updating `oriz.in/privacy` propagates the change family-wide
   without re-deploying every site / extension / worker.
3. **Cleaner store-listings** — Chrome Web Store / Firefox / Edge /
   VS Code Marketplace each demand a privacy URL on the listing.
   Pointing at `oriz.in/privacy/extension/<name>` (an addendum) is
   accurate and store-policy-compliant; the addendum links back to
   `/privacy` for the boilerplate.

## Page layout (locked)

```
oriz.in/privacy                          ← canonical, family-wide
├── /privacy/<site>                      ← per-site addendum (when needed)
│   e.g. /privacy/blog, /privacy/me
├── /privacy/extension/<name>            ← per-extension addendum
│   e.g. /privacy/extension/oriz-bookmarks
├── /privacy/worker/<name>               ← per-worker addendum (when needed)
│   e.g. /privacy/worker/api, /privacy/worker/s
└── /privacy/cli/<name>                  ← per-CLI addendum (when needed)
```

Addenda exist only when the surface has surface-specific
disclosures. A purely-local extension that makes no network
requests does not need an addendum — the family boilerplate
covers it.

## Implications

- **`oriz.in/privacy` ships before any external launch** — every
  site / extension / worker references it; missing page = broken
  links across the family.
- **Source of truth** lives in
  `projects/apps/personal/oriz-cs-me-app/src/content/legal/privacy.md` (apex site
  hosts oriz.in per
  [`decisions/branding/oriz-me-added-to-family.md`](./oriz-me-added-to-family.md)).
- **Per-surface addendum template** lives in
  [`@chirag127/oriz-kit`](../../glossary/o-r/oriz-kit.md) so every
  site / extension / worker can scaffold its addendum from the
  same boilerplate.
- **Footer link** in every site's footer points at `oriz.in/privacy`
  (absolute URL, not relative) so even sites at non-oriz.in domains
  resolve to the canonical page.
- **Store listings** point at `oriz.in/privacy/extension/<name>`
  (addendum URL) — the addendum is the surface-specific page; the
  store-required disclosures live there with a link back to the
  family policy.
- **Annual review** (per
  [`policy/privacy-policy-per-extension.md`](../../policy/privacy-policy-per-extension.md))
  re-reads Chrome / Firefox / Edge / VS Code policies + GDPR / DPDP
  / CCPA, updates `oriz.in/privacy` once, propagates by reference.
- **Cookie + analytics disclosure** lives on the family page —
  references the [5-tier analytics stack](../architecture/analytics-five-tier-stack.md)
  and the [Klaro cookie banner](../security/cookie-banner-policy.md)
  so the consent surface and the policy stay aligned.

## Cross-refs

- [Family privacy page service](../../services/legal/privacy-page.md)
- [Per-extension privacy policy policy](../../policy/privacy-policy-per-extension.md) — refined by this decision
- [Public/private line policy](../../policy/public-private-line.md)
- [Cookie banner policy decision](../security/cookie-banner-policy.md)
- [5-tier analytics stack decision](../architecture/analytics-five-tier-stack.md)
- [oriz-me added to family](./oriz-me-added-to-family.md) — apex hosts master /privacy
- [No card-on-file rule](../../rules/no-card-on-file.md)
