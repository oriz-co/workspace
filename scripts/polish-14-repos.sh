#!/usr/bin/env bash
set -euo pipefail
NAMES=(astro-shell astro-chrome astro-tools astro-content astro-data astro-forms astro-billing astro-pwa astro-distribute astro-widgets auth-core auth-wxt auth-vsc auth-cli)
declare -A TOPICS=(
  [astro-shell]="shell base-layer tailwindcss astro"
  [astro-chrome]="chrome header footer sidebar dark-theme astro"
  [astro-tools]="tools tool-grid tool-card astro"
  [astro-content]="content rss atom json-feed sitemap astro"
  [astro-data]="data firestore tanstack-query firebase astro"
  [astro-forms]="forms react-hook-form zod web3forms astro"
  [astro-billing]="billing razorpay paywall subscription astro"
  [astro-pwa]="pwa vite-pwa service-worker offline astro"
  [astro-distribute]="pwa apk msix tauri pwabuilder distribution astro"
  [astro-widgets]="widgets multisearch statusbanner consentbanner astro"
  [auth-core]="auth firebase oauth oriz"
  [auth-wxt]="auth wxt browser-extension chrome-identity firefox edge"
  [auth-vsc]="auth vscode-extension authentication"
  [auth-cli]="auth cli node device-flow"
)
for name in "${NAMES[@]}"; do
  dir="c:/D/oriz/projects/oriz/own/lib/npm/${name}-npm-pkg"
  [[ ! -f "$dir/package.json" ]] && { echo "skip $name"; continue; }
  desc=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$dir/package.json','utf8')).description)")
  echo "=== $name ==="
  gh repo edit "chirag127/${name}-npm-pkg" \
    --description "$desc" \
    --homepage "https://www.npmjs.com/package/@chirag127/${name}" \
    --enable-issues --enable-wiki=false --enable-projects=false --enable-discussions=true >/dev/null 2>&1 && echo "  meta ✓"
  topics_json=$(node -e "const c=['chirag127','oriz','npm-package'];const e='${TOPICS[$name]:-}'.split(' ').filter(Boolean);console.log(JSON.stringify({names:[...c,...e]}))")
  echo "$topics_json" | gh api -X PUT "repos/chirag127/${name}-npm-pkg/topics" --input - >/dev/null 2>&1 && echo "  topics ✓"
  gh api -X PUT "repos/chirag127/${name}-npm-pkg/vulnerability-alerts" >/dev/null 2>&1 && echo "  vuln ✓"
  gh api -X PUT "repos/chirag127/${name}-npm-pkg/automated-security-fixes" >/dev/null 2>&1 && echo "  autofix ✓"
done
