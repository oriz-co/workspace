---
type: decision
title: "Voice / SMS \u2014 deferred; route via Knock when needed"
description: "No standalone voice or SMS provider in 2026-06-20. Twilio + Vonage rejected\
  \ on card-on-file grounds. If/when SMS becomes needed, the family routes it through\
  \ Knock's bundled SMS channel \u2014 already locked as the multi-channel notification\
  \ orchestrator (10K notifs/mo free)."
tags:
- decisions
- architecture
- sms
- voice
- knock
- twilio
- vonage
- deferred
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/push/knock
- decisions/architecture/general/notifications-fcm-plus-knock
- rules/interaction/no-card-on-file
- rules/infrastructure/no-subscriptions
---



# Voice / SMS — deferred; route via Knock when needed

## Decision

The family adopts **no standalone voice or SMS provider** today. No
Twilio account, no Vonage account, no MessageBird account stands on
its own. If/when an SMS-shaped need lands, it is dispatched through
[Knock](../../../services/push/knock.md)'s bundled SMS channel — already
locked as the family's multi-channel notification orchestrator at
[notifications-fcm-plus-knock](./notifications-fcm-plus-knock.md).

Voice (IVR / outbound calls / programmable telephony) is not on
the roadmap and stays unconsidered until a concrete use-case
appears.

## Why

- **Twilio + Vonage both fight the [no-card-on-file rule](../../../rules/interaction/no-card-on-file.md).**
  Twilio's free trial is time-bound and credit-bound and converts to
  a paid account requiring a card on file. Vonage's free trial is
  similar — both providers expect a card to graduate beyond the
  evaluation envelope. The family does not put a card on file
  anywhere, so adopting either as a primary fights an existing rule.
- **Knock already bundles SMS** — Knock's SMS channel multiplexes
  Twilio / MessageBird under the hood and bills on a pay-per-SMS
  basis with no monthly fee, paid via Knock's own balance (prepaid).
  Routing through Knock means one consent surface, one workflow,
  one preference center, one outage to monitor.
- **No current SMS-shaped feature.** None of the 11 sites or the
  in-flight extensions need SMS today. Two-factor auth uses
  [Passkeys](../../../services/auth/passkeys.md) and email-link sign-in
  (per [multi-provider-auth](../../security/multi-provider-auth.md));
  notifications fan out via in-app + email + web push (per
  [notifications-fcm-plus-knock](./notifications-fcm-plus-knock.md)).
- **Deferred is honest** — the question gets revisited if a
  feature appears (account-recovery SMS, billing-receipt SMS,
  appointment reminders for a future site). At that point Knock is
  already in place; the lift is enabling a workflow's SMS channel
  and topping up a Knock prepaid balance.

## Implications

### What we don't do

- **No Twilio account.** No `TWILIO_ACCOUNT_SID` /
  `TWILIO_AUTH_TOKEN` lines in [`templates/.env.example`](../../../templates/.env.example).
- **No Vonage / MessageBird / Plivo account.** Not adopted, not
  documented under `services/`.
- **No standalone SMS provider** of any kind. SMS, when it lands,
  goes through Knock — same posture as
  [Resend behind Knock for email](../../../services/email/resend.md).
- **No voice / IVR / outbound-call** capability anywhere. If a
  future site needs voice, this decision gets reopened.

### When this flips

Promote from "deferred SMS path" to "active SMS workflow" when
**any one** of these holds:

1. A site or extension lands a feature that demonstrably needs
   SMS (account-recovery fallback when email is hijacked,
   one-shot password reset for a high-stakes flow,
   appointment reminders for a booking-shaped site).
2. Regulatory or compliance reason forces SMS for a specific
   region (e.g. PSD2-style 2FA in EU finance flows on
   `oriz-finance`).
3. The user explicitly asks for an SMS rail.

When it flips: enable Knock's SMS channel on the relevant
workflow, top up Knock prepaid balance with one transaction (not
a card-on-file), document the workflow in
[`packages/oriz-kit/notifications/workflows/`](../../../glossary/o-r/oriz-kit.md).

### What stays

- [Knock](../../../services/push/knock.md) as the multi-channel
  orchestrator — already active for in-app + email + web push.
  SMS is one more channel away, not a new vendor.
- [FCM web push](../../../services/push/fcm.md) for ambient pings —
  free unlimited on Spark, covers the majority of "ping the user
  now" needs without SMS.
- Email-link sign-in and passkeys for auth — no SMS-2FA needed
  for the family's auth posture.

## Cross-refs

- [Knock service entry — bundled SMS via Twilio / MessageBird](../../../services/push/knock.md)
- [Notifications: FCM + Knock decision](./notifications-fcm-plus-knock.md)
- [push services index](../../../services/push/index.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
- [No subscriptions rule](../../../rules/infrastructure/no-subscriptions.md)
- [No-paid-tier rule (no-subscriptions-anywhere)](../../monetisation/no-subscriptions-anywhere.md)
- [Multi-provider auth — passkeys + email-link instead of SMS-2FA](../../security/multi-provider-auth.md)
