---
type: index
title: Design
description: Index of concepts in rules/design.
tags:
- index
- design
timestamp: '2026-06-24'
format_version: okf-v0.1
status: active
---

# Design

## Concepts

- [Design divergence is NOT duplication](./design-divergence-vs-dedup.md) — Per-app design-brief variants (Header, Wordmark, blog's MultiSearch, blog's astro.config) are intentionally divergent across apps and must NOT be forced into generic slot-based components. Footer is the ONE exception: it's a family-wide mega-sitemap and IS consolidated. The 25-lines × 3-apps dedup threshold applies to TRUE duplicates, not to components that share a name but implement different design briefs.
- [Frontend-design skill: distinctive intentional visual design for every UI](./frontend-design-skill-baked-in.md) — Permanently baked into knowledge per user mandate 2026-06-22 evening. This is the agent's design philosophy when building or reshaping any UI. Ground design in the subject. Hero is a thesis. Typography carries personality. Structure is information. Motion is deliberate. Match complexity to vision. Avoid AI-cluster defaults. Brainstorm-explore-plan-critique-build-critique-again. Restraint + self-critique (remove one accessory before publishing). Writing is design material — active voice, end-user side of screen, name by what people control.
- [No ad-slot rectangles reserved in markup](./no-ad-slots-in-markup.md) — Don't reserve empty `<div class="ad-slot">` boxes in HTML. AdSense, Ezoic, and Mediavine inject ads at runtime around organic content — pre-reserved slots hurt CLS, layout, and ad fill rate.
- [No emoji in site chrome](./no-emoji-in-chrome.md) — Never use emoji in nav, headers, footers, wordmarks, or page <title>. Use real SVG icons or typographic glyphs. Family-wide design rule across every oriz site.
- [Per-app distinctive frontend design — adopt the frontend-design skill principles family-wide](./per-app-distinctive-frontend-design.md) — Reversal of the 'family-wide chrome' decision (sweeps #3-#5). Each app gets a distinctive visual identity per the frontend-design skill: name the subject + audience + page's single job; ground design in the subject's world; pick a deliberate display+body+utility type stack PER APP; signature element; avoid AI-cluster defaults (cream/serif/terracotta, near-black + acid-green, broadsheet-with-hairlines unless brief calls for it); maximalist needs elaborate execution, minimal needs precision. CRITICAL: same things stay same family-wide (auth/billing/SEO/footer-data/tokens-base/8 navigation patterns); DIFFERENT things differ per-app (header chrome design, hero composition, type, palette, signature element, sidebar visual style). 4-nav surfaces decision STAYS structurally; visual design DIVERGES per-app.
