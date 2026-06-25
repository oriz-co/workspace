---
type: rule
title: "Agent minimum-context protocol \u2014 find before deriving"
meta_description: 'How any AI agent (Claude Code, Aider, Cursor, etc.) operates on
  this repo with minimum upfront token cost. Five protocol steps: (1) read knowledge/_navigation.md
  FIRST for any decision-shaped question; (2) grep knowledge/ for existing rules before
  writing new ones; (3) keep new knowledge files terse and self-contained (~60 lines,
  one decision); (4) link related files via [[wikilinks]] so the next agent can chain
  through; (5) commit knowledge changes in the SAME turn the decision is made (existing
  self-update-rule). Plus a cookbook of recurring tasks and their entry-point files.'
description: How any AI agent operates on this repo with minimum upfront token cost.
  Read knowledge/_navigation.md FIRST. Grep before writing. Terse self-contained files.
  [[wikilinks]] for chaining. Commit knowledge same-turn. Plus a cookbook of recurring
  tasks with entry-point file paths.
tags:
- rule
- agent
- knowledge
- navigation
- context
- protocol
- cookbook
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
- rules/agent/self-update-rule
- rules/agent/confirm-knowledge-deltas
- rules/interaction/future-overrides-past
- _okf
- _navigation
---



# Agent minimum-context protocol

## TL;DR for any agent reading this

1. **Decision-shaped question?** → open `knowledge/_navigation.md`, find the matching row, follow the link.
2. **About to write a new rule/decision?** → first `git grep -i '<keyword>' knowledge/` to find what already exists. If a related rule exists, edit it or supersede it; do not duplicate.
3. **Writing a new knowledge file?** → keep it ≤ 80 lines. One concept. Terse. Future agents pay tokens to read it.
4. **Cross-reference everything** → use `[[file-slug]]` wikilinks to point at related knowledge files.
5. **Update in same turn** → if a chat-decision is captured, the knowledge file lands in the same commit.

## Why this matters

Every agent session pays tokens to load context. The knowledge bundle (`knowledge/`) is **the** shortcut: it pre-digests architectural decisions, taste rules, and runbooks so a fresh agent doesn't re-derive them from scratch. But the bundle only earns its keep if agents:

- **Read it before reasoning.** Otherwise the agent reinvents an inferior version of a decision already made.
- **Don't bloat it.** A 500-line "history of the decision" file costs more tokens to load than the 50-line "what we do + why" version. Every line is a tax on every future agent.
- **Keep it discoverable.** `_navigation.md` is the index. If a new concept doesn't have a nav entry, the next agent won't find it.

## The 5-step protocol in detail

### Step 1: Load the navigation index first

Before answering any question that smells like an architectural / naming / stack / policy choice, read `knowledge/_navigation.md`. It maps user intent ("looking for X") → the right file. Reading nav costs ~2k tokens; reading the wrong files costs 10–50k tokens.

Trigger phrases that mean "go to nav first":
- "should I use X or Y", "what's our rule for Z", "where does W live", "how do we Q"
- Any mention of: secrets, env, mirror, backup, fork, naming, recruiter, ToS, license, distribution, Doppler, sops, B2, R2, GitHub Actions, knowledge, OKF

### Step 2: Grep before writing

About to write `knowledge/rules/foo.md` or `knowledge/decisions/bar/baz.md`?

```bash
# From the umbrella root:
git grep -li '<keyword>' knowledge/
ls knowledge/rules/ knowledge/decisions/*/  | grep -i '<keyword>'
```

If a file already covers ≥ 60% of what you're about to write — edit it, don't create a new one. If two files cover overlapping concepts, mark the older as `superseded_by: <new-slug>` and the newer as `supersedes: <old-slug>` (see `_okf.md` for the convention).

### Step 3: Terse + self-contained

