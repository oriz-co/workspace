#!/usr/bin/env bash
# git init + GH repo create + push for each of the 5 book repos.
set -euo pipefail

ROOT="/c/D/oriz/projects/books"

declare -A SUBS=(
  [oriz-stack]="Astro 6 + Cloudflare Pages + Firebase Spark Family Architecture"
  [oriz-paisa]="Credit Cards India 2026"
  [oriz-pdf]="From Browser to Native — PWA → PWABuilder → Play Store"
  [oriz-janaushdhi]="Generic Medicines India"
  [oriz-me]="100-Year Strategy"
)

declare -A TITLES=(
  [oriz-stack]="Oriz Stack"
  [oriz-paisa]="Oriz Paisa"
  [oriz-pdf]="Oriz PDF"
  [oriz-janaushdhi]="Oriz Janaushdhi"
  [oriz-me]="Oriz Me"
)

for slug in oriz-stack oriz-paisa oriz-pdf oriz-janaushdhi oriz-me; do
  REPO="$ROOT/${slug}-book"
  TITLE="${TITLES[$slug]}"
  SUB="${SUBS[$slug]}"
  echo "=== ${slug}-book ==="
  cd "$REPO"
  git init -q -b main
  git config user.name "Chirag Singhal"
  git config user.email "chirag@oriz.in"
  git add -A
  git commit -q -m "feat: v0.1.0 scaffold — ${TITLE} manuscript skeleton"
  SHA=$(git rev-parse HEAD)
  echo "SHA: $SHA"
  gh repo create "chirag127/${slug}-book" --public \
    --description "${TITLE} — ${SUB}. Source manuscript for the chirag127/oriz family book series." \
    --homepage "https://packages.oriz.in/books/${slug}" 2>&1 | tail -2
  git remote add origin "https://github.com/chirag127/${slug}-book.git"
  git push -u origin main 2>&1 | tail -3
  echo ""
done

echo "All 5 book repos pushed."
