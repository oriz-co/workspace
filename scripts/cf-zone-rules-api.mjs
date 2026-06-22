#!/usr/bin/env node
// Creates 3 zone-level rules for *.api.oriz.in:
//   1. Cache Rule: cache .json for 1h edge / 30min browser
//   2. Configuration Rule: enable always_online
//   3. Response Header Transform Rule: add Access-Control-Allow-Origin: *
//
// Uses Cloudflare Rulesets API (free tier).
// Idempotent: deletes existing rules in each phase ruleset and recreates.

import { readFileSync, existsSync } from 'node:fs';

const ZONE = 'oriz.in';
const HOST_RE = '^.+\\.api\\.oriz\\.in$';

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
if (!TOKEN) { console.error('Missing CLOUDFLARE_API_TOKEN'); process.exit(1); }

const API = 'https://api.cloudflare.com/client/v4';
const H = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

async function cf(path, init = {}) {
  const res = await fetch(`${API}${path}`, { ...init, headers: { ...H, ...(init.headers || {}) } });
  const json = await res.json();
  if (!json.success) throw new Error(`${path}: ${res.status} ${JSON.stringify(json.errors)}`);
  return json;
}

const { result: zones } = await cf(`/zones?name=${ZONE}`);
const zoneId = zones[0].id;
console.log(`zone ${ZONE} -> ${zoneId}\n`);

// Helper: replace the entrypoint ruleset for a phase with one fresh rule.
async function setEntrypointRule(phase, rule, label) {
  const path = `/zones/${zoneId}/rulesets/phases/${phase}/entrypoint`;
  try {
    const { result } = await cf(path, {
      method: 'PUT',
      body: JSON.stringify({
        name: `default`,
        description: `oriz api subdomain rules (${phase})`,
        rules: [rule],
      }),
    });
    console.log(`  ok      ${label}  ruleset_id=${result.id}`);
    return result;
  } catch (e) {
    console.log(`  error   ${label}: ${e.message}`);
    throw e;
  }
}

// Rule 1: Cache .json for 1h
const cacheRule = {
  action: 'set_cache_settings',
  expression: `(http.host matches "${HOST_RE}") and (http.request.uri.path.extension eq "json")`,
  description: 'cache .json on *.api.oriz.in for 1h edge / 30min browser',
  enabled: true,
  action_parameters: {
    cache: true,
    edge_ttl: { mode: 'override_origin', default: 3600 },
    browser_ttl: { mode: 'override_origin', default: 1800 },
  },
};

// Rule 2: Always-online for all paths on *.api.oriz.in
// (always_online lives in http_config_settings phase via 'set_config' action)
const alwaysOnlineRule = {
  action: 'set_config',
  expression: `(http.host matches "${HOST_RE}")`,
  description: 'enable always-online for *.api.oriz.in',
  enabled: true,
  action_parameters: {
    autominify: { html: false, css: false, js: false },
    bic: false,
    disable_apps: false,
    disable_zaraz: false,
    disable_railgun: false,
    email_obfuscation: false,
    hotlink_protection: false,
    mirage: false,
    opportunistic_encryption: true,
    polish: 'off',
    rocket_loader: false,
    server_side_excludes: false,
    ssl: 'flexible',
    sxg: false,
  },
};

// Rule 3: CORS allow-all on response
const corsRule = {
  action: 'rewrite',
  expression: `(http.host matches "${HOST_RE}")`,
  description: 'CORS allow-all on *.api.oriz.in responses',
  enabled: true,
  action_parameters: {
    headers: {
      'access-control-allow-origin': { operation: 'set', value: '*' },
    },
  },
};

console.log('Phase 2: Cache Rule for *.json');
await setEntrypointRule('http_request_cache_settings', cacheRule, 'cache .json');

console.log('\nPhase 2: Response Header Transform Rule for CORS');
await setEntrypointRule('http_response_headers_transform', corsRule, 'CORS allow-all');

// always_online is a setting toggle per-zone, not a rule. Configure via setting:
console.log('\nPhase 2: Always-Online (zone setting)');
try {
  await cf(`/zones/${zoneId}/settings/always_online`, {
    method: 'PATCH',
    body: JSON.stringify({ value: 'on' }),
  });
  console.log('  ok      always_online=on (zone-wide)');
} catch (e) {
  console.log(`  error   always_online: ${e.message}`);
}

console.log('\nDone.');
