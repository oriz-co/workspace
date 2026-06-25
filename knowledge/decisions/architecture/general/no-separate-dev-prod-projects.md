---
type: decision
title: "No separate dev/prod projects \u2014 one prod + emulator + 5 cheap defensive\
  \ moves"
description: "Locked 2026-06-23. Verdict from cited research (15+ sources, 6-prong\
  \ fan-out): a separate dev Firebase project is net-negative at oriz scale today\
  \ (Spark plan, no paying users, solo founder, mostly stub apps). Emulator + one\
  \ prod + 5 cheap pre-emptive moves (GCP lien, defineSecret(), wrangler env split,\
  \ 1Password CLI, CF Tunnel for Razorpay webhooks) is right-sized. Triggers to flip\
  \ and add `oriz-dev`: first \u20B999 live payment, second deploy-rights human, or\
  \ first prod-data incident \u2014 whichever comes first. Razorpay structurally forbids\
  \ a second staging account (one business-PAN per merchant)."
tags:
- decision
- dev-env
- firebase
- cloudflare
- razorpay
- no-staging
- single-prod
- gcp-lien
- emulator
timestamp: 2026-06-23
format_version: okf-v0.1
status: active
related:
- rules/interaction/no-card-on-file
- rules/interaction/never-hit-quotas
- rules/security/org-level-secrets-only-no-per-repo
- decisions/architecture/security/data-hub-and-central-auth
- runbooks/free-hosting-providers/databases
---



# No separate dev/prod projects — one prod + emulator

## TL;DR

