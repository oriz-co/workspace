# Deploy runbook — oriz family

End-to-end checklist for deploying every oriz site, binding domains, and
publishing the family at oriz.in.

> Most steps are CLI-driven. Where the dashboard is unavoidable (DNS at the
> registrar, Firebase Auth provider toggles), the URL is given inline.

## 0. One-time prerequisites

```bash
# Authenticate every CLI you'll need
gh auth login                   # GitHub
gh auth refresh -h github.com -s delete_repo  # if you ever need to delete repos
firebase login                  # Firebase
wrangler login                  # Cloudflare
```

You must own:
- The `oriz.in` domain (already registered).
- A Cloudflare account with `oriz.in` added as a zone.
- The `oriz-app` Firebase project (already created in this session).
- The `chirag127/envpact-secrets` private vault (already exists).

## 1. Mint the envpact PAT (one-time)

The envpact-action in CI needs a fine-grained PAT with read access to the
private vault.

1. Go to <https://github.com/settings/personal-access-tokens/new>.
2. Resource owner: `chirag127`.
3. Repository access: **Only select repositories** → `chirag127/envpact-secrets`.
4. Repository permissions: **Contents: Read-only**, **Metadata: Read-only**.
5. Expiration: 90 days. Calendar reminder to rotate.
6. Save the PAT.

Make it available org-wide so every oriz-* repo's CI inherits:

```bash
gh secret set ENVPACT_VAULT_TOKEN --org chirag127 --visibility all --body "<pat>"
```

Also export locally for your dev machine:

```bash
# Windows (PowerShell)
setx ENVPACT_VAULT_TOKEN "<pat>"
# Linux/macOS
echo 'export ENVPACT_VAULT_TOKEN="<pat>"' >> ~/.zshenv
```

## 2. Firebase Auth — enable providers

The oriz-app Firebase project exists but providers are off by default.
Open <https://console.firebase.google.com/project/oriz-app/authentication/providers>
and enable:

- **Google** (primary). Set the support email to your Google account.
- **GitHub**. Generate the OAuth app at <https://github.com/settings/developers> →
  New OAuth App → Homepage `https://oriz.in`, Authorization callback
  `https://oriz-app.firebaseapp.com/__/auth/handler`. Copy clientId + secret
  into Firebase.
- **Email link (passwordless)**. Toggle on.
- **Anonymous**. Toggle on.

## 3. Firebase Auth — authorized domains

Same settings page, **Authorized domains** → add:

- `oriz.in`
- `blog.oriz.in`
- `books.oriz.in`
- `book-lore.oriz.in`
- `financial-cards.oriz.in`
- `finance.oriz.in`
- `image.oriz.in`
- `journal.oriz.in`
- `pdf.oriz.in`
- `urls-to-md.oriz.in`
- `auth.oriz.in` (custom auth domain target)
- `localhost` (dev)

## 4. Firebase Auth — custom auth domain (auth.oriz.in)

Required so a single sign-in works across every `*.oriz.in` subdomain.

1. <https://console.firebase.google.com/project/oriz-app/authentication/settings>
   → **Custom domain** → Add custom domain → enter `auth.oriz.in`.
2. Firebase prints a TXT record. Add it at your DNS provider (Cloudflare DNS
   for `oriz.in`):

   ```
   Type: TXT
   Name: auth
   Content: <whatever Firebase shows>
   TTL: Auto
   Proxy: DNS only (grey cloud)
   ```

3. Wait for verification (10 min – 24 h).
4. Firebase prints a CNAME / A record. Add it the same way (DNS only, grey
   cloud — Firebase needs to terminate TLS).

5. Once green, update the `PUBLIC_FIREBASE_AUTH_DOMAIN` value in the envpact
   shared block from `oriz-app.firebaseapp.com` to `auth.oriz.in`. Already
   done in this session.

## 5. Firestore — initialize the database

```bash
firebase firestore:databases:create '(default)' \
  --location asia-south1 \
  --project oriz-app
```

Then deploy rules from the `oriz-home` repo (canonical):

```bash
cd sites/oriz-home
firebase deploy --only firestore:rules,firestore:indexes --project oriz-app
```

The rules at `oriz-home/firestore.rules` enforce per-site collection scoping
and owner-only writes.

## 6. Cloudflare DNS — subdomain CNAMEs

For each `*.oriz.in` subdomain, add a CNAME pointing at Cloudflare Pages
(orange cloud, proxied). Pages binding is in step 8.

```
oriz.in              CNAME  oriz-home.pages.dev          (proxy on)
www.oriz.in          CNAME  oriz-home.pages.dev          (proxy on)
blog.oriz.in         CNAME  oriz-blog.pages.dev          (proxy on)
books.oriz.in        CNAME  oriz-books.pages.dev         (proxy on)
book-lore.oriz.in    CNAME  oriz-book-lore.pages.dev     (proxy on)
financial-cards.oriz.in  CNAME  oriz-financial-cards.pages.dev   (proxy on)
finance.oriz.in      CNAME  oriz-finance.pages.dev       (proxy on)
image.oriz.in        CNAME  oriz-image-tools.pages.dev   (proxy on)
img.oriz.in          CNAME  oriz-image-tools.pages.dev   (proxy on; secondary)
pdf.oriz.in          CNAME  oriz-pdf-tools.pages.dev     (proxy on)
urls-to-md.oriz.in   CNAME  oriz-urls-to-md.pages.dev    (proxy on)
```

