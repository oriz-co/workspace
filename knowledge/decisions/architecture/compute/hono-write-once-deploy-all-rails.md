---
type: decision
title: "Hono framework \u2014 write once, deploy to all 4 serverless rails"
description: "Locked 2026-06-23. Every API/Worker in the family uses Hono. Same business\
  \ logic compiles to CF Workers, Deno Deploy, AWS Lambda, and Render Node \u2014\
  \ via 4 thin adapter shims (~10 LOC each). Removes per-rail rewrites when failover\
  \ requires switching rails."
tags:
- decision
- framework
- hono
- portability
- serverless
- multi-rail
timestamp: 2026-06-23
format_version: okf-v0.1
status: active
related:
- rules/infrastructure/aws-lambda-exception
- runbooks/free-hosting-providers/serverless-functions
- architecture/compute/api-umbrella-hono-worker
---



# Hono — one app, 4 deployment targets

## Why Hono

Each serverless rail uses a different request/response API:

| Rail | Handler signature |
|---|---|
| CF Workers | `export default { async fetch(req, env, ctx) {} }` — Web Fetch Request → Response |
| Deno Deploy | `Deno.serve(async (req) => {})` — Web Fetch Request → Response |
| AWS Lambda | `export const handler = async (event) => {}` — AWS-shaped JSON event |
| Render (Node) | `app.get('/', (req, res) => {})` — Express-style req/res |

If we wrote raw handlers per rail, swapping rails on failover would require rewriting every endpoint. **Hono is a thin framework that normalizes all four into one Web-Fetch-style API**, and provides adapter functions for the non-Fetch rails.

## The pattern

```typescript
import { Hono } from 'hono'

const app = new Hono()
app.get('/', (c) => c.text('ok'))
app.get('/api/data', async (c) => c.json({ hello: 'world' }))

// Workers (zero changes):
export default app

// Deno Deploy entrypoint:
// Deno.serve(app.fetch)

// AWS Lambda entrypoint (uses Function URL):
// import { handle } from 'hono/aws-lambda'
// export const handler = handle(app)

// Render / Node entrypoint:
// import { serve } from '@hono/node-server'
// serve({ fetch: app.fetch, port: 3000 })
```

**Business logic in `app` is the same.** Only the 1-line entrypoint differs per rail. Adapter shims are ~10 LOC each.

## Bundle size

Hono is 14 KB minified, well under CF Workers' 1 MB limit. Faster cold-start than Express on Node.

## When to use raw handlers instead

- Single-rail forever (e.g. a CF-specific Worker that uses CF-only features like Durable Objects) — Hono adds no value
- Existing Express/Fastify codebase being migrated incrementally

For the family default: **start with Hono**. The 14 KB cost is paid back the first time we need to fail over to a different rail.

## Existing knowledge

Already documented in `architecture/api-umbrella-hono-worker.md` (the Hono Worker that fronts all our APIs at `api.oriz.in`). This decision extends it: ALL new Workers + functions use Hono, not just the umbrella.

## Cross-refs

- AWS Lambda exception → [[rules/aws-lambda-exception]]
- Serverless rail free tiers → [[runbooks/free-hosting-providers/serverless-functions]]
- API umbrella → [[architecture/api-umbrella-hono-worker]]
