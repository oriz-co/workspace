---
type: decision
title: 'Charts: Apache ECharts (lazy per page) covers every chart type'
description: 'ECharts (Apache-2.0, 50+ chart types) is the family-wide chart library.
  ~300 KB gzip but lazy-loaded ONLY on pages with charts (zero hit on non-chart pages).
  Apps that load ECharts: paisa-finance + janaushdhi + stats.oriz.in + blog post embeds
  + others as new apps need charts. Client-side interactive rendering (no SSR for
  charts in v0). Provides line / bar / pie / scatter / candlestick / boxplot / treemap
  / sunburst / heatmap / radar / sankey / parallel / gauge / funnel / geo (map) /
  3D / chord / liquidFill / wordCloud / graph (network).'
tags:
- decision
- charts
- echarts
- lazy-load
- visualization
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
supersedes_in_part: "decisions/architecture/minimal-ui-library-set (chart row only\
  \ \u2014 Chart.js \u2192 ECharts)"
related:
- decisions/architecture/minimal-ui-library-set
- decisions/architecture/ops/seo-a11y-cdn-ssl
- rules/interaction/never-hit-quotas
---



# Apache ECharts as the family chart library

## Decision

**Apache ECharts** (Apache-2.0, ~300 KB gzip) becomes the family-wide chart library. Lazy-loaded per chart page; zero bundle hit on non-chart pages.

User mandate (2026-06-22): "I want many types of charts and very very very kind of charts and graph and all of the charts in graph which are possible in this world." ECharts has 50+ types — the broadest free library.

## Chart types supported

| Category | Types |
|---|---|
| **Time series** | line, area, candlestick, OHLC, river |
| **Categorical** | bar, stacked-bar, horizontal-bar, grouped-bar |
| **Distribution** | pie, doughnut, rose, boxplot, histogram |
| **Correlation** | scatter, bubble, parallel, splom |
| **Hierarchical** | treemap, sunburst, sankey, chord |
| **Geo / spatial** | geo-map, choropleth, scatter-on-map, heatmap-on-map |
| **Specialized** | gauge, funnel, radar, polar, calendar, wordCloud, liquidFill, graph (network) |
| **3D (extension)** | 3D-bar, 3D-scatter, 3D-line, 3D-surface, globe |
| **Custom** | render any SVG/Canvas via custom series |

## Apps loading ECharts (initial)

- `oriz-paisa-finance-tools-app` — FII/DII candlesticks, sector pies, MMI gauge
- `oriz-janaushdhi-app` — price history lines per medicine, savings calculator bars
- `oriz-stats-app` (stats.oriz.in) — visits/downloads/stars time-series, sankey funnel, geo heatmap
- `oriz-pages-blog-app` — MDX `<Chart>` component for post embeds
- Future apps as needed

## Load strategy: lazy per chart page

Each chart page imports ECharts via dynamic `import()`:

```ts
// In the chart page component:
import { onMount } from 'preact';
let chart;
onMount(async () => {
  const echarts = await import('echarts');  // 300 KB downloaded ONLY here
  chart = echarts.init(document.getElementById('chart'));
  chart.setOption({ ... });
});
```

Non-chart pages: ZERO ECharts bytes. Lighthouse perf score unaffected on home page, listing pages, marketing pages, etc.

## Bundle budget per chart page

| Surface | Budget |
|---|---|
| Critical CSS + JS (no ECharts) | < 50 KB gzip |
| ECharts (lazy after first paint) | ~300 KB gzip |
| Chart data payload | < 50 KB gzip per chart |
| **Total page weight at first interaction** | < 400 KB gzip |

Pa11y CI + Lighthouse perf ≥85 enforced for chart pages (lower than 90 target for non-chart pages because ECharts is the necessary 300 KB).

## Server-side rendering

**v0: client-side only.** Charts hydrate on user open. SEO impact: chart pages get a `<noscript>` fallback with a static SVG snapshot (rendered server-side at build via `echarts-html` headless rendering).

**v1+ (deferred):** evaluate ECharts SSR via `echarts-html` + node-canvas for fully-rendered SVG. Adds build time, gains SEO.

## Wrapper component

`@chirag127/astro-widgets/EChart.astro` exports:

```astro
---
import EChart from '@chirag127/astro-widgets/EChart.astro';
---
<EChart type="line" data={...} options={{...}} />
```

Handles: lazy load, fallback SVG, ARIA labels, theme integration with `astro-shell/tokens.css`.

## Supersedes in part

`decisions/architecture/minimal-ui-library-set.md` listed Chart.js for charts. Replaced with ECharts here. Other library picks in minimal-ui-library-set (shadcn / Radix / Lucide / Motion One) stay.

## Cross-refs

- Minimal UI library set → [[decisions/architecture/minimal-ui-library-set]]
- SEO + a11y + perf → [[decisions/architecture/seo-a11y-cdn-ssl]]
- Never hit quotas → [[rules/never-hit-quotas]]
