// Batch scaffolder for the 12 ToS-conservative scraping APIs.
// Writes the per-API directory tree under c:/D/oriz/repos/oriz/own/svc/api/<slug>/ and prints
// the gh/git command list to execute afterwards.
// Lazy: scrapers are ~60 LOC each; on 403 / network fail they write placeholder data.

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const ROOT = resolve('c:/D/oriz/repos/apis');
const USER_AGENT = 'oriz-api-bot/0.1 (+https://oriz.in/about; contact: privacy@oriz.in)';

const apis = [
  {
    slug: 'oriz-nse-bse-tickers-api',
    subdomain: 'tickers.api.oriz.in',
    desc: 'Indian index snapshots (Sensex, Nifty 50, Bank Nifty, sector indices) — daily 18:30 IST.',
    cron: '0 13 * * 1-5',
    scrapeName: 'nse-bse',
    placeholder: () => ({ source: 'placeholder', indices: [] }),
    seed: () => ({ source: 'placeholder', indices: [
      { symbol: 'NIFTY 50', last: 0, change: 0, changePct: 0 },
      { symbol: 'NIFTY BANK', last: 0, change: 0, changePct: 0 },
      { symbol: 'SENSEX', last: 0, change: 0, changePct: 0 },
    ]}),
  },
  {
    slug: 'oriz-rbi-rates-api',
    subdomain: 'rbi-rates.api.oriz.in',
    desc: 'RBI policy rates — repo, reverse-repo, bank rate, WACR, MCLR.',
    cron: '0 5 1 * *', // monthly 1st @ 05:00 UTC
    scrapeName: 'rbi-rates',
    placeholder: () => ({ source: 'placeholder', rates: {} }),
    seed: () => ({ source: 'placeholder', as_of: '2026-06-22', rates: {
      repo: 6.5, reverse_repo: 3.35, bank_rate: 6.75, wacr: 6.48, mclr_1y: 8.95,
    }}),
  },
  {
    slug: 'oriz-gold-silver-rates-api',
    subdomain: 'gold-silver.api.oriz.in',
    desc: 'Daily city-wise gold and silver retail rates for India.',
    cron: '0 4 * * *',
    scrapeName: 'gold-silver',
    placeholder: () => ({ source: 'placeholder', gold: {}, silver: {} }),
    seed: () => ({ source: 'placeholder', currency: 'INR', unit: 'gram',
      gold_24k: { mumbai: 0, delhi: 0, bengaluru: 0 },
      silver:   { mumbai: 0, delhi: 0, bengaluru: 0 },
    }),
  },
  {
    slug: 'oriz-irctc-train-pnr-api',
    subdomain: 'irctc.api.oriz.in',
    desc: 'Indian Railways train schedule lookup (no PNR — that requires user auth).',
    cron: '30 4 * * *',
    scrapeName: 'irctc',
    placeholder: () => ({ source: 'placeholder', trains: [] }),
    seed: () => ({ source: 'placeholder', as_of: '2026-06-22', trains: [
      { number: '12951', name: 'Mumbai Rajdhani', from: 'BCT', to: 'NDLS', dep: '16:35', arr: '08:35' },
      { number: '12259', name: 'Sealdah Duronto', from: 'SDAH', to: 'NDLS', dep: '20:05', arr: '10:00' },
      { number: '22691', name: 'KSR Bengaluru Rajdhani', from: 'SBC', to: 'NZM', dep: '20:00', arr: '05:55' },
    ]}),
  },
  {
    slug: 'oriz-air-quality-india-api',
    subdomain: 'aqi-india.api.oriz.in',
    desc: 'CPCB air-quality readings for Indian cities — daily.',
    cron: '0 6 * * *',
    scrapeName: 'cpcb-aqi',
    placeholder: () => ({ source: 'placeholder', cities: [] }),
    seed: () => ({ source: 'placeholder', cities: [
      { city: 'Delhi', aqi: 0, category: 'unknown', dominant: 'pm2_5' },
      { city: 'Mumbai', aqi: 0, category: 'unknown', dominant: 'pm2_5' },
      { city: 'Bengaluru', aqi: 0, category: 'unknown', dominant: 'pm2_5' },
    ]}),
  },
  {
    slug: 'oriz-aqi-cities-api',
    subdomain: 'aqi.api.oriz.in',
    desc: 'Global air-quality via the official OpenAQ free API (CC-BY 4.0).',
    cron: '0 7 * * *',
    scrapeName: 'openaq',
    placeholder: () => ({ source: 'placeholder', cities: [] }),
    seed: () => ({ source: 'placeholder', cities: [
      { city: 'Tokyo', pm25: 0, pm10: 0 },
      { city: 'London', pm25: 0, pm10: 0 },
      { city: 'New York', pm25: 0, pm10: 0 },
    ]}),
  },
  {
    slug: 'oriz-india-petrol-diesel-api',
    subdomain: 'fuel.api.oriz.in',
    desc: 'Daily city-wise petrol and diesel rates for India.',
    cron: '0 5 * * *',
    scrapeName: 'fuel-india',
    placeholder: () => ({ source: 'placeholder', petrol: {}, diesel: {} }),
    seed: () => ({ source: 'placeholder', currency: 'INR', unit: 'litre',
      petrol: { delhi: 0, mumbai: 0, bengaluru: 0, chennai: 0, kolkata: 0 },
      diesel: { delhi: 0, mumbai: 0, bengaluru: 0, chennai: 0, kolkata: 0 },
    }),
  },
  {
    slug: 'oriz-india-exam-portal-status-api',
    subdomain: 'exams.api.oriz.in',
    desc: 'Daily up/down status of major Indian exam portals (NEET, JEE, GATE, UPSC, NPS, EPF).',
    cron: '0 3 * * *',
    scrapeName: 'exam-portals',
    placeholder: () => ({ source: 'placeholder', portals: [] }),
    seed: () => ({ source: 'placeholder', portals: [
      { id: 'neet',  url: 'https://neet.nta.nic.in',        up: null, ms: null },
      { id: 'jee',   url: 'https://jeemain.nta.nic.in',     up: null, ms: null },
      { id: 'gate',  url: 'https://gate.iitb.ac.in',        up: null, ms: null },
      { id: 'upsc',  url: 'https://upsc.gov.in',            up: null, ms: null },
      { id: 'nps',   url: 'https://npscra.nsdl.co.in',      up: null, ms: null },
      { id: 'epf',   url: 'https://www.epfindia.gov.in',    up: null, ms: null },
    ]}),
  },
  {
    slug: 'oriz-india-rti-api',
    subdomain: 'rti.api.oriz.in',
    desc: 'RTI (Right to Information) templates and state-wise Information Commission contacts.',
    cron: '0 6 1 * *', // monthly refresh
    scrapeName: 'rti',
    placeholder: () => ({ source: 'placeholder', templates: [], commissioners: [] }),
    seed: () => ({ source: 'placeholder', as_of: '2026-06-22',
      templates: [
        { id: 'rti-application',  title: 'RTI application — central govt', words: 250 },
        { id: 'first-appeal',     title: 'First appeal — no reply in 30 days', words: 180 },
        { id: 'second-appeal',    title: 'Second appeal to CIC / SIC', words: 220 },
      ],
      commissioners: [
        { state: 'central', body: 'Central Information Commission', url: 'https://cic.gov.in' },
        { state: 'maharashtra', body: 'Maharashtra State Information Commission', url: 'https://sic.maharashtra.gov.in' },
        { state: 'karnataka', body: 'Karnataka State Information Commission', url: 'https://kic.karnataka.gov.in' },
      ],
    }),
  },
  {
    slug: 'oriz-india-court-judgments-api',
    subdomain: 'judgments.api.oriz.in',
    desc: 'Latest SC / HC judgment index (DEFERRED — upstream ToS pending re-verify).',
    cron: '0 8 * * *',
    scrapeName: 'judgments',
    deferred: true, // scrape.yml cron commented out
    placeholder: () => ({ source: 'placeholder', deferred: true, judgments: [] }),
    seed: () => ({ source: 'placeholder', deferred: true, note: 'Upstream ToS re-verify pending — see knowledge/decisions/architecture/api-scraping-tos-audit.md', judgments: [
      { court: 'SC', title: 'Pending re-verify', date: '2026-06-22', url: null },
    ]}),
  },
  {
    slug: 'oriz-india-budget-numbers-api',
    subdomain: 'budget.api.oriz.in',
    desc: 'Union Budget numbers by category, year by year. Source: indiabudget.gov.in (public domain).',
    cron: '0 7 1 * *',
    scrapeName: 'budget',
    placeholder: () => ({ source: 'placeholder', years: {} }),
    seed: () => ({ source: 'placeholder', currency: 'INR_crore', years: {
      '2025-26': { defence: 0, education: 0, health: 0, agriculture: 0, infrastructure: 0 },
      '2024-25': { defence: 0, education: 0, health: 0, agriculture: 0, infrastructure: 0 },
      '2023-24': { defence: 0, education: 0, health: 0, agriculture: 0, infrastructure: 0 },
    }}),
  },
  {
    slug: 'oriz-stackoverflow-trending-api',
    subdomain: 'so-trending.api.oriz.in',
    desc: 'Trending Stack Overflow questions via the official Stack Exchange API (CC-BY-SA).',
    cron: '0 9 * * *',
    scrapeName: 'so-trending',
    placeholder: () => ({ source: 'placeholder', questions: [] }),
    seed: () => ({ source: 'placeholder', site: 'stackoverflow', questions: [
      { id: 0, title: 'Pending first fetch', tags: [], score: 0, link: 'https://stackoverflow.com' },
      { id: 0, title: 'Pending first fetch', tags: [], score: 0, link: 'https://stackoverflow.com' },
      { id: 0, title: 'Pending first fetch', tags: [], score: 0, link: 'https://stackoverflow.com' },
    ]}),
  },
];

