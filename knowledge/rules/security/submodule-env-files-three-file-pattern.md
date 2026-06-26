---
type: rule
title: 'Env files in submodules: .env gitignored, .env.enc committed, .env.example
  committed, single age key'
description: "Any submodule that consumes env vars MAY have all 3 env files in its\
  \ root: (1) .env (gitignored, local working copy, the only place real secrets live\
  \ in plaintext), (2) .env.enc (sops+age encrypted, COMMITTED to git so history +\
  \ 6-host mirror cron back it up automatically), (3) .env.example (plaintext, COMMITTED,\
  \ KEY=placeholder format, auto-generated from .env for shape documentation). All\
  \ submodule .env.enc files encrypt with the SAME age key as the umbrella (bw get\
  \ age-key) so recovery is one command from anywhere. Each submodule holds only the\
  \ SUBSET of keys it consumes \u2014 not the full umbrella .env."
tags:
- rule
- env
- secrets
- sops
- age
- submodules
- gitignore
- env-example
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
- decisions/security/sops-plus-doppler-hybrid
- rules/security/org-level-secrets-only-no-per-repo
- rules/development/git-identity-chirag127-noreply
supersedes: rules/no-env-example-at-root
---



# Env files in submodules

## Rule

Any submodule that consumes environment variables in its CI or runtime MAY (and SHOULD, when it has any secret consumption) have these three files in its repo root:

| File | Committed? | Contents | Purpose |
|---|---|---|---|
| `.env` | **NO** (gitignored) | Real secrets, plaintext | Local working copy. Editor reads this when you `pnpm run dev`. |
| `.env.enc` | **YES** | Same as `.env`, encrypted with sops+age | Disaster-recovery backup. Travels with the repo. Mirrors to 6 hosts via the umbrella's mirror cron. |
| `.env.example` | **YES** | Same KEYS as `.env`, `=<placeholder>` for every value | Shape documentation. New collaborator (or future-you on a fresh clone) sees which keys to fill. |

## Gitignore (enforced)

Every submodule's `.gitignore` MUST include `.env` (and any `.env.local`, `.env.development.local` variants the framework supports). The encrypted `.env.enc` and the placeholder `.env.example` are EXPLICITLY NOT ignored — they need to be committed. A correct `.gitignore` block:

```
# Secrets — never commit the plaintext working copy
.env
.env.local
.env.*.local

# These are SAFE to commit (encrypted + placeholder):
!.env.enc
!.env.example
```

## Encryption: single age key, everywhere

ALL `.env.enc` files across the family (umbrella + every submodule that has one) MUST be encrypted with the SAME age key. The key lives in Bitwarden CLI:

```bash
# Retrieve once per machine:
bw get item age-key | bw get notes - > ~/.sops-age-key.txt
export SOPS_AGE_KEY_FILE=~/.sops-age-key.txt

# Encrypt:
sops -e .env > .env.enc

# Decrypt (anywhere, any submodule, any machine):
sops -d .env.enc > .env
```

Single-key advantages:
- Disaster recovery is one command from any submodule
- No key-rotation coordination across N submodules
- Bitwarden is the single recovery point — lose Bitwarden, lose everything (acceptable for solo dev with multiple recovery codes)

## Per-submodule INDEPENDENCE, not subset-of-umbrella

Each submodule's `.env.enc` holds ONLY the keys that submodule actually consumes. Each repo is **independently runnable** — there is no umbrella `.env` superset.

- `oriz-roam-journal-app/.env.enc` → just Firebase config + the journal-specific keys
- `freellmapi/.env.enc` → just the LLM provider API keys it uses
- `oriz-pdf-book/.env.enc` → none (no CI secrets consumed), no `.env.enc` needed

The earlier "umbrella `.env.enc` as 65-key superset" pattern is deprecated per `rules/development/env-example-mirrors-env-with-steps` (2026-06-25 "per-repo independence"). Each repo manages its own env files; cross-repo shared tokens travel through GitHub org-level Actions secrets at build time per `rules/security/github-org-level-secrets`, not through a local umbrella `.env`.

## .env.example shape (per `rules/development/env-example-mirrors-env-with-steps`)

`.env.example` is NOT auto-generated. It's hand-maintained in lock-step with `.env`, with comment blocks documenting every variable. The two files have IDENTICAL keys; only difference is `.env.example` values are blank.

```env
# Firebase Web SDK config (for journal.oriz.in client). Public — embedded
# in the static output. Get it at:
#   1. https://console.firebase.google.com → pick the journal project
#   2. Project settings (gear icon) → "General" tab
#   3. Scroll to "Your apps" → Web app → "SDK setup and configuration"
#   4. Copy the `apiKey` field (39-char string)
PUBLIC_FIREBASE_API_KEY=
```

When a variable is added or changed:
1. Edit both `.env` and `.env.example` in the same commit.
2. `.env` gets the real value; `.env.example` gets a blank value.
3. The comment block above each variable explains what / how to obtain / format.
4. Re-encrypt `.env.enc` (`sops -e .env > .env.enc`) so the encrypted snapshot stays in sync.

## Why this matters

- **Recovery**: clone any submodule from any of 6 mirror hosts + `bw get age-key` + `sops -d .env.enc` → you have a working `.env`. No external SaaS needed (Doppler is the runtime delivery layer, NOT the source of truth — per [[decisions/security/sops-plus-doppler-hybrid]]).
- **Onboarding**: a future collaborator (or fresh-machine future-you) reads `.env.example` to know which keys exist, fills in their own values, runs the app. No need to share the age key with read-only collaborators.
- **CI**: the existing sync-env-to-org-secrets pipeline (or Doppler when set up) reads the umbrella `.env`, pushes to org secrets, propagates to every repo. Submodule `.env.enc` is for HUMAN recovery, not CI runtime.

## Anti-patterns

- **Committing `.env` plaintext.** EVER. Even once, even reverted, even by accident — it's leaked into git history. Recovery: `git filter-repo` + force-push to all 7 git remotes + revoke every key.
- **Different age keys per submodule.** Makes recovery N-step. Defeats the point.
- **`.env.example` with real values "to make dev easier".** That's just `.env` under a different name. Use placeholders.
- **Storing the age key in any repo.** Bitwarden only. Recovery via Bitwarden CLI.
- **Skipping `.env.example` because "the .env.enc has the shape".** The `.env.enc` is unreadable without the key — useless to a collaborator who only needs to know "do I need a FIREBASE_API_KEY?"

## Cross-refs

- Source-of-truth + Doppler runtime sync: [[decisions/security/sops-plus-doppler-hybrid]]
- Org-level secrets propagation rule: [[rules/org-level-secrets-only-no-per-repo]]
- Git identity (separate concern but related): [[rules/git-identity-chirag127-noreply]]
- This rule supersedes the narrower [[rules/no-env-example-at-root]] which said per-submodule .env.example was OK but root was forbidden — the new rule's gitignore + auto-generate practice means .env.example is safe at every level (including the umbrella root, optionally).
