---
type: rule
title: "Communication is STT-friendly \u2014 accept transcription noise, infer intent"
description: "The user uses speech-to-text software heavily. STT introduces transcription\
  \ typos and stitched-word artefacts. Agents must: ask short-labelled options (within\
  \ the 4-question cap); infer intent from imperfect transcription; when ambiguous,\
  \ pick the most-likely interpretation, state it explicitly, and proceed; ask only\
  \ when truly blocked. Avoid asking the user to re-transcribe \u2014 offer your best\
  \ read and ask for a tweak."
tags:
- rule
- communication
- stt
- askuserquestion
- ambiguity-handling
timestamp: 2026-06-21
format_version: okf-v0.1
status: active
related:
- rules/agent/grill-to-knowledge
- rules/interaction/future-overrides-past
---



# Communication is STT-friendly

## The rule

The user (chirag127) uses speech-to-text software heavily across conversations. STT consistently introduces:

- Transcription typos (homophones, soundalikes)
- Stitched-word artefacts (`janaushdhi-app` becomes `jan oshady app`, `oriz` becomes `oris` or `orange`)
- Missing punctuation
- Sentence-fragment messages instead of complete sentences
- Occasional contradictory phrasing ("yes do that" then "actually no don't" in same message)

Agents MUST adapt:

### When asking questions

- Short labels (helps STT-readback and on-screen scan)
- Many short options is fine; respect the 4-question cap per `AskUserQuestion` call
- Infer intent from imperfect transcription — `pdf splitter` and `pf splitter` mean the same thing
- Put the question stem INSIDE the widget, not in the prose above (overlay artefact on Windows TUIs)

### When user input is ambiguous or contradictory

- Pick the **most-likely interpretation**
- **State your interpretation explicitly** before proceeding ("Reading this as X; proceeding under that assumption")
- Proceed without blocking
- Ask only when truly blocked AND you can't proceed any sensible direction

### Never

- Ask the user to re-type or re-transcribe the same message
- Quote back garbled text and ask "did you mean X or Y" as the entire response — make a choice, state it, move

## Why

The user's bandwidth is bottlenecked at STT input. Every clarifying-question round costs ~30 seconds of speech overhead. Inferring + proceeding + asking-for-a-tweak-after-the-fact is consistently faster than asking-first.

## Cross-refs

- Grill-to-knowledge depends on capture working through STT noise → [[rules/grill-to-knowledge]]
- When agent picks wrong interpretation, user overrides — that's [[rules/future-overrides-past]]
