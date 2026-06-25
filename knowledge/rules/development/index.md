---
type: index
title: Development
description: Index of concepts in rules/development.
tags:
- index
- development
timestamp: '2026-06-24'
format_version: okf-v0.1
status: active
---

# Development

## Concepts

- [Always install the latest version of every dependency](./always-latest-deps.md) — When adding or refreshing a dependency in any oriz repo, install the latest published version. Old deps eventually reach end-of-life and may go paid — staying current is a never-hit-quotas requirement, not a preference.
- [Astro version pin: major in package.json, auto-update minors weekly](./astro-version-pin.md) — Every package.json across the family pins Astro at the current major via caret. Minors+patches auto-update weekly. Major upgrades happen via single workspace-wide PR.
- [Community packages first — prefer external dependencies over hand-rolling](./community-packages-first.md) — Locked 2026-06-23. Default to a well-maintained community library/package over hand-rolling. Reasons: less code we maintain, fewer bugs, more eyeballs on the dep. Caveats: dep must be MIT/Apache/ISC-licensed, have >100 stars OR be from a known-good org (Cloudflare, Vercel, Astro, Anthropic, Firebase, Hono, TanStack), and not pull in 50+ transitive deps. Override the prior 'lazy-third-party-first' uncertainty: yes, reach for the dep.
- [Conventional commits](./conventional-commits.md) — Every commit message uses a Conventional Commits prefix: feat, fix, chore, docs, refactor, test.
- [Fork customization isolation — minimize future merge conflicts](./fork-customization-minimum-conflict.md) — When patching upstream code in a fork, isolate customizations into separate files / folders / config overrides so upstream lines stay untouched. Sync upstream frequently (weekly cron at minimum). Mark every inserted/modified line with a `<fork-slug>:` comment for grep-ability. Document divergence in the per-fork knowledge/divergence.md.
- [Fork discipline — minimum diff, rebase-friendly, upstream-aligned](./fork-discipline.md) — All forks live under oriz-org/<upstream-name> on GitHub and repos/oriz/frk/<bucket>/<category>/<upstream-name>/ on disk. Reason: org-level secrets only propagate within the org; forks on personal accounts can't inherit them. Slug + disk folder = upstream name by default, unless the fork ships as a distinct product (CWS / store / npm) — then rename to a `<purpose>-bs-ext` / `-cli` / etc. compliant slug. All code changes minimum-diff, marked with per-fork `<slug>:` comments, documented in per-fork knowledge/divergence.md.
- [Git identity — always use chirag127's GitHub noreply email](./git-identity-chirag127-noreply.md) — Every commit on this machine attributes to chirag127 via the noreply email 76880977+chirag127@users.noreply.github.com. Set globally + locally + in every submodule. Past commits with chirag@oriz.in stay (history rewrites cost more than the cosmetic win). Going forward, no public email leak in .git history, no chance of attribution drift, and GitHub's Select-an-account dialog can't pick a different identity.
- [Never force-push to main](./no-force-push-to-main.md) — Force-push to main requires a separate, explicit user instruction — distinct from a normal push instruction.
- [Never call Web3Forms from server-side code](./no-web3forms-server-side.md) — Web3Forms server-side calls require their paid plan plus an IP allow-list. Cloudflare Workers' egress IPs rotate. Always submit Web3Forms from the browser.
- [One branch only — main](./one-branch-only.md) — Only the main branch exists, in the master oriz repo and in every submodule under sites/, packages/, extensions/.
- [Playwright persistent sessions rules](./playwright-persistent-sessions.md) — Constraints and guidelines for using persistent contexts and cookies in headless/cloud Playwright automation loops.
- [Push to main by default — no explicit say-so needed](./push-by-default.md) — Standing authorisation: agents commit AND push to main immediately after every change. Removes the prior "no push without explicit user say-so" rule. Outward-effect actions still require confirmation.
- [Apply the role suffix to every new repo, and audit before publish](./repo-naming.md) — Every chirag127/oriz* repo slug must end in -site, -ext, -vsc-ext, -cli, -worker, -fn, -data — or be a clean npm-package name. Audit the slug before the first push to a new repo.
- [Every repo in the family must work independently when cloned alone](./repos-work-independently.md) — Cloning any single oriz submodule directly must give a fully working dev environment. The umbrella oriz repo orchestrates; it does not own the code. A solo clone of any site must pnpm install + pnpm build successfully without the master repo.
- [Tests in parallel + master `pnpm install -r` is THE install command](./tests-parallel-and-master-install.md) — Vitest + Playwright + Storybook per app and per package; master CI matrix-fans all suites in parallel. Always work from c:/D/oriz/ (the umbrella). One install command from master covers every submodule.
- [pnpm is the package manager for every JS repo in the family](./use-pnpm.md) — pnpm is mandatory across the oriz family. Its content-addressable global store at ~/.pnpm-store is what makes the 'no duplication' goal achievable when 11+ sites share dependencies.
