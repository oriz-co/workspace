# crawl-md MCP

No-key BFS crawler that converts pages to markdown. Tier 3 of the 3-tier web-crawler fallback chain (firecrawl → apify → crawl-md).

## Tools

- `crawl(url, max_pages=50, same_origin=true)` → concatenated markdown of all crawled pages, separated by `---`.

## Limits

- Max 200 pages per call (hard cap).
- HTML only — skips PDF/images/binaries via `content-type` sniff.
- Same-origin by default (toggle with `same_origin: false`).
- No JS rendering — for SPAs use firecrawl (Tier 1) or apify Puppeteer actor (Tier 2).
- 15s timeout per page.

## Install

Auto-loaded by Claude Code via `C:\D\oriz\.mcp.json`:

```json
"crawl-md": {
  "command": "node",
  "args": ["./scripts/crawl-mcp/server.js"]
}
```

Deps installed via `npm install` inside this directory.

## See also

- [`knowledge/runbooks/operations/web-crawler-mcps-2026-06-27.md`](../../knowledge/runbooks/operations/web-crawler-mcps-2026-06-27.md) — full 3-tier runbook.
