---
type: decision
title: 'Userscript creation flow: prototype in Tweeks, port to portable .user.js'
description: For new userscript ideas, use Tweeks (YC-backed AI browser extension
  at tweeks.io that generates per-site JS from plain English) as a fast in-browser
  PROTOTYPE. If the result is keepable, copy the generated JS, port to a proper Tampermonkey-format
  .user.js with a metadata block (@name, @namespace, @version, @match, @grant, @updateURL
  pointing at GitHub raw), commit to oriz-org/userscripts monorepo, cross-publish
  to Greasefork + OpenUserJS. This gets AI generation speed PLUS portable + auditable
  + versionable artifacts without vendor lock-in.
tags:
- decision
- userscripts
- tweeks
- prototyping
- workflow
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
- decisions/architecture/general/projects-owner-own-forks-layout
- rules/infrastructure/free-tier-with-cost-controls
- rules/interaction/no-card-on-file
---



# Userscript creation flow

## Default flow for a new userscript

1. **Describe the change in Tweeks** (Y Combinator-backed AI browser extension at tweeks.io). It generates JS that runs in the browser via their extension.
2. **Test it lives** — install, use for a few sessions, confirm the behavior is what you wanted.
3. **If keepable**, view the generated JS in Tweeks' code view, copy it.
4. **Port to .user.js**:
   - Wrap in a Tampermonkey-format metadata block: `@name`, `@namespace https://github.com/oriz-org/userscripts`, `@version 0.1.0`, `@match`, `@grant none` (or specific `GM_*` if needed), `@author Chirag Singhal`, `@license MIT`, `@homepageURL`, `@supportURL`, `@updateURL` + `@downloadURL` pointing at the GitHub raw URL
   - Wrap the body in `(() => { 'use strict'; ... })()`
   - Add comments explaining selectors and any DOM assumptions (so future-you knows where it will break when the site redesigns)
5. **Commit to `repos/oriz/own/prod/userscripts/<name>/<name>.user.js`** with a per-script `README.md` describing what it does + install button URL.
6. **Cross-publish**: Greasefork first (largest audience), OpenUserJS second. Both via OAuth sign-in + manual first paste + GitHub webhook for auto-update on push (see [[decisions/architecture/projects-owner-own-forks-layout]] for the monorepo location).

## Why not stay in Tweeks

Tweeks is a YC-backed startup. Risks: pivot, shutdown, paywall, account loss. The portable .user.js artifact:
- Survives the company indefinitely
- Auto-updates from GitHub raw URL (Tweeks-installed scripts don't)
- Can be installed in Tampermonkey / Violentmonkey / ScriptCat (Tweeks scripts only work in their extension)
- Lives in version control with a real diff history (Tweeks has its own history but it's locked inside their service)
- Can be shared via Greasefork / OpenUserJS for organic discovery
- License is yours (MIT in our case)

## Why not skip Tweeks and write from scratch

For complex DOM tweaks, the AI generation is genuinely a time-saver vs writing selectors by hand or reading the develop-userscripts skill end-to-end. The 30-60s "describe → working draft" loop is a real productivity multiplier on first iteration. After that, the portable .user.js is what we care about.

## Anti-patterns

- DON'T let Tweeks be the source of truth. The .user.js in `oriz-org/userscripts` is.
- DON'T trust Tweeks-generated selectors to be production-ready — review every `document.querySelector` for stability before publishing.
- DON'T forget the metadata block. Without `@updateURL`, Tampermonkey-installed copies are dead-frozen at v0.1.0 forever.
- DON'T skip the README per script. Greasefork users grep these for the install button URL.

## Cross-refs

- monorepo location: [[decisions/architecture/projects-owner-own-forks-layout]]
- userscripts as a category vs forks: bs-ext forks live under `repos/oriz/frk/`, original userscripts live under `repos/oriz/own/prod/userscripts/`
- the develop-userscripts skill (in `~/.claude/skills/`) is the canonical reference for metadata-block details + manager differences
