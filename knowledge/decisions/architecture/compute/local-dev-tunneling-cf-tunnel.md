---
type: decision
title: "Local dev tunneling \u2014 Wrangler + Astro dev + Cloudflare Tunnel"
description: "Locked 2026-06-20: local dev for the family runs on three substrates\
  \ picked by surface \u2014 Wrangler dev for Cloudflare Workers, Astro dev for sites,\
  \ Cloudflare Tunnel (cloudflared) for exposing localhost to the public internet\
  \ for webhook testing. ngrok and localtunnel REJECTED."
tags:
- decisions
- architecture
- dev-tools
- tunneling
- cloudflare-tunnel
- wrangler
- astro
- webhook-testing
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/dev-tools/cloudflare-tunnel
- services/dev-tools/wrangler
- decisions/infrastructure/cloudflare-pages-for-all-sites
- decisions/architecture/compute/hono-worker-api-umbrella
- decisions/infrastructure/hookdeck-for-webhook-reliability
- rules/interaction/no-card-on-file
- rules/infrastructure/no-subscriptions
---



# Local dev tunneling — Wrangler + Astro dev + Cloudflare Tunnel

## Decision

Local development across the family runs on **three substrates**,
picked by surface:

1. **[Wrangler dev](../../../services/dev-tools/wrangler.md)** — for
   every Cloudflare Worker (the umbrella `api.oriz.in` Hono Worker
   per [`hono-worker-api-umbrella`](./hono-worker-api-umbrella.md),
   the `s.oriz.in` shortener Worker, the `og.oriz.in` Satori
   endpoint). Local mode (`wrangler dev`) runs in workerd; remote
   mode (`wrangler dev --remote`) runs against real Cloudflare
   infrastructure for KV / R2 / Queues / Durable Objects parity.
2. **Astro dev** — for every site (Astro / Vite stack) per
   [`cloudflare-pages-for-all-sites`](../../infrastructure/cloudflare-pages-for-all-sites.md).
   `pnpm dev` boots the Vite dev server with HMR.
3. **[Cloudflare Tunnel (cloudflared)](../../../services/dev-tools/cloudflare-tunnel.md)** —
   for exposing `localhost:<port>` to a public hostname so that
   webhook senders ([Razorpay](../../../services/payment/razorpay.md),
   GitHub, Bluesky AT Protocol firehose, EmailOctopus) can reach
   the in-flight Worker / site during development.

ngrok, localtunnel, serveo, and bore — **all REJECTED**.

User direction 2026-06-20: "Wrangler + Astro dev locked. ALSO add
Cloudflare Tunnel (free, CF-native)."

## Why

- **Cloudflare Tunnel is free, native to the family's stack, and
  has no auth limit.** The family already runs on Cloudflare
  (Pages + Workers + DNS + Email Routing). One more `cloudflared`
  binary fits without a new vendor surface — no card on file
  ([`rules/no-card-on-file`](../../../rules/interaction/no-card-on-file.md)),
  no subscription ([`rules/no-subscriptions`](../../../rules/infrastructure/no-subscriptions.md)),
  no anonymous-user TTL.
- **Persistent hostnames.** A `cloudflared tunnel route dns`
  binding to `dev.oriz.in` survives laptop reboots and dynamic
  IPs — ngrok's free tier rotates the hostname every session,
  forcing webhook re-registration every dev day.
- **Wrangler handles Worker runtime parity.** Local-mode workerd
  matches Cloudflare's edge runtime; remote-mode hits real
  bindings. Nothing else does this for the Worker stack.
- **Astro dev handles HMR + MDX + Vite plugins.** Native Vite
  HMR on the same code path as the production build avoids
  staging surprises.
- **Three tools, one surface each, no overlap.** Wrangler doesn't
  tunnel; cloudflared doesn't run Workers; Astro dev doesn't
  expose ports publicly. Composed cleanly.

## Why not the rejected options

