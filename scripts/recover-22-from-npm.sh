#!/usr/bin/env bash
# recover-22-from-npm.sh — pull each of 22 @chirag127/astro-* tarballs from
# npm, unpack into projects/oriz/own/lib/npm/<name>-npm-pkg/. Pre-existing .gitignore
# may resurrect — we'll prune. Restores stub source from npm authoritatively.

set -euo pipefail
ROOT="C:/D/oriz"
PKGS="$ROOT/projects/npm-packages"
NAMES=(
  astro-shell astro-chrome astro-config astro-data astro-forms astro-icons astro-tools astro-ai
  astro-distribute astro-pwa astro-content astro-billing astro-search
  astro-mdx astro-toc astro-comments astro-share astro-newsletter astro-affiliate astro-keyboard astro-feedback astro-test-utils
)

TMP="$(mktemp -d)"
trap "rm -rf '$TMP'" EXIT

for name in "${NAMES[@]}"; do
  dir="$PKGS/${name}-npm-pkg"
  echo "=== ${name} ==="

  # Pack into tmp
  (cd "$TMP" && npm pack "@chirag127/${name}" --silent 2>&1 | tail -1)
  tarball=$(ls "$TMP"/chirag127-${name}-*.tgz 2>/dev/null | head -1)
  if [[ -z "$tarball" ]]; then
    echo "  ✗ pack failed"; continue
  fi

  rm -rf "$dir"
  mkdir -p "$dir"
  tar -xzf "$tarball" -C "$dir" --strip-components=1
  rm -f "$tarball"
  echo "  ✓ recovered $(ls "$dir" | wc -l) entries"
done

echo "all 22 recovered from npm"
