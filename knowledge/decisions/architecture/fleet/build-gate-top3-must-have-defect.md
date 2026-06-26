---
type: decision
title: "Build-gate: top-3 Google results must have a defect"
description: "Build a tool only when the top-3 Google results for the problem have a real defect (paywall, signup wall, ads, missing feature). README documents the defect."
tags: [build-gate, fleet, product]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
---

Gate for "should we build this tool": Google the problem, examine top-3 results. Build only if all three have a real defect — paywall, signup wall, ads-laden UI, broken UX, or a missing feature the user needs. Each tool's README opens with the specific defect (e.g., "smallpdf.com gates at 2 files/day; we don't"). Locked 2026-06-25.
