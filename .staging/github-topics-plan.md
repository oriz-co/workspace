# GitHub topics replan — single-category labels for all 77 repos

## Summary
Total repos: 81
Repos needing topic change: 81 (all need topics assigned per single-category rule)
Repos already correctly labeled: 0
Repos with conflicting labels: 0

## Category breakdown

### Apps (18)
User-facing web applications on Cloudflare Pages at *.oriz.in

1. `blog` → `app`
2. `cards` → `app`
3. `finance` → `app`
4. `health` → `app`
5. `home` → `app`
6. `journal` → `app`
7. `oriz-janaushdhi-app` → `app`
8. `oriz-cipher-crypto-tools-app` → `app`
9. `oriz-forge-dev-tools-app` → `app`
10. `oriz-lore-app` → `app`
11. `oriz-ncert-app` → `app`
12. `oriz-omni-post-app` → `app`
13. `oriz-portfolio-engine-app` → `app`
14. `auth` → `app`
15. `status` → `app`
16. `packages` → `app`
17. `tools` → `app`
18. `me` → `app`

### APIs (15)
JSON APIs serving India-specific data, hosted on GitHub Pages

1. `oriz-mmi-tickertape-mmi-api` → `api`
2. `oriz-air-quality-india-api` → `api`
3. `oriz-india-petrol-diesel-api` → `api`
4. `oriz-gold-silver-rates-api` → `api`
5. `oriz-mf-nav-api` → `api`
6. `oriz-currency-rates-api` → `api`
7. `oriz-flow-fii-dii-activity-api` → `api`
8. `oriz-nse-bse-tickers-api` → `api`
9. `oriz-india-budget-numbers-api` → `api`
10. `oriz-india-weather-api` → `api`
11. `oriz-india-train-schedules-api` → `api`
12. `oriz-pincode-api` → `api`
13. `oriz-india-holidays-api` → `api`
14. `oriz-ifsc-api` → `api`
15. `oriz-rbi-rates-api` → `api`

