---
type: runbook
title: "GitHub profile customization — what works via API vs manual"
description: Bio + location + name + hireable + email are PATCHable via the API with a user-scope token. Pinned repos are NOT — they're session-cookie-gated and require manual UI clicks at github.com/<user>.
tags: [github, profile, api, pinning, manual]
timestamp: 2026-06-26
format_version: okf-v0.1
status: active
related:
  - rules/interaction/profile-readme-cross-link
---

# GitHub profile customization — what works via API

## TL;DR

| Field | API path | Token scope | Notes |
|---|---|---|---|
| **bio** | `PATCH /user` | `user` | Works. Up to 160 chars. |
| **location** | `PATCH /user` | `user` | Works. Trim trailing spaces or PATCH them off. |
| **name** | `PATCH /user` | `user` | Works. |
| **company** | `PATCH /user` | `user` | Works. |
| **blog (website)** | `PATCH /user` | `user` | Works. |
| **twitter_username** | `PATCH /user` | `user` | Works (despite the X rebrand the field name stays). |
| **hireable** | `PATCH /user` | `user` | Works. Boolean. |
| **email** | `PATCH /user` | `user` | Works (must be a verified email). |
| **Pinned repositories** | **NONE** | n/a | Not exposed by REST or GraphQL. Manual UI only. |
| **Pinned gists** | **NONE** | n/a | Same — manual only. |
| **Profile README** | Standard repo APIs on `<user>/<user>` | `repo` | Edit the README in `<user>/<user>` repo. |
| **Avatar** | `POST /user/avatar` | `user` | Documented but rate-limited. |

## Working PATCH example

```bash
val="$GH_ADMIN_PAT"
cat > /tmp/patch.json <<'EOF'
{
  "bio": "Software Engineering Specialist at TCS · building free public tools at @oriz-org · React Native + Astro + AI agents",
  "location": "India"
}
EOF
curl -X PATCH \
  -H "Authorization: Bearer $val" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/user \
  --data-binary @/tmp/patch.json
```

**Quoting note:** any non-ASCII characters (middle dot `·`, em dash `—`, …) need a file-based payload + `--data-binary`. Inline `-d` strings with shell-quoting break on Windows Git Bash.

## Why pinning doesn't work via API

Investigated 2026-06-26 with full admin PAT (all scopes including `user`, `repo`, `admin:org`):

- `PATCH /user` with `pinned_items` field → HTTP 200 but field silently ignored.
- `POST /users/<user>/pinned_items` → HTTP 404 (endpoint doesn't exist).
- `POST /user/pinned_items` → HTTP 404.
- GraphQL `__schema` introspection for `Mutation` fields containing "pin": returns only `pinIssue`, `pinEnvironment`, `pinIssueComment`, `unpinIssue`, `unpinIssueComment`. No user-profile pin mutations.
- The `updateUserListsForItem` mutation that DOES exist is for the **Stars > custom lists** feature, not profile pins.

**Why GitHub keeps it manual:** profile shape is meant to be a deliberate human action with the actual web UI as the only surface. Automating it would let token leakers reshape victim profiles silently — same threat model as profile-photo changes.

## Manual pin flow (~30 seconds)

1. Go to `https://github.com/<your-username>` while signed in as yourself.
2. Click **"Customize your pins"** (top-right of the Pinned repositories section).
3. In the modal: uncheck currently-pinned items, check the desired 6 in order.
4. Click **Save pins**.

## Verification after manual pin

```bash
gh api graphql -f query='{
  user(login: "chirag127") {
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes { ... on Repository { nameWithOwner } }
    }
  }
}' --jq '.data.user.pinnedItems.nodes[].nameWithOwner'
```

Expected output: the 6 repo slugs in the order you checked them.

## Anti-patterns tried + failed

- `PATCH /user` with `pinned_items` array of node IDs → 200 OK but ignored.
- Web-form scraping at `https://github.com/<user>?tab=overview` → CSRF-token + session-cookie protected; PAT auth doesn't substitute.
- DevTools MCP / Chrome session via this harness → opens a clean Chrome with no GitHub login; can't reuse the user's logged-in session.
- `gh auth refresh -s user` followed by `gh api` PATCH → same result (works for bio, ignored for pins).

## Recommended split

- **PATCH-able fields** → automate in scripts, commit. Update bio whenever a major rebrand happens.
- **Pins** → manual update ~once per quarter when the lineup shifts. Add a calendar reminder to review pins after every fleet scope change.
