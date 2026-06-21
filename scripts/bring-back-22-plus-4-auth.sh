#!/usr/bin/env bash
# bring-back-22-plus-4-auth.sh — recover all 22 from npm + scaffold 4 new auth-* packages.
# Re-init git in each, create matching chirag127/<name>-npm-pkg GH repo, push.
# Idempotent on re-run.
# ponytail: large but mechanical. One loop per phase.

set -euo pipefail
ROOT="C:/D/oriz"
PKGS="$ROOT/projects/npm-packages"

# 22 published on npm — recover via npm pack (astro-shell is 404, fresh scaffold)
RECOVER=(
  astro-shell astro-chrome astro-config astro-data astro-forms astro-icons astro-tools astro-ai
  astro-distribute astro-pwa astro-content astro-billing astro-search
  astro-mdx astro-toc astro-comments astro-share astro-newsletter astro-affiliate astro-keyboard astro-feedback astro-test-utils
)

# 4 new auth packages
SCAFFOLD=(auth-core auth-wxt auth-vsc auth-cli)

declare -A DESC=(
  [astro-shell]="Astro 6 base layer — defineConfig wrapper + integrations preset + Tailwind v4 + Base layout + reusable Cloudflare Pages deploy workflow."
  [astro-chrome]="Shared visual chrome for chirag127 Astro sites — Header / Sidebar / BottomBar / Footer / Stamp / SEO / Auth UI / Analytics / Consent + 24 legal pages + Datasheet Dark tokens + self-hosted fonts. Peer-deps on @chirag127/astro-shell."
  [astro-config]="Shared dev/CI config — tsconfig.json extend-from, biome.json, Tailwind v4 preset, reusable GH Actions workflow templates. Zero runtime deps."
  [astro-data]="Data-fetching primitives — TanStack Query setup, typed Firestore helpers, LocalStorage hooks."
  [astro-forms]="Form helpers — react-hook-form + Zod resolvers + shadcn-style Form wrappers + honeypot + Web3Forms client."
  [astro-icons]="Lucide icon subset re-export + Icon wrapper + size presets."
  [astro-tools]="ToolGrid + ToolCard + ToolPage components for utility/tool sites. Peer-deps on @chirag127/astro-chrome."
  [astro-ai]="Puter.js wrappers + token counting + streaming + auth flow."
  [astro-distribute]="Thin CLI wrapping PWABuilder (primary) + Tauri (optional) for PWA → AAB/MSIX/EXE from one Astro build."
  [astro-pwa]="Thin @vite-pwa/astro wrapper with locked defaults — manifest from astro-chrome brand, offline shell, <InstallPrompt>, <UpdateToast>."
  [astro-content]="Zod content-collection schemas + RSS + Atom + JSON-Feed + sitemap + IndexNow + OG-card. Peer-deps on @chirag127/astro-chrome."
  [astro-billing]="Razorpay checkout + license-key verify + <Paywall> + <PriceTag> for one-subscription-unlocks-all."
  [astro-search]="<MultiSearch> popover + <SiteSearch> (Pagefind local index)."
  [astro-mdx]="Shared MDX components — <Callout>, <Aside>, <Figure>, <ImageCompare>, <KaTeX>, <CodeBlock> (Shiki + copy + line-highlight)."
  [astro-toc]="Auto table-of-contents from <h2>/<h3> + sticky sidebar + scroll-spy + jump-to."
  [astro-comments]="Giscus wrapper — dark theme, lazy-load, reply-count fetch."
  [astro-share]="<ShareBar> — X / LinkedIn / copy-link / QR / native-share fallback."
  [astro-newsletter]="<NewsletterForm> — Buttondown primary, EmailOctopus fallback, honeypot, double-opt-in."
  [astro-affiliate]="Disclosure banner + <AffiliateLink> (UTM tracking + rel=nofollow sponsored + click ping)."
  [astro-keyboard]="Global Cmd-K palette + ? shortcuts overlay + / focus-search."
  [astro-feedback]="Was-this-helpful thumbs + optional textarea, ships to Web3Forms / Firestore."
  [astro-test-utils]="Vitest mocks (Firestore, Razorpay, Web3Forms) + Playwright fixtures + MSW handlers."
  [auth-core]="Cross-surface auth primitives — auth.oriz.in URL helpers, Firebase ID-token verify, refresh logic. Runtime-agnostic. Peer-dep of auth-wxt / auth-vsc / auth-cli."
  [auth-wxt]="Browser-extension auth — chrome.identity.launchWebAuthFlow bouncing through auth.oriz.in, ID-token in chrome.storage.local. Chrome / Firefox / Edge via @wxt-dev/browser. Peer-deps on @chirag127/auth-core."
  [auth-vsc]="VS Code extension auth — vscode.authentication API + Firebase ID-token mint via REST + secure-storage via context.secrets. Peer-deps on @chirag127/auth-core."
  [auth-cli]="CLI auth — Firebase OAuth device-code flow + token store at ~/.config/oriz/auth.json + refresh on 401. Peer-deps on @chirag127/auth-core."
)

