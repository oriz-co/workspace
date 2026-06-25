---
type: decision
title: "API mocks \u2014 MSW (in-process) + Mockoon (out-of-process), split by surface"
description: Two API-mock tools, one per surface. MSW handles in-browser + in-Node
  test mocks (unit / Vitest, component stories, Playwright dev). Mockoon handles E2E
  + manual dev mocks of third-party APIs (Razorpay sandbox, Open-Meteo, Alpha Vantage
  when offline). Both free OSS. Different surfaces, different reasons.
tags:
- decisions
- architecture
- testing
- api-mock
- msw
- mockoon
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/testing/msw
- services/testing/mockoon
- services/testing/vitest
- services/testing/playwright
- decisions/architecture/general/testing-three-layer
- decisions/architecture/compute/data-apis-open-meteo-alpha-vantage
- decisions/monetisation/razorpay-as-primary-billing
- rules/interaction/no-card-on-file
---



# API mocks — MSW + Mockoon, split by surface

## Decision

Two API-mock tools, one per surface — same posture as the
[AI split between Puter.js and Cloudflare Workers AI](./ai-puter-plus-cf-workers-ai.md):
different surfaces, different tools, no overlap.

1. **In-process mocks** — [MSW (Mock Service Worker)](../../../services/testing/msw.md).
   Service-Worker based in the browser; Node interceptor in tests.
   Used for [Vitest](../../../services/testing/vitest.md) unit / integration
   suites, [Storybook](../../../services/testing/storybook.md) stories
   that need network responses, and `pnpm dev` when the developer
   wants the app to talk to a deterministic stub instead of a live
   upstream.
2. **Out-of-process mocks** — [Mockoon](../../../services/testing/mockoon.md).
   Free OSS desktop app + headless CLI. Used for E2E (
   [Playwright](../../../services/testing/playwright.md)) suites against
   third-party APIs the family doesn't own (Razorpay sandbox,
   Open-Meteo, Alpha Vantage when offline / quota-conscious), and
   for manual exploratory work.

Both free, both OSS, both no card.

## Why

- **No single tool fits both surfaces.** MSW's worker model is
  perfect when the code-under-test is the family's own JS — it
  intercepts inside the same process, so requests / matchers / handlers
  all live in TypeScript next to the test. Mockoon's process model
  is perfect when the code-under-test is the deployed Hono Worker
  hitting a third-party API — Mockoon stands up a separate HTTP
  server on `localhost:3001`, the Worker's `BASE_URL` env points at
  it, and the entire end-to-end pipeline exercises against it.
- **Cost is zero on both.** MSW is MIT OSS via npm. Mockoon is MIT
  OSS — free desktop app, free CLI, no account, no telemetry by
  default.
- **Reuses substrate already required by other family decisions.**
  MSW slots into the existing [Vitest setup](../../../services/testing/vitest.md)
  + [Storybook preview](../../../services/testing/storybook.md) the
  [testing three-layer decision](../general/testing-three-layer.md) already
  ships in `@chirag127/oriz-kit/testing/`. Mockoon CLI runs from
  the same [GitHub Actions schedule](../../../services/cron/github-actions-schedule.md)
  pattern any other CI step uses.
- **Cuts external-API load, which preserves quotas.** Pointing E2E
  at a Mockoon mock instead of the live
  [Alpha Vantage](../../../services/data-api/alpha-vantage.md) endpoint
  keeps the 25 req/day budget for production traffic — same
  rationale as the
  [CF Worker quota mitigation playbook](./cf-worker-quota-mitigation.md):
  burn cheap synthetic substrate first, real quota last.

## Implications

### Where each lives

```text
@chirag127/oriz-kit/testing/
├── msw/
│   ├── handlers.ts          ← shared MSW handlers (Razorpay sandbox, Hono RPC, Firestore REST)
│   ├── server.ts            ← Node-side `setupServer()` for Vitest
│   └── browser.ts           ← Service-Worker `setupWorker()` for Storybook + dev
├── mockoon/
│   ├── razorpay.json        ← Mockoon environment file — Razorpay sandbox endpoints
│   ├── open-meteo.json      ← weather data API — used when offline
│   ├── alpha-vantage.json   ← finance data API — used when offline / quota-conscious
│   └── README.md
```

