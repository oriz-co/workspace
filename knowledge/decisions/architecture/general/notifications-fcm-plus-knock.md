---
type: decision
title: "Notifications \u2014 FCM (transport) + Knock (orchestration)"
description: 'Two-layer notification stack: Knock owns multi-channel orchestration
  (in-app + email + SMS + web push); FCM stays as the web-push transport. Free 10K
  notifs/mo on Knock, free unlimited on FCM.'
tags:
- decisions
- architecture
- notifications
- push
- knock
- fcm
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/push/knock
- services/push/fcm
- services/email/resend
- services/auth/firebase-spark
- decisions/infrastructure/firebase-spark-forever
---



# Notifications — FCM (transport) + Knock (orchestration)

## Decision

Notifications are split across **two layers**:

- **Orchestration** — [Knock](../../../services/push/knock.md). One
  workflow per event type (billing receipt, password change,
  comment reply, feature rollout). Knock owns channel selection,
  delivery order, dedupe windows, digest, per-user preferences, and
  the in-app feed. Free tier: 10,000 notifications/month.
- **Transport** — [FCM](../../../services/push/fcm.md) for web push;
  [Resend](../../../services/email/resend.md) for email; Knock-bundled
  Twilio/MessageBird for SMS.

Knock's web-push channel dispatches to FCM. Knock's email channel
dispatches to Resend. SMS is pay-per-message via Knock's bundled
providers (no monthly fee).

## Why

- **Building cross-channel orchestration on Workers is months of
  work.** Knock gives us preference centers, digest windows, dedupe,
  branch-based environments (dev / staging / prod), and an in-app
  feed React component for free.
- **FCM stays as transport** because it's free unlimited on
  [Firebase Spark](../../../services/auth/firebase-spark.md) (locked
  forever by [firebase-spark-forever](../../infrastructure/firebase-spark-forever.md)),
  has first-class iOS PWA support, and tokens already live on Firebase
  Auth user records — letting Knock send web push directly would
  duplicate that storage and cost extra Knock notifications against
  the 10K cap.
- **Resend stays as email transport** for the same reason — it's
  already wired for transactional email, free 3K/day, and Knock can
  point its email channel at Resend's SMTP credentials.
- **No card** required at any layer. Spark + Resend + Knock all
  free-tier; per-site env-var toggle (same pattern as
  [Sentry](../../../services/monitoring/sentry.md#per-site-env-var-toggle-the-never-hit-quotas-pattern))
  keeps low-traffic sites from burning the 10K Knock cap.

## Implications

### Architecture

- **One workflow per event type**, defined in Knock's dashboard.
  Workflows are exported as JSON and committed under
  `packages/oriz-kit/notifications/workflows/` for replayable setup.
- **`@chirag127/oriz-kit`** ships a `<KnockFeed />` component
  wrapping Knock's React feed. Every site mounts it in the
  `<AccountPanel>` notifications drawer.
- **Firebase Auth** stores the per-user Knock recipient ID + FCM
  token on the user profile. The Hono Worker syncs Auth user
  changes to Knock recipients via webhook.
- **Razorpay / Lemon Squeezy webhook** → [Hookdeck](../../../services/tooling/hookdeck.md)
  → Hono Worker → Knock workflow trigger. Hookdeck stays in front
  for retry / replay.

### Channel responsibility

| Channel | Owner | Why this split |
|---|---|---|
| In-app feed | Knock-hosted | Drop-in component; no DB schema needed |
| Web push | FCM (via Knock) | Free unlimited Spark + iOS PWA |
| Email | Resend (via Knock) | Already wired transactional |
| SMS | Twilio / MessageBird (via Knock) | Pay-per-SMS only, no monthly fee |
| Slack | Knock direct | Ops alerts only; no per-user use |

### Volume budget

- 10K notifications/month on Knock = ~330/day across the family.
- Per-site `ENABLE_KNOCK=true|false` env var keeps low-traffic
  sites silent until they need notifications.
- If we hit the cap: digest workflows (Knock supports daily /
  weekly digests natively) collapse multiple events into one
  notification, dropping volume by 5–10×.

### What we don't do

- **No direct Knock web-push** — every web-push goes through FCM.
- **No self-hosted Novu** — per [no-self-host](../../../rules/no-self-host.md).
- **No Firebase Cloud Functions for notification fan-out** — that
  would force Blaze (paid) to call third parties; Hono Worker on
  Cloudflare handles it free.
- **No card-on-file** at Knock or Twilio. SMS budget caps configured
  on the Twilio side via prepaid balance only.

## Cross-refs

- [Knock service entry](../../../services/push/knock.md)
- [FCM service entry](../../../services/push/fcm.md)
- [push services index](../../../services/push/index.md)
- [Resend — email transport behind Knock](../../../services/email/resend.md)
- [Firebase Spark forever](../../infrastructure/firebase-spark-forever.md)
- [Hookdeck — webhook reliability](../../infrastructure/hookdeck-for-webhook-reliability.md)
- [Never hit quotas rule](../../../rules/interaction/never-hit-quotas.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
- [No self-host rule](../../../rules/no-self-host.md)
