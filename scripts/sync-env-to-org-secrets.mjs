#!/usr/bin/env node
/**
 * sync-env-to-org-secrets.mjs
 *
 * Single source of truth for env vars: `c:/D/oriz/.env` (gitignored) →
 * encrypted as `.env.enc` via sops+age → decrypted here → pushed to the
 * `oriz-co` GitHub Organization as ORG-LEVEL Actions secrets (visibility=all).
 *
 * 2026-06-22: migrated from per-repo fan-out (~3,770 API calls) to org-level
 * (~65 API calls). chirag127 was a USER account; oriz-co is the new Org.
 *
 * Inputs:
 *   - .env.enc            (committed, sops-encrypted)
 *   - .sops-age-key.txt   (LOCAL only) OR env var SOPS_AGE_KEY (CI)
 *   - .env.example  (canonical key list — only push keys listed there)
 *
 * Behavior:
 *   1. Decrypt .env.enc → in-memory key/value map
 *   2. Read .env.example for canonical keys
 *   3. For each canonical key with a non-empty value, push ONCE to org-level
 *      with visibility=all
 *   4. Skip empty values (placeholders) and reserved GH_/ACTIONS_ prefixed names
 *   5. Sleep 200ms between calls to stay polite on the API
 *   6. Report: keys pushed, failures
 *
 * Auth: requires GH_TOKEN (or gh auth) with `admin:org` scope. Use
 *       GH_ADMIN_PAT locally (sourced from .env) or in CI.
 *
 * Flags:
 *   --dry-run        Print what would be pushed; no API calls
 *   --keys <a,b,c>   Restrict to a subset of keys (debug)
 */

import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([a-zA-Z]):/, "$1:"));
const ENC_PATH = join(ROOT, ".env.enc");
const EXAMPLE_PATH = join(ROOT, ".env.example");
const SOPS_CONFIG = join(ROOT, ".sops.yaml");
const LOCAL_KEY_PATH = join(ROOT, ".sops-age-key.txt");
const LOCAL_ENV_PATH = join(ROOT, ".env");

// Target: org-level secrets on the `oriz-co` GH Organization with visibility=all.
const ORG = "oriz-co";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const flagVal = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};
const DRY = flag("--dry-run");
const ONLY_KEYS = (flagVal("--keys") || "").split(",").map((s) => s.trim()).filter(Boolean);

function findSops() {
  for (const c of ["sops", "sops.exe"]) {
    try {
      execFileSync(c, ["--version"], { stdio: "ignore" });
      return c;
    } catch {}
  }
  const winget = "C:/Users/C5420321/AppData/Local/Microsoft/WinGet/Packages/SecretsOPerationS.SOPS_Microsoft.Winget.Source_8wekyb3d8bbwe/sops.exe";
  if (existsSync(winget)) return winget;
  throw new Error("sops not found on PATH or winget install dir");
}

function decryptEnv() {
  const sops = findSops();
  const env = { ...process.env };
  if (!env.SOPS_AGE_KEY && !env.SOPS_AGE_KEY_FILE) {
    if (existsSync(LOCAL_KEY_PATH)) {
      env.SOPS_AGE_KEY_FILE = LOCAL_KEY_PATH;
    } else {
      throw new Error("Neither SOPS_AGE_KEY env nor .sops-age-key.txt available");
    }
  }
  return execFileSync(
    sops,
    ["--config", SOPS_CONFIG, "--decrypt", "--input-type", "dotenv", "--output-type", "dotenv", ENC_PATH],
    { encoding: "utf8", env, maxBuffer: 32 * 1024 * 1024 }
  );
}

function parseDotenv(text) {
  const out = new Map();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/^﻿/, "");
    if (!line || /^\s*#/.test(line)) continue;
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out.set(m[1], v);
  }
  return out;
}

function canonicalKeys() {
  const text = readFileSync(EXAMPLE_PATH, "utf8");
  const keys = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/^﻿/, "");
    if (!line || /^\s*#/.test(line)) continue;
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (m) keys.push(m[1]);
  }
  return [...new Set(keys)];
}

function loadAdminPatFromEnv() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  if (process.env.GH_ADMIN_PAT) return process.env.GH_ADMIN_PAT;
  if (!existsSync(LOCAL_ENV_PATH)) return null;
  const m = readFileSync(LOCAL_ENV_PATH, "utf8").match(/^GH_ADMIN_PAT\s*=\s*(.+)$/m);
  if (!m) return null;
  let v = m[1].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  return v;
}

function setOrgSecret(key, value, token) {
  if (DRY) {
    console.log(`  [dry] ${ORG} org-level: ${key}`);
    return { ok: true };
  }
  const env = { ...process.env };
  if (token) env.GH_TOKEN = token;
  const r = spawnSync(
    "gh",
    ["secret", "set", key, "--org", ORG, "--visibility", "all", "--body", "-"],
    { input: value, encoding: "utf8", env }
  );
  if (r.status !== 0) {
    return { ok: false, err: (r.stderr || r.stdout || "").trim() };
  }
  return { ok: true };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log(`[env-sync] root=${ROOT}`);
  console.log(`[env-sync] org=${ORG} dry-run=${DRY} only-keys=${ONLY_KEYS.length || "(all)"}`);

  const token = loadAdminPatFromEnv();
  if (!DRY && !token) {
    console.error("[env-sync] FATAL: no GH_ADMIN_PAT in env or .env (need admin:org scope)");
    process.exit(1);
  }

  const decrypted = decryptEnv();
  const values = parseDotenv(decrypted);
  console.log(`[env-sync] decrypted: ${values.size} key=value pairs in .env.enc`);

  const canonical = canonicalKeys();
  console.log(`[env-sync] canonical: ${canonical.length} keys in .env.example`);

  const RESERVED = new Set(["GITHUB_TOKEN"]);
  const RESERVED_PREFIXES = ["GITHUB_", "ACTIONS_"];
  const isReserved = (k) => RESERVED.has(k) || RESERVED_PREFIXES.some((p) => k.startsWith(p));

  const toPush = canonical.filter((k) => {
    const v = values.get(k);
    if (v === undefined || v === "") return false;
    if (isReserved(k)) return false;
    if (ONLY_KEYS.length && !ONLY_KEYS.includes(k)) return false;
    return true;
  });
  const skipped = canonical.filter((k) => !toPush.includes(k));

  console.log(`[env-sync] pushable: ${toPush.length} keys (skipped ${skipped.length} empty/missing/reserved)`);

  const orphans = [...values.keys()].filter((k) => !canonical.includes(k));
  if (orphans.length) {
    console.log(`[env-sync] WARN: ${orphans.length} keys in .env.enc not listed in .env.example (not pushed): ${orphans.slice(0, 10).join(", ")}${orphans.length > 10 ? "..." : ""}`);
  }

  let ok = 0, fail = 0;
  const failures = [];
  for (const key of toPush) {
    const res = setOrgSecret(key, values.get(key), token);
    if (res.ok) {
      ok++;
      console.log(`  ok  ${key}`);
    } else {
      fail++;
      failures.push({ key, err: res.err });
      console.log(`  FAIL ${key}: ${res.err.split("\n")[0]}`);
    }
    if (!DRY) await sleep(200);
  }

  console.log("");
  console.log(`[env-sync] DONE: ${ok} secrets set, ${fail} failed at org level (${ORG})`);
  if (failures.length) {
    console.log(`[env-sync] first 10 failures:`);
    for (const f of failures.slice(0, 10)) {
      console.log(`  ${f.key}: ${f.err.split("\n")[0]}`);
    }
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("[env-sync] FATAL:", e.message);
  process.exit(1);
});
