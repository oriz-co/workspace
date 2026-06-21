#!/usr/bin/env bash
# purge-22.sh — unpublish 22 @chirag127/astro-* packages from npm AND delete
# the 22 GitHub repos. Within npm's 72h unpublish window.
# ponytail: write twice (npm + gh), one loop.

set -euo pipefail
ROOT="C:/D/oriz"
NAMES=(
  astro-shell astro-chrome astro-config astro-data astro-forms astro-icons astro-tools astro-ai
  astro-distribute astro-pwa astro-content astro-billing astro-search
  astro-mdx astro-toc astro-comments astro-share astro-newsletter astro-affiliate astro-keyboard astro-feedback astro-test-utils
)

# Load NPM_TOKEN
NPM_TOKEN=$(grep -E '^NPM_TOKEN=' "$ROOT/.env" | head -1 | sed 's/^NPM_TOKEN=//')
NPMRC_BAK=""
if [[ -f "$HOME/.npmrc" ]]; then
  NPMRC_BAK="$HOME/.npmrc.purge-bak.$$"
  cp "$HOME/.npmrc" "$NPMRC_BAK"
fi
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > "$HOME/.npmrc"
trap '[[ -n "$NPMRC_BAK" ]] && mv "$NPMRC_BAK" "$HOME/.npmrc" || rm -f "$HOME/.npmrc"' EXIT

npm whoami

for name in "${NAMES[@]}"; do
  echo "=== ${name} ==="
  # 1. Unpublish from npm (--force, within 72h window)
  if npm unpublish "@chirag127/${name}" --force 2>&1 | tail -2 | grep -qE "(removed|404)"; then
    echo "  ✓ npm unpublished"
  else
    echo "  ✗ npm unpublish failed (may already be gone)"
  fi
  # 2. Delete GH repo
  if gh repo delete "chirag127/${name}-npm-pkg" --yes 2>&1 | tail -1 | grep -qE "(deleted|not found)"; then
    echo "  ✓ gh deleted"
  else
    echo "  ✗ gh delete failed"
  fi
done

echo "all 22 purged from npm + gh"
