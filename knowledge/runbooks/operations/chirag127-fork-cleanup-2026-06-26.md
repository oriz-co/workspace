---
type: runbook
title: "chirag127 fork cleanup 2026-06-26 — bulk delete with downstream-aware sparelist"
description: 43 of 48 personal forks deleted from chirag127 account; 5 spared because they have downstream forkers. Hard-delete via gh API; no redirects (deliberately).
tags: [github, forks, cleanup, profile, audit-log]
timestamp: 2026-06-26
format_version: okf-v0.1
status: active
related:
  - rules/interaction/profile-readme-cross-link
  - runbooks/operations/github-profile-customization
---

# chirag127 fork cleanup 2026-06-26

## Scope

48 personal forks audited on `chirag127`. Hard-deleted 43. Spared 5 because they have downstream forkers (third-party users who would lose their parent link).

## What got deleted (43)

All are `chirag127/<slug>` forks with 0 downstream forks at time of deletion:

`Amazing-Python-Scripts`, `Chronus`, `Coding-Ninjas-Introduction-to-Python`, `Complete-Data-Science-With-Machine-Learning-And-NLP-2024`, `Complete-Python-3-Bootcamp`, `CouchPotatoServer`, `DigitalMenu`, `DigitalMenuBackend`, `EdgeGPT`, `Email-Scrape`, `Email-extractor`, `Extensity`, `Fake_News_Detection`, `Financial-aid-on-coursera-`, `Free-Courses-For-Everyone`, `GPTNeo`, `MyFilters`, `OpenHands`, `Plagiarism-checker-Python`, `ReinforcementLearningSpaceInvaders`, `SimpleRecommender`, `SnakeByRohan`, `Udacity-Computer-Vision-Nanodegree`, `api-book-part-one`, `clauneck`, `copilot-clone`, `email_extractor`, `free-llm-api-resources`, `headroom`, `langchain-course`, `learning-papers`, `odysseus`, `one-page-website-html-css-project`, `openai-codex-chrome-extension`, `picture-in-picture-chrome-extension`, `piracy-blocklists`, `programming-principles`, `py-googletrans`, `python-mini-projects`, `stable-diffusion`, `stable-diffusion-webui`, `thedev.id`, `udemy-dl`.

## What got spared (5)

Each has at least 1 downstream forker. Deleting would orphan those users' parent links:

| Repo | Stars | Downstream forks | Reason to spare |
|---|---|---|---|
| `chirag127/Terabox-DL` | 5 | 10 | Highest-impact downstream graph |
| `chirag127/Book-For-Programmers` | 7 | 2 | Most-starred personal fork |
| `chirag127/SOCKS-Proxy-Checker` | 1 | 1 | Live downstream user |
| `chirag127/goggles-quickstart` | 0 | 1 | Live downstream user |
| `chirag127/human-eval` | 0 | 1 | Live downstream user |

## Deletion method

`DELETE /repos/chirag127/<slug>` via the REST API with a PAT carrying `delete_repo` scope.

```bash
curl -X DELETE \
  -H "Authorization: Bearer $GH_ADMIN_PAT" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/chirag127/$slug"
# Returns 204 on success
```

43 deletions in series, 0 failures.

## Why hard-delete (not archive, not transfer)

- **Archive** — keeps the fork visible on profile, just dimmed. Doesn't reduce clutter perception.
- **Transfer to oriz-archive** — would put 43 third-party-derived repos into the oriz-archive org. The org should hold OUR archived work, not other people's stuff we briefly forked.
- **Delete** — slug becomes available immediately (no GH redirect for deleted forks of personal accounts). Acceptable because (a) these are FORKS of other people's repos — anyone who wants the parent can just go find the parent at its original location; (b) zero downstream consumers per the spare-list filter.

## Spare-list rule (captured as taste)

When deleting personal forks in bulk, **spare anything where someone has forked YOUR fork**. Stars are cheap signals; downstream forks mean a real human picked your fork as their upstream. Breaking their link is a real-world cost.

Stars-only forks (no downstream forks) are safe to delete.

## What this leaves on chirag127

After cleanup, the chirag127 account has:
- **200 source repos** (originals authored on the account)
- **5 spared forks** (the ones with downstream forkers above)
- **0 archived repos**

Plus the personal-profile assets (chirag127/chirag127 README, pinned items).

## Audit trail

- Pre-cleanup fork count: 48
- Post-cleanup fork count: 5 (verified via `gh repo list chirag127 --fork`)
- API call success rate: 43/43 = 100%
- Spared per downstream-aware rule: 5/48 = 10.4%
