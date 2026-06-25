---
type: rule
title: 'Frontend-design skill: distinctive intentional visual design for every UI'
description: "Permanently baked into knowledge per user mandate 2026-06-22 evening.\
  \ This is the agent's design philosophy when building or reshaping any UI. Ground\
  \ design in the subject. Hero is a thesis. Typography carries personality. Structure\
  \ is information. Motion is deliberate. Match complexity to vision. Avoid AI-cluster\
  \ defaults. Brainstorm-explore-plan-critique-build-critique-again. Restraint + self-critique\
  \ (remove one accessory before publishing). Writing is design material \u2014 active\
  \ voice, end-user side of screen, name by what people control."
tags:
- rule
- design
- frontend
- distinctive
- intentional
- agent-philosophy
timestamp: 2026-06-22
format_version: okf-v0.1
status: active
related:
- rules/design/per-app-distinctive-frontend-design
- decisions/architecture/general/shared-vs-divergent-matrix
---



# Frontend-design skill (baked-in agent philosophy)

Approach every UI task as the design lead at a small studio known for giving every client a visual identity that could not be mistaken for anyone else's. This client has rejected proposals that felt templated and is paying for a distinctive point of view: make deliberate, opinionated choices about palette, typography, and layout specific to this brief, and take one real aesthetic risk you can justify.

## Ground it in the subject

If the brief does not pin down what the product or subject is, pin it yourself before designing: name one concrete subject, its audience, and the page's single job, and state your choice. The subject's own world — its materials, instruments, artifacts, vernacular — is where distinctive choices come from. Build with the brief's real content and subject matter throughout.

## Design principles

**Hero is a thesis.** Open with the most characteristic thing in the subject's world: a headline, image, animation, live demo, or interactive moment. Be deliberate. A big number with a small label + supporting stats + gradient accent is the template answer; only use if truly the best option.

**Typography carries personality.** Pair display and body faces deliberately, not the same families you would reach for on any other project. Set a clear type scale with intentional weights, widths, and spacing. Make the type treatment itself memorable.

**Structure is information.** Numbering, eyebrows, dividers, labels should encode something TRUE about the content, not decorate. `01 / 02 / 03` only if content is a real sequence.

**Motion deliberate.** Page-load sequence, scroll-triggered reveal, hover micro-interaction, ambient atmosphere. An orchestrated moment lands harder than scattered effects. Sometimes less is more — extra animation contributes to "AI-generated" feel.

**Match complexity to vision.** Maximalist needs elaborate execution. Minimal needs precision in spacing/type/detail.

**Consider written content carefully.** Copy can make a design feel as templated as the design itself.

## AI-cluster defaults to AVOID (unless brief specifically calls for them)

1. Warm cream `#F4F1EA` background + high-contrast serif display + terracotta accent
2. Near-black background + single bright acid-green or vermilion accent
3. Broadsheet-style layout with hairline rules + zero border-radius + dense newspaper columns

All three are legitimate for SOME briefs. But they are defaults, not choices. Where the brief leaves an axis free, do not spend that freedom on one of these.

## Process: brainstorm → explore → plan → critique → build → critique again

Work in two passes:

**Pass 1 (plan):** Compact token system per page:

- Color: 4–6 named hex values
- Type: 2+ roles (characterful display face used with restraint + complementary body face + utility face for captions/data)
- Layout: one-sentence prose + ASCII wireframe
- Signature: single unique element the page will be remembered by

**Pass 2 (review against brief):** If any part reads like the generic default you would produce for any similar page, revise. Only after confirming uniqueness, write code following the revised plan exactly.

When writing code, watch CSS selector specificity. Type-based selector (`.section`) vs element-based (`.cta`) can cancel each other out, especially in section paddings/margins.

Plan + iterate in thinking; show ideas only when confident they will delight.

## Restraint and self-critique

Spend boldness in one place. Let the signature element be the one memorable thing; keep everything around it quiet and disciplined; cut decoration that does not serve the brief. Not taking a risk can be a risk itself.

Quality floor (don't announce it): responsive down to mobile, visible keyboard focus, reduced motion respected.

Critique own work as building — screenshots are worth 1000 tokens. **Chanel's advice: before leaving the house, look in the mirror and remove one accessory.**

## Writing as design material

Words appear in a design for one reason: to make it easier to understand and therefore easier to use. They are design material, not decoration.

- Write from the **end user's side of the screen.** Name things by what people control and recognize, never by how the system is built. A person manages notifications, not webhook config.
- Use **active voice** as default. A control says exactly what happens: "Save changes," not "Submit." An action keeps the same name through the flow.
- Treat failure and emptiness as **moments for direction, not mood.** Explain what went wrong and how to fix it. Errors don't apologize and are never vague.
- Keep the register **conversational and tuned**: plain verbs, sentence case, no filler.
- Each element does **exactly one job**. A label labels, an example demonstrates; nothing quietly does double duty.

## Cross-refs

- Per-app distinctive design → [[rules/per-app-distinctive-frontend-design]]
- Shared-vs-divergent matrix → [[decisions/architecture/shared-vs-divergent-matrix]]
