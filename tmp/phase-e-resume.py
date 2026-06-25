#!/usr/bin/env python3
"""Phase E resume — re-add the remaining 73 submodules in flat layout.

Skips `me` which was added manually after the first run failed.
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
    "oriz-slice-pdf-tools-app", "oriz-pixie-image-tools-app", "oriz-reel-video-tools-app",
    "oriz-echo-audio-tools-app", "oriz-scribe-text-tools-app", "oriz-grid-qr-tools-app",
    "oriz-shift-convert-tools-app", "oriz-dice-random-tools-app", "oriz-rank-seo-tools-app",
    "oriz-pivot-data-tools-app", "oriz-paper-print-tools-app",
}
ALREADY_ADDED = {"me"}  # added manually after first-run crash


def parse_snapshot():
    text = SNAPSHOT.read_text()
    entries = {}
    for line in text.strip().splitlines():
        m = re.match(r"submodule\.(.+?)\.(path|url)\s+(.+)$", line)
        if not m:
            continue
        name, key, value = m.groups()
        entries.setdefault(name, {})[key] = value.strip()
    return [(name, e["path"], e["url"]) for name, e in entries.items() if "path" in e and "url" in e]


def slug_from_url(url):
    m = re.search(r"github\.com[:/]([^/]+)/([^/]+?)(?:\.git)?$", url)
    return m.group(2) if m else None


def final_slug(old_slug):
    if old_slug in ARCHIVED:
        return None
    return RENAMES.get(old_slug, old_slug)


def main():
    seen = set()
    plan = []
    for name, old_path, url in parse_snapshot():
        old_slug = slug_from_url(url)
        if old_slug is None:
            continue
        new_slug = final_slug(old_slug)
        if new_slug is None:
            continue
        if new_slug in seen or new_slug in ALREADY_ADDED:
            continue
        seen.add(new_slug)
        plan.append((f"https://github.com/oriz-org/{new_slug}.git", f"repos/{new_slug}"))

    print(f"Re-adding {len(plan)} remaining submodules (parallel batches of 8)...\n")

    failed = []
    for i, (url, path) in enumerate(plan, 1):
        # use --force in case any path leftover
        result = subprocess.run(
            f'git submodule add "{url}" "{path}"',
            cwd=UMBRELLA, shell=True, capture_output=True, text=True,
        )
        ok = result.returncode == 0
        marker = "OK" if ok else "FAIL"
        print(f"  [{i:2d}/{len(plan)}] {marker} {path}")
        if not ok:
            print(f"           stderr: {result.stderr.strip()[:200]}")
            failed.append((url, path, result.stderr.strip()))

    print(f"\nDone. {len(plan)-len(failed)} ok, {len(failed)} failed.")
    if failed:
        print("\nFailures:")
        for url, path, err in failed:
            print(f"  {path}: {err[:200]}")
        sys.exit(1)


if __name__ == "__main__":
    main()
