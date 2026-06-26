# Polyrepo npm docs — state of the art, June 2026

> Deep-research brief for the `@oriz/*` polyrepo family (5-15 atomic packages, each its own GitHub repo under `oriz-org/<slug>-npm-pkg/`, all submoduled into the umbrella `oriz-org/oriz`). Aggregator docs site target: `packages.oriz.in` on Cloudflare Pages. Astro 6 is the family default. This brief answers 10 numbered questions with citations and copy-paste configs.
>
> Method: 5 parallel WebSearch fan-outs (one per angle) → 60+ URLs → cross-check for adversarial verification → opinionated synthesis. Sources weighted to 2025-2026; older sources retained only where still authoritative.

---

## TL;DR — the picks

| # | Question | Winner | Confidence | Why in one line |
|---|---|---|---|---|
| 1 | Docs site framework | **Astro Starlight 0.41+** | High | Native Content Layer + Pagefind + Astro 6 fit; only framework with first-class "remote markdown from N repos" story |
| 2 | README aggregation | **Astro Content Layer loader + `repository_dispatch` per package + CF Pages deploy hook** | High | Build-time deterministic, sub-second freshness, no commit-back loops |
| 3 | TypeDoc | **Skip per-repo. Run `typedoc-plugin-markdown` once at docs-site level only if public surface > ~5 exports** | High | TypeDoc maintainer himself says it's low value for small libs; JSDoc + IDE hover is enough for 100-300 LOC |
| 4 | Changelog visibility | **Changesets per repo → CHANGELOG.md + GH Releases; aggregated `/releases` page on docs site fetched via GH API** | High | viem/wagmi/Astro/Vitest all do per-package CHANGELOG + docs-site `/releases`; nobody trusts npmjs.com as the changelog surface |
| 5 | Search | **Pagefind** (built into Starlight, zero-config, static) | High | Sub-200 pages, no infra, no card; only switch to Algolia DocSearch if UX limits bite |
| 6 | MDX vs MD for READMEs | **Plain GFM in README.md; MDX confined to docs site** | High | npm + GitHub render GFM only; viem/wagmi/hono/shadcn/Astro all do this |
| 7 | Package catalog page | **Hand-curated card grid (Radix/TanStack pattern) auto-populated from a single `packages.json` in umbrella + shields.io badges** | Medium | shadcn's `registry.json` is the auto-pattern but overkill for 5-15 packages |
| 8 | Versioned routes | **Latest-only. Link to GitHub tags for old versions.** Lucide pattern. | High | Docusaurus's own docs say "most of the time, you don't need versioning"; Starlight has no native support |
| 9 | Knowledge → docs sync | **One-way pull**: docs site reads `knowledge/decisions/architecture/packages/*.md` from the umbrella at build time | High | OKF design is publish-once-read-many; two-way sync is unattested in 2025-2026 sources |
| 10 | Deploy trigger | **CF Pages with `git submodule update --remote --merge` in build command + Deploy Hook URL called from each sibling's release workflow** | High | Skips git pull, no PAT roundtrip, audit trail in CF deploys panel |

---

## 1. Docs site framework — Astro Starlight wins, but the bias is earned