Exception: `journal.oriz.in` is on Firebase Hosting:

```
journal.oriz.in      CNAME  oriz-app.web.app              (proxy off — DNS only)
```

(or whatever target Firebase prints when you add the custom domain in step 9.)

## 7. Per-site secrets — pull via envpact

For each cloned site, generate the local `.env` and the GitHub Actions
secrets:

```bash
cd sites/<site>
npx envpact-cli@0.2.0          # → writes .env
npx envpact-cli@0.2.0 --github  # → mirrors .env to GitHub Actions secrets
```

(Once envpact-cli@0.3.0 ships with v3 vault support, use it instead.
Until then, the v3 vault edit happens manually via direct git push to
`chirag127/envpact-secrets`.)

## 8. Deploy each Cloudflare Pages site

For oriz-home (master landing) and the 8 other Cloudflare-hosted sites:

```bash
cd sites/<site>
pnpm install
pnpm build
pnpm deploy   # = wrangler pages deploy dist --project-name <site>
```

First deploy creates the `<site>.pages.dev` project.

Then bind the custom domain:

```bash
wrangler pages domain add <subdomain>.oriz.in --project-name <site>
# e.g.:
wrangler pages domain add oriz.in       --project-name oriz-home
wrangler pages domain add blog.oriz.in  --project-name oriz-blog
wrangler pages domain add books.oriz.in --project-name oriz-books
# … and so on for each Cloudflare site
```

Wait ~30 s for DNS propagation. Then visit the domain to confirm.

## 9. Deploy oriz-journal (Firebase Hosting)

```bash
cd sites/oriz-journal
pnpm install
pnpm build
firebase deploy --only hosting --project oriz-app
```

Add the custom domain:
<https://console.firebase.google.com/project/oriz-app/hosting/main> → Add
custom domain → `journal.oriz.in`. Firebase prints DNS records to add at
Cloudflare DNS (DNS-only mode for the Firebase records; Firebase terminates
TLS).

## 10. AdSense submission

1. Visit <https://www.google.com/adsense> and sign up.
2. Add `oriz.in` as your site.
3. Wait for Google to crawl and approve. Typical wait 1–14 days.
4. Once approved, get the `ca-pub-XXXXXXXXXX` publisher ID.
5. Add it to envpact as `PUBLIC_ADSENSE_CLIENT` in the shared block.
6. Re-run `npx envpact-cli@0.2.0` in each site, rebuild, redeploy.
   Every site picks up AdSense automatically via the AdSlot component
   (which renders nothing until both PUBLIC_ADSENSE_CLIENT and a slotId
   are present).

## 11. CI — automatic deploys on push

Each site's `.github/workflows/deploy.yml` (already scaffolded) runs on push
to main. It:

1. `actions/checkout@v4`
2. `chirag127/envpact-action@v0` with `vault-token: ${{ secrets.ENVPACT_VAULT_TOKEN }}` → hydrates env vars.
3. `pnpm install --frozen-lockfile`
4. `pnpm build`
5. `cloudflare/wrangler-action@v3` → `wrangler pages deploy dist`. (Or `firebase deploy --only hosting` for journal.)

Cloudflare API token + account id required as repo secrets:

```bash
# Mint at https://dash.cloudflare.com/profile/api-tokens with the
# "Cloudflare Pages — Edit" template
gh secret set CLOUDFLARE_API_TOKEN  --org chirag127 --visibility all --body "<token>"
gh secret set CLOUDFLARE_ACCOUNT_ID --org chirag127 --visibility all --body "<account-id>"
```

For Firebase deploys (oriz-journal):

```bash
# Generate a Firebase CI token (legacy but still works)
firebase login:ci
gh secret set FIREBASE_TOKEN --repo chirag127/oriz-journal --body "<token>"
```

## 12. Sanity checks per site

After deploy, hit each URL and confirm:

- [ ] Page loads with `dark` theme + `amber` accent (the defaults).
- [ ] Theme switcher in header changes the page (try `light`, `sepia`, `hc`).
- [ ] Accent picker changes the highlight color.
- [ ] `/account/` shows the sign-in panel; Google sign-in works.
- [ ] After signing in on one subdomain, visiting another subdomain shows
      you're already signed in (this only works once `auth.oriz.in` custom
      auth domain is live and DNS-verified).
- [ ] `/legal/privacy/`, `/legal/terms/`, etc. all render.
- [ ] `/contact/` form posts to Web3Forms (will only work once
      `PUBLIC_WEB3FORMS_KEY` is in envpact).
- [ ] `view-source:<url>` shows the JSON-LD `<script type="application/ld+json">`.
- [ ] Lighthouse mobile ≥ 90 (target 95).

## 13. Rollback

Each site is a pure static deploy of `dist/`. Rollback = redeploy the
previous git SHA:

```bash
cd sites/<site>
git checkout <old-sha> -- .
pnpm build
pnpm deploy
git checkout main -- .   # restore working tree
```

Or via Cloudflare Pages dashboard → Deployments → Rollback to previous
deployment (one click, no rebuild).

## 14. Outstanding manual items

Things this runbook can't automate:

- DNS records at the registrar (Cloudflare DNS, but you must add the records).
- Firebase Console toggles (provider enable, authorized domains, custom auth
  domain TXT record).
- AdSense submission and approval.
- The first `pnpm install` per site (CI handles subsequent ones).
