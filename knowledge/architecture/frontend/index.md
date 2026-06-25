---
type: index
title: Frontend
description: Index of concepts in architecture/frontend.
tags:
- index
- frontend
timestamp: '2026-06-24'
format_version: okf-v0.1
status: active
---

# Frontend

## Concepts

- [Layer 1 — static hosting on Cloudflare Pages](./layer-1-static-hosting.md) — Cloudflare Pages free is the primary host for all 11+ sites and the extensions catalog. Unlimited bandwidth, no card required, fails-closed at quota.
- [Layer 2 — survival fallback on GitHub Pages](./layer-2-survival-fallback.md) — Every site builds a static fallback to chirag127.github.io/<site> on every push to main. If Cloudflare Pages dies, /work + /me + /legal still serve from github.io. Per the 100-year strategy §16.