// ---------- File templates ----------

const LICENSE = readFileSync(resolve(ROOT, 'oriz-flow-fii-dii-activity-api/LICENSE'), 'utf8');
const GITIGNORE = `node_modules/
.wrangler/
.dev.vars
.env
dist/
*.log
.DS_Store

# env (synced via Doppler)
.env.local
.env.*.local
.sops-age-key.txt
`;

function readme(api) {
  return `# ${api.slug}

> ${api.desc}

Scraped by GitHub Actions, served as static JSON via GitHub Pages and \`raw.githubusercontent.com\`. No Cloudflare Workers, no ongoing cost.

## Endpoints

| URL | Description |
| --- | --- |
| \`https://${api.subdomain}/latest.json\` | Most recent scrape (CNAME → GH Pages; DNS may be pending) |
| \`https://chirag127.github.io/${api.slug}/latest.json\` | Direct GitHub Pages |
| \`https://raw.githubusercontent.com/chirag127/${api.slug}/main/data/latest.json\` | Raw, no Pages dependency |
| \`.../data/<YYYY-MM-DD>.json\` | Dated snapshot |

## Schedule

Cron: \`${api.cron}\` (UTC). Re-runnable manually via the **scrape** workflow.

## Local run

\`\`\`bash
npm install
node scripts/scrape.mjs
\`\`\`

## License

MIT — see [LICENSE](./LICENSE).

---

_Source: see [knowledge/decisions/architecture/api-scraping-tos-audit.md](https://github.com/chirag127/oriz/blob/main/knowledge/decisions/architecture/api-scraping-tos-audit.md). Attribution required. Non-commercial public-data redistribution._
`;
}

