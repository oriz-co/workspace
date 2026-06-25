---
type: decision
title: "Lifestream federation \u2014 mirror to BOTH AT Protocol and ActivityPub"
description: oriz-me lifestream JSONL stays canonical; mirrored as AT Protocol records
  under me.oriz.in.atproto AND ActivityPub outbox at me.oriz.in/activitypub/outbox.
  Single source, two protocols.
tags:
- decisions
- architecture
- lifestream
- federation
- atproto
- bluesky
- activitypub
- fediverse
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/social/atproto-firehose
- services/social/activitypub
- decisions/architecture/database/lifestream-jsonl-canonical
- decisions/content/100-year-strategy-locked
- decisions/content/journal-stays-auth-gated
- architecture/database/canonical-store-jsonl
---



# Lifestream federation — mirror to BOTH AT Protocol and ActivityPub

## Decision

The canonical
[lifestream JSONL in `chirag127/oriz-me-data`](../database/lifestream-jsonl-canonical.md)
stays the single source of truth. It is mirrored to **two**
federated protocols, in parallel, on every cron tick:

1. **AT Protocol** — records published under the family lexicon
   `me.oriz.in.atproto.lifestream.event`, attributed to
   `did:plc:...` bound to the handle `chirag127.oriz.in`. Bluesky
   and any other AT Protocol consumer can subscribe.
   See [`services/social/atproto-firehose.md`](../../../services/social/atproto-firehose.md).
2. **ActivityPub** — `Note` objects published to the outbox at
   `https://me.oriz.in/activitypub/outbox`; actor at
   `me.oriz.in/activitypub/actor`. Mastodon / Pleroma / Misskey /
   the wider Fediverse can follow `@chirag@me.oriz.in` natively.
   See [`services/social/activitypub.md`](../../../services/social/activitypub.md).

Both mirrors are **derived data**. They are idempotent on the JSONL
event `id`. If either mirror is wiped, the next rehydrate cycle
replays the canonical JSONL into it — no data is at risk.

## Why

- **Different audiences live on different federations.** Bluesky's
  network and the wider Fediverse barely overlap in 2026; an AT
  Protocol-only mirror leaves Mastodon followers without a feed,
  and the reverse leaves Bluesky followers out. Both is the only
  way to be reachable everywhere readers already are.
- **Single canonical source preserves the
  [100-year strategy](../../content/100-year-strategy-locked.md).** No
  federation client becomes the source of truth — vendor / protocol
  format risk stays bounded by the
  [JSONL canonical decision](../database/lifestream-jsonl-canonical.md). If
  AT Protocol or ActivityPub disappears in 2046, the JSONL still
  parses with `jq`.
- **Cost is zero.** AT Protocol PDS is free on bsky.social or
  self-hostable on already-paid Workers; ActivityPub is
  self-hosted on the same Workers + Pages substrate. No new
  vendor, no card.
- **Domain identity stays family-owned.** `chirag127.oriz.in` (AT
  handle, DNS-bound) and `@chirag@me.oriz.in` (ActivityPub actor)
  both live on the family domain — readers' follow relationships
  survive any provider swap.

## Implications

### Architecture

- Two mirror scripts, both reading from `chirag127/oriz-me-data`
  via the [canonical-store-jsonl architecture](../../../architecture/database/canonical-store-jsonl.md):
  - `scripts/mirror-to-atproto.ts` — pushes new JSONL events as
    AT Protocol records.
  - `scripts/mirror-to-activitypub.ts` — pushes new JSONL events
    as ActivityPub `Note`s, signs with HTTP Signatures, delivers
    to follower inboxes.
- Both run hourly via
  [Cloudflare Cron Triggers](../../../services/cron/cloudflare-cron-triggers.md).
  Idempotent on JSONL `id`; repeated runs no-op.
- The Hono Worker at `api.oriz.in` exposes the ActivityPub actor /
  inbox / outbox routes mounted under `me.oriz.in/activitypub/*`
  via the cross-host umbrella per
  [`hono-worker-api-umbrella`](../compute/hono-worker-api-umbrella.md).
- WebFinger lives at `me.oriz.in/.well-known/webfinger`, served
  by the same Worker.

### Identity bindings

- AT Protocol DID custody: family DID (`did:plc:...`), bound to
  handle `chirag127.oriz.in` via DNS TXT record at
  `_atproto.chirag127.oriz.in`. Cloudflare DNS handles the
  record per the
  [DNS decision](../../infrastructure/spaceship-registrar-cloudflare-dns.md).
- ActivityPub actor key pair: RSA / Ed25519 stored in
  [Doppler](../../../services/secrets/doppler.md); public key embedded
  in the actor document; private key never leaves the Worker
  binding.

### What gets federated

- **Public-tagged events only.** Per the
  [public/private line policy](../../../policy/public-private-line.md)
  and the
  [journal-stays-auth-gated decision](../../content/journal-stays-auth-gated.md),
  journal entries are NOT federated. Age-gated content per
  [age-gating policy](../../../policy/age-gating.md) is NOT federated.
- The mirror scripts read the `visibility` tag on each JSONL
  event and skip non-public events.

### What we don't do

- **No origination on either federation.** Posting directly into
  Bluesky's web app or a Mastodon client is rejected — the JSONL
  must always be the origin so the canonical store stays
  authoritative. Replies received via either federation are
  fetched into the JSONL by the same cron, then re-mirrored to
  the other federation.
- **No Nostr mirror.** Deferred — covered by the AT + AP pair for
  now; revisit when Nostr's reader population shifts.
- **No paid hosted federation gateway** (Bridgy Fed, micro.blog,
  Buttondown federation). Self-hosting the ActivityPub Worker is
  free.
- **No federation of journal / age-gated / private events.**
  Filtered at mirror time — never sent into either protocol.

## Cross-refs

- [AT Protocol mirror service entry](../../../services/social/atproto-firehose.md)
- [ActivityPub mirror service entry](../../../services/social/activitypub.md)
- [social services index](../../../services/social/index.md)
- [Lifestream JSONL is canonical (anchor decision)](../database/lifestream-jsonl-canonical.md)
- [100-year strategy locked](../../content/100-year-strategy-locked.md)
- [Journal stays auth-gated](../../content/journal-stays-auth-gated.md)
- [Public/private line policy](../../../policy/public-private-line.md)
- [Hono Worker API umbrella](../compute/hono-worker-api-umbrella.md)
- [Spaceship registrar + Cloudflare DNS](../../infrastructure/spaceship-registrar-cloudflare-dns.md)
- [Cloudflare Cron Triggers](../../../services/cron/cloudflare-cron-triggers.md)
- [Doppler — secrets source-of-truth](../../../services/secrets/doppler.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
