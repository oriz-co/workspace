---
type: rule
title: "Git identity \u2014 always use chirag127's GitHub noreply email"
description: Every commit on this machine attributes to chirag127 via the noreply
  email 76880977+chirag127@users.noreply.github.com. Set globally + locally + in every
  submodule. Past commits with chirag@oriz.in stay (history rewrites cost more than
  the cosmetic win). Going forward, no public email leak in .git history, no chance
  of attribution drift, and GitHub's Select-an-account dialog can't pick a different
  identity.
tags:
- rule
- git
- identity
- github
- attribution
- security
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
- rules/interaction/recruiter-strategy
- rules/interaction/profile-readme-cross-link
---



# Git identity rule

## Rule

Every commit from this machine uses the chirag127 GitHub noreply email:

```
user.name  = Chirag Singhal
user.email = 76880977+chirag127@users.noreply.github.com
```

Set this at:
1. **Global config:** `git config --global user.email "..."` — covers any new clone.
2. **Per-repo config in the umbrella:** `git config user.email "..."` — overrides any inheritance from .gitconfig stashes.
3. **Every submodule's `.git/config`:** the `[user]` section, if it exists, must match. Sweep with `find .git/modules -name config -type f` after any new submodule is added.

## Why noreply, not chirag@oriz.in or whyiswhen@gmail.com

- **Zero public-email exposure.** The noreply email is GitHub-issued and useless for spam-scraping.
- **GitHub-guaranteed attribution.** The numeric prefix `76880977+chirag127` is permanently bound to your user ID on GitHub — even if you rename the account, attribution survives.
- **No verification step.** chirag@oriz.in / whyiswhen@gmail.com require adding to chirag127's verified emails list and confirming via email — extra step that can drift if email auth lapses.

## Windows Credential Manager hygiene

The "Select an account" popup appears when Windows Credential Manager has MULTIPLE GitHub credentials stored (e.g. oriz-co, oriz-org, x-access-token, chirag127). Keep ONLY chirag127. Delete the rest with `cmdkey /delete:<target>` or via the Credential Manager GUI.

## Past commits stay

DO NOT rewrite `chirag@oriz.in` commits to the noreply email retroactively. The rewrite:
- Breaks every fork rebase target (all 78+ submodules)
- Forces every clone to be re-cloned from scratch
- Triggers diff-noise across all 6 mirror hosts on next mirror cron
- Costs hours of mechanical work for cosmetic gain

The .git history is append-only. Going forward = clean. Past = preserved as-is.

## Verification

After any new submodule or after this machine is set up fresh:

```bash
# Should print the noreply email at every level
git config --global user.email
git config user.email   # in the umbrella
git submodule foreach 'git config user.email || git config --global user.email'

# And the credential manager should only show chirag127
cmdkey /list | findstr github
```
