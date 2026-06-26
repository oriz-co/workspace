# SOPS Lens — Marketplace publish 2026-06-26

## Result

- **Marketplace URL:** https://marketplace.visualstudio.com/items?itemName=oriz-org.sops-lens
- **Hub URL:** https://marketplace.visualstudio.com/manage/publishers/oriz-org/extensions/sops-lens/hub
- **Extension ID:** `oriz-org.sops-lens`
- **Version:** 0.2.0
- **Package:** 12.4 KB, 6 files
- **Status:** published; propagation may take 5-10 min for fresh publishers

## Build

```bash
cd repos/own/sops-lens-vsc-ext
npm install
npm run compile
npx --yes @vscode/vsce@latest package --no-dependencies --no-git-tag-version
# → sops-lens-0.2.0.vsix
```

## Publish

```bash
export VSCE_PAT="$(grep ^VSCE_PAT= /c/D/oriz/.env | cut -d= -f2-)"
npx --yes @vscode/vsce@latest publish --packagePath sops-lens-0.2.0.vsix
```

## Install locally

```bash
code --install-extension oriz-org.sops-lens --force
# OR from local .vsix:
code --install-extension C:/D/oriz/repos/own/sops-lens-vsc-ext/sops-lens-0.2.0.vsix --force
```

Confirmed installed: `oriz-org.sops-lens@0.2.0` in VS Code stable.

## Token added to .env

`VSCE_PAT` (Azure DevOps PAT with Marketplace > Manage scope). Documented in `.env.example` per the per-repo env-mirror rule.

## Companion tokens added in same answer

- `OVSX_PAT` (43 chars) — for future Open VSX publishing
- `CLOUDFLARE_ACCOUNT_ID` (32 chars) — for wrangler workflows
- `PUBLIC_GITHUB_OAUTH_CLIENT_ID` (20 chars) — for OAuth flows
- `PYPI_API_TOKEN` (179 chars) — for future Python package publishing

All have how-to-obtain comment blocks in `.env.example`.

## Follow-ups

- [ ] Open VSX publish: `npx ovsx publish sops-lens-0.2.0.vsix -p $OVSX_PAT` — covers VSCodium/Cursor/Zed users
- [ ] Add icon (package.json `icon` field currently missing → Marketplace listing uses placeholder)
- [ ] Add CI workflow to auto-publish on tag push (vsce + ovsx in parallel)
