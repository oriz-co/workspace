#!/usr/bin/env bash
# scaffold-14-packages.sh — populate each of the 14 new astro-* package dirs
# with package.json + tsconfig.json + LICENSE + README.md + src/index.ts.
# ponytail: dumb generator, fast to read, fast to delete. Per-package
# stub code lives nowhere yet — the real logic ships in v0.1.1+ when an
# app pulls the package and the first 3rd duplication is collapsed.

set -euo pipefail

cd "$(dirname "$0")/.." || exit 1
ROOT="$PWD/projects/npm-packages"

declare -A DESC=(
  [astro-distribute]="Build PWA + Android APK (Bubblewrap TWA) + desktop EXE/dmg/AppImage (Tauri) from one Astro build. CLI: astro-distribute build."
  [astro-pwa]="Locked @vite-pwa/astro defaults for the chirag127 family — manifest from astro-chrome brand, offline shell, <InstallPrompt>, <UpdateToast>."
  [astro-content]="Zod content-collection schemas + RSS + Atom + JSON-Feed + sitemap glue + IndexNow ping + OG-card emit. Used by every content site."
  [astro-billing]="Razorpay client + license-key verify + <Paywall> + <PriceTag>. Implements one-subscription-unlocks-all."
  [astro-search]="<MultiSearch> popover (multi-engine web search) + <SiteSearch> (Pagefind local index, built at deploy time)."
  [astro-mdx]="Shared MDX components: <Callout>, <Aside>, <Figure>, <ImageCompare>, <KaTeX>, <CodeBlock> (Shiki + copy + line-highlight)."
  [astro-toc]="Auto table-of-contents from <h2>/<h3> with sticky sidebar + scroll-spy + jump-to."
  [astro-comments]="Giscus wrapper with dark theme + lazy-load + reply-count fetch."
  [astro-share]="<ShareBar> — X / LinkedIn / copy-link / QR / native-share fallback."
  [astro-newsletter]="<NewsletterForm> — Buttondown primary, EmailOctopus fallback, honeypot, double-opt-in."
  [astro-affiliate]="Disclosure banner + <AffiliateLink> (UTM tracking + rel=nofollow sponsored + click ping)."
  [astro-keyboard]="Global Cmd-K palette + ? shortcuts overlay + / focus-search."
  [astro-feedback]="\"Was this helpful?\" thumbs + optional textarea, ships to Web3Forms / Firestore."
  [astro-test-utils]="Vitest mocks (Firestore, Razorpay, Web3Forms) + Playwright fixtures + MSW handlers."
)

for name in "${!DESC[@]}"; do
  dir="$ROOT/${name}-npm-pkg"
  mkdir -p "$dir/src"
  desc="${DESC[$name]}"

  # package.json
  cat > "$dir/package.json" <<EOF
{
  "name": "@chirag127/${name}",
  "version": "0.1.0",
  "description": "${desc}",
  "type": "module",
  "license": "SEE LICENSE IN LICENSE",
  "author": "Chirag Singhal <chirag@oriz.in>",
  "homepage": "https://github.com/chirag127/${name}#readme",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/chirag127/${name}.git"
  },
  "bugs": {
    "url": "https://github.com/chirag127/${name}/issues"
  },
  "keywords": ["astro", "chirag127", "oriz"],
  "files": ["src", "LICENSE", "README.md"],
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "publishConfig": {
    "access": "public"
  }
}
EOF

  # tsconfig.json
  cat > "$dir/tsconfig.json" <<'EOF'
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

  # LICENSE — same source-available terms as the rest of the family
  cat > "$dir/LICENSE" <<'EOF'
Copyright (c) 2026 Chirag Singhal
All rights reserved.

The source in this repository is published for portfolio + transparency
only. No license is granted to use, modify, distribute, sublicense, sell,
or create derivative works, in whole or in part, in any form. Public
visibility does not imply permission.

For licensing inquiries, contact the author.
EOF

  # README.md
  cat > "$dir/README.md" <<EOF
# @chirag127/${name}

${desc}

Part of the [\`chirag127/oriz\`](https://github.com/chirag127/oriz) family. See [\`knowledge/architecture/the-six-packages.md\`](https://github.com/chirag127/oriz/blob/main/knowledge/architecture/the-six-packages.md) for the full package set.

## Status

\`v0.1.0\` — stub. The first real release lands when a third app duplicates the surface this package exists to collapse. Until then this package is a slug reservation + scaffold.

## Install

\`\`\`bash
pnpm add @chirag127/${name}
\`\`\`

## License

Source-available, all rights reserved. See [\`LICENSE\`](./LICENSE).
EOF

  # src/index.ts — empty named export so npm has something to publish
  cat > "$dir/src/index.ts" <<EOF
// @chirag127/${name} — ${desc}
// v0.1.0 stub. See README.md for status.
export const __pkg = '@chirag127/${name}'
EOF

  echo "scaffolded ${name}"
done
