#!/usr/bin/env bash
# recover-and-scaffold-8.sh —
# 1. Recover 5 stubs from npm (chrome/shell/tools/content/billing)
# 2. Scaffold 3 new auth-* packages (auth-wxt, auth-vsc, auth-cli)
# 3. Per package: write polish files (SECURITY/CoC/etc.)
# 4. Init git + create GH repo + push
#
# Net: 8 packages alive (5 recovered, 3 fresh) under chirag127/<name>-npm-pkg.
# All ship LICENSE = strict source-available, no use granted.
# ponytail: one script, sequential per-package, idempotent on re-run.

set -euo pipefail
ROOT="C:/D/oriz"
PKGS="$ROOT/projects/npm-packages"

# Final 8 — Astro layered + 3 auth standalone
RECOVER=(astro-shell astro-chrome astro-tools astro-content astro-billing)
SCAFFOLD=(auth-wxt auth-vsc auth-cli)

declare -A DESC=(
  [astro-shell]="Astro 6 base layer — defineConfig wrapper + integrations preset + Tailwind v4 + Base layout + reusable Cloudflare Pages deploy workflow. Foundation of the @chirag127/astro-* set."
  [astro-chrome]="Shared visual chrome for chirag127 family Astro sites — Header / Sidebar / BottomBar / Footer / Stamp / SEO / Auth UI / Analytics / Consent + 24 legal pages + Datasheet Dark tokens + self-hosted fonts. Peer-deps on @chirag127/astro-shell."
  [astro-tools]="ToolGrid + ToolCard + ToolPage components for utility/tool sites. Peer-deps on @chirag127/astro-chrome."
  [astro-content]="Zod content-collection schemas + RSS + Atom + JSON-Feed generators + sitemap glue + IndexNow ping + OG-card emit. Peer-deps on @chirag127/astro-chrome."
  [astro-billing]="Razorpay checkout + license-key verify + <Paywall> + <PriceTag> for one-subscription-unlocks-all flow. Standalone (no peer-dep on shell/chrome)."
  [auth-wxt]="Cross-browser-extension auth wrapper around chrome.identity.launchWebAuthFlow + Firebase ID-token persistence in chrome.storage.local. Works on Chrome / Firefox / Edge via @wxt-dev/browser."
  [auth-vsc]="VS Code extension auth wrapper around vscode.authentication API + Firebase ID-token mint via REST + secure storage via context.secrets."
  [auth-cli]="Node CLI auth wrapper — Firebase OAuth device-code flow + token store at ~/.config/oriz/auth.json + refresh on 401."
)

declare -A PEER=(
  [astro-shell]=""
  [astro-chrome]="@chirag127/astro-shell"
  [astro-tools]="@chirag127/astro-chrome"
  [astro-content]="@chirag127/astro-chrome"
  [astro-billing]=""
  [auth-wxt]=""
  [auth-vsc]=""
  [auth-cli]=""
)

LICENSE_TEXT='Copyright (c) 2026 Chirag Singhal
All rights reserved.

The source in this repository is published for transparency only. NO
LICENSE IS GRANTED to use, copy, modify, merge, publish, distribute,
sublicense, sell, or create derivative works, in whole or in part, in
any form. Public visibility does not imply permission. Reading and
learning from the patterns is permitted; using the code is not.

For licensing inquiries, contact the author at chirag@oriz.in.'

TMP="$(mktemp -d)"
trap "rm -rf '$TMP'" EXIT

