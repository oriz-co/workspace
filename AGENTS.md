# AGENTS.md — pointer to `knowledge/`

> **Read [`knowledge/index.md`](./knowledge/index.md) first.** The bundle is the canonical source of truth for every rule, decision, service pick, design brief, runbook, and policy in the oriz-co family (migrated from chirag127/* on 2026-06-22). The "where to look" table + per-site knowledge convention live in [`knowledge/_navigation.md`](./knowledge/_navigation.md).

## The 16 hard rules (full versions in `knowledge/rules/`)

1. **Never hit a free-tier quota** — architect for headroom. [`rules/never-hit-quotas.md`](./knowledge/rules/never-hit-quotas.md)
2. **No card-on-file** — every service must work without billing data linked. [`rules/no-card-on-file.md`](./knowledge/rules/no-card-on-file.md)
3. **Self-update on every decision** — chat decisions land in `knowledge/` in the same conversation. [`rules/self-update-rule.md`](./knowledge/rules/self-update-rule.md)
4. **Future overrides past** — chat wins when it contradicts knowledge; update knowledge immediately. [`rules/future-overrides-past.md`](./knowledge/rules/future-overrides-past.md)
5. **Parallel by default** — fan out subagents for any parallelisable work. [`rules/parallel-by-default.md`](./knowledge/rules/parallel-by-default.md)
6. **Grill-to-knowledge** — every locked answer from a grill-me session lands in `knowledge/`. [`rules/grill-to-knowledge.md`](./knowledge/rules/grill-to-knowledge.md)
7. **Knowledge-first + no README ↔ knowledge duplication** — durable info in `knowledge/`, never both places. [`rules/knowledge-first.md`](./knowledge/rules/knowledge-first.md)
8. **Tests in parallel; master `pnpm install -r` is THE install** — Vitest + Playwright + Storybook per app/pkg; always work from `c:/D/oriz/`. [`rules/tests-parallel-and-master-install.md`](./knowledge/rules/tests-parallel-and-master-install.md)
9. **Linux/Ubuntu only on CI runners** — `runs-on: ubuntu-latest` on every workflow. [`rules/linux-ci-only.md`](./knowledge/rules/linux-ci-only.md)
10. **MIT license on all 41+ repos** — locked 2026-06-21. [`decisions/architecture/mit-license-all-repos.md`](./knowledge/decisions/architecture/mit-license-all-repos.md)
11. **Mirror everything to 4 git hosts weekly** — master cron pushes to GitLab + Codeberg + Bitbucket + GitFlic every Friday 03:30 IST. [`decisions/architecture/mirror-to-4-git-hosts.md`](./knowledge/decisions/architecture/mirror-to-4-git-hosts.md)
12. **Grill on LOC removal ≥ 50 lines** — TIGHTENED from 1000→50. Surface as delta + ask MCQs before deleting. [`rules/grill-on-loc-removal.md`](./knowledge/rules/grill-on-loc-removal.md)
13. **Frontend-design skill is baked-in agent philosophy** — every UI task approached as design lead at a small studio. Avoid AI-cluster defaults. [`rules/frontend-design-skill-baked-in.md`](./knowledge/rules/frontend-design-skill-baked-in.md)
14. **Env vars ORG-level only — per-repo secrets FORBIDDEN** — push to GitHub ORG `oriz-co` with `--visibility all`. NEVER per-repo (3,770 calls/sync hits 5K/hr limit). Migration: [`runbooks/migrate-to-oriz-org.md`](./knowledge/runbooks/migrate-to-oriz-org.md). Rule: [`rules/org-level-secrets-only-no-per-repo.md`](./knowledge/rules/org-level-secrets-only-no-per-repo.md)
15. **Shared-tenant-by-default for every 3rd-party service** — ONE Sentry + ONE GA4 + ONE Clarity + ONE Algolia + ONE Razorpay merchant family-wide. Apps separate via tags/labels/custom-dimensions, NEVER per-app accounts. Prevents 260-signup hell. [`rules/shared-tenant-by-default.md`](./knowledge/rules/shared-tenant-by-default.md)
16. **One-level subdomains only on `oriz.in`** — subdomains live AT MOST one level deep (`<name>.oriz.in`). Two-level shapes like `<name>.api.oriz.in` are FORBIDDEN for new work because CF free-tier Universal SSL covers only `*.oriz.in`. Use `<name>-api.oriz.in` instead. 19 grandfathered `*.api.oriz.in` records stay DNS-only (grey-cloud); GH Pages handles their SSL via Let's Encrypt. Locked 2026-06-22 evening. [`rules/one-level-subdomain-only.md`](./knowledge/rules/one-level-subdomain-only.md)

## Update protocol

When a decision is made in chat, write the concept file in `knowledge/<area>/<slug>.md`, append a one-line entry to [`knowledge/log.md`](./knowledge/log.md), commit on `main` with `docs(knowledge): <one-line summary>`, then push immediately.

Standing authorisation: agents may commit + push to `main` without further prompting. Hard-to-reverse external actions (paid APIs, repo deletes, domain transfers) still require user confirmation.

The full convention spec is at [`knowledge/_okf.md`](./knowledge/_okf.md).