For 1-2 person teams on Firebase + Cloudflare + Razorpay, the canonical 2026 recommendation from official docs is "at least two Firebase projects." But the verifiable solo founders (Plausible's Uku Täht — 3 years solo, one prod, Docker dev; Cal.com early team) shipped with one prod + emulator and only added staging once a teammate or paying user appeared. For oriz today, the same pattern fits: single Firebase project `oriz-app` + Local Emulator Suite for dev + 5 cheap pre-emptive moves that get most of the safety benefit without the operational tax of a second project.

## Why not "two projects from day one"

The Firebase team docs are explicit: *"Firebase recommends using a separate Firebase project for each environment"* + *"Every app should have at least one pre-production environment that's isolated from production data and resources."* But the trigger is qualitative, not numeric — *"especially if you have more than one person working on your app."*

The hidden cost of a second project at single-founder scale:

1. **2× config files**: `.firebaserc` aliases, `firebase.json` per env, separate service-account JSONs, separate Auth OAuth client IDs (one per project per provider).
2. **2× org-secrets matrix**: every key has `_DEV` and `_PROD` variants. With 61 org-level secrets, that's 122 entries to maintain.
3. **2× CI matrix**: every workflow must select which project. Easy to deploy dev branch to prod with a typo.
4. **2× Firestore Spark caps to monitor**: free tier is per-project so 2 projects = 2× free, but also 2× the quota-overshoot risk.
5. **Per-env redirect URLs**: Google Sign-In has separate authorized redirect URIs per Firebase project. Centralized auth at `auth.oriz.in` doubles in complexity.

At oriz scale today (no paying customers, solo, 22-package npm stubs, free-tier everywhere), the tax outweighs the gain.

## The 5 cheap pre-emptive moves

These give most of the safety benefit without spinning up a second project.

### Move 1: GCP project lien on `oriz-app`

A lien blocks the "Delete Project" button until removed. Neutralizes the single worst Firebase horror story (`r/Firebase 1ctx8k6`, 61 upvotes: solo dev clicked "Shut down" on prod by mistake → 30-day grace → forgot → all user data gone).

**Apply via Console**: GCP Console → IAM & Admin → Settings → Liens → Add Lien
- Restrictions: `resourcemanager.projects.delete`
- Reason: `Production data — do not delete`
- Origin: `lien-2026-06-23`

**Or via gcloud CLI** (if installed):
```bash
gcloud alpha resource-manager liens create \
  --restrictions=resourcemanager.projects.delete \
  --reason="Production data — do not delete" \
  --project=oriz-app
```

To remove later (when genuinely deleting the project):
```bash
gcloud alpha resource-manager liens list --project=oriz-app
gcloud alpha resource-manager liens delete <LIEN_ID>
```

### Move 2: Migrate any `functions.config()` → `defineSecret()`

`functions.config()` was decommissioned in `firebase-functions@v7`. Use Cloud Secret Manager-backed secrets instead. (Pure housekeeping — not a real exposure today since we're not yet using Cloud Functions heavily, but lock the pattern before we do.)

```js
import { defineSecret } from 'firebase-functions/params';
const RAZORPAY_KEY_SECRET = defineSecret('RAZORPAY_KEY_SECRET');
export const billingWebhook = onRequest({ secrets: [RAZORPAY_KEY_SECRET] }, async (req, res) => {
  const secret = RAZORPAY_KEY_SECRET.value();
  // ...
});
```

Set via: `firebase functions:secrets:set RAZORPAY_KEY_SECRET` (interactive prompt).

### Move 3: `[env.preview]` + `[env.production]` in every `wrangler.toml`

Even inside a single Cloudflare account, each Worker config gets two environment blocks with separate KV namespace IDs, separate D1 database IDs, separate R2 bucket bindings. Costs zero (free-tier resources are per-account, not per-binding) and future-proofs the moment we ever want to flip on remote bindings.

Caveat: 11 binding keys are non-inheritable in `[env.preview]` — override one, redeclare all 11. Documented for whoever scaffolds Workers next.

### Move 4: `op run -- wrangler dev` (or Infisical) for local secrets

Removes `.env` files from disk. GitHub reported 12.8M secrets leaked in 2025 — most via accidentally-committed `.env` files. 1Password CLI or Infisical injects secrets into the process env at runtime without ever writing them to disk.

Setup (1Password CLI):
```bash
op signin
op vault create oriz-dev
op item create --vault=oriz-dev --category=login --title="oriz .env" \
  RAZORPAY_KEY_ID=rzp_test_... RAZORPAY_KEY_SECRET=...
# Then run any command with secrets injected:
op run --env-file=.env.template -- wrangler dev
```

The `.env.template` references secrets by reference, not value:
```
RAZORPAY_KEY_ID=op://oriz-dev/oriz .env/RAZORPAY_KEY_ID
```

### Move 5: Cloudflare Tunnel for local Razorpay webhook testing

Razorpay's webhook validator **blocks ngrok URLs** (community-reported, may be 2024 UX change). Cloudflare Tunnel (free, no card) is the working alternative.

```bash
cloudflared tunnel --url http://localhost:8787
# Outputs: https://random-name.trycloudflare.com
# Use that as the Razorpay test-mode webhook URL.
```

Set up once per dev session. No persistent state.

## Triggers to upgrade (in priority order)

| Trigger | Status today | What to add |
|---|---|---|
| **First paying customer via live Razorpay key** | Not yet (only test keys) | `oriz-dev` Firebase project; Blaze on prod, Spark on dev |
| **Second human with deploy rights** | Not yet (solo) | Per-env `.firebaserc` aliases; GitHub Environment with required reviewer on prod |
| **First prod-data incident** | Not yet | Above + this lien (Move 1) + Logpush → R2 + Discord/Slack alarm hook on status app |
| **>10k MAU OR >₹50k MRR** (synthesized, not cited) | Not yet | Three-tier dev/staging/prod; staging mirrors prod bindings |
| **HIPAA/PCI/SOC2 scope** | Not applicable | Three-tier + audit logging |

None of these have fired. Until they do, the 5 cheap moves cover us.

## Razorpay structural constraint

A "staging Razorpay account" is impossible. Razorpay requires KYC + one business-PAN per merchant account. The only dev story is test-mode keys on the same merchant + Cloudflare Tunnel for webhook ingress.

Test-mode covers everything except 10 live-only features (Smart Collect VPA, Fund Account Validation, settlements reconciliation, etc.). When any of those become core to a product flow, the trigger is:

1. Live keys with `LIVE_SMOKE=1` flag running ₹1 transactions behind a budget guard.
2. Dedup on `x-razorpay-event-id` so re-deliveries don't double-charge.
3. 24h dual-secret window on rotation.

## What the named indie founders actually did

- **Plausible (Uku Täht, solo 2018-2021)**: Docker for Postgres+Clickhouse locally; `config/.env.dev`, `.env.test`, `.env.e2e_test`; no `staging` tag; prod on Hetzner + Terraform/Ansible. Uku on secrets: *"Secrets should never be committed to source control, whether the repo is public or not."* (HN 25456673)
- **Cal.com (early)**: single `.env.example`, all URLs at `localhost:3000`; README distinguishes only dev vs prod; internal staging only appeared once they had paying users + a team.
- **Linear**: GCP + K8s + Postgres/Redis/MongoDB; first-week hires ship to prod by end of week 1. No public staging statement.

Pattern: even the OSS apps that are now multi-engineer started with one prod + local Docker dev. Staging appeared after meaningful team/user base, not before.

## Cloudflare Pages preview gotchas

For when we do scale up to needing branch previews:

1. Pages has **exactly 2 env slots** (Preview + Production). All non-prod branches share **one** Preview env-var set — no per-branch envs.
2. **11 binding keys are non-inheritable** in `[env.preview]`: `vars`, `kv_namespaces`, `d1_databases`, `r2_buckets`, `durable_objects`, `services`, `queues.producers`, `vectorize`, `hyperdrive`, `analytics_engine_datasets`, `ai`.
3. **Preview URLs are public** by default (`X-Robots-Tag: noindex` but still fetchable). Wrap in Cloudflare Access if sensitive.
4. Pages Functions **can produce to Queues but can't consume** + **can't host Durable Object classes**.

## Local emulation reality (Wrangler v4 / Miniflare v3)

Local is local-by-default since Wrangler v3 (May 2023). What DOESN'T emulate locally:

- **Workers AI / Vectorize / Browser Rendering / Hyperdrive** — no local sim; must set `remote: true` or deploy.
- **Cron triggers** — never auto-fire; hit `/cdn-cgi/handler/scheduled?cron=...` manually.
- **KV eventual consistency** — local is immediate-everywhere; prod takes up to 60s globally.
- **D1 latency** — local: microseconds; prod: 10-50ms per query. "#1 source of works-on-my-machine" per CF docs.
- **Email Routing** — no emulator.
- **DO WebSocket Hibernation lifecycle** — only fires in prod (constructor re-run + `deserializeAttachment`).
- **Secrets set via `wrangler secret put`** — don't populate local; need `.dev.vars`.

So local dev still demands one brief `wrangler deploy` sanity check per cron-fired or AI-bound path before commit. No separate dev account needed for that — just deploy cadence discipline.

## Cross-refs

- No card on file → [[rules/no-card-on-file]]
- Never hit quotas → [[rules/never-hit-quotas]]
- Org-level secrets only → [[rules/org-level-secrets-only-no-per-repo]]
- Data hub + central auth → [[decisions/architecture/data-hub-and-central-auth]]
- Databases free tiers → [[runbooks/free-hosting-providers/databases]]

## Sources

Verdict from a 6-prong adversarial-verified research fan-out (2026-06-22 / 2026-06-23). Highlights:

- Firebase docs: [general-best-practices](https://firebase.google.com/docs/repos/dev-workflows/general-best-practices), [overview-environments](https://firebase.google.com/docs/repos/dev-workflows/overview-environments), [config-env](https://firebase.google.com/docs/functions/config-env), [pricing](https://firebase.google.com/pricing)
- Cloudflare docs: [Pages preview-deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/), [Pages wrangler-configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/), [Workers environments](https://developers.cloudflare.com/workers/wrangler/environments/), [Remote bindings blog (Mar 2026)](https://blog.cloudflare.com/connecting-to-production-the-architecture-of-remote-bindings/)
- Razorpay docs: [test-live-modes](https://razorpay.com/docs/payments/dashboard/test-live-modes/), [webhooks](https://razorpay.com/docs/webhooks/)
- Founder data: Plausible repo + Uku HN posts (25456673, 30166188), Cal.com repo, Pragmatic Engineer / Linear
- Community: SO 57620406 (Doug Stevenson), r/Firebase 1ctx8k6 (prod wipe story, 61 upvotes), SO 42609983 (Spark per-project, 81 upvotes)
