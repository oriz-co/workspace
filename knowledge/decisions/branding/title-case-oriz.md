---
type: decision
title: "Brand capitalisation — Title-Case 'Oriz' in user-facing copy"
description: "User-facing brand mark is rendered Title-Case as 'Oriz'. Repo slugs, npm package names, DOM attributes, and code identifiers stay lowercase (`oriz-*`, `@chirag127/oriz-*`, `data-oriz-*`)."
tags: [decision, branding, capitalisation, naming]
timestamp: 2026-06-20
format_version: okf-v0.1
status: active
related:
  - decisions/branding/oriz-me-added-to-family.md
  - decisions/branding/repo-naming-suffixes.md
  - decisions/branding/keep-oriz-add-site-suffix.md
---

# Decision

The brand mark is **"Oriz"** (Title-Case) in every user-facing surface — homepage wordmark, page titles, meta descriptions, README headlines, social cards, OG images, status-page name, support-page copy, billing receipts, and email "from" name. Lowercase `oriz` is reserved for machine-facing identifiers: repo slugs (`chirag127/blog-site`), npm package names (`@chirag127/oriz-kit`), DOM data-attributes (`data-oriz-multisearch`), CSS custom-property prefixes (`--oriz-*`), env-var prefixes (`ORIZ_*`), and shell scripts.

# Why

The user wrote on 2026-06-20: *"the brand is Oriz Title Case, not oriz lowercase."* The previous unwritten convention had the homepage wordmark as `oriz` (matching the slug) on the assumption that "the slug is the brand". That conflated the **trademark** (a thing humans read) with the **identifier** (a thing machines read). They are different artefacts with different rules — Google is "Google" in copy and `google` in `google.com`, Apple is "Apple" in copy and `apple` in `apple.com`. The trademark is now Title-Case; the identifier rules from [`repo-naming-suffixes`](./repo-naming-suffixes.md) and [`oriz-kit-package-name`](./oriz-kit-package-name.md) are unchanged.

# Implications

- **Homepage wordmark.** `<h1 class="brand">Oriz</h1>` everywhere. Update on `oriz.in`, every sister site that mentions the family ("a part of Oriz"), every README's "What is this?" section, every OG image, every `og:site_name` meta tag, every JSON-LD `Organization.name`.
- **Page titles + meta descriptions.** Every `<title>` and `<meta name="description">` that currently reads "oriz —" or "oriz is" is updated to "Oriz —" / "Oriz is". The `<BaseLayout title=…>` invocations pass the Title-Case form.
- **Social copy.** Bluesky / Mastodon / GitHub bio / Twitter handle display names use "Oriz". Handle slugs (`@oriz`, `@oriz.bsky.social`, etc.) stay lowercase because handles are identifiers, not display names.
- **Repo slugs UNCHANGED.** `chirag127/blog-site` stays lowercase — it's a path component. Renaming repos to "Pages" would break every existing deep link, every CI workflow, every submodule pointer, every `pnpm` lockfile path, every git remote — for zero brand benefit because nobody reads the slug as the brand.
- **npm package names UNCHANGED.** `@chirag127/oriz-kit` stays lowercase — npm packages are case-sensitive on case-sensitive filesystems and the convention is firmly lowercase across the registry. The package's `package.json` `description` field, however, says "Oriz".
- **DOM / HTML attributes UNCHANGED.** `data-oriz-multisearch`, `data-oriz-status`, `data-oriz-status-dismiss` stay lowercase — HTML attribute names are case-insensitive but the convention is lowercase, and the attribute selector grammar (`[data-oriz-…]`) reads cleaner unbroken.
- **CSS / env / shell prefixes UNCHANGED.** `--oriz-accent`, `ORIZ_API_KEY`, `oriz_*` shell vars all stay lowercase — these are identifiers, not display strings.
- **Code identifiers UNCHANGED.** TypeScript type names that already read `Oriz*` stay (e.g. `OrizKitConfig`); they were Title-Case anyway because TypeScript class/type names are conventionally PascalCase. Module specifiers (`from '@chirag127/oriz-kit'`) stay lowercase — see npm rule above.
- **Email "from" name.** Transactional sender becomes `Oriz <hi@oriz.in>` (Title-Case display name; lowercase mailbox per RFC convention). Same for marketing (EmailOctopus) and dev digest (Buttondown) sender configs.
- **Status page.** Better Stack + Instatus status-page display names updated to "Oriz". The hostname `status.oriz.in` is unchanged.
- **OG image generator.** [Satori OG card route](../architecture/og-card-generation-satori.md) at `og.oriz.in` renders the wordmark as `Oriz` Title-Case in display-serif. Existing `og.png` snapshots are regenerated on next build.
- **Audit script (future).** A `scripts/check-brand-capitalisation.sh` (not yet written) can enforce: any `.md` / `.mdx` / `.astro` / `.html` / `.txt` file may not contain the bare word "oriz" outside backticks (which mark code / identifiers); allowed in URLs, code blocks, attribute names, package names. Filed under [`rules/`](../../rules/index.md) when written.

# Cross-refs

- [`decisions/branding/oriz-me-added-to-family.md`](./oriz-me-added-to-family.md) — sister branding decision (member-site naming).
- [`decisions/branding/repo-naming-suffixes.md`](./repo-naming-suffixes.md) — repo-slug rules; lowercase `oriz-<name>-<suffix>` lock unchanged.
- [`decisions/branding/keep-oriz-add-site-suffix.md`](./keep-oriz-add-site-suffix.md) — original brand-vs-suffix split; refines.
- [`decisions/branding/oriz-kit-package-name.md`](./oriz-kit-package-name.md) — `@chirag127/oriz-kit` npm name unchanged.
- [`decisions/branding/family-wide-privacy-page.md`](./family-wide-privacy-page.md) — privacy copy uses Title-Case "Oriz".
