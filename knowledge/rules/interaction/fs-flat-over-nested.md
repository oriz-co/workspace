---
type: rule
title: "Filesystem: flat over nested"
description: "User prefers a flat `repos/` folder with type-suffix sorting (-api, -npm-pkg, -bs-ext, -ide-ext, -cli, -mcp-server, -app) over a nested category hierarchy."
tags: [user-identity, filesystem, naming, superseded]
timestamp: 2026-06-21
format_version: okf-v0.1
status: superseded
superseded_by: fs-flat-always
---

User picked flat `repos/<name>-<type>/` over nested `repos/apps/`, `repos/packages/`, `repos/extensions/` when offered. 2nd-choice override pattern.

**Why:** Predictable naming convention beats directory organization for this user — type suffix is greppable, sortable, and avoids the "which folder does it belong to" debate. Taste: convention over hierarchy.

**How to apply:** When organizing files/repos/modules, lead with a flat layout + naming convention. Only nest when depth carries semantic weight that a suffix can't. Don't propose category-folder structures as the recommended option for this user.

**SUPERSEDED** by [`fs-flat-always`](../agent/preferences/fs-flat-always.md) (which itself was superseded by [`fs-own-frk-split`](../../decisions/architecture/fleet/fs-own-frk-split.md)).
