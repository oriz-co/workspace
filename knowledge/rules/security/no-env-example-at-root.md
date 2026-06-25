---
type: rule
title: No .env.example in repo root; per-submodule .env.example is OK
description: .env.enc (sops+age) at the umbrella root preserves all 134 comments +
  65 keys + section structure of .env, making .env.example redundant for the umbrella.
  Do not create .env.example anywhere at the umbrella root. Individual submodules
  MAY have their own .env.example when they document a smaller scope-specific subset
  of env vars.
tags:
- rule
- env
- secrets
- conventions
timestamp: 2026-06-24
format_version: okf-v0.1
status: "SUPERSEDED 2026-06-24 \u2014 the new rule allows .env.example everywhere\
  \ (including umbrella root) provided it's auto-generated from .env so it can't drift.\
  \ The new rule also locks the three-file pattern (.env gitignored / .env.enc committed\
  \ / .env.example committed) for every submodule that consumes env vars. See [[rules/submodule-env-files-three-file-pattern]]\
  \ for the current rule."
superseded_by: rules/submodule-env-files-three-file-pattern
related:
- decisions/security/sops-plus-doppler-hybrid
- rules/security/org-level-secrets-only-no-per-repo
- rules/security/submodule-env-files-three-file-pattern
---



# No `.env.example` at the umbrella root

## Rule

Do NOT create `.env.example` at `c:/D/oriz/.env.example` or anywhere at the umbrella-repo root. The encrypted `.env.enc` (sops+age) already preserves the full structure of `.env` including the 134 section-header comments + 65 keys. A separate plaintext template is redundant noise.

Inside a submodule repo, a per-submodule `.env.example` is fine — those documents a scope-specific subset of keys that the submodule's own developers care about, and they aren't duplicating the umbrella's full structure.

## Why

`.env.example` is conventionally used for two purposes:
1. Letting a new contributor see which keys to fill in
2. Letting tooling (dotenv-cli, framework dev servers) validate that `.env` has all required keys

For the umbrella, (1) is solved by reading `.env.enc` after decryption — solo dev = same person, no contributor onboarding. (2) is solved by the apps' own per-submodule `.env.example` files that each declares only the keys they consume.

Adding a third file at umbrella root with the same shape as `.env`-decrypted would:
- Drift from `.env` over time (someone forgets to update the example)
- Leak the structure of the secret store (which keys exist) without value, since the encrypted blob already lives in git
- Provide no signal `.env.enc` doesn't already

## Cross-refs

- The sops+age workflow: [[decisions/security/sops-plus-doppler-hybrid]]
- Org-level secrets propagation: [[rules/org-level-secrets-only-no-per-repo]]
