---
type: rule
title: "GitHub Actions secrets live at chirag127 org level \u2014 never per-repo"
description: "Every GitHub Actions secret used by any chirag127/oriz* repo is set\
  \ ONCE at the chirag127 org level with `gh secret set --org chirag127 --visibility\
  \ all`. Per-repo secret writes are forbidden \u2014 they cause drift the same way\
  \ per-repo .env.example edits do. Doppler stays the source of truth; org-level GH\
  \ secrets are the runtime mirror."
tags:
- rules
- github
- secrets
- org-level
- ci
- sync
- drift
- doppler
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- rules/security/env-example-synced-from-master
- rules/interaction/never-hit-quotas
- rules/interaction/no-card-on-file
- rules/security/no-hardcoded-secrets
- services/secrets/doppler
- services/secrets/github-secrets
- decisions/security/env-and-secrets-single-source
- decisions/security/secrets-management-doppler
- runbooks/security/set-github-org-level-secrets
- runbooks/security/rotate-leaked-secret
---



# GitHub Actions secrets live at chirag127 org level — never per-repo

## The rule

1. **All GitHub Actions secrets live at the `chirag127` ORG level.**
   Set once with:

    ```bash
    gh secret set <NAME> --org chirag127 --visibility all
    ```

   Every repo in the org inherits them automatically. CI in
   `oriz-blog-site`, `oriz-finance-site`, `oriz-omnipost`,
   `oriz-lifestream`, every browser extension, every VS Code
   extension reads the same `${{ secrets.<NAME> }}` from the same
   place.
2. **Per-repo secret writes are forbidden.**
   `gh secret set <NAME> --repo chirag127/<repo>` is NOT allowed for
   secrets that exist in `templates/.env.example`. Per-repo writes
   defeat the no-drift posture the same way per-repo `.env.example`
   edits do (see [sibling rule](./env-example-synced-from-master.md)).
3. **Environment-scoped secrets within a repo are NOT used yet.**
   No `gh secret set --env <env-name>` calls. If a future need lands
   (separate secrets for `staging` vs `prod` deploys in one repo),
   it is a new decision — re-open this rule, don't silently add an
   env scope.
4. **Visibility = `all` for shared keys** (Sentry DSN, Doppler service
   token, Cloudflare API token, Algolia keys, Razorpay, Lemon
   Squeezy, Resend, Knock, etc — every key in
   [`templates/.env.example`](../../templates/.env.example) by
   default).
5. **Visibility = `selected` for repo-narrow keys** when a key is
   genuinely scoped to a known subset of repos (example:
   `CHROME_WEBSTORE_*` / `AMO_JWT_*` / `EDGE_PARTNER_*` /
   `OPEN_VSX_TOKEN` / `VSCE_PAT` are only used by extension repos
   and the `oriz-omnipost`-style publishers — `--visibility selected
   --repos <comma list>` is acceptable). Document the repo list in
   the runbook, not in this rule.
6. **Doppler stays upstream.**
   [Doppler](../../services/secrets/doppler.md) is the canonical source
   of truth per
   [`decisions/security/secrets-management-doppler.md`](../../decisions/security/secrets-management-doppler.md).
   Org-level GH secrets are the **downstream runtime mirror** for
   CI. Values flow Doppler → GH org secrets via
   [`scripts/set-org-secrets-from-doppler.sh`](../../scripts/set-org-secrets-from-doppler.sh)
   and [`runbooks/set-github-org-level-secrets.md`](../../runbooks/security/set-github-org-level-secrets.md).

## Why

- **Set-once, inherit-everywhere.** A new repo added under
  `chirag127/` gets every shared secret automatically; no "did I
  remember to copy SENTRY_DSN to the new repo?" archaeology.
- **No per-repo drift.** Per-repo secrets rot — one repo's
  `RAZORPAY_KEY_ID` falls behind the rest after a rotation, CI
  fails mysteriously, a debugger spends hours grepping for the
  reason. Org-level eliminates the failure mode.
- **Rotation is one write, not N.** Rotate at provider → reissue →
  write at Doppler → Doppler / our script syncs to ONE org-level
  GH secret → every repo's next CI run reads the new value. See
  [`runbooks/rotate-leaked-secret.md`](../../runbooks/security/rotate-leaked-secret.md).
- **Pairs with the synced `.env.example`.** Local dev and CI read the
  same key names — local from Doppler-materialised `.env`, CI from
  org-level GH secrets. One naming surface, two delivery channels.
