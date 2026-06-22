# Runbook: Add API subdomain CNAME on Cloudflare → GitHub Pages

**Purpose:** wire a new `<sub>.api.oriz.in` CNAME to `chirag127.github.io` (DNS-only / grey cloud, per locked Q-DNS-SHAPE).

**Script:** [`scripts/cf-dns-set-api-cnames.mjs`](../../scripts/cf-dns-set-api-cnames.mjs) — idempotent. Plain `node` + `fetch`, no SDK.

**Zone:** `oriz.in` → zone id `fe8da3c9dd0cb1f1d964e3a94d6098b3`
**Target:** `chirag127.github.io` (single APEX-style CNAME — GH Pages routes by `Host:` header + per-repo `CNAME` file)
**Cloud:** grey (proxied=false). Proxying breaks GH Pages cert provisioning.

---

## 1. Add a new subdomain

1. Edit `scripts/cf-dns-set-api-cnames.mjs` → append the slug to the `SUBS` array.
2. Load env and run:

   ```bash
   # Loads vars from .env if not already exported (use the explicit token, not the global API key):
   CLOUDFLARE_API_TOKEN=$(grep ^CLOUDFLARE_API_TOKEN .env | cut -d= -f2) \
     node scripts/cf-dns-set-api-cnames.mjs

   # Or pass the env file directly:
   node scripts/cf-dns-set-api-cnames.mjs --env=.env
   ```

3. Output reports `created / updated / skipped / error` per record. Already-correct rows are skipped — safe to re-run.

**Auth note:** the script reads `CLOUDFLARE_API_KEY` first, then falls back to `CLOUDFLARE_API_TOKEN`. As of 2026-06-22 the `CLOUDFLARE_API_KEY` (UI Global key) returns `9109 Invalid access token` from the v4 API — use `CLOUDFLARE_API_TOKEN` (the explicit DNS:Edit token).

## 2. Verify DNS propagation

Windows `nslookup` against 8.8.8.8 is firewalled on this machine — use Cloudflare DoH instead:

```bash
curl -s "https://cloudflare-dns.com/dns-query?name=<sub>.api.oriz.in&type=CNAME" \
  -H "accept: application/dns-json" | jq
```

Expect `"type": 5` (= CNAME) and `"data": "chirag127.github.io."`. Propagation to authoritative NS is usually <1 min for Cloudflare.

Alternative tools when on a network that allows raw DNS:

```bash
dig CNAME <sub>.api.oriz.in +short              # expect: chirag127.github.io.
nslookup -type=CNAME <sub>.api.oriz.in 1.1.1.1
```

## 3. Verify GitHub Pages cert + routing

1. In the repo that serves this subdomain, set the Pages custom domain to `<sub>.api.oriz.in` (or commit a `CNAME` file with that value at the publish root).
2. Wait 10-30 min for GitHub to provision the Let's Encrypt cert (you'll see "DNS check successful" then "TLS certificate issued").
3. Test:

   ```bash
   curl -I https://<sub>.api.oriz.in/
   ```

   Expect `HTTP/2 200` (or 404 from GH Pages, which still confirms TLS works) and `server: GitHub.com`.

## 4. Common failures

| Symptom | Cause | Fix |
|---|---|---|
| `9109 Invalid access token` | Wrong CF token (Global key fails on v4 zones API) | Use `CLOUDFLARE_API_TOKEN` (DNS:Edit scope) |
| GH Pages stuck on "DNS check in progress" | Record proxied=true (orange cloud) | Re-run script — it enforces `proxied: false` |
| `ERR_TOO_MANY_REDIRECTS` after going live | GH Pages "Enforce HTTPS" toggle still off | Wait for cert, then toggle on in repo Pages settings |
| Multiple repos claiming same subdomain | GH Pages serves whichever proved DNS first | Remove the `CNAME` from the loser repo's Pages settings |

## 5. Current inventory

19 subdomains live as of 2026-06-22 (see `SUBS` array in the script for the source of truth):

`fii-dii, mmi, mf-nav, pincode, ifsc, holidays, currency, tickers, rbi-rates, gold-silver, irctc, aqi-india, aqi, fuel, exams, rti, judgments, budget, so-trending` — all `.api.oriz.in → chirag127.github.io`.
