---
type: runbook
title: "CF token D1 scope \u2014 required for flag service activation"
description: "The CF API token currently scoped to Workers+KV+Pages can't create D1\
  \ databases (verified 2026-06-23: api returns code 10000 'Authentication error'\
  \ on /accounts/.../d1/database). Two-step fix: (1) add D1:Edit scope to the existing\
  \ token at dash.cloudflare.com/profile/api-tokens, (2) run wrangler d1 create oriz-flags.\
  \ Until this is done, flags.oriz.in returns 503 and apps fall back to default values\
  \ (kill-switch unavailable but app render unaffected \u2014 fail-open by design)."
tags:
- runbook
- cloudflare
- d1
- token-scope
- flags
- manual-step
timestamp: 2026-06-23
format_version: okf-v0.1
status: "SUPERSEDED 2026-06-24 \u2014 the flag worker this runbook unblocks was deleted\
  \ along with `oriz-flags-worker`. The feature-flags system is deferred per `[[feature-flags-deferred]]`;\
  \ if/when revisited, re-derive D1 scoping fresh. Keeping this file as a historical\
  \ CF-token diagnostic reference."
related:
- runbooks/security/feature-flags-storage-2026-06-23
- rules/infrastructure/free-tier-with-cost-controls
---



# CF token D1 scope — manual unblock

## The blocker

CF API token (the one whose ID prefix is `cfut_z4Hc…`, full value in `.env` as `CLOUDFLARE_API_TOKEN`) is verified active but missing **D1:Edit** scope. Symptoms:

```
$ wrangler d1 create oriz-flags
✘ A request to the Cloudflare API failed.
Authentication error [code: 10000]
```

KV creation works (we already created `oriz-flags-kv` = `88abdc6dd41e4ec18b1280215a9d8a98`). Workers deploy also works. Only D1 is blocked.

## Fix (90 seconds, manual)

1. Open https://dash.cloudflare.com/profile/api-tokens
2. Find the existing token (the one whose ID prefix matches `cfut_z4Hc…`)
3. Click "Edit"
4. Under **Permissions**, add a new row:
   - Resource: **Account**
   - Permission: **D1**
   - Access: **Edit**
5. Save. Token continues to work for everything else.

## After fix — run these (5 minutes, automated)

```bash
cd c:/D/oriz/repos/oriz/own/svc/workers/oriz-flags-worker
export CLOUDFLARE_API_TOKEN=$(grep "^CLOUDFLARE_API_TOKEN=" /c/D/oriz/.env | cut -d= -f2)

# 1. Create D1 database
wrangler d1 create oriz-flags
# → returns: database_id = "abc-123-..."
# Paste that into wrangler.toml's database_id field.

# 2. Apply schema (creates flags, flag_rules, flag_changes tables + seeds 3 flags)
wrangler d1 execute oriz-flags --remote --file=schema.sql

# 3. Already-created KV namespace
# id = 88abdc6dd41e4ec18b1280215a9d8a98 — already in wrangler.toml? if not, paste it.

# 4. Set secrets
echo "<comma,separated,uids,from,firebase>" | wrangler secret put ADMIN_ALLOWLIST_UIDS
echo "<new private gist id>" | wrangler secret put SNAPSHOT_GIST_ID
echo "<github PAT with gist scope>" | wrangler secret put SNAPSHOT_GIST_PAT

# 5. Deploy
wrangler deploy
# → flags.oriz.in is live; /tree returns the resolved tree from KV.

# 6. Verify
curl https://flags.oriz.in/tree | jq
# Should return: {"v":1,"ts":...,"flags":{"razorpay-checkout-enabled":{...}, ...}}
```

## Get your Firebase uid (for ADMIN_ALLOWLIST_UIDS)

```bash
# Sign in to https://account.oriz.in/sign-in then open browser DevTools console:
firebase.auth().currentUser.uid
# → copy the string, that's your uid.
```

Or simpler: open `/admin/flags` once after deploy, copy the uid from the 401 response logged in `wrangler tail`.

## Create the DR snapshot gist

```bash
GH=$(grep "^GH_ADMIN_PAT=" /c/D/oriz/.env | cut -d= -f2)
curl -X POST -H "Authorization: token $GH" https://api.github.com/gists \
  -d '{"description":"oriz flags DR snapshot — daily 02:30 UTC","public":false,"files":{"flags-latest.json":{"content":"{}"}}}'
# → response.id is the gist id, paste into wrangler secret put SNAPSHOT_GIST_ID
```

## Until this is done

`flags.oriz.in` returns DNS-not-resolving → app code's `fetch(...)` rejects → `flags()` helper returns `null` tree → every accessor returns the caller's `defaultValue`. **All apps continue to render correctly** — they just can't be kill-switched at runtime. The git-push escape hatch from the deferred-flags decision still works.

## Cross-refs

- Full architecture audit → [[runbooks/feature-flags-storage-2026-06-23]]
- Why this matters → [[decisions/architecture/feature-flags-deferred]] (the YAGNI decision that this supersedes)
