#!/usr/bin/env node
/**
 * sync-env-to-org-secrets.mjs
 *
 * Single source of truth for env vars: `c:/D/oriz/.env` (gitignored) →
 * encrypted as `.env.enc` via sops+age → decrypted here → pushed to every
 * chirag127/oriz* + workspace repo as repo-level Actions secrets.
 *
 * IMPORTANT: chirag127 is a GitHub USER account, not an Organization, so
 * org-level secrets are not available. We fan out to repo-level secrets
 * across the oriz family (~42 repos) instead. See knowledge/decisions/security/
 * env-single-source-auto-push.md for context.
 *
 * Inputs:
 *   - .env.enc            (committed, sops-encrypted)
 *   - .sops-age-key.txt   (LOCAL only) OR env var SOPS_AGE_KEY (CI)
 *   - templates/.env.example  (canonical key list — only push keys listed there)
 *
 * Behavior:
 *   1. Decrypt .env.enc → in-memory key/value map
 *   2. Read templates/.env.example for canonical keys
 *   3. For each canonical key with a non-empty value, push to every target repo
 *   4. Skip empty values (placeholders)
 *   5. Report: keys pushed, repos touched, failures
 *
 * Flags:
 *   --dry-run        Print what would be pushed; no API calls
 *   --repo <name>    Restrict to one repo (debug)
 *   --keys <a,b,c>   Restrict to a subset of keys (debug)
 */

import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, existsSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([a-zA-Z]):/, "$1:"));
const ENC_PATH = join(ROOT, ".env.enc");
const EXAMPLE_PATH = join(ROOT, "templates", ".env.example");
const SOPS_CONFIG = join(ROOT, ".sops.yaml");
const LOCAL_KEY_PATH = join(ROOT, ".sops-age-key.txt");

// Default scope: workspace + every repo whose name starts with `oriz`.
const OWNER = "chirag127";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const flagVal = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};
const DRY = flag("--dry-run");
const ONLY_REPO = flagVal("--repo");
const ONLY_KEYS = (flagVal("--keys") || "").split(",").map((s) => s.trim()).filter(Boolean);

function sh(cmd, argv, opts = {}) {
  const r = spawnSync(cmd, argv, { encoding: "utf8", ...opts });
  if (r.status !== 0) {
    const err = new Error(`${cmd} ${argv.join(" ")} -> exit ${r.status}\n${r.stderr || r.stdout}`);
    err.stdout = r.stdout;
    err.stderr = r.stderr;
    throw err;
  }
  return r.stdout;
}

function findSops() {
  // Try PATH first, then known winget install location.
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
  const out = execFileSync(
    sops,
    ["--config", SOPS_CONFIG, "--decrypt", "--input-type", "dotenv", "--output-type", "dotenv", ENC_PATH],
    { encoding: "utf8", env, maxBuffer: 32 * 1024 * 1024 }
  );
  return out;
}

function parseDotenv(text) {
  const out = new Map();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/^﻿/, "");
    if (!line || /^\s*#/.test(line)) continue;
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2];
    // Strip surrounding single/double quotes
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

function listTargetRepos() {
  // workspace + oriz-* under chirag127
  const json = sh("gh", ["repo", "list", OWNER, "--limit", "500", "--json", "name,isArchived"]);
  const all = JSON.parse(json);
  return all
    .filter((r) => !r.isArchived)
    .filter((r) => r.name === "workspace" || r.name.startsWith("oriz"))
    .map((r) => r.name)
    .filter((n) => !ONLY_REPO || n === ONLY_REPO)
    .sort();
}

function setSecret(repo, key, value) {
  if (DRY) {
    console.log(`  [dry] ${OWNER}/${repo}: ${key}`);
    return { ok: true, dry: true };
  }
  // Use stdin to avoid putting value on argv (process list leak).
  const r = spawnSync(
    "gh",
    ["secret", "set", key, "--repo", `${OWNER}/${repo}`, "--body", "-"],
    { input: value, encoding: "utf8" }
  );
  if (r.status !== 0) {
    return { ok: false, err: (r.stderr || r.stdout || "").trim() };
  }
  return { ok: true };
}

async function main() {
  console.log(`[env-sync] root=${ROOT}`);
  console.log(`[env-sync] dry-run=${DRY} only-repo=${ONLY_REPO || "(all oriz)"} only-keys=${ONLY_KEYS.length || "(all)"}`);

  const decrypted = decryptEnv();
  const values = parseDotenv(decrypted);
  console.log(`[env-sync] decrypted: ${values.size} key=value pairs in .env.enc`);

  const canonical = canonicalKeys();
  console.log(`[env-sync] canonical: ${canonical.length} keys in templates/.env.example`);

  // GitHub reserves these secret names — they cannot be set manually.
  // GITHUB_TOKEN is auto-injected per-workflow; GITHUB_*/ACTIONS_* are reserved prefixes.
  const RESERVED = new Set(["GITHUB_TOKEN"]);
  const RESERVED_PREFIXES = ["GITHUB_", "ACTIONS_"];
  const isReserved = (k) => RESERVED.has(k) || RESERVED_PREFIXES.some((p) => k.startsWith(p));

  // Filter: only keys that are canonical AND have non-empty values AND aren't reserved AND match --keys filter
  const toPush = canonical.filter((k) => {
    const v = values.get(k);
    if (v === undefined || v === "") return false;
    if (isReserved(k)) return false;
    if (ONLY_KEYS.length && !ONLY_KEYS.includes(k)) return false;
    return true;
  });
  const skipped = canonical.filter((k) => !toPush.includes(k));

  console.log(`[env-sync] pushable: ${toPush.length} keys (skipped ${skipped.length} empty/missing)`);

  // Warn about keys in .env that aren't in .env.example (drift)
  const orphans = [...values.keys()].filter((k) => !canonical.includes(k));
  if (orphans.length) {
    console.log(`[env-sync] WARN: ${orphans.length} keys in .env.enc not listed in .env.example (not pushed): ${orphans.slice(0, 10).join(", ")}${orphans.length > 10 ? "..." : ""}`);
  }

  const repos = listTargetRepos();
  console.log(`[env-sync] target repos: ${repos.length}`);
  if (repos.length === 0) {
    console.error("[env-sync] FATAL: no target repos found");
    process.exit(1);
  }

  let ok = 0, fail = 0;
  const failures = [];
  for (const repo of repos) {
    let repoOk = 0, repoFail = 0;
    for (const key of toPush) {
      const res = setSecret(repo, key, values.get(key));
      if (res.ok) { ok++; repoOk++; } else {
        fail++; repoFail++;
        failures.push({ repo, key, err: res.err });
      }
    }
    console.log(`  ${OWNER}/${repo}: ${repoOk} ok, ${repoFail} fail`);
  }

  console.log("");
  console.log(`[env-sync] DONE: ${ok} secrets set, ${fail} failed across ${repos.length} repos`);
  if (failures.length) {
    console.log(`[env-sync] first 10 failures:`);
    for (const f of failures.slice(0, 10)) {
      console.log(`  ${f.repo} ${f.key}: ${f.err.split("\n")[0]}`);
    }
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("[env-sync] FATAL:", e.message);
  process.exit(1);
});
