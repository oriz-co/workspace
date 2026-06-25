---
type: decision
title: "Forms \u2014 trio (Web3Forms primary + Static Forms fallback + Tally for rich)"
description: 'Locked 2026-06-20: contact forms ship a vendor-redundant pair (Web3Forms
  primary, Static Forms fallback, both browser-only, both free unlimited). Tally handles
  rich / multi-step / conditional forms. Three roles, no overlap.'
tags:
- forms
- decisions
- architecture
- web3forms
- static-forms
- tally
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- services/forms/web3forms
- services/forms/static-forms
- services/forms/tally
- services/forms/formspree
- rules/interaction/no-card-on-file
- rules/development/no-web3forms-server-side
---



# Forms — trio (Web3Forms primary + Static Forms fallback + Tally for rich)

## Decision

The family runs three form services, each with a distinct role:

| Role | Service | Why |
|---|---|---|
| Contact form — primary | [Web3Forms](../../../services/forms/web3forms.md) | Browser-only, domain-bound key, unlimited free |
| Contact form — fallback | [Static Forms](../../../services/forms/static-forms.md) | Different vendor + edge; auto-swapped by `<ContactForm>` on Web3Forms failure |
| Rich / multi-step / conditional forms | [Tally](../../../services/forms/tally.md) | Logic, conditional branches, payment integration, unlimited free |

[Formspree](../../../services/forms/formspree.md) stays documented as a
second swap target but is **not** in the active rotation.

## Why three and not one

- **Web3Forms alone** — single-vendor risk; if Web3Forms quotas tighten
  or has an outage, every contact form on every site goes dark.
- **Tally for everything** — overkill for a 3-field contact form;
  the embed is heavier and the form lives at `tally.so/...` rather
  than on-domain.
- **Static Forms alone** — newer / smaller vendor than Web3Forms;
  better as a fallback than as the primary.

The trio mirrors the
[captcha-turnstile-plus-hcaptcha pattern](../../security/captcha-turnstile-plus-hcaptcha.md):
two free vendors on different infra for the high-availability
surface, plus a specialist tool for the case the simple one doesn't
cover.

## Implications

- **One `<ContactForm>` component** in
  [`@chirag127/oriz-kit`](../../../glossary/o-r/oriz-kit.md) wraps both
  contact backends. `provider` prop or `onError` handler swaps
  Web3Forms → Static Forms transparently.
- **Tally embeds** ship as a separate `<TallyForm formId="...">`
  component in oriz-kit — no overlap with `<ContactForm>`.
- **Both contact backends are browser-only** — no API keys leak
  because both use domain-bound access keys; aligns with
  [`rules/no-web3forms-server-side.md`](../../../rules/development/no-web3forms-server-side.md).
- **Anti-bot pairing** — `<ContactForm>` mounts the
  [`<Captcha>`](../../security/captcha-turnstile-plus-hcaptcha.md)
  widget (Turnstile primary, hCaptcha fallback) inline. The token
  travels with the form payload to whichever backend handles the
  submit.
- **Per-site env-var kill-switch:** `ENABLE_STATIC_FORMS=true|false`
  lets a site disable the fallback if the access key isn't set
  (yet) without breaking the primary path.

## Cross-refs

- [Forms services index](../../../services/forms/index.md)
- [Web3Forms — primary](../../../services/forms/web3forms.md)
- [Static Forms — fallback](../../../services/forms/static-forms.md)
- [Tally — rich forms](../../../services/forms/tally.md)
- [Captcha pair decision](../../security/captcha-turnstile-plus-hcaptcha.md)
- [No web3forms server-side rule](../../../rules/development/no-web3forms-server-side.md)
- [No card-on-file rule](../../../rules/interaction/no-card-on-file.md)
