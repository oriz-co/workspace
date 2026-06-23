// Scaffold v0 for each empty tools app.
// Generates: package.json (replaced), astro.config.mjs, tsconfig.json,
//            src/pages/index.astro, src/pages/about.astro, src/pages/contact.astro,
//            src/pages/legal/{privacy,terms,disclaimer}.astro,
//            src/layouts/BaseLayout.astro, src/styles/global.css,
//            public/favicon.svg, public/robots.txt
//
// Run from c:/D/oriz: node scripts/scaffold-empty-tools.mjs

import { APPS } from './_scaffold-apps-data.mjs'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve('projects/oriz/own/prod/apps/tools')

function writeFile(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, content)
}

function pkgJson(app) {
  return JSON.stringify({
    name: app.pkg,
    type: 'module',
    version: '0.1.0',
    private: true,
    description: app.description,
    packageManager: 'pnpm@10.34.3',
    engines: { node: '>=22.12.0' },
    scripts: {
      dev: 'astro dev',
      build: 'astro build',
      preview: 'astro preview',
      typecheck: 'astro check',
      lint: 'biome check .',
      'lint:fix': 'biome check --write .',
      format: 'biome format --write .',
      astro: 'astro',
      test: 'vitest run',
      'test:watch': 'vitest',
      'test:e2e': 'playwright test',
      'test:coverage': 'vitest run --coverage',
    },
    dependencies: {
      '@astrojs/mdx': '^6.0.0',
      '@astrojs/react': '^5.0.0',
      '@astrojs/sitemap': '^3.7.0',
      '@chirag127/astro-shell': '^0.1.3',
      '@tailwindcss/vite': '^4.3.1',
      astro: '^6.4.7',
      react: '^19.2.7',
      'react-dom': '^19.2.7',
      tailwindcss: '^4.3.1',
    },
    devDependencies: {
      '@astrojs/check': '^0.8.0',
      '@biomejs/biome': '^2.4.9',
      '@types/react': '^19.1.0',
      '@types/react-dom': '^19.1.0',
      typescript: '^6.0.2',
      vitest: '^2.0.0',
      '@vitest/coverage-v8': '^2.0.0',
      '@vitest/ui': '^2.0.0',
      'happy-dom': '^15.0.0',
      '@playwright/test': '^1.48.0',
      '@chirag127/astro-test-utils': '^0.1.1',
    },
  }, null, 2) + '\n'
}

function astroConfig(app) {
  return `// @ts-check
import { shell } from '@chirag127/astro-shell/shell'

export default shell({ site: '${app.site}', includeMdx: false })
`
}

function tsconfig() {
  return JSON.stringify({
    extends: 'astro/tsconfigs/strict',
    compilerOptions: {
      baseUrl: '.',
      paths: { '~/*': ['src/*'] },
      jsx: 'preserve',
    },
    include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.astro', '.astro/types.d.ts'],
    exclude: ['dist', 'node_modules'],
  }, null, 2) + '\n'
}

function envDts() {
  return `/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
`
}

function globalCss(app) {
  const p = app.palette
  return `:root {
  --ink: ${p.ink};
  --paper: ${p.paper};
  --paper-2: color-mix(in oklab, ${p.paper} 92%, ${p.ink} 8%);
  --accent: ${p.accent};
  --rule: ${p.rule};
  --muted: ${p.muted};
  --font-display: ${app.typeStack.display};
  --font-mono: ${app.typeStack.mono};
  --container-prose: 68ch;
  color-scheme: ${app.darkMode ? 'dark' : 'light'};
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-display);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
a:hover { text-decoration-thickness: 2px; }

.smallcaps { text-transform: lowercase; font-variant: small-caps; letter-spacing: 0.08em; }
.mono { font-family: var(--font-mono); }

.skip-link { position: absolute; left: -9999px; }
.skip-link:focus { left: 1rem; top: 1rem; background: var(--ink); color: var(--paper); padding: 0.5rem 1rem; z-index: 999; }

main { max-width: var(--container-prose); margin: 0 auto; padding: 3rem clamp(1.25rem, 4vw, 2rem); }

header.site {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 1.25rem clamp(1.25rem, 4vw, 2rem);
  border-bottom: 1px solid var(--rule);
}
header.site .wordmark { font-family: var(--font-display); font-weight: 600; font-size: 1.125rem; color: var(--ink); text-decoration: none; letter-spacing: -0.01em; }
header.site nav { display: flex; gap: 1.25rem; font-size: 0.875rem; }
header.site nav a { color: var(--muted); text-decoration: none; }
header.site nav a:hover { color: var(--ink); }

footer.site {
  border-top: 1px solid var(--rule);
  padding: 2rem clamp(1.25rem, 4vw, 2rem);
  color: var(--muted);
  font-size: 0.8125rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
  justify-content: space-between;
}
footer.site a { color: var(--muted); text-decoration: none; }
footer.site a:hover { color: var(--ink); text-decoration: underline; }
`
}

