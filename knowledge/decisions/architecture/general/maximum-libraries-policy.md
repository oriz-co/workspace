---
type: decision
title: "Maximum libraries policy \u2014 reverse 'minimal-libraries'; consume community\
  \ libs heavily"
description: 'User reversed the minimal-libraries decision (2026-06-22 evening): use
  MAXIMUM number of community libraries so we write less code ourselves. Every `@chirag127/oriz-*`
  and `@chirag127/astro-*` package internally uses community libraries as much as
  possible. Goal: 90% community code / 10% glue. Performance impact mitigated by Astro
  per-route island hydration + tree-shaking + lazy-load.'
tags:
- decision
- libraries
- community
- max-deps
- supersedes
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
supersedes: decisions/architecture/minimal-ui-library-set
related:
- decisions/architecture/max-ui-library-set
- decisions/architecture/packages/four-more-packages-22-total
- rules/interaction/never-hit-quotas
- rules/interaction/no-card-on-file
---



# Maximum libraries policy

## Reversal

User mandate (2026-06-22 evening): "We are not deleting the minimal library use, we are choosing the maximum library use. We will use maximum number of libraries so that we have lesser and lesser number of handwritten code. In our repositories, everything is taken on from the community libraries. And from our own generated libraries, and our own generated libraries will also use the community libraries as much as possible."

This SUPERSEDES `minimal-ui-library-set.md` (which itself superseded `max-ui-library-set.md` earlier the same day). Net effect: **back to maximum libraries**, with performance mitigation via lazy-load + tree-shake.

## Adopted libraries (re-confirmed)

### UI primitives
- **shadcn/ui** (copy-paste, MIT)
- **Radix UI primitives** (~20 KB, MIT)
- **Headless UI (Tailwind Labs)** (~10 KB, MIT) — re-added
- **Park UI + Ark UI** (~15 KB, MIT) — re-added
- **Aria Components (React Aria)** (~12 KB, MIT) — new
- **Mantine** (alt source for complex widgets, MIT) — new

### Icons
- **Iconify aggregator** (Lucide + Tabler + Phosphor + Material Symbols + Heroicons + Simple Icons + Bootstrap Icons + Carbon + Lineicons + Solar). Tree-shaken per-page; only used icons ship.

### Charts
- **Apache ECharts** (Apache-2.0, 50+ types, lazy)
- **Chart.js** (alt lighter for simple charts)
- **Visx** (D3-based, for custom viz)
- **uPlot** (ultra-fast time-series)
- **Plotly** (scientific viz, lazy)
- Pick best for each chart type per page; not one-size-fits-all.

### Animation
- **Tailwind transitions** + **Astro View Transitions** (CSS only)
- **Motion One** (~6 KB)
- **Anime.js** (~10 KB)
- **AutoAnimate** (~3 KB, list animations)
- **Lottie-React** (for designer-authored animations, lazy)
- **Spring** (react-spring physics)

### Forms
- **React Hook Form** + **Zod** (already in astro-forms)
- **Conform.dev** (progressive enhancement)
- **TanStack Form** (alt headless)
- **Formik** (legacy compat where needed)

### State + Data
- **TanStack Query** (server state)
- **Zustand** + **Jotai** (atomic state)
- **Valtio** (proxy state)
- **nanostores** (Astro-friendly islands)

### Tables
- **TanStack Table** (headless)
- **AG Grid Community** (heavy data tables, MIT community edition)

### Date + time
- **date-fns** + **dayjs** + **luxon** + **Temporal polyfill** (pick per-page)

### DnD
- **dnd-kit** (lazy)
- **react-beautiful-dnd** (legacy)

### Toasts + modals
- **Sonner** + **react-hot-toast** + **Vaul** (mobile sheet)

### Editor
- **TipTap** (rich text)
- **CodeMirror** (code)
- **Monaco** (code, heavier alt)
- **Lexical** (Meta's editor framework)

### PDF + image
- **pdf-lib** + **pdfjs-dist** (client PDF)
- **Squoosh codecs** (image compress)
- **@imgly/background-removal-js** (BG removal)
- **html2canvas** + **rasterizehtml** (HTML→image)
- **face-api.js** (face blur)
- **Tesseract.js** (OCR)

### Audio + video
- **ffmpeg.wasm** (lazy, heavy)
- **lamejs** (MP3 encode)
- **Tone.js** (audio synth)
- **wavesurfer.js** (waveform display)

### Markdown + content
- **MDX** + **shiki** (syntax highlight) + **rehype-pretty-code** + **KaTeX** + **remark-toc** + **remark-gfm**

### Why this works for performance

- **Astro per-route islands** — only hydrate components on routes that use them.
- **Tree-shaking** — bundlers strip unused exports.
- **Dynamic `import()`** — heavy libs (ffmpeg.wasm 30MB, ECharts 300KB, pdf-lib 200KB, bg-removal 30MB WASM) lazy-load on first feature use.
- **Per-page bundle budget** still enforced (<50 KB critical / <500 KB total for non-heavy tools).
- **Lighthouse perf gate** stays at ≥85.

## Our own packages: also lean on community

Every `@chirag127/oriz-*` and `@chirag127/astro-*` package wraps community libraries — does NOT re-implement. Examples:
- `@chirag127/astro-forms` wraps `react-hook-form` + `zod` (does not re-build form state)
- `@chirag127/oriz-rate-limit` wraps `firebase-admin/firestore` counters
- `@chirag127/astro-billing` wraps Razorpay SDK + Paddle SDK + Firebase Auth
- `@chirag127/oriz-seo` wraps `@astrojs/sitemap` + `satori` + `astro-seo`

## Cross-refs

- Superseded minimal-libs → [[decisions/architecture/minimal-ui-library-set]]
- Earlier "max libs" first reversal → [[decisions/architecture/max-ui-library-set]]
- The 4 new packages → [[decisions/architecture/four-more-packages-22-total]]
- Never hit quotas → [[rules/never-hit-quotas]]
- No card on file → [[rules/no-card-on-file]]
