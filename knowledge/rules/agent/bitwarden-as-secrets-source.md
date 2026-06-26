---
type: rule
title: 'Bitwarden CLI as cross-machine secrets source-of-truth'
description: Bitwarden CLI (bw) is the canonical retrieval mechanism for the age key + secondary backup of all other secrets. Read-only on local machine; updates happen in Bitwarden Web UI.
tags: [secrets, bitwarden, age, sops, recovery, industry-standard]
timestamp: 2026-06-27
format_version: okf-v0.1
status: active
related:
  - rules/agent/setup-repo-as-bootstrap
  - rules/agent/mcp-env-sync-both-layers
  - rules/agent/mcp-no-key-in-repo-keyed-in-smithery
---

# Bitwarden CLI — canonical secrets retrieval

## Rule

Bitwarden CLI (`bw`) is the canonical retrieval mechanism for secrets across machines.

| Layer | Role | Source-of-truth direction |
|---|---|---|
| Bitwarden vault | **Read-only source of truth + secondary backup** | Master copy in cloud |
| `~/.age-key.txt` | Local cache fetched on demand | Downstream from Bitwarden |
| Encrypted `secrets/env.enc` (sops+age) | Local encrypted env vars | Encrypted with age key from Bitwarden |
| `BW_SESSION` env var | Per-shell unlock token | Process-scope, ephemeral |
| Win env vars (`setx`) | Per-machine credential cache | PRIMARY for runtime |
| Smithery vault | Per-keyed-MCP credential | PRIMARY for MCP tools |

## How to retrieve on new laptop

Inside `oriz-org/backup/bootstrap.ps1`:
```powershell
.\scripts\bw-fetch-secrets.ps1
```

That script:
1. `npm install -g @bitwarden/cli` if `bw` missing
2. `bw login` (prompts email + password + 2FA)
3. `bw unlock --raw` → `$env:BW_SESSION`
4. `bw get item oriz-age-key | jq -r .notes > ~/.age-key.txt` (owner-only ACL)
5. Then `sops -d secrets/env.enc > .env` works

## Sync direction

ONE-WAY: PRIMARY (Win env / Smithery vault / .env) → Bitwarden vault (manual update after rotation).

The reverse direction (Bitwarden → local) happens only at bootstrap on a new machine. Day-to-day, the PRIMARY caches are read directly.

## Bitwarden item: `oriz-age-key`

- **Type:** Login or Secure Note
- **Name:** `oriz-age-key`
- **Notes field:** the age private key (full `AGE-SECRET-KEY-1...` string, multi-line OK)

## Other secrets in Bitwarden (secondary backup)

After rotation, update Bitwarden item:
- `hai-api-key` ← from hai Desktop App tray (also in Win env + `.env`)
- `github-pat-admin` ← from github.com/settings/tokens (also in `.env`)
- `firecrawl-key`, `apify-token`, etc. ← from each MCP signup (Smithery vault is PRIMARY)
- `ovsx-pat`, `vsce-pat` ← VSIX publishing (Win env + `.env`)

## What this kills

- Manual age-key transfer via USB/email/Slack — replaced by Bitwarden retrieval
- Multiple copies of secrets across machines — Bitwarden is the cross-machine sync
- Forgetting where a key was last rotated — Bitwarden timestamps + audit log

## Anti-patterns

- ❌ Commit `~/.age-key.txt` to any repo (gitignored, but human error possible)
- ❌ Echo `BW_SESSION` to logs/stdout
- ❌ Run `bw login` non-interactively with password in env var (use `bw unlock` after one-time login)
- ❌ Bidirectional sync (Bitwarden ↔ local) — too much conflict risk
- ❌ Self-host Vaultwarden without an offsite backup (single point of failure)

## Recovery from total loss

1. Master password (memorized) + Bitwarden Emergency Access (configured in vault settings)
2. USB offline backup of age key + recovery codes
3. Yubikey for 2FA at separate physical location

Two-of-three required to fully recover.

## Cross-refs

- `setup-repo-as-bootstrap` — oriz-org/backup repo contains `bw-fetch-secrets.ps1`
- `mcp-env-sync-both-layers` — MCP creds in BOTH Win env AND Smithery (NOT Bitwarden primary)
- `mcp-no-key-in-repo-keyed-in-smithery` — never commit any key to public repo
