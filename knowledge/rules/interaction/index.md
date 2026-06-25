---
type: index
title: Interaction
description: Index of concepts in rules/interaction.
tags:
- index
- interaction
timestamp: '2026-06-24'
format_version: okf-v0.1
status: active
---

# Interaction

## Concepts

- [Auto-only tracking](./auto-only-tracking.md) — Every tracked metric in the chirag127/oriz family must be automatically captured. Manual entry, manual timer, manual journal not allowed for anything that's a system metric. Manual = decay; auto = honest. Applies to METRICS, not content.
- [Communication is STT-friendly — accept transcription noise, infer intent](./communication-stt-friendly.md) — The user uses speech-to-text software heavily. STT introduces transcription typos and stitched-word artefacts. Agents must: ask short-labelled options (within the 4-question cap); infer intent from imperfect transcription; when ambiguous, pick the most-likely interpretation, state it explicitly, and proceed; ask only when truly blocked. Avoid asking the user to re-transcribe — offer your best read and ask for a tweak.
- [Future decisions override past decisions](./future-overrides-past.md) — When chat contradicts a knowledge file or AGENTS.md, the chat wins; the file is updated in the same turn.
- [Linux/Ubuntu only on CI runners — never Windows or macOS](./linux-ci-only.md) — Every CI workflow in every chirag127/oriz* repo runs on Linux/Ubuntu runners. macOS and Windows runners are forbidden unless explicitly justified for native build that can't be done another way. PWABuilder handles all native packaging from a Linux runner via the deployed PWA URL — no macOS/Windows runner needed.
- [Match the surrounding code style](./match-surrounding-style.md) — When editing existing files, match the file's existing comment density, naming idioms, semicolon use, and import order. Don't impose a new style mid-file.
- [Never delete an empty placeholder repo without explicit user authorisation](./never-delete-empty-placeholder-repos.md) — An empty repo in the chirag127/oriz* family is a deliberate slug reservation, NOT a cleanup candidate. Before running gh repo delete (or any destructive remote action) against any family repo, even an empty one, the agent MUST get an explicit, repo-named confirmation from the user.
- [Never hit a free-tier quota](./never-hit-quotas.md) — Architect for headroom. Surprise quota walls are a design failure, not a billing event.
- [No Card On File](./no-card-on-file.md) — No description available.
- [Every AI provider adapter must be OpenAI-compatible (SDK schema)](./openai-compat-for-all-ai-providers.md) — Every adapter in @chirag127/oriz-ai-providers must use the OpenAI SDK schema (`chat.completions.create({model, messages, ...})`, `completions.create()`, etc.) so we have minimum code per provider and a single calling convention. Providers that don't natively support the OpenAI schema (e.g. Ollama Cloud's native API) get a thin shim that translates the OpenAI request shape to the provider's native shape. No bespoke per-provider request shapes.
- [Parallel by default](./parallel-by-default.md) — Any work that can be parallelised MUST be fanned out via subagents. Sequential is the exception, justified when used.
- [Parallel fan-out by default (background subagents)](./parallel-fan-out-by-default.md) — Any work that can be parallelised MUST be fanned out via background subagents. Operational HOW for the parallel-by-default rule — keeps the orchestrator under context-window limits and the wall-clock low.
- [Always parse 'Other' answers in MCQs for additional context beyond the literal question](./parse-mcq-other-for-context.md) — When the user selects 'Other' on an AskUserQuestion MCQ and adds free-text, that free-text may carry context unrelated to the specific question being asked — instructions, constraints, requests, new decisions. The agent MUST parse the free-text for ALL meaningful directives, not just answer the literal question. If the free-text contains a new directive or constraint, the agent must (1) acknowledge it explicitly, (2) write it to knowledge if durable, (3) act on it, AND (4) still record an answer to the original question.
- [Profile README must cross-link chirag127 ↔ oriz-org](./profile-readme-cross-link.md) — The chirag127 GitHub profile README must include a one-line cross-link to oriz-org (the brand org), and the oriz-org profile README must include a 'Founded by Chirag Singhal' line linking back. Both surfaces — personal account and brand org — must lead a visitor to the other in one click.
- [Recruiter strategy: optimize pinned repos + contribution graph, not the repo list](./recruiter-strategy.md) — GitHub recruiters skim a profile in 30–60 seconds: pinned repos (you choose them), contribution graph (greens from any owned/contributed repo), bio. They rarely scroll the Repositories tab. Layout decisions should optimize for that — keep the personal account populated and cross-linked to the brand org, but don't reorganize the world around the assumption that recruiters browse repo lists.
- [Telegram channels and roles (restored 2026-06-22)](./telegram-channels-and-roles.md) — Telegram restored in India 2026-06-22. Four channels in the Oriz namespace: @oriz_announcements (public broadcast), @oriz_drafts (private drafts queue), @oriz_ops (private errors+CI), @oriz_paisa (public India finance). Drafts dual-write to TG + GH Issues for redundancy. Pairs with Substack for long-form newsletter (both used).
- [User prefers atomic split over consolidation](./user-prefers-atomic-split.md) — When given a choice between fewer-bigger-units and more-smaller-units, the user consistently picks more-smaller. Apply as default when the choice is open.
- [User prefers deletion over archive for superseded repos (same-day migration)](./user-prefers-deletion-over-archive.md) — When a repo is superseded by another within the same day or migration session, delete it rather than archive. Cleaner repo listing, no zombie repos.
- [User prefers per-product brand over family chrome](./user-prefers-pure-tool-brand.md) — When tools live at dedicated subdomains, the user picks pure per-tool brand over Oriz family chrome. Maximum SEO per category, accept brand fragmentation.
- [User prefers same name across GitHub repo and npm package](./user-prefers-same-name-repo-and-npm.md) — When a project ships as a GitHub repo + npm package, the slugs match (modulo @chirag127/ scope). No divergence. Subdomains stay independent.
- [User prefers strict-no-toggle interpretation of locked rules](./user-prefers-strict-no-toggle.md) — When a family-wide rule (dark mode, no auth, no card) is offered as 'strict' vs 'with opt-in toggle', user picks strict. No light-mode toggle. No card-on-file even with opt-in. The rule is the rule.
- [User prefers wider topical coverage over narrow SEO concentration](./user-prefers-wider-coverage.md) — When a content-site scope question offers narrow-but-deep vs wide-but-shallow, the user picks wide. Cost: more content to write. Benefit: domain owns a category, not a niche. Apply as default.
