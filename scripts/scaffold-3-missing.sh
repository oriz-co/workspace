#!/usr/bin/env bash
# scaffold-3-missing.sh — astro-pwa, astro-distribute, astro-widgets:
# 1. Write scaffold (package.json, src/index.ts, LICENSE, README, polish)
# 2. git init + create GH repo + push
# 3. npm publish
set -euo pipefail
ROOT="C:/D/oriz"

declare -A DESC=(
  [astro-pwa]="Locked @vite-pwa/astro defaults for the chirag127 family — manifest from astro-chrome brand, offline shell, <InstallPrompt>, <UpdateToast>."
  [astro-distribute]="Thin CLI wrapping PWABuilder (primary — AAB / MSIX / iOS-project) and optional Tauri for desktop EXE/dmg/AppImage from one Astro build."
  [astro-widgets]="Shared cross-app islands — <MultiSearch> popover, <StatusBanner>, <ConsentBanner> (Klaro). Datasheet Dark tokens via @chirag127/astro-chrome."
)

LICENSE_TEXT='Copyright (c) 2026 Chirag Singhal
All rights reserved.

The source in this repository is published for transparency only. NO
LICENSE IS GRANTED to use, copy, modify, merge, publish, distribute,
sublicense, sell, or create derivative works, in whole or in part, in
any form. Public visibility does not imply permission. Reading and
learning from the patterns is permitted; using the code is not.

For licensing inquiries, contact the author at chirag@oriz.in.'

for name in astro-pwa astro-distribute astro-widgets; do
  dir="$ROOT/projects/npm-packages/${name}-npm-pkg"
  desc="${DESC[$name]}"
  echo "=== ${name} ==="

  rm -rf "$dir" 2>/dev/null
  mkdir -p "$dir/src" "$dir/.github/workflows"

  cat > "$dir/src/index.ts" <<EOF
// @chirag127/${name}
// v0.1.0 stub. See README for status.
export const __pkg = '@chirag127/${name}' as const
EOF

  cat > "$dir/package.json" <<EOF
{
  "name": "@chirag127/${name}",
  "version": "0.1.0",
  "description": "${desc}",
  "type": "module",
  "license": "SEE LICENSE IN LICENSE",
  "author": "Chirag Singhal <chirag@oriz.in>",
  "homepage": "https://github.com/chirag127/${name}-npm-pkg#readme",
  "repository": { "type": "git", "url": "git+https://github.com/chirag127/${name}-npm-pkg.git" },
  "bugs": { "url": "https://github.com/chirag127/${name}-npm-pkg/issues" },
  "keywords": ["chirag127", "oriz"],
  "files": ["src", "LICENSE", "README.md"],
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "publishConfig": { "access": "public" }
}
EOF

  cat > "$dir/tsconfig.json" <<'EOF'
{
  "compilerOptions": {
    "target": "ES2022", "module": "ESNext", "moduleResolution": "Bundler", "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"], "declaration": true, "strict": true,
    "noUncheckedIndexedAccess": true, "esModuleInterop": true, "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true, "resolveJsonModule": true, "isolatedModules": true
  },
  "include": ["src/**/*"], "exclude": ["node_modules"]
}
EOF

  echo "$LICENSE_TEXT" > "$dir/LICENSE"

  cat > "$dir/README.md" <<EOF
# @chirag127/${name}

[![npm](https://img.shields.io/npm/v/@chirag127/${name}.svg)](https://www.npmjs.com/package/@chirag127/${name})
[![license: source-available](https://img.shields.io/badge/license-source--available-red.svg)](./LICENSE)

${desc}

> **License notice.** Source-available **only for transparency**. No license granted. See [\`LICENSE\`](./LICENSE).

Part of the [\`chirag127/oriz\`](https://github.com/chirag127/oriz) family.

## Status

\`v0.1.0\` — slug reservation + stub.
EOF

  cat > "$dir/SECURITY.md" <<EOF
# Security Policy

Report security issues to **chirag@oriz.in** with subject \`[security] @chirag127/${name}\`.
EOF
  cat > "$dir/CODE_OF_CONDUCT.md" <<'EOF'
# Code of Conduct
[Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code-of-conduct/).
EOF
  cat > "$dir/CONTRIBUTING.md" <<'EOF'
# Contributing
Source-available, all rights reserved. No external contributions.
EOF
  echo "* @chirag127" > "$dir/.github/CODEOWNERS"
  cat > "$dir/.github/dependabot.yml" <<'EOF'
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule: { interval: weekly }
EOF
  cat > "$dir/.github/workflows/ci.yml" <<'EOF'
name: CI
on:
  push: { branches: [main] }
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npx tsc -p tsconfig.json --noEmit
EOF
  cat > "$dir/.github/workflows/release.yml" <<'EOF'
name: Release
on:
  push: { tags: ['v*.*.*'] }
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, registry-url: 'https://registry.npmjs.org' }
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
EOF

  cd "$dir"
  git init -q -b main
  git config user.name "Chirag Singhal"
  git config user.email "chirag@oriz.in"
  git add -A
  git commit -q -m "feat: v0.1.0 scaffold"

  gh repo create "chirag127/${name}-npm-pkg" --public \
    --description "$desc" \
    --homepage "https://www.npmjs.com/package/@chirag127/${name}" >/dev/null 2>&1 || true
  git remote add origin "https://github.com/chirag127/${name}-npm-pkg.git" 2>/dev/null \
    || git remote set-url origin "https://github.com/chirag127/${name}-npm-pkg.git"
  git push -u origin main -f -q 2>&1 | tail -1 && echo "  ✓ pushed"

  npm publish --access public 2>&1 | tail -1 | grep -q "@chirag127/${name}" && echo "  ✓ npm published"
done
echo "DONE"
