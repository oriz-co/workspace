---
type: runbook
title: "Lifestream auto-sources setup \u2014 wire the 3 pipelines to live cron + webhooks"
description: 'One-shot deploy steps to take @chirag127/oriz-lifestream from scaffold
  to live: stand up the GitHub-webhook CF Worker behind Hookdeck, enable the two daily
  GH Actions cron workflows, and verify first events land in the oriz-me JSONL canonical
  store. Re-run any section when a token is rotated or a site is added.'
tags:
- runbook
- lifestream
- github-webhooks
- hookdeck
- wakatime
- cloudflare-analytics
- cron
- ingest
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- decisions/architecture/general/lifestream-auto-event-sources
- decisions/architecture/database/lifestream-jsonl-canonical
- decisions/architecture/general/auto-tracking-everywhere
- rules/interaction/auto-only-tracking
- services/queue/hookdeck
- services/productivity/wakatime
- services/monitoring/healthchecks-io
- runbooks/security/auth-setup
- runbooks/security/rotate-leaked-secret
---



# Lifestream auto-sources setup

> Run on **your** terminal, not in agent chat — every step touches a
> live secret. Tokens go into envpact (the vault) per
> [`runbooks/auth-setup`](../security/auth-setup.md). Re-run any section when a
> token is rotated.

This runbook deploys the three auto-event pipelines locked in the
[`lifestream-auto-event-sources`](../../decisions/architecture/general/lifestream-auto-event-sources.md)
decision. The package
[`@chirag127/oriz-lifestream`](../../packages/oriz-lifestream) holds
the code; this runbook holds the wiring.

## Inventory

| What | Where | Token / secret name |
|---|---|---|
| GitHub org webhook | `https://github.com/organizations/chirag127/settings/hooks` | `GITHUB_WEBHOOK_SECRET` (set when creating the hook) |
| Hookdeck connection | `https://dashboard.hookdeck.com/` | (no token; Hookdeck verifies on the GitHub side) |
| CF Worker | `api.oriz.in/lifestream/git` (umbrella worker route) | `GITHUB_WEBHOOK_SECRET`, `LIFESTREAM_INGEST_SECRET` |
| GH Actions cron — Wakatime | `chirag127/oriz/.github/workflows/wakatime-daily.yml` | `WAKATIME_API_KEY`, `LIFESTREAM_INGEST_SECRET`, `HEALTHCHECK_WAKATIME_URL` |
| GH Actions cron — CF Analytics | `chirag127/oriz/.github/workflows/cf-analytics-daily.yml` | `CF_API_TOKEN`, `CF_ACCOUNT_TAG`, `CF_SITES_JSON`, `LIFESTREAM_INGEST_SECRET`, `HEALTHCHECK_CF_ANALYTICS_URL` |
| healthchecks.io monitors | `https://healthchecks.io/repos/` | one ping URL per cron |

---

## 1. Stand up the Hookdeck connection

Hookdeck gives the GitHub webhook retries, replay, and a dead-letter
queue per the [hookdeck service](../../services/queue/hookdeck.md). The
connection lives on the **free 50K events/mo tier** — current family
volume is well inside the envelope.

1. Sign in at `https://dashboard.hookdeck.com/` (Google / GitHub auth).
2. Create a new **Source** of type `GitHub`. Hookdeck issues a
   `https://hkdk.events/<source>` URL — that is what the GitHub
   webhook will point at.
3. Create a new **Destination** with URL
   `https://api.oriz.in/lifestream/git` and HTTP method `POST`.
4. Create a **Connection** linking the GitHub source to the
   destination. Disable transformation rules — this scaffold expects
   the raw GitHub payload through.
5. Note the Hookdeck source URL for step 4 below.

---

## 2. Deploy the CF Worker route

The webhook handler lives inside the
[Hono umbrella API worker](../../decisions/architecture/compute/hono-worker-api-umbrella.md).
Mount the app exported by `@chirag127/oriz-lifestream` at the
`/lifestream/git` path. Reference shape (inside the umbrella worker's
entry):

```ts
import { createGithubWebhookApp } from '@chirag127/oriz-lifestream/github-webhook'

app.route('/lifestream/git', createGithubWebhookApp())
```

Deploy:

```bash
# from the umbrella API worker repo (TBD; see hono-worker-api-umbrella decision)
pnpm wrangler deploy
```

---

## 3. Set CF Worker secrets

```bash
# pulled from envpact, not pasted from anywhere
pnpm wrangler secret put GITHUB_WEBHOOK_SECRET
pnpm wrangler secret put LIFESTREAM_INGEST_SECRET
```

`LIFESTREAM_INGEST_SECRET` is the **same value** used by the two GH
Actions crons in step 6 — generate it once with
`openssl rand -hex 32` and store it in envpact.

If the umbrella worker eventually splits per the
[CF Worker quota mitigation playbook](../../decisions/architecture/compute/cf-worker-quota-mitigation.md),
re-set both secrets on the new worker.

---

## 4. Configure the GitHub org webhook → Hookdeck

1. Open `https://github.com/organizations/chirag127/settings/hooks`
   (org-scope so every repo in the family is covered automatically —
   no per-repo wiring).
