// Standalone Playwright test for dev.oriz.in
import { chromium } from 'file:///C:/Users/C5420321/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright/index.mjs';

const URL = 'https://dev.oriz.in';
const result = {
  url: URL,
  loads: false,
  status: null,
  has_sign_in: false,
  has_pricing: false,
  mobile_ok: true,
  console_errors: [],
  broken_links: [],
  interaction_test: '',
  notes: '',
};

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

page.on('pageerror', e => result.console_errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') result.console_errors.push('console: ' + m.text()); });

try {
  const resp = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  result.status = resp ? resp.status() : null;
  result.loads = resp && resp.status() >= 200 && resp.status() < 400;

  // Check sign-in
  const signInLinks = await page.$$eval('a, button', els =>
    els.filter(e => {
      const t = (e.textContent || '').toLowerCase();
      const h = (e.getAttribute('href') || '').toLowerCase();
      return h.includes('account.oriz.in/sign-in') || h.includes('auth.oriz.in/sign-in') || h.includes('/sign-in') || t.match(/sign\s*in|sign\s*up/);
    }).map(e => ({ text: e.textContent.trim(), href: e.getAttribute('href') }))
  );
  result.has_sign_in = signInLinks.length > 0;

  // Check pricing
  const pricingLinks = await page.$$eval('a, button', els =>
    els.filter(e => {
      const t = (e.textContent || '').toLowerCase().trim();
      const h = (e.getAttribute('href') || '').toLowerCase();
      return h.includes('oriz.in/pricing') || h.includes('/pricing') || t === 'pricing' || t === 'pro' || t === 'upgrade';
    }).map(e => ({ text: e.textContent.trim(), href: e.getAttribute('href') }))
  );
  result.has_pricing = pricingLinks.length > 0;

  // Sample 3 same-origin links and HEAD them
  const sampleLinks = await page.$$eval('a[href]', els =>
    [...new Set(els.map(a => a.href).filter(h => h.startsWith('https://dev.oriz.in')))].slice(0, 3)
  );
  for (const url of sampleLinks) {
    try {
      const r = await page.request.head(url, { timeout: 10000 });
      if (r.status() >= 400) result.broken_links.push(`${url} [${r.status()}]`);
    } catch (e) {
      // try GET fallback
      try {
        const r = await page.request.get(url, { timeout: 10000 });
        if (r.status() >= 400) result.broken_links.push(`${url} [${r.status()}]`);
      } catch (ee) {
        result.broken_links.push(`${url} [err]`);
      }
    }
  }

  // Mobile responsive check at 375x667
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(500);
  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientW = await page.evaluate(() => document.documentElement.clientWidth);
  const hasHScroll = scrollW > clientW + 1;

  // Tap targets - check interactive elements >= 32px
  const smallTaps = await page.$$eval('a, button, input[type="button"], input[type="submit"]', els =>
    els.filter(e => {
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false; // hidden
      return r.height < 32 || r.width < 32;
    }).length
  );

  result.mobile_ok = !hasHScroll && smallTaps < 3;
  const mobileNotes = [];
  if (hasHScroll) mobileNotes.push(`hscroll ${scrollW}>${clientW}`);
  if (smallTaps >= 3) mobileNotes.push(`${smallTaps} small taps`);

  // Reset viewport for interaction
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(300);

  // ONE interaction: this is a tool homepage, click first tool button/link (JSON tool)
  const firstToolHref = await page.$eval('a[href*="/tools/"]', a => a.href).catch(() => null);
  if (firstToolHref) {
    await page.goto(firstToolHref, { waitUntil: 'domcontentloaded', timeout: 20000 });
    const title = await page.title();
    result.interaction_test = `Navigated to first tool ${firstToolHref} → "${title}"`;
  } else {
    // fallback: click first hero CTA
    const cta = await page.$('main a, main button');
    if (cta) {
      await cta.click({ timeout: 5000 });
      result.interaction_test = 'Clicked first main CTA';
    } else {
      result.interaction_test = 'No primary action found';
    }
  }

  result.notes = mobileNotes.join('; ');
} catch (err) {
  result.notes = 'fatal: ' + err.message.slice(0, 150);
} finally {
  await browser.close();
}

console.log(JSON.stringify(result, null, 2));