Every knowledge file is:
- **≤ 80 lines** for rules / decisions (runbooks can be longer because step-by-step).
- **Self-contained for retrieval.** A future agent reading just THIS file should be able to act. Don't say "see also [[X]]" without also stating the decision inline.
- **One concept per file.** "Two related decisions" = two files with `related:` cross-refs.
- **Header is the contract.** Title + description must be retrieval-friendly — assume an agent matches on title/description first, body second.

### Step 4: Wikilink everything related

`[[file-slug]]` or `[file](../relative/path.md)` — both work. Pick at least 2 related files to link from any new knowledge file. The bundle's graph density is what makes it navigable; isolated files rot.

### Step 5: Same-turn commit

Per [[rules/self-update-rule]], when a chat-decision lands, the knowledge file lands in the same commit. NEVER "I'll add it later" — later means never. NEVER add `knowledge/log.md` entries that just restate the diff. The git log is the durable record of "what was decided when."

## What to NEVER write to knowledge

(From the stricter `self-update-rule` revision):

- **Count bumps.** "72 submodules → 73 submodules" — recoverable from `git submodule status`.
- **Migration timestamps + step-logs.** Git history records these.
- **Re-statements of the diff.** A commit message already says "added X as submodule." A knowledge file repeating that wastes tokens forever.
- **Status updates / TODO lists.** Those belong in commit messages or tasks, not durable knowledge.

## Cookbook — recurring tasks and where to look first

| If the user wants to… | Start here |
|---|---|
| Add a new submodule fork | [[rules/fork-discipline]] → [[runbooks/git-upstream-merge-private-fork]] → [[decisions/policy/forked-extension-cws-rules]] (if CWS-shipping) |
| Patch a fork's code | [[rules/fork-customization-minimum-conflict]] |
| Merge upstream into our forks | scripts/merge-upstreams.mjs pattern (see this rule's runbook section below) |
| Add an env / secret | [[decisions/security/sops-plus-doppler-hybrid]] → [[rules/git-identity-chirag127-noreply]] |
| Change repo / folder layout | [[decisions/architecture/projects-owner-own-forks-layout]] |
| Decide where a repo lives (owner / brand vs personal) | [[decisions/branding/keep-oriz-org-recruiter-via-pinning]] → [[rules/recruiter-strategy]] |
| Mirror / back up code or metadata | [[decisions/architecture/mirror-to-6-git-hosts]] → [[runbooks/backup-metadata-to-b2]] → [[decisions/architecture/backup-channels-alternative]] |
| Write a userscript | [[decisions/architecture/userscript-prototype-via-tweeks]] → develop-userscripts skill |
| Download a Chrome extension's source | `scripts/download-cws-extension.mjs <EXT_ID>` |
| Decide which AI / LLM provider for a feature | [[decisions/architecture/ai-puter-plus-cf-workers-ai]] + scan `services/llm/*` |
| Set up payments | [[decisions/monetisation/max-payment-methods]] → [[decisions/architecture/razorpay-donation-button]] |
| Pick a hosting target | [[rules/cloudflare-pages-apps-only]] + scan `services/hosting/*` |
| Name a new repo | [[decisions/branding/repo-naming-suffixes]] |

## Anti-patterns

- **"Let me research this from scratch"** when knowledge/ already has the answer. ALWAYS check nav first.
- **"I'll write a quick rule"** without checking if one exists. ALWAYS grep first.
- **Writing 200-line knowledge files.** Tokens compound. Split into 3 × 60-line files if there are 3 distinct concepts.
- **Knowledge files without `related:` cross-refs.** Isolated files become unfindable.
- **Mentioning a decision in chat without committing the knowledge file in the same turn.** Drift starts here.

## Self-check before committing

```bash
# Before any commit that touches knowledge/, run:
git diff --cached --stat knowledge/

# If you wrote a new file: confirm it has nav entry, related: refs, ≤ 80 lines.
# If you edited an existing file: confirm the title/description still matches.
```
