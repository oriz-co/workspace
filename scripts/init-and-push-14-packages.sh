#!/usr/bin/env bash
# init-and-push-14-packages.sh — for each of the 14 new astro-* packages:
#   1. git init in the package dir
#   2. commit the scaffold
#   3. add chirag127/<name> as origin
#   4. push to main
# ponytail: sequential per-repo, parallel is risky with shared gh auth.

set -euo pipefail

ROOT="C:/D/oriz"
NAMES=(astro-distribute astro-pwa astro-content astro-billing astro-search astro-mdx astro-toc astro-comments astro-share astro-newsletter astro-affiliate astro-keyboard astro-feedback astro-test-utils)

for name in "${NAMES[@]}"; do
  dir="$ROOT/projects/npm-packages/${name}-npm-pkg"
  echo "=== $name ==="
  (
    cd "$dir" || exit 1

    # If already initialised as a submodule of master, skip the init+push
    # (the master already has it tracked, but it points nowhere). Force a
    # fresh init either way — the package dir was scaffold-only until now.
    rm -rf .git

    git init -q -b main
    git config user.name "Chirag Singhal"
    git config user.email "chirag@oriz.in"
    git add .
    git commit -q -m "feat: initial scaffold

Stub package — see README. v0.1.0 reserves the slug + exports __pkg
constant. Real implementation lands when a third app duplicates the
surface this package is designed to collapse.

Part of the chirag127/oriz family — see knowledge/architecture/the-six-packages.md."
    git remote add origin "https://github.com/chirag127/${name}.git"
    git push -u origin main -f -q 2>&1 | tail -5
  )
done

echo "all 14 packages initialised + pushed"
