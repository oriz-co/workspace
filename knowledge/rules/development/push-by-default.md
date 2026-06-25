---
id: push-by-default
title: "Push to main by default \u2014 no explicit say-so needed"
description: 'Standing authorisation: agents commit AND push to main immediately after
  every change. Removes the prior "no push without explicit user say-so" rule. Outward-effect
  actions still require confirmation.'
tags:
- rule
- git
- workflow
- autonomy
timestamp: 2026-06-20
format_version: 0.1
type: rule
status: active
related:
- one-branch-only
- no-force-push-to-main
- parallel-fan-out-by-default
- self-update-rule
---



# Push to main by default

## What

Agents working on `chirag127/oriz*` family repos commit AND push to `main`
immediately after every meaningful change, with **no further user prompt
required**. Standing authorisation, granted by user 2026-06-20.

## Why

The prior rule ([[no-push-without-say-so]] — now retired) created a
bottleneck: agents queued unpushed commits waiting for an "okay push"
nod that interrupted flow. With CI on every push and `[[one-branch-only]]`
keeping `main` honest, immediate push is safer than batching — feedback
arrives sooner.

## What still requires explicit confirmation

Push-by-default does NOT extend to outward-effect actions that are hard
to reverse:

- `gh repo delete` / `gh repo transfer`
- Force-push or branch deletion on `main` (covered by
  [[no-force-push-to-main]])
- DNS / domain registrar changes (Spaceship, Cloudflare DNS records that
  change MX, NS, or apex A/AAAA records)
- Spending money. Anywhere. Period.
  ([[no-card-on-file]], [[never-hit-quotas]])
- Publishing to external app stores (Chrome Web Store, AMO, npm, PyPI,
  VS Code Marketplace) — pause before the publish step, surface what's
  about to happen, then proceed if user confirms or has pre-authorised
  this specific publish.
- Sending email, SMS, or push notifications to humans other than chirag127.
- Deleting files the agent did not author, or whose contents contradict
  how they were described.

## How to apply

```
# After every concept-file write, decision lock, or service decision:
git add -A
git commit -m "feat(knowledge): <one-line>"
git push origin main
# Done. No "should I push?" prompt.
```

For submodule pointer bumps:

```
# In submodule subdir
git add . && git commit -m "..." && git push origin main
# Then in master
cd ../..
git add sites/<name> && git commit -m "chore(submodule): bump <name>" && git push
```

## Cross-references

- [[one-branch-only]] — main is the only branch; no PR review gate.
- [[no-force-push-to-main]] — push freely, never `--force`.
- [[parallel-fan-out-by-default]] — many agents, many commits, all
  pushed immediately so the fan-out converges visibly on remote.
- [[self-update-rule]] — every chat decision lands in `knowledge/`
  same-conversation; this rule says: …and on `origin/main` same
  conversation too.
