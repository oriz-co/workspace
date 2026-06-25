---
type: decision
title: Hono RPC for type-safe API client
description: "Type-safe site\u2192API client built via Hono's hc<AppType>. No codegen,\
  \ no schema files \u2014 backend types flow to N frontends through a workspace package."
tags:
- api
- hono
- types
- typescript
- rpc
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- decisions/architecture/compute/hono-worker-api-umbrella
- architecture/compute/api-umbrella-hono-worker
---



# Hono RPC for type-safe API client

## Decision

Sites and extensions call the umbrella Hono Worker via Hono's RPC
client `hc<AppType>`. The Worker exports `type AppType = typeof
app`, which flows to every consumer through the workspace package
`@chirag127/api-client`. No codegen step, no separate schema file,
no OpenAPI emit.

## Why

Hono's `hc` gives end-to-end type-safety for free as long as the
backend and frontend are in the same TypeScript project. Treating
the master oriz repo as a workspace + publishing
`@chirag127/api-client` as a thin re-export of the Worker's
`AppType` lets every site and extension import a fully-typed client
without an intermediate spec file. Eliminates the codegen drift
problem entirely.

## Implications

- `apps/api/src/index.ts` ends with `export type AppType = typeof app;`.
- `packages/api-client/` re-exports `hc<AppType>` and a configured base URL (`https://api.oriz.in`).
- Each site / extension imports `import { client } from '@chirag127/api-client'` and calls `client.routes.contact.$post(...)` etc., with full IntelliSense on payload shape and response.
- When a route changes shape on the Worker, every consumer sees the type error at build time — this is the core value.
- Master matrix deploy runs Worker + API client publish in lockstep so consumers don't see type drift during deploys.
- The pattern applies to extensions too (Chrome extensions importing the same package) — the only constraint is bundling against the workspace package.

## Cross-refs

- [Hono Worker API umbrella](./hono-worker-api-umbrella.md)
- [API umbrella Hono Worker architecture](../../../architecture/compute/api-umbrella-hono-worker.md)
- [AGENTS.md API layer section](../../../AGENTS.md)
