---
type: rule
title: 'Loop engineering — how agent loops should be structured'
description: Principles for agent-loop design. Single iteration patterns, halt conditions, retry strategies, observation summarization, tool-call budgets.
tags: [agent-behavior, loops, react, planning, halt]
timestamp: 2026-06-27
format_version: okf-v0.1
status: active
related:
  - rules/agent/preferences/max-proactive-grill-always
  - rules/agent/try-multiple-on-failure
  - rules/agent/read-before-edit
  - rules/agent/search-multi-engine-fallback
---

# Loop engineering for agents

## TL;DR (5 rules)

1. **ReAct** — every iteration is Thought → Action → Observation. NEVER emit an Action without a preceding Thought; NEVER absorb an Observation without an updating Thought.
2. **Tool-call budget per turn** — hard cap (default 25 mixed; finer caps per class below). Hit the cap → halt + summarize + ask, do not silently keep going.
3. **Observation summarization** — outputs > 200 lines, binary blobs, and unchanged repeats get compressed to halt-decision-relevant content before the next Thought. The raw text stays out of context.
4. **Halt conditions are explicit, not emergent** — goal-met, budget-exceeded, repeated-state, tool-fails-3×, user-interrupt. Loop must check at least one of these every iteration.
5. **Context-shrink on retry** — same error twice → summarize trailing context, drop oldest 50% non-essential, retry with shrunken state. Third failure → halt + ask user.

## Patterns

### ReAct loop (default for most work)

The baseline pattern. Yao et al (2022) — interleave verbal reasoning ("Thought") with tool calls ("Action") and their results ("Observation"). Thought lets the model induce, track, update plans, and handle exceptions; Action grounds it in real state.

```
loop:
  thought   = reason(history)         # what do I know, what next, why
  action    = decide_tool(thought)    # one tool call (or halt)
  if action == HALT: break
  obs       = execute(action)         # ground truth from env
  obs       = summarize_if_large(obs) # see Observation summarization
  history  += (thought, action, obs)
  if halt_condition(history): break
```

Why both halves: chain-of-thought alone hallucinates; act-only can't synthesize. Anthropic's "Building effective agents" frames the agent as exactly this — "LLMs using tools based on environmental feedback in a loop."

### Plan-Execute-Verify-Replan (PEVR)

Heavier, but right for multi-file architectural work or anything where a wrong early step wastes ≥15 min.

```
plan         = produce_plan(goal)        # ranked steps, written out
for step in plan:
   result    = execute(step)             # ReAct sub-loop
   verdict   = verify(step, result)      # tests, build, screenshot, eval
   if verdict.fail:
      plan   = replan(goal, history, verdict)
      restart_from(plan.current_step)
```

When to use PEVR over plain ReAct:
- Change touches 3+ unfamiliar files.
- Verification is cheap and unambiguous (test suite, build, screenshot diff).
- Cost of wrong direction > cost of upfront plan.

Anthropic Claude Code best-practices calls this "Explore → Plan → Implement → Commit" and recommends plan mode for unfamiliar code or multi-file changes; skip for one-line fixes ("if you could describe the diff in one sentence, skip the plan").

### Self-correction loop (evaluator-optimizer)

One LLM call generates, another evaluates and feeds back. Use when there are clear evaluation criteria AND the LLM can provide actionable feedback on its own output.

```
draft        = generate(task)
loop:
  critique   = evaluate(draft, criteria)
  if critique.passes: break
  if iterations >= 3: halt + ask user
  draft      = revise(draft, critique)
```

Anthropic's framing: "two signs of good fit — (1) responses can be demonstrably improved when feedback is articulated, (2) the LLM can provide such feedback." Examples: literary translation, multi-round search.

### Halt-condition matrix

Every loop iteration must check at least one of:

| Signal | Action |
|---|---|
| Goal met (verified, not asserted) | halt + report evidence |
| Tool-call budget exceeded | halt + summarize progress + ask user |
| Same state repeated (≥2× identical Action/Observation pair) | halt + diagnose loop |
| Tool fails 3× in a row with same error | halt + switch tool (per `try-multiple-on-failure`) |
| User interrupt | halt + checkpoint state |
| Context utilisation > 80% | halt + compact + offer to continue |

