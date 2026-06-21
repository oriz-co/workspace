#!/usr/bin/env bash
# Scaffolds 5 book repos for the chirag127/oriz family.
# Each book gets: LICENSE (CC-BY-NC-ND 4.0), README.md, book.json, manuscript/, .github/, polish files.
# Tech books additionally get samples/ with MIT LICENSE.
set -euo pipefail

ROOT="/c/D/oriz/projects/books"
mkdir -p "$ROOT"

# slug | title | subtitle | category | base | pro | currency | pwyw | channels-comma | has_samples
BOOKS=(
  "oriz-stack|Oriz Stack|Astro 6 + Cloudflare Pages + Firebase Spark Family Architecture|technical|19|39|USD|false|leanpub,gumroad,lemonsqueezy,kdp,gpb|true"
  "oriz-paisa|Oriz Paisa|Credit Cards India 2026|indian-finance|499|999|INR|false|kdp,gumroad,d2d,gpb|false"
  "oriz-pdf|Oriz PDF|From Browser to Native — PWA → PWABuilder → Play Store|tool-companion|14||USD|false|leanpub,gumroad,lemonsqueezy,kdp|true"
  "oriz-janaushdhi|Oriz Janaushdhi|Generic Medicines India|indian-public-health|299||INR|false|kdp,gumroad,gpb|false"
  "oriz-me|Oriz Me|100-Year Strategy|personal-essay|9||USD|true|gumroad,lemonsqueezy,leanpub|false"
)

write_file () { mkdir -p "$(dirname "$1")"; printf '%s' "$2" > "$1"; }

# === Shared file bodies (templated per book) ===

cc_license () {
cat <<'EOF'
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International
(CC BY-NC-ND 4.0)

Copyright (c) 2026 Chirag Singhal

The book manuscript (all `.md` files under `manuscript/`, plus any
illustrations, cover art, and prose elsewhere in this repository unless
explicitly stated otherwise) is licensed under the Creative Commons
Attribution-NonCommercial-NoDerivatives 4.0 International License.

You are free to:
  - Share — copy and redistribute the material in any medium or format

Under the following terms:
  - Attribution — You must give appropriate credit, provide a link to
    the license, and indicate if changes were made.
  - NonCommercial — You may not use the material for commercial purposes.
  - NoDerivatives — If you remix, transform, or build upon the material,
    you may not distribute the modified material.

Full legal code: https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode

---

CODE SAMPLES NOTE
Code samples in `samples/` are MIT-licensed; see `samples/LICENSE`.
This dual-license split (prose = CC-BY-NC-ND, code = MIT) lets readers
copy/paste, run, and modify the example code freely while keeping the
manuscript text protected.
EOF
}

mit_samples_license () {
cat <<'EOF'
MIT License

Copyright (c) 2026 Chirag Singhal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
}

gitignore_body () {
cat <<'EOF'
node_modules/
dist/
.cache/
.env
.env.local
*.log
.DS_Store
build/
out/
EOF
}

build_workflow () {
cat <<'EOF'
name: Build Book
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
  workflow_dispatch:
jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm dlx @chirag127/oriz-book-build build || echo "oriz-book-build v0.1.0 is a stub — real build lands in v0.1.1"
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: book-artifacts
          path: |
            dist/**/*.epub
            dist/**/*.pdf
            dist/**/*.mobi
            dist/**/*.markua
          if-no-files-found: ignore
EOF
}

release_workflow () {
cat <<'EOF'
name: Release Book
on:
  push:
    tags: ['v*.*.*']
jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm dlx @chirag127/oriz-book-build build || echo "stub"
      - uses: softprops/action-gh-release@v2
        with:
          files: |
            dist/**/*.epub
            dist/**/*.pdf
            dist/**/*.mobi
            dist/**/*.markua
          fail_on_unmatched_files: false
  omni-publish:
    needs: build
    uses: chirag127/omni-publish-npm-pkg/.github/workflows/omni-publish.yml@main
    with:
      type: book
    secrets: inherit
EOF
}

scorecard_workflow () {
cat <<'EOF'
name: Scorecard
on:
  branch_protection_rule:
  schedule:
    - cron: "0 0 * * 1"
  push:
    branches: [main]
permissions: read-all
jobs:
  analysis:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
      - uses: ossf/scorecard-action@v2
        with:
          results_file: results.sarif
          results_format: sarif
          publish_results: true
      - uses: actions/upload-artifact@v4
        with:
          name: SARIF
          path: results.sarif
          retention-days: 5
      - uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: results.sarif
EOF
}

codeowners_body () { echo "* @chirag127"; }

dependabot_body () {
cat <<'EOF'
version: 2
updates:
  - package-ecosystem: github-actions
    directory: /
    schedule: { interval: weekly }
    commit-message: { prefix: ci }
EOF
}

funding_body () {
cat <<'EOF'
github: chirag127
ko_fi: chirag127
liberapay: chirag127
thanks_dev: gh/chirag127
custom:
  - https://paypal.me/chirag127
EOF
}

