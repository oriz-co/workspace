#!/usr/bin/env bash
# commit-all-submodules.sh — commit + push every modified submodule's changes
# from the recent fan-out (test scaffolding + per-app knowledge + minimal READMEs).
# ponytail: one loop, parallel push, idempotent on re-run.

set -euo pipefail
ROOT="C:/D/oriz"

APPS=(
  projects/apps/hub/home-app
  projects/apps/personal/oriz-cs-me-app
  projects/apps/content/oriz-pages-blog-app
  projects/apps/content/oriz-roam-journal-app
  projects/apps/content/oriz-financial-cards-app
  projects/apps/content/oriz-ncert-app
  projects/apps/content/oriz-omni-post-app
  projects/apps/content/oriz-lore-book-summaries-app
  projects/apps/content/oriz-janaushdhi-app
  projects/apps/tools/oriz-slice-pdf-tools-app
  projects/apps/tools/oriz-paisa-finance-tools-app
  projects/apps/tools/oriz-pixie-image-tools-app
  projects/apps/tools/oriz-grid-qr-tools-app
  projects/apps/tools/oriz-forge-dev-tools-app
  projects/apps/tools/oriz-scribe-text-tools-app
  projects/apps/tools/oriz-shift-convert-tools-app
  projects/apps/tools/oriz-pivot-data-tools-app
  projects/apps/tools/oriz-echo-audio-tools-app
  projects/apps/tools/oriz-reel-video-tools-app
  projects/apps/tools/oriz-rank-seo-tools-app
  projects/apps/tools/oriz-cipher-crypto-tools-app
  projects/apps/tools/oriz-vitals-health-tools-app
  projects/apps/tools/oriz-dice-random-tools-app
  projects/apps/tools/oriz-paper-print-tools-app
)

PKGS=(
  projects/npm-packages/astro-shell-npm-pkg
  projects/npm-packages/astro-chrome-npm-pkg
  projects/npm-packages/astro-tools-npm-pkg
  projects/npm-packages/astro-content-npm-pkg
  projects/npm-packages/astro-data-npm-pkg
  projects/npm-packages/astro-forms-npm-pkg
  projects/npm-packages/astro-billing-npm-pkg
  projects/npm-packages/astro-pwa-npm-pkg
  projects/npm-packages/astro-distribute-npm-pkg
  projects/npm-packages/astro-widgets-npm-pkg
  projects/npm-packages/astro-test-utils-npm-pkg
  projects/npm-packages/auth-core-npm-pkg
  projects/npm-packages/auth-wxt-npm-pkg
  projects/npm-packages/auth-vsc-npm-pkg
  projects/npm-packages/auth-cli-npm-pkg
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
