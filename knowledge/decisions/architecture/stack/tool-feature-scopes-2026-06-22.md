---
type: decision
title: "Tool app feature scopes (locked 2026-06-22 \u2014 full client-side feature\
  \ sets per app)"
description: Final feature scope per tool app. All tools are 100% client-side (no
  server, no upload). Heavy features deferred to v1+ where bundle size would blow
  budget. Per-app feature list grilled and locked 2026-06-22.
tags:
- decision
- tools
- features
- client-side
- scope
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- decisions/architecture/apps/per-app-briefs-2026-06-22
- decisions/architecture/minimal-ui-library-set
- decisions/architecture/frontend/charts-echarts-lazy
---



# Tool app features (locked)

## slice-pdf — pdf.oriz.in

**Organize:**
- Merge multiple PDFs (drag-drop reorder)
- Split PDF (by page range / every-N-pages / chapter detection)
- Remove pages
- Extract pages
- Organize PDF (re-order pages)
- Rotate pages
- Crop PDF
- Compare PDF (visual diff)

**Convert TO PDF:** JPG → PDF · Word → PDF · PowerPoint → PDF · Excel → PDF · HTML → PDF · Scan → PDF (camera capture)

**Convert FROM PDF:** PDF → JPG · PDF → Word · PDF → PowerPoint · PDF → Excel · PDF → PDF/A

**Edit:**
- Add page numbers
- Add watermark
- Edit PDF (basic text/image manipulation)
- PDF Forms (fill + flatten)

**Security:**
- Unlock PDF (remove password)
- Protect PDF (add password)
- Sign PDF (visible signature)
- Redact PDF

**Optimize:**
- Compress PDF (image downsample)
- Repair PDF (rebuild damaged)
- OCR PDF (Tesseract.js WASM)

**Tech:** `pdf-lib` + `pdfjs-dist` + `tesseract.js` (OCR, lazy) + `mammoth.js` (Word) + `xlsx` (Excel) + `pptxgenjs` (PowerPoint). All client-side.

## pixie-image — image.oriz.in

**Optimize:**
- Compress image (Squoosh-style quality slider)
- Upscale (RealESRGAN via WASM, lazy)

**Create:**
- Background remove (@imgly/background-removal-js, lazy ~30 MB WASM)
- Meme generator (image + caption + Impact font)
- Photo editor (filters, brightness, contrast, saturation, vignette)

**Modify:**
- Resize image
- Crop image
- Rotate image

**Convert:** JPG ↔ PNG ↔ WebP ↔ AVIF ↔ HEIC ↔ SVG · HTML → image (html2canvas)

**Security:**
- Watermark image
- Blur face (face-api.js + canvas blur)

**Tech:** Squoosh codecs + `@imgly/background-removal-js` + `html2canvas` + `face-api.js`. All client-side, lazy-loaded per tool.

## paisa-finance — paisa.oriz.in

**Calculators:**
- EMI calculator (with prepayment schedule)
- Tax calculator (India old regime vs new regime FY 2025-26)
- SIP returns calculator
- FD calculator + RD calculator
- PPF calculator
- NPS calculator
- HRA calculator
- Capital gains (LTCG/STCG)

**Tech:** pure JS math + ECharts for visual schedule. No server.

(FII/DII chart + MMI gauge + credit-card-compare moved to v1; v0 is calculators-only per grill lock.)

## forge-dev — dev.oriz.in

**JSON:**
- Format / minify / validate
- Diff two JSONs (visual)
- JSON path extractor (jq-style)
- JSON schema generator

**Encoders:**
- JWT decoder
- Base64 encode/decode
- URL encode/decode
- HTML entity encode/decode
- Hex / binary / decimal converter

**Dev utilities:**
- Regex tester (with match highlight)
- Cron expression builder + next-fires preview
- curl → fetch converter
- SQL formatter
- HTTP status reference
- HTTP headers reference

**API tester:** Postman-lite client-side (no proxy; CORS gates apply). Save collections to Firestore for Pro+.

**Tech:** monaco-editor (lazy) + jsonpath + jose (JWT) + cronstrue + sql-formatter. All client-side.

## scribe-text — text.oriz.in

**Case + counter:**
- Case converter (upper/lower/title/snake/kebab/camel/pascal/constant)
- Word + character + line counter
- Lorem ipsum generator (paragraphs / words / sentences)

**Diff:**
- Two-pane text diff with highlighting

**Markup:**
- Markdown previewer (live)
- LaTeX → KaTeX preview
- ASCII art generator

**Data:**
- Faker.js wrapper (names / emails / addresses / etc.)
- Lorem ipsum with placeholder images

**Tech:** Marked + KaTeX + diff + faker. All client-side.

## grid-qr — qr.oriz.in

**Generate:**
- Plain text / URL / vCard / WiFi / email / phone / SMS / geo / event
- Styled QR (custom colors, gradient, logo embed)

**Scan:**
- Webcam scanner (@zxing/library)
- Image upload scanner

**Bulk:**
- CSV upload → ZIP of QR PNG/SVG images

**Barcodes:**
- Code-128 / EAN-13 / UPC / ITF / MSI / Code-39 generator

**Tech:** `qr-code-styling` + `@zxing/library` + `jsbarcode` + `jszip`. All client-side.

## shift-convert — convert.oriz.in

**Unit converter:** length / weight / temperature / area / volume / time / speed / data / energy / pressure / angle

**Currency converter:** live rates from `exchangerate.host` (free, no key) with daily cache

