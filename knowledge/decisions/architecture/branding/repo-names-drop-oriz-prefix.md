---
type: decision
title: "Repo names drop the oriz- prefix"
description: "Repo slugs drop the `oriz-` brand prefix. Service name only — `oriz-org/finance`, not `oriz-org/oriz-finance`. Org namespace provides branding."
tags: [branding, naming, fleet]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
---

Fleet repo slugs are bare service names: `oriz-org/finance`, `oriz-org/text`, `oriz-org/login`. The `oriz-org/` namespace already brands them — prefixing the repo with `oriz-` is redundant. Refines [`repo-slug-suffix-npm-pkg`](../../../rules/agent/preferences/repo-slug-suffix-npm-pkg.md) (type-suffix still applies for npm packages: `foo-npm-pkg`). Locked 2026-06-25.
