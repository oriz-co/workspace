#!/usr/bin/env bash
# commit-all-submodules.sh — commit + push every modified submodule's changes
# from the recent fan-out (test scaffolding + per-app knowledge + minimal READMEs).
# ponytail: one loop, parallel push, idempotent on re-run.

set -euo pipefail
ROOT="C:/D/oriz"

APPS=(
  projects/oriz/own/prod/apps/hub/home-app
  projects/oriz/own/prod/apps/personal/oriz-cs-me-app
  projects/oriz/own/prod/apps/content/oriz-pages-blog-app
  projects/oriz/own/prod/apps/content/oriz-roam-journal-app
  projects/oriz/own/prod/apps/content/oriz-financial-cards-app
  projects/oriz/own/prod/apps/content/oriz-ncert-app
  projects/oriz/own/prod/apps/content/oriz-omni-post-app
  projects/oriz/own/prod/apps/content/oriz-lore-book-summaries-app
  projects/oriz/own/prod/apps/content/oriz-janaushdhi-app
  projects/oriz/own/prod/apps/tools/oriz-slice-pdf-tools-app
  projects/oriz/own/prod/apps/tools/oriz-paisa-finance-tools-app
  projects/oriz/own/prod/apps/tools/oriz-pixie-image-tools-app
  projects/oriz/own/prod/apps/tools/oriz-grid-qr-tools-app
  projects/oriz/own/prod/apps/tools/oriz-forge-dev-tools-app
  projects/oriz/own/prod/apps/tools/oriz-scribe-text-tools-app
  projects/oriz/own/prod/apps/tools/oriz-shift-convert-tools-app
  projects/oriz/own/prod/apps/tools/oriz-pivot-data-tools-app
  projects/oriz/own/prod/apps/tools/oriz-echo-audio-tools-app
  projects/oriz/own/prod/apps/tools/oriz-reel-video-tools-app
  projects/oriz/own/prod/apps/tools/oriz-rank-seo-tools-app
  projects/oriz/own/prod/apps/tools/oriz-cipher-crypto-tools-app
  projects/oriz/own/prod/apps/tools/oriz-vitals-health-tools-app
  projects/oriz/own/prod/apps/tools/oriz-dice-random-tools-app
  projects/oriz/own/prod/apps/tools/oriz-paper-print-tools-app
)

PKGS=(
  projects/oriz/own/lib/npm/astro-shell-npm-pkg
  projects/oriz/own/lib/npm/astro-chrome-npm-pkg
  projects/oriz/own/lib/npm/astro-tools-npm-pkg
  projects/oriz/own/lib/npm/astro-content-npm-pkg
  projects/oriz/own/lib/npm/astro-data-npm-pkg
  projects/oriz/own/lib/npm/astro-forms-npm-pkg
  projects/oriz/own/lib/npm/astro-billing-npm-pkg
  projects/oriz/own/lib/npm/astro-pwa-npm-pkg
  projects/oriz/own/lib/npm/astro-distribute-npm-pkg
  projects/oriz/own/lib/npm/astro-widgets-npm-pkg
  projects/oriz/own/lib/npm/astro-test-utils-npm-pkg
  projects/oriz/own/lib/npm/auth-core-npm-pkg
  projects/oriz/own/lib/npm/auth-wxt-npm-pkg
  projects/oriz/own/lib/npm/auth-vsc-npm-pkg
  projects/oriz/own/lib/npm/auth-cli-npm-pkg
)

commit_one() {
  local path="$1"
  local msg="$2"
  local dir="$ROOT/$path"
  if [[ ! -e "$dir/.git" ]]; then
    echo "  no .git, skip: $path"
    return
  fi
  cd "$dir" || return
  git config user.name "Chirag Singhal"
  git config user.email "chirag@oriz.in"
  git add -A
  if git diff --cached --quiet; then
    echo "  nothing: $path"
    return
  fi
  git commit -q -m "$msg"
  git push -u origin HEAD 2>&1 | tail -1
  echo "  ✓ pushed: $path"
}

APP_MSG="feat: per-app knowledge/ + minimal README + Vitest + Playwright test scaffold

- knowledge/index.md (OKF-light) + decisions/runbooks/services/ subdirs
- README trimmed to purpose + subdomain + feature inventory (no tech stack — that lives at master)
- vitest.config.ts + playwright.config.ts + tests/e2e/smoke.spec.ts + src/__tests__/smoke.test.ts
- package.json: test/test:watch/test:e2e/test:coverage scripts + vitest/happy-dom/@playwright/test/@chirag127/astro-test-utils devDeps

Family rules locked at https://github.com/chirag127/workspace/blob/main/AGENTS.md"

PKG_MSG="feat: Vitest scaffold

- vitest.config.ts with happy-dom + v8 coverage
- src/__tests__/smoke.test.ts asserting __pkg export
- package.json: test/test:watch/test:coverage scripts + vitest/@vitest/coverage-v8/happy-dom devDeps

Part of the 15-package family — see master knowledge/architecture/the-six-packages.md"

echo "=== APPS (24) ==="
for p in "${APPS[@]}"; do
  echo "--- $p"
  commit_one "$p" "$APP_MSG"
done

echo ""
echo "=== PACKAGES (15) ==="
for p in "${PKGS[@]}"; do
  echo "--- $p"
  commit_one "$p" "$PKG_MSG"
done

echo ""
echo "DONE."
