#!/usr/bin/env node
// Audit-only: list every CNAME on oriz.in, cross-ref with CF Pages projects
// and FAMILY_APPS/APIS subdomains. Read-only — never deletes.
//
// Usage: node scripts/cf-audit-orphan-cnames.mjs --env=.env

import { readFileSync, existsSync } from 'node:fs';

const ZONE = 'oriz.in';

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

const TOKEN = process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_KEY;
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!TOKEN) { console.error('Missing CLOUDFLARE_API_TOKEN'); process.exit(1); }

const API = 'https://api.cloudflare.com/client/v4';
const H = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

async function cf(path, init = {}) {
  const res = await fetch(`${API}${path}`, { ...init, headers: { ...H, ...(init.headers || {}) } });
  const json = await res.json();
  if (!json.success) throw new Error(`${path}: ${res.status} ${JSON.stringify(json.errors)}`);
  return json;
}

async function cfAll(basePath) {
  let page = 1;
  const all = [];
  while (true) {
    const sep = basePath.includes('?') ? '&' : '?';
    const { result, result_info } = await cf(`${basePath}${sep}page=${page}&per_page=100`);
    all.push(...result);
    if (!result_info || result.length < result_info.per_page || all.length >= result_info.total_count) break;
    page++;
  }
  return all;
}

const { result: zones } = await cf(`/zones?name=${ZONE}`);
const zoneId = zones[0].id;

// 1. All CNAME records
const dns = await cfAll(`/zones/${zoneId}/dns_records?type=CNAME`);

// 2. CF Pages projects (no pagination supported on this endpoint)
let pagesProjects = [];
if (ACCOUNT) {
  const { result } = await cf(`/accounts/${ACCOUNT}/pages/projects`);
  pagesProjects = result;
}
const pagesSet = new Set(pagesProjects.map(p => p.name.toLowerCase()));
const pagesDomainMap = new Map(); // domain -> project name
for (const p of pagesProjects) {
  for (const d of p.domains || []) {
    pagesDomainMap.set(d.toLowerCase(), p.name);
  }
}

// 3. Workers
let workers = [];
if (ACCOUNT) {
  try {
    const { result } = await cf(`/accounts/${ACCOUNT}/workers/scripts`);
    workers = result;
  } catch (e) {
    console.error('worker list failed:', e.message);
  }
}
const workerSet = new Set(workers.map(w => (w.id || w.name || '').toLowerCase()));

// 4. Build expected subdomain set from family-data (textual parse — TS import not needed)
let expected = new Set();
try {
  const tsFile = readFileSync('projects/oriz/own/lib/npm/astro-shell-npm-pkg/src/family-data.ts', 'utf8');
  // Extract every "url: 'https://...oriz.in'"
  const re = /url:\s*['"]https?:\/\/([^'"\/]+\.oriz\.in)['"]/g;
  let m;
  while ((m = re.exec(tsFile))) {
    expected.add(m[1].toLowerCase());
  }
} catch (e) { console.error('Failed to read family-data:', e.message); }

// also accept the bare zone
expected.add('oriz.in');

const out = {
  zone: ZONE,
  zoneId,
  cnameCount: dns.length,
  pagesProjectCount: pagesProjects.length,
  workerCount: workers.length,
  expectedSubdomains: [...expected].sort(),
  pagesProjects: pagesProjects.map(p => ({ name: p.name, subdomain: p.subdomain, domains: p.domains })),
  workers: workers.map(w => w.id || w.name),
  cnames: dns.map(r => ({
    name: r.name,
    target: r.content,
    proxied: r.proxied,
    comment: r.comment || null,
  })),
};

console.log(JSON.stringify(out, null, 2));