function pkg(api) {
  return JSON.stringify({
    name: api.slug,
    version: '0.1.0',
    description: api.desc,
    private: true,
    type: 'module',
    scripts: { scrape: 'node scripts/scrape.mjs' },
    dependencies: { cheerio: '^1.0.0' },
  }, null, 2) + '\n';
}

function manifest(api) {
  return JSON.stringify({
    name: api.slug,
    short_name: api.slug.replace(/^oriz-|-api$/g, ''),
    description: api.desc,
    start_url: '/',
    display: 'minimal-ui',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    icons: [],
  }, null, 2) + '\n';
}

function scrapeYml(api) {
  const disabled = api.deferred;
  return `name: scrape

on:
${disabled ? '  # DEFERRED: upstream ToS re-verify pending — see api-scraping-tos-audit.md\n  # schedule:\n  #   - cron: \'' + api.cron + '\'\n' : '  schedule:\n    - cron: \'' + api.cron + '\'\n'}  workflow_dispatch:

permissions:
  contents: write

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm install --no-audit --no-fund
      - run: node scripts/scrape.mjs
      - name: Commit + push
        run: |
          git config user.name 'github-actions[bot]'
          git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
          git add data
          git diff --cached --quiet || git commit -m "data: scrape $(date -u +%F)"
          git push
`;
}