Six contenders evaluated: **Astro Starlight 0.41.0** (Astro 7 support, released 2026), **Nextra 4.x** (Next.js 15-only, App Router exclusive), **VitePress 1.6.x** (Vue/Vite/Vitest), **Docusaurus 3.10.1** (Meta, React/Jest/Prettier), **Fumadocs** (Next.js-native, MDX-first), and **Vocs** (wevm, used by wagmi.sh + viem.sh, tagline "Minimal Docs for Agents & Humans"). The 2026 head-to-heads ([pkgpulse.com Fumadocs vs Nextra v4 vs Starlight, 2026](https://www.pkgpulse.com/guides/fumadocs-vs-nextra-v4-vs-starlight-documentation-sites-2026); [pkgpulse 4-way, 2026-03](https://www.pkgpulse.com/guides/docusaurus-vs-vitepress-vs-nextra-vs-starlight-2026)) converge on: Starlight is the **modern Astro-native** choice, Docusaurus is the most feature-rich (multi-instance, versioning, plugin ecosystem), VitePress is fastest but MDX-weak, Nextra/Fumadocs lock you to Next.js 15, Vocs is minimal but undocumented for multi-repo aggregation.

The load-bearing differentiator for THIS use case ("aggregate READMEs from 5-15 sibling repos") is the **Astro Content Layer API** ([reference](https://docs.astro.build/en/reference/content-loader-reference/); [deep dive 2024-09](https://astro.build/blog/content-layer-deep-dive/)). Two existing loaders are purpose-built: `algorandfoundation/astro-github-loader` and `@larkiny/astro-github-loader` ([npm](https://www.npmjs.com/package/@larkiny/astro-github-loader)). A real reference architecture exists: [`WyattAu/starlight-sites`](https://github.com/WyattAu/starlight-sites) runs **nine Starlight docs sites + cross-site search on Cloudflare Pages** — closest reference architecture to the use case found anywhere.

Astro 6's stabilization of **live content collections** ([Astro 6 beta announcement](https://astro.build/blog/astro-6-beta/); [live content collections deep dive](https://astro.build/blog/live-content-collections-deep-dive/)) adds an optional runtime-fetch path for sub-second freshness without rebuild, though build-time loaders remain the static-friendly default.

Docusaurus's `plugin-content-docs` is multi-instance ([docs](https://docusaurus.io/docs/docs-multi-instance)) but **has no first-class remote loader** ([thread #6086](https://github.com/facebook/docusaurus/discussions/6086); [issue #852](https://github.com/facebook/docusaurus/issues/852)). You'd glue it together with `docusaurus-plugin-remote-content` (110 stars, last v4 release ~2 years ago, [known fan-out failure mode at scale](https://github.com/RDIL/docusaurus-plugin-remote-content/issues/45)). Cross-build search is also a [known gap](https://github.com/praveenn77/docusaurus-lunr-search/issues/113). VitePress's `createContentLoader` is build-time only and MDX-weak. Nextra/Fumadocs require Next.js 15 (rules out static export + CF Pages workflow). Vocs is React+Vite minimal — beautiful (wagmi.sh, viem.sh) but no documented remote-aggregation story.

**Recommendation**: **Astro Starlight 0.41+**. The Astro 6 family default is locked, Pagefind is built-in, Content Layer is the cleanest aggregation primitive in any framework, and a real CF Pages reference architecture already exists. The only blocker would be a hard requirement for versioned docs (Starlight has none natively — see §8), which is not the case for 100-300 LOC packages.

```bash
# Scaffold
npm create astro@latest -- --template starlight packages-oriz-in
cd packages-oriz-in
npm install @larkiny/astro-github-loader
```

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://packages.oriz.in',
  integrations: [
    starlight({
      title: '@oriz packages',
      social: { github: 'https://github.com/oriz-org' },
      sidebar: [{ label: 'Packages', autogenerate: { directory: 'packages' } }],
    }),
  ],
});
```

---

## 2. README aggregation — Content Layer loader + repository_dispatch + CF Deploy Hook

Five candidate patterns: (a) git submodules, (b) GitHub Actions cron, (c) build-time `fetch()` of `raw.githubusercontent.com`, (d) authenticated GitHub API at build, (e) `repository_dispatch` from sibling repos. Each has a different failure profile.

**Submodules** ([Coordinated Polyrepo Pattern, ITNEXT 2025](https://itnext.io/coordinated-polyrepo-pattern-managing-multiple-git-repositories-with-submodules-1610d6ee857a)): lowest-tech, but the rebuild-trigger story is weakest — pins drift, recursive clones slow past 50 submodules, you only rebuild when *you* bump the pin. **GH Actions cron + commit-back** ([Hugo on Cloudflare guide](https://gohugo.io/host-and-deploy/host-on-cloudflare/)): eventually-consistent (1-N hour lag), commit-back loops can trip `[skip ci]` infinite-rebuild guards. **`raw.githubusercontent.com` fetch** ([Astro Markdown guide](https://docs.astro.build/en/guides/markdown-content/); [`natemoo-re/astro-remote`](https://github.com/natemoo-re/astro-remote)): no caching layer, IP-based rate limit that shared CI runners can trip. **GitHub API**: 60 req/hr unauth (fails beyond 5 repos), 5000 req/hr with PAT (fine for ≤100 repos but secrets management required). **`repository_dispatch`** ([peter-evans/repository-dispatch v4](https://github.com/peter-evans/repository-dispatch); [GitHub events docs](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)): sub-second from sibling push to docs build start; only fires on default branch; concurrent dispatches → wasted concurrent builds.

The winning shape combines build-time fetch with externally-triggered rebuild. Astro's Content Layer is the substrate ([loader reference](https://docs.astro.build/en/reference/content-loader-reference/)); two production-grade loaders already exist: [`chenasraf/github-repos-astro-loader`](https://github.com/chenasraf/github-repos-astro-loader) (caches via Astro 5 content store mtime/ETag) and [`gingerchew/astro-github-file-loader`](https://github.com/gingerchew/astro-github-file-loader) (cleanest "pull README from sibling repo" implementation). The Algorand foundation's [`awesome-algorand/starlight-github-loader`](https://github.com/awesome-algorand/starlight-github-loader) extends `docsLoader()` with Octokit fan-out — a direct template for this exact use case.

**Failure modes to design against**:
1. **Rate limits**: use a PAT scoped to `metadata: read` on `oriz-org/*` repos; 5000 req/hr handles 15 repos × build with margin.
2. **Schema drift**: permissive zod schemas; reject malformed remote markdown with a clear log line, don't fail the whole build.
3. **Race on concurrent dispatch**: CF Pages free tier = 1 concurrent build ([CF Pages limits](https://developers.cloudflare.com/pages/platform/limits/)); subsequent dispatches queue. Acceptable for 5-15 packages, NOT acceptable past 50.
4. **PAT lifecycle**: fine-grained PAT belongs to a human; durable answer is a GitHub App owned by `oriz-org` ([fine-grained PAT scope guidance, peter-evans #165](https://github.com/peter-evans/repository-dispatch/issues/165)).

**Recommendation**: Astro Content Layer loader (build-time) + each sibling repo's release workflow fires a `repository_dispatch` AND/OR calls a Cloudflare Pages Deploy Hook ([CF Pages deploy hooks docs](https://developers.cloudflare.com/pages/configuration/deploy-hooks/)). Build-time loader keeps output 100% static; dispatch gives sub-second freshness; CF Deploy Hook is the cleanest wire (no umbrella commit needed). Submodules can stay for the single-clone fleet workflow, but the docs site should not rely on submodule pins for content freshness.

```yaml
# In each package repo: .github/workflows/release.yml
name: release
on: { release: { types: [published] } }
jobs:
  notify-docs:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger packages.oriz.in rebuild
        run: |
          curl -X POST "${{ secrets.PACKAGES_DEPLOY_HOOK }}"
```

```js
// In packages-oriz-in: src/content/config.ts
import { defineCollection, z } from 'astro:content';
import { githubFileLoader } from '@larkiny/astro-github-loader';

const PACKAGES = ['hello-npm-pkg', 'world-npm-pkg' /* ... */];

export const collections = {
  packages: defineCollection({
    loader: githubFileLoader({
      owner: 'oriz-org',
      repos: PACKAGES,
      path: 'README.md',
      ref: 'main',
      token: import.meta.env.GITHUB_TOKEN,
    }),
    schema: z.object({ title: z.string().optional() }).passthrough(),
  }),
};
```

---

## 3. TypeDoc — skip per-repo, run once at docs-site level if at all

TypeDoc's own maintainer Gerrit0 [stated explicitly in 2023](https://github.com/TypeStrong/typedoc/issues/2310) that for simple libraries `.d.ts` + IDE hover is often enough; API-docs-only sites have "significantly lower" value. No source prescribes an LOC threshold, but the **2026 convergent evidence** for tiny packages (100-300 LOC, 1-2 public exports) is:

- **JSR auto-docs kill the case for per-repo TypeDoc** ([JSR writing docs](https://jsr.io/docs/writing-docs); [Deno's JSR announcement](https://deno.com/blog/jsr-is-not-another-package-manager); [maintainer write-up](https://dev.to/fabon/publish-pure-esm-npm-package-written-in-typescript-to-jsr-4ih2)). If you publish to JSR, you get per-version API docs from JSDoc/TSDoc with zero config — modeled on godoc and docs.rs. This eliminates the GH Pages plumbing that makes per-repo TypeDoc painful.
- **Real fleet libraries don't run per-repo TypeDoc**: viem, wagmi, hono, shadcn-ui all have docs sites that **don't show TypeDoc output**. They show hand-authored MDX pages with JSDoc-derived type signatures inlined.
- **If you want API tables in your docs site**, the path is `typedoc-plugin-markdown` ([umbrella project](https://github.com/typedoc2md/typedoc-plugin-markdown)) feeding `starlight-typedoc` ([HiDeoo/starlight-typedoc](https://github.com/HiDeoo/starlight-typedoc)) — one toolchain pass over all packages at docs-build time, not per-repo.

TypeDoc earns its place when (a) public surface > ~5 exports per package, OR (b) types are complex enough that hover-on-IDE doesn't communicate the contract, OR (c) you want type-aware doc cross-linking. None of those describe a 100-300 LOC single-purpose package.

**Microsoft's `@microsoft/api-extractor`** ([npm, v7.58.9 2026-04](https://www.npmjs.com/package/@microsoft/api-extractor)) solves a **different problem** (`.d.ts` rollup, API review reports, breaking-change detection) — pair it with TypeDoc/`api-documenter` only if you need that surface.

**Recommendation**: For tiny `@oriz/*` packages, the default is **zero TypeDoc**. Write a 5-line JSDoc on each exported symbol; IDE hover does the rest. If a single package grows past ~5 exports or starts shipping breaking changes, add `starlight-typedoc` at the docs-site level for that one package — not as a global rule.

---

## 4. Changelog visibility — Changesets per repo + aggregated `/releases` page on docs site

The 2026 narrative is settled. **Changesets** ([levelup, intentional releases](https://levelup.gitconnected.com/intentional-releases-why-chose-changesets-over-semantic-release-9d16d693540b); [polyglot monorepo write-up](https://luke.hsiao.dev/blog/changesets-polyglot-monorepo/)) wins for any setup with more than one published package. **semantic-release** is "set and forget" but couples release timing to commits, removing intent. **release-please** (Google) is the PR-based middle ground ([release-please-action](https://github.com/googleapis/release-please-action)).

Real-library evidence — all use Changesets, all per-package `CHANGELOG.md`, **none aggregate across repo boundaries**:
- [Astro core CHANGELOG.md](https://github.com/withastro/astro/blob/main/packages/astro/CHANGELOG.md) — PRs filed by `astrobot-houston`, canonical Changesets release-bot pattern. Every integration (`@astrojs/node`, etc.) has its own CHANGELOG.
- [viem CHANGELOG.md](https://github.com/wevm/viem/blob/main/src/CHANGELOG.md) + [viem CONTRIBUTING](https://github.com/wevm/viem/blob/main/.github/CONTRIBUTING.md) — documents Changesets workflow verbatim.
- [wagmi CHANGELOG.md](https://github.com/wevm/wagmi/blob/main/packages/core/CHANGELOG.md) — same pattern, same maintainer.
- **Vitest's three-surface solution** ([blog](https://vitest.dev/blog/vitest-4); [`/releases` page](https://main.vitest.dev/releases); [GH Releases mirror](https://github.com/vitest-dev/vitest/releases)): docs-site `/releases` page + major-version blog posts + GH Releases tag mirror. The CHANGELOG.md is **not the user-facing surface** — the docs site is.

**Cross-cutting observation**: nobody trusts npmjs.com as the changelog surface. Every major library links *away* from npm to a docs `/releases` page, blog post, or GH Releases tab. None ship a `homepage` → changelog deeplink in `package.json`.

The aggregation gap is interesting: even wevm (viem + wagmi, same maintainer, same org) doesn't cross-link changelogs. The `oriz-org` opportunity is to fill that gap with a single `packages.oriz.in/releases` page that fans out across all 5-15 repos via GitHub Releases API.

**npm publishing**: 2025-2026 best practice is **OIDC trusted publishers** ([npm docs](https://docs.npmjs.com/trusted-publishers/); [GitHub staged publishing blog 2026-05](https://github.blog/changelog/2026-05-22-staged-publishing-and-new-install-time-controls-for-npm/)) — no long-lived `NPM_TOKEN` in secrets. Wire all three release tools (Changesets/semantic-release/release-please) to this.

**Recommendation**: Changesets per repo → CHANGELOG.md + GH Releases (auto-created by `changesets/action`). Astro Content Layer loader on `packages.oriz.in` fetches `https://api.github.com/repos/oriz-org/{slug}-npm-pkg/releases` at build time, renders an aggregated `/releases` page sorted by date. Mirror Vitest's three-surface pattern.

```yaml
# In each package repo: .github/workflows/release.yml
name: release
on: { push: { branches: [main] } }
permissions: { contents: write, id-token: write, pull-requests: write }
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, registry-url: 'https://registry.npmjs.org' }
      - run: npm ci
      - uses: changesets/action@v1
        with: { publish: npm run release }
        env: { GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} }
```

---

## 5. Search — Pagefind (built into Starlight, free, static, no card)

Five candidates evaluated. For a small docs site (5-15 packages, ~50-200 pages total) the math is overwhelming:

- **[Pagefind](https://pagefind.app/)**: fully static, builds at site-build time, no infra, no hosting. **Ships built-in with Starlight zero-config** ([Starlight site search docs](https://starlight.astro.build/guides/site-search/)). Designed to scale to large sites with minimal bandwidth. This is the answer.
- **[Algolia DocSearch](https://docsearch.algolia.com/docs/docsearch-program/)**: free for OSS/technical blogs ([eligibility, 2026-06](https://docsearch.algolia.com/docs/who-can-apply/)) but **requires application + crawler config + 1-2 business-day manual review** if automated check fails. Switch only if Pagefind UX becomes a genuine limit.
- **[Meilisearch](https://www.meilisearch.com/pricing)**: **no permanently-free Cloud tier** in 2026 — only 14-day trial (no card). Self-host is free OSS but adds infra. Overkill for 50-200 pages.
- **[Orama](https://github.com/oramasearch/orama)**: full-text + vector + hybrid in <2kb; runs in browser/edge. Free OSS. Worth it only if you want **semantic search** inside docs (which is not a need for 5-15 atomic packages).
- **VitePress built-in**: MiniSearch-based local search, config one-liner ([reference](https://vitepress.dev/reference/default-theme-search)). Not relevant since the framework pick is Starlight.

**Recommendation**: **Pagefind**, enabled by default in Starlight. Zero config. Re-evaluate only if (a) indexed content crosses 1MB+, (b) you need typo-tolerance Pagefind can't match, (c) you want analytics on search queries. Algolia DocSearch is the only realistic upgrade target.

---

## 6. MDX vs MD — plain GFM in README, MDX confined to docs site

[npm renders README as GitHub Flavored Markdown via GitHub's API](https://docs.npmjs.com/about-package-readme-files) ([confirmed 2020](https://github.blog/changelog/2020-11-30-npm-uses-github-flavored-markdown/)). **No MDX pipeline**. Even GFM admonitions still lag on npm ([npm/documentation #1240](https://github.com/npm/documentation/issues/1240)). If your README is MDX, components fail to render on both GitHub and npm package pages.

The 2026 idiom across major libraries is unanimous — short, plain GFM README in repo root, MDX only in docs-site:

- [viem repo](https://github.com/wevm/viem) — 64% TS / 36% MDX, **all MDX in `site/`**.
- [wagmi repo](https://github.com/wevm/wagmi) — same split, `site/.vitepress/`.
- [hono repo](https://github.com/honojs/hono) — plain README, zero MDX in repo; docs at hono.dev are separate.
- [shadcn-ui repo](https://github.com/shadcn-ui/ui) — 6-line stub README pointing at ui.shadcn.com/docs; MDX confined to `apps/v4/`.
- [Astro repo](https://github.com/withastro/astro) — plain README; docs in a **separate `withastro/docs` repo** (strongest separation).

[claylo.dev "Markdown Cosplay" (2026-03)](https://claylo.dev/articles/markdown-cosplay/) makes the case: "MDX breaks the contract. Not sometimes. Every time. By design." Data stays in Markdown; interactivity stays in the rendering layer.

The lowest-friction "README also appears as docs page" mechanism is VitePress's `<!--@include: ./path/README.md-->` ([VitePress markdown guide](https://vitepress.dev/guide/markdown)). Starlight requires a custom content loader (see [withastro/starlight #1257](https://github.com/withastro/starlight/discussions/1257)) — exactly what the Pattern §2 loader already does. Docusaurus is awkward (import-wrapper pages or stale `docusaurus-plugin-includes`).

**Recommendation**: README.md is **plain GFM, ~50-100 lines**: badges, tagline, install command, one-paragraph rationale, one usage snippet, link to `packages.oriz.in/<slug>`. MDX with `<Aside>`, `<Tabs>`, interactive demos lives **only** in the docs site, hand-authored per-package or generated from the README via the Content Layer loader. Match the viem/wagmi/Astro idiom verbatim.

```md
<!-- in each package repo: README.md -->
# @oriz/<slug>

![npm](https://img.shields.io/npm/v/@oriz/<slug>)
![bundle](https://img.shields.io/bundlephobia/minzip/@oriz/<slug>)
![license](https://img.shields.io/npm/l/@oriz/<slug>)

One-line tagline. Atomic. Tree-shakeable. Zero deps.

## Install

```bash
npm install @oriz/<slug>
```

## Usage

```ts
import { thing } from '@oriz/<slug>';
thing();
```

## Docs

Full docs at https://packages.oriz.in/<slug>
```

---

## 7. Package catalog page — hand-curated card grid auto-populated from `packages.json`

Two dominant 2026 patterns surveyed:

**Hand-curated card grid** — [Radix Primitives](https://www.radix-ui.com/primitives) renders each primitive as a tile (name + short description); [TanStack](https://tanstack.com/start/v0/docs/framework/react/quick-start) has a sidebar "All Libraries" with categorized list (Start, Router, Query, DB, Store…). Both are hand-curated; metadata lives in the docs repo.

**Auto-populated registry** — [shadcn registry-index](https://ui.shadcn.com/docs/registry/registry-index) ([2025-09 changelog](https://ui.shadcn.com/docs/changelog/2025-09-registry-index); [getting started](https://ui.shadcn.com/docs/registry/getting-started); [discussion #6357](https://github.com/shadcn-ui/ui/discussions/6357)) defines `registry.json` at each repo root; the CLI consumes it. Overkill for 5-15 atomic packages, but interesting if `@oriz/*` becomes a 50+ package fleet.

[Vercel AI SDK](https://github.com/vercel/ai) takes a third route: README of the umbrella repo lists subpackages with short descriptions — classic "manual catalog in README" pattern. [viem.sh](https://viem.sh/) and [wagmi.sh](https://wagmi.sh/react/guides/viem) treat their docs site as single-package marketing pages with feature grids; viem+wagmi cross-link but don't co-publish a catalog.

**Badges** — [shields.io](https://shields.io/) is the de-facto choice ([npm-version badge](https://shields.io/badges/npm-version); [GitHub repo](https://github.com/badges/shields)). Self-hosting is supported. Use shields over npm's own badge service.

**Recommendation**: hybrid. Maintain a single `packages.json` at the umbrella docs site root with `{ slug, title, tagline, category, status }` per package. At build time, fetch live metadata (latest version, install command, repo link, license, weekly downloads) from npm + GitHub APIs via Astro Content Layer. Render as a card grid (Radix/TanStack style). 5-15 entries is small enough that hand-maintaining `packages.json` is trivial. Skip shadcn-style `registry.json` until you hit 50+ packages.

```json
// packages.oriz.in/src/data/packages.json
[
  { "slug": "hello", "title": "@oriz/hello", "tagline": "Atomic greet utility", "category": "string", "status": "stable" },
  { "slug": "world", "title": "@oriz/world", "tagline": "Atomic world utility", "category": "string", "status": "beta" }
]
```

```astro
---
// packages.oriz.in/src/pages/index.astro
import packages from '../data/packages.json';

const enriched = await Promise.all(packages.map(async (p) => {
  const npm = await fetch(`https://registry.npmjs.org/@oriz/${p.slug}`).then(r => r.json());
  return { ...p, version: npm['dist-tags']?.latest, npmUrl: `https://npmjs.com/package/@oriz/${p.slug}` };
}));
---
<div class="grid">
  {enriched.map(p => (
    <a href={`/${p.slug}`} class="card">
      <h3>{p.title}</h3>
      <p>{p.tagline}</p>
      <code>npm i @oriz/{p.slug}</code>
      <span class="badge">v{p.version}</span>
    </a>
  ))}
</div>
```

---

## 8. Versioned docs — latest only, no `/v1` `/v2` routes

[Docusaurus's own versioning docs (2026-04)](https://docusaurus.io/docs/versioning) say verbatim: **"Most of the time, you don't need versioning."** The [migration guide for versioned sites](https://docusaurus.io/docs/migration/v2/versioned-sites) reinforces that versioned bundles balloon repo size and complicate updates. The [HN thread on versioned docs (May 2025)](https://news.ycombinator.com/item?id=44109895) is blunter: "Adding versioned docs exponentially increases complexity and makes updating/reading harder. Lose/lose for [small projects]."

Real evidence:
- **[Lucide](https://lucide.dev/guide/)** hit v1.0 ([guide/version-1](https://lucide.dev/guide/version-1)); docs site is **single-version**, with a dedicated "What's new in v1" page rather than `/v0` + `/v1` routes. [GitHub releases](https://github.com/lucide-icons/lucide/releases) is the version-history surface.
- **[TanStack](https://tanstack.com/start/v0/docs/framework/react/quick-start)** uses `/start/v0/` — versioning-from-day-one for a framework expected to break before v1. Different problem class.

**Starlight has no native versioning** ([discussion #957](https://github.com/withastro/starlight/discussions/957) still open as of Nov 2023+); community workarounds via [`starlight-utils` multi-sidebar](https://stackoverflow.com/questions/77876604/how-to-create-multi-version-documentation-site-with-startlight-and-astro) and a "version your Starlight documentation" plugin in the [official plugin list](https://starlight.astro.build/resources/plugins/). Fragile.

**Recommendation**: latest only. For 100-300 LOC packages with `0.x` semver, the version churn is too rapid to maintain `/v0` `/v0.1` `/v0.2` routes; for `1.x+` packages, breaking changes should be rare enough that `git checkout v1.2.3 && cat README.md` is the right escape hatch. Document the latest API; narrate breaking changes in a "Migration" section per package. Lucide pattern. Revisit only if (a) any single package hits multiple major versions in production use, (b) old API surface is needed without git checkout.

---

## 9. Knowledge bundle integration — one-way pull from `knowledge/` to docs site

**[OKF (Open Knowledge Format)](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)** is real and fresh — Google Cloud announced it ~June 2026 ([spec on GitHub](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md); [Marie Haynes explainer](https://www.mariehaynes.com/okf/); [SEJ coverage](https://www.searchenginejournal.com/google-cloud-announces-the-open-knowledge-format/579253/)) as "an open standard for agent-readable knowledge as directories of markdown files." This is exactly the format `oriz`'s `knowledge/` bundle follows.

OKF's design is **publish-once-read-many** — one source of truth (the `knowledge/` bundle), N consumers (docs site, LLM agents, human readers). Two-way sync between code repo and knowledge repo is **unattested in 2025-2026 sources**. The [OneUptime documentation aggregation guide (Jan 2026)](https://oneuptime.com/blog/post/2026-01-30-documentation-aggregation/view) and the [Starlight multi-instance discussion](https://github.com/withastro/starlight/discussions/956) both favor one-way pull (umbrella reads from sources).

**Complementary conventions**:
- **[AGENTS.md](https://github.com/agentsmd/agents.md)** — open spec, README-for-agents. [OpenAI Codex adopted it](https://developers.openai.com/codex/guides/agents-md); reference example in [openai/codex/AGENTS.md](https://github.com/openai/codex/blob/main/AGENTS.md). [2026 best practices template (Augment Code)](https://www.augmentcode.com/guides/how-to-build-agents-md). Lives at repo root, instructions for coding agents.
- **[llms.txt](https://presenc.ai/research/state-of-llms-txt-2026)** — plain-text root file with curated summary + links for LLM crawlers. **Counterpoint** ([Cameron Rye's "Nobody Uses It"](https://rye.dev/blog/llms-txt-standard-elegant-solution-nobody-using/)): ~10% adoption across 300k domains as of mid-2025; no major LLM provider (OpenAI, Anthropic) auto-fetches it. **Decision**: implementing it costs nothing — use [`starlight-llms-txt`](https://github.com/delucis/starlight-llms-txt) plugin — but don't expect crawler-side magic.

The clean 2026 split for `@oriz/*`:
1. **`AGENTS.md`** at each repo root → instructions for coding agents.
2. **`knowledge/`** OKF bundle in the umbrella repo → durable facts.
3. **`llms.txt`** at `packages.oriz.in` root via `starlight-llms-txt` → public-facing agent index.

**Recommendation**: One-way **pull from `knowledge/decisions/architecture/packages/*.md`** into the docs site at build time via an Astro Content Layer loader (same pattern as §2 but reading from the local filesystem, since umbrella already submodules itself). Each package repo does **not** push to `knowledge/` — the umbrella owns its own facts. Per-package facts that are needed (status, category, position in fleet) come from the umbrella's `packages.json` (§7), which can itself be auto-generated from `knowledge/decisions/architecture/packages/*.md` if desired.

```js
// packages.oriz.in/src/content/config.ts (snippet)
import { glob } from 'astro/loaders';

export const collections = {
  knowledge: defineCollection({
    loader: glob({
      pattern: '**/*.md',
      base: '../knowledge/decisions/architecture/packages', // umbrella-relative path
    }),
    schema: z.object({
      slug: z.string(),
      status: z.enum(['stable', 'beta', 'archived']),
      // ...
    }),
  }),
};
```

---

## 10. Deploy at `packages.oriz.in` — CF Pages + submodules + Deploy Hook

[CF Pages free tier limits (canonical)](https://developers.cloudflare.com/pages/platform/limits/): **1 concurrent build, 500 builds/month, 20-min timeout, 20k files/site**. For 5-15 packages × ~10 releases/month each = 50-150 docs rebuilds/month, well within budget. Free tier is sufficient.

**Submodules on CF Pages**: works, but the [canonical Stack Overflow answer](https://stackoverflow.com/questions/72786625/deploying-repos-with-submodules-using-cloudflare-pages) and [CF community thread](https://community.cloudflare.com/t/pages-build-error-failed-error-occurred-while-updating-repo-submodules/356890) make the constraint clear: **`.gitmodules` URLs must be relative** to the parent repo so CF's parent-repo auth flows down. Absolute `https://github.com/...` URLs trigger an HTTPS-auth prompt CF can't answer. Verify `oriz-org/oriz` uses relative paths already.

