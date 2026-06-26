---
type: rule
title: "Fork features → also file upstream issues"
description: "For any feature patched into a fork in repos/frk/, also file an issue upstream asking for the same feature. If upstream merges, drop the patch."
tags: [feedback, agent-preferences, forks, upstream]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
---

When I ask for a feature to be added to a fork (`repos/frk/<slug>`), do two things:

1. **Patch it into our fork.** Ship it now; we use it now.
2. **File an issue upstream** at the parent repo asking for the same feature. Polite, with the use-case clearly written. Link to the merged commit on our fork as a reference implementation.

**Why both:**
- We get the feature today regardless of upstream's response.
- If upstream merges, we drop our patch on the next upstream sync and reduce maintenance burden.
- "No harm in asking" — upstream gets a feature request from a real user with working code attached.
- Future-proofs: if my preferences change, we edit/update the issue, not just our patch.

**How to apply:**
- Use `gh issue create --repo <upstream-owner>/<upstream-repo>` with a clear title + reproduction + rationale.
- Title pattern: `feat: <feature-name> (with reference implementation linked)`.
- Include a link to our fork's PR or commit so they can adopt the diff verbatim.
- Subscribe to the issue so we hear back. If upstream pushes back, capture the reasoning in our fork's README so future me knows why we're carrying the patch.

**Permission note:** I have standing authorization to file issues on any upstream of `repos/frk/*` without re-confirming each time. Same for editing/closing those issues later if my preferences change.

**Related:** [`fs-own-frk-split`](../../../decisions/architecture/fleet/fs-own-frk-split.md) (forks live in `repos/frk/`), [`scope-cut-2026-06-25`](../../../decisions/architecture/fleet/scope-cut-2026-06-25.md) (only patch features you actually ship today).
