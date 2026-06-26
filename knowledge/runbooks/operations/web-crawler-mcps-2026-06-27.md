---
title: Web crawler MCPs (3-tier fallback)
type: runbook
area: operations
created: 2026-06-27
tags: [mcp, crawler, scraper, firecrawl, apify, smithery, runbook]
---

# Web crawler MCPs (3-tier fallback)

## Why

URL → crawl N pages → markdown for AI agent ingestion. The three tiers degrade gracefully: best quality first, then a service fallback, then a no-key local crawler that always works.

Per the dual-bucket MCP rule: keyed services land in **Smithery** (token never enters the public repo); the no-key local crawler lands in `.mcp.json` (safe to commit).

## Tier 1: firecrawl (Smithery, KEYED — best quality)

JS-rendered scrape + structured crawl with markdown output. Highest quality for SPAs and gated pages.

1. Signup: <https://firecrawl.dev/signup> — free 500 credits/mo, no card.
2. Copy `FIRECRAWL_API_KEY` from the dashboard.
3. Install via Smithery (paste the key on prompt):

   ```bash
   npx -y @smithery/cli@latest install @mendableai/firecrawl-mcp-server --client claude
   ```

Tools exposed: `firecrawl_scrape`, `firecrawl_crawl`, `firecrawl_map`, `firecrawl_search`.

## Tier 2: apify (Smithery, KEYED — fallback)

Massive actor catalog (Web Scraper, Cheerio Scraper, Puppeteer, etc.) reachable through one MCP. Use when firecrawl is over quota or a site needs a specific actor (e.g. Instagram, Twitter, Maps).

1. Signup: <https://console.apify.com/sign-up> — $5 free credit/mo, no card.
2. Copy `APIFY_TOKEN` from Settings → Integrations.
3. Install via Smithery (paste the token on prompt):

   ```bash
   npx -y @smithery/cli@latest install apify/actors-mcp-server --client claude
   ```

Tools exposed: dynamic — depends on which Apify actors you authorise in the Smithery profile.

## Tier 3: crawl-md (in-repo, NO KEY — last resort)

Local Node.js MCP using `fetch` + `turndown`. No external service, no key, no quota. Slower (no JS rendering, single-threaded BFS), but always works and never costs anything.

- Source: `scripts/crawl-mcp/server.js`
- Auto-loaded via `.mcp.json` → no install step needed once the repo is cloned.
- Tool: `crawl(url, max_pages=50, same_origin=true)` → markdown of all crawled pages.
- Hard cap: 200 pages per call. HTML only (skips PDF/images/binaries).

## Fallback decision flow

1. Try `firecrawl_crawl` — best quality, handles JS.
2. If 402/quota or auth-walled site fails → try `apify` actor (e.g. `cheerio-scraper` for static HTML, `puppeteer-scraper` for JS).
3. If both keyed services are out of credits → fall back to `crawl-md` for static HTML.

## Related

- [`keyed-mcp-via-smithery-2026-06-27`](./keyed-mcp-via-smithery-2026-06-27.md) — Smithery install pattern, key rotation.
- Decision: dual-bucket MCP rule (no-key in `.mcp.json`, keyed in Smithery).