| Tool | Why rejected |
|---|---|
| ngrok | Free tier rotates hostname every session, forcing webhook re-registration; persistent hostnames require paid plan + card. Anonymous use throttled |
| localtunnel | Hostname is random subdomain on `loca.lt`, no persistent binding to `*.oriz.in`; OSS but unmaintained |
| serveo | SSH-tunnel-shaped — no `*.oriz.in` binding; reliability issues over time |
| bore / frp / pagekite | Self-host or paid past tiny envelope; the family runs only managed serverless |
| Tailscale Funnel | Requires Tailscale-installed receiving party — fits internal collaboration, not public-internet webhooks |
| GitHub Codespaces port-forward | Fits a Codespaces workflow; the family develops locally, not in Codespaces |

## Implications

### Setup (one-time per developer machine)

```bash
# Install cloudflared (Windows: winget install cloudflare.cloudflared)
cloudflared tunnel login                       # browser-auth into the CF account
cloudflared tunnel create dev-oriz             # mints a tunnel UUID
cloudflared tunnel route dns dev-oriz dev.oriz.in
```

Result: `dev.oriz.in` resolves to the tunnel UUID; whatever
`cloudflared tunnel run dev-oriz` is pointing at receives traffic.

### Per-session local dev flow

```bash
# Terminal 1 — Worker
cd packages/oriz-api-worker && wrangler dev --port 8787

# Terminal 2 — Site (one of the 11)
cd sites/oriz-blog-site && pnpm dev   # Astro on :3000

# Terminal 3 — public hostname pointing at one of the above
cloudflared tunnel run --url http://localhost:8787 dev-oriz
# now https://dev.oriz.in tunnels to localhost:8787
```

`cloudflared` config file at `~/.cloudflared/config.yml`:

```yaml
tunnel: dev-oriz
credentials-file: ~/.cloudflared/<UUID>.json
ingress:
  - hostname: dev.oriz.in
    service: http://localhost:8787
  - service: http_status:404
```

### Webhook testing surfaces

- **Razorpay** — point the dashboard webhook at
  `https://dev.oriz.in/webhooks/razorpay` while testing payment
  flows; production points at `api.oriz.in/webhooks/razorpay`
  fronted by [Hookdeck](../../infrastructure/hookdeck-for-webhook-reliability.md).
- **GitHub** (PR-checks / push events for `oriz-omnipost`) —
  same pattern; dev webhook points at `dev.oriz.in/gh`.
- **Bluesky AT Protocol firehose** — for the
  [`lifestream-federation`](../general/lifestream-federation.md)
  consumer, run cloudflared during dev to receive jetstream
  events on a public hostname.
- **EmailOctopus / Buttondown** webhooks for newsletter signup
  acknowledgements.

### Secrets parity

`wrangler dev` reads `.dev.vars` for local secrets; the same
keys also exist in [Doppler](../../../services/secrets/doppler.md)
per [`secrets-management-doppler`](../../security/secrets-management-doppler.md).
`doppler run -- wrangler dev` keeps the local secrets in sync
with Doppler without committing them.

### What we don't do

- **No ngrok account.** No `NGROK_AUTH_TOKEN` in
  [`templates/.env.example`](../../../templates/.env.example).
- **No paid Wrangler / Cloudflare plan** for local dev — Wrangler
  is free; Cloudflare Tunnel is free; Workers free tier covers
  remote-mode parity testing.
- **No tunneling for production.** Production traffic hits
  Cloudflare's edge directly via Pages / Workers — tunnels are
  exclusively a local-dev surface.

### Failure modes documented

- `cloudflared` daemon crashes → restart; tunnel UUID and DNS
  binding are durable on the CF side.
- Account quota: Cloudflare Tunnel has **no per-user quota** on
  the free plan — bandwidth and connection counts are unlimited
  for personal / dev use.

## Cross-refs

- [Cloudflare Tunnel service entry](../../../services/dev-tools/cloudflare-tunnel.md)
- [Wrangler service entry](../../../services/dev-tools/wrangler.md)
- [Dev-tools index](../../../services/dev-tools/index.md)
- [Cloudflare Pages for all sites](../../infrastructure/cloudflare-pages-for-all-sites.md)
- [Hono Worker API umbrella](./hono-worker-api-umbrella.md) — primary Worker tested under Wrangler dev
- [Hookdeck for webhook reliability](../../infrastructure/hookdeck-for-webhook-reliability.md) — production webhook ingress
- [Secrets management — Doppler](../../security/secrets-management-doppler.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
- [No subscriptions rule](../../../rules/infrastructure/no-subscriptions.md)
