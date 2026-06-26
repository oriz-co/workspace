---
type: service
title: "NPM publish via .env token (bypass 2FA)"
description: "NPM_TOKEN lives in `c:/D/oriz/.env` and is a granular-access-token with 2FA bypass. Use it for unattended `npm publish` — write a temp `~/.npmrc` with `//registry.npmjs.org/:_authToken=$NPM_TOKEN`, publish, restore. Don't ask user for OTP."
tags: [npm, publish, secrets, reference]
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
---

User confirmed 2026-06-21 there's a "bypass pass" in `.env` for publishes. Standard `npm publish` in this shell fails with HTTP 403 ("Two-factor authentication or granular access token with bypass 2fa enabled is required") because the npm account has web-2FA on.

**Workflow:**

```bash
NPM_TOKEN=$(grep -E '^NPM_TOKEN=' c:/D/oriz/.env | head -1 | sed 's/^NPM_TOKEN=//')
# Back up existing ~/.npmrc if any, write the temp one
[[ -f "$HOME/.npmrc" ]] && cp "$HOME/.npmrc" "$HOME/.npmrc.bak.$$"
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > "$HOME/.npmrc"
trap 'mv "$HOME/.npmrc.bak.$$" "$HOME/.npmrc" 2>/dev/null || rm -f "$HOME/.npmrc"' EXIT
npm whoami    # should print chirag127
# ... npm publish ...
```

**How to apply:**
- Any unattended `npm publish` flow: use the .env token, don't prompt the user for OTP.
- Never commit `.env` (it's already gitignored via the family policy).
- The token has publish scope on `@chirag127/*`. Other scopes/registries unaffected.
- Restoring real (non-stub) code to npm: bump version to 0.1.1+, then publish — npm v0.1.0 is immutable past 72h.

Reference script: [`scripts/stub-and-publish-22.sh`](../../scripts/stub-and-publish-22.sh) is the working template.

Related: [`twenty-two-packages-on-npm`](../decisions/architecture/packaging/twenty-two-packages-on-npm.md), [`no-card-on-file-prepaid-escape`](../rules/interaction/no-card-on-file-prepaid-escape.md).