2. Click **Add webhook**.
3. **Payload URL**: the Hookdeck source URL from step 1.5.
4. **Content type**: `application/json`.
5. **Secret**: the same value as the Worker's
   `GITHUB_WEBHOOK_SECRET`.
6. **SSL verification**: Enable.
7. **Which events would you like to trigger this webhook?** Select
   *Let me select individual events* and check exactly:
   - **Pushes**
   - **Pull requests**
   - **Releases**
   - **Workflow runs**
8. **Active**: checked.
9. Click **Add webhook**. GitHub will fire a `ping` event — Hookdeck
   should show a 2xx delivery within a few seconds.

---

## 5. Enable the two GH Actions cron workflows

The workflow templates live in
[`templates/per-lifestream-cron/.github/workflows/`](../../templates/per-lifestream-cron/.github/workflows).
Copy both into the master `chirag127/oriz` repo at
`.github/workflows/`:

```bash
cp -r templates/per-lifestream-cron/.github/workflows/. .github/workflows/
git add .github/workflows/wakatime-daily.yml .github/workflows/cf-analytics-daily.yml
git commit -m "chore(ci): enable lifestream daily crons (wakatime + cf-analytics)"
git push
```

Both workflows are also `workflow_dispatch`-able from the Actions tab
with an optional `date` input — use this to backfill a missed day.

---

## 6. Set GH Actions secrets + variables

Repo or org scope, **Settings → Secrets and variables → Actions**:

### Secrets

| Name | Value |
|---|---|
| `WAKATIME_API_KEY` | from `https://wakatime.com/api-key` |
| `CF_API_TOKEN` | CF token with **Account Analytics: Read** scope (create at `https://dash.cloudflare.com/profile/api-tokens`) |
| `CF_ACCOUNT_TAG` | 32-hex account tag from any CF zone overview page |
| `LIFESTREAM_INGEST_SECRET` | same value as the Worker secret in step 3 |
| `HEALTHCHECK_WAKATIME_URL` | per-monitor ping URL from healthchecks.io |
| `HEALTHCHECK_CF_ANALYTICS_URL` | per-monitor ping URL from healthchecks.io |

### Variables

| Name | Value |
|---|---|
| `LIFESTREAM_INGEST_URL` | optional override; leave unset to use `https://me.oriz.in/lifestream/ingest` |
| `CF_SITES_JSON` | JSON array of every family site, e.g. `["blog.oriz.in","books.oriz.in","finance.oriz.in","home.oriz.in","image-tools.oriz.in", …]` |

---

## 7. Create the healthchecks.io monitors

Per the
[`health-check-cron-plus-uptime`](../../decisions/architecture/compute/health-check-cron-plus-uptime.md)
decision:

1. Sign in at `https://healthchecks.io/`.
2. Create monitor `lifestream-wakatime-daily`, schedule `0 1 * * *`,
   grace 30 min. Copy ping URL → `HEALTHCHECK_WAKATIME_URL` GH secret.
3. Create monitor `lifestream-cf-analytics-daily`, same schedule.
   Copy ping URL → `HEALTHCHECK_CF_ANALYTICS_URL` GH secret.
4. (Optional) Add a **Uptime check** for `https://api.oriz.in/lifestream/git`
   covering Source 1; alert routes are already configured in the
   monitoring service file.

---

## 8. Verify

1. **Source 1 (git):** push any small change to any family repo and
   watch the Hookdeck dashboard show a 2xx delivery + the umbrella
   Worker show a 200 in `wrangler tail`. The line should appear in
   `chirag127/oriz-me-data/events-<YYYY>.jsonl` within seconds.
2. **Source 2 (coding):** run **Run workflow** on `wakatime-daily.yml`
   from the Actions tab without a `date` input. Workflow should turn
   green within ~30 s and exactly one new `kind:"coding"` line should
   appear for yesterday.
3. **Source 3 (visitors):** same as 2 with `cf-analytics-daily.yml`.
   Expect one `kind:"visitors"` line per site in `CF_SITES_JSON`
   (eleven sites = eleven new lines).
4. **24-hour check:** confirm both crons produced fresh lines the
   morning after first deploy. If healthchecks.io alerts fire instead,
   read the workflow log — most failures are a stale `WAKATIME_API_KEY`
   or wrong `CF_ACCOUNT_TAG`.

---

## Rotation

If any of `GITHUB_WEBHOOK_SECRET`, `LIFESTREAM_INGEST_SECRET`,
`WAKATIME_API_KEY`, or `CF_API_TOKEN` is leaked: revoke first, reissue
second, re-run the affected steps above. Full rotation procedure in
[`runbooks/rotate-leaked-secret`](../security/rotate-leaked-secret.md).

## Cross-refs

- [Lifestream auto-event sources decision](../../decisions/architecture/general/lifestream-auto-event-sources.md)
- [Lifestream JSONL canonical decision](../../decisions/architecture/database/lifestream-jsonl-canonical.md)
- [Hookdeck service](../../services/queue/hookdeck.md)
- [Wakatime service](../../services/productivity/wakatime.md)
- [healthchecks.io service](../../services/monitoring/healthchecks-io.md)
- [Hono umbrella API worker decision](../../decisions/architecture/compute/hono-worker-api-umbrella.md)
- [Auth setup runbook](../security/auth-setup.md)
- [Rotate-leaked-secret runbook](../security/rotate-leaked-secret.md)
