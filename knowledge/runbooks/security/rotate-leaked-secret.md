---
type: runbook
title: Rotate a leaked secret
description: Run when a secret is suspected leaked, has entered any chat transcript,
  or has appeared in an untrusted log. Revoke at the dashboard, reissue, re-login
  locally, store via envpact, verify, then audit recent activity.
tags:
- runbook
- secrets
- security
- incident
- envpact
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- runbooks/security/auth-setup
- rules/security/no-hardcoded-secrets
- policy/secrets-handling
---



# Rotate a leaked secret

Run this runbook the moment a secret is suspected leaked or has
entered any transcript, screenshot, or untrusted log. "Suspected" is
the trigger — don't wait for confirmation.

## Steps

1. **Revoke at the provider's dashboard.** Open the dashboard URL for
    the affected provider — Firebase, Razorpay, Resend, GitHub,
    Cloudflare, etc. The full URL list lives in
    [`auth-setup.md`](./auth-setup.md). Find the leaked credential and
    delete / disable it before doing anything else. Revocation must
    precede reissue — otherwise the leaked secret stays valid during
    the gap.

2. **Reissue a new credential.** Same dashboard, same scope. Copy the
    new value to the clipboard once; don't paste it into any chat.

3. **Re-login locally** if the credential is one a CLI uses
    (`gh auth login`, `firebase login`, `wrangler login`, etc.). For
    pure API keys this step is skipped.

4. **Store via envpact.** Per
    [`../rules/no-hardcoded-secrets.md`](../../rules/security/no-hardcoded-secrets.md),
    every secret lives in envpact, never in `.env` files committed to
    git, never inline in source.

    ```bash
    envpact set <NAME> "<new-value>"
    ```

    Replace `<NAME>` with the canonical env-var name the family uses
    for this credential.

5. **Verify the new credential works.** Run the provider's whoami /
    sanity check:

    | Provider | Sanity check |
    |---|---|
    | GitHub | `gh auth status` |
    | Firebase | `firebase projects:list` |
    | Cloudflare | `wrangler whoami` |
    | Razorpay | curl their `/v1/payments` with limit=1 |
    | Resend | curl their `/domains` endpoint |

6. **Audit recent activity** on the provider's dashboard. Look at the
    "recent activity" / "audit log" / "API usage" section for the
    last 24-48 hours. Specifically scan for:

    - calls from IPs / regions / user-agents you don't recognise
    - usage spikes that pre-date the rotation
    - any successful charge, write, or email that wasn't user-initiated

    If anything looks anomalous, capture timestamps + IPs and escalate
    to the user before continuing further work.

7. **Update `knowledge/log.md`** with a single dated entry:

    ```markdown
    - 2026-06-20 — rotated <provider> <credential-name> after suspected leak
    ```

    Don't include the old or new secret value, even partially.

## Don'ts

- **Don't paste the old or new secret into chat** to "verify it
  rotated". The verification is the dashboard sanity check in step 5.
- **Don't grep the family for the old secret** unless you're certain
  the grep results don't get logged anywhere. Use the provider's
  audit log instead — it's authoritative.
- **Don't postpone any step** to "after I finish what I'm doing". A
  partial rotation is worse than no rotation because it implies false
  safety.

## See also

- [`auth-setup.md`](./auth-setup.md)
- [`../rules/no-hardcoded-secrets.md`](../../rules/security/no-hardcoded-secrets.md)
- [`../policy/secrets-handling.md`](../../policy/secrets-handling.md)