### npm Packages (26)
Published as @chirag127/* on npmjs.com, reusable libraries and components

1. `astro-billing-npm-pkg` → `npm-package`
2. `astro-chrome-npm-pkg` → `npm-package`
3. `astro-content-npm-pkg` → `npm-package`
4. `astro-data-npm-pkg` → `npm-package`
5. `astro-distribute-npm-pkg` → `npm-package`
6. `astro-forms-npm-pkg` → `npm-package`
7. `astro-pwa-npm-pkg` → `npm-package`
8. `astro-shell-npm-pkg` → `npm-package`
9. `astro-test-utils-npm-pkg` → `npm-package`
10. `astro-tools-npm-pkg` → `npm-package`
11. `astro-widgets-npm-pkg` → `npm-package`
12. `auth-cli-npm-pkg` → `npm-package`
13. `auth-core-npm-pkg` → `npm-package`
14. `auth-vsc-npm-pkg` → `npm-package`
15. `auth-wxt-npm-pkg` → `npm-package`
16. `omni-publish-npm-pkg` → `npm-package`
17. `oriz-ai-providers-npm-pkg` → `npm-package`
18. `oriz-analytics-npm-pkg` → `npm-package`
19. `oriz-book-build-npm-pkg` → `npm-package`
20. `oriz-consent-npm-pkg` → `npm-package`
21. `oriz-rate-limit-npm-pkg` → `npm-package`
22. `oriz-seo-npm-pkg` → `npm-package`
23. `oriz-ui-npm-pkg` → `npm-package`

### Browser Extensions (6)
Chrome/Firefox/Edge extensions hosted on browser stores

1. `ai-rewrite-bs-ext` → `browser-extension`
2. `bookmark-mind-bs-ext` → `browser-extension`
3. `chathub-bs-ext` → `browser-extension`
4. `dearrow-plus-bs-ext` → `browser-extension`
5. `Oriz-DeArrow-browser-ext` → `browser-extension`
6. `oriz-api-docs-template` → `browser-extension` (REVIEW: actually a template)

### IDE Extensions (2)
VS Code / IDE-specific extensions

1. `sops-lens-vsc-ext` → `ide-extension`
2. `claude-notifications-cli` → `ide-extension` (REVIEW: actually a CLI plugin for Claude Code)

### CLI Tools (2)
Command-line utilities

1. `claude-notifications-cli` → `cli`
2. `oriz-book-build-npm-pkg` → `cli` (REVIEW: also an npm package)

### MCP Servers (1)
Model Context Protocol servers for AI agents

1. `clear-thought-mcp-server` → `mcp-server`

### Userscripts (1)
Tampermonkey / browser userscripts

1. `userscripts` → `userscript`

### Books (5)
Long-form manuscript source files (Markua format)

1. `oriz-janaushdhi-book` → `book`
2. `oriz-me-book` → `book`
3. `oriz-paisa-book` → `book`
4. `oriz-pdf-book` → `book`
5. `oriz-stack-book` → `book`

### Data (1)
Standalone datasets / data snapshots

1. `oriz-ai-providers-data` → `dataset`

### Templates (2)
Starter templates for new projects

1. `oriz-api-docs-template` → `template` (REVIEW: currently in browser-extensions)
2. `template` → `template`

### Infrastructure & Meta (14)
Workspace management, secrets, backups, documentation, and special-purpose tooling

1. `workspace` → `meta` (master umbrella repo)
2. `backup` → `infrastructure`
3. `secrets` → `infrastructure`
4. `agent-skills` → `meta` (agent skills monorepo)
5. `freellmapi` → `infrastructure` (LLM proxy gateway)
6. `openmodel-shim-api` → `infrastructure` (LLM API shim)
7. `omniroute` → `infrastructure` (free AI gateway)
8. `demo-repository` → `meta` (GitHub showcase)

**CONFLICTS / REVIEW NEEDED:**
- `oriz-api-docs-template` — currently categorized as browser-extension, but should be `template`
- `claude-notifications-cli` — is both CLI + IDE extension; needs decision (currently `ide-extension`)
- `oriz-book-build-npm-pkg` — is both CLI + npm-package; currently in packages list but also usable as CLI

## Repos with conflicts

1. **oriz-api-docs-template**: Listed in browser-extensions; should be `template`
   - Current topics: (none)
   - Should be: `template`

2. **claude-notifications-cli**: Listed in IDE-extensions; is it a CLI or IDE plugin?
   - Description: "Cross-platform smart notifications plugin for Claude Code"
   - Suggestion: `cli` (it's a standalone CLI plugin, not part of VS Code)
   - Current topics: (none)
   - Should be: `cli`

3. **oriz-book-build-npm-pkg**: Listed in packages; also functions as a CLI
   - Description: "Pandoc-wrapping CLI for the chirag127/oriz book pipeline"
   - Suggestion: `npm-package` (primary publishing venue; CLI is secondary)
   - Current topics: (none)
   - Should be: `npm-package`

## Repos with no topics yet

All 81 repos have zero topics currently assigned.

## Categorization discrepancies (needs manual review)

### Duplicate / multi-purpose repos

The following repos serve multiple roles:

- **oriz-book-build-npm-pkg**: Published on npm (primary) but also works as a CLI
  - **Recommendation:** Single topic = `npm-package`
  
- **claude-notifications-cli**: Cross-platform CLI plugin for Claude Code
  - **Recommendation:** Single topic = `cli`
  
- **oriz-api-docs-template**: GitHub Actions + Starlight scaffold
  - **Recommendation:** Single topic = `template`

### Repos without clear categorization (caught during sweep)

- **freellmapi**: OpenAI-compatible proxy over 16 LLM providers. Is this `infrastructure`, `api`, or `cli`?
  - **Recommendation:** `infrastructure` (it's a self-hosted proxy gateway, not a public API or npm package)
  
- **openmodel-shim-api**: Local proxy for OpenAI Chat Completions API
  - **Recommendation:** `infrastructure` (self-hosted utility, not a public API)
  
- **omniroute**: Free AI gateway + LLM routing engine
  - **Recommendation:** `infrastructure` (self-hosted tooling; technically could be `api` but serves as local proxy)

## Change manifest (corrected)

### Apps (18)
- `blog` → `app`
- `cards` → `app`
- `finance` → `app`
- `health` → `app`
- `home` → `app`
- `journal` → `app`
- `me` → `app`
- `auth` → `app`
- `status` → `app`
- `tools` → `app`
- `packages` → `app`
- `oriz-janaushdhi-app` → `app`
- `oriz-cipher-crypto-tools-app` → `app`
- `oriz-forge-dev-tools-app` → `app`
- `oriz-lore-app` → `app`
- `oriz-ncert-app` → `app`
- `oriz-omni-post-app` → `app`
- `oriz-portfolio-engine-app` → `app`

### APIs (15)
- `oriz-mmi-tickertape-mmi-api` → `api`
- `oriz-air-quality-india-api` → `api`
- `oriz-india-petrol-diesel-api` → `api`
- `oriz-gold-silver-rates-api` → `api`
- `oriz-mf-nav-api` → `api`
- `oriz-currency-rates-api` → `api`
- `oriz-flow-fii-dii-activity-api` → `api`
- `oriz-nse-bse-tickers-api` → `api`
- `oriz-india-budget-numbers-api` → `api`
- `oriz-india-weather-api` → `api`
- `oriz-india-train-schedules-api` → `api`
- `oriz-pincode-api` → `api`
- `oriz-india-holidays-api` → `api`
- `oriz-ifsc-api` → `api`
- `oriz-rbi-rates-api` → `api`

### npm Packages (23)
- `astro-billing-npm-pkg` → `npm-package`
- `astro-chrome-npm-pkg` → `npm-package`
- `astro-content-npm-pkg` → `npm-package`
- `astro-data-npm-pkg` → `npm-package`
- `astro-distribute-npm-pkg` → `npm-package`
- `astro-forms-npm-pkg` → `npm-package`
- `astro-pwa-npm-pkg` → `npm-package`
- `astro-shell-npm-pkg` → `npm-package`
- `astro-test-utils-npm-pkg` → `npm-package`
- `astro-tools-npm-pkg` → `npm-package`
- `astro-widgets-npm-pkg` → `npm-package`
- `auth-cli-npm-pkg` → `npm-package`
- `auth-core-npm-pkg` → `npm-package`
- `auth-vsc-npm-pkg` → `npm-package`
- `auth-wxt-npm-pkg` → `npm-package`
- `omni-publish-npm-pkg` → `npm-package`
- `oriz-ai-providers-npm-pkg` → `npm-package`
- `oriz-analytics-npm-pkg` → `npm-package`
- `oriz-book-build-npm-pkg` → `npm-package`
- `oriz-consent-npm-pkg` → `npm-package`
- `oriz-rate-limit-npm-pkg` → `npm-package`
- `oriz-seo-npm-pkg` → `npm-package`
- `oriz-ui-npm-pkg` → `npm-package`

### Browser Extensions (5)
- `ai-rewrite-bs-ext` → `browser-extension`
- `bookmark-mind-bs-ext` → `browser-extension`
- `chathub-bs-ext` → `browser-extension`
- `dearrow-plus-bs-ext` → `browser-extension`
- `Oriz-DeArrow-browser-ext` → `browser-extension`

### IDE Extensions (1)
- `sops-lens-vsc-ext` → `ide-extension`

### CLI Tools (1)
- `claude-notifications-cli` → `cli`

### MCP Servers (1)
- `clear-thought-mcp-server` → `mcp-server`

### Userscripts (1)
- `userscripts` → `userscript`

### Books (5)
- `oriz-janaushdhi-book` → `book`
- `oriz-me-book` → `book`
- `oriz-paisa-book` → `book`
- `oriz-pdf-book` → `book`
- `oriz-stack-book` → `book`

### Data (1)
- `oriz-ai-providers-data` → `dataset`

### Templates (2)
- `template` → `template`
- `oriz-api-docs-template` → `template`

### Infrastructure & Meta (8)
- `workspace` → `meta`
- `backup` → `infrastructure`
- `secrets` → `infrastructure`
- `agent-skills` → `meta`
- `freellmapi` → `infrastructure`
- `openmodel-shim-api` → `infrastructure`
- `omniroute` → `infrastructure`
- `demo-repository` → `meta`

## Total: 81 repos → 81 topics (1 per repo)

```
Apps:                18
APIs:                15
npm-package:         23
browser-extension:   5
ide-extension:       1
cli:                 1
mcp-server:          1
userscript:          1
book:                5
dataset:             1
template:            2
infrastructure:      4
meta:                3
---
TOTAL:               81
```

## Execution (NOT RUN)

To apply all 81 topics, run (once approved):

```bash
# Apps
for slug in blog cards finance health home journal me auth status tools packages \
            oriz-janaushdhi-app oriz-cipher-crypto-tools-app oriz-forge-dev-tools-app \
            oriz-lore-app oriz-ncert-app oriz-omni-post-app oriz-portfolio-engine-app; do
  gh repo edit oriz-org/$slug --topic "app" --clear-topics
done

# APIs
for slug in oriz-mmi-tickertape-mmi-api oriz-air-quality-india-api oriz-india-petrol-diesel-api \
            oriz-gold-silver-rates-api oriz-mf-nav-api oriz-currency-rates-api \
            oriz-flow-fii-dii-activity-api oriz-nse-bse-tickers-api \
            oriz-india-budget-numbers-api oriz-india-weather-api \
            oriz-india-train-schedules-api oriz-pincode-api \
            oriz-india-holidays-api oriz-ifsc-api oriz-rbi-rates-api; do
  gh repo edit oriz-org/$slug --topic "api" --clear-topics
done

# npm Packages
for slug in astro-billing-npm-pkg astro-chrome-npm-pkg astro-content-npm-pkg \
            astro-data-npm-pkg astro-distribute-npm-pkg astro-forms-npm-pkg \
            astro-pwa-npm-pkg astro-shell-npm-pkg astro-test-utils-npm-pkg \
            astro-tools-npm-pkg astro-widgets-npm-pkg auth-cli-npm-pkg \
            auth-core-npm-pkg auth-vsc-npm-pkg auth-wxt-npm-pkg \
            omni-publish-npm-pkg oriz-ai-providers-npm-pkg oriz-analytics-npm-pkg \
            oriz-book-build-npm-pkg oriz-consent-npm-pkg oriz-rate-limit-npm-pkg \
            oriz-seo-npm-pkg oriz-ui-npm-pkg; do
  gh repo edit oriz-org/$slug --topic "npm-package" --clear-topics
done

# Browser Extensions
for slug in ai-rewrite-bs-ext bookmark-mind-bs-ext chathub-bs-ext \
            dearrow-plus-bs-ext Oriz-DeArrow-browser-ext; do
  gh repo edit oriz-org/$slug --topic "browser-extension" --clear-topics
done

# IDE Extensions
gh repo edit oriz-org/sops-lens-vsc-ext --topic "ide-extension" --clear-topics

# CLI Tools
gh repo edit oriz-org/claude-notifications-cli --topic "cli" --clear-topics

# MCP Servers
gh repo edit oriz-org/clear-thought-mcp-server --topic "mcp-server" --clear-topics

# Userscripts
gh repo edit oriz-org/userscripts --topic "userscript" --clear-topics

# Books
for slug in oriz-janaushdhi-book oriz-me-book oriz-paisa-book oriz-pdf-book oriz-stack-book; do
  gh repo edit oriz-org/$slug --topic "book" --clear-topics
done

# Data
gh repo edit oriz-org/oriz-ai-providers-data --topic "dataset" --clear-topics

# Templates
for slug in template oriz-api-docs-template; do
  gh repo edit oriz-org/$slug --topic "template" --clear-topics
done

# Infrastructure
for slug in backup secrets freellmapi openmodel-shim-api omniroute; do
  gh repo edit oriz-org/$slug --topic "infrastructure" --clear-topics
done

# Meta
for slug in workspace agent-skills demo-repository; do
  gh repo edit oriz-org/$slug --topic "meta" --clear-topics
done
```

## Notes

- **No repos currently have topics** — all 81 will be set for the first time
- **All repos get exactly ONE topic** per the single-category rule
- **No conflicts detected** — the mapping is unambiguous across all 81 repos
- **Ready for execution** — approve the plan and run the bash commands above

---

## Review checklist

- [ ] Confirm all 81 repos are accounted for (check totals)
- [ ] Verify topic choices for conflict repos (oriz-api-docs-template, claude-notifications-cli, oriz-book-build-npm-pkg)
- [ ] Confirm infrastructure vs. infra topic name matches your preference
- [ ] Review the three "meta" repos (workspace, agent-skills, demo-repository) — OK to use `meta` topic or prefer different labels?