"Goal met" is the trap. Anthropic: "Claude stops when the work looks done. Without a check it can run, 'looks done' is the only signal available." Always pair the goal with a runnable check (test, build, lint, screenshot diff). If there's no check, the loop has no real halt — you're just hoping.

### Tool-call budgets per turn

Caps below are defaults; tighten per project when context is precious or actions are destructive.

| Tool class | Default cap / turn | Why |
|---|---|---|
| Read-only (Read, Glob, Grep, WebFetch) | 50 | Cheap; over-reading just wastes context, not state |
| Bash (non-mutating) | 25 | Medium cost; output can balloon |
| Bash (mutating) / Write / Edit / NotebookEdit | 10 | Each one is a real change — bound them |
| Sub-agent spawn (Agent / Task) | 5 | Each child is another loop; explosive cost |
| MCP write tools (commits, deploys, sends) | 3 | One mistake = real-world side effect |

Budget hit → halt + summarize what was done + ask the user to extend or change strategy. NEVER silently continue past the cap "because it's nearly done." It is not nearly done; that's why the budget tripped.

### Observation summarization triggers

Raw tool output goes into context only if it's small AND material. Otherwise, summarize before the next Thought.

| Trigger | Treatment |
|---|---|
| Output > 200 lines | Summarize to: status, key fields, error/warning lines verbatim, line count |
| Same as previous observation | Replace body with `(unchanged from step N)` |
| Binary / base64 / image data | Header only; full payload behind a reference (file path, blob id) |
| Stack trace / log spam | First 5 lines + last 5 lines + `(N lines elided)` |
| Successful Read of a large file | Keep the slice the next Thought actually cites; drop the rest |
| Tool error | Verbatim error message + which arg likely caused it. No verbose stack. |

Anthropic best-practices: "Claude's context window fills up fast, and performance degrades as it fills... the context window is the most important resource to manage." Summarization is what keeps the loop alive past iteration 20.

### Context-shrink on retry

When the same error appears twice consecutively, the loop is stuck because the model is re-reading the same context and producing the same plan. Shrink before retrying.

| Attempt | Strategy |
|---|---|
| 1st failure | Same context, retry with a different parameter/tool/value |
| 2nd failure (same error) | Summarize history-so-far into a single Thought, drop oldest 50% of Observations, retry |
| 3rd failure | Halt. Surface to user with: what was tried, why each failed, 2-3 alternatives |

This compounds with `try-multiple-on-failure`: "≥3 alternatives before reporting blocker." Loop engineering says WHEN to switch (after 2nd repeat); `try-multiple` says WHAT to switch to.

### When to use which pattern

| Task shape | Use |
|---|---|
| Single-file fix, scope clear | ReAct, no plan |
| Multi-file or unfamiliar code | PEVR (plan first) |
| Output quality > correctness (translation, prose, design) | Evaluator-optimizer |
| Open-ended exploration | ReAct + tight budget + explicit halt-on-budget |
| Parallelizable sub-tasks | Orchestrator-workers (Agent fan-out), NOT a single loop |

Anthropic: "find the simplest solution possible, and only increase complexity when needed." Plain prompt > workflow > agent loop > orchestrator. Climb the ladder only when the rung below demonstrably fails.

### Reflection / self-critique cadence

Reflection is cheap; over-reflection is wasted budget. Cadence rules:

- Reflect AT the halt-condition check, not every iteration. One Thought per iteration is enough — adding "let me think about whether I should think about this" doubles tokens for no gain.
- Reflect WHEN: budget approaching cap (≥80%), tool failed once, plan step verification ambiguous, OR user redirected mid-task.
- Reflect HOW: write the reflection AS the next Thought, then take the next Action. Do not branch into a separate "reflection turn" unless the user asked.
- Skip reflection entirely on trivial loops (≤3 iterations expected, no destructive actions). Overhead exceeds value.

### Sub-agent loops vs flat loops

When the task fans out (e.g. "audit 12 repos for X"), spawning sub-agents is cheaper than running 12× the iterations in a single context. Rules:

