# freetheai.xyz provider-add issue

- **Issue:** [tashfeenahmed/freellmapi#384](https://github.com/tashfeenahmed/freellmapi/issues/384)
- **Title:** feat(providers): add FreeTheAi — 50 free OpenAI-compat aliases incl. 1M-ctx Nemotron Ultra, TTS/STT, search APIs
- **Filed:** 2026-06-26

## Why this one isn't bundled into the 4 thematic issues filed earlier

The 4 thematic issues (#379-#382) bundled OUR 28 fork-local patches. This issue (#384) is asking upstream to add a NEW provider — different request, different shape, deserves its own issue.

## Scrape source

- https://freetheai.xyz/models/ — 49 free aliases across 11 prefixes
- https://freetheai.xyz/docs/ — base URL `https://api.freetheai.xyz/v1`, OpenAI/Anthropic/Responses routes, audio routes
- https://freetheai.xyz/pricing/ — paid tier ($5/mo Curated Chat) is optional; free path is genuinely free
- https://freetheai.xyz/setup/ — client lineup overlaps freellmapi audience (Cline, Kilo Code, Zed, OpenCode, SillyTavern, etc.)

## Notable gotcha

Discord-only signup via `/signup` slash command + daily `/checkin` with human-solveable challenge. Friction-real but unautomatable; called out in the issue body so upstream owner can decide if it's worth a `manual_signup: discord` provider flag.
