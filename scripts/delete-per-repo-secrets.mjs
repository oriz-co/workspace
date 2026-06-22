#!/usr/bin/env node
/**
 * delete-per-repo-secrets.mjs
 *
 * Cleanup: removes per-repo Actions secrets that are now duplicated at the
 * `oriz-co` org level (visibility=all). Idempotent — safe to re-run.
 *
 * Why: the migration to oriz-co (2026-06-22) pushed 61 secrets to the org
 * level once. Each transferred repo still has the per-repo copies from the
 * old chirag127-era sync. Per-repo copies SHADOW the org value, so we want
 * them gone for true single-source-of-truth.
 *
 * Pace: sleeps 1 second between API calls. ~2,705 deletes ≈ ~45 min wall clock.
 *
 * Flags:
 *   --dry-run        Print plan; no API calls
 *   --repo <name>    Restrict to one repo (debug)
 */

import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([a-zA-Z]):/, "$1:"));
const LOCAL_ENV_PATH = join(ROOT, ".env");
const ORG = "oriz-co";
const SLEEP_MS = 1000;

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const flagVal = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const ONLY_REPO = flagVal("--repo");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadAdminPat() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  if (process.env.GH_ADMIN_PAT) return process.env.GH_ADMIN_PAT;
  if (!existsSync(LOCAL_ENV_PATH)) return null;
  const m = readFileSync(LOCAL_ENV_PATH, "utf8").match(/^GH_ADMIN_PAT\s*=\s*(.+)$/m);
  if (!m) return null;
  let v = m[1].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  return v;
}

function gh(argv, token) {
  const env = { ...process.env };
  if (token) env.GH_TOKEN = token;
  const r = spawnSync("gh", argv, { encoding: "utf8", env });
  return { ok: r.status === 0, stdout: r.stdout || "", stderr: r.stderr || "" };
}

async function main() {
  const token = loadAdminPat();
  if (!token) { console.error("FATAL: no GH_ADMIN_PAT"); process.exit(1); }

  // 1. List org-level secret names (the set we want to dedupe per-repo)
  const orgList = gh(["secret", "list", "--org", ORG, "--json", "name", "--jq", ".[].name"], token);
  if (!orgList.ok) { console.error("FATAL: cannot list org secrets:", orgList.stderr); process.exit(1); }
  const orgSecrets = new Set(orgList.stdout.split(/\r?\n/).filter(Boolean));
  console.log(`[cleanup] org has ${orgSecrets.size} secrets`);

  // 2. List all oriz-co repos
  const repoList = gh(["repo", "list", ORG, "--limit", "500", "--json", "name,isArchived"], token);
  if (!repoList.ok) { console.error("FATAL: cannot list org repos:", repoList.stderr); process.exit(1); }
  const repos = JSON.parse(repoList.stdout)
    .filter((r) => !r.isArchived)
    .filter((r) => !ONLY_REPO || r.name === ONLY_REPO)
    .map((r) => r.name)
    .sort();
  console.log(`[cleanup] ${repos.length} repos to scan`);

  let totalDeleted = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];
    const ls = gh(["secret", "list", "--repo", `${ORG}/${repo}`, "--json", "name", "--jq", ".[].name"], token);
    if (!ls.ok) {
      console.log(`[${i + 1}/${repos.length}] ${repo}: list FAIL: ${ls.stderr.split(/\r?\n/)[0]}`);
      totalFailed++;
      await sleep(SLEEP_MS);
      continue;
    }
    const repoSecrets = ls.stdout.split(/\r?\n/).filter(Boolean);
    const toDelete = repoSecrets.filter((k) => orgSecrets.has(k));

    if (toDelete.length === 0) {
      console.log(`[${i + 1}/${repos.length}] ${repo}: nothing to delete (${repoSecrets.length} repo secrets)`);
      await sleep(SLEEP_MS);
      continue;
    }

    console.log(`[${i + 1}/${repos.length}] ${repo}: deleting ${toDelete.length} duplicates`);
    for (const key of toDelete) {
      if (DRY) {
        console.log(`  [dry] delete ${repo}/${key}`);
        totalSkipped++;
        continue;
      }
      const del = gh(["secret", "delete", key, "--repo", `${ORG}/${repo}`], token);
      if (del.ok) totalDeleted++;
      else { totalFailed++; console.log(`  FAIL ${key}: ${del.stderr.split(/\r?\n/)[0]}`); }
      await sleep(SLEEP_MS);
    }
  }

  console.log("");
  console.log(`[cleanup] DONE: deleted=${totalDeleted} dry-skipped=${totalSkipped} failed=${totalFailed}`);
}

main().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
