# DNS fix plan — login.oriz.in + api.oriz.in

Diagnosis date: 2026-06-25. Read-only investigation; no DNS changes were made.

---

## login.oriz.in

### Current state

```
$ nslookup login.oriz.in
Server:  wdf-dns-01.ddi.sap.corp
*** wdf-dns-01.ddi.sap.corp can't find login.oriz.in: Non-existent domain
```

NXDOMAIN at authoritative + resolver level. No CNAME, no A/AAAA record on the `oriz.in` Cloudflare zone (`fe8da3c9dd0cb1f1d964e3a94d6098b3`). The CF audit dated 2026-06-23 (`knowledge/runbooks/cf-dns-audit-2026-06-23.md`) enumerates all 73 records in the zone and `login.oriz.in` is absent.

Repo-side state in `c:\D\oriz\repos\auth\`:

- `wrangler.toml` — Pages project name `oriz-auth-app`, no `route`/`custom_domains` block.
- `astro.config.mjs` — `site: 'https://auth.oriz.in'` (the **old** domain, not `login.oriz.in`).
- `README.md` — "deploys to Cloudflare Pages (project `oriz-auth-app`)" — describes the *previous* `auth.oriz.in` topology.
- `public/CNAME` — does not exist (only `public/_redirects` + `.gitkeep`).
- No GitHub Actions workflow files for Pages deploy; deploy is manual via `pnpm deploy:pages`.
- No Cloudflare Worker exists for the `login.oriz.in` flow — the decision file at `knowledge/decisions/architecture/security/auth-firebase-login-account-2026-06-25.md` describes one (`auth-worker.oriz.in` or routed via `api.oriz.in/auth/*`), but the worker source is not in the repo.

### Root cause

**The infrastructure was never built.** Today's decision split (Firebase Auth → `login.oriz.in` + `account.oriz.in`) was locked 2026-06-25 and superseded the same day by the Clerk decision (`auth-clerk-emergency-migrate-2026-06-25.md`). Neither flow ever wired up:

- No DNS record for `login.oriz.in` at Cloudflare.
- No Cloudflare Pages project (or GH Pages repo) bound to that hostname.
- The auth repo on disk is still configured for the *old* `auth.oriz.in` topology (Astro site var, README, Pages project name `oriz-auth-app`).
- Clerk DNS (`accounts.oriz.in`, `clerk.oriz.in`, DKIMs, mail) **is** wired up (visible in the 2026-06-23 audit) — so part of the Clerk migration shipped, but the `login.oriz.in` shell did not.

### Fix steps

Two-stage plan. Stage 1 unblocks the user; Stage 2 aligns infra with the active Clerk decision.

**Stage 1 — pick a target host and add the CNAME** (decision needed first):

1. Decide what `login.oriz.in` should point at, given Clerk is now the active provider:
   - **Option A (preferred per active decision):** build a thin Astro shell that embeds Clerk's `<SignIn/>`, deploy to Cloudflare Pages as a new project `oriz-login-app`, bind `login.oriz.in` as the custom domain. The `c:\D\oriz\repos\auth\` repo is the natural place — rename or repurpose.
   - **Option B (fastest):** point `login.oriz.in` directly at Clerk's hosted sign-in (e.g. `accounts.oriz.in` already CNAME's to `accounts.clerk.services`). Use a 301 redirect from `login.oriz.in` → `accounts.oriz.in/sign-in` via a CF Page Rule or Bulk Redirect. Avoids any new Pages project.
2. **For Option A**, in the auth repo:
   - Update `astro.config.mjs`: `site: 'https://login.oriz.in'`.
   - Create `public/CNAME` containing `login.oriz.in` (only needed for GH Pages; for CF Pages the binding is in the dashboard).
   - In `wrangler.toml`, rename `name = "oriz-auth-app"` → `"oriz-login-app"` (or whatever Pages project you create).
   - `pnpm deploy:pages` once to publish `dist/` to the new Pages project.
   - CF dashboard → Workers & Pages → `oriz-login-app` → Custom domains → **Set up a custom domain** → enter `login.oriz.in`. Cloudflare automatically creates the proxied CNAME record in the `oriz.in` zone.
3. **For Option B**, no Pages project needed:
   - CF dashboard → DNS → Records → **Add record**
     - Type: `CNAME`
     - Name: `login`
     - Target: `accounts.oriz.in` (or directly `accounts.clerk.services`)
     - Proxy status: Proxied (orange cloud) — required for the redirect rule below.
   - CF dashboard → Rules → Redirect Rules → **Create rule**
     - When incoming request matches: `(http.host eq "login.oriz.in")`
     - Then: Static redirect → `https://accounts.oriz.in/sign-in` → 301 Permanent → Preserve query string.

### Verification

```bash
# DNS exists:
curl -s "https://cloudflare-dns.com/dns-query?name=login.oriz.in&type=A" \
  -H "accept: application/dns-json" | jq

# TLS handshake + HTTP/2 served:
curl -sI https://login.oriz.in/
# Option A expected: HTTP/2 200, server: cloudflare, served by CF Pages
# Option B expected: HTTP/2 301, location: https://accounts.oriz.in/sign-in

# Browser check:
# Open https://login.oriz.in in incognito — Option A shows the sign-in shell;
# Option B redirects to accounts.oriz.in/sign-in.
```

### Risk

- **Low if Option B.** Touching only DNS + a redirect rule; instantly reversible by deleting the record. The orange-cloud proxy gives Universal SSL automatically (1-level subdomain — covered).
- **Medium if Option A.** Building a new Pages project + Clerk integration introduces code paths that need a Clerk publishable key in `.env` and CSP rules. If the Pages build is broken, `login.oriz.in` resolves to a 522 / blank page until fixed.
- **Blast radius is contained** — no other oriz subdomain depends on `login.oriz.in` today (the universal account widget hasn't been wired into any app yet; grep confirms no production code redirects to `login.oriz.in`).

### Time estimate

- Option B: **15 minutes** (one CNAME + one redirect rule, both in dashboard).
- Option A: **2-3 hours** (Astro shell + Clerk SDK + Pages project + CSP tuning + custom domain provisioning lag).

---

## api.oriz.in

### Current state

```
$ nslookup api.oriz.in
Server:  wdf-dns-01.ddi.sap.corp

Name:    api.oriz.in
Addresses:  2606:4700:3037::ac43:bf0e
            2606:4700:3033::6815:5465
            188.114.96.3
            188.114.97.3
```

Resolves to Cloudflare anycast IPs (proxied), but the browser reports **"CNAME Cross-User Banned"** when actually hitting the hostname.

Per the CF DNS audit (`knowledge/runbooks/cf-dns-audit-2026-06-23.md`, section 2):

| DNS hostname | DNS target |
|---|---|
| `api.oriz.in` | `apis.chirag127.workers.dev` |

The CNAME points at a **Cloudflare Worker on the `chirag127` (personal) account**, while the `oriz.in` zone lives on the `oriz-org` (fleet) account. Cloudflare blocks proxied CNAMEs that cross account boundaries unless the target account has explicitly enabled "Custom Hostnames" / "SSL for SaaS" (Enterprise feature) for the source zone. That's the exact trigger for "CNAME Cross-User Banned" (CF error code 1014).

The worker target `apis.chirag127.workers.dev` is **not referenced anywhere** in the workspace — `grep -r "apis.chirag127.workers.dev"` returns hits only in the audit runbook itself. It's a dangling orphan from the pre-org-migration era (when fleet ownership was still on the `chirag127` personal account, per memory `fleet-owner-oriz-org`).

The audit also notes the `oriz-org` account hosts a **separate** record `apis.oriz.in → apis-web.pages.dev` (a CF Pages directory site, plural "apis"). That's the working API directory; `api.oriz.in` (singular) is the broken one.

### Root cause

**Dangling cross-account CNAME left behind by the `chirag127 → oriz-org` fleet migration.** The `api.oriz.in` record targets a Worker on the old (personal) Cloudflare account; CF refuses to proxy because the source zone is now on a different account.

The active API hosting strategy is the "triple-rail" — `*.api.oriz.in/<name> → chirag127.github.io` per repo. There is **no design role for a bare `api.oriz.in` apex**; nothing in `family-data.ts`, `FAMILY_APIS`, or any app's runtime config calls `api.oriz.in/...`. The only references to `api.oriz.in` (singular) in `knowledge/` are:

- The audit listing it as an orphan candidate.
- The Firebase auth decision speculating about `api.oriz.in/auth/*` routing — never built.

### Fix steps

1. Decide whether `api.oriz.in` (singular) has any current role. Three viable answers:
   - **(a) None — delete the record.** Recommended, given the audit's orphan-candidate flag and zero workspace references.
   - **(b) Repoint to the API directory.** If you want `api.oriz.in` to alias the working `apis.oriz.in`, CNAME it to `apis-web.pages.dev` (same target as `apis.oriz.in`) so both singular and plural land on the directory.
   - **(c) Repoint to a real worker on the oriz-org account.** Only if you actually plan to run a Hono umbrella worker (per `knowledge/decisions/architecture/compute/hono-worker-api-umbrella.md`) — but that decision is currently dormant per the "no CF Workers for APIs" mandate in `api-hosting-triple-rail.md`.

2. **For Option (a) — delete (preferred):**
   - CF dashboard → DNS → Records → find `api.oriz.in` → **Delete**.
   - Confirm prompt; record removed; propagation <1 min via CF's authoritative NS.

3. **For Option (b) — repoint:**
   - CF dashboard → DNS → Records → find `api.oriz.in` → **Edit**.
   - Change target from `apis.chirag127.workers.dev` → `apis-web.pages.dev`.
   - Proxy: Proxied (orange) — `apis-web.pages.dev` is on the same `oriz-org` account, so the cross-user ban won't trigger.
   - In the CF Pages project `apis-web`, add `api.oriz.in` as an additional custom domain so the Pages SSL cert covers it (otherwise visitors hit a cert mismatch).

### Verification

```bash
# After delete (option a):
curl -s "https://cloudflare-dns.com/dns-query?name=api.oriz.in&type=CNAME" \
  -H "accept: application/dns-json" | jq
# Expect: "Status": 3 (NXDOMAIN) or empty Answer section.

# After repoint (option b):
curl -sI https://api.oriz.in/
# Expect: HTTP/2 200 (or 301/302 to apis.oriz.in if the Pages app redirects),
#         server: cloudflare, valid TLS cert covering api.oriz.in.

# Browser: open https://api.oriz.in — should NO LONGER show "CNAME Cross-User Banned".
```

### Risk

- **Negligible.** Nothing in the workspace consumes `api.oriz.in` today; the audit flagged it as orphan. Deleting only removes a broken record.
- Repoint (option b) has a 15-90 min SSL provisioning lag while the Pages cert extends to cover the new hostname.
- Blast radius: **zero known external dependents** (this is internal infra, not a published API surface).

### Time estimate

- Option (a) delete: **2 minutes** (single dashboard click).
- Option (b) repoint + Pages custom domain: **15-30 minutes** plus 15-90 min cert provisioning wait.

---

## Underlying issue analysis

Both failures share a single root cause: **the 2026-06-22/23 fleet migration from the `chirag127` personal Cloudflare account to the `oriz-org` account left dangling cross-account references, and DNS+Pages provisioning is not yet under infrastructure-as-code**. `api.oriz.in` is a literal cross-account CNAME leftover from the pre-migration topology; `login.oriz.in` is the inverse — the active decision exists in `knowledge/` but no one (human or agent) has executed the corresponding DNS + Pages project creation, because the deploy path is dashboard-driven plus an ad-hoc `pnpm deploy:pages` rather than a `Makefile`/CI workflow that enforces "decision-in-knowledge ⇒ DNS record + Pages project on disk." The `knowledge/runbooks/cf-dns-add-api-subdomain.md` runbook codifies the `*.api.oriz.in` rail nicely via `scripts/cf-dns-set-api-cnames.mjs`, but there is no equivalent script for non-API subdomains (apps, auth, dashboards), so each new app subdomain is a manual dashboard ritual that drifts from the decision log. The structural fix is a second IaC script — call it `scripts/cf-dns-set-app-cnames.mjs` — that reads `FAMILY_APPS` (plus `login`/`account` for auth) and reconciles the `oriz.in` zone against the registry. That same script would, on next run, both add the missing `login.oriz.in` record and surface the `api.oriz.in` orphan for explicit triage.
