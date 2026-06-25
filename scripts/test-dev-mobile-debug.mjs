import { chromium } from 'file:///C:/Users/C5420321/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright/index.mjs';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
const page = await ctx.newPage();
await page.goto('https://dev.oriz.in', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(500);

const smallTaps = await page.$$eval('a, button', els =>
  els.filter(e => {
    const r = e.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    return r.height < 32 || r.width < 32;
  }).map(e => ({ tag: e.tagName, text: (e.textContent || '').trim().slice(0, 40), w: e.getBoundingClientRect().width, h: e.getBoundingClientRect().height }))
);
console.log(JSON.stringify(smallTaps, null, 2));
await browser.close();