declare -A PEER=(
  [astro-shell]=""
  [astro-chrome]="@chirag127/astro-shell"
  [astro-tools]="@chirag127/astro-chrome"
  [astro-content]="@chirag127/astro-chrome"
  [auth-wxt]="@chirag127/auth-core"
  [auth-vsc]="@chirag127/auth-core"
  [auth-cli]="@chirag127/auth-core"
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
  cat > "$dir/SECURITY.md" <<EOF
# Security Policy

Report security issues to **chirag@oriz.in** with subject \`[security] @chirag127/${name}\`.
Do NOT open public GitHub issues for vulnerabilities. Response within 7 days.

Supported versions: latest published \`0.1.x\`.
EOF
  cat > "$dir/CODE_OF_CONDUCT.md" <<'EOF'
# Code of Conduct

This project follows the [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code-of-conduct/).

Report violations to **chirag@oriz.in**.
EOF
  cat > "$dir/CONTRIBUTING.md" <<'EOF'
# Contributing

Source-available, all rights reserved — see [`LICENSE`](./LICENSE).

External contributions are NOT accepted. The source is published for
transparency and learning only; no license to use, fork, or modify is
granted. Bug reports via [Issues](../../issues) are welcome.
EOF
  mkdir -p "$dir/.github/workflows"
  echo "* @chirag127" > "$dir/.github/CODEOWNERS"
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
      - run: pnpm test --if-present
EOF
  cat > "$dir/.github/workflows/release.yml" <<'EOF'
name: Release
on:
  push:
    tags: ['v*.*.*']
jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm, registry-url: 'https://registry.npmjs.org' }
      - run: pnpm install --frozen-lockfile=false
      - run: npm publish --access public --provenance
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
EOF
}

write_readme() {
  local name="$1"
  local dir="$2"
  local desc="${DESC[$name]}"
  cat > "$dir/README.md" <<EOF
# @chirag127/${name}

[![npm](https://img.shields.io/npm/v/@chirag127/${name}.svg)](https://www.npmjs.com/package/@chirag127/${name})
[![CI](https://github.com/chirag127/${name}-npm-pkg/actions/workflows/ci.yml/badge.svg)](https://github.com/chirag127/${name}-npm-pkg/actions/workflows/ci.yml)
[![license: source-available](https://img.shields.io/badge/license-source--available-red.svg)](./LICENSE)

${desc}

> **License notice.** Source-available **only for transparency**. No license is granted to use, fork, modify, or redistribute. See [\`LICENSE\`](./LICENSE).

Part of the [\`chirag127/oriz\`](https://github.com/chirag127/oriz) family.

## Status

\`v0.1.x\` — slug reservation + stub.

## Cross-refs

- [the family package set](https://github.com/chirag127/oriz/blob/main/knowledge/architecture/the-six-packages.md)
- [security policy](./SECURITY.md) · [code of conduct](./CODE_OF_CONDUCT.md) · [contributing](./CONTRIBUTING.md)
EOF
}

write_pkg_json() {
  local name="$1"
  local dir="$2"
  local desc="${DESC[$name]}"
  local peer="${PEER[$name]:-}"
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
  "repository": { "type": "git", "url": "git+https://github.com/chirag127/${name}-npm-pkg.git" },
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
    "target": "ES2022", "module": "ESNext", "moduleResolution": "Bundler", "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"], "declaration": true, "strict": true,
    "noUncheckedIndexedAccess": true, "esModuleInterop": true, "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true, "resolveJsonModule": true, "isolatedModules": true
  },
  "include": ["src/**/*"], "exclude": ["node_modules"]
}
EOF
}

write_stub() {
  local name="$1"
  local dir="$2"
  mkdir -p "$dir/src"
  cat > "$dir/src/index.ts" <<EOF
// @chirag127/${name}
// v0.1.0 stub. See README for status.
export const __pkg = '@chirag127/${name}' as const
EOF
}

# === 1. RECOVER 22 from npm ===
for name in "${RECOVER[@]}"; do
  dir="$PKGS/${name}-npm-pkg"
  echo "=== RECOVER ${name} ==="
  rm -rf "$dir" 2>/dev/null || true
  mkdir -p "$dir"

  if (cd "$TMP" && npm pack "@chirag127/${name}" --silent 2>/dev/null); then
    tarball=$(ls "$TMP"/chirag127-${name}-*.tgz 2>/dev/null | head -1)
    if [[ -n "$tarball" ]]; then
      tar -xzf "$tarball" -C "$dir" --strip-components=1 2>/dev/null
      rm -f "$tarball"
      echo "  ✓ from npm"
    else
      write_stub "$name" "$dir"
      echo "  ! fresh stub (no tarball)"
    fi
  else
    write_stub "$name" "$dir"
    echo "  ! fresh stub (npm 404)"
  fi

  # Always overwrite metadata with our authoritative copies
  write_pkg_json "$name" "$dir"
  write_tsconfig "$dir"
  echo "$LICENSE_TEXT" > "$dir/LICENSE"
  write_readme "$name" "$dir"
  write_polish "$name" "$dir"
done

# === 2. SCAFFOLD 4 new auth-* ===
for name in "${SCAFFOLD[@]}"; do
  dir="$PKGS/${name}-npm-pkg"
  echo "=== SCAFFOLD ${name} ==="
  rm -rf "$dir" 2>/dev/null || true
  mkdir -p "$dir/src"
  write_stub "$name" "$dir"
  write_pkg_json "$name" "$dir"
  write_tsconfig "$dir"
  echo "$LICENSE_TEXT" > "$dir/LICENSE"
  write_readme "$name" "$dir"
  write_polish "$name" "$dir"
done

# === 3. Init git + push + ensure GH repo ===
ALL=("${RECOVER[@]}" "${SCAFFOLD[@]}")

for name in "${ALL[@]}"; do
  dir="$PKGS/${name}-npm-pkg"
  echo "=== PUSH ${name} ==="
  if [[ ! -d "$dir" ]]; then echo "  no dir, skip"; continue; fi
  cd "$dir" || exit 1
  rm -rf .git
  git init -q -b main
  git config user.name "Chirag Singhal"
  git config user.email "chirag@oriz.in"
  git add -A
  git commit -q -m "feat: v0.1.0 scaffold

${DESC[$name]}

Part of the chirag127/oriz package set — see
knowledge/architecture/the-six-packages.md."

  # Create GH repo (ignore if exists)
  gh repo create "chirag127/${name}-npm-pkg" --public \
    --description "${DESC[$name]}" \
    --homepage "https://www.npmjs.com/package/@chirag127/${name}" >/dev/null 2>&1 || true

  git remote add origin "https://github.com/chirag127/${name}-npm-pkg.git" 2>/dev/null \
    || git remote set-url origin "https://github.com/chirag127/${name}-npm-pkg.git"

  if git push -u origin main -f -q 2>&1 | tail -1; then
    echo "  ✓ pushed"
  else
    echo "  ✗ push failed"
  fi
done

echo ""
echo "DONE. ${#ALL[@]} packages alive on disk + GH."