write_polish() {
  local name="$1"
  local dir="$2"
  local desc="${DESC[$name]}"

  # SECURITY.md
  cat > "$dir/SECURITY.md" <<EOF
# Security Policy

Report security issues to **chirag@oriz.in** with subject \`[security] @chirag127/${name}\`.
Do NOT open public GitHub issues for vulnerabilities. Response within 7 days.

Supported versions: latest published \`0.1.x\`.
EOF

  # CODE_OF_CONDUCT.md
  cat > "$dir/CODE_OF_CONDUCT.md" <<'EOF'
# Code of Conduct

This project follows the [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code-of-conduct/).

Report violations to **chirag@oriz.in**.
EOF

  # CONTRIBUTING.md
  cat > "$dir/CONTRIBUTING.md" <<'EOF'
# Contributing

Source-available, all rights reserved — see [`LICENSE`](./LICENSE).

External contributions are NOT accepted. The source is published for
transparency and learning only; no license to use, fork, or modify is
granted. Bug reports via [Issues](../../issues) are welcome.
EOF

  # CODEOWNERS
  mkdir -p "$dir/.github"
  echo "* @chirag127" > "$dir/.github/CODEOWNERS"

  # dependabot.yml
  cat > "$dir/.github/dependabot.yml" <<'EOF'
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule: { interval: weekly }
    open-pull-requests-limit: 10
    commit-message: { prefix: deps }
  - package-ecosystem: github-actions
    directory: /
    schedule: { interval: weekly }
    commit-message: { prefix: ci }
EOF

  # CI workflow
  mkdir -p "$dir/.github/workflows"
  cat > "$dir/.github/workflows/ci.yml" <<'EOF'
name: CI
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile=false
      - run: pnpm typecheck || npx tsc -p tsconfig.json --noEmit
EOF

  # README
  cat > "$dir/README.md" <<EOF
# @chirag127/${name}

[![npm version](https://img.shields.io/npm/v/@chirag127/${name}.svg)](https://www.npmjs.com/package/@chirag127/${name})
[![CI](https://github.com/chirag127/${name}-npm-pkg/actions/workflows/ci.yml/badge.svg)](https://github.com/chirag127/${name}-npm-pkg/actions/workflows/ci.yml)
[![License: source-available](https://img.shields.io/badge/license-source--available-red.svg)](./LICENSE)

${desc}

> **License notice.** This package is source-available **only for transparency**. No license is granted to use, fork, modify, or redistribute. See [\`LICENSE\`](./LICENSE).

Part of the [\`chirag127/oriz\`](https://github.com/chirag127/oriz) family.

## Status

\`v0.1.0\` — stub. Real implementation lands when a third consumer duplicates the surface this package collapses.

## Cross-refs

- [Architecture: the 8-package set](https://github.com/chirag127/oriz/blob/main/knowledge/architecture/the-six-packages.md)
- [Issues](https://github.com/chirag127/${name}-npm-pkg/issues)
- [Security policy](./SECURITY.md)
- [License](./LICENSE)
EOF
}

write_pkg_json() {
  local name="$1"
  local dir="$2"
  local desc="${DESC[$name]}"
  local peer="${PEER[$name]}"

  local peer_block=""
  if [[ -n "$peer" ]]; then
    peer_block=",\"peerDependencies\":{\"${peer}\":\"^0.1.0\"}"
  fi

  cat > "$dir/package.json" <<EOF
{
  "name": "@chirag127/${name}",
  "version": "0.1.0",
  "description": "${desc//\"/\\\"}",
  "type": "module",
  "license": "SEE LICENSE IN LICENSE",
  "author": "Chirag Singhal <chirag@oriz.in>",
  "homepage": "https://github.com/chirag127/${name}-npm-pkg#readme",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/chirag127/${name}-npm-pkg.git"
  },
  "bugs": { "url": "https://github.com/chirag127/${name}-npm-pkg/issues" },
  "keywords": ["chirag127", "oriz"],
  "files": ["src", "LICENSE", "README.md"],
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "publishConfig": { "access": "public" }${peer_block}
}
EOF
}

write_tsconfig() {
  cat > "$1/tsconfig.json" <<'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "declaration": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOF
}

write_license() {
  echo "$LICENSE_TEXT" > "$1/LICENSE"
}

write_stub_src() {
  local name="$1"
  local dir="$2"
  mkdir -p "$dir/src"
  cat > "$dir/src/index.ts" <<EOF
// @chirag127/${name}
// v0.1.0 stub. See README for status.
export const __pkg = '@chirag127/${name}' as const
EOF
}

# === 1. RECOVER 5 from npm ===
for name in "${RECOVER[@]}"; do
  dir="$PKGS/${name}-npm-pkg"
  echo "=== RECOVER ${name} ==="

  rm -rf "$dir"
  mkdir -p "$dir"

  # Pull tarball
  (cd "$TMP" && npm pack "@chirag127/${name}" --silent 2>&1 | tail -1)
  tarball=$(ls "$TMP"/chirag127-${name}-*.tgz 2>/dev/null | head -1)
  if [[ -n "$tarball" ]]; then
    tar -xzf "$tarball" -C "$dir" --strip-components=1
    rm -f "$tarball"
    echo "  ✓ pulled from npm"
  else
    echo "  ! npm pack failed; writing fresh stub"
    write_stub_src "$name" "$dir"
  fi

  # Overlay polish + correct package.json (npm tarball had stub package.json without peer)
  write_pkg_json "$name" "$dir"
  write_tsconfig "$dir"
  write_license "$dir"
  write_polish "$name" "$dir"
done

# === 2. SCAFFOLD 3 fresh ===
for name in "${SCAFFOLD[@]}"; do
  dir="$PKGS/${name}-npm-pkg"
  echo "=== SCAFFOLD ${name} ==="
  rm -rf "$dir"
  mkdir -p "$dir/src"
  write_stub_src "$name" "$dir"
  write_pkg_json "$name" "$dir"
  write_tsconfig "$dir"
  write_license "$dir"
  write_polish "$name" "$dir"
done

# === 3. Init git + push + create GH repo ===
ALL=("${RECOVER[@]}" "${SCAFFOLD[@]}")

# Load NPM_TOKEN
NPM_TOKEN=$(grep -E '^NPM_TOKEN=' "$ROOT/.env" | head -1 | sed 's/^NPM_TOKEN=//')

for name in "${ALL[@]}"; do
  dir="$PKGS/${name}-npm-pkg"
  echo "=== PUSH ${name} ==="
  cd "$dir" || exit 1

  rm -rf .git
  git init -q -b main
  git config user.name "Chirag Singhal"
  git config user.email "chirag@oriz.in"
  git add -A
  git commit -q -m "feat: v0.1.0 — initial scaffold

${DESC[$name]}

Part of the chirag127/oriz 8-package set. Source-available, no use granted."

  # Create GH repo (idempotent — ignore if exists)
  gh repo create "chirag127/${name}-npm-pkg" --public \
    --description "${DESC[$name]}" \
    --homepage "https://www.npmjs.com/package/@chirag127/${name}" 2>&1 | tail -1 || true

  git remote add origin "https://github.com/chirag127/${name}-npm-pkg.git" 2>/dev/null \
    || git remote set-url origin "https://github.com/chirag127/${name}-npm-pkg.git"

  git push -u origin main -f -q 2>&1 | tail -1
  echo "  ✓ pushed"
done

echo ""
echo "All 8 packages alive on disk + GitHub."
echo "RECOVERED: ${RECOVER[*]}"
echo "SCAFFOLDED: ${SCAFFOLD[*]}"
