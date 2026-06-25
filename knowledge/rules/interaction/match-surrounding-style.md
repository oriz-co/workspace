---
type: rule
title: Match the surrounding code style
description: When editing existing files, match the file's existing comment density,
  naming idioms, semicolon use, and import order. Don't impose a new style mid-file.
tags:
- rules
- style
- code-review
- consistency
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- rules/agent/read-before-edit
- rules/design/no-emoji-in-chrome
---



# Match the surrounding code style

When editing an existing file, every line you add or change must match
the surrounding style of that file: same indentation width, same quote
style, same semicolon use, same comment density, same naming idioms,
same import order. Style discipline is per-file, not per-repo.

## Why

The family doesn't run a strict family-wide formatter. Different
submodules grew at different times, by different agents, with
slightly different conventions baked into each file. That's fine —
the cost of forcibly normalising is higher than the cost of letting
files drift slightly.

But mixing styles **within one file** is always worse than either
style alone:

- **Diffs become noisy.** A 2-line semantic change becomes a 30-line
  diff because half the file got re-quoted.
- **Reviewers lose signal.** Was the change intentional or
  drive-by reformatting?
- **Future agents copy the wrong cue.** Whichever style "wins" the
  most recent edit becomes the new local norm, then drifts again.

## What to do

Before editing any file:

1. Read the surrounding 30-50 lines, not just the line you're changing.
2. Note: tab vs spaces, single vs double quotes, semi vs no-semi,
   `// single-line` vs `/* block */` comment density, `function foo()`
   vs `const foo = () =>`, named vs default exports.
3. Match all of those in your edit.

If the file's existing style is genuinely wrong (e.g. unsafe pattern,
not just "ugly"), fix it as a separate commit with its own message —
don't sneak it into a feature change.

## Exceptions

A net-new file can pick whatever style fits the repo's surrounding
files. New files shouldn't invent a third style, but they aren't bound
to match a specific neighbouring file.

## See also

- [`read-before-edit.md`](../agent/read-before-edit.md)
- [Claude Code edit-mode preferences](../../CLAUDE.md)
