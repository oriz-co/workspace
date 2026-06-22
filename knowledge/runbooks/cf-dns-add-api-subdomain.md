# Runbook: Add API subdomain CNAME on Cloudflare → GitHub Pages

**Purpose:** wire a new `<sub>.api.oriz.in` CNAME to `chirag127.github.io` (DNS-only / grey cloud, per locked Q-DNS-SHAPE).

**Script:** [`scripts/cf-dns-set-api-cnames.mjs`](../../scripts/cf-dns-set-api-cnames.mjs) — idempotent. Plain `node` + `fetch`, no SDK.

**Zone:** `oriz.in` → zone id `fe8da3c9dd0cb1f1d964e3a94d6098b3`
**Target:** `chirag127.github.io` (single APEX-style CNAME — GH Pages routes by `Host:` header + per-repo `CNAME` file)
**Cloud:** **orange (proxied=true) as of 2026-06-22** — flipped to gain CDN, DDoS, Analytics, Always-Online, Cache Rules, Universal SSL. GH Pages cert is bypassed; CF Universal SSL terminates at edge (Flexible/Full SSL setting on zone, takes 15-90min to provision after flip).

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
| GH Pages stuck on "DNS check in progress" | Record proxied=true (orange cloud) AND GH Pages still on per-subdomain cert mode | Either flip back to grey via `cf-dns-flip-proxy.mjs --proxy=off`, OR rely on CF Universal SSL (current default — proxied=true) |
| `ERR_TOO_MANY_REDIRECTS` after going live | GH Pages "Enforce HTTPS" toggle still off | Wait for cert, then toggle on in repo Pages settings |
| Multiple repos claiming same subdomain | GH Pages serves whichever proved DNS first | Remove the `CNAME` from the loser repo's Pages settings |

## 5. Current inventory

19 subdomains live as of 2026-06-22 (see `SUBS` array in the script for the source of truth):

`fii-dii, mmi, mf-nav, pincode, ifsc, holidays, currency, tickers, rbi-rates, gold-silver, irctc, aqi-india, aqi, fuel, exams, rti, judgments, budget, so-trending` — all `.api.oriz.in → chirag127.github.io`.

## 6. Flip proxy state (grey ↔ orange cloud)

Use [`scripts/cf-dns-flip-proxy.mjs`](../../scripts/cf-dns-flip-proxy.mjs) to toggle the proxy state for all 19 records at once. Idempotent.

```bash
node scripts/cf-dns-flip-proxy.mjs --env=.env              # default: proxied=true
node scripts/cf-dns-flip-proxy.mjs --env=.env --proxy=off  # back to grey cloud
```

**As of 2026-06-22:** all 19 records flipped to `proxied=true` (orange cloud). Universal SSL on the proxied edge takes 15-90 min to provision after the flip — during that window `curl -sI https://<sub>.api.oriz.in/` will fail TLS (exit 35). HTTP (`curl -sI http://...`) returns `server: cloudflare` immediately.

## 7. Zone-level rules (manual via dashboard)

The DNS-edit-scoped API token can create records but **cannot create Rulesets, Page Rules, Zone Settings, or RUM sites** (all return `403 Authentication error` / `9109 Unauthorized`). Token rotation to a broader scope is deferred. Apply these via the Cloudflare dashboard (zone: `oriz.in`):

**Cache Rule — Cache JSON for 1h** (Rules → Cache Rules → Create)

- Match: `(http.host matches "^.+\.api\.oriz\.in$") and (http.request.uri.path.extension eq "json")`
- Action: Eligible for cache → Override origin → Edge TTL **3600s**, Browser TTL **1800s**.

**Configuration / Zone setting — Always Online** (Caching → Configuration)

- Toggle **Always Online** = On (zone-wide; only the proxied hostnames benefit, so safe for the rest of the zone).

**Response Header Transform Rule — CORS allow-all** (Rules → Transform Rules → Modify Response Header)

- Match: `http.host matches "^.+\.api\.oriz\.in$"`
- Set static header: `Access-Control-Allow-Origin: *`

Reference script that *attempts* the API path (will fail until token is rescoped): [`scripts/cf-zone-rules-api.mjs`](../../scripts/cf-zone-rules-api.mjs).

## 8. Cloudflare Web Analytics (manual via dashboard)

Same token-scope limit applies (`POST /accounts/.../rum/site_info` returns `10000 Authentication error`). Apply manually:

1. CF dashboard → **Analytics & Logs → Web Analytics → Add a site**.
2. Choose **Automatic Setup** (proxied hostname). Hostname: `oriz.in`. Tick "all subdomains".
3. The dashboard wires the beacon automatically via the CF edge (no `<script>` tag to embed — works for any proxied hostname including `*.api.oriz.in`).
4. Dashboard: `https://dash.cloudflare.com/<account_id>/web-analytics`.

Free tier: Web Analytics is free + unlimited for proxied hostnames.

## 9. Free-tier limit usage (as of 2026-06-22)

| Resource | Used | Free tier cap |
|---|---|---|
| DNS records | 19 (all `*.api.oriz.in` CNAMEs) | 1000 |
| Zones on account | 1 (`oriz.in`) | unlimited |
| Page Rules | 0 (using Cache Rules + Transform Rules instead) | 3 |
| Cache Rules | 1 (planned, manual) | 10 |
| Transform Rules | 1 (planned, manual) | 10 |
| Web Analytics sites | 1 (planned, manual) | unlimited |
| Universal SSL | 1 zone | unlimited |

## 10. Verifying the flipped (orange-cloud) edge

```bash
# HTTP (works immediately after flip — confirms CF is in the path):
curl -sI http://fii-dii.api.oriz.in/    # expect: server: cloudflare, CF-RAY header

# HTTPS (works 15-90 min after flip, once Universal SSL provisions):
curl -sI https://fii-dii.api.oriz.in/   # expect: server: cloudflare, HTTP/2 404 (GH Pages 404)
```

If HTTPS still fails (`exit 35` / TLS handshake) after 90 min: check **SSL/TLS → Overview → Encryption mode** in the dashboard. Set to **Flexible** (CF↔origin over HTTP — GH Pages serves the apex CNAME without per-subdomain certs anyway).