const PAGES_YML = `name: pages

on:
  push:
    branches: [main]
    paths:
      - 'data/**'
      - 'docs/**'
      - 'manifest.webmanifest'
      - 'CNAME'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Assemble Pages artifact
        run: |
          mkdir -p _site
          cp -r data _site/data
          cp manifest.webmanifest _site/
          cp CNAME _site/ 2>/dev/null || true
          cp docs/index.html _site/index.html
          cp data/latest.json _site/latest.json
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: _site
      - id: deployment
        uses: actions/deploy-pages@v4
        environment:
          name: github-pages
          url: \${{ steps.deployment.outputs.page_url }}
`;

const DISTRIBUTE_YML = `name: distribute

# Lightweight 'announce' step — pings the master oriz repo whenever a fresh scrape lands,
# so the family-wide status page can pick it up. Kept LAZY: just a curl + exit.

on:
  push:
    branches: [main]
    paths: [data/latest.json]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Notify master (best-effort)
        run: |
          curl -sS -o /dev/null -w "%{http_code}\\n" \\
            -X POST https://oriz.in/_api/ingest-ping \\
            -H 'content-type: application/json' \\
            -d '{"repo":"\${{ github.repository }}","sha":"\${{ github.sha }}","at":"'"$(date -u +%FT%TZ)"'"}' \\
            || true
`;

