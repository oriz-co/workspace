# freellmapi — upstream issues filed 2026-06-26

Filed at `tashfeenahmed/freellmapi`, bundling 28 patches from our fork (`oriz-org/freellmapi`) into 4 thematic feature/improvement issues. Each issue offers individual or omnibus PRs and acknowledges the upstream foundations (closed #287, #326, #343) we built on.

Filing order (smallest/cleanest first): theme 2 → theme 4 → theme 1 → theme 3. All four cross-link to each other.

| # | Theme | Issue | URL | Commits |
|---|---|---|---|---|
| 2 | Fusion mode refinements | [#379](https://github.com/tashfeenahmed/freellmapi/issues/379) | https://github.com/tashfeenahmed/freellmapi/issues/379 | 4 |
| 4 | Operator diagnostics + deploy hardening | [#380](https://github.com/tashfeenahmed/freellmapi/issues/380) | https://github.com/tashfeenahmed/freellmapi/issues/380 | 6 |
| 1 | Catalog management surface | [#381](https://github.com/tashfeenahmed/freellmapi/issues/381) | https://github.com/tashfeenahmed/freellmapi/issues/381 | 9 |
| 3 | Bulk env/model import + suffix parser | [#382](https://github.com/tashfeenahmed/freellmapi/issues/382) | https://github.com/tashfeenahmed/freellmapi/issues/382 | 6 |

**Totals:** 4 issues, 25 unique commits represented across them (28 minus 3 — see below; some commits are referenced from more than one issue's narrative).

## Cross-link these from the fork README

Add a section to `oriz-org/freellmapi/README.md`:

```markdown
## Upstream collaboration

We've filed 4 thematic issues at upstream summarising the 28 fork-local patches we've been running. Each one offers individual or omnibus PRs and acknowledges the upstream foundations we built on:

- [#379 — Fusion mode refinements](https://github.com/tashfeenahmed/freellmapi/issues/379) (SSE wrapping, tool plumbing, vision/tools gate lift, reasoning passthrough)
- [#380 — Operator diagnostics + deploy hardening](https://github.com/tashfeenahmed/freellmapi/issues/380) (penalty inspector, audit panel, Sort by intelligence, encrypted SQLite backup)
- [#381 — Catalog management surface](https://github.com/tashfeenahmed/freellmapi/issues/381) (inline edits, sort/filter, tombstones, capability overrides, `-INTEL<n>` suffix, benchmarks)
- [#382 — Bulk env/model import + suffix parser](https://github.com/tashfeenahmed/freellmapi/issues/382) (`-TOOLS`/`-VISION` parser, custom-prefix triples, embedding routing)
```

## Filing notes / commits handled

- Commit SHA `109425e` in the brief was a typo; the actual commit is `109325e` (`fix(capability-overrides): supports_tools/vision toggles survive catalog-sync`). Verified via message grep against `oriz-org/freellmapi`. All 28 commits represented.
- No sub-bullets dropped due to upstream duplicates. Closed-issue scan against `tombstone`, `penalty`, `-INTEL`, `-TOOLS`, `fusion`, `catalog`, `reasoning_effort`, `thinking`, `benchmark`, `bulk import` surfaced only the foundation issues we acknowledge in the bodies (#287, #326, #343) and adjacent-but-distinct items (#135, #168, #305, #337) which are referenced respectfully where relevant.
- Cross-references between the 4 issues are bidirectional. Bodies of #379 and #380 were backfilled after #381 and #382 were filed so all four reference the full set.
- No `@`-mentions. No PRs submitted.
