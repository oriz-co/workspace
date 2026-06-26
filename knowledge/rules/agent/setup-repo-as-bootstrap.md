---
type: rule
title: 'oriz-org/backup is the new-laptop bootstrap + disaster recovery repo'
description: Private repo. Bootstrap script for new-laptop one-command setup + restic disaster recovery + encrypted secrets (sops+age). Slug kept as backup to avoid breaking submodule URLs.
tags: [setup, bootstrap, backup, disaster-recovery, sops, age, secrets, private]
timestamp: 2026-06-27
format_version: okf-v0.1
status: active
related:
  - rules/agent/mcp-no-key-in-repo-keyed-in-smithery
  - decisions/architecture/agent-tooling/headroom-027-docker-2026-06-27
  - decisions/architecture/agent-tooling/task-scheduler-at-login-2026-06-26
---

# Setup repo — oriz-org/backup (private)

## Rule

The private repo `oriz-org/backup` (submodule at `repos/own/backup/`) is the canonical place for:

1. **New-laptop bootstrap** — `bootstrap.ps1` clones the umbrella + installs all software + wires MCPs + decrypts env + starts Hr
2. **Disaster recovery** — `RECOVERY.md` + restic config + recovery keys
3. **Encrypted secrets** — sops+age encrypted env vars, API keys, recovery seeds
4. **Setup scripts** — Hr watchdog, install-mcps, decrypt-secrets, restic-init

## What goes where

| Content | Repo | Visibility |
|---|---|---|
| Public docs (architecture, decisions, rules) | umbrella `knowledge/` | PUBLIC |
| Public MCP no-key configs | umbrella `.mcp.json` | PUBLIC |
| Software install steps | `oriz-org/backup` `winget-packages.txt` | PRIVATE |
| Encrypted env vars | `oriz-org/backup` `secrets/*.enc` | PRIVATE |
| age key recovery instructions (NOT the key) | `oriz-org/backup` `secrets/age-key-instructions.md` | PRIVATE |
| The age key itself | Bitwarden / hardware key | NEVER COMMITTED |
| Bootstrap script | `oriz-org/backup` `bootstrap.ps1` | PRIVATE |
| Watchdog scripts | umbrella `scripts/` (no secrets) OR backup repo `scripts/` (sensitive) | depends |
| Hr Docker compose / Dockerfile | umbrella `.staging/headroom-extras/` | PUBLIC |
| restic config + retention policy | `oriz-org/backup` | PRIVATE |
| RECOVERY.md | `oriz-org/backup` | PRIVATE |

## New-laptop bootstrap flow

```powershell
# Pre-req: Windows 11, gh auth login
git clone https://github.com/oriz-org/workspace.git C:\D\oriz --recurse-submodules
cd C:\D\oriz\repos\own\backup
.\bootstrap.ps1
```

The script:
1. winget installs (Docker, Python, Node, VS Code, gh, age, sops, etc.)
2. Docker Desktop config + start
3. Hr image pull + container create
4. Smithery CLI install + keyed MCP setup prompts
5. sops+age decrypt of `secrets/env.enc`
6. Windows env var hydration (`setx` for each decrypted var)
7. restic init + first backup dry-run

## Why NOT rename the slug

Keep slug `backup` even though scope expanded. Reasons:
- Renaming breaks submodule URLs and GitHub auto-redirect adds confusion
- `oriz-org/setup` would imply ONLY new-laptop work, dropping disaster-recovery framing
- The combined name is unusual but the function is clear from the README

## Cross-refs
- `mcp-no-key-in-repo-keyed-in-smithery` — no keys in PUBLIC repo
- `headroom-027-docker-2026-06-27` — Hr image is in public umbrella, container config in backup
- `task-scheduler-at-login-2026-06-26` — watchdog tasks documented in backup
