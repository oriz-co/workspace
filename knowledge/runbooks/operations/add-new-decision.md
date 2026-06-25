---
type: runbook
title: Add a new decision to the knowledge bundle
description: The OKF self-update workflow. When the user makes an architectural /
  naming / stack decision in chat, capture it as a concept file before the conversation
  ends.
tags:
- runbook
- okf
- knowledge
- self-update
- workflow
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- rules/agent/self-update-rule
- _okf
- log
- decisions/process/okf-as-canonical-format
---



# Add a new decision to the knowledge bundle

Every architectural, naming, or stack decision the user makes in chat
must land as a concept file in `knowledge/` **in the same
conversation**. This is the [self-update rule](../../rules/agent/self-update-rule.md)
made operational.

## Steps

1. **Pick the directory.** Decide which `knowledge/<area>/` the
    concept belongs in. Most live in `decisions/`, but cross-cutting
    constraints go in `rules/`, services in `services/`, terms in
    `glossary/`, and so on. See the directory layout in
    [`../_okf.md`](../../_okf.md).

2. **Pick a kebab-case slug.** Match the family pattern:
    `<short-noun-phrase>.md`. Examples: `oriz-kit-package-name.md`,
    `jsonl-as-canonical-store.md`, `razorpay-as-primary-billing.md`.
    The path becomes the stable identity.

3. **Write the file with full frontmatter.** Use this template:

    ```yaml
    ---
    type: decision   # or rule, service, glossary, etc.
    title: "<human-readable title>"
    description: "<one-line summary used by agents during retrieval>"
    tags: [<topic>, <topic>]
    timestamp: <today, ISO-8601>
    format_version: okf-v0.1
    status: active
    related:
      - <slug>
      - <slug>
    ---

    # <human-readable title>

    ## Context
    <what prompted the decision — what was being weighed>

    ## Decision
    <the locked choice, in one or two sentences>

    ## Why
    <the reasoning, in 30-80 lines of body>

    ## See also
    - [<related>](../../<area>/<related>.md)
    ```

4. **Append to `knowledge/log.md`.** One line, dated, pointing at the
    new file:

    ```markdown
    - 2026-06-20 — `decisions/<slug>.md` — <one-line summary>
    ```

5. **Update the relevant `index.md`.** If the new file should be
    listed in `<area>/index.md`, add it there in the appropriate
    section so future agents find it via the index.

6. **Commit on `main`.** Conventional commit:

    ```bash
    git add knowledge/
    git commit -m "docs(knowledge): <one-line summary>"
    ```

    Don't push without say-so per
    [`../rules/no-push-without-say-so.md`](../../rules/no-push-without-say-so.md).

## When the new decision supersedes an older one

Don't delete the old file. Set `status: superseded` and
`superseded_by: <new slug>` on the old one, and `supersedes: <old slug>`
on the new one. The bundle is a living wiki — outdated concepts are
preserved as history.

## See also

- [`../_okf.md`](../../_okf.md) — the full OKF contract
- [`../rules/self-update-rule.md`](../../rules/agent/self-update-rule.md)
- [`../log.md`](../../log.md)
- [`../decisions/process/okf-as-canonical-format.md`](../../decisions/process/okf-as-canonical-format.md) — the decision that locks OKF v0.1 as the format used by this runbook
