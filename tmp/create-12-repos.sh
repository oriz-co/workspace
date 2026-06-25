#!/usr/bin/env bash
# Create 12 GH repos, push initial commit, enable Pages, and emit a summary.
set +e

declare -A DESCS
DESCS[oriz-nse-bse-tickers-api]="Indian index snapshots (Sensex, Nifty 50, Bank Nifty, sector indices) — daily 18:30 IST."
DESCS[oriz-rbi-rates-api]="RBI policy rates — repo, reverse-repo, bank rate, WACR, MCLR."
DESCS[oriz-gold-silver-rates-api]="Daily city-wise gold and silver retail rates for India."
DESCS[oriz-irctc-train-pnr-api]="Indian Railways train schedule lookup (no PNR — that requires user auth)."
DESCS[oriz-air-quality-india-api]="CPCB air-quality readings for Indian cities — daily."
DESCS[oriz-aqi-cities-api]="Global air-quality via the official OpenAQ free API (CC-BY 4.0)."
DESCS[oriz-india-petrol-diesel-api]="Daily city-wise petrol and diesel rates for India."
DESCS[oriz-india-exam-portal-status-api]="Daily up/down status of major Indian exam portals (NEET, JEE, GATE, UPSC, NPS, EPF)."
DESCS[oriz-india-rti-api]="RTI templates and state-wise Information Commission contacts."
DESCS[oriz-india-court-judgments-api]="Latest SC / HC judgment index (DEFERRED — upstream ToS pending re-verify)."
DESCS[oriz-india-budget-numbers-api]="Union Budget numbers by category, year by year. Source: indiabudget.gov.in (public domain)."
DESCS[oriz-stackoverflow-trending-api]="Trending Stack Overflow questions via the official Stack Exchange API (CC-BY-SA)."

APIS=(
  oriz-nse-bse-tickers-api oriz-rbi-rates-api oriz-gold-silver-rates-api
  oriz-irctc-train-pnr-api oriz-air-quality-india-api oriz-aqi-cities-api
  oriz-india-petrol-diesel-api oriz-india-exam-portal-status-api
  oriz-india-rti-api oriz-india-court-judgments-api
  oriz-india-budget-numbers-api oriz-stackoverflow-trending-api
)

ROOT=c:/D/oriz/repos/apis
LOG=c:/D/oriz/tmp/12-apis-deploy.log
> "$LOG"

for a in "${APIS[@]}"; do
  echo "=== $a ===" | tee -a "$LOG"
  cd "$ROOT/$a" || { echo "MISSING $a"; continue; }

  # Skip the heavy node_modules from commit.
  rm -rf node_modules

  # gh repo create with description (MIT licensed — we already wrote LICENSE).
  gh repo create "chirag127/$a" --public --description "${DESCS[$a]}" 2>&1 | tee -a "$LOG"

  # Local git init + first commit.
  if [ ! -d .git ] || [ -f .git ]; then
    rm -rf .git
    git init -q -b main
  fi
  git remote remove origin 2>/dev/null
  git remote add origin "https://github.com/chirag127/$a.git"
  git add -A
  git -c user.name='Chirag Singhal' -c user.email='chirag127@users.noreply.github.com' \
      commit -q -m "feat: scaffold $a — ToS-conservative scraping API (12-batch)" 2>&1 | tee -a "$LOG"
  git push -u origin main 2>&1 | tail -3 | tee -a "$LOG"

  # Enable Pages from main / (root).
  gh api -X POST "repos/chirag127/$a/pages" \
    -F 'source[branch]=main' -F 'source[path]=/' 2>&1 | head -2 | tee -a "$LOG"

  echo "" | tee -a "$LOG"
done

echo "ALL DONE. Log: $LOG"