- Parent's budget excludes sub-agent's internal budget. Cap parents at 5 sub-agent spawns/turn.
- Sub-agent returns ONLY the final answer to parent — its scratch tool-calls stay in its own context and die with it. This is the cleanest observation-summarization mechanism available.
- Don't spawn a sub-agent for work the parent could finish in <5 tool calls. The handoff cost (prompt + return parse) exceeds savings.
- Per `playwright-over-chrome-devtools-mcp` and similar: use the right skill/tool in the sub-agent rather than re-implementing in the parent.

## Anti-patterns

- **Infinite agent loop with no halt condition.** "Try until done" — done by what measure? If there isn't a programmatic check, you don't have a loop, you have a runaway.
- **Tool spam without Observation.** Calling 5 tools in parallel and skipping the Thought-on-each-result is the act-only baseline — Yao et al specifically showed this underperforms ReAct.
- **Re-reading the same file 5+ times.** This is "repeated state" — halt + summarize what you read, don't re-read.
- **Blind retry after a tool error.** Same call, same args, same error → wasted budget. Either change the args, the tool, or stop. (Violates `try-multiple-on-failure`.)
- **Silent budget overrun.** "Just one more tool call" twenty times. The budget existed because you set it when sober; honor it.
- **Pasting full tool output into the next prompt.** Specifically: full `ls -R`, full `git log`, full file dumps of files you only need 10 lines of. Summarize at the boundary.
- **Loops without verification.** "I implemented the function" with no test run is a 50% guess. Give the loop a check it can run (Anthropic: "the difference between a session you watch and one you walk away from").
- **Plan-then-ignore-plan.** Producing a plan and then deviating without replan is worse than no plan — you spent the tokens for nothing.
- **One giant turn with 80 tool calls.** Split into PEVR sub-turns at natural verification boundaries; let the user interrupt at gate points.

## Concrete defaults for this repo

- Default loop = ReAct. PEVR triggered when task touches 3+ files OR involves architectural decisions (auto-grill rule applies).
- Tool budget per turn = 25 mixed unless overridden. Read-only fan-out for exploration uses Explore sub-agent so the parent's budget isn't consumed.
- Observations > 200 lines get summarized before being fed back. Specifically: directory listings, log dumps, `git log` output.
- Halt + ask when: budget exceeded, same Action twice in a row with same Observation, or context utilisation crosses 80%.
- On 2nd-failure of same operation: summarize and shrink. On 3rd: halt and grill the user with ≥2 alternatives (per `max-proactive-grill-always` + `try-multiple-on-failure`).

## Cross-refs

- [`try-multiple-on-failure`](./try-multiple-on-failure.md) — ≥3 alternatives before reporting blocker. Loop engineering says WHEN to switch; this rule says WHAT to switch to.
- [`max-proactive-grill-always`](./preferences/max-proactive-grill-always.md) — proactive, but bounded by budgets and halt conditions in this rule.
- [`read-before-edit`](./read-before-edit.md) — every Edit Action requires a prior Read Observation in the same loop.
- [`search-multi-engine-fallback`](./search-multi-engine-fallback.md) — concrete instance of `try-multiple-on-failure` for web search; same loop shape.
- [`agent-minimum-context`](./agent-minimum-context.md) — keep upfront context tight so the loop's working budget stays large.

## Sources

- Anthropic, "Building effective agents" (Dec 2024) — workflows vs agents, augmented-LLM building block, orchestrator-workers, evaluator-optimizer, halt-on-iteration-cap. <https://www.anthropic.com/engineering/building-effective-agents>
- Anthropic, "Best practices for Claude Code" — give the agent a check it can run, explore-plan-implement-commit, context window as the scarcest resource, verification subagents. <https://www.anthropic.com/engineering/claude-code-best-practices>
- Yao et al, "ReAct: Synergizing Reasoning and Acting in Language Models" (arXiv:2210.03629, ICLR 2023) — Thought/Action/Observation interleaving; reason-only hallucinates, act-only can't synthesize. <https://arxiv.org/abs/2210.03629>
- ReAct project site — prompting patterns, ALFWorld/WebShop benchmarks. <https://react-lm.github.io/>
- Karpathy (karpathy.ai, bearblog) — agent / LLM-loop framing in his 2024-2025 "How I use LLMs" / "Deep Dive into LLMs" lectures (linked from karpathy.ai). <https://karpathy.ai/>

