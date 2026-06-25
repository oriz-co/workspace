---
type: rule
title: No ad-slot rectangles reserved in markup
description: "Don't reserve empty `<div class=\"ad-slot\">` boxes in HTML. AdSense,\
  \ Ezoic, and Mediavine inject ads at runtime around organic content \u2014 pre-reserved\
  \ slots hurt CLS, layout, and ad fill rate."
tags:
- rules
- ads
- monetisation
- layout
- design
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- policy/monetisation
- rules/design/no-emoji-in-chrome
---



# No ad-slot rectangles reserved in markup

Do not write empty `<div class="ad-slot">` (or `data-ad-slot`,
`<ins class="adsbygoogle">`, etc.) placeholder rectangles into static
HTML or templates. Let the ad provider inject ads at runtime against
the organic content tree.

## Why

The three ad networks the family is eligible for — AdSense, Ezoic,
Mediavine — all run client-side scripts that scan the rendered DOM and
insert ad units between paragraphs, after headers, in sidebars, etc.
Their fill, viewability, and revenue-per-mille all assume they're
choosing where to place ads.

Reserving empty rectangles in markup hurts on every axis:

- **Layout / CLS** — empty boxes either stay empty (visible blank
  rectangles when fill is low) or jolt visitors when an ad finally
  loads at a different size than reserved.
- **Fill rate** — Ezoic / Mediavine specifically optimise placement
  based on dwell-time and scroll heatmaps. Forcing them into a
  pre-decided slot prevents that optimisation.
- **Design coherence** — empty slots break the visual rhythm of the
  page on the most common case (no ad served).
- **Eligibility** — AdSense's policy explicitly requires that ad slots
  not be designed in a way that misleads users; tightly-styled empty
  rectangles can read as deceptive.

## What to do instead

- Write the page as if there were no ads.
- Let the ad-network script (loaded via the family monetisation pattern
  — see [policy/monetisation](../../policy/monetisation.md)) choose
  insertion points.
- If a specific section must never carry ads (legal pages, billing
  flows), mark it via the network's documented opt-out attribute
  (`data-ezoic-do-not-process`, `data-no-ads`, etc.) — never by
  surrounding it with a competing ad slot.

## Exceptions

None for production pages. Test fixtures may use mock slots while
verifying script behaviour.

## See also

- [`monetisation.md`](../../policy/monetisation.md)
