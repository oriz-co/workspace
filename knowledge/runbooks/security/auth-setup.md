---
type: runbook
title: "Auth setup \u2014 log in once, publish + deploy forever"
description: Every login command and dashboard URL needed to publish the @chirag127
  packages and deploy the 11 oriz-family sites. Run these on YOUR terminal. Tokens
  go into envpact (the vault); none of them are pasted into agent chats. Re-run any
  section when a token is rotated.
tags:
- runbook
- auth
- secrets
- publish
- deploy
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- policy/secrets-handling
- runbooks/security/rotate-leaked-secret
---



# Auth setup — log in once, publish + deploy forever

> Run these commands in **your** terminal (Git Bash on Windows, or any POSIX shell).
> An AI agent should not run these because it would mean pasting credentials
> into chat. After each section completes, the relevant tool is authenticated
> on this machine and an agent can use it without seeing the token.

If you're rotating a leaked credential: **revoke first, reissue second, login third.**
The dashboard URL for revocation is at the top of each section.

---

## Inventory

| Tool | Why we need it | Token name | Where it goes |
|---|---|---|---|
| GitHub (`gh`) | push, PR, repo create/rename, workflow_dispatch | `GITHUB_TOKEN` (auto in CI) | gh keyring (already done) |
| npm | publish 6 packages | `NPM_TOKEN` | `~/.npmrc` + envpact |
| Cloudflare (`wrangler`) | deploy 10 sites to Pages, R2 buckets | `CLOUDFLARE_API_TOKEN` + `ACCOUNT_ID` | wrangler config + GH Actions org-secrets + envpact |
| Firebase (`firebase`) | deploy oriz-journal hosting, manage Firestore rules | service account JSON | `FIREBASE_SERVICE_ACCOUNT_ORIZ_APP` GH secret + envpact |
| Turso (`turso`) | the warm-cache for me.oriz.in lifestream | `TURSO_AUTH_TOKEN_*` | envpact + Cloudflare Pages env |
| envpact (`envpact-cli`) | the vault that holds everything else | `ENVPACT_VAULT_TOKEN` | `~/.envpactrc` |
| EmailJS (dashboard) | contact-form delivery | service ID + template ID + public key | envpact |
| Web3Forms (dashboard) | contact-form delivery (alt) | access key | envpact |
| reCAPTCHA v3 (dashboard) | spam protection on contact forms | site key + secret | envpact |
| Cronitor (dashboard) | heartbeat alerts on broken ingesters | per-monitor URLs | envpact |
| Lichess + Last.fm + ListenBrainz + Open Library + Hardcover (dashboards) | lifestream ingest read tokens | various | envpact |

---

## 0. Verify GitHub already works

You're already authenticated with `gh`. Sanity-check:

```bash
gh auth status
```

Should print `✓ Logged in to github.com account chirag127 (keyring)`.
If it doesn't:

```bash
gh auth login --hostname github.com --git-protocol https --web
```

A browser opens. Approve. Done.

---

## 1. npm — publish access

Dashboards: <https://www.npmjs.com/login> · <https://www.npmjs.com/settings/chirag127/tokens>

```bash
npm login
```

Browser flow opens. Authenticate as `chirag127`. After completion:

```bash
npm whoami
# → chirag127
```

If you'd rather use a granular token (recommended for CI):

1. Open <https://www.npmjs.com/settings/chirag127/tokens/granular-access-tokens/new>
2. Token name: `oriz-publish-2026-06`
3. Expiration: 365 days
4. Permissions: **Read and write**
5. Packages: select `@chirag127/firebase-init`, `auth-ui`, `contact-form`, `sidebar`, `oriz-family`, `oriz-kit` once they exist (or "All packages owned by this user" if you want simplicity)
6. Click **Generate**
7. Copy the token, then:
   ```bash
   echo "//registry.npmjs.org/:_authToken=<paste-token-here>" >> ~/.npmrc
   ```
8. Verify: `npm whoami` should print `chirag127`.

**Then store the token in envpact** (see §6) so CI can publish too.

---

## 2. Cloudflare — Pages deploys + R2

Dashboard: <https://dash.cloudflare.com/profile/api-tokens>

### Wrangler login (interactive — easiest)

```bash
npx wrangler@latest login
```

Browser flow. Approve.

```bash
npx wrangler whoami
# → prints account email + ID
```

This is enough for everything you do from your laptop. CI (GitHub Actions) needs a separate API token because it has no browser.

### API token (for CI / GitHub Actions)