- **User direction (verbatim) on 2026-06-20:** *"we set the github
  action secret on org chirag127 level."* Locked under
  [`self-update-rule.md`](../agent/self-update-rule.md) +
  [`future-overrides-past.md`](../interaction/future-overrides-past.md).

## What this means concretely

- **Setting / updating a secret.** Use the runbook
  [`runbooks/set-github-org-level-secrets.md`](../../runbooks/security/set-github-org-level-secrets.md).
  In summary:

    ```bash
    doppler secrets get <NAME> --plain --config prd \
      | gh secret set <NAME> --org chirag127 --visibility all
    ```

  No echoing into chat, no clipboard paste, no manual UI write.
- **Adding a new key.** Add it to
  [`templates/.env.example`](../../templates/.env.example) first
  (per [sibling rule](./env-example-synced-from-master.md)), sync
  the example everywhere, then run the runbook to push the value to
  the org.
- **Auditing.** Quarterly:

    ```bash
    gh secret list --org chirag127 --json name,visibility,updatedAt
    ```

  diffed against the keys in
  [`templates/.env.example`](../../templates/.env.example). Drift in
  either direction is the audit failure mode — keys in the example
  but not in org secrets (CI will fail), or keys in org secrets but
  not in the example (orphan, possibly stale). Audit cadence
  documented in the
  [decision file](../../decisions/security/env-and-secrets-single-source.md).
- **Visibility-`selected` exceptions.** When a key is genuinely
  repo-narrow:

    ```bash
    gh secret set CHROME_WEBSTORE_REFRESH_TOKEN \
      --org chirag127 \
      --visibility selected \
      --repos "oriz-omnipost,oriz-blog-ext,oriz-cards-ext"
    ```

  Document the repo list in the runbook, refresh on every new
  extension repo.
- **Bootstrap secret.** `DOPPLER_SERVICE_TOKEN` itself is the one
  credential that has to be planted into the org by hand — it's the
  credential the sync script uses. Treat its rotation with extra
  care; documented in
  [`runbooks/rotate-leaked-secret.md`](../../runbooks/security/rotate-leaked-secret.md).

## What this rule does NOT mean

- **Not** "Doppler is replaced." Doppler stays canonical per
  [`decisions/security/secrets-management-doppler.md`](../../decisions/security/secrets-management-doppler.md).
  Org-level GH secrets are the runtime mirror, not a second source
  of truth.
- **Not** "every secret in Doppler is auto-synced to GH." Only the
  keys that appear in
  [`templates/.env.example`](../../templates/.env.example) are
  synced. Doppler may hold additional org-internal credentials
  (audit-log access tokens, Doppler-itself rotation creds) that
  never need to live in CI.
- **Not** "Cloudflare Worker secrets / Firebase config are at the
  org level." Those continue to be runtime-mirror sinks fed from
  Doppler per the existing decision. This rule is about **GitHub
  Actions secrets** specifically.
- **Not** an exemption from
  [`no-hardcoded-secrets.md`](./no-hardcoded-secrets.md). Real
  values still never enter source.

## Cross-refs

- [`./env-example-synced-from-master.md`](./env-example-synced-from-master.md) — sibling rule for the public env-key surface
- [`./never-hit-quotas.md`](../interaction/never-hit-quotas.md) — per-repo drift = surprise CI failure = customer-visible outage class
- [`./no-card-on-file.md`](../interaction/no-card-on-file.md) — GH org secrets free unlimited, no card
- [`./no-hardcoded-secrets.md`](./no-hardcoded-secrets.md) — values never in source
- [`../services/secrets/doppler.md`](../../services/secrets/doppler.md) — upstream source of truth
- [`../services/secrets/github-secrets.md`](../../services/secrets/github-secrets.md) — runtime mirror service entry
- [`../decisions/security/env-and-secrets-single-source.md`](../../decisions/security/env-and-secrets-single-source.md) — two-track model decision
- [`../decisions/security/secrets-management-doppler.md`](../../decisions/security/secrets-management-doppler.md) — Doppler decision
- [`../runbooks/set-github-org-level-secrets.md`](../../runbooks/security/set-github-org-level-secrets.md) — set-secrets runbook
- [`../runbooks/rotate-leaked-secret.md`](../../runbooks/security/rotate-leaked-secret.md) — rotation flow gains an org-level step
