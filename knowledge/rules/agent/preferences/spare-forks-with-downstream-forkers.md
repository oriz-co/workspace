---
type: rule
title: "Spare forks with downstream forkers"
description: "When bulk-deleting personal forks, spare anything where someone else forked your fork. Stars are cheap signals; downstream forks mean a real user picked your fork as their upstream."
tags: [feedback, agent-preferences, forks, github, housekeeping]
timestamp: 2026-06-26
format_version: okf-v0.1
status: active
---

When deleting forks in bulk (cleanup, scope-cut, profile housekeeping), the spare-list is keyed on **downstream forks**, not stars:

- stars — cheap signal. Someone clicked once. Delete is fine.
- downstream forks — someone forked YOUR fork. They picked your fork specifically as their upstream. Deleting breaks their parent link.

**Applied 2026-06-26** during the chirag127 fork cleanup. 48 forks audited → 43 deleted, 5 spared because they had ≥1 downstream forker. Spared list: Terabox-DL (10 downstream), Book-For-Programmers (2), SOCKS-Proxy-Checker, goggles-quickstart, human-eval.

**How to check before bulk-deleting:**
```bash
gh repo list <user> --fork --limit 500 --json name,stargazerCount,forkCount \
  --jq '[.[] | select(.forkCount > 0)] | .[].name'
```

The output is your spare-list. Everything else is fair game.

**Why not also spare by stars:**
- Stars cost nothing — they accumulate from passive browsing.
- A 5-star fork with 0 downstream forks: nobody is depending on it.
- A 0-star fork with 1 downstream fork: somebody IS depending on it.

The asymmetry is the whole point. Downstream forks are commitments, not approvals.

**Related:**
- [`fork-features-also-as-upstream-issues`](./fork-features-also-as-upstream-issues.md) — for forks we DO keep, file upstream issues for our patches.
- [`fs-own-frk-split`](../../../decisions/architecture/fleet/fs-own-frk-split.md) — `repos/frk/<slug>/` is where forks we ARE keeping live.
- [`knowledge-deletion-not-supersession`](./knowledge-deletion-not-supersession.md) — same delete-don't-mark-as-stale instinct.
