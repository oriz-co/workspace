---
type: rule
title: "No hardcoded secrets \u2014 everything via envpact"
description: Secrets never live in source. All secrets come from chirag127/envpact-secrets,
  pulled at dev/build/CI time.
tags:
- rules
- secrets
- security
- envpact
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/tooling/envpact
- runbooks/security/auth-setup
---



# No hardcoded secrets — everything via envpact

No secret value (API key, service-account JSON, signing key, OAuth
client secret, webhook secret, DB token, etc.) is ever hardcoded in
source — not in `.env`, not in TypeScript constants, not in JSON
fixtures, not in README examples.

All secrets come from [envpact](https://github.com/chirag127/envpact-secrets):

```bash
npx envpact-cli@latest   # pulls vault → .env for the current project
```

CI uses `chirag127/envpact-action@v0` with the `ENVPACT_VAULT_TOKEN`
secret.

## Why

Hardcoded secrets in public repos get scraped by bots within minutes
and used. The bill-shock examples on
[`no-card-on-file.md`](../interaction/no-card-on-file.md) include the €54K Gemini
API key leak — that's the model.

Even in private repos, hardcoded secrets compromise the principle of
least surprise: any future contributor (or future agent) reading the
file might leak it on accident.

envpact gives one source of truth, scoped per project, rotatable
without a code change.

## Server vs client secrets

- `FIREBASE_SERVICE_ACCOUNT_KEY` is **server-only** — never bundle
  into a client build, never expose via `import.meta.env.PUBLIC_*`.
- `PUBLIC_FIREBASE_*` keys (apiKey, authDomain, projectId, etc.) are
  safe in the client by Firebase design — they identify, they don't
  authorize. Still pulled via envpact for consistency.
- Worker secrets in Cloudflare Secrets Store (per
  [`apps/api`](../../architecture/compute/api-umbrella-hono-worker.md)) — the
  Worker reads from the binding at runtime; envpact populates the
  binding at deploy time.

## If a secret is ever pasted into chat

Treat it as compromised. The runbook:

1. Revoke + rotate at the relevant dashboard.
2. Re-store in envpact.
3. Update any consumer.
4. Full procedure at [`../runbooks/auth-setup.md`](../../runbooks/security/auth-setup.md).

## Exceptions

None.

## See also

- AGENTS.md "Secrets" section
- [`../services/tooling/envpact.md`](../../services/tooling/envpact.md)
- [`../runbooks/auth-setup.md`](../../runbooks/security/auth-setup.md)
