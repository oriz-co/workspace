---
type: index
title: Security
description: Index of concepts in architecture/security.
tags:
- index
- security
timestamp: '2026-06-24'
format_version: okf-v0.1
status: active
---

# Security

## Concepts

- [Cross-site auth via auth.oriz.in](./cross-site-auth-via-auth-oriz-in.md) — Firebase Auth's custom domain auth.oriz.in is shared by every *.oriz.in subdomain and every Chrome/Firefox/Edge extension. One sign-in, one Firebase user, every surface.
- [Layer 3 — auth on Firebase Spark forever](./layer-3-auth-firebase-spark.md) — One Firebase project (oriz-app) on the Spark plan, never Blaze. Custom auth domain auth.oriz.in shared by every site and every extension.
- [Package isolation rule — every external service wraps in a typed package](./package-isolation-rule.md) — Every external service must be wrapped in a typed @chirag127 package so swapping providers is a package version bump, not a 50-file rewrite. Any new service crossing 3+ sites' boundary gets a wrapper on first introduction.
