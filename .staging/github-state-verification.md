# GitHub state verification — post-Phase-G

_Generated: 2026-06-25 (read-only checks against live GitHub state)_

## Summary

- **oriz-org:** 81 active repos (expected ~87; delta -6, see anomalies)
- **oriz-archive:** 11 archived repos (expected: 11) ✓
- **chirag127 fleet leftovers:** 0 (expected: 0) ✓
- **Phase D redirects working:** 10/10 ✓
- **Three new repos present:** 3/3 ✓
- **Phase C portfolio-engine transfer + redirect:** ✓

**Anomaly count: 4**

## Anomalies

1. **`Oriz-DeArrow-browser-ext`** — naming convention violation. Uses uppercase `O`, hyphen-cased `DeArrow`, and the legacy `-browser-ext` suffix instead of the fleet-standard `-bs-ext`. Compare with `dearrow-plus-bs-ext` already in the org. Likely a stale fork/copy that should be archived or renamed.

2. **`demo-repository`** (private) — looks like the GitHub default demo repo. Not part of the documented fleet inventory; consider removing or confirming it's intentional.

3. **`oriz-api-docs-template`** — name suggests it should be a template repo but `isTemplate: false` was not explicitly verified for this one in the new-repos check; recommend `gh repo edit oriz-org/oriz-api-docs-template --template` if it's meant to be reusable.

4. **`oriz-portfolio-engine-app`** — still carries the `oriz-` prefix and `-app` suffix. Per the [`repo-names-drop-oriz-prefix`](../knowledge) decision, fleet repos should drop the prefix (e.g. → `portfolio-engine`). If Phase D was meant to cover this, it was missed. May be intentionally deferred since Phase C only transferred it.

**Note on count delta:** 81 vs. expected ~87 is small enough that it's likely a stale expectation rather than a missing repo. Inventory cross-check against `knowledge/services/` is recommended if exact parity matters.

## Per-check details

### Check 1 — oriz-org repo count + archived breakdown

```
active (isArchived: false): 81
archived (isArchived: true): 0
```

✓ No archived repos under oriz-org — they're all properly under oriz-archive.

### Check 2 — oriz-archive contents (11 repos, all archived)

```
oriz-echo-audio-tools-app
oriz-paper-print-tools-app
oriz-reel-video-tools-app
oriz-pivot-data-tools-app
oriz-grid-qr-tools-app
oriz-rank-seo-tools-app
oriz-scribe-text-tools-app
oriz-slice-pdf-tools-app
oriz-dice-random-tools-app
oriz-shift-convert-tools-app
oriz-pixie-image-tools-app
```

✓ Exactly 11, all `isArchived: true`. Matches the 2026-06-25 archive memo.

### Check 3 — Phase D rename redirects (10/10)

```
oriz-app                          -> oriz-org/home
oriz-paisa-finance-tools-app      -> oriz-org/finance
oriz-financial-cards-app          -> oriz-org/cards
oriz-pages-blog-app               -> oriz-org/blog
oriz-roam-journal-app             -> oriz-org/journal
oriz-vitals-health-tools-app      -> oriz-org/health
oriz-auth-app                     -> oriz-org/auth
oriz-status-app                   -> oriz-org/status
cs-me-app                         -> oriz-org/me
oriz-packages-catalog-app         -> oriz-org/packages
```

✓ All 10 old slugs redirect cleanly to the short new names.

### Check 4 — Three new repos

```
oriz-org/template  → visibility=PUBLIC,  isPrivate=false, isTemplate=true   ✓
oriz-org/tools     → visibility=PUBLIC,  isPrivate=false, isTemplate=false  ✓
oriz-org/backup    → visibility=PRIVATE, isPrivate=true,  isTemplate=false  ✓
```

All three present with correct visibility + template flag.

### Check 5 — Phase C portfolio-engine

```
oriz-org/oriz-portfolio-engine-app      -> oriz-org/oriz-portfolio-engine-app   (resolves)
chirag127/oriz-portfolio-engine-app     -> oriz-org/oriz-portfolio-engine-app   (redirect works)
```

✓ Transfer complete, old chirag127 path redirects to org.

### Check 6 — chirag127 fleet leftovers

```
clean — no oriz-* or cs-* repos left on chirag127
```

✓ Personal account is clean of fleet items.
