#!/usr/bin/env bash
# commit-push-22-pkgs.sh — for each of the 22 packages on disk, commit any
# uncommitted polish/stub changes and push to GitHub.
# The 14 new packages have local git repos already (init+push earlier).
# The 8 existing are submodules of master and have their own repos already.
set -euo pipefail

ROOT="C:/D/oriz/projects/npm-packages"
NAMES=(
  astro-shell astro-chrome astro-config astro-data astro-forms astro-icons astro-tools astro-ai
  astro-distribute astro-pwa astro-content astro-billing astro-search
  astro-mdx astro-toc astro-comments astro-share astro-newsletter astro-affiliate astro-keyboard astro-feedback astro-test-utils
)

for name in "${NAMES[@]}"; do
  dir="$ROOT/${name}-npm-pkg"
  echo "=== ${name} ==="
  if [[ ! -d "$dir/.git" ]]; then
    echo "  no .git, skip (submodule managed by master?)"
    continue
  fi
  cd "$dir" || exit 1
  git config user.name "Chirag Singhal"
  git config user.email "chirag@oriz.in"
  # Ensure remote points at the -npm-pkg slug
  current_remote=$(git remote get-url origin 2>/dev/null || echo "")
  expected="https://github.com/chirag127/${name}-npm-pkg.git"
  if [[ "$current_remote" != "$expected" ]]; then
    git remote set-url origin "$expected" 2>/dev/null || git remote add origin "$expected"
  fi
  git add -A
  if git diff --cached --quiet; then
    echo "  nothing to commit"
  else
    git commit -q -m "feat: polish + v0.1.0 stub

- README with badges + standard sections
- SECURITY.md / CODE_OF_CONDUCT.md / CONTRIBUTING.md
- .github/CODEOWNERS / dependabot.yml / workflows/ci.yml
- src/index.ts is a v0.1.0 slug-reservation stub; real code in src.bak/
  pending the build pipeline.

Part of the chirag127/oriz 22-package set — see
knowledge/architecture/the-six-packages.md."
  fi
  if git push -u origin main -q 2>&1 | tail -3; then
    echo "  ✓ pushed"
  fi
done
