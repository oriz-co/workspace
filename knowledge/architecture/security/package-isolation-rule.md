---
type: architecture
title: "Package isolation rule \u2014 every external service wraps in a typed package"
description: Every external service must be wrapped in a typed @chirag127 package
  so swapping providers is a package version bump, not a 50-file rewrite. Any new
  service crossing 3+ sites' boundary gets a wrapper on first introduction.
tags:
- architecture
- packages
- isolation
- swap-cost
- rule
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
- architecture/packages/the-23-packages
- architecture/compute/api-routes-structure
- architecture/compute/hono-rpc-type-sharing
---



# Package isolation rule — every external service wraps in a typed package

## Concept

Every external service the family uses must sit behind a typed
`@chirag127/<name>` package. Swapping providers is then a package
version bump in each consumer, not a per-site rewrite. The rule
applies on both sides of the network boundary: client-side wraps
(Firebase, contact form) and server-side route folders (Razorpay,
reCAPTCHA, Resend) follow the same shape.

## How it works

- Client-side examples (existing today):
  - `@chirag127/firebase-init` wraps Firebase. Replace with Supabase = swap the package.
  - `@chirag127/contact-form` wraps Web3Forms. Replace with Formspree = swap the package.
  - `@chirag127/auth-ui` wraps the Firebase auth components.
- Client-side examples (planned):
  - `@chirag127/email-send` will wrap Resend (alt: AhaSend).
  - `@chirag127/ratelimit-recaptcha` will wrap reCAPTCHA Enterprise (alt: hCaptcha / Turnstile).
  - `@chirag127/billing-razorpay` will wrap Razorpay (alt: Stripe / Lemon Squeezy).
- Server-side mirror: routes under `apps/api/src/routes/` are folder-per-service so an integration swap is contained — see [api-routes-structure.md](../compute/api-routes-structure.md).
- Trigger: any new external service that crosses 3+ sites' boundary
  gets a package wrapping it on first introduction. A service used
  by exactly one site can stay inline until a second site needs it.

## Why this shape

Free tiers change. Razorpay's free webhooks could become metered
overnight; Web3Forms could rate-limit a domain. The package boundary
is the cheap insurance: every consumer pins a version, the wrapper
exposes a stable shape, and the swap is one PR per package, not one
PR per site times the number of sites.

It also means the shape of the code doesn't depend on which provider
won the bake-off this year. Sites import a typed `<ContactForm>`, not
"Web3Forms". The thing the application code knows about is the
abstraction; the provider is a config detail.

## Cross-refs

- The current packages → [the-23-packages.md](../packages/the-23-packages.md) (18 packages locked)
- The server-side mirror of this rule → [api-routes-structure.md](../compute/api-routes-structure.md)
- Why typed clients matter for the API package → [hono-rpc-type-sharing.md](../compute/hono-rpc-type-sharing.md)
