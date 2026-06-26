---
type: rule
title: 'Forks: minimize merge-conflict surface with upstream'
description: When patching a fork (repos/frk/<slug>/), keep our additions in dedicated dirs upstream doesn't touch. Avoid inline edits to upstream-maintained files. Pull from upstream cleanly.
tags: [fork, merge-conflict, upstream, hard-rule]
timestamp: 2026-06-27
format_version: okf-v0.1
status: active
related:
  - rules/agent/preferences/fork-features-also-as-upstream-issues
  - rules/agent/preferences/spare-forks-with-downstream-forkers
  - rules/agent/preferences/fs-own-frk-split
---

# Rule: minimize merge-conflict surface in forks

## Why

Upstream (`tashfeenahmed/freellmapi` etc.) ships changes continuously. Every
inline edit we make to their files is a future merge conflict. Past pain:
upstream merge `5d6937a` broke imports in `server/src/index.ts` because we
had touched it inline.

## How

**Our additions live in directories upstream does not maintain:**

- `deploy/<provider>/` — Azure, Cloudflare, Render, Fly, etc. infra-as-code
- `.github/workflows/oriz-*.yml` — our CI; upstream's stay un-prefixed
- `docs/oriz/` — our docs; upstream's `docs/` files stay theirs
- `scripts/oriz-*` — our helper scripts
- `knowledge/` — never inside a fork; lives at umbrella only

**When we MUST modify upstream code:**

1. Prefer config / env-var hooks over code edits.
2. If a hook doesn't exist, add a tiny shim (`server/src/oriz-shim.ts`) that
   wraps the upstream function instead of editing it.
3. If we must edit inline, do the smallest possible patch and leave a
   `// oriz: <why>` comment so the next merge bot recognises it.
4. NEVER reformat upstream files (linters, whitespace). One re-format = whole
   file conflicts forever.

## Pull-from-upstream flow

```bash
cd repos/frk/<slug>
git fetch upstream
git merge upstream/main -X theirs    # prefer upstream on conflict
# If conflict touches our deploy/ or oriz-* file — manual resolve preserving ours.
# Otherwise -X theirs wins.
```

The `-X theirs` strategy is intentional: upstream owns their files. Our work
lives elsewhere so it survives anyway.

## Anti-patterns

- ❌ Edit upstream `README.md` to add our deploy URL → use `docs/oriz/azure.md`
- ❌ Edit upstream `package.json` scripts → add `scripts/oriz-deploy.cmd`
- ❌ Reformat upstream files with our prettier/eslint config
- ❌ Touch upstream Dockerfile → write `deploy/<provider>/Dockerfile.prod`
- ❌ Rename upstream files (every rename = conflict)

## Cross-refs

- `fork-features-also-as-upstream-issues` — feature patches also become
  upstream issues, so they can land upstream and we can drop our patch
- `spare-forks-with-downstream-forkers` — fewer forks = fewer merge tracks
