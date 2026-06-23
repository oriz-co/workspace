#!/usr/bin/env bash
# Relicense all 41 chirag127/oriz-family submodule repos from source-available to MIT.
# Walks npm-packages/*, apps/*/*, apis/*.
# Prints a TSV summary line per repo: name<TAB>license<TAB>pkg<TAB>readme<TAB>pushed

set -u

ROOT="/c/D/oriz"

MIT_TEXT='MIT License

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
SOFTWARE.'

process_repo() {
  local d="$1"
  local name
  name="$(basename "$d")"
  local lic_status="-" pkg_status="-" rd_status="-" push_status="-"

  if [ ! -d "$d/.git" ] && [ ! -f "$d/.git" ]; then
    echo -e "${name}\tNOT_A_REPO\t-\t-\t-"
    return
  fi

  # 1. LICENSE — always overwrite (or create)
  if [ -f "$d/LICENSE" ]; then
    printf '%s\n' "$MIT_TEXT" > "$d/LICENSE"
    lic_status="rewritten"
  else
    printf '%s\n' "$MIT_TEXT" > "$d/LICENSE"
    lic_status="created"
  fi

  # 2. package.json — change license field if it exists
  if [ -f "$d/package.json" ]; then
    if grep -q '"license"' "$d/package.json"; then
      # Replace any license value with "MIT"
      sed -i 's/"license"[[:space:]]*:[[:space:]]*"[^"]*"/"license": "MIT"/' "$d/package.json"
      pkg_status="updated"
    else
      pkg_status="no-license-key"
    fi
  fi

  # 3. README.md
  if [ -f "$d/README.md" ]; then
    # Badge swap
    sed -i 's|!\[license: source-available\](https://img.shields.io/badge/license-source--available-red.svg)|![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)|g' "$d/README.md"
    # "Source-available, all rights reserved" → "MIT License"
    sed -i 's|Source-available, all rights reserved\.|MIT License.|g' "$d/README.md"
    sed -i 's|Source-available, all rights reserved|MIT License|g' "$d/README.md"
    # Delete lines containing the "no license is granted" disclaimer (case-insensitive)
    sed -i '/[Nn][Oo] [Ll]icense is granted/Id' "$d/README.md"
    sed -i '/NO LICENSE IS GRANTED/d' "$d/README.md"
    # Delete the README "License notice" blockquote line that's the disclaimer
    sed -i '/\*\*License notice\.\*\*.*[Ss]ource-available/d' "$d/README.md"
    rd_status="updated"
  fi

  # 4. Commit + push
  (
    cd "$d" || exit 1
    git config user.name "Chirag Singhal" >/dev/null 2>&1
    git config user.email "chirag@oriz.in" >/dev/null 2>&1
    git add LICENSE 2>/dev/null
    [ -f package.json ] && git add package.json 2>/dev/null
    [ -f README.md ] && git add README.md 2>/dev/null
    if git diff --cached --quiet; then
      echo "NOCHANGES"
    else
      if git commit -m "feat: relicense to MIT — unlocks free-for-OSS programs" >/dev/null 2>&1; then
        if git push origin HEAD >/dev/null 2>&1; then
          echo "PUSHED"
        else
          echo "PUSH_FAIL"
        fi
      else
        echo "COMMIT_FAIL"
      fi
    fi
  ) > "/tmp/relicense-$$-$name.out" 2>&1

  push_status="$(cat "/tmp/relicense-$$-$name.out")"
  rm -f "/tmp/relicense-$$-$name.out"

  echo -e "${name}\t${lic_status}\t${pkg_status}\t${rd_status}\t${push_status}"
}

# Gather all directories
DIRS=()
for d in "$ROOT"/projects/oriz/own/lib/npm/*/ "$ROOT"/projects/oriz/own/prod/apps/*/*/ "$ROOT"/projects/oriz/own/svc/api/*/; do
  [ -d "$d" ] && DIRS+=("${d%/}")
done

echo "Found ${#DIRS[@]} repos."
echo -e "repo\tLICENSE\tpackage.json\tREADME\tpush"

# Fan out in parallel — max 8 at a time to avoid throttling
MAX_PAR=8
running=0
for d in "${DIRS[@]}"; do
  process_repo "$d" &
  running=$((running+1))
  if [ "$running" -ge "$MAX_PAR" ]; then
    wait -n 2>/dev/null || wait
    running=$((running-1))
  fi
done
wait

echo "DONE"
