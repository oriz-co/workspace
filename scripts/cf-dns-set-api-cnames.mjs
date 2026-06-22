#!/usr/bin/env node
// Sets/updates CNAME records for *.api.oriz.in -> chirag127.github.io (DNS-only, grey cloud).
// Reads CLOUDFLARE_API_KEY (or CLOUDFLARE_API_TOKEN) from env. Idempotent.
//
// Usage:
//   node scripts/cf-dns-set-api-cnames.mjs
//   (load env first: e.g. `set -a; . ./.env; set +a; node scripts/cf-dns-set-api-cnames.mjs`)

import { readFileSync, existsSync } from 'node:fs';

const ZONE = 'oriz.in';
const TARGET = 'chirag127.github.io';
const SUBS = [
  'fii-dii', 'mmi', 'mf-nav', 'pincode', 'ifsc', 'holidays', 'currency',
  'tickers', 'rbi-rates', 'gold-silver', 'irctc', 'aqi-india', 'aqi',
  'fuel', 'exams', 'rti', 'judgments', 'budget', 'so-trending',
];

// Allow loading a dotenv-style file via --env=<path>
const envArg = process.argv.find(a => a.startsWith('--env='));
if (envArg) {
  const path = envArg.slice(6);
  if (existsSync(path)) {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
    }
  }
}

const TOKEN = process.env.CLOUDFLARE_API_KEY || process.env.CLOUDFLARE_API_TOKEN;
if (!TOKEN) { console.error('Missing CLOUDFLARE_API_KEY/CLOUDFLARE_API_TOKEN'); process.exit(1); }

const API = 'https://api.cloudflare.com/client/v4';
const H = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

async function cf(path, init = {}) {
  const res = await fetch(`${API}${path}`, { ...init, headers: { ...H, ...(init.headers || {}) } });
  const json = await res.json();
  if (!json.success) throw new Error(`${path}: ${JSON.stringify(json.errors)}`);
  return json;
}

const { result: zones } = await cf(`/zones?name=${ZONE}`);
if (!zones.length) { console.error(`Zone ${ZONE} not found`); process.exit(1); }
const zoneId = zones[0].id;
console.log(`zone ${ZONE} -> ${zoneId}\n`);

const summary = { created: 0, updated: 0, skipped: 0, error: 0 };

for (const sub of SUBS) {
  const fqdn = `${sub}.api.${ZONE}`;
  const name = `${sub}.api`;
  try {
    const { result: existing } = await cf(`/zones/${zoneId}/dns_records?name=${fqdn}`);
    const body = { type: 'CNAME', name, content: TARGET, proxied: false, ttl: 1 };

    if (!existing.length) {
      await cf(`/zones/${zoneId}/dns_records`, { method: 'POST', body: JSON.stringify(body) });
      console.log(`  created  ${fqdn}`); summary.created++;
    } else {
      const rec = existing[0];
      if (rec.type === 'CNAME' && rec.content === TARGET && rec.proxied === false) {
        console.log(`  skipped  ${fqdn} (already correct)`); summary.skipped++;
      } else {
        await cf(`/zones/${zoneId}/dns_records/${rec.id}`, { method: 'PATCH', body: JSON.stringify(body) });
        console.log(`  updated  ${fqdn} (was type=${rec.type} content=${rec.content} proxied=${rec.proxied})`);
        summary.updated++;
      }
    }
  } catch (e) {
    console.log(`  error    ${fqdn}: ${e.message}`); summary.error++;
  }
}

console.log(`\nzone_id=${zoneId}`);
console.log(`summary: created=${summary.created} updated=${summary.updated} skipped=${summary.skipped} error=${summary.error} total=${SUBS.length}`);
process.exit(summary.error ? 1 : 0);
