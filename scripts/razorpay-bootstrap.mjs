#!/usr/bin/env node
// razorpay-bootstrap.mjs — one-shot idempotent Razorpay setup.
//
// Reads RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET from env (or c:/D/oriz/.env).
// Creates/updates: 4 plans, 4 offers, 1 webhook, 4 subscription links.
// Writes captured IDs / URLs back into .env. Re-encrypts to .env.enc if sops
// is available. Designed to be safe to re-run.
//
// Flags: --dry (no writes), --verbose (log every API call).
// Exit codes: 0 success/no-op, 1 auth fail, 2 API error, 3 config error.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const ENV_PATH = resolve(REPO_ROOT, '.env');
const ENV_ENC_PATH = resolve(REPO_ROOT, '.env.enc');

const DRY = process.argv.includes('--dry');
const VERBOSE = process.argv.includes('--verbose');

// ---------- tiny ANSI ----------
const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

const log = (...a) => console.log(...a);
const vlog = (...a) => VERBOSE && console.log(c.dim('  · ' + a.join(' ')));
const die = (code, msg) => { console.error(c.red('ERROR: ') + msg); process.exit(code); };

// ---------- .env loader ----------
function parseDotenv(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2];
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    out[m[1]] = v;
  }
  return out;
}

function loadEnvFile() {
  if (!existsSync(ENV_PATH)) return {};
  return parseDotenv(readFileSync(ENV_PATH, 'utf8'));
}

// Merge: process.env wins over .env (so runtime overrides work).
const fileEnv = loadEnvFile();
const env = { ...fileEnv, ...Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== undefined)) };

const KEY_ID = env.RAZORPAY_KEY_ID;
const KEY_SECRET = env.RAZORPAY_KEY_SECRET;
if (!KEY_ID || !KEY_SECRET) die(3, 'RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set in env or .env');

const AUTH = 'Basic ' + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');
const API = 'https://api.razorpay.com/v1';
const MODE = KEY_ID.startsWith('rzp_live_') ? 'LIVE' : 'TEST';

