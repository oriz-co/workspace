---
type: architecture
title: "Hono RPC type-sharing \u2014 `hc<typeof app>` client across sites"
description: API consumers get full type inference from the Hono Worker via the rpc
  client. See the decision file for why.
tags:
- architecture
- hono
- rpc
- type-safety
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- decisions/architecture/compute/hono-rpc-for-type-sharing
- architecture/compute/api-umbrella-hono-worker
---



# Hono RPC type-sharing

## Shape

`apps/api/src/index.ts` ends with `export type AppType = typeof app`. The workspace package `packages/api-client/` re-exports `hc<AppType>` configured against `https://api.oriz.in`. Every site and extension imports it:

```ts
import { client } from '@chirag127/api-client'
await client.routes.contact.$post({ json: { ... } })
```

Calls have full IntelliSense on payload + response shape.

## Build flow

The Worker's `AppType` flows through the workspace boundary like any other type — no codegen, no `.d.ts` emit, no OpenAPI spec. Master matrix deploy publishes the Worker and `@chirag127/api-client` in lockstep so consumers never see type drift. A route signature change on the Worker breaks `tsc` in every consumer at the next CI run.

## Cross-refs

- Why → [[decisions/architecture/hono-rpc-for-type-sharing]]
- API umbrella → [[architecture/api-umbrella-hono-worker]]
