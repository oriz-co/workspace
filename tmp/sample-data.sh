#!/usr/bin/env bash
# Emit first 3 data entries per API.
APIS=(
  oriz-nse-bse-tickers-api oriz-rbi-rates-api oriz-gold-silver-rates-api
  oriz-irctc-train-pnr-api oriz-air-quality-india-api oriz-aqi-cities-api
  oriz-india-petrol-diesel-api oriz-india-exam-portal-status-api
  oriz-india-rti-api oriz-india-court-judgments-api
  oriz-india-budget-numbers-api oriz-stackoverflow-trending-api
)
for a in "${APIS[@]}"; do
  echo "##### $a"
  node -e "
    const d = JSON.parse(require('fs').readFileSync('c:/D/oriz/repos/oriz/own/svc/api/$a/data/latest.json','utf8'));
    // Find first array in d and slice 3.
    const out = { date: d.date, source: d.source };
    for (const k of Object.keys(d)) {
      if (Array.isArray(d[k])) out[k] = d[k].slice(0, 3);
      else if (k !== 'date' && k !== 'source') out[k] = d[k];
    }
    console.log(JSON.stringify(out, null, 2));
  " 2>&1
  echo
done
