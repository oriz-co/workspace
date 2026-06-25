---
type: rule
title: "Per-app distinctive frontend design \u2014 adopt the frontend-design skill\
  \ principles family-wide"
description: 'Reversal of the ''family-wide chrome'' decision (sweeps #3-#5). Each
  app gets a distinctive visual identity per the frontend-design skill: name the subject
  + audience + page''s single job; ground design in the subject''s world; pick a deliberate
  display+body+utility type stack PER APP; signature element; avoid AI-cluster defaults
  (cream/serif/terracotta, near-black + acid-green, broadsheet-with-hairlines unless
  brief calls for it); maximalist needs elaborate execution, minimal needs precision.
  CRITICAL: same things stay same family-wide (auth/billing/SEO/footer-data/tokens-base/8
  navigation patterns); DIFFERENT things differ per-app (header chrome design, hero
  composition, type, palette, signature element, sidebar visual style). 4-nav surfaces
  decision STAYS structurally; visual design DIVERGES per-app.'
tags:
- rule
- design
- frontend
- per-app
- distinctive
- identity
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
supersedes_in_part: decisions/architecture/minimal-ui-library-set (we still use shadcn+Radix
  as primitives, but per-app brand differs)
related:
- decisions/architecture/frontend/four-nav-surfaces-every-app
- decisions/architecture/minimal-ui-library-set
- rules/design/design-divergence-vs-dedup
- decisions/architecture/apps/per-app-briefs-2026-06-22
---



# Per-app distinctive frontend design

## Reversal context

Earlier (sweeps #3-#5) we tried family-wide chrome (Header/Footer/Wordmark/Sidebar/BottomBar). After three iterations:
- Sweep #3 + #4 consolidated → user said "remove per-app content"
- Sweep #5 reverted → restored per-app content
- **Tonight (2026-06-22 final)**: user said "I think it was a bad idea to decide that each app will have same Header/Footer/Sidebar/BottomBar. They have different taste. Follow frontend-design skill properly."

## What stays same family-wide

- `@chirag127/astro-shell` shell() + token base layer (CSS custom properties, mostly overridden per-app)
- `@chirag127/astro-chrome/Footer.astro` mega-sitemap data SOURCE (FAMILY_APPS/BOOKS/PACKAGES) — but footer's visual TREATMENT may differ per app
- `@chirag127/astro-billing` Pricing page (single tier table; same prices)
- `@chirag127/oriz-seo` per-page meta + JSON-LD
- `@chirag127/oriz-analytics` analytics wrappers
- `@chirag127/oriz-consent` consent banner
- `@chirag127/oriz-rate-limit` usage caps
- `@chirag127/oriz-ai-providers` LLM fallback chain
- Firebase Auth + Firestore (cross-app SSO)

## What differs per-app

- **Header design** — per-app composition (broadsheet meta-row, sticky narrow bar, command palette, etc.)
- **Wordmark** — per-app typographic treatment
- **Sidebar visual style** — drawer, sticky column, floating dock, etc.
- **BottomBar visual style** — only when present; minimal vs labeled, fixed vs floating
- **Hero composition** — different "thesis" per app
- **Type stack** — display + body + utility per-app (subject-driven)
- **Color palette** — 4-6 hex per app, subject-driven, not cluster defaults
- **Signature element** — one unique memorable thing per app
- **Motion** — orchestrated moment per app

## Frontend-design skill principles (locked into knowledge)

### Ground in the subject

If the brief doesn't pin the product, pin it. Name one concrete subject, audience, page's single job. Build with the brief's real content. The subject's vernacular is where distinctive choices come from.

### Hero is a thesis

Open with the most characteristic thing in the subject's world (headline / image / animation / live demo / interactive moment). Be deliberate.

### Typography carries personality

Pair display + body deliberately, not defaults. Set type scale with intentional weights, widths, spacing. Make type itself a memorable part.

### Structure is information

Numbering, eyebrows, dividers, labels encode TRUE things about the content, not decoration. `01 / 02 / 03` only if content is a real sequence.

### Motion deliberate

Page-load sequence, scroll-triggered reveal, hover micro-interaction, ambient atmosphere. Orchestrated moment > scattered effects. Sometimes less is more.

### Match complexity to vision

Maximalist needs elaborate execution. Minimal needs precision.

### Consider written content

Copy can make a design feel templated. Real words from the subject's world. Active voice. Name things by what people control. Failure/empty states = direction, not mood. Plain verbs, sentence case, no filler.

### AI-cluster defaults to avoid (unless brief calls for them)

1. Warm cream `#F4F1EA` + high-contrast serif + terracotta accent
2. Near-black bg + acid-green / vermilion accent
3. Broadsheet hairline rules + zero border-radius + dense columns

These are LEGITIMATE for some briefs but if the brief leaves an axis free, DON'T default to one of these.

### Process

Brainstorm → explore → plan → critique → build → critique again.

Compact token system per page: 4-6 hex palette + 2+ type roles + layout concept + signature element.

Review plan against brief: if any part reads as generic default, revise + say what changed.

### Quality floor without announcing it

Responsive down to mobile. Visible keyboard focus. Reduced motion respected. Take screenshots; remove one accessory before publishing.

## Per-app design brief workflow

For each of 26 apps, write a brief file at `<app>/knowledge/design-brief.md`:
- Subject + audience + page's single job
- 4-6 hex palette (named)
- Display + body + utility type stack
- Layout concept (1-sentence + ASCII wireframe)
- Signature element

The design agent runs this brief through the frontend-design skill, generates the per-app chrome, commits.

## Cross-refs

- 4-nav surfaces (structural family-wide; visual now per-app) → [[decisions/architecture/four-nav-surfaces-every-app]]
- Minimal UI library set (primitives stay; brand differs) → [[decisions/architecture/minimal-ui-library-set]]
- Design divergence rule → [[rules/design-divergence-vs-dedup]]
- Per-app briefs → [[decisions/architecture/per-app-briefs-2026-06-22]]
