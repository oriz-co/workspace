# GitHub topics applied — 2026-06-25

Applied a single canonical category topic to each of the 20 surviving submodules in `oriz-org/*`. Used the GitHub Topics API (`PUT /repos/{owner}/{repo}/topics`) so the topic set was **replaced atomically** — any stale topics from prior categorization passes (e.g. `oriz-app`, `category-app`) were cleared.

## Summary

- **Topics applied:** 20 / 20 (HTTP 200 on every PUT)
- **Anomalies:** 0
- **Categories used:** `app` (8), `browser-extension` (3), `api` (3), `infrastructure` (2), `book` (2), `cli` (1), `ide-extension` (1), `meta` (1), `userscript` (1)

## Per-repo result

| Slug | Topic | Verified |
|---|---|---|
| agent-skills | meta | OK |
| ai-rewrite-bs-ext | browser-extension | OK |
| backup | infrastructure | OK |
| blog | app | OK |
| bookmark-mind-bs-ext | browser-extension | OK |
| claude-notifications-cli | cli | OK |
| dearrow-plus-bs-ext | browser-extension | OK |
| freellmapi | api | OK |
| home | infrastructure | OK |
| journal | app | OK |
| me | app | OK |
| omniroute | api | OK |
| oriz-janaushdhi-app | app | OK |
| oriz-janaushdhi-book | book | OK |
| oriz-lore-app | app | OK |
| oriz-me-book | book | OK |
| oriz-mmi-tickertape-mmi-api | api | OK |
| oriz-ncert-app | app | OK |
| sops-lens-vsc-ext | ide-extension | OK |
| userscripts | userscript | OK |

Verification command:

```bash
gh api repos/oriz-org/$slug --jq '.topics | join(",")'
```

Each repo returned exactly one topic equal to the value in the table above.