**Trigger pattern** — three viable shapes, ranked:

1. **CF Deploy Hook from sibling release workflow** (best). Each sibling repo's `release.yml` `curl`s a stored hook URL ([CF Pages deploy hooks docs](https://developers.cloudflare.com/pages/configuration/deploy-hooks/); [introducing blog post](https://blog.cloudflare.com/introducing-deploy-hooks-for-cloudflare-pages/)). CF Pages clones the umbrella, runs build with `git submodule update --remote --merge` to pick up latest sibling commits, deploys. **No PAT, no umbrella commit, audit trail in CF deploys panel.**
2. **`repository_dispatch` to umbrella** ([peter-evans/repository-dispatch v4](https://github.com/peter-evans/repository-dispatch)). Umbrella has `on: repository_dispatch` workflow that bumps submodule pointer + pushes. Triggers CF Pages via git push. Adds a commit per release; useful if you want the umbrella git history to record sibling releases.
3. **CF Pages cron via GH Actions** ([Hugo CF guide](https://gohugo.io/host-and-deploy/host-on-cloudflare/)). Scheduled workflow calls deploy hook hourly/daily. Worst freshness (1-N hour lag) but zero coupling between sibling repos and umbrella.

**Strategic context**: [CF is folding Pages into Workers Builds](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/) ([2026 migration guide on DEV](https://dev.to/rickcogley/cloudflare-pages-vs-workers-in-2026-migration-guide-ka7)). Pages still works but is in maintenance mode. For a new docs site starting mid-2026, **Workers Builds + static assets** is the forward-compatible target; same submodule + deploy-hook story applies.

**Recommendation**: CF Pages (or Workers Builds) project pointed at `oriz-org/oriz` umbrella repo. Build command: `git submodule update --init --remote --merge && cd docs && npm ci && npm run build`. Output: `docs/dist`. Custom domain: `packages.oriz.in` (CNAME to CF). Generate a Deploy Hook URL, store in each sibling repo as `secrets.PACKAGES_DEPLOY_HOOK`, fire from `release.yml` (snippet in §2). Verify `.gitmodules` uses relative paths.

```bash
# CF Pages build settings
# Build command:
git submodule update --init --remote --merge && cd docs && npm ci && npm run build
# Build output directory: docs/dist
# Root directory: (empty)
# Env vars: GITHUB_TOKEN=<fine-grained PAT, metadata:read on oriz-org/*>
```

```
# .gitmodules in oriz-org/oriz (verify all entries are relative)
[submodule "repos/own/hello-npm-pkg"]
    path = repos/own/hello-npm-pkg
    url = ../hello-npm-pkg
[submodule "repos/own/world-npm-pkg"]
    path = repos/own/world-npm-pkg
    url = ../world-npm-pkg
```

---

## File tree (target shape)

```
oriz-org/oriz/                                    # umbrella repo
├── AGENTS.md
├── README.md
├── CLAUDE.md
├── knowledge/
│   ├── index.md
│   ├── decisions/
│   │   └── architecture/
│   │       └── packages/
│   │           ├── hello.md                      # OKF concept: @oriz/hello
│   │           └── world.md                      # OKF concept: @oriz/world
│   ├── rules/
│   └── runbooks/
├── repos/
│   └── own/
│       ├── hello-npm-pkg/                        # submodule → oriz-org/hello-npm-pkg
│       │   ├── AGENTS.md
│       │   ├── README.md                         # plain GFM, ~80 lines
│       │   ├── CHANGELOG.md                      # changesets-generated
│       │   ├── .changeset/
│       │   ├── src/
│       │   └── package.json
│       └── world-npm-pkg/                        # submodule → oriz-org/world-npm-pkg
└── docs/                                         # packages.oriz.in source
    ├── astro.config.mjs                          # Astro 6 + Starlight 0.41+
    ├── src/
    │   ├── data/
    │   │   └── packages.json                     # hand-curated fleet manifest
    │   ├── content/
    │   │   ├── config.ts                         # Content Layer loaders
    │   │   └── docs/
    │   │       ├── index.mdx
    │   │       └── packages/                     # one MDX per package, mostly auto
    │   └── pages/
    │       ├── index.astro                       # catalog page (cards)
    │       └── releases.astro                    # aggregated /releases
    └── package.json
```

---

## Adversarial verification — claims that survived 2-of-3 challenge

- **"Astro Starlight is the right pick"** — verified across 3 independent 2026 comparison articles (pkgpulse 4-way, pkgpulse 3-way, starterpick). All converge.
- **"CF Pages auto-inits submodules"** — verified by Stack Overflow + CF community thread + Hugo CF guide. All require relative URLs in `.gitmodules`.
- **"TypeDoc is overkill for tiny packages"** — verified directly from TypeDoc maintainer's own statement (TypeStrong/typedoc#2310) + JSR launch blog + practitioner write-up.
- **"Pagefind is enough"** — verified: ships in Starlight, used by Nextra v4 too, no infra. Algolia DocSearch eligibility doc confirms application is required (a friction point Pagefind avoids).
- **"llms.txt is cheap but cosmetic"** — verified by counterpoint piece (Cameron Rye) + adoption stats (~10%). Survives because the cost of shipping it is near-zero.

## Claims that did NOT survive

- Initially considered: "submodules are the rebuild trigger". Refuted by ITNEXT polyrepo pattern article — submodule pins drift, weakest trigger story. Replaced with Deploy Hook from sibling release.
- Initially considered: "Meilisearch free tier is sufficient". Refuted by Meilisearch's own pricing page — no permanent free Cloud tier in 2026, only 14-day trial. Replaced with Pagefind.
- Initially considered: "aggregate changelog across repos like wevm does". Refuted by source check — wevm (viem + wagmi, same maintainer) does NOT aggregate. The aggregation pattern is unattested across polyrepo boundaries; opportunity to be the first.

---

## Citations index (by question)

| Q | Primary sources |
|---|---|
| 1 | [pkgpulse 3-way 2026](https://www.pkgpulse.com/guides/fumadocs-vs-nextra-v4-vs-starlight-documentation-sites-2026), [Astro Content Layer ref](https://docs.astro.build/en/reference/content-loader-reference/), [WyattAu/starlight-sites](https://github.com/WyattAu/starlight-sites), [pkgpulse 4-way](https://www.pkgpulse.com/guides/docusaurus-vs-vitepress-vs-nextra-vs-starlight-2026) |
| 2 | [Content Layer deep dive](https://astro.build/blog/content-layer-deep-dive/), [@larkiny/astro-github-loader](https://www.npmjs.com/package/@larkiny/astro-github-loader), [awesome-algorand/starlight-github-loader](https://github.com/awesome-algorand/starlight-github-loader), [peter-evans/repository-dispatch](https://github.com/peter-evans/repository-dispatch), [CF deploy hooks](https://developers.cloudflare.com/pages/configuration/deploy-hooks/) |
| 3 | [TypeStrong/typedoc #2310](https://github.com/TypeStrong/typedoc/issues/2310), [JSR writing docs](https://jsr.io/docs/writing-docs), [starlight-typedoc](https://github.com/HiDeoo/starlight-typedoc), [typedoc-plugin-markdown](https://github.com/typedoc2md/typedoc-plugin-markdown) |
| 4 | [Changesets intentional releases](https://levelup.gitconnected.com/intentional-releases-why-chose-changesets-over-semantic-release-9d16d693540b), [viem CHANGELOG](https://github.com/wevm/viem/blob/main/src/CHANGELOG.md), [Vitest /releases](https://main.vitest.dev/releases), [npm trusted publishers](https://docs.npmjs.com/trusted-publishers/) |
| 5 | [Starlight site search](https://starlight.astro.build/guides/site-search/), [Pagefind](https://pagefind.app/), [Algolia DocSearch eligibility](https://docsearch.algolia.com/docs/who-can-apply/), [Meilisearch pricing](https://www.meilisearch.com/pricing) |
| 6 | [npm GFM rendering](https://docs.npmjs.com/about-package-readme-files), [Markdown Cosplay](https://claylo.dev/articles/markdown-cosplay/), [viem repo](https://github.com/wevm/viem), [shadcn-ui repo](https://github.com/shadcn-ui/ui) |
| 7 | [Radix Primitives](https://www.radix-ui.com/primitives), [TanStack docs repo](https://github.com/tanstack/tanstack.com), [shadcn registry index](https://ui.shadcn.com/docs/registry/registry-index), [shields.io](https://shields.io/) |
| 8 | [Docusaurus versioning](https://docusaurus.io/docs/versioning), [Lucide guide](https://lucide.dev/guide/), [HN versioned docs thread](https://news.ycombinator.com/item?id=44109895), [Starlight versioning discussion](https://github.com/withastro/starlight/discussions/957) |
| 9 | [OKF Google Cloud blog](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing), [OKF SPEC.md](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md), [AGENTS.md spec](https://github.com/agentsmd/agents.md), [starlight-llms-txt](https://github.com/delucis/starlight-llms-txt), [llms.txt counterpoint](https://rye.dev/blog/llms-txt-standard-elegant-solution-nobody-using/) |
| 10 | [CF Pages limits](https://developers.cloudflare.com/pages/platform/limits/), [CF submodule SO answer](https://stackoverflow.com/questions/72786625/deploying-repos-with-submodules-using-cloudflare-pages), [CF deploy hooks](https://developers.cloudflare.com/pages/configuration/deploy-hooks/), [CF Pages → Workers migration](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/) |

---

*Brief produced via 5-agent parallel WebSearch fan-out + cross-source verification. 60+ URLs surveyed, ~25 cited. Confidence levels reflect convergence across independent sources.*
