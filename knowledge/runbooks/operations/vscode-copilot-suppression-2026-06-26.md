---
type: runbook
title: "VS Code Copilot warning suppression + GitHub Copilot Free signup"
description: How to silence VS Code's Copilot setup nag when you don't have a Copilot subscription, and how to claim the free 2k-completions/mo tier (no card).
tags: [vscode, copilot, github, ide, settings, free-tier, no-card]
timestamp: 2026-06-26
format_version: okf-v0.1
status: active
related:
  - rules/interaction/no-card-on-file
  - rules/development/env-example-mirrors-env-with-steps
---

# VS Code Copilot warning suppression + Copilot Free signup

## Context

VS Code 1.95+ ships **bundled Copilot setup UI** even when the extensions are uninstalled. The "Set up Copilot" notification re-appears on startup unless settings explicitly disable it. Microsoft's Copilot-by-default push means there is no toggle in the UI to permanently silence it — the kill must happen in `settings.json`.

## Two paths

### Path A — Take the free tier (recommended)

GitHub Copilot Free (launched Dec 2024) gives every personal GitHub account:

- 2,000 code completions per month
- 50 chat messages per month
- Access to GPT-4o + Claude 3.5 Sonnet
- **No credit card required** — fits the [`no-card-on-file`](../rules/interaction/no-card-on-file.md) rule

Signup steps:

1. Go to `https://github.com/features/copilot` while signed in.
2. Click **"Start using Copilot Free"** (or equivalent CTA).
3. Confirm the activation; no card prompt should appear.
4. In VS Code, install the official `GitHub.copilot` + `GitHub.copilot-chat` extensions.
5. Sign in with the same GitHub account.

Verify the token's `copilot` scope is present:

```bash
val=$(grep -E "^GH_PAT=" .env | cut -d= -f2-)
curl -sI -H "Authorization: Bearer $val" https://api.github.com/user \
  | grep -i 'x-oauth-scopes' | tr ',' '\n' | grep -i copilot
# Expected: ` copilot` in the output
```

### Path B — Disable the bundled UI entirely (no Copilot at all)

If you don't want to take the free tier (avoiding the Microsoft account-data attach, or just disliking the IDE clutter), apply these settings to **both** stable + Insiders:

- `%APPDATA%\Code\User\settings.json`
- `%APPDATA%\Code - Insiders\User\settings.json`

Add (or update) these keys:

```json
{
    "github.copilot.enable": {
        "*": false,
        "plaintext": false,
        "markdown": false,
        "scminput": false,
        "yaml": false
    },
    "github.copilot.chat.welcomeMessage": "never",
    "chat.commandCenter.enabled": false,
    "chat.setupFromDialog": false,
    "chat.disableAIFeatures": true,
    "workbench.welcomePage.experimental.videoTutorials": "off",
    "workbench.tips.enabled": false,
    "extensions.experimental.affinity": {
        "GitHub.copilot": 0,
        "GitHub.copilot-chat": 0
    }
}
```

Then **uninstall** the extensions if they're installed:

```bash
code --uninstall-extension GitHub.copilot 2>/dev/null
code --uninstall-extension GitHub.copilot-chat 2>/dev/null
code-insiders --uninstall-extension GitHub.copilot 2>/dev/null
code-insiders --uninstall-extension GitHub.copilot-chat 2>/dev/null
```

Restart VS Code. The warning should be gone.

## What each setting does

| Setting | Effect |
|---|---|
| `github.copilot.enable.*: false` | Tells the (possibly bundled) Copilot completion engine to do nothing per file type. |
| `github.copilot.chat.welcomeMessage: "never"` | Suppresses the chat panel's first-run greeting. |
| `chat.commandCenter.enabled: false` | Removes the Copilot icon from the title bar's command center. |
| `chat.setupFromDialog: false` | Prevents the modal "Set up Copilot" dialog on startup. |
| `chat.disableAIFeatures: true` | Master switch — turns off all AI surfaces VS Code knows about. |
| `workbench.tips.enabled: false` | Disables the periodic "did you know about Copilot" hints. |
| `extensions.experimental.affinity` | Pins Copilot extensions to extension host 0, isolating their startup cost if they DO get installed by accident. |

## GitHub tokens — what's expected in `.env`

The umbrella `.env` (gitignored, per [`env-example-mirrors-env-with-steps`](../rules/development/env-example-mirrors-env-with-steps.md)) has these GitHub-related vars:

```env
# GitHub Personal Access Token (classic) with the full admin scope set.
# Get one at: https://github.com/settings/tokens
#   1. "Generate new token (classic)"
#   2. Tick: repo, workflow, write:packages, delete_repo, admin:org,
#      admin:enterprise, admin:public_key, admin:repo_hook, gist,
#      notifications, user, audit_log, codespace, copilot, project
#   3. Set "No expiration" or 90 days max
#   4. Copy starts with `ghp_` (40 chars after prefix)
GH_PAT=

# Same scopes as GH_PAT — used by scripts that need admin power.
GH_ADMIN_PAT=

# Default token consumed by `gh` CLI + 3rd-party libraries that read GITHUB_TOKEN.
GITHUB_TOKEN=

# GitHub username (lowercase).
GH_USERNAME=
```

**Audit your tokens** (verify each has `copilot` scope + reads as your user):

```bash
for key in GH_PAT GH_ADMIN_PAT GITHUB_TOKEN; do
  val=$(grep -E "^${key}=" .env | cut -d= -f2-)
  echo "--- $key ---"
  scopes=$(curl -sI -H "Authorization: Bearer $val" https://api.github.com/user \
    | grep -i 'x-oauth-scopes:' | sed 's/^[^:]*: //')
  user=$(curl -s -H "Authorization: Bearer $val" https://api.github.com/user | jq -r .login)
  echo "  user: $user"
  echo "  scopes: $scopes"
done
```

Expected: all 3 return your username + a long scope string including `copilot`.

## Anti-patterns

- **Don't leave API keys in `settings.json`.** The file is plaintext, lives in `%APPDATA%`, and is included in default Windows backups. Use the secret-storage UI of each extension (Cmd/Ctrl+Shift+P → "Secrets: Manage").
- **Don't keep dead PATs in `.env`.** They produce confusing "Bad credentials" errors. Remove the line entirely; the next time you need that integration, create a fresh token + add a fresh line.
- **Don't activate Copilot Free if you don't intend to use it.** Activation attaches usage analytics. If Path B fits better, stay on Path B.

## Verification after applying

1. Close all VS Code windows.
2. Reopen any folder.
3. Watch the bottom-right status bar + the title bar — no "Set up Copilot" badge, no notification toasts.
4. Open Command Palette → search "copilot" → no commands should be exposed for an uninstalled extension.

If a warning still appears, screenshot the exact message — the rule is updated when a specific notification has its own dedicated setting key.
