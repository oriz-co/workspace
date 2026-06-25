---
type: rule
title: Never call Web3Forms from server-side code
description: Web3Forms server-side calls require their paid plan plus an IP allow-list.
  Cloudflare Workers' egress IPs rotate. Always submit Web3Forms from the browser.
tags:
- rules
- web3forms
- contact-forms
- cloudflare
- workers
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/forms/web3forms
- architecture/compute/api-umbrella-hono-worker
- rules/interaction/no-card-on-file
---



# Never call Web3Forms from server-side code

Submit Web3Forms exclusively from the browser via `fetch` (or their
documented HTML form post). Never proxy a Web3Forms request through a
Cloudflare Worker, GitHub Action, or any other server-side context.

## Why

Web3Forms has two operating modes:

1. **Browser-side, free** — the access key is included in the form
   payload. Anti-spam runs via referrer + their own heuristics. This is
   the supported, free-tier path.
2. **Server-side, paid** — requires upgrading the plan AND adding the
   caller's egress IP to a static allow-list. Cloudflare Workers do not
   have stable egress IPs (the request can leave from any of dozens of
   PoPs), so the allow-list approach is structurally broken for us.

That puts server-side use squarely on the wrong side of the
[no-card-on-file](../interaction/no-card-on-file.md) rule AND would need a
subscription, which the [no-subscriptions](../infrastructure/no-subscriptions.md) rule
forbids anyway.

## What to do instead

- Submit the form directly from the browser to
  `https://api.web3forms.com/submit` with the public access key.
- The Worker layer should not see the submission at all — there is no
  middle step to add.
- If you need server-side validation or storage, write to Firestore
  from the browser using the user's auth token (still no Worker
  involvement), then trigger any side effects with a separate
  build-time job or a client-driven follow-up call.

## Exceptions

None.

## See also

- [`web3forms.md`](../../services/forms/web3forms.md)
- [`no-card-on-file.md`](../interaction/no-card-on-file.md)