1. Open <https://dash.cloudflare.com/profile/api-tokens> → **Create Token**
2. Use the **"Edit Cloudflare Workers"** template (covers Pages too)
3. Add additional permissions if you want R2:
   - Account → Workers R2 Storage → Edit
4. Token name: `oriz-deploy-2026-06`
5. **Save the token immediately** — Cloudflare shows it once.
6. Get your account ID:
   ```bash
   npx wrangler whoami | grep "Account ID"
   ```

Set as GitHub Actions org-level secrets so the master matrix deploy can use them:

```bash
gh secret set CLOUDFLARE_API_TOKEN  --org chirag127 --visibility all --body "<paste-token>"
gh secret set CLOUDFLARE_ACCOUNT_ID --org chirag127 --visibility all --body "<paste-id>"
```

---

## 3. Firebase — oriz-journal hosting + Firestore rules

Dashboards:
- Console: <https://console.firebase.google.com/project/oriz-app/overview>
- Service accounts: <https://console.firebase.google.com/project/oriz-app/settings/serviceaccounts/adminsdk>

### Local CLI

```bash
npm install -g firebase-tools
firebase login
```

Browser flow.

```bash
firebase projects:list
# → should include oriz-app
firebase use oriz-app
```

### Service account JSON (for CI)

1. Console → ⚙ → Project settings → **Service accounts** tab
2. Click **Generate new private key** → downloads a JSON file
3. Save as `~/secrets/firebase-oriz-app-2026-06.json` (out of any git repo!)
4. Push as a GitHub secret:
   ```bash
   gh secret set FIREBASE_SERVICE_ACCOUNT_ORIZ_APP \
     --repo chirag127/oriz \
     --body "$(cat ~/secrets/firebase-oriz-app-2026-06.json)"
   ```
5. Delete the local JSON file once it's in envpact + the GH secret:
   ```bash
   rm ~/secrets/firebase-oriz-app-2026-06.json
   ```

Public Firebase config (`PUBLIC_FIREBASE_*` env vars used in client bundles):

1. Console → ⚙ → Project settings → **General** tab → scroll to **Your apps**
2. Pick the web app → SDK setup and configuration → Config
3. Copy the JSON; the values map 1:1 to env var names:
   ```
   apiKey            → PUBLIC_FIREBASE_API_KEY
   authDomain        → PUBLIC_FIREBASE_AUTH_DOMAIN  (= auth.oriz.in)
   projectId         → PUBLIC_FIREBASE_PROJECT_ID   (= oriz-app)
   storageBucket     → PUBLIC_FIREBASE_STORAGE_BUCKET
   messagingSenderId → PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   appId             → PUBLIC_FIREBASE_APP_ID
   ```
4. Store these in envpact (§6). They're safe in client bundles — that's why they're prefixed `PUBLIC_`.

---

## 4. Turso — lifestream warm cache for me.oriz.in

Dashboard: <https://app.turso.tech/>

```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso auth signup    # or `turso auth login` if you already have an account
turso db create lifestream
turso db tokens create lifestream                   # write token (server-only)
turso db tokens create lifestream --read-only       # read token (browser-safe)
turso db show lifestream                            # prints the libsql:// URL
```

You now have three values:
- `PUBLIC_TURSO_DB_URL` — the `libsql://` URL
- `TURSO_AUTH_TOKEN_WRITE` — the write token (NEVER prefix `PUBLIC_*`)
- `PUBLIC_TURSO_AUTH_TOKEN_READ` — the read token (browser-safe)

Store all three in envpact under the `oriz-me` project (§6). The me.oriz.in
Cloudflare Pages env reads these at build time + edge runtime.

---

## 5. envpact — the vault that holds everything else

Repo: <https://github.com/chirag127/envpact-cli>
Dashboard: <https://github.com/chirag127/envpact-secrets> (private)

```bash
npm install -g envpact-cli
envpact login
```

Browser flow → GitHub OAuth.

### Setting a secret

```bash
cd /path/to/oriz-family-site         # any repo with an envpact project ID
envpact set NPM_TOKEN <paste-value>
envpact set CLOUDFLARE_API_TOKEN <paste-value>
# ...etc
```

### Reading secrets into a local .env

```bash
npx envpact-cli@latest               # writes .env from the vault
```

This is the line in AGENTS.md every site already has. You don't need to do this manually most of the time — `prebuild` scripts do it.

### CI integration

In GitHub Actions, the family already uses `chirag127/envpact-action@v0`:

```yaml
- uses: chirag127/envpact-action@v0
  with: { project: ${{ matrix.site }} }
  env: { ENVPACT_VAULT_TOKEN: ${{ secrets.ENVPACT_VAULT_TOKEN }} }
```

