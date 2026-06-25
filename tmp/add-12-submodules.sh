#!/usr/bin/env bash
# Add 12 newly-created APIs as submodules under c:/D/oriz/.
set +e
cd c:/D/oriz || exit 1

APIS=(
  oriz-nse-bse-tickers-api oriz-rbi-rates-api oriz-gold-silver-rates-api
  oriz-irctc-train-pnr-api oriz-air-quality-india-api oriz-aqi-cities-api
  oriz-india-petrol-diesel-api oriz-india-exam-portal-status-api
  oriz-india-rti-api oriz-india-court-judgments-api
  oriz-india-budget-numbers-api oriz-stackoverflow-trending-api
)

for a in "${APIS[@]}"; do
  rel="repos/oriz/own/svc/api/$a"
  echo "=== $a ==="
  # The dir currently has its own .git + uncommitted-state — submodule add needs a clean path.
  # Move it aside, add submodule, which re-clones, preserving the GH copy as source of truth.
  mv "$rel" "$rel.tmp" 2>/dev/null
  git submodule add "https://github.com/chirag127/$a.git" "$rel"
  rc=$?
  if [ $rc -ne 0 ]; then echo "FAILED submodule add $a (rc=$rc)"; fi
  rm -rf "$rel.tmp"
done

# Get the recorded SHA per submodule.
echo "---"
echo "Submodule SHAs:"
git submodule status | grep -E '/(oriz-(nse-bse|rbi|gold-silver|irctc|air-quality|aqi-cities|india-petrol|india-exam|india-rti|india-court|india-budget|stackoverflow))' | awk '{print $1, $2}'
