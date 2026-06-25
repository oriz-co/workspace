---
type: rule
title: No emoji in site chrome
description: Never use emoji in nav, headers, footers, wordmarks, or page <title>.
  Use real SVG icons or typographic glyphs. Family-wide design rule across every oriz
  site.
tags:
- rules
- design
- emoji
- chrome
- branding
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- design/_family-rules
- rules/interaction/match-surrounding-style
---



# No emoji in site chrome

Don't use emoji characters anywhere in the site chrome — that is, in
navigation links, headers, footers, wordmarks, page `<title>` tags,
breadcrumbs, button labels, or any other element that frames the
content rather than being the content.

## Why

Per the family design briefs ([design/_family-rules](../../design/_family-rules.md))
the visual identity across every `oriz-*` site is "quiet, typographic,
considered". Emoji break that on multiple axes:

- **Inconsistent rendering** — every OS, browser, and font fallback
  renders the same codepoint differently. The wordmark looks
  professional on macOS Safari and like a Slack message on Windows
  Chrome.
- **SEO + accessibility** — emoji in `<title>` or `<h1>` ship to search
  result snippets and screen readers as ambiguous text. Real SVG icons
  with `aria-label` are clearer for both.
- **Tone** — emoji read as casual / startup / playful. The family
  voice across blog, books, finance, journal is closer to a quiet
  notebook than a Slack channel.
- **Long-term durability** — emoji standards drift; a 2026 emoji may
  render as a fallback box in 2031.

## What to use instead

- **SVG icons** for any glyph the chrome needs (theme toggle, RSS,
  external-link arrow, search). Inline SVG with `aria-hidden="true"`
  when paired with text, or `aria-label` when standing alone.
- **Typographic glyphs** like `→` `↗` `·` `—` for arrows, separators,
  em-dashes. Real Unicode punctuation, not emoji.
- **No icon at all** when text alone is clearer.

## Where it's allowed

Emoji are fine in **content** — blog post bodies, journal entries,
quoted source material, book quotes. The rule is specifically about
chrome. They are also fine in commit messages and developer-facing
README files (those aren't site chrome).

## See also

- [`_family-rules.md`](../../design/_family-rules.md)
