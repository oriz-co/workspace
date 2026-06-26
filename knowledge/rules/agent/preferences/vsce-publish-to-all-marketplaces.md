---
type: rule
title: "vsce: publish VS Code extensions to all marketplaces"
description: "VS Code extensions ALWAYS publish to both VS Code Marketplace (vsce) AND Open VSX (ovsx) — never just one. Both tokens in .env."
tags: [feedback, agent-preferences, vscode, distribution, publishing]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
---

Every VS Code extension we publish goes to **BOTH** registries, always:

1. **VS Code Marketplace** — `npx @vscode/vsce publish` (uses `VSCE_PAT`)
2. **Open VSX** — `npx ovsx publish *.vsix -p $OVSX_PAT` (covers VSCodium/Cursor/Zed/Continue)

Never publish to just one. CI workflows for VS Code exts must run both in parallel.

Both tokens already in `c:\D\oriz\.env`:
- `VSCE_PAT` (Azure DevOps, Marketplace > Manage)
- `OVSX_PAT` (open-vsx.org)