**Timezone converter:** multi-zone clock + meeting planner

**Number base:** binary / octal / decimal / hex (with arbitrary base for fun)

**Tech:** `convert-units` + `exchangerate.host` fetch + `date-fns-tz`. Client-side.

## dice-random — random.oriz.in

- Random number (range + count)
- Dice roller (D4/D6/D8/D10/D12/D20/D100, custom dice notation)
- Password generator (length + character classes)
- UUID generator (v1/v4/v7)
- Coin flip
- Custom list shuffler
- Lottery picker
- Color random
- Name picker

**Tech:** `crypto.getRandomValues` for cryptographic randomness. Client-side.

## cipher-crypto — crypto.oriz.in

**Hashes:** MD5 / SHA-1 / SHA-256 / SHA-384 / SHA-512 / SHA-3 / BLAKE2 / RIPEMD-160

**Encryption:** AES-128/192/256 (CBC/GCM/CTR) encrypt+decrypt · ChaCha20 · RSA generate keys + encrypt/sign

**HMAC:** HMAC-SHA256 / HMAC-SHA512

**Encoding:** UUID v1/v4/v7 · bcrypt hash + verify (Argon2 via WASM optional)

**Cert tools:** X.509 cert decoder · CSR generator · SSH key pair generator

**Tech:** Web Crypto API + `node-forge` (cert) + `bcryptjs`. Client-side.

## paper-print — print.oriz.in

- Print preview (paginate any document)
- PDF → printable (margins, headers, footers)
- Multi-page layout (booklet, 2-up, 4-up, n-up)
- Page numbering
- Barcode print sheet (Avery labels)
- QR sticker sheet
- Calendar printable
- Graph paper / dot grid printable

**Tech:** `paper-css` + `print-js`. Client-side.

## vitals-health — vitals.oriz.in

- BMI / BMR / TDEE / body-fat-% calculators
- Calorie counter + macro split
- Water intake tracker
- Step counter (manual input + estimation from time/distance)
- Period tracker (private, Firestore sync for Pro+)
- Sleep tracker
- Heart rate zones calculator
- Pregnancy due-date calculator
- Ovulation calculator

**Tech:** pure JS math + ECharts. Client-side. (Period/sleep/pregnancy use Firestore for Pro+.)

## rank-seo — seo.oriz.in

- Keyword density analyzer
- SERP preview (Google/Bing) with character limits
- Meta tag checker (URL → fetched HTML → meta extraction)
- Open Graph debugger
- Structured-data validator (JSON-LD test)
- Sitemap validator
- robots.txt tester
- IndexNow ping submitter
- TF-IDF analyzer (across URLs)
- Page-speed quick check (Lighthouse-Lite scraped via PageSpeed Insights API free)

**Tech:** CF Worker proxy for fetching arbitrary URLs (CORS) + client-side analysis. ~1 worker call per URL.

## reel-video — video.oriz.in

- Trim (start/end markers)
- Convert (MP4 ↔ WebM ↔ MOV ↔ AVI ↔ MKV)
- Extract audio (MP4 → MP3 / WAV / OGG)
- Compress (CRF slider)
- Generate GIF from clip
- Generate thumbnail
- Watermark video

**Tech:** `ffmpeg.wasm` (~30 MB lazy-loaded). Client-side but heavy; users warned about RAM. v0 ships trim+convert+extract-audio+compress; v0.1 adds GIF+thumbnail+watermark.

## echo-audio — audio.oriz.in

- Convert (MP3 ↔ WAV ↔ OGG ↔ AAC ↔ FLAC)
- Trim
- Extract audio from video
- Pitch / speed adjust
- Reverse / fade-in / fade-out
- Concatenate clips
- Bitrate change
- Volume normalize

**Tech:** Web Audio API + `ffmpeg.wasm` (shared with reel-video) + `lamejs`. Client-side.

## pivot-data — data.oriz.in

- CSV ↔ JSON ↔ Excel (XLSX) ↔ TSV ↔ YAML converter
- Sort / filter / group / pivot table
- Aggregate functions (sum / avg / count / min / max / median)
- Visualize as chart (ECharts integration)
- Data deduplication
- Column re-order + rename
- Type coercion
- Quick chart from selection

**Tech:** `papaparse` + `xlsx` + ECharts + virtualized table for large CSVs. Client-side.

## 16th tool slot

To be decided. Candidates: `oriz-color-palette-tools-app` (color picker, palette generator, contrast checker) OR `oriz-pin-time-tools-app` (timezone-coordinated time/date utility) OR `oriz-emoji-flag-tools-app` (emoji picker, flag finder, special chars). Defer slug to first ship.

## Bundle budgets per tool (Lighthouse perf ≥85)

| Tool | Critical (first paint) | Total page (post-hydration) |
|---|---|---|
| Most tools | <50 KB gzip | <500 KB gzip |
| Tools with ECharts | <50 KB | <800 KB gzip (charts lazy) |
| Tools with ffmpeg.wasm (reel/echo) | <50 KB | <40 MB total (heavy WASM lazy on first use only) |
| pixie with bg-removal | <50 KB | <40 MB total (lazy on first BG-removal) |

## Cross-refs

- Per-app briefs → [[decisions/architecture/per-app-briefs-2026-06-22]]
- Minimal UI lib set → [[decisions/architecture/minimal-ui-library-set]]
- Charts (ECharts lazy) → [[decisions/architecture/charts-echarts-lazy]]
