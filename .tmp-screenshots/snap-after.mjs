import { chromium } from 'file:///C:/D/oriz/node_modules/.pnpm/playwright@1.61.0/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const results = [];
for (const [port, name] of [[4321,'home'],[4322,'blog'],[4323,'janaushdhi'],[4324,'ncert']]) {
  const errors = [];
  const failed = [];
  page.removeAllListeners('console');
  page.removeAllListeners('pageerror');
  page.removeAllListeners('requestfailed');
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));
  page.on('requestfailed', req => failed.push(req.url() + ' -> ' + req.failure()?.errorText));
  try {
    const resp = await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: `c:/D/oriz/.tmp-screenshots/${name}-${port}-after.png`, fullPage: false });
    const title = await page.title();
    const headerExists = await page.evaluate(() => !!document.querySelector('header'));
    const footerExists = await page.evaluate(() => !!document.querySelector('footer'));
    results.push({ name, port, status: resp?.status(), title, headerExists, footerExists, errors: errors.slice(0,5), failed: failed.slice(0,5), errCount: errors.length, failCount: failed.length });
  } catch (e) {
    results.push({ name, port, error: e.message });
  }
}
console.log(JSON.stringify(results, null, 2));
await browser.close();