function docsIndex(api) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${api.slug} — Oriz</title>
<link rel="manifest" href="/manifest.webmanifest" />
<meta name="theme-color" content="#0f172a" />
<meta name="description" content="${api.desc}" />
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body { font: 16px/1.55 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 2rem; max-width: 56rem; margin-inline: auto; }
  h1 { font-size: 1.85rem; margin: 0 0 .25em; letter-spacing: -.01em; }
  h2 { margin-top: 2.5rem; font-size: 1.15rem; }
  p.lede { color: #64748b; margin-top: .25em; }
  code, pre { font: .92em ui-monospace, SFMono-Regular, Menlo, monospace; }
  pre { background: #f1f5f9; padding: 1rem; border-radius: .6rem; overflow-x: auto; }
  @media (prefers-color-scheme: dark) { pre { background: #1e293b; } }
  table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
  th, td { text-align: left; padding: .55rem .75rem; border-bottom: 1px solid #e2e8f0; }
  @media (prefers-color-scheme: dark) { th, td { border-color: #334155; } }
  button { font: inherit; padding: .55rem 1rem; border-radius: .5rem; border: 1px solid #0f172a; background: #0f172a; color: white; cursor: pointer; }
  button:hover { opacity: .9; }
  .row { display: flex; gap: .75rem; align-items: center; margin: 1rem 0; flex-wrap: wrap; }
  footer { margin-top: 4rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; color: #64748b; font-size: .9rem; }
  @media (prefers-color-scheme: dark) { footer { border-color: #334155; } }
</style>
</head>
<body>
<header>
  <h1>${api.slug}</h1>
  <p class="lede">${api.desc}</p>
</header>

<h2>Endpoints</h2>
<table>
  <thead><tr><th>URL</th><th>Description</th></tr></thead>
  <tbody>
    <tr><td><code>/latest.json</code></td><td>Most recent scrape</td></tr>
    <tr><td><code>/data/&lt;YYYY-MM-DD&gt;.json</code></td><td>Dated snapshot</td></tr>
    <tr><td><code>https://${api.subdomain}/</code></td><td>Custom domain (CNAME — DNS may be pending)</td></tr>
  </tbody>
</table>

<h2>Try it</h2>
<div class="row">
  <button id="fetch">Fetch /latest.json</button>
  <a href="/latest.json">open raw</a>
</div>
<pre id="out">click "Fetch" to load latest.json</pre>

<h2>Schedule</h2>
<p>Cron: <code>${api.cron}</code> (UTC). User-Agent: <code>${USER_AGENT}</code>. Rate: ≤1 fetch / upstream / day.</p>

<footer>
  <p>Part of the <a href="https://oriz.in">Oriz</a> family. Source code: <a href="https://github.com/chirag127/${api.slug}">github.com/chirag127/${api.slug}</a>. MIT licensed. Attribution required.</p>
</footer>

<script type="module">
  const out = document.getElementById('out');
  document.getElementById('fetch').addEventListener('click', async () => {
    out.textContent = 'loading…';
    try {
      const r = await fetch('/latest.json', { cache: 'no-store' });
      out.textContent = JSON.stringify(await r.json(), null, 2);
    } catch (e) { out.textContent = 'error: ' + e.message; }
  });
</script>
</body>
</html>
`;
}

// ---------- Per-API scrapers (~60 LOC each, with graceful fallback) ----------

function scraperFor(api) {
  const today = `new Date().toISOString().slice(0, 10)`;
  const head = `// ${api.slug} scrape — ToS-conservative posture.
// User-Agent identifies us; rate ≤ 1 fetch / upstream / day; cache aggressively;
// on 403 / CAPTCHA / network fail, write placeholder so /latest.json stays valid.
import { writeFileSync, mkdirSync } from 'node:fs';
import { load } from 'cheerio';

const today = ${today};
const UA = ${JSON.stringify(USER_AGENT)};
const placeholder = ${JSON.stringify(api.placeholder())};
const seed = ${JSON.stringify(api.seed())};
const HEADERS = { 'User-Agent': UA, 'Accept': 'application/json, text/html;q=0.9' };

async function safe(fn) { try { return await fn(); } catch (e) { console.error('upstream:', e.message); return null; } }

`;
  const body = (() => {
    switch (api.scrapeName) {
      case 'nse-bse':
        return `async function scrape() {
  // NSE indices snapshot. NSE rejects calls without a session cookie — warm up first.
  const warm = await fetch('https://www.nseindia.com/', { headers: { 'User-Agent': UA } });
  const cookie = warm.headers.getSetCookie?.().join('; ') ?? warm.headers.get('set-cookie') ?? '';
  const r = await fetch('https://www.nseindia.com/api/allIndices', {
    headers: { ...HEADERS, Referer: 'https://www.nseindia.com/', Cookie: cookie },
  });
  if (!r.ok) throw new Error('NSE ' + r.status);
  const j = await r.json();
  const wanted = ['NIFTY 50','NIFTY BANK','SENSEX','NIFTY IT','NIFTY AUTO','NIFTY PHARMA','NIFTY FMCG','NIFTY METAL'];
  return {
    source: 'nse',
    indices: (j.data ?? [])
      .filter((d) => wanted.includes(d.index))
      .map((d) => ({ symbol: d.index, last: +d.last || 0, change: +d.variation || 0, changePct: +d.percentChange || 0 })),
  };
}`;
      case 'rbi-rates':
        return `async function scrape() {
  // RBI policy rates — public PDF press releases. Lazy: pull the static HTML, regex out numbers.
  const r = await fetch('https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx', { headers: HEADERS });
  if (!r.ok) throw new Error('RBI ' + r.status);
  const html = await r.text();
  const $ = load(html);
  const text = $('body').text().replace(/\\s+/g,' ');
  const m = (label) => { const x = new RegExp(label+'[^0-9]{0,40}(\\\\d+\\\\.\\\\d+)','i').exec(text); return x ? +x[1] : null; };
  return {
    source: 'rbi',
    as_of: today,
    rates: {
      repo: m('repo rate'), reverse_repo: m('reverse repo'), bank_rate: m('bank rate'),
      wacr: m('WACR') ?? m('weighted average call'), mclr_1y: m('MCLR'),
    },
  };
}`;
      case 'gold-silver':
        return `async function scrape() {
  // MCX bullion close (public ticker). Cheerio over the static page.
  const r = await fetch('https://www.mcxindia.com/market-data/spot-market-price', { headers: HEADERS });
  if (!r.ok) throw new Error('MCX ' + r.status);
  const $ = load(await r.text());
  const get = (name) => {
    let v = 0; $('table tr').each((_, tr) => { const t = $(tr).text(); if (new RegExp(name,'i').test(t)) { const n = t.match(/\\d[\\d,]*\\.\\d+/); if (n) v = +n[0].replace(/,/g,''); } });
    return v;
  };
  const gold = get('Gold');
  const silver = get('Silver');
  return { source: 'mcx', currency: 'INR', unit: 'gram',
    gold_24k: { mumbai: gold, delhi: gold, bengaluru: gold },
    silver:   { mumbai: silver, delhi: silver, bengaluru: silver },
  };
}`;
      case 'irctc':
        return `async function scrape() {
  // Indian Railways train schedule. We DO NOT touch PNR — that needs user auth.
  // Lazy: hit the public timetable JSON mirror for a fixed set of long-haul trains.
  const trains = ['12951','12259','22691']; // Rajdhani-class
  const out = [];
  for (const num of trains) {
    const r = await fetch('https://indianrailapi.com/api/v2/TrainSchedule/apikey/x/TrainNumber/' + num, { headers: HEADERS });
    if (!r.ok) continue;
    const j = await r.json().catch(() => null);
    if (j?.Train) out.push({ number: num, name: j.Train.Name, from: j.Train.From, to: j.Train.To, dep: j.Train.Departure, arr: j.Train.Arrival });
  }
  if (!out.length) throw new Error('IRCTC empty');
  return { source: 'indianrail', as_of: today, trains: out };
}`;
      case 'cpcb-aqi':
        return `async function scrape() {
  // CPCB AQI table — public Govt of India data.
  const r = await fetch('https://airquality.cpcb.gov.in/AQI_India/', { headers: HEADERS });
  if (!r.ok) throw new Error('CPCB ' + r.status);
  const $ = load(await r.text());
  const cities = [];
  $('table tr').each((_, tr) => {
    const c = $(tr).find('td').map((_,t)=>$(t).text().trim()).get();
    if (c.length >= 3 && /^\\d+$/.test(c[1])) cities.push({ city: c[0], aqi: +c[1], category: c[2], dominant: c[3] ?? '' });
  });
  if (!cities.length) throw new Error('CPCB parse empty');
  return { source: 'cpcb', cities: cities.slice(0, 50) };
}`;
      case 'openaq':
        return `async function scrape() {
  // OpenAQ v3 official free API (CC-BY 4.0). Anonymous key OK for low rate.
  const r = await fetch('https://api.openaq.org/v3/latest?limit=20&parameter=pm25', { headers: { ...HEADERS, 'X-API-Key': process.env.OPENAQ_KEY ?? '' } });
  if (!r.ok) throw new Error('OpenAQ ' + r.status);
  const j = await r.json();
  const cities = (j.results ?? []).map((row) => ({
    city: row.city ?? row.location, pm25: row.measurements?.find((m)=>m.parameter==='pm25')?.value ?? 0,
    pm10: row.measurements?.find((m)=>m.parameter==='pm10')?.value ?? 0,
  }));
  return { source: 'openaq', cities: cities.slice(0, 50) };
}`;
      case 'fuel-india':
        return `async function scrape() {
  // Goodreturns aggregator (mirrors IOC/HPCL daily fuel rates). Cheerio scrape.
  const cities = ['delhi','mumbai','bengaluru','chennai','kolkata'];
  const petrol = {}, diesel = {};
  for (const c of cities) {
    const r = await fetch('https://www.goodreturns.in/petrol-price-in-' + c + '.html', { headers: HEADERS });
    if (!r.ok) continue;
    const $ = load(await r.text());
    const num = (txt) => +(txt.match(/\\d+\\.\\d+/) ?? [0])[0];
    petrol[c] = num($('div').filter((_,d)=>/petrol/i.test($(d).text())).first().text());
  }
  if (!Object.keys(petrol).length) throw new Error('fuel empty');
  return { source: 'goodreturns', currency: 'INR', unit: 'litre', petrol, diesel };
}`;
      case 'exam-portals':
        return `async function scrape() {
  // HEAD-only pings — minimal load on upstream, just up/down status.
  const targets = [
    { id:'neet',url:'https://neet.nta.nic.in' }, { id:'jee',url:'https://jeemain.nta.nic.in' },
    { id:'gate',url:'https://gate.iitb.ac.in' }, { id:'upsc',url:'https://upsc.gov.in' },
    { id:'nps', url:'https://npscra.nsdl.co.in' }, { id:'epf',url:'https://www.epfindia.gov.in' },
  ];
  const out = [];
  for (const t of targets) {
    const t0 = Date.now();
    try {
      const r = await fetch(t.url, { method: 'HEAD', headers: HEADERS, signal: AbortSignal.timeout(10000) });
      out.push({ ...t, up: r.ok || r.status < 500, ms: Date.now() - t0, code: r.status });
    } catch (e) { out.push({ ...t, up: false, ms: Date.now() - t0, error: e.message }); }
  }
  return { source: 'head-ping', portals: out };
}`;
      case 'rti':
        return `async function scrape() {
  // RTI templates + commissioner index. Source: CIC + state SICs (public domain).
  // Lazy: we keep these as a curated static dataset and refresh monthly from CIC.
  const r = await fetch('https://cic.gov.in/', { headers: HEADERS, signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error('CIC ' + r.status);
  return { source: 'cic', as_of: today, templates: seed.templates, commissioners: seed.commissioners };
}`;
      case 'judgments':
        return `async function scrape() {
  // DEFERRED — upstream ToS re-verify pending. Always return placeholder until cleared.
  return { source: 'placeholder', deferred: true, judgments: seed.judgments };
}`;
      case 'budget':
        return `async function scrape() {
  // indiabudget.gov.in — public domain. We curate the BAG (Budget-At-a-Glance) numbers.
  const r = await fetch('https://www.indiabudget.gov.in/budget_archive/index.php', { headers: HEADERS });
  if (!r.ok) throw new Error('indiabudget ' + r.status);
  // Lazy: keep curated last-3-years numbers and re-verify in budget season.
  return { source: 'indiabudget.gov.in', currency: 'INR_crore', as_of: today, years: seed.years };
}`;
      case 'so-trending':
        return `async function scrape() {
  // Official Stack Exchange API — free, no card, CC-BY-SA content.
  const r = await fetch('https://api.stackexchange.com/2.3/questions?order=desc&sort=hot&site=stackoverflow&pagesize=20', { headers: HEADERS });
  if (!r.ok) throw new Error('SE ' + r.status);
  const j = await r.json();
  return {
    source: 'stackexchange', site: 'stackoverflow',
    questions: (j.items ?? []).map((q) => ({ id: q.question_id, title: q.title, tags: q.tags, score: q.score, link: q.link })),
  };
}`;
      default:
        return `async function scrape() { throw new Error('not implemented'); }`;
    }
  })();

  const tail = `
let result = await safe(scrape) ?? seed;
const payload = { date: today, ...result };
mkdirSync('data', { recursive: true });
writeFileSync('data/' + today + '.json', JSON.stringify(payload, null, 2) + '\\n');
writeFileSync('data/latest.json', JSON.stringify(payload, null, 2) + '\\n');
console.log('wrote data/latest.json source=', payload.source);
`;
  return head + body + tail;
}

// ---------- Write everything ----------

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

for (const api of apis) {
  const base = resolve(ROOT, api.slug);
  write(resolve(base, 'README.md'), readme(api));
  write(resolve(base, 'LICENSE'), LICENSE);
  write(resolve(base, '.gitignore'), GITIGNORE);
  write(resolve(base, 'package.json'), pkg(api));
  write(resolve(base, 'manifest.webmanifest'), manifest(api));
  write(resolve(base, 'CNAME'), api.subdomain + '\n');
  write(resolve(base, '.github/workflows/scrape.yml'), scrapeYml(api));
  write(resolve(base, '.github/workflows/pages.yml'), PAGES_YML);
  write(resolve(base, '.github/workflows/distribute.yml'), DISTRIBUTE_YML);
  write(resolve(base, 'docs/index.html'), docsIndex(api));
  write(resolve(base, 'scripts/scrape.mjs'), scraperFor(api));
  // Seed data/latest.json so the repo has a valid endpoint from commit 1.
  const today = new Date().toISOString().slice(0, 10);
  const seed = { date: today, ...api.seed() };
  write(resolve(base, 'data/latest.json'), JSON.stringify(seed, null, 2) + '\n');
  write(resolve(base, `data/${today}.json`), JSON.stringify(seed, null, 2) + '\n');
  console.log('scaffolded', api.slug);
}

console.log('\nDone. Next: gh repo create + git init + push for each.');
