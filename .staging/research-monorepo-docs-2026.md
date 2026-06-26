# Monorepo + docs tooling 2026

> Deep-research brief, June 2026. Constraints: oriz-org is a polyrepo of ~20 submodules; atomic npm/PyPI packages each live in their own GitHub repo, submoduled into the umbrella at `repos/own/<slug>/`. Astro + polyrepo + category-consolidation + submodules are locked — this brief does **not** propose reversing them. It picks the tooling layer on top.

## TL;DR (the picks for oriz-org)

- **Topology:** Polyrepo with a **meta-repo / virtual-monorepo orchestration layer** (the existing `oriz-org/oriz` umbrella IS the meta-repo). This is now a named, documented 2026 pattern — not an improvisation.
- **Tooling consistency:** **B + A hybrid.** B for CI (a shared `oriz-org/automation` repo of reusable workflows + `oriz-org/.github` for workflow-templates and community-health files), A for code-level configs (publish `@oriz/tsconfig`, `@oriz/eslint-config`, `@oriz/biome-config` and let every repo extend via the language's native `extends` mechanism). Skip C (copy-paste sync) except for genuinely uncopyable files.
- **Release flow:** **release-please + npm/PyPI trusted publishing (OIDC).** One tool covers both npm and PyPI via `release-type: node | python`, PR-based human checkpoint, zero tokens to fan out across 20+ repos, free automatic provenance/Sigstore attestations. Antfu-style `bumpp + changelogithub` as the fallback for ultra-lean repos.
- **Docs platform:** **Astro Starlight per repo + a thin aggregator portal using Pagefind `mergeIndex` for cross-repo search.** TypeDoc + typedoc-plugin-markdown + starlight-typedoc for TS API. Defer versioning until a package actually needs it (ship-at-HEAD posture makes versioning premature).
- **Renovate strategy:** **GitHub-hosted preset repo `oriz-org/renovate-config`** with `default.json` + `lib.json` + `app.json`. Each consumer's `.github/renovate.json` is one line: `"extends": ["github>oriz-org/renovate-config"]`. Run on the free **Mend Renovate Community Cloud**, keep Dependabot enabled in each repo for `github-actions` only (its native GHSA security alerts in the GitHub UI are still a real advantage).

---

## 1. Polyrepo vs monorepo 2026

### The honest state of the debate

The 2025-2026 cycle moved the polyrepo-vs-monorepo argument from ideology to data. The defining new artefact is Faros.ai's 320-team benchmark (March 2026), which measured median PR cycle time of **19h on monorepos vs 2h on polyrepos**, with p90 of 8.6d vs 5.5d. The conclusion the study draws is sharp: "well-engineered monorepo infra can match polyrepo, but the infra has to keep evolving with scale" — and most teams never quite keep pace ([Faros.ai](https://www.faros.ai/blog/monorepo-vs-polyrepo-benchmark-data)).

This is reinforced by Block/Cash App's public post-mortem of their ~450 JVM service polyrepo→monorepo migration ([engineering.block.xyz](https://engineering.block.xyz/blog/from-polyrepo-fragmentation-to-monorepo-leverage), [InfoQ summary](https://www.infoq.com/news/2026/06/block-450-jvm-monorepo-migration/)). Yissachar Radcliffe's headline quote: *"If you can't commit to properly funding a platform team to support a monorepo, you'll probably do better with a polyrepo."* The migration ran ~18 months, required Bazel/Gradle invasive surgery, and produces ~8,800 builds/week with p90 CI of 10 minutes — i.e. it works at scale, but it costs a dedicated platform team.

On the polyrepo side, the canonical 2026 examples are **Netflix** (~5,000 polyrepos, ~3,000 JVM apps, kept consistent via Nebula + Astrid + RocketCI; GOTO 2025 reported 60%+ of fleet deploys daily) and **Cloudflare** (an AI code-review system across "thousands of repositories" with composable plugins, per [blog.cloudflare.com/ai-code-review](https://blog.cloudflare.com/ai-code-review/)). Even Vercel — which sells monorepo tooling for a living — runs polyrepo internally and tells customers in [Vercel Academy](https://vercel.com/academy/production-monorepos/monorepos-vs-polyrepos): *"Choose polyrepos when… different teams, different release cycles, zero coordination."*

### When polyrepo wins (2026 consensus)

- Independent release cadence per package. The atomic npm/PyPI package model is the textbook case.
- Sub-20-engineer teams. PanDev's 2026 study (n=120+) found polyrepo teams of 6-10 repos averaged **9.1 daily context switches** vs 3.2 for monorepos, but absolute productivity was higher because the cognitive overhead of monorepo CI/build-graph configuration dominates at small scale ([PanDev](https://pandev-metrics.com/docs/blog/monorepo-vs-polyrepo-impact)).
- Polyglot fleets where each language ships to its own registry. Even Nx 21's polyglot release support (Java/Go/Rust on separate registries) is acknowledged as a workaround, not a feature ([nx.dev/blog/nx-21-release](https://nx.dev/blog/nx-21-release)).
- Strong isolation requirements — each repo has its own auth, CODEOWNERS, branch protection.

### When monorepo wins

- Cross-cutting refactors across 10+ packages in a single PR. This is the genuine monorepo superpower and the reason Google/Meta keep paying for Piper/the Mercurial fork.
- Large dedicated platform team (Block's threshold). Below that, infra rot dominates.
- AI coding agents — monorepos give better default context for cross-cutting changes. This is the new (2025-2026) forcing function pushing some teams toward monorepos. Note that the meta-repo pattern below explicitly tries to deliver the same context to polyrepo fleets.
- Language uniformity. JS/TS-only fleets pay much lower monorepo tax than polyglot fleets.

### The hybrid (meta-repo) model — viable in 2026? Yes.

The hybrid pattern now has a name. Multiple names, actually:

- **meta-repo** ([mateodelnorte/meta](https://github.com/mateodelnorte/meta) — Node, established; [gitkb/meta](https://github.com/gitkb/meta) — Rust rewrite, Mar 2025)
- **virtual monorepo**
- **repo-of-repos** ([Rafferty Uy, May 2026](https://www.raffertyuy.com/raztype/repo-of-repos-pattern/))
- **polyrepo synthesis** ([Rajiv Pant, Nov 2025](https://rajiv.com/blog/2025/11/30/polyrepo-synthesis-synthesis-coding-across-multiple-repositories-with-claude-code-in-visual-studio-code/))
- **spine pattern**

The shape is the same: a thin orchestration repo (manifests, docs, agent config, shared scripts) over independent repos, with `git submodule` or `meta`-style manifest-driven cloning. This is exactly what `oriz-org/oriz` already is — repos/own/\<slug\>/ submodules + shared `knowledge/` brain + shared `.staging/`.

Tooling supporting this in 2026:

- **Nx 21** added `nx import` explicitly as a polyrepo-to-monorepo migration tool **preserving git history** — a hedge in case the meta-repo eventually grows into a true monorepo.
- **Turborepo 2.8** (Jan 2026) added **shared local cache across git worktrees**, explicitly targeting agentic-coding multi-branch workflows ([turborepo.dev/blog/2-8](https://turborepo.dev/blog/2-8)).
- **moon v2.2** (Apr 2026) added a background daemon with hot in-memory workspace graph and **first-class polyrepo support** (the "moon is monorepo-only" assumption is now wrong) ([moonrepo.dev/blog/moon-v2.2](https://moonrepo.dev/blog/moon-v2.2)).
- **Devnewsletter "Meta-Repo Pattern"** ([devnewsletter.com](https://devnewsletter.com/p/meta-repo-pattern/)) formalises the pattern as a 2026 architectural option.

### Top 2026 examples

**Polyrepo at scale:**
1. Netflix (~5,000 repos, polyglot, Nebula/Astrid/RocketCI for consistency)
2. Cloudflare (thousands of repos, AI code review system shared across them)
3. Amazon (per-team service repos, Brazil build system)
4. Anthony Fu's personal fleet (dozens of single-package npm repos using bumpp + changelogithub)
5. Most of the OSS/Vercel/Astro ecosystem at the org level (per-product CI in each product repo; `.github` has only community-health files)

**Monorepo at scale:**
1. Google (Piper, 2B+ LoC, 86 TB, 9M files, 35M commits — fully custom VCS/build/search stack)
2. Meta (Mercurial fork)
3. Block/Cash App (recent migration, ~450 JVM services in one Bazel monorepo)
4. Stripe (single Ruby+Go monorepo, internal Bazel-equivalent)
5. Microsoft (Babel Git Virtual File System for the Windows source tree)

**Meta-repo / hybrid:**
1. The `mateodelnorte/meta` ecosystem itself
2. Many startups using Turborepo on top of git submodules
3. Various Backstage TechDocs deployments (per-service repo + Backstage portal)
4. The `polyrepopro/polyrepo` and `gitkb/meta` communities
5. oriz-org (this fleet)

### Key tooling releases worth noting

- **Nx 21.0** (May 2025): "Continuous tasks", `nx import` for polyrepo migration with history preservation.
- **Nx 22.x** (Oct 2025 - Dec 2025): rewrote `nx release` with custom version actions for polyglot.
- **Turborepo 2.9** (Mar 2026): ~96% faster TTFT after daemon removal; `turbo query` GraphQL stable.
- **Turborepo 2.6** (Oct 2025): first-class microfrontend support; Bun stable.
- **moon v2.2** (Apr 2026): background daemon, hot graph, polyrepo-first.

Verdict: **the meta-repo / virtual-monorepo pattern is the 2026 right answer for oriz-org.** It's the named pattern that matches what you already have, and the new tooling (Turborepo worktree cache, moon polyrepo support, Nx import escape hatch) means you keep options open.

---

## 2. Cross-repo tooling consistency

### The three approaches

**A. Published base config packages.** `@oriz/tsconfig`, `@oriz/eslint-config`, `@oriz/biome-config`. Each repo extends via the language's native `extends` mechanism.

**B. Shared `.github` template repo + reusable workflows.** Workflow templates surface in the "New workflow" UI org-wide; reusable workflows are runtime imports (`uses: org/repo/.github/workflows/x.yml@ref`).

**C. Copy-paste with a sync bot.** Tools like `syncpack`, probot apps like Temper, or scripted GitHub Actions that fan out file changes to every repo.

### Comparing them on the 2026 evidence

**ESLint flat config era.** ESLint 9 made `eslint.config.js` (flat config) the default; `eslintrc` is deprecated. The dominant community preset is **`@antfu/eslint-config`** — ~391.9k weekly downloads, 373 dependents, 6.17k stars, single-line consumption: `export default antfu({ typescript: true, vue: true })`. `@sxzz/eslint-config` is the credible "Antfu with Prettier instead of stylistic" alternative (v8.1.0, requires Node ≥20 + ESLint ≥9.5). Both ship a function-or-array users spread into their config ([antfu/eslint-config](https://github.com/antfu/eslint-config), [sxzz/eslint-config](https://www.npmjs.com/package/@sxzz/eslint-config), [eslint.org migrate-to-9](https://eslint.org/docs/latest/use/migrate-to-9.0.0)).

**TypeScript base configs.** `tsconfig/bases` is the canonical community repo, publishing per-target packages (`@tsconfig/node-lts`, `@tsconfig/strictest`, `@tsconfig/vite-react`, etc.). TS 5.0+ supports **array-form extends**, so a single `tsconfig.json` can compose multiple bases:

```jsonc
{ "extends": ["@tsconfig/bases/strictest", "@tsconfig/bases/node18"] }
```

The friction is near zero ([tsconfig/bases](https://github.com/tsconfig/bases/blob/main/README.md), [TS 5.0 RC announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0-rc/#supporting-multiple-configuration-files-in-extends)).

**Biome v2.** Added first-class `extends` and shared-config-package support — `biome.json` now accepts an `extends` array of file paths, plus the `"//"` micro-syntax for nested configs to inherit from the workspace root, and a documented "share via package `exports`" workflow ([biomejs.dev/reference/configuration](https://biomejs.dev/reference/configuration/), [biomejs.dev/guides/big-projects](https://biomejs.dev/guides/big-projects/)). Independent 2026 reviews ([devtoolbox.blog](https://devtoolbox.blog/biome-vs-eslint-prettier-2026-2/), [toolchew.com](https://toolchew.com/en/review-biome-2/)) note Biome v2 closes the v1 blockers (multi-file analysis, type-aware rules without `tsc`, custom rules) but still lacks `import/no-cycle`, `eslint-plugin-testing-library`, and most of the ESLint plugin ecosystem. **Verdict: new projects = Biome viable; established codebases = stay on ESLint+Prettier.**

**GitHub workflow templates vs reusable workflows.** Different things. Templates are scaffolding (drop YAML + `.properties.json` into `<org>/.github/workflow-templates/`; they show in the "New workflow" UI). Reusable workflows are runtime imports — and crucially, GitHub raised the limits in **November 2025 to 10 nested levels and 50 calls per run** (from 4/20), removing the historical scale objection ([github.blog 2025-11-06](https://github.blog/changelog/2025-11-06-new-releases-for-github-actions-november-2025/), [docs.github.com workflow-templates](https://docs.github.com/actions/sharing-automations/creating-workflow-templates-for-your-organization)).

**Real-world examples.** The "big orgs all use reusable workflows" trope is **overstated**. Checking actual `.github` repos:

- **`withastro/automation`** — Astro org does run this model. Described as "Centralized repo for GitHub actions for the `withastro` org," exposes `congratsbot.yml`, `format.yml`, etc. consumed via `uses: withastro/automation/.github/workflows/<name>.yml@<sha>` with `if: github.repository_owner == 'withastro'` gating.
- **`vercel/.github`** and **`cloudflare/.github`** — both **minimal**: community-health files only. Per-product CI lives in each product repo. ([vercel/.github](https://github.com/vercel/.github), [cloudflare/.github](https://github.com/cloudflare/.github))

So the choice is real, not a copy-the-big-co reflex.

### Pick: B + A hybrid

**For CI: Pattern B (a shared `oriz-org/automation` repo of reusable workflows + `oriz-org/.github` for workflow-templates and community-health files).**

- One-line callers in each repo (`uses: oriz-org/automation/.github/workflows/_release.yml@main`), zero copy-paste drift, central security/perf updates apply on next push.
- November 2025 limit increase (10/50) eliminates the scale objection.
- Workflow templates handle "scaffold a new repo's CI"; reusable workflows handle "update CI for every existing repo".
- The Astro org's `withastro/automation` is a working reference at exactly your scale.

**For code-tooling configs: Pattern A (published base packages on npm).**

- `tsconfig.json`: publish `@oriz/tsconfig` exporting `base.json`, `node.json`, `astro.json`, `library.json`. Each repo extends via TS's native array-extends. Or just adopt `@tsconfig/strictest` from the community repo and skip maintaining your own.
- ESLint: publish `@oriz/eslint-config` exporting a flat-config function. **Decision point:** maintaining your own preset is high-effort vs adopting `@antfu/eslint-config` directly (391k weekly DLs, battle-tested, exact-match for the Astro+TS+Vue ecosystem). Recommendation: **adopt `@antfu/eslint-config` directly** and only publish a thin `@oriz/eslint-config` wrapper if/when you accumulate enough oriz-specific overrides to justify it.
- Biome (if you adopt single-tool): publish `@oriz/biome-config` with `biome.json` exported via package `exports`, then each repo's `biome.json` does `"extends": "@oriz/biome-config/biome"`. Native v2 mechanism.

**Skip Pattern C (copy-paste sync) except where unavoidable.** Copy-paste only wins when the config format genuinely doesn't support extends (rare in 2026 — tsconfig, eslint flat, biome, renovate, dependabot all support it). For version consistency across `package.json`s (where there's no `extends` equivalent), use **`syncpack`** with `versionGroups` and `snapTo`. For genuinely uncopyable files (`.editorconfig`, `LICENSE`, `CODEOWNERS`), use a probot like **Temper** ([pulseengine/temper](https://github.com/pulseengine/temper)) to push them on `repository.created`.

### Concrete oriz-org blueprint

```
oriz-org/
  .github/                   # community-health + workflow-templates/
  automation/                # reusable workflows: _release.yml, _lint.yml, _deploy-cf.yml
  tooling/                   # publishes @oriz/tsconfig, @oriz/eslint-config, @oriz/biome-config
  renovate-config/           # default.json + lib.json + app.json
```

Each consumer repo:
- `.github/workflows/release.yml` — 10 lines, `uses: oriz-org/automation/.github/workflows/_release.yml@main`.
- `tsconfig.json` — `"extends": ["@oriz/tsconfig/base", "@tsconfig/strictest"]`.
- `eslint.config.js` — `import antfu from '@antfu/eslint-config'; export default antfu({ ... })`.
- `.github/renovate.json` — `{ "extends": ["github>oriz-org/renovate-config"] }`.
- Optional: `syncpack.config.json` snapping to versions in `@oriz/tooling`'s `peerDependencies`.

---

## 3. Cross-repo release coordination

### Tool survey (verified June 2026)

**Changesets** — README tagline is "A tool to manage versioning and changelogs **with a focus on monorepos**." But the docs explicitly include a "single-package repository" section, and single-package mode writes git tags as `v1.0.0` (vs `pkg-name@version-number` in monorepos). Works fine in polyrepo, but the value prop (cross-package fixed/linked version groups, intent-capture across many packages in one PR) **doesn't apply** to a fleet where each package lives in its own repo. Adopting it across 30 single-package repos means contributors must create a `.changeset/*.md` file per PR for zero inter-package coordination payoff. Currently v3 in development; stable usage is v2 ([changesets/changesets README](https://github.com/changesets/changesets/blob/main/README.md), [adding-a-changeset.md](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md)).

**semantic-release** — designed single-repo single-package, and that's its sweet spot. But the model is **"every qualifying push to main publishes immediately"**, which a May 2026 Hazya post calls "anxious automation": five `fix:` commits in a row = five npm releases ([blog.hazya.dev](https://blog.hazya.dev/why-i-swapped-semantic-release-for-release-please)). A 2026 MakerStack review explicitly recommends release-please or Changesets over semantic-release for new projects ([makerstack.co](https://makerstack.co/reviews/semantic-release-review/)). The "monorepo story is not great" is well-documented — but for polyrepo, the real disqualifier in 2026 is the push-to-main-and-pray model and lack of PyPI support.

**release-please** (`googleapis/release-please-action@v4`) — **the polyrepo winner for 2026.** Minimum config is one GitHub Action step with `release-type: node` (or `python`, `simple`, `rust`, `go`, `php`, `ruby`, `java`, `maven`, `dart`, `elixir`, `helm`, `terraform-module` — ~15 ecosystems). It opens and maintains a "Release PR" that updates `CHANGELOG.md` and bumps `package.json` from conventional commits; merging the Release PR creates the tag + GitHub Release, which triggers your `npm publish` (or `pypi-publish`) job. **Critically: it's the only first-party tool with native npm AND PyPI support via the same `release-type` switch** ([release-please-action README](https://github.com/googleapis/release-please-action), [release-please customizing.md](https://github.com/googleapis/release-please/blob/main/docs/customizing.md)).

**Anthony Fu's bumpp + changelogithub** — the ultra-lean polyrepo pattern. `bumpp` does interactive bump + commit + tag + push (defaults already correct, supports `-r/--recursive`, ~147k weekly DLs, v11.1.0 May 2026). Push triggers a GH Action on tags `v*` that runs `changelogithub` to generate the GitHub Release from conventional commits. **No Release PR, no `.changeset/` files, no semantic-release config.** Fu uses this across dozens of single-package repos ([antfu/bumpp](https://github.com/antfu/bumpp), [antfu/changelogithub](https://github.com/antfu/changelogithub)).

### Trusted publishing — the bigger 2026 story

**npm trusted publishing via OIDC went GA on 2025-07-31** ([github.blog changelog](https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/)). Requires npm CLI v11.5.1+. Configure on npmjs.com per-package (org/repo + workflow filename + environment), give the job `id-token: write`, drop `NPM_TOKEN` entirely, run `npm publish` with no flags. **`--provenance` is no longer needed — provenance is auto-emitted on every publish** (except from private source repos). One known gap: the initial publish for a brand-new package can't use OIDC because npmjs.com requires the package to exist before you attach a trusted publisher. Workaround: `npx setup-npm-trusted-publish` (azu) publishes a dummy `0.0.0-dummy-npm` so you can attach, or do the first publish manually with a token ([npm/cli issue #8544](https://github.com/npm/cli/issues/8544)).

**PyPI trusted publishing predates npm's by two years**, works the same way, AND **lets you configure trusted publishing for a project that doesn't exist yet** — unlike npm. Pairs naturally with Sigstore attestations: same OIDC identity = publish + sign ([docs.pypi.org/trusted-publishers](https://docs.pypi.org/trusted-publishers/), [pypa/gh-action-pypi-publish](https://github.com/pypa/gh-action-pypi-publish/)).

Self-hosted runners not supported on either side yet.

### Pick: release-please + trusted publishing

**Primary: release-please + npm/PyPI trusted publishing.**

Rationale:
1. **One tool covers npm AND PyPI** via `release-type: node | python | simple`. The fleet is locked Astro+TS but you've explicitly planned PyPI packages too — release-please is the only first-party tool with parity.
2. **PR-based, not push-based.** With ~20-35 repos, a flurry of `fix:` commits across multiple repos won't surprise-publish 20 patch versions. Each repo accumulates a Release PR you merge when ready. Matches the "no aggressive auto-publish" preference seen in the 2026 industry shift.
3. **No secrets to fan out.** Trusted publishing means you configure each package's publisher on npmjs.com / PyPI once; `NPM_TOKEN` and `PYPI_API_TOKEN` disappear. With 30 repos, token rotation across that surface was the operational tax that justifies switching.
4. **Free automatic provenance** on every npm publish; Sigstore attestations on every PyPI wheel, both signed by the same GitHub OIDC identity.
5. **Maintained by Google**, used across the entire googleapis org for npm AND PyPI repos — battle-tested at scale you'll never approach.

Each repo gets two files:
- `.github/workflows/release-please.yml` — opens/maintains Release PR on push to main.
- `.github/workflows/publish.yml` — fires on the tag created when the Release PR merges; runs build/test, then `npm publish` (no `--provenance`, no `NODE_AUTH_TOKEN`) or `pypa/gh-action-pypi-publish@release/v1` (no `password`). Both jobs need `id-token: write`.

Both files should be ~10 lines, calling reusable workflows in `oriz-org/automation`.

**Fallback: Anthony Fu's bumpp + changelogithub for ultra-lean repos.** If a package is tiny, ~1 release/month, single author, no PyPI: skip release-please's overhead. Local `npm run release` runs bumpp, pushes a tag, a GH Action runs changelogithub + publish.

**Skip Changesets and semantic-release** for this fleet. Changesets is monorepo-coordination kit you don't need; semantic-release's push-to-main-and-pray + no-PyPI is two strikes against.

**Cross-cutting baseline (every repo, regardless of pick):**
- `commitlint` + `@commitlint/config-conventional` on `commit-msg` hook (husky).
- `commitizen` as optional `pnpm cz` shortcut for contributors.
- For first-publish on new npm packages: bootstrap with `npx setup-npm-trusted-publish`.

---

## 4. Renovate config sharing

### Mechanism

Renovate's preset system is its `extends` array. The canonical org-wide pattern in 2026 is a **GitHub-hosted preset repo named exactly `renovate-config`** with `default.json` in the root. **Renovate's onboarding auto-discovers** `ORG/renovate-config` (or `ORG/.github` with `renovate-config.json`) and auto-injects it as the sole extended preset in the onboarding PR ([docs.renovatebot.com config-presets](https://docs.renovatebot.com/config-presets/), [renovatebot/renovate discussion #12383](https://github.com/renovatebot/renovate/discussions/12383)).

Consumer repos write `.github/renovate.json` (use `.github/` so it sits with other CI config):

```json
{ "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>oriz-org/renovate-config"] }
```

Deprecation watch:
- **`config:base` is deprecated** since v36 (June 2023). Use `config:recommended`. Old configs auto-migrate but new ones shouldn't reference it ([PR #21136](https://github.com/renovatebot/renovate/pull/21136)).
- **The npm-hosted preset path** (`renovate-config-<name>`, `@scope/renovate-config`) is **also deprecated**. The docs explicitly recommend `local`/`github>` presets. Don't publish your Renovate config to npm.
- **Filename `renovate.json` inside the preset repo is deprecated** — use `default.json` instead.

The "kitchen-sink" preset in 2026 is **`config:best-practices`** = `config:recommended` + `docker:pinDigests` + `helpers:pinGitHubActionDigests` + `:pinDevDependencies` + `abandonments:recommended` + `security:minimumReleaseAgeNpm` + `:maintainLockFilesWeekly`. Strong starting point.

For library vs app distinction:
- `config:js-lib` = `config:recommended` + `:pinOnlyDevDependencies` (pins devDeps, ranges on runtime deps).
- `config:js-app` = `config:recommended` + `:pinAllExceptPeerDependencies` (pins everything).

### Runner: Mend Renovate vs self-hosted vs Dependabot

Three Mend offerings in 2026:
- **Mend Renovate Community Cloud** — free, hosted by Mend, supports GitHub/Bitbucket Cloud/Azure DevOps. 1 concurrent job, 4-hour scheduling, 30 min job timeout.
- **Community Self-Hosted** — free, AGPL, run your own container.
- **Enterprise** — paid, more concurrency, Smart Merge Control, support.

For oriz-org's no-card posture: the free **Mend Renovate Community Cloud app** is the right answer. Self-hosting adds infra cost for zero benefit at your scale ([mend.io/renovate](https://www.mend.io/renovate/)).

**Dependabot vs Renovate, 2026:** Renovate supports 90+ ecosystems vs Dependabot's ~30, has Dependency Dashboard, automerge, lockFileMaintenance, full DSL scheduling, shareable presets — Dependabot has none of these. But Dependabot is GitHub-native, MIT, zero-install, and **its GHSA security alerts are surfaced natively in the GitHub UI** ([Renovate Bot comparison](https://docs.renovatebot.com/bot-comparison/), [Safeguard.sh 2026](https://safeguard.sh/resources/blog/dependabot-vs-renovate-operational-experience)).

**The 2026 consensus hybrid:** Renovate for app/library deps, Dependabot for `github-actions` only (because the GHSA UI is genuinely better there). This is the pattern called out by multiple 2026 writeups.

### Pinning vs ranges for atomic packages

Renovate's official recommendation, reaffirmed in 2026:
- **Apps** (web apps, Node apps, not `require()`'d): pin everything. Maximises reproducibility; auto-update via Renovate PRs.
- **Browser / dual-target libraries published to npm**: keep SemVer ranges (`^`) for `dependencies` (consumer dedup), pin `devDependencies`.
- **Node-only libraries**: may pin all (duplication cost is lower in Node).
- **Use a lock file regardless** — it locks the transitive tree even with ranges.

Renovate auto-detects this via `rangeStrategy=auto`: pins only if `private: true` or no `main`/`exports` field. Override per-repo with `rangeStrategy: "pin"` or `:preserveSemverRanges` ([docs.renovatebot.com/dependency-pinning](https://docs.renovatebot.com/dependency-pinning/)).

### Pick: GitHub-hosted preset repo + `lib`/`app` variants

Create `oriz-org/renovate-config` with three files at the root:

**`default.json`** — applies to everything:

```jsonc
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "config:best-practices",
    ":semanticCommits",
    ":maintainLockFilesWeekly"
  ],
  "timezone": "Asia/Kolkata",
  "schedule": ["before 5am on monday"],
  "labels": ["dependencies"],
  "prConcurrentLimit": 5,
  "minimumReleaseAge": "7 days",
  "packageRules": [
    { "matchUpdateTypes": ["patch", "pin", "digest"], "automerge": true, "automergeType": "branch" },
    { "matchDepTypes": ["devDependencies"], "matchUpdateTypes": ["minor"], "automerge": true },
    { "matchManagers": ["github-actions"], "groupName": "GitHub Actions", "pinDigests": true }
  ]
}
```

**`lib.json`** — for atomic npm packages:

```jsonc
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>oriz-org/renovate-config", ":pinOnlyDevDependencies"]
}
```

**`app.json`** — for apps (Astro sites under `repos/own/<slug>/`):

```jsonc
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>oriz-org/renovate-config", ":pinAllExceptPeerDependencies"]
}
```

Library repos extend `github>oriz-org/renovate-config:lib`, app repos extend `:app`.

**Run on Mend Renovate Community Cloud (free).** Keep Dependabot enabled in each repo for `github-actions` only.

**Commit lock files everywhere** — including libraries. Belt-and-braces.

---

## 5. Docs platform

### Candidate landscape (verified June 2026)

| Platform | Stars | Weekly DL | Framework | Search | Multi-version | TS API | Astro fit | Cost |
|---|---|---|---|---|---|---|---|---|
| **Starlight** | 8.7k | 441k | Astro v7 | Pagefind (built-in) + Algolia opt | Plugin (early) | `starlight-typedoc` | **Native** | Free |
| **VitePress** | 13.9k | 500-600k | Vue/Vite | minisearch + Algolia opt | Plugin | typedoc-vitepress-theme | High friction | Free |
| **Nextra 4** | n/a | 100-113k | Next.js App Router | Pagefind | Manual | None built-in | Very high friction | Free |
| **Fumadocs** | 11.2k | 537k | React/Next.js | Orama (default) | Manual | **First-class built-in** | Very high friction | Free |
| **Docusaurus 3** | ~57k | n/a | React/Webpack→Rspack | Algolia DocSearch | **Native, best-in-class** | `docusaurus-plugin-typedoc` | Separate React app | Free |
| **MkDocs Material** | ~21k | n/a | Python | lunr.js client | `mike` (external) | None (Python-native) | Python tax | Free + $15/mo Insiders |
| **Mintlify** | n/a | n/a | Proprietary SaaS | AI proprietary | Native (coarse) | OpenAPI only | Off-stack | $0 OSS / $150 / $550 / Enterprise |

### Notes on each

**Astro Starlight.** `@astrojs/starlight@0.41.0` (June 2026), 8.7k stars, ~441k weekly DLs. Maintained by Astro core (delucis + HiDeoo, who was promoted to Astro Core specifically for Starlight). Built-in search is **Pagefind** (zero-config, no API key, offline). Optional drop-in swap to Algolia DocSearch via official `@astrojs/starlight-docsearch`. Notable users: **Cloudflare Developer Docs** (after migrating from Docusaurus 2, reported **316% faster startup** — [kian.org.uk](https://kian.org.uk/making-cloudflare-docs-faster-by-300-percent/)), WP Engine Atlas, Patchstack, Astro's own docs. **Weakness: multi-version docs is NOT native** — community `starlight-versions` plugin (HiDeoo, ~90 stars, "early development") fills the gap. **`starlight-typedoc`** (HiDeoo, 0.21.5 Nov 2025, ~27.3k weekly DL) is the canonical TS API path: thin wrapper over TypeDoc + typedoc-plugin-markdown.

**VitePress.** v1 stable, v2 still alpha (`v2.0.0-alpha.17`, Mar 2026). 13.9k stars, ~500-600k weekly DLs. Built-in search is **minisearch** (client-side). Ships Vue 3 runtime — high friction in an Astro+React shop. Mature, good DX, but it's the wrong framework for you.

**Nextra 4.** Jan 2025 rewrite, App Router only. 100-113k weekly DL. Uses Pagefind (replaced FlexSearch). Requires a full Next.js app. Very high friction.

**Fumadocs.** ~11.2k stars, ~537k weekly DL, v16 Oct 2025, **fastest-growing docs framework in 2025-2026** (~3× YoY). Differentiator: **first-class TypeScript API generation + OpenAPI + Twoslash built in**. Default search is Orama. Requires React/Next.js — wrong framework for you, but worth noting it's where the TS-API-built-in trend is heading.

**Docusaurus 3.** Meta, Sébastien Lorber. **The only platform with first-class native per-instance versioning** (`docusaurus docs:version <X>` snapshots into `versioned_docs/`) and **multi-instance plugin support** (one `@docusaurus/plugin-content-docs` per package — this is the textbook polyrepo aggregator pattern). Search is Algolia DocSearch official. TypeScript via community `docusaurus-plugin-typedoc`. Mature, but a separate React/Rspack app outside the Astro fleet.

**MkDocs Material.** squidfunk, ~21k stars, MIT + sponsorware "Insiders" tier at $15+/mo. Client-side lunr.js search. Versioning via external `mike`. Used by FastAPI, Pydantic. Python toolchain — meaningful friction for a TS shop, though the Insiders sponsorship is no-card-friendly (one-time prepaid possible).

**Mintlify.** Paid SaaS, proprietary hosting + AI search + OpenAPI auto-API-ref. Free OSS tier exists on application. Paid Pro ~$150/mo, Growth ~$550/mo, Enterprise custom. Used by Anthropic, Cursor, Resend, Perplexity — top-tier polish. **Violates your no-card-on-file rule** unless on OSS tier, and even that locks you into Mintlify-hosted infrastructure (off your CF Pages / GitHub Pages baseline).

### TypeScript API generation in 2026

**TypeDoc** v0.28.19 (Apr 2026), 8.4k stars, ~4.26M weekly DL, 1,061 dependents. Still pre-1.0 after 12 years but monthly cadence, supports TS 5.0.x-6.0.x. **No serious replacement has emerged.** Every doc framework's TS pipeline consumes TypeDoc output ([TypeStrong/typedoc](https://github.com/TypeStrong/typedoc)).

**typedoc-plugin-markdown** v4.12.0 (Jun 2026), ~2.3M weekly DL. Outputs CommonMark/GFM/MDX with companion themes for Docusaurus, VitePress, GitHub Wiki ([typedoc-plugin-markdown.org](https://typedoc-plugin-markdown.org/)).

**API Extractor** (Microsoft, v7.58.9 Jun 2026, ~4.91M weekly DL) — for `.d.ts` rollups + API-review gating. **Complementary, not a substitute** for doc sites. Add it only if you need `.d.ts` rollups or API-review gating for a stable library.

### Search infrastructure

**Pagefind** — fully static, Rust+WASM, can full-text search a 10k-page site with <300 kB total payload. Critically: **multi-site/cross-domain search via `mergeIndex` API** ([pagefind.app/docs/multisite](https://pagefind.app/docs/multisite/)) — canonical fit for "one search box across N polyrepo docs sites." CORS required. Built by CloudCannon, now independent.

**Algolia DocSearch** — **still free in 2026** for open developer docs + technical blogs (broadened beyond OSS-only since 2023). Application is automated; manual review takes 1-2 business days. Free tier requires "Search by Algolia" logo. If you don't qualify, self-host the crawler on Algolia paid (free tier caps at 10k records) ([docsearch.algolia.com/docs/who-can-apply](https://docsearch.algolia.com/docs/who-can-apply)).

### Deployment shape — where the docs site lives

For a polyrepo where each package is in its OWN repo, three patterns exist in 2026:

**Pattern A — single aggregator docs site that pulls markdown from each package repo at build time.** Docusaurus multi-instance plugins, `mkdocs-multirepo-plugin`, or scripted GitHub Actions. The aggregator clones each package repo at build time, ingests `docs/`, builds one site.

**Pattern B — per-repo docs site + portal index.** Each repo's docs deploys to `<pkg>.docs.oriz.in`; a thin aggregator at `docs.oriz.in` is just a landing page with links. Backstage TechDocs does this at Spotify scale (5,000+ entity docs sites).

**Pattern C — git submodules for pinned-version aggregation.** The umbrella's `docs/` submodules each package's `docs/`. Works but pins are surgical.

### Pick: Astro Starlight per repo + thin aggregator with Pagefind `mergeIndex`

**Why Starlight:**
- Locked stack is Astro+React+Tailwind+shadcn. Starlight is the **only** option that composes natively — zero-JS default, accepts React islands, shares your Astro+Tailwind toolchain, hosts on CF Pages / GitHub Pages for free.
- Maintained by Astro core team. Fastest-growing in 2026. **Cloudflare-grade production proof point** (the migration was the canonical "moved off Docusaurus" case study).
- The two weaknesses (no native versioning, no native multi-package aggregation) are both addressable.

**Deployment: Pattern B (per-repo Starlight + thin aggregator portal).**

- Each package repo has a `/docs/` directory built by Starlight, deployed to `<pkg>.docs.oriz.in` (CF Pages from each repo).
- A thin aggregator portal at `docs.oriz.in` (another Starlight site) provides:
  - Landing page with package cards.
  - **Cross-package search** via Pagefind's `mergeIndex` API — each repo deploys its own Pagefind bundle; the aggregator merges them client-side.
- No build-time clone-everything required. Each repo is independent. Releases are independent.

**Why not the single-aggregator pattern (A)?** It requires the aggregator to clone every package repo at build time — a build-time coupling that defeats the polyrepo isolation you locked. Pattern B keeps each repo's docs deployable on its own.

**Search: Pagefind** (not Algolia DocSearch). Three reasons:
1. Starlight ships it zero-config, no application friction, no API key, no card.
2. `mergeIndex` is the cleanest 2026 polyrepo "one search bar across N independent repos" pattern.
3. Keeps the "self-hosted on CF Pages/GitHub Pages, no third-party deps" posture intact.

Revisit Algolia DocSearch only if you grow past ~10k pages on a single site and Pagefind UX starts dragging.

**TS API: TypeDoc + typedoc-plugin-markdown + starlight-typedoc.** The only well-trodden Starlight path. Add `@microsoft/api-extractor` later only if you need `.d.ts` rollups or API-review gating.

**Versioning: defer.** With a ship-at-HEAD posture (the donations-only / no-Pro / no-enterprise-support pattern from the locked rules), per-version docs is premature. When a package hits its first breaking change with downstream consumers asking for the old docs:
- Option 1: `starlight-versions` plugin (community, early dev).
- Option 2: git-tag branches deployed to `<pkg>.docs.oriz.in/v1/`, `v2/`.
- Option 3: re-evaluate Docusaurus for that one package only (its versioning is best-in-class).

---

## 6. Migration cost — what if the polyrepo turns out wrong?

If the polyrepo posture fails and you need a single monorepo, the 2026 cost picture (per [Block's published migration](https://engineering.block.xyz/blog/from-polyrepo-fragmentation-to-monorepo-leverage), [monorepovspolyrepo.com migration cost](https://monorepovspolyrepo.com/migration-cost/), and [tskulbru.dev migration writeup](https://tskulbru.dev/posts/migrating-microservices-to-a-monorepo/)) is:

- **JS/TS-only fleet:** **a weekend**. `nx import` (Nx 21+, May 2025) explicitly preserves git history per-package. Run `nx import <each repo>` into a fresh monorepo, wire `nx.json`/`package.json`, port reusable workflows to a single `.github/workflows/`, decommission individual repos (archive, don't delete — keep the URL pinned for old npm tarballs that reference them via `repository`).
- **Per-repo CI rewrite:** **1-2 days total** (the reusable workflows you already have map cleanly to a single `affected` matrix).
- **Productivity dip post-cutover:** **4-8 weeks** (everyone relearning where files live, build graph debugging, CI cache warmup).
- **Bazel learning curve (if you go Bazel rather than Nx):** **3-6 months**. Skip Bazel — Nx is the right choice for a JS+Python fleet of this size.
- **Block's migration of ~450 polyglot JVM services took 18 months and a dedicated platform team.** Your fleet is ~20-35 atomic JS+Python packages, not 450 JVM services. The migration is not in the same universe of complexity.

**Net:** the migration is **a 1-2 week effort with a 4-8 week productivity dip**, fully recoverable via `nx import` history preservation. This is the precise reason the polyrepo bet is cheap to reverse — your downside is bounded.

**Counter-cost (lock-in to polyrepo):** ongoing 5-15% tax on cross-cutting refactors (versioning N packages atomically requires N PRs in N repos, not one). The meta-repo pattern + shared tooling (sections 2-4 above) closes most of this gap. AI coding agents (Claude Code with the meta-repo at `oriz-org/oriz` as the root) close the rest.

The "polyrepo with meta-repo orchestration + shared tooling" bet is the **right default for 2026 at your scale**, with a clean escape hatch if scale changes the math.

---

## Sources

### Polyrepo vs monorepo

- https://www.faros.ai/blog/monorepo-vs-polyrepo-benchmark-data
- https://hivecore.dev/blog/monorepo-vs-polyrepo/
- https://pandev-metrics.com/docs/blog/monorepo-vs-polyrepo-impact
- https://engineering.block.xyz/blog/from-polyrepo-fragmentation-to-monorepo-leverage
- https://www.infoq.com/news/2026/06/block-450-jvm-monorepo-migration/
- https://monorepovspolyrepo.com/migration-cost/
- https://tskulbru.dev/posts/migrating-microservices-to-a-monorepo/
- https://cacm.acm.org/research/why-google-stores-billions-of-lines-of-code-in-a-single-repository/
- https://netflixtechblog.com/towards-true-continuous-integration-distributed-repositories-and-dependencies-2a2e3108c051
- https://blog.cloudflare.com/ai-code-review/
- https://vercel.com/academy/production-monorepos/monorepos-vs-polyrepos
- https://devnewsletter.com/p/meta-repo-pattern/
- https://github.com/mateodelnorte/meta
- https://rajiv.com/blog/2025/11/30/polyrepo-synthesis-synthesis-coding-across-multiple-repositories-with-claude-code-in-visual-studio-code/
- https://www.raffertyuy.com/raztype/repo-of-repos-pattern/

### Monorepo tooling releases

- https://nx.dev/blog/nx-21-release
- https://nx.dev/blog/nx-21-continuous-tasks
- https://turborepo.dev/blog/2-9
- https://turborepo.dev/blog/2-8
- https://turborepo.dev/blog/2-6
- https://moonrepo.dev/blog/moon-v2.2

### Cross-repo tooling consistency

- https://registry.npmjs.org/@antfu/eslint-config
- https://github.com/antfu/eslint-config
- https://www.npmjs.com/package/@sxzz/eslint-config
- https://eslint.org/docs/latest/use/migrate-to-9.0.0
- https://github.com/tsconfig/bases/blob/main/README.md
- https://devblogs.microsoft.com/typescript/announcing-typescript-5-0-rc/#supporting-multiple-configuration-files-in-extends
- https://biomejs.dev/reference/configuration/
- https://biomejs.dev/guides/big-projects/
- https://devtoolbox.blog/biome-vs-eslint-prettier-2026-2/
- https://toolchew.com/en/review-biome-2/
- https://docs.github.com/actions/sharing-automations/creating-workflow-templates-for-your-organization
- https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows
- https://github.blog/changelog/2025-11-06-new-releases-for-github-actions-november-2025/
- https://github.com/withastro/automation
- https://github.com/vercel/.github
- https://github.com/cloudflare/.github
- https://github.com/JamieMason/syncpack
- https://syncpack.dev/
- https://github.com/pulseengine/temper

### Release coordination

- https://github.com/googleapis/release-please-action
- https://github.com/googleapis/release-please/blob/main/docs/customizing.md
- https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md
- https://changesets-docs.vercel.app/detailed-explanation.html
- https://blog.hazya.dev/why-i-swapped-semantic-release-for-release-please
- https://makerstack.co/reviews/semantic-release-review/
- https://www.pkgpulse.com/guides/semantic-release-vs-changesets-vs-release-it-release-2026
- https://oleksiipopov.com/blog/npm-release-automation/
- https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/
- https://docs.npmjs.com/trusted-publishers/
- https://github.com/npm/cli/issues/8544
- https://docs.pypi.org/trusted-publishers/
- https://github.com/pypa/gh-action-pypi-publish/
- https://github.com/antfu/bumpp
- https://github.com/antfu/changelogithub

### Renovate / Dependabot

- https://docs.renovatebot.com/config-presets/
- https://docs.renovatebot.com/key-concepts/presets/
- https://docs.renovatebot.com/presets-config/
- https://docs.renovatebot.com/dependency-pinning/
- https://docs.renovatebot.com/bot-comparison/
- https://github.com/renovatebot/renovate/blob/main/docs/usage/config-presets.md
- https://github.com/renovatebot/renovate/blob/main/docs/usage/dependency-pinning.md
- https://github.com/renovatebot/renovate/discussions/12383
- https://www.mend.io/renovate/
- https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/customizing-dependency-updates
- https://github.blog/news-insights/product-news/a-faster-way-to-manage-version-updates-with-dependabot/
- https://github.com/SpotOnInc/renovate-config
- https://github.com/miccy/renovate-config
- https://jsonic.io/guides/dependabot-vs-renovate
- https://safeguard.sh/resources/blog/dependabot-vs-renovate-operational-experience
- https://www.even.li/posts/2026-03-07-use-exact-versions/
- https://github.com/nodejs/package-maintenance/blob/main/docs/dependency-management-guidelines.md

### Docs platforms

- https://starlight.astro.build/
- https://starlight.astro.build/guides/site-search/
- https://github.com/withastro/starlight
- https://github.com/HiDeoo/starlight-versions
- https://github.com/HiDeoo/starlight-typedoc
- https://www.npmjs.com/package/starlight-typedoc
- https://kian.org.uk/making-cloudflare-docs-faster-by-300-percent/
- https://vitepress.dev/guide/what-is-vitepress
- https://nextra.site/
- https://the-guild.dev/blog/nextra-4
- https://fumadocs.dev/
- https://www.fumadocs.dev/docs/comparisons
- https://docusaurus.io/docs/versioning
- https://docusaurus.io/docs/docs-multi-instance
- https://squidfunk.github.io/mkdocs-material/
- https://mintlify.com/pricing
- https://typedoc.org/
- https://github.com/TypeStrong/typedoc
- https://api-extractor.com/
- https://typedoc-plugin-markdown.org/
- https://pagefind.app/
- https://pagefind.app/docs/multisite/
- https://docsearch.algolia.com/docs/who-can-apply
- https://backstage.io/docs/features/techdocs/
- https://www.pkgpulse.com/guides/docusaurus-vs-vitepress-vs-nextra-vs-starlight-2026
