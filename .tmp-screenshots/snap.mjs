import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const results = [];
for (const [port, name] of [[4321,'home'],[4322,'blog'],[4323,'ncert'],[4324,'janaushdhi']]) {
  const errors = [];
  const failed = [];
  page.removeAllListeners('console');
  page.removeAllListeners('pageerror');
  page.removeAllListeners('requestfailed');
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));
  page.on('requestfailed', req => failed.push(req.url() + ' -> ' + req.failure()?.errorText));
  try {
    const resp = await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.screenshot({ path: `c:/D/oriz/.tmp-screenshots/${name}-${port}.png`, fullPage: false });
    const title = await page.title();
    const bodyText = (await page.evaluate(() => document.body?.innerText || '')).slice(0, 200);
    const headerExists = await page.evaluate(() => !!document.querySelector('header'));
    const footerExists = await page.evaluate(() => !!document.querySelector('footer'));
    const styleSheets = await page.evaluate(() => document.styleSheets.length);
    const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const fgColor = await page.evaluate(() => getComputedStyle(document.body).color);
    const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    results.push({ name, port, status: resp?.status(), title, bodyText, headerExists, footerExists, styleSheets, bgColor, fgColor, fontFamily, errors: errors.slice(0,5), failed: failed.slice(0,5), errCount: errors.length, failCount: failed.length });
  } catch (e) {
    results.push({ name, port, error: e.message });
  }
}
console.log(JSON.stringify(results, null, 2));
await browser.close();
