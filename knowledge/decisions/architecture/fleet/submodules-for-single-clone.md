---
type: decision
title: "Submodules for single-clone fleet"
description: "Umbrella repo c:\\D\\oriz uses git submodules so `git clone --recurse-submodules` pulls everything in one command. OK at <50 submodules."
tags: [fleet, submodules, git, ops]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
---

`c:\D\oriz` is the umbrella repo; each fleet repo is added as a git submodule. `git clone --recurse-submodules https://github.com/oriz-org/oriz` pulls the whole fleet in one command. Submodule performance is acceptable below ~50 entries (current scope fits). Locked 2026-06-25.
