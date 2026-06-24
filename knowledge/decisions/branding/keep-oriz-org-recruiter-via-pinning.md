---
type: decision
title: "Keep oriz-org alive — recruiter-visibility solved via pinned repos, not migration"
description: "The 'recruiter won't see my work because it's on oriz-org' worry is solved by PINNING oriz-org repos on chirag127's profile (they appear as your work on chirag127's page, with link to oriz-org for click-through) + cross-linking chirag127's README to oriz-org. NOT by migrating 78 repos back, which would cost ~6-10h of work, lose 61 org-level secrets, retire high-clone repo namespaces permanently, and contradict the recruiter-strategy rule. Status quo (oriz-org alive, well-cross-linked) is correct."
tags: [decision, branding, recruiter, github-pinning, oriz-org, status-quo]
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
  - rules/recruiter-strategy
  - rules/profile-readme-cross-link
  - decisions/branding/oriz-org-rename-from-co
  - decisions/security/sops-plus-doppler-hybrid
---

# Keep oriz-org alive — recruiter visibility ≠ migration

## Decision

Do NOT migrate the 78 oriz-org repos back to chirag127. Recruiter-visibility is solved at the **pinned-repo + README** layer, not the **repo-ownership** layer.

## How pinned repos solve it

GitHub allows pinning up to 6 repos on any user profile, **including repos owned by orgs you're a member of**. A recruiter on `github.com/chirag127` sees:
- Pinned repos (with screenshots, descriptions, language tags)
- Contribution graph (counts ALL your commits, org-owned or personal)
- Bio + profile README cross-link to oriz.in / @oriz-org
- Followers + a small "Organizations" sidebar

The pinned repos already include 3 oriz-org entries today:
- `oriz-org/oriz-pages-blog-app`
- `oriz-org/cs-me-app`
- `chirag127/OmniPublish-Content-Distribution-Platform-Python-Lib`

**3 slots are still free.** Pin 3 more oriz-org repos with high-signal value (workspace, the flagship app, a popular API).

## Recommended pin list (6 of 6)

Priority order:
1. **`oriz-org/workspace`** — the umbrella shows monorepo scale (78 submodules) and engineering discipline (knowledge bundle, OKF, CI). Highest-signal pin for any engineering recruiter.
2. **`oriz-org/oriz-roam-journal-app`** — flagship Pro/Max app, Astro + React + Firebase, production-grade PWA. Demonstrates full-stack shipping skill.
3. **`oriz-org/oriz-paisa-finance-tools-app`** OR **`oriz-org/oriz-slice-pdf-tools-app`** — pick the one that visually shows "I ship products people use" best. Both are public-facing apps with concrete UX.
4. **`chirag127/OmniPublish-Content-Distribution-Platform-Python-Lib`** — pre-existing chirag127 work, shows your range beyond oriz.
5. **`oriz-org/userscripts`** — your userscript monorepo, low-LOC but high-signal for browser engineering.
6. **`oriz-org/freellmapi`** or **`oriz-org/omniroute`** — one of the LLM aggregator forks, shows AI/agent engineering interest.

## Why not move everything back

Captured in [[rules/recruiter-strategy]] (2026-06-24) and the 4-stream research workflow that ran 2026-06-24 with adversarial verification:

- **GitHub redirects + pinned repos ALREADY mean recruiters reach oriz-org from chirag127.** The visibility problem is imagined, not measured.
- **78 repos worth of mechanical work** (transfers + .gitmodules rewrites + .git/modules moves + worktree config) for cosmetic gain.
- **61 org-level secrets are lost.** Personal accounts can't hold org-level secrets — every repo becomes a per-repo secret-management job.
- **Doppler's GitHub Actions sync has no `user` target**, only `org` or `repo`. Personal-only forces per-repo syncs and hits the 5-sync free-tier cap; Team plan is $252/year and violates `[[no-card-on-file]]`.
- **Permanent namespace retirement** — once `oriz-org/<slug>` is deleted (or the org itself is), the repo path is **permanently retired** for any repo with >100 clones in the prior week. Brand-on-GitHub identity is closed.
- **Rollback path is thin** — `oriz-org` could be squatted within hours of deletion (same fate that already hit `oriz` and `oriz-in`).

## When to revisit

ONLY revisit if a **specific named recruiter conversation** explicitly mentions the chirag127-vs-oriz-org split as confusing/limiting. Vibe-shifts don't count (the user's own `[[storage-decision-needs-explicit-grill]]` rule). 30-day measurement window starts after the 3 extra pins are added.

## What was changed today

- Identity: noreply email locked across global + umbrella + 72 submodule configs (see [[rules/git-identity-chirag127-noreply]])
- Credential prompt: deleted oriz-co, oriz-org, x-access-token entries from Windows Credential Manager — only chirag127 remains
- Pinned-repo recommendation: 3 slots already used; recommended list above for the remaining 3
- chirag127 README: unchanged (already has the oriz-org cross-link from earlier in this session)

## Cross-refs

- [[rules/recruiter-strategy]] — pinned + graph > repo list
- [[rules/profile-readme-cross-link]] — chirag127 ↔ oriz-org always cross-linked
- [[rules/storage-decision-needs-explicit-grill]] — grill on the concern, don't preemptively dismantle
