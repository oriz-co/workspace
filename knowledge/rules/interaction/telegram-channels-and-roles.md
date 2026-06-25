---
type: rule
title: Telegram channels and roles (restored 2026-06-22)
description: 'Telegram restored in India 2026-06-22. Four channels in the Oriz namespace:
  @oriz_announcements (public broadcast), @oriz_drafts (private drafts queue), @oriz_ops
  (private errors+CI), @oriz_paisa (public India finance). Drafts dual-write to TG
  + GH Issues for redundancy. Pairs with Substack for long-form newsletter (both used).'
tags:
- rule
- telegram
- channels
- india
- geo
- notifications
- drafts
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
supersedes: rules/no-telegram-india-banned
related:
- decisions/architecture/compute/drafts-queue-host
- decisions/architecture/stack/newsletter-substack
- decisions/architecture/packages/omni-publish-package
---



# Telegram channels and roles

## Status: restored 2026-06-22

User confirmed Telegram is accessible from India again. Supersedes `no-telegram-india-banned.md` (now archived as superseded).

## Four channels

| Channel | Visibility | Role |
|---|---|---|
| `@oriz_announcements` | Public | Every release, book drop, blog post auto-broadcast. Subscribers = audience. |
| `@oriz_drafts` | Private (admin only) | omni-publish queues X / Reddit / LinkedIn / Medium drafts here. Dual-written to GH Issues repo too. |
| `@oriz_ops` | Private (admin only) | Build / deploy / Dependabot / error / uptime alerts from all 51 repos. |
| `@oriz_paisa` | Public | India finance content (Oriz Paisa book audience, FII/DII commentary, credit-card news). |

Namespace = `@oriz_*` not `@chirag127_*` — brand-owned, easier to hand off, decoupled from the person.

## Drafts: dual-write to TG + GH Issues

omni-publish writes manual-channel drafts (X, Reddit, LinkedIn, Medium) to BOTH `@oriz_drafts` Telegram channel AND `chirag127/oriz-drafts` GitHub Issues. Reason: TG = mobile notifications + speed; GH Issues = searchable history + audit trail. Either side can fail and the other survives.

## Substack stays in addition

Substack remains the long-form newsletter (free tier; paid future deferred). Telegram is the high-frequency broadcast layer. They serve different audiences:
- **Substack** = email-first readers, long-form posts, weekly digests
- **Telegram** = mobile-first followers, real-time, short-form + links

Cross-posting: every blog post auto-publishes to BOTH (omni-publish handles the fan-out).

## Env vars

`TELEGRAM_DRAFTS_BOT_TOKEN`, `TELEGRAM_DRAFTS_CHAT_ID` — keep (no longer deprecated). Add `TELEGRAM_ANNOUNCE_CHAT_ID`, `TELEGRAM_OPS_CHAT_ID`, `TELEGRAM_PAISA_CHAT_ID` in templates/.env.example.

## If user travels / TG re-banned

Switch to GH-Issues-only drafts (still dual-written, just stop reading TG). The rule auto-fails-back; no code change needed.

## Cross-refs

- Drafts queue host → [[decisions/architecture/drafts-queue-host]]
- Newsletter (Substack stays) → [[decisions/architecture/newsletter-substack]]
- Omni-publish fan-out → [[decisions/architecture/omni-publish-package]]
- The superseded ban rule → [[rules/no-telegram-india-banned]]