// ---------- HTTP ----------
async function rzp(method, path, body) {
  const url = API + path;
  vlog(method, path, body ? JSON.stringify(body) : '');
  if (DRY && method !== 'GET') {
    vlog(c.yellow('[dry] skipped'));
    return { __dry: true };
  }
  const res = await fetch(url, {
    method,
    headers: { Authorization: AUTH, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json; try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  if (!res.ok) {
    const err = new Error(`${method} ${path} → ${res.status}: ${json?.error?.description || text}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

// ---------- captured outputs ----------
const captured = {}; // KEY -> value to write to .env
const changes = []; // human-readable change log
const counters = {
  plans: { created: 0, skipped: 0 },
  offers: { created: 0, skipped: 0, failed: 0 },
  webhook: { created: 0, updated: 0, skipped: 0 },
  links: { created: 0, skipped: 0 },
};

// =====================================================================
// Step 1: Verify auth
// =====================================================================
async function verifyAuth() {
  log(c.bold('\n[1/6] Verify auth'));
  try {
    const r = await rzp('GET', '/plans?count=1');
    log(c.green('  ✓') + ` auth OK (mode: ${MODE})`);
    vlog('plans probe returned', (r.items || []).length, 'item(s)');
  } catch (e) {
    if (e.status === 401) die(1, `Razorpay auth failed (401). Check RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET.`);
    die(2, e.message);
  }
}

// =====================================================================
// Step 2: Plans (4 plans)
// =====================================================================
const PLAN_SPEC = [
  { tag: 'pro_monthly', envKey: 'RAZORPAY_PLAN_PRO_MONTHLY', period: 'monthly', interval: 1, amount: 9900, name: 'Oriz Pro Monthly' },
  { tag: 'pro_yearly',  envKey: 'RAZORPAY_PLAN_PRO_YEARLY',  period: 'yearly',  interval: 1, amount: 79900, name: 'Oriz Pro Yearly' },
  { tag: 'max_monthly', envKey: 'RAZORPAY_PLAN_MAX_MONTHLY', period: 'monthly', interval: 1, amount: 29900, name: 'Oriz Max Monthly' },
  { tag: 'max_yearly',  envKey: 'RAZORPAY_PLAN_MAX_YEARLY',  period: 'yearly',  interval: 1, amount: 249900, name: 'Oriz Max Yearly' },
];

const planResults = {}; // tag -> plan_id

async function syncPlans() {
  log(c.bold('\n[2/6] Plans'));
  const existing = (await rzp('GET', '/plans?count=100')).items || [];
  for (const spec of PLAN_SPEC) {
    // Match either by notes.oriz_plan_id OR by existing env var pointing at a live plan_id.
    let hit = existing.find((p) => p?.notes?.oriz_plan_id === spec.tag);
    if (!hit && env[spec.envKey]) {
      hit = existing.find((p) => p.id === env[spec.envKey]);
    }
    if (hit) {
      planResults[spec.tag] = hit.id;
      captured[spec.envKey] = hit.id;
      counters.plans.skipped++;
      log(`  ${c.dim('·')} ${spec.tag.padEnd(12)} → ${c.dim(hit.id)} (exists)`);
      continue;
    }
    const created = await rzp('POST', '/plans', {
      period: spec.period,
      interval: spec.interval,
      item: { name: spec.name, amount: spec.amount, currency: 'INR' },
      notes: { oriz_plan_id: spec.tag },
    });
    const id = created.__dry ? '(dry)' : created.id;
    planResults[spec.tag] = id;
    captured[spec.envKey] = id;
    counters.plans.created++;
    changes.push(`plan:${spec.tag}=${id}`);
    log(`  ${c.green('+')} ${spec.tag.padEnd(12)} → ${id} ${c.green('(created)')}`);
  }
}

// =====================================================================
// Step 3: Offers
// =====================================================================
const OFFER_SPEC = [
  { tag: 'founder50', code: 'FOUNDER50', pct: 50, plans: ['pro_monthly', 'pro_yearly', 'max_monthly', 'max_yearly'], max_redemptions: 100, expires_at: null },
  { tag: 'launch30',  code: 'LAUNCH30',  pct: 30, plans: ['pro_yearly', 'max_yearly'], max_redemptions: null, expires_at: Math.floor(new Date('2026-07-31T23:59:00+05:30').getTime() / 1000) },
  { tag: 'blog20',    code: 'BLOG20',    pct: 20, plans: ['pro_monthly', 'pro_yearly', 'max_monthly', 'max_yearly'], max_redemptions: null, expires_at: null },
  { tag: 'student50', code: 'STUDENT50', pct: 50, plans: ['pro_monthly', 'pro_yearly'], max_redemptions: null, expires_at: null },
];

let OFFERS_DISABLED = false;
const offerResults = {}; // tag -> offer_id

async function syncOffers() {
  log(c.bold('\n[3/6] Offers (promo codes)'));
  let existing = [];
  try {
    const r = await rzp('GET', '/offers?count=100');
    existing = r.items || r.entity ? (r.items || []) : [];
  } catch (e) {
    if (e.status === 400 || e.status === 404 || e.status === 403) {
      OFFERS_DISABLED = true;
      log(c.yellow('  ! Offers API not enabled on this account.'));
      log(c.dim('    Razorpay Offers requires Magic Checkout / Promotions add-on.'));
      log(c.dim('    Manual fallback: Dashboard → Promotions → Offers → Create.'));
      log(c.dim('    Re-run this script after enabling; it will pick them up.'));
      counters.offers.failed = OFFER_SPEC.length;
      return;
    }
    throw e;
  }

  for (const spec of OFFER_SPEC) {
    const hit = existing.find((o) => o?.notes?.oriz_offer_id === spec.tag || o?.name === spec.code);
    if (hit) {
      offerResults[spec.tag] = hit.id;
      captured[`RAZORPAY_OFFER_${spec.tag.toUpperCase()}`] = hit.id;
      counters.offers.skipped++;
      log(`  ${c.dim('·')} ${spec.tag.padEnd(12)} → ${c.dim(hit.id)} (exists)`);
      continue;
    }
    const planIds = spec.plans.map((t) => planResults[t]).filter(Boolean);
    const body = {
      name: spec.code,
      percent_rate: spec.pct,
      payment_method: 'card',
      display_text: `${spec.pct}% off`,
      terms: 'Auto-generated by oriz bootstrap',
      plan_ids: planIds.length ? planIds : undefined,
      max_offer_usage: spec.max_redemptions ?? undefined,
      ends_at: spec.expires_at ?? undefined,
      notes: { oriz_offer_id: spec.tag },
    };
    try {
      const created = await rzp('POST', '/offers', body);
      const id = created.__dry ? '(dry)' : created.id;
      offerResults[spec.tag] = id;
      captured[`RAZORPAY_OFFER_${spec.tag.toUpperCase()}`] = id;
      counters.offers.created++;
      changes.push(`offer:${spec.tag}=${id}`);
      log(`  ${c.green('+')} ${spec.tag.padEnd(12)} → ${id} ${c.green('(created)')}`);
    } catch (e) {
      counters.offers.failed++;
      log(`  ${c.red('✗')} ${spec.tag.padEnd(12)} → ${c.red(e.message)}`);
      log(c.dim('    Fallback: create manually in Razorpay Dashboard → Promotions → Offers.'));
    }
  }
}

// =====================================================================
// Step 4: Webhook
// =====================================================================
const WEBHOOK_URL = 'https://oriz.in/api/billing-webhook/razorpay';
// Note: `subscription.expired` is rejected by Razorpay's webhook API on some
// accounts ("Invalid event name"). Razorpay treats expiry as
// subscription.completed / subscription.halted, so we omit it.
const WEBHOOK_EVENTS = [
  'subscription.activated',
  'subscription.charged',
  'subscription.cancelled',
  'subscription.completed',
  'subscription.halted',
  'subscription.pending',
  'subscription.updated',
  'payment.failed',
];

async function syncWebhook() {
  log(c.bold('\n[4/6] Webhook'));
  let r;
  try { r = await rzp('GET', '/webhooks?count=100'); }
  catch (e) { log(c.yellow(`  ! GET /webhooks failed: ${e.message} — skipping webhook step`)); return; }
  const list = r.items || [];
  const hit = list.find((w) => w.url === WEBHOOK_URL);
  const secret = env.RAZORPAY_WEBHOOK_SECRET;
  // Razorpay PUT/POST shape: events as object {name: true}.
  const eventsObj = Object.fromEntries(WEBHOOK_EVENTS.map((e) => [e, true]));
  if (!hit) {
    const body = { url: WEBHOOK_URL, events: eventsObj, alert_email: env.RAZORPAY_ALERT_EMAIL || undefined };
    if (secret) body.secret = secret;
    try {
      const created = await rzp('POST', '/webhooks', body);
      counters.webhook.created++;
      changes.push(`webhook=${created.id || '(dry)'}`);
      log(`  ${c.green('+')} created ${created.id || '(dry)'} → ${WEBHOOK_URL}`);
    } catch (e) {
      log(`  ${c.red('✗')} create failed: ${c.red(e.message)}`);
    }
    return;
  }
  // Razorpay returns events as object {name: true|false}. Extract enabled names.
  const enabledEvents = Array.isArray(hit.events)
    ? hit.events
    : Object.entries(hit.events || {}).filter(([, v]) => v === true).map(([k]) => k);
  const haveEvents = new Set(enabledEvents);
  const missing = WEBHOOK_EVENTS.filter((e) => !haveEvents.has(e));
  if (missing.length) {
    // Merge: keep existing enabled events + flip on the missing required ones.
    const mergedObj = Object.fromEntries(
      [...new Set([...enabledEvents, ...WEBHOOK_EVENTS])].map((e) => [e, true])
    );
    try {
      await rzp('PUT', `/webhooks/${hit.id}`, { url: WEBHOOK_URL, events: mergedObj });
      counters.webhook.updated++;
      changes.push(`webhook:events +${missing.length}`);
      log(`  ${c.yellow('~')} ${hit.id} updated — added ${missing.length} event(s): ${missing.join(', ')}`);
    } catch (e) {
      log(`  ${c.red('✗')} PUT failed: ${c.red(e.message)} — leaving webhook untouched`);
    }
  } else {
    counters.webhook.skipped++;
    log(`  ${c.dim('·')} ${hit.id} → ${WEBHOOK_URL} (all ${WEBHOOK_EVENTS.length} required events present, skip)`);
  }
}

// =====================================================================
// Step 5: Subscription Links (one share-via-URL per plan)
// =====================================================================
async function syncSubscriptionLinks() {
  log(c.bold('\n[5/6] Subscription links'));
  let existing = [];
  try {
    const r = await rzp('GET', '/subscriptions?count=100');
    existing = r.items || [];
  } catch (e) {
    log(c.yellow(`  ! GET /subscriptions failed: ${e.message}`));
  }
  for (const spec of PLAN_SPEC) {
    const plan_id = planResults[spec.tag];
    if (!plan_id || plan_id === '(dry)') {
      log(`  ${c.dim('·')} ${spec.tag.padEnd(12)} skipped (no plan_id)`);
      continue;
    }
    const linkTag = `${spec.tag}_link`;
    const hit = existing.find((s) => s?.notes?.oriz_link_id === linkTag);
    if (hit) {
      const url = hit.short_url || hit.url;
      captured[`RAZORPAY_LINK_${spec.tag.toUpperCase()}`] = url;
      counters.links.skipped++;
      log(`  ${c.dim('·')} ${spec.tag.padEnd(12)} → ${c.dim(url)} (exists)`);
      continue;
    }
    try {
      // total_count cap depends on period: Razorpay rejects yearly > 100.
      const total_count = spec.period === 'yearly' ? 100 : 120;
      const created = await rzp('POST', '/subscriptions', {
        plan_id,
        total_count,
        customer_notify: 1,
        notes: { oriz_link_id: linkTag },
      });
      const url = created.__dry ? '(dry)' : (created.short_url || created.url || '(no url returned)');
      captured[`RAZORPAY_LINK_${spec.tag.toUpperCase()}`] = url;
      counters.links.created++;
      changes.push(`link:${spec.tag}=${url}`);
      log(`  ${c.green('+')} ${spec.tag.padEnd(12)} → ${url} ${c.green('(created)')}`);
    } catch (e) {
      log(`  ${c.red('✗')} ${spec.tag.padEnd(12)} → ${c.red(e.message)}`);
    }
  }
}

// =====================================================================
// .env writer
// =====================================================================
function writeEnvUpdates() {
  if (DRY) { log(c.dim('\n[.env] dry-run — no writes')); return { added: 0, updated: 0 }; }
  if (!existsSync(ENV_PATH)) { log(c.yellow('\n[.env] not found, skipping write')); return { added: 0, updated: 0 }; }
  const raw = readFileSync(ENV_PATH, 'utf8');
  let out = raw;
  let added = 0, updated = 0;
  for (const [k, v] of Object.entries(captured)) {
    if (!v || v === '(dry)') continue;
    const re = new RegExp(`^${k}=.*$`, 'm');
    if (re.test(out)) {
      const before = out;
      out = out.replace(re, `${k}=${v}`);
      if (before !== out) updated++;
    } else {
      // Append in a Razorpay section.
      if (!/# ---- Razorpay /m.test(out)) {
        out += `\n# ---- Razorpay (bootstrap) ----\n`;
      }
      out += `${k}=${v}\n`;
      added++;
    }
  }
  if (out !== raw) writeFileSync(ENV_PATH, out);
  log(`\n[.env] ${added} added, ${updated} updated`);
  return { added, updated };
}

function reencryptEnv() {
  if (DRY) return;
  try {
    execSync('sops --version', { stdio: 'ignore' });
  } catch {
    log(c.yellow('[.env.enc] sops not on PATH — skipping re-encrypt. Run manually:'));
    log(c.dim('  sops --encrypt --input-type dotenv --output-type dotenv .env > .env.enc'));
    return;
  }
  try {
    execSync(
      'sops --encrypt --input-type dotenv --output-type dotenv .env > .env.enc',
      { cwd: REPO_ROOT, stdio: 'inherit', env: { ...process.env, SOPS_AGE_KEY_FILE: env.SOPS_AGE_KEY_FILE || '.sops-age-key.txt' } }
    );
    log(c.green('[.env.enc] re-encrypted'));
  } catch (e) {
    log(c.yellow('[.env.enc] re-encrypt failed: ' + e.message));
  }
}

// =====================================================================
// Run
// =====================================================================
(async () => {
  log(c.bold(`Razorpay bootstrap — ${MODE} mode${DRY ? c.yellow(' [DRY-RUN]') : ''}`));
  log(c.dim(`key_id: ${KEY_ID.slice(0, 12)}…  repo: ${REPO_ROOT}`));

  try {
    await verifyAuth();
  } catch (e) { die(2, e.message); }
  // Each subsequent step is wrapped so a soft failure in one doesn't abort the rest.
  for (const [name, fn] of [['plans', syncPlans], ['offers', syncOffers], ['webhook', syncWebhook], ['links', syncSubscriptionLinks]]) {
    try { await fn(); }
    catch (e) { log(c.red(`\n[${name}] aborted: ${e.message}`)); }
  }

  const envStats = writeEnvUpdates();
  reencryptEnv();

  // ---------- summary ----------
  log(c.bold('\n=== Razorpay Bootstrap Complete ==='));
  log('\nPlans:');
  for (const s of PLAN_SPEC) log(`  ${s.tag.padEnd(12)} → ${planResults[s.tag] || '(none)'}`);
  log('\nOffers:');
  if (OFFERS_DISABLED) {
    log(c.yellow('  ! Offers API not enabled — create manually in Dashboard → Promotions → Offers.'));
  }
  for (const s of OFFER_SPEC) log(`  ${s.tag.padEnd(12)} → ${offerResults[s.tag] || (OFFERS_DISABLED ? 'Dashboard manual creation required' : '(failed)')}`);
  log('\nWebhook:');
  log(`  url: ${WEBHOOK_URL}`);
  log(`  events: ${WEBHOOK_EVENTS.length} subscribed`);
  log(`  state: created=${counters.webhook.created} updated=${counters.webhook.updated} skipped=${counters.webhook.skipped}`);
  log('\nSubscription Links:');
  for (const s of PLAN_SPEC) log(`  ${s.tag.padEnd(12)}: ${captured[`RAZORPAY_LINK_${s.tag.toUpperCase()}`] || '(none)'}`);
  log(`\n.env: ${envStats.added} keys added, ${envStats.updated} updated`);
  log(c.bold(`\nTotals: plans c=${counters.plans.created}/s=${counters.plans.skipped}  offers c=${counters.offers.created}/s=${counters.offers.skipped}/f=${counters.offers.failed}  webhook c=${counters.webhook.created}/u=${counters.webhook.updated}/s=${counters.webhook.skipped}  links c=${counters.links.created}/s=${counters.links.skipped}`));

  process.exit(0);
})();
