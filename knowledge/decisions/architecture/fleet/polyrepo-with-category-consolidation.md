---
type: decision
title: "Polyrepo with category consolidation"
description: "Polyrepo, one repo per category. Tools within a category share a repo as routes (finance.oriz.in/emi, /sip, /tax-80c). No new repo for a tool that fits an existing category."
tags: [fleet, polyrepo, categorization]
timestamp: 2026-06-25
format_version: okf-v0.1
status: active
---

Polyrepo at the category level — `oriz-org/finance`, `oriz-org/text`, `oriz-org/image`, etc. Tools that belong to a category ship as routes inside that repo (finance.oriz.in/emi, /sip, /tax-80c) rather than separate repos. Before creating a new repo, check if an existing category covers the tool. Locked 2026-06-25.
