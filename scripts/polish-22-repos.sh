#!/usr/bin/env bash
# polish-22-repos.sh — make every chirag127/astro-*-npm-pkg repo top-notch.
# For each of the 22 packages:
#   1. Set GH repo description (from package.json) + homepage (npm URL) + topics
#   2. Enable issues + discussions, disable wiki + projects
#   3. Enable vulnerability alerts + automated security fixes
#   4. Enable secret scanning + push protection
# ponytail: idempotent — re-runs land the same state.

set -euo pipefail

ROOT="C:/D/oriz"
NAMES=(
  astro-shell astro-chrome astro-config astro-data astro-forms astro-icons astro-tools astro-ai
  astro-distribute astro-pwa astro-content astro-billing astro-search
  astro-mdx astro-toc astro-comments astro-share astro-newsletter astro-affiliate astro-keyboard astro-feedback astro-test-utils
)

declare -A TOPICS=(
  [astro-shell]="shell base-layer tailwindcss"
  [astro-chrome]="chrome header footer sidebar dark-theme"
  [astro-config]="config tsconfig biome tailwind"
  [astro-data]="data firestore tanstack-query"
  [astro-forms]="forms react-hook-form zod web3forms"
  [astro-icons]="icons lucide"
  [astro-tools]="tools tool-grid tool-card"
  [astro-ai]="ai puter-js workers-ai"
  [astro-distribute]="pwa apk msix tauri pwabuilder distribution"
  [astro-pwa]="pwa vite-pwa service-worker offline"
  [astro-content]="content rss atom json-feed sitemap indexnow"
  [astro-billing]="billing razorpay paywall subscription"
  [astro-search]="search pagefind multi-search"
  [astro-mdx]="mdx callout figure katex shiki"
  [astro-toc]="toc table-of-contents scroll-spy"
  [astro-comments]="comments giscus discussions"
  [astro-share]="share sharebar social"
  [astro-newsletter]="newsletter buttondown emailoctopus"
  [astro-affiliate]="affiliate disclosure utm"
  [astro-keyboard]="keyboard cmd-k shortcuts palette"
  [astro-feedback]="feedback thumbs survey"
  [astro-test-utils]="testing vitest playwright msw mocks"
)

for name in "${NAMES[@]}"; do
  dir="$ROOT/projects/npm-packages/${name}-npm-pkg"
  slug="${name}-npm-pkg"

  if [[ ! -f "$dir/package.json" ]]; then
    echo "skip ${name} — no package.json on disk"
    continue
  fi

  desc=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$dir/package.json','utf8')).description)")
  homepage="https://www.npmjs.com/package/@chirag127/${name}"

  echo "=== ${slug} ==="

  # 1. Description + homepage + feature toggles
  gh repo edit "chirag127/${slug}" \
    --description "${desc}" \
    --homepage "${homepage}" \
    --enable-issues \
    --enable-wiki=false \
    --enable-projects=false \
    --enable-discussions=true >/dev/null 2>&1 && echo "  ✓ metadata"

  # 2. Topics — build JSON array
  topics_json=$(node -e "
    const common = ['astro','chirag127','oriz','npm-package'];
    const extra = '${TOPICS[$name]:-}'.split(' ').filter(Boolean);
    console.log(JSON.stringify({names: [...common, ...extra]}))
  ")
  echo "$topics_json" | gh api -X PUT "repos/chirag127/${slug}/topics" --input - >/dev/null 2>&1 && echo "  ✓ topics"

  # 3. Vulnerability alerts + automated security fixes
  gh api -X PUT "repos/chirag127/${slug}/vulnerability-alerts" >/dev/null 2>&1 && echo "  ✓ vuln alerts"
  gh api -X PUT "repos/chirag127/${slug}/automated-security-fixes" >/dev/null 2>&1 && echo "  ✓ auto security fixes"

  # 4. Secret scanning + push protection
  gh api -X PATCH "repos/chirag127/${slug}" \
    -F 'security_and_analysis[secret_scanning][status]=enabled' \
    -F 'security_and_analysis[secret_scanning_push_protection][status]=enabled' \
    >/dev/null 2>&1 && echo "  ✓ secret scanning"
done

echo ""
echo "all 22 repos polished"
