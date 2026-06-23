#!/usr/bin/env node
/**
 * migrate-to-oriz-org.mjs
 *
 * One-shot script: transfers every chirag127/<slug> in the oriz family
 * (listed in .gitmodules) + `workspace` itself → oriz-org GH organization.
 *
 * Idempotent: if a transfer fails because the repo is already at oriz-org,
 * we log + skip. Safe to re-run after partial failure.
 *
 * Flags:
 *   --dry-run     Print the transfer plan and exit
 *   --yes         Skip the abort-if-over-N check (default cap = 100)
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([a-zA-Z]):/, "$1:"));
const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const YES = args.includes("--yes");
const SLEEP_MS = 1000;

const NEW_OWNER = "oriz-org";
const OLD_OWNER = "chirag127";
const MAX_TRANSFERS = 100;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function gh(argv, opts = {}) {
  const r = spawnSync("gh", argv, { encoding: "utf8", ...opts });
  return { ok: r.status === 0, stdout: r.stdout || "", stderr: r.stderr || "", status: r.status };
}

function readGitmodulesSlugs() {
  // Parse [submodule] blocks; capture path + url; skip projects/oriz/forks/* entries.
  const text = readFileSync(`${ROOT}/.gitmodules`, "utf8");
  const slugs = new Set();
  const blocks = text.split(/^\[submodule /m).slice(1);
  for (const block of blocks) {
    const pathMatch = block.match(/^\s*path\s*=\s*(.+)$/m);
    const urlMatch = block.match(/^\s*url\s*=\s*https:\/\/github\.com\/chirag127\/([^.\s]+)\.git\s*$/m);
    if (!pathMatch || !urlMatch) continue;
    const path = pathMatch[1].trim();
    if (path.startsWith("projects/oriz/forks/")) {
      console.log(`[migrate] skip fork: ${path} (${urlMatch[1]})`);
      continue;
    }
    slugs.add(urlMatch[1]);
  }
  return [...slugs].sort();
}

async function main() {
  console.log(`[migrate] root=${ROOT}`);
  console.log(`[migrate] target org=${NEW_OWNER}`);
  console.log(`[migrate] dry-run=${DRY}`);

  // Verify oriz-org exists
  const orgCheck = gh(["api", `orgs/${NEW_OWNER}`, "--jq", ".type"]);
  if (!orgCheck.ok) {
    console.error(`[migrate] FATAL: cannot reach ${NEW_OWNER}: ${orgCheck.stderr.trim()}`);
    process.exit(1);
  }
  if (orgCheck.stdout.trim() !== "Organization") {
    console.error(`[migrate] FATAL: ${NEW_OWNER} is not an Organization (got ${orgCheck.stdout.trim()})`);
    process.exit(1);
  }
  console.log(`[migrate] verified ${NEW_OWNER} = Organization`);

  const submoduleSlugs = readGitmodulesSlugs();
  const slugs = [...new Set(["workspace", ...submoduleSlugs])].sort();
  console.log(`[migrate] transfer plan: ${slugs.length} repos`);
  console.log(slugs.map((s) => `  - ${OLD_OWNER}/${s}`).join("\n"));

  if (slugs.length > MAX_TRANSFERS && !YES) {
    console.error(`[migrate] ABORT: ${slugs.length} > ${MAX_TRANSFERS} cap; rerun with --yes to confirm`);
    process.exit(1);
  }

  if (DRY) {
    console.log(`[migrate] DRY RUN complete`);
    return;
  }

  const ok = [];
  const skipped = [];
  const failed = [];

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    process.stdout.write(`[${i + 1}/${slugs.length}] ${OLD_OWNER}/${slug} → ${NEW_OWNER}/${slug}: `);

    // First check if it's already at oriz-org
    const check = gh(["api", `repos/${NEW_OWNER}/${slug}`, "--jq", ".full_name"]);
    if (check.ok && check.stdout.trim() === `${NEW_OWNER}/${slug}`) {
      console.log("ALREADY-AT-DEST");
      skipped.push({ slug, reason: "already at destination" });
      await sleep(SLEEP_MS);
      continue;
    }

    // Check source still at chirag127 + not archived
    const src = gh(["api", `repos/${OLD_OWNER}/${slug}`, "--jq", "{archived: .archived, fork: .fork}"]);
    if (!src.ok) {
      console.log(`SOURCE-MISSING: ${(src.stderr || src.stdout).split(/\r?\n/)[0]}`);
      skipped.push({ slug, reason: "source not found at chirag127" });
      await sleep(SLEEP_MS);
      continue;
    }
    try {
      const meta = JSON.parse(src.stdout);
      if (meta.archived) {
        console.log("ARCHIVED, skip");
        skipped.push({ slug, reason: "archived" });
        await sleep(SLEEP_MS);
        continue;
      }
    } catch {}

    // Transfer
    const r = gh(["api", "-X", "POST", `repos/${OLD_OWNER}/${slug}/transfer`, "-f", `new_owner=${NEW_OWNER}`]);
    if (r.ok) {
      console.log("OK");
      ok.push(slug);
    } else {
      const errLine = (r.stderr || r.stdout).split(/\r?\n/)[0];
      console.log(`FAIL: ${errLine}`);
      failed.push({ slug, err: errLine });
    }
    await sleep(SLEEP_MS);
  }

  console.log("");
  console.log(`[migrate] DONE: ${ok.length} transferred, ${skipped.length} skipped, ${failed.length} failed`);
  if (failed.length) {
    console.log(`[migrate] failures:`);
    for (const f of failed) console.log(`  ${f.slug}: ${f.err}`);
  }
}

main().catch((e) => {
  console.error("[migrate] FATAL:", e.message);
  process.exit(1);
});