The org-level `ENVPACT_VAULT_TOKEN` secret needs to exist:

```bash
gh secret set ENVPACT_VAULT_TOKEN --org chirag127 --visibility all --body "<paste-vault-token>"
```

The vault token comes from <https://github.com/chirag127/envpact-secrets> →
Settings → Personal access token (or whatever envpact's docs say currently —
check the README of envpact-cli; this is the single source of truth).

---

## 6. EmailJS — contact form delivery

Dashboard: <https://dashboard.emailjs.com/>

1. Create an account (free tier: 200 emails/month).
2. Add a service (Gmail, Outlook, custom SMTP).
3. Create a template. Use placeholders `{{from_name}} {{from_email}} {{subject}} {{message}}`.
4. Note three values:
   - **Service ID** (e.g. `service_a1b2c3`)
   - **Template ID** (e.g. `template_x1y2z3`)
   - **Public Key** (e.g. `abc123def`)
5. Store in envpact:
   ```bash
   envpact set PUBLIC_EMAILJS_SERVICE_ID  service_a1b2c3
   envpact set PUBLIC_EMAILJS_TEMPLATE_ID template_x1y2z3
   envpact set PUBLIC_EMAILJS_PUBLIC_KEY  abc123def
   ```

These are safe to expose in browser bundles (that's why `PUBLIC_*`) — EmailJS rate-limits per public key.

---

## 7. Web3Forms — contact form delivery (alt)

Dashboard: <https://web3forms.com/>

Some sites use Web3Forms instead of EmailJS (`@chirag127/contact-form` package supports it natively).

1. Sign up with the email you want to receive form submissions on.
2. Create an access key. (Free, unlimited.)
3. Store in envpact (per-site):
   ```bash
   envpact set --project oriz-blog       PUBLIC_WEB3FORMS_KEY <paste-key>
   envpact set --project oriz-finance    PUBLIC_WEB3FORMS_KEY <paste-key>
   # ... etc per site that has a contact form
   ```

The key is **safe in browser bundles** because Web3Forms validates the
domain it was submitted from on the server side. Do NOT need to gate it.

---

## 8. reCAPTCHA v3 — spam protection (optional)

Dashboard: <https://www.google.com/recaptcha/admin/create>

1. Type: reCAPTCHA v3
2. Domains: `oriz.in`, `me.oriz.in`, `blog.oriz.in`, etc. (one entry per site or a wildcard if Google allows)
3. Note two values:
   - **Site key** (public, used in browser)
   - **Secret key** (server-only, used in Pages Functions)
4. Store in envpact:
   ```bash
   envpact set PUBLIC_RECAPTCHA_SITE_KEY <paste-site-key>
   envpact set RECAPTCHA_SECRET_KEY     <paste-secret-key>
   ```

Used by `functions/api/verify-recaptcha.ts` in each site that opts in.

---

## 9. Cronitor — heartbeat alerts (optional, free 5 monitors)

Dashboard: <https://cronitor.io/>

1. Sign up (free tier).
2. Create monitors for: `daily-build`, `sync-firestore`, `snapshot-weekly`, `build-resume`, plus ingesters.
3. Each monitor has a **ping URL** (e.g. `https://cronitor.link/p/<id>/daily-build`).
4. Store the ping URLs in envpact:
   ```bash
   envpact set CRONITOR_DAILY_BUILD     https://cronitor.link/p/.../daily-build
   envpact set CRONITOR_SYNC_FIRESTORE  https://cronitor.link/p/.../sync-firestore
   ```

Add a final `curl -fsSL "$CRONITOR_..."` step in each GH Actions workflow.
Failures DM you; absent pings DM you (heartbeat semantics).

---

## 10. Lifestream ingest read tokens (me.oriz.in only)

Each ingester needs read access to one external service. Get a token, store in envpact under the `oriz-me` project, NOT the master project.

| Service | Where | What kind of token |
|---|---|---|
| Last.fm | <https://www.last.fm/api/account/create> | API key (read-only by default) |
| ListenBrainz | <https://listenbrainz.org/profile/> | User token |
| Lichess | <https://lichess.org/account/oauth/token> | Read-only OAuth token |
| Open Library | (no token needed for reads) | — |
| Hardcover | <https://hardcover.app/account/api> | API token |
| simkl | <https://simkl.com/settings/developer> | Client ID + secret |
| AniList | <https://anilist.co/api/v2/oauth/client> | Client ID for OAuth |
| Steam Web | <https://steamcommunity.com/dev/apikey> | API key |
| Strava | <https://www.strava.com/settings/api> | OAuth (paywalled for new devs since 2025; use Fitbit fallback) |
| Fitbit | <https://dev.fitbit.com/apps/new> | OAuth refresh token |
| GitHub webhooks | per-repo Settings → Webhooks | webhook secret (for HMAC validation) |

```bash
cd /c/D/oriz/repos/oriz/own/prod/apps/personal/oriz-cs-me-app
envpact set LASTFM_API_KEY            <paste>
envpact set LISTENBRAINZ_USER_TOKEN   <paste>
envpact set LICHESS_TOKEN             <paste>
envpact set HARDCOVER_TOKEN           <paste>
envpact set SIMKL_CLIENT_ID           <paste>
envpact set ANILIST_CLIENT_ID         <paste>
envpact set STEAM_API_KEY             <paste>
envpact set FITBIT_CLIENT_ID          <paste>
envpact set FITBIT_CLIENT_SECRET      <paste>
envpact set FITBIT_REFRESH_TOKEN      <paste>
envpact set GITHUB_WEBHOOK_SECRET     <paste>
```

Per the self-healing ingester contract, none of these go into code.
Each ingester reads them from the env binding at runtime.

---

## 11. Lanyard (Discord presence) — me.oriz.in /api/now (optional)

Dashboard: <https://discord.com/developers/applications>

1. Join the public Lanyard Discord server: <https://discord.gg/UrXF2cfJ7F>
2. Get your Discord user ID: enable Developer Mode in Discord → right-click your avatar → Copy User ID
3. No token needed — Lanyard's API is public for users in the bot's server.
4. Store the user ID:
   ```bash
   cd /c/D/oriz/repos/oriz/own/prod/apps/personal/oriz-cs-me-app
   envpact set DISCORD_USER_ID <paste-user-id>
   ```

---

## Order to do this in (first time)

If you're starting from zero and want everything wired:

1. ✓ §0 GitHub (already done)
2. §5 envpact — get the vault working first; everything else stores into it
3. §1 npm — so `oriz-kit` and the 5 packages can publish
4. §2 Cloudflare — wrangler + GH Actions secrets so the deploy matrix works
5. §3 Firebase — needed for oriz-journal hosting + auth on every site
6. §6 EmailJS or §7 Web3Forms — pick one for contact forms
7. §4 Turso — only if you're starting the lifestream lifelong project on me.oriz.in
8. §10 lifestream ingest tokens — only when you wire each ingester
9. §8 reCAPTCHA, §9 Cronitor, §11 Lanyard — defer until specific features need them

**Stop after §1–§3** if you just want "publish the packages + deploy the sites once."
Everything from §4 onwards is for specific features.

---

## After auth, what an agent CAN do without seeing tokens

Once these commands have been run on your machine:

| Command | Reads which auth | Agent can run? |
|---|---|---|
| `gh repo create / rename / delete` | gh keyring | yes (with per-action confirm) |
| `gh workflow run` | gh keyring | yes |
| `git push origin main` | gh credential helper / SSH | yes |
| `npm publish` | `~/.npmrc` | yes |
| `npx wrangler pages deploy` | wrangler config | yes |
| `firebase deploy` | firebase login | yes |
| `turso db ...` | turso auth | yes |
| `envpact set / get` | `~/.envpactrc` | yes |

The agent never sees the actual token strings. It just runs the command;
the underlying tool reads its own credential store.

---

## Rotation cheatsheet (when a credential leaks)

If you suspect any token is compromised — e.g. you pasted it into a chat
window — revoke + reissue in this order:

1. **Revoke** at the dashboard URL listed at the top of the relevant section above.
2. **Reissue** a fresh token at the same dashboard.
3. **Re-login locally** (`npm login`, `wrangler login`, `firebase login`, etc.) OR overwrite the stored token (e.g. `~/.npmrc`).
4. **Update envpact** so CI gets the new value: `envpact set <NAME> <new-token>`.
5. **Verify** with the tool's whoami / sanity-check command from the section above.
6. (Optional) **Audit** the dashboard's recent-activity log for any uses of the old token between leak and revocation.

A leaked token is not an emergency if you rotate within minutes. It IS an
emergency if you find it in a transcript a week later. Habit: treat any
token that has ever entered a chat as compromised.

---

## What this runbook does NOT cover

- **DNS / domain registration** — Cloudflare Registrar UI; not scriptable.
- **AdSense / Ezoic monetisation** — out of scope until commercial phase.
- **Mailing list providers** (Buttondown, ConvertKit) — defer until newsletter ships.
- **App Store / Play Store** — me.oriz.in is web-only.

Add sections here as new tools come online.