Per-site `mocks/` directory only carries site-specific handlers;
the shared core ships from oriz-kit.

### MSW surfaces

- **Vitest unit tests** — `setupServer()` started in `vitest.setup.ts`, handlers reset between tests.
- **Storybook** — `setupWorker()` registered in `.storybook/preview.ts`; per-story `parameters.msw.handlers` overrides as needed (Storybook v7+ MSW addon).
- **`pnpm dev`** — opt-in via `VITE_USE_MSW=true` in dev `.env`; the worker registers from `src/main.tsx` only when the flag is on.
- **Playwright E2E (route-level)** — Playwright's `page.route()` is preferred for E2E intercepts when the test needs to mock the *browser's* outbound requests; MSW is reserved for in-process surfaces.

### Mockoon surfaces

- **E2E against deployed Hono Worker** — `wrangler dev` reads `BASE_URL_RAZORPAY=http://localhost:3001` (or whatever Mockoon binds to); Playwright drives the local preview while Mockoon CLI serves the third-party shape on a sibling port.
- **Manual dev when an upstream is rate-limited / down** — developer launches the Mockoon GUI, opens the Razorpay environment, hits "Start", and points the local Worker at it.
- **CI E2E job** — Mockoon CLI (`@mockoon/cli`) runs in a sibling step on the GitHub Actions runner, the Hono Worker's preview URL points at it, Playwright runs the suite. No Razorpay sandbox keys leak into CI; no Alpha Vantage budget burned.

### What we don't mock with these

- **Firestore via REST** — keep the live Firebase emulator if it's already on hand (`firebase emulators:start --only firestore`); MSW is a fallback for unit-test surfaces that don't want to spin the emulator. The
  [firebase-rest-firestore decision](../database/firebase-rest-firestore-not-admin.md)
  already locks the Worker-side approach; mocks at the boundary
  (the REST endpoint) are MSW's job.
- **Cloudflare Workers AI** — has a built-in `--local` mode in
  `wrangler` that uses simulated weights / dummy responses; we
  prefer that to MSW.

### What we don't add

- **No paid mock-server** — Mocky.io paid tier, Postman Mock Server
  paid tier, Beeceptor paid tier all rejected — fights the no-paid-tier
  posture.
- **No SaaS mock service** — even a hypothetical free Postman Mocks
  tier adds another vendor surface for capability already covered by
  two OSS tools.
- **No hand-rolled `fetch` stubs in test files** — handlers always live
  in the shared `msw/handlers.ts` so coverage stays consistent across
  unit + Storybook + dev surfaces.

### Per-PR gating

- MSW handlers + Mockoon JSON files are version-controlled; PR
  changes get reviewed by [CodeRabbit](../../../services/code-quality/coderabbit.md)
  alongside the rest of the diff.
- A drift between an updated upstream API shape and the mock is
  caught by the [test layers](../general/testing-three-layer.md) — Vitest
  (MSW) and Playwright (Mockoon) both run on every PR.

## Cross-refs

- [MSW service entry](../../../services/testing/msw.md)
- [Mockoon service entry](../../../services/testing/mockoon.md)
- [Testing three-layer decision](../general/testing-three-layer.md)
- [Vitest service entry](../../../services/testing/vitest.md)
- [Playwright service entry](../../../services/testing/playwright.md)
- [Storybook service entry](../../../services/testing/storybook.md)
- [testing services index](../../../services/testing/index.md)
- [Razorpay decision (sandbox is the most-mocked upstream)](../../monetisation/razorpay-as-primary-billing.md)
- [Open-Meteo + Alpha Vantage decision (Mockoon's other big customers)](./data-apis-open-meteo-alpha-vantage.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
- [No subscriptions rule](../../../rules/infrastructure/no-subscriptions.md)
