#!/usr/bin/env bash
# fix-package-json-repo-urls.sh — update repository.url + homepage in each
# package.json on the 14 new packages to use the -npm-pkg suffixed slug.
set -euo pipefail
ROOT="C:/D/oriz"
NAMES=(astro-distribute astro-pwa astro-content astro-billing astro-search astro-mdx astro-toc astro-comments astro-share astro-newsletter astro-affiliate astro-keyboard astro-feedback astro-test-utils)

for name in "${NAMES[@]}"; do
  f="$ROOT/projects/npm-packages/${name}-npm-pkg/package.json"
  node -e "
    const fs = require('fs');
    const p = JSON.parse(fs.readFileSync('$f', 'utf8'));
    p.repository.url = 'git+https://github.com/chirag127/${name}-npm-pkg.git';
    p.homepage = 'https://github.com/chirag127/${name}-npm-pkg#readme';
    p.bugs = { url: 'https://github.com/chirag127/${name}-npm-pkg/issues' };
    fs.writeFileSync('$f', JSON.stringify(p, null, 2) + '\n');
    console.log('fixed ${name}');
  "
done
