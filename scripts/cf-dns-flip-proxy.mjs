#!/usr/bin/env node
// Flips proxied state for *.api.oriz.in CNAMEs. Idempotent.
// Default: proxied=true (orange cloud). Override with --proxy=off.
//
// Usage:
//   node scripts/cf-dns-flip-proxy.mjs --env=.env [--proxy=on|off]

import { readFileSync, existsSync } from 'node:fs';

const ZONE = 'oriz.in';
const SUBS = [
  'fii-dii', 'mmi', 'mf-nav', 'pincode', 'ifsc', 'holidays', 'currency',
  'tickers', 'rbi-rates', 'gold-silver', 'irctc', 'aqi-india', 'aqi',
  'fuel', 'exams', 'rti', 'judgments', 'budget', 'so-trending',
];

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

const proxyArg = process.argv.find(a => a.startsWith('--proxy='));
const PROXIED = proxyArg ? proxyArg.slice(8) !== 'off' : true;

const TOKEN = process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_KEY;
if (!TOKEN) { console.error('Missing CLOUDFLARE_API_TOKEN'); process.exit(1); }

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
console.log(`zone ${ZONE} -> ${zoneId}`);
console.log(`target proxied=${PROXIED}\n`);

const summary = { flipped: 0, already: 0, missing: 0, error: 0 };

for (const sub of SUBS) {
  const fqdn = `${sub}.api.${ZONE}`;
  try {
    const { result: existing } = await cf(`/zones/${zoneId}/dns_records?name=${fqdn}`);
    if (!existing.length) {
      console.log(`  missing  ${fqdn}`); summary.missing++; continue;
    }
    const rec = existing[0];
    if (rec.proxied === PROXIED) {
      console.log(`  already  ${fqdn} (proxied=${rec.proxied})`); summary.already++;
    } else {
      await cf(`/zones/${zoneId}/dns_records/${rec.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ proxied: PROXIED }),
      });
      console.log(`  flipped  ${fqdn} (proxied: ${rec.proxied} -> ${PROXIED})`);
      summary.flipped++;
    }
  } catch (e) {
    console.log(`  error    ${fqdn}: ${e.message}`); summary.error++;
  }
}

console.log(`\nsummary: flipped=${summary.flipped} already=${summary.already} missing=${summary.missing} error=${summary.error} total=${SUBS.length}`);
process.exit(summary.error ? 1 : 0);
