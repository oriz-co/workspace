---
type: rule
title: "Community packages first \u2014 prefer external dependencies over hand-rolling"
description: 'Locked 2026-06-23. Default to a well-maintained community library/package
  over hand-rolling. Reasons: less code we maintain, fewer bugs, more eyeballs on
  the dep. Caveats: dep must be MIT/Apache/ISC-licensed, have >100 stars OR be from
  a known-good org (Cloudflare, Vercel, Astro, Anthropic, Firebase, Hono, TanStack),
  and not pull in 50+ transitive deps. Override the prior ''lazy-third-party-first''
  uncertainty: yes, reach for the dep.'
tags:
- rule
- dependencies
- npm
- community
- build-vs-buy
- default-yes
timestamp: 2026-06-23
format_version: okf-v0.1
status: active
related:
- rules/agent/grill-on-loc-removal
- rules/interaction/match-surrounding-style
- rules/interaction/never-hit-quotas
---



# Community packages first

## Rule

When a problem has an established community solution (a maintained npm package, a known SDK, a documented framework), **use it**. Don't reinvent.

## Why

User explicitly stated 2026-06-23: *"using external dependency is a priority because I don't want to manage everything. I want maximum things to be imported by using community libraries and community packages."*

The trade-off math:
- 100 LOC of glue is 100 LOC we maintain forever
- A community dep is 0 LOC we maintain — until it breaks, then we fork or replace
- Most deps in the family ecosystem (Astro, Firebase, Hono, Tiptap, Recharts) outlive us
- Solo founder bandwidth is the binding constraint, not code-size

## When to USE a dep (default YES)

- Authentication flows → Firebase Auth, Clerk, Auth.js, Lucia, Better Auth
- HTTP frameworks → Hono (Workers/Deno/Lambda/Node)
- Rich text editors → Tiptap, Lexical, Editor.js
- Charts → ECharts, Recharts, Chart.js
- Form validation → Zod, Valibot
- Date/time → date-fns, dayjs (NOT moment — legacy)
- Cryptography → libsodium-wrappers, jose
- Image processing → sharp (Node), browser-image-compression
- PDF → jsPDF, pdf-lib
- Markdown → marked, micromark
- HTTP clients → ky, ofetch, native fetch
- ORMs / DB → drizzle, kysely, prisma
- File upload → @uppy/core (with adapters for our 5-host pipeline)

## When NOT to use a dep (case-by-case)

- The dep does WAY more than we need (e.g. lodash for one `groupBy` — write 3 lines instead)
- The dep pulls 50+ transitive deps for a 100-LOC feature
- Unmaintained: last commit >2 years ago + open issues piling up
- License is anything other than MIT / Apache 2.0 / ISC / BSD / 0BSD / CC-BY / CC0
- The dep adds >50 KB to a browser bundle for a feature that runs once

## Quick sanity check before adding a dep

```
- License compatible? (MIT/Apache/ISC/BSD/0BSD)
- Last commit < 12 months ago?
- Either >100 GitHub stars OR from a known-good org?
- Bundle size acceptable for the use case?
- Maintained TypeScript types (or strictly-typed source)?
```

If 5/5 yes → install. If 3-4 → grill once, then install. If <3 → hand-roll.

## Counter-rule precedence

This rule overrides any "minimal LOC" reflex. The `grill-on-loc-removal` rule still applies for DELETING code, but it doesn't apply to NOT-WRITING code in the first place. Install the dep.

The `match-surrounding-style` rule still applies for HOW the dep is invoked (idioms match the rest of the codebase).

## Cross-refs

- Grill on LOC removal → [[rules/grill-on-loc-removal]]
- Match surrounding style → [[rules/match-surrounding-style]]
- Never hit quotas → [[rules/never-hit-quotas]] (depends rule doesn't override quota math)
