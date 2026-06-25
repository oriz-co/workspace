---
type: rule
title: "Fork customization isolation \u2014 minimize future merge conflicts"
description: When patching upstream code in a fork, isolate customizations into separate
  files / folders / config overrides so upstream lines stay untouched. Sync upstream
  frequently (weekly cron at minimum). Mark every inserted/modified line with a `<fork-slug>:`
  comment for grep-ability. Document divergence in the per-fork knowledge/divergence.md.
tags:
- rule
- forks
- git
- rebase
- merge-conflicts
- customization
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
- rules/development/fork-discipline
- runbooks/hosting/git-upstream-merge-private-fork
- decisions/policy/forked-extension-cws-rules
---



# Fork customization isolation

## Rule

When patching an upstream repo's code in a fork, structure the patch to **minimize the surface area that conflicts on rebase**. The default measure of success: a `git rebase upstream/main` (or `git merge upstream/main`) after upstream's latest release should produce **zero conflict markers in upstream files**, with conflicts (if any) confined to overlay files we authored.

## Five tactics, in order of preference

1. **New files, not modified files.** Whenever the upstream's plugin / extension / module system allows it, write your customization as a NEW file the upstream code imports. Examples: a `extensions/oriz-*.js` plugin file, a `themes/oriz-dark.css` overlay, a `src/oriz-overrides/index.ts` re-export module.
2. **Config overrides, not code edits.** Many upstreams have a `config.json` or env-var surface. Override behavior via a config file rather than patching `src/`. Example: DeArrow has a `Config.config!.showOriginalAlongsideTitle` flag — adding it via the existing config surface beat editing 14 separate call sites.
3. **Wrap, don't replace.** When you MUST edit an upstream file, prefer to add a local variable that wraps the upstream behavior, leaving the call-site signature identical. Example: `const displayTitle = flag ? wrap(formattedTitle) : formattedTitle; setCustomTitle(displayTitle, ...);` — the `setCustomTitle(<arg>, ...)` shape stays the same, so upstream edits to argument count or order don't always conflict.
4. **Anchor near stable symbols.** When inserting code into an upstream file, anchor near a long-lived nearby identifier (a public API, a config key, a CLI flag). Conflicts trigger when upstream changes the anchor; stable anchors trigger fewer conflicts.
5. **Mark every modification with a `<fork-slug>:` comment.** Examples: `// oriz-fork:`, `<!-- oriz-fork: -->`, `# oriz-fork:`. After a rebase / merge with conflicts, `git grep oriz-fork` locates every divergence point so you can verify all customizations survived. This is the difference between a rebase that takes 15 minutes and one that takes 3 hours.

## Sync frequency

The longer you wait between rebases, the worse the merge gets — upstream lines drift, refactors accumulate, fewer of your anchors survive. Sync cadence:

- **Weekly cron** for any fork with an active upstream (commits in the last 30 days). Set up `git fetch upstream` + diff-stat-and-notify; don't auto-rebase, but DO surface "upstream has N new commits, expected conflict surface = M files."
- **Monthly cron** for slow-moving upstreams (commits less frequent than monthly).
- **Per-release for tagged upstreams**. Rebase on `upstream/v<latest-tag>`, not `upstream/main` HEAD — release tags are stable rebase targets.

## Document the divergence

Every fork has a `knowledge/divergence.md` listing:
- Every file you touched
- Which line ranges were added / modified
- The `<fork-slug>:` marker comment you used
- The conflict-risk level for each file (low / medium / high based on how much upstream churns near your changes)

When upstream releases a new version, future-you opens `divergence.md` first, runs `git grep oriz-fork`, and has a complete pre-rebase checklist.

## What this rule rejects

- "I'll just remember which lines I changed." You won't.
- Blanket-replacing upstream code with your refactor. Your refactor is no longer minimum-diff.
- Reformatting touched files with your preferred Prettier/Biome config — adds whitespace noise to every diff, increases conflict probability on every line you touched.
- Renaming upstream variables / functions to fit your style. Renames conflict on every call site.

## Cross-refs

- The fork-discipline rule (where forks live + minimum-diff principle): [[rules/fork-discipline]]
- The setup runbook for a new private fork: [[runbooks/git-upstream-merge-private-fork]]
- The CWS-distribution policy for forked extensions: [[decisions/policy/forked-extension-cws-rules]]
