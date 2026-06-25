#!/usr/bin/env bash
# Run all 12 scrapers once locally with a hard timeout each. Failure => keep seed.
set +e
APIS=(
  oriz-nse-bse-tickers-api oriz-rbi-rates-api oriz-gold-silver-rates-api
  oriz-irctc-train-pnr-api oriz-air-quality-india-api oriz-aqi-cities-api
  oriz-india-petrol-diesel-api oriz-india-exam-portal-status-api
  oriz-india-rti-api oriz-india-court-judgments-api
  oriz-india-budget-numbers-api oriz-stackoverflow-trending-api
)
ROOT=c:/D/oriz/repos/apis

# Share node_modules from the first install (cheerio + deps).
SRC=$ROOT/oriz-nse-bse-tickers-api/node_modules

for a in "${APIS[@]}"; do
  echo "=== $a ==="
  cd "$ROOT/$a" || continue
  if [ ! -d node_modules ]; then
    if [ -d "$SRC" ]; then
      cp -r "$SRC" ./node_modules
    fi
  fi
  timeout 20 node scripts/scrape.mjs 2>&1 | tail -3
  echo
done
