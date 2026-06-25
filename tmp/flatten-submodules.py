#!/usr/bin/env python3
"""Phase E — flatten umbrella submodules to repos/<slug>/ layout.

Reads /tmp/submodules-snapshot.txt (output of `git config --file .gitmodules --get-regexp ...`)
Builds the desired final flat-layout submodule set.
Prints the plan; if --apply is passed, executes it.

Renames from Phase D (old slug -> new slug):
  oriz-app                            -> home
  oriz-paisa-finance-tools-app        -> finance
  oriz-financial-cards-app            -> cards
  oriz-pages-blog-app                 -> blog
  oriz-roam-journal-app               -> journal
  oriz-vitals-health-tools-app        -> health
  oriz-auth-app                       -> auth
  oriz-status-app                     -> status
  cs-me-app                           -> me
  oriz-packages-catalog-app           -> packages

Archived in Phase B (drop from re-add):
  oriz-slice-pdf-tools-app, oriz-pixie-image-tools-app, oriz-reel-video-tools-app,
  oriz-echo-audio-tools-app, oriz-scribe-text-tools-app, oriz-grid-qr-tools-app,
  oriz-shift-convert-tools-app, oriz-dice-random-tools-app, oriz-rank-seo-tools-app,
  oriz-pivot-data-tools-app, oriz-paper-print-tools-app
"""
import re
import subprocess
import sys
from pathlib import Path

UMBRELLA = Path("c:/D/oriz")
SNAPSHOT = Path("c:/D/oriz/tmp/submodules-snapshot.txt")

RENAMES = {
    "oriz-app": "home",
    "oriz-paisa-finance-tools-app": "finance",
    "oriz-financial-cards-app": "cards",
    "oriz-pages-blog-app": "blog",
    "oriz-roam-journal-app": "journal",
    "oriz-vitals-health-tools-app": "health",
    "oriz-auth-app": "auth",
    "oriz-status-app": "status",
    "cs-me-app": "me",
    "oriz-packages-catalog-app": "packages",
}

ARCHIVED = {
    "oriz-slice-pdf-tools-app",
    "oriz-pixie-image-tools-app",
    "oriz-reel-video-tools-app",
    "oriz-echo-audio-tools-app",
    "oriz-scribe-text-tools-app",
    "oriz-grid-qr-tools-app",
    "oriz-shift-convert-tools-app",
    "oriz-dice-random-tools-app",
    "oriz-rank-seo-tools-app",
    "oriz-pivot-data-tools-app",
    "oriz-paper-print-tools-app",
}


def parse_snapshot():
    """Return list of (name, path, url) tuples from snapshot."""
    text = SNAPSHOT.read_text()
    entries = {}
    for line in text.strip().splitlines():
        # `submodule.<name>.<key> <value>`
        m = re.match(r"submodule\.(.+?)\.(path|url)\s+(.+)$", line)
        if not m:
            continue
        name, key, value = m.groups()
        entries.setdefault(name, {})[key] = value.strip()
    return [(name, e["path"], e["url"]) for name, e in entries.items() if "path" in e and "url" in e]


def slug_from_url(url):
    """https://github.com/oriz-org/oriz-pages-blog-app.git -> oriz-pages-blog-app"""
    m = re.search(r"github\.com[:/]([^/]+)/([^/]+?)(?:\.git)?$", url)
    if not m:
        return None
    return m.group(2)


def final_slug(old_slug):
    """Apply Phase D rename map; return None if archived."""
    if old_slug in ARCHIVED:
        return None
    return RENAMES.get(old_slug, old_slug)


def build_plan():
    plan = []
    seen_paths = set()
    seen_urls = set()
    archived = []
    duplicates = []
    for name, old_path, url in parse_snapshot():
        old_slug = slug_from_url(url)
        if old_slug is None:
            print(f"[skip] unparseable url: {url}", file=sys.stderr)
            continue
        new_slug = final_slug(old_slug)
        if new_slug is None:
            archived.append((name, old_path, url))
            continue
        new_url = f"https://github.com/oriz-org/{new_slug}.git"
        new_path = f"repos/{new_slug}"
        if new_path in seen_paths or new_url in seen_urls:
            duplicates.append((name, new_path, new_url))
            continue
        seen_paths.add(new_path)
        seen_urls.add(new_url)
        plan.append((name, old_path, new_path, new_url))
    return plan, archived, duplicates


def run(cmd, check=True, capture=False):
    print(f"  $ {cmd}")
    result = subprocess.run(
        cmd, cwd=UMBRELLA, shell=True, capture_output=capture, text=True
    )
    if check and result.returncode != 0:
        if capture:
            print(result.stdout)
            print(result.stderr, file=sys.stderr)
        sys.exit(f"FAIL: {cmd}")
    return result


def main():
    apply = "--apply" in sys.argv
    plan, archived, duplicates = build_plan()
    print(f"=== PLAN: keep {len(plan)} submodules, drop {len(archived)} archived, {len(duplicates)} duplicates skipped ===\n")
    print("--- Keep (flat layout) ---")
    for name, old_path, new_path, new_url in plan:
        print(f"  {old_path}  ->  {new_path}  ({new_url})")
    print("\n--- Drop (archived, not re-added) ---")
    for name, old_path, url in archived:
        print(f"  {old_path}  [{url}]")
    if duplicates:
        print("\n--- Duplicates skipped ---")
        for name, new_path, new_url in duplicates:
            print(f"  {new_path}  ({new_url})")

    if not apply:
        print("\n(dry run; pass --apply to execute)")
        return

    print("\n=== APPLYING ===")
    # 1. Deinit all
    print("\n--- git submodule deinit -f --all ---")
    run("git submodule deinit -f --all")

    # 2. git rm each path (silently OK if some have already-gone .git)
    print("\n--- git rm each submodule path ---")
    for name, old_path, _, _ in plan:
        run(f'git rm -f "{old_path}" || true', check=False)
    for name, old_path, _ in archived:
        run(f'git rm -f "{old_path}" || true', check=False)

    # 3. Delete .gitmodules and the .git/modules cache
    print("\n--- delete .gitmodules + .git/modules cache ---")
    run('git rm -f .gitmodules || true', check=False)
    run('rm -rf .git/modules')

    # 4. Clean up now-empty parent dirs under repos/
    print("\n--- prune empty repos/ subdirs ---")
    run('find repos -type d -empty -delete 2>/dev/null || true', check=False)

    # 5. Re-add each at flat path
    print("\n--- re-adding submodules at flat paths ---")
    for name, _, new_path, new_url in plan:
        run(f'git submodule add "{new_url}" "{new_path}"')

    print("\n=== DONE — review with `git status` and commit ===")


if __name__ == "__main__":
    main()