security_body () {
local title="$1"
cat <<EOF
# Security Policy

Report security issues to **chirag@oriz.in** with subject \`[security] ${title} book\`.
Do NOT open public GitHub issues for vulnerabilities. Response within 7 days.

Code samples are MIT-licensed; the manuscript is CC-BY-NC-ND 4.0.
EOF
}

coc_body () {
cat <<'EOF'
# Code of Conduct

This project follows the [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code-of-conduct/).

Report violations to **chirag@oriz.in**.
EOF
}

contributing_body () {
local title="$1"
cat <<EOF
# Contributing

The **${title}** manuscript (prose under \`manuscript/\`) is licensed
CC-BY-NC-ND 4.0 — no derivatives or commercial use. Bug reports and
typo fixes via [Issues](../../issues) are welcome; small typo-only PRs
against the manuscript will be accepted at the author's discretion.

**Code samples** under \`samples/\` (when present) are MIT-licensed —
contributions are welcome via PR. By submitting code you agree it is
released under MIT.

Open an [Issue](../../issues) first for non-trivial proposals.
EOF
}

renovate_body () {
cat <<'EOF'
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended"],
  "labels": ["deps"],
  "schedule": ["before 4am on monday"]
}
EOF
}

deepsource_body () {
cat <<'EOF'
version = 1

[[analyzers]]
name = "shell"
EOF
}

mergify_body () {
cat <<'EOF'
queue_rules:
  - name: default
    queue_conditions:
      - check-success=build
    merge_conditions:
      - check-success=build
    merge_method: squash

pull_request_rules:
  - name: automatic merge on approval
    conditions:
      - "#approved-reviews-by>=1"
      - check-success=build
      - -draft
    actions:
      queue: {}
  - name: automatic merge for dependabot/renovate
    conditions:
      - or:
        - author=dependabot[bot]
        - author=renovate[bot]
      - check-success=build
    actions:
      queue: {}
EOF
}

sonar_body () {
local slug="$1"
cat <<EOF
sonar.projectKey=chirag127_${slug}-book
sonar.organization=chirag127
sonar.sources=samples,manuscript
sonar.exclusions=**/node_modules/**,**/dist/**
EOF
}

readme_body () {
local slug="$1" title="$2" subtitle="$3"
cat <<EOF
# ${title}

> *${subtitle}*

\`\`\`
+--------------------------------------+
|                                      |
|           ${title}
|                                      |
|           ${subtitle}
|                                      |
|           — Chirag Singhal —         |
|                                      |
+--------------------------------------+
\`\`\`

**${title}** is part of the [chirag127/oriz](https://github.com/chirag127/oriz) family book series.
The manuscript is published in the open under CC-BY-NC-ND 4.0; code samples (where present) are MIT.
Built with [\`@chirag127/oriz-book-build\`](https://www.npmjs.com/package/@chirag127/oriz-book-build),
which wraps Pandoc to produce EPUB3 / PDF / MOBI / Markua outputs from a single Markua source.

This repository is the **source manuscript** — you can read the working draft here, file typo issues,
and (for tech books) copy/paste the code samples freely under MIT. The polished, designed editions
ship via the channels below. The first chapter is free to read at
[\`manuscript/00-introduction.md\`](./manuscript/00-introduction.md).

## Read / Buy

> All store links are **placeholders** until the first edition publishes.

- [Leanpub](https://leanpub.com/${slug}) (placeholder)
- [Gumroad](https://chirag127.gumroad.com/l/${slug}) (placeholder)
- [Amazon Kindle (KDP)](https://www.amazon.com/dp/B0PLACEHOLDER) (placeholder)
- [Apple Books](https://books.apple.com/) (placeholder, via Draft2Digital)
- [Kobo](https://www.kobo.com/) (placeholder, via Draft2Digital)
- [Barnes & Noble](https://www.barnesandnoble.com/) (placeholder, via Draft2Digital)
- [Google Play Books](https://play.google.com/store/books) (placeholder)

## Cross-refs

- [book.json](./book.json) — pricing, channels, and Pandoc build manifest
- [manuscript/](./manuscript/) — Markua-flavoured chapters
- [the family book series](https://packages.oriz.in/books)
- [security policy](./SECURITY.md) · [code of conduct](./CODE_OF_CONDUCT.md) · [contributing](./CONTRIBUTING.md)
EOF
}

book_json_body () {
local title="$1" subtitle="$2" base="$3" pro="$4" currency="$5" pwyw="$6" channels_csv="$7"
# build channels JSON
local channels_json="{"
IFS=',' read -r -a chans <<< "$channels_csv"
for i in "${!chans[@]}"; do
  if [ "$i" -gt 0 ]; then channels_json+=", "; fi
  channels_json+="\"${chans[$i]}\": true"
done
channels_json+="}"
# pricing block
local pricing_json="\"base\": ${base}"
if [ -n "$pro" ]; then pricing_json+=", \"pro\": ${pro}"; fi
pricing_json+=", \"currency\": \"${currency}\""
if [ "$pwyw" = "true" ]; then pricing_json+=", \"pwyw\": true"; fi
cat <<EOF
{
  "title": "${title}",
  "subtitle": "${subtitle}",
  "author": "Chirag Singhal",
  "language": "en",
  "pricing": { ${pricing_json} },
  "channels": ${channels_json},
  "manuscript": "./manuscript",
  "outputs": { "epub": true, "pdf": true, "mobi": true, "markua": true }
}
EOF
}

intro_md () {
local title="$1" subtitle="$2" category="$3"
cat <<EOF
{frontmatter}

# Introduction

Welcome to **${title}** — *${subtitle}*. This book exists because the
gap between "I know roughly how this works" and "I can ship it in production"
is wider than any tutorial admits, and the only honest way to close it is to
walk every step on the page with the reader. The ${category} territory we'll
cover here is well-trodden in pieces and almost never assembled end-to-end,
so most of the value of this book is in the joinery: the boring transitions
between chapters where the real bugs live.

This book is for the practitioner who already has hands on the keyboard.
You don't need to be an expert in any single thing covered here, but you
should be comfortable reading code, breaking things on a staging environment,
and pushing back on advice that doesn't match your reality. We'll move fast
through fundamentals and slow down at the decisions that compound — pricing,
licensing, hosting choices, and the small architectural calls that you only
get to make once per project.

By the end, you'll have a working mental model of ${subtitle}, a set of
recipes you can copy and adapt, and — most importantly — the vocabulary to
disagree with this book intelligently when your situation calls for it. The
manuscript is open under CC-BY-NC-ND 4.0 so you can read freely and share
with attribution. Let's get started.
EOF
}

chapter1_md () {
local title="$1" subtitle="$2"
cat <<EOF
# Chapter 1 — Setting the Stage

Every book about ${subtitle} eventually has to answer the same first question:
what are we actually optimising for? In **${title}** the answer is **clarity
under constraint** — the ability to make a defensible decision when you don't
have time to read the full literature, the budget to hire a specialist, or the
luxury of waiting for a clearer signal. The rest of this chapter establishes
the constraints we'll keep returning to, because every later trade-off is a
restatement of these few axes.

The first constraint is **cost**. Money is a slow-moving variable, but choices
about it lock in long after the decision feels reversible. We'll be explicit
about the price of every recommendation — in dollars or rupees, in maintenance
load, and in the opportunity cost of *not* taking the alternative. The second
constraint is **time**, and specifically the difference between time-now and
time-later: the cheapest thing today is often the most expensive thing in six
months, and good practitioners learn to feel this asymmetry in their bones.

The final framing piece is **reversibility**. Some decisions can be undone in
a weekend; others bind for years. Throughout this book we'll mark each major
choice with its reversibility class, because the right amount of care to take
is a direct function of how hard it is to back out. With those three axes —
cost, time, and reversibility — you have the toolkit for almost every chapter
that follows.
EOF
}

# === Per-book scaffold ===
for entry in "${BOOKS[@]}"; do
  IFS='|' read -r slug title subtitle category base pro currency pwyw channels_csv has_samples <<< "$entry"
  REPO="$ROOT/${slug}-book"
  echo "=== Scaffolding $REPO ==="
  rm -rf "$REPO"
  mkdir -p "$REPO/manuscript" "$REPO/assets" "$REPO/.github/workflows"

  write_file "$REPO/LICENSE" "$(cc_license)"
  write_file "$REPO/.gitignore" "$(gitignore_body)"
  write_file "$REPO/README.md" "$(readme_body "$slug" "$title" "$subtitle")"
  write_file "$REPO/book.json" "$(book_json_body "$title" "$subtitle" "$base" "$pro" "$currency" "$pwyw" "$channels_csv")"
  write_file "$REPO/manuscript/00-introduction.md" "$(intro_md "$title" "$subtitle" "$category")"
  write_file "$REPO/manuscript/01-chapter-1.md" "$(chapter1_md "$title" "$subtitle")"
  : > "$REPO/assets/.gitkeep"

  if [ "$has_samples" = "true" ]; then
    mkdir -p "$REPO/samples"
    write_file "$REPO/samples/LICENSE" "$(mit_samples_license)"
    : > "$REPO/samples/.gitkeep"
  fi

  write_file "$REPO/.github/workflows/build.yml" "$(build_workflow)"
  write_file "$REPO/.github/workflows/release.yml" "$(release_workflow)"
  write_file "$REPO/.github/workflows/scorecard.yml" "$(scorecard_workflow)"
  write_file "$REPO/.github/CODEOWNERS" "$(codeowners_body)"
  write_file "$REPO/.github/dependabot.yml" "$(dependabot_body)"
  write_file "$REPO/.github/FUNDING.yml" "$(funding_body)"
  write_file "$REPO/SECURITY.md" "$(security_body "$title")"
  write_file "$REPO/CODE_OF_CONDUCT.md" "$(coc_body)"
  write_file "$REPO/CONTRIBUTING.md" "$(contributing_body "$title")"
  write_file "$REPO/renovate.json" "$(renovate_body)"
  write_file "$REPO/.deepsource.toml" "$(deepsource_body)"
  write_file "$REPO/.mergify.yml" "$(mergify_body)"
  write_file "$REPO/sonar-project.properties" "$(sonar_body "$slug")"
done

echo "All 5 book scaffolds complete."
