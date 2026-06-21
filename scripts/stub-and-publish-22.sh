#!/usr/bin/env bash
# stub-and-publish-22.sh — replace src/ of all 22 packages with the universal
# v0.1.0 stub, then `npm publish` each using NPM_TOKEN from .env.
# ponytail: token via .npmrc env-substitution; restored at end.

set -euo pipefail
ROOT="C:/D/oriz"
PKGS="$ROOT/projects/npm-packages"
NAMES=(
  astro-shell astro-chrome astro-config astro-data astro-forms astro-icons astro-tools astro-ai
  astro-distribute astro-pwa astro-content astro-billing astro-search
  astro-mdx astro-toc astro-comments astro-share astro-newsletter astro-affiliate astro-keyboard astro-feedback astro-test-utils
)

# Load NPM_TOKEN from .env
if [[ ! -f "$ROOT/.env" ]]; then
  echo "no .env at $ROOT/.env" >&2; exit 1
fi
NPM_TOKEN=$(grep -E '^NPM_TOKEN=' "$ROOT/.env" | head -1 | sed 's/^NPM_TOKEN=//')
if [[ -z "${NPM_TOKEN:-}" ]]; then
  echo "NPM_TOKEN missing in .env" >&2; exit 1
fi
export NPM_TOKEN

# Temp .npmrc in the user's home so npm picks up the token
NPMRC_BAK=""
if [[ -f "$HOME/.npmrc" ]]; then
  NPMRC_BAK="$HOME/.npmrc.publish-bak.$$"
  cp "$HOME/.npmrc" "$NPMRC_BAK"
fi
cat > "$HOME/.npmrc" <<EOF
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
EOF

restore_npmrc() {
  if [[ -n "$NPMRC_BAK" ]]; then mv "$NPMRC_BAK" "$HOME/.npmrc"; else rm -f "$HOME/.npmrc"; fi
}
trap restore_npmrc EXIT

# Verify auth
who=$(npm whoami 2>&1)
echo "authed as: $who"
if [[ "$who" != "chirag127" ]]; then echo "auth check failed"; exit 1; fi

for name in "${NAMES[@]}"; do
  dir="$PKGS/${name}-npm-pkg"
  echo "=== ${name} ==="

  if [[ ! -d "$dir" ]]; then echo "  skip — dir missing"; continue; fi
  cd "$dir" || exit 1

  # Back up real src if present (idempotent)
  if [[ -d src ]] && [[ ! -f src/.is-stub ]]; then
    line_count=$(find src -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.astro' -o -name '*.css' \) -exec cat {} + 2>/dev/null | wc -l)
    if (( line_count > 10 )); then
      rm -rf src.bak
      mv src src.bak
    else
      rm -rf src
    fi
  else
    rm -rf src
  fi

  mkdir -p src
  cat > src/index.ts <<EOF
// @chirag127/${name}
// v0.1.0 stub. Real code lives in src.bak/ until the build pipeline lands.
export const __pkg = '@chirag127/${name}' as const
EOF
  touch src/.is-stub

  node -e "
    const fs = require('fs');
    const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    for (const k of ['dependencies','peerDependencies','devDependencies']) {
      if (!p[k]) continue;
      for (const d of Object.keys(p[k])) {
        if (typeof p[k][d] === 'string' && p[k][d].startsWith('workspace:')) delete p[k][d];
      }
      if (Object.keys(p[k]).length === 0) delete p[k];
    }
    p.main = './src/index.ts';
    p.types = './src/index.ts';
    p.exports = { '.': './src/index.ts' };
    if (p.scripts) {
      for (const s of ['build','check','format','typecheck']) delete p.scripts[s];
      if (Object.keys(p.scripts).length === 0) delete p.scripts;
    }
    fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
  "

  if npm publish --access public 2>&1 | tail -1; then
    echo "  ✓ published"
  else
    echo "  ✗ publish failed"
  fi
done