function baseLayout(app) {
  const safeTitle = `${app.title} — ${app.tagline}`.replace(/'/g, "\\'")
  const safeDesc = app.description.replace(/'/g, "\\'")
  return `---
import '~/styles/global.css'

interface Props {
  title?: string
  description?: string
}

const { title = '${safeTitle}', description = '${safeDesc}' } = Astro.props
const canonical = new URL(Astro.url.pathname, '${app.site}').toString()
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content={Astro.generator} />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:type" content="website" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?${app.googleFonts}" rel="stylesheet" />
  </head>
  <body>
    <a href="#main" class="skip-link">Skip to content</a>
    <header class="site">
      <a class="wordmark" href="/">${app.short}</a>
      <nav>
        <a href="/">tools</a>
        <a href="/about/">about</a>
        <a href="/pricing/">pricing</a>
        <a href="https://auth.oriz.in/sign-in">sign in</a>
      </nav>
    </header>
    <main id="main"><slot /></main>
    <footer class="site">
      <span>${app.title} · part of the <a href="https://oriz.in">oriz</a> family · runs in your browser</span>
      <span>
        <a href="/about/">about</a> · <a href="/contact/">contact</a> · <a href="/legal/privacy/">privacy</a> · <a href="/legal/terms/">terms</a> · <a href="/legal/disclaimer/">disclaimer</a>
      </span>
    </footer>
  </body>
</html>
`
}

function indexPage(app) {
  const featuresList = app.features
    .map((f) => `    { slug: '${f.slug}', label: ${JSON.stringify(f.label)} },`)
    .join('\n')
  return `---
/*
 * ${app.title} — v0. Feature grid. Each feature is wired as a card; the
 * first one or two work end-to-end, the rest are stubs marked "Coming v0.1".
 *
 * Design: ${app.eyebrow} — palette + type stack chosen to match the subject.
 */
import BaseLayout from '~/layouts/BaseLayout.astro'

const features = [
${featuresList}
]
const totalFeatures = features.length
---
<BaseLayout>
  <article class="home">
    <header class="hero">
      <p class="eyebrow smallcaps">${app.eyebrow}</p>
      <h1 class="h1">${app.tagline}</h1>
      <p class="lede">${app.description}</p>
      <p class="meta mono">{totalFeatures} tools · 0 bytes uploaded · runs locally · MIT</p>
    </header>

    <section class="grid" aria-label="Feature index">
      {features.map((f, i) => (
        <a href={\`/tools/\${f.slug}/\`} class="card">
          <span class="num mono">{String(i + 1).padStart(2, '0')}</span>
          <span class="label">{f.label}</span>
          <span class="status mono">{i < 2 ? 'ready' : 'v0.1'}</span>
        </a>
      ))}
    </section>

    <section class="manifesto">
      <p>
        ${app.title} runs in your browser. Files you open are loaded into memory,
        worked on, and saved back — they are never sent to a server. No upload,
        no account required, no telemetry on your content.
      </p>
      <p>
        Source is on <a href="https://github.com/chirag127">GitHub</a> under MIT.
      </p>
    </section>
  </article>
</BaseLayout>

<style>
  .home { padding-block: 0 2rem; }
  .hero { padding-block: 1rem 2rem; }
  .eyebrow { font-size: 12px; color: var(--muted); margin: 0 0 1rem; }
  .h1 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: clamp(2rem, 5vw, 3rem);
    line-height: 1.05;
    letter-spacing: -0.015em;
    margin: 0 0 1rem;
  }
  .lede {
    font-size: clamp(1rem, 2.2vw, 1.1875rem);
    color: var(--muted);
    line-height: 1.5;
    margin: 0 0 1rem;
    max-width: 56ch;
  }
  .meta { font-size: 12px; color: var(--muted); letter-spacing: 0.06em; }

  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1px;
    background: var(--rule);
    border: 1px solid var(--rule);
    margin-block: 2rem;
  }
  @media (min-width: 540px) { .grid { grid-template-columns: 1fr 1fr; } }
  @media (min-width: 860px) { .grid { grid-template-columns: 1fr 1fr 1fr; } }

  .card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.125rem;
    background: var(--paper);
    color: var(--ink);
    text-decoration: none;
    transition: background 120ms, color 120ms;
  }
  .card:hover { background: var(--paper-2); color: var(--accent); }
  .card .num { font-size: 11px; color: var(--muted); letter-spacing: 0.08em; min-width: 2ch; }
  .card .label { flex: 1; font-size: 0.9375rem; }
  .card .status { font-size: 10px; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; }

  .manifesto {
    padding-block: 1rem;
    font-size: 0.9375rem;
    line-height: 1.7;
    color: var(--muted);
    max-width: 60ch;
    border-top: 1px solid var(--rule);
    margin-top: 2rem;
    padding-top: 2rem;
  }
  .manifesto p { margin: 0 0 1rem; }
  .manifesto p:last-child { margin-bottom: 0; }
</style>
`
}

function toolPage(app, feature, isReady) {
  return `---
import BaseLayout from '~/layouts/BaseLayout.astro'
---
<BaseLayout title="${feature.label} — ${app.title}" description="${feature.label} — runs in your browser. Part of ${app.title}.">
  <article class="tool">
    <p class="back mono"><a href="/">← all tools</a></p>
    <h1 class="h1">${feature.label}</h1>
    ${isReady
      ? `<p class="status mono ready">ready · v0</p>
    <div class="placeholder">
      <p>This tool is wired. Drop in your input or paste below — everything stays in your browser.</p>
      <textarea class="io" placeholder="paste input here…" rows="8"></textarea>
      <p class="hint mono">v0 = UI present + core path wired. Full feature set lands in v0.1.</p>
    </div>`
      : `<p class="status mono">coming · v0.1</p>
    <p class="lede">
      This feature is on the v0.1 roadmap. The page exists so we can iterate on
      the design and copy in parallel; the implementation lands next sprint.
    </p>`}
  </article>
</BaseLayout>

<style>
  .tool { padding-block: 0 2rem; }
  .back { font-size: 12px; margin: 0 0 2rem; }
  .back a { color: var(--muted); text-decoration: none; }
  .back a:hover { color: var(--ink); }
  .h1 { font-family: var(--font-display); font-weight: 600; font-size: clamp(1.75rem, 4vw, 2.5rem); margin: 0 0 0.5rem; line-height: 1.1; }
  .status { font-size: 11px; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 2rem; }
  .status.ready { color: var(--accent); }
  .lede { font-size: 1rem; color: var(--muted); line-height: 1.6; max-width: 56ch; }
  .placeholder { max-width: 60ch; }
  .placeholder p { color: var(--muted); margin: 0 0 1rem; }
  .io {
    width: 100%;
    padding: 1rem;
    background: var(--paper-2);
    border: 1px solid var(--rule);
    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 0.875rem;
    resize: vertical;
  }
  .hint { font-size: 11px; color: var(--muted); margin-top: 0.75rem; }
</style>
`
}

function aboutPage(app) {
  return `---
import BaseLayout from '~/layouts/BaseLayout.astro'
---
<BaseLayout title="About — ${app.title}" description="About ${app.title} — part of the oriz family.">
  <article class="prose">
    <h1>About ${app.title}</h1>
    <p class="lede">${app.tagline}</p>
    <p>${app.description}</p>
    <h2>Why client-side?</h2>
    <p>
      Every implement runs in your browser. Inputs are loaded into memory,
      worked on, and saved back — they are never sent to a server. No upload,
      no account required, no telemetry on your content.
    </p>
    <h2>Open source</h2>
    <p>
      Source is on <a href="https://github.com/chirag127">GitHub</a> under MIT.
      Part of the <a href="https://oriz.in">oriz</a> family.
    </p>
  </article>
</BaseLayout>

<style>
  .prose { max-width: 64ch; }
  .prose h1 { font-family: var(--font-display); font-weight: 600; font-size: 2rem; margin: 0 0 0.5rem; }
  .prose h2 { font-family: var(--font-display); font-weight: 600; font-size: 1.25rem; margin: 2rem 0 0.5rem; }
  .lede { color: var(--muted); font-size: 1.125rem; margin: 0 0 1.5rem; }
  .prose p { color: var(--ink); line-height: 1.7; margin: 0 0 1rem; }
</style>
`
}

function legalPage(kind, app) {
  const titles = {
    privacy: 'Privacy',
    terms: 'Terms',
    disclaimer: 'Disclaimer',
    contact: 'Contact',
  }
  const bodies = {
    privacy: `<p>${app.title} runs entirely in your browser. We do not upload, store, or process your files or text on any server. Anonymous usage analytics (page views only) are collected via Cloudflare Web Analytics in a cookieless mode.</p><p>Sign-in (optional, for premium features) is handled by <a href="https://auth.oriz.in">auth.oriz.in</a>; refer to that domain's privacy policy.</p>`,
    terms: `<p>${app.title} is provided as-is under the MIT licence. By using this site you agree that you are responsible for the content you process and that the maintainers offer no warranty of fitness for any particular purpose.</p>`,
    disclaimer: `<p>${app.title} is a utility. It is not professional advice (financial, legal, medical, or otherwise). Results may contain errors; verify anything that matters.</p>`,
    contact: `<p>Email: <a href="mailto:hello@oriz.in">hello@oriz.in</a></p><p>GitHub issues: <a href="https://github.com/chirag127">github.com/chirag127</a></p>`,
  }
  return `---
import BaseLayout from '~/layouts/BaseLayout.astro'
---
<BaseLayout title="${titles[kind]} — ${app.title}" description="${titles[kind]} for ${app.title}.">
  <article class="prose">
    <h1>${titles[kind]}</h1>
    ${bodies[kind]}
    <p><a href="/">← back to tools</a></p>
  </article>
</BaseLayout>

<style>
  .prose { max-width: 60ch; }
  .prose h1 { font-family: var(--font-display); font-weight: 600; font-size: 2rem; margin: 0 0 1.5rem; }
  .prose p { color: var(--ink); line-height: 1.7; margin: 0 0 1rem; }
</style>
`
}

function pricingPage(app) {
  return `---
import BaseLayout from '~/layouts/BaseLayout.astro'
---
<BaseLayout title="Pricing — ${app.title}" description="Pricing for ${app.title}.">
  <article class="prose">
    <h1>Pricing</h1>
    <p class="lede">Free for everyone. Premium tiers unlock bulk and account-bound features.</p>

    <div class="tiers">
      <section class="tier">
        <h2>Free</h2>
        <p class="price">₹0</p>
        <ul>
          <li>Every tool, every feature</li>
          <li>Runs client-side</li>
          <li>No account required</li>
          <li>Public source on GitHub</li>
        </ul>
      </section>
      <section class="tier highlight">
        <h2>Pro</h2>
        <p class="price">₹199 / month</p>
        <ul>
          <li>Everything in Free</li>
          <li>Save presets to your account</li>
          <li>Bulk operations (100+ files)</li>
          <li>Priority support</li>
        </ul>
        <p><a class="cta" href="https://auth.oriz.in/sign-in">Sign in to upgrade</a></p>
      </section>
    </div>
  </article>
</BaseLayout>

<style>
  .prose { max-width: 72ch; }
  .prose h1 { font-family: var(--font-display); font-weight: 600; font-size: 2rem; margin: 0 0 0.5rem; }
  .lede { color: var(--muted); margin: 0 0 2rem; }
  .tiers { display: grid; grid-template-columns: 1fr; gap: 1rem; }
  @media (min-width: 720px) { .tiers { grid-template-columns: 1fr 1fr; } }
  .tier { border: 1px solid var(--rule); padding: 1.5rem; }
  .tier.highlight { border-color: var(--accent); }
  .tier h2 { font-family: var(--font-display); font-weight: 600; font-size: 1.25rem; margin: 0 0 0.25rem; }
  .price { font-family: var(--font-mono); font-size: 1.5rem; margin: 0 0 1rem; color: var(--accent); }
  .tier ul { padding-left: 1.25rem; margin: 0 0 1rem; }
  .tier li { margin-bottom: 0.375rem; }
  .cta {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--accent);
    color: var(--paper);
    text-decoration: none;
    font-family: var(--font-mono);
    font-size: 0.875rem;
  }
</style>
`
}

function favicon(app) {
  // Minimal monochrome favicon — accent on paper background.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="${app.palette.paper}"/>
  <circle cx="16" cy="16" r="10" fill="${app.palette.accent}"/>
  <text x="16" y="21" font-family="${app.typeStack.mono}" font-size="14" font-weight="700" text-anchor="middle" fill="${app.palette.paper}">${app.short[0]}</text>
</svg>
`
}

function robots(app) {
  return `User-agent: *
Allow: /

Sitemap: ${app.site}/sitemap-index.xml
`
}

function biome() {
  return JSON.stringify({
    $schema: 'https://biomejs.dev/schemas/2.4.9/schema.json',
    files: { includes: ['src/**/*.{ts,tsx,astro,mjs,cjs,js,jsx}'] },
    formatter: { enabled: true, indentStyle: 'space', indentWidth: 2, lineWidth: 100 },
    linter: { enabled: true, rules: { recommended: true } },
    javascript: { formatter: { quoteStyle: 'single', semicolons: 'asNeeded', trailingCommas: 'all' } },
  }, null, 2) + '\n'
}

function smokeTest(app) {
  return `import { describe, it, expect } from 'vitest'

describe('${app.short}', () => {
  it('smoke', () => {
    expect(1 + 1).toBe(2)
  })
})
`
}

let total = 0
for (const app of APPS) {
  const root = path.join(ROOT, app.dir)
  if (!fs.existsSync(root)) {
    console.error('SKIP (missing):', app.dir)
    continue
  }
  console.log(`\n== ${app.dir} ==`)

  writeFile(path.join(root, 'package.json'), pkgJson(app))
  writeFile(path.join(root, 'astro.config.mjs'), astroConfig(app))
  writeFile(path.join(root, 'tsconfig.json'), tsconfig())
  writeFile(path.join(root, 'biome.json'), biome())
  writeFile(path.join(root, 'src/env.d.ts'), envDts())
  writeFile(path.join(root, 'src/styles/global.css'), globalCss(app))
  writeFile(path.join(root, 'src/layouts/BaseLayout.astro'), baseLayout(app))
  writeFile(path.join(root, 'src/pages/index.astro'), indexPage(app))
  writeFile(path.join(root, 'src/pages/about.astro'), aboutPage(app))
  writeFile(path.join(root, 'src/pages/contact.astro'), legalPage('contact', app))
  writeFile(path.join(root, 'src/pages/pricing.astro'), pricingPage(app))
  writeFile(path.join(root, 'src/pages/legal/privacy.astro'), legalPage('privacy', app))
  writeFile(path.join(root, 'src/pages/legal/terms.astro'), legalPage('terms', app))
  writeFile(path.join(root, 'src/pages/legal/disclaimer.astro'), legalPage('disclaimer', app))
  app.features.forEach((f, i) => {
    writeFile(path.join(root, 'src/pages/tools', `${f.slug}.astro`), toolPage(app, f, i < 2))
  })
  writeFile(path.join(root, 'public/favicon.svg'), favicon(app))
  writeFile(path.join(root, 'public/robots.txt'), robots(app))
  writeFile(path.join(root, 'src/__tests__/smoke.test.ts'), smokeTest(app))

  total++
  console.log(`  scaffolded ${app.features.length} tool pages`)
}
console.log(`\nScaffolded ${total} apps.`)
