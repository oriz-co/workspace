---
type: index
title: Ops
description: Index of concepts in architecture/ops.
tags:
- index
- ops
timestamp: '2026-06-24'
format_version: okf-v0.1
status: active
---

# Ops

## Concepts

- [Extension distribution — Chrome, Firefox, Edge, automated](./extension-distribution.md) — Every extension is its own GitHub repo, submoduled under extensions/. Each repo has its own CI workflow that publishes to Chrome Web Store, Firefox Add-ons, and Edge Add-ons on release. Landing pages live on extensions.oriz.in (with a copy at oriz.in/extensions).
- [Repo Layout](./repo-layout.md) — No description available.
- [Submodule pattern — each site/package/extension is a separate GitHub repo](./submodule-pattern.md) — Every site, every package, and every extension is a standalone GitHub repo added as a git submodule under sites/, packages/, or extensions/. The submodule has its own commits, releases, CI, and main branch. The master oriz repo stores a SHA pointer per submodule.
- [Subscription flow — Razorpay → webhook → Firestore → every site](./subscription-flow.md) — One subscription unlocks everything. User pays via Razorpay, webhook lands at api.oriz.in, Worker writes users/{uid}/subscription, every site and extension reads that doc to gate features.
