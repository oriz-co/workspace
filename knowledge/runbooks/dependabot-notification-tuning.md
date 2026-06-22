# Runbook — Dependabot notification tuning (kill email noise)

**Status:** active
**Last updated:** 2026-06-22
**Trigger:** Dependabot email backlog crossed 1,300 unread; alerts must stay visible, emails must stop.
**Owner:** chirag127

## TL;DR

Dependabot has **two noise channels**:

1. **Per-user notification settings** (GitHub UI only — no API). Disables emails for security alerts + version updates across every repo the user owns/watches.
2. **Per-repo `dependabot.yml`** — batches updates into ≤2 PRs/week per ecosystem with grouped minor+patch bumps. Sweep template lives in [`templates/.github/dependabot.yml`](../../templates/.github/dependabot.yml) and is mirrored to every submodule.

Combined effect: ~90% fewer email triggers, alerts still visible in the **Security** tab of every repo.

---

## Phase 1 — User-level notification settings (manual, ~90 seconds)

GitHub does **not** expose a REST/GraphQL endpoint for per-user notification preferences. You must click through `https://github.com/settings/notifications`.

### Exact click path

1. Open <https://github.com/settings/notifications>.
2. Scroll to **"Dependabot alerts"** (under *System*).
3. Set **"New vulnerabilities"** routing:
   - [ ] Email — **uncheck**
   - [x] Web — keep checked
   - [x] CLI — keep checked (only relevant if you run `gh`)
4. Set **"Security updates"** (the PRs Dependabot opens to fix alerts):
   - [ ] Email — **uncheck**
   - [x] Web — keep
5. (Optional but recommended) Scroll up to **"Actions"** and uncheck **Email** for *Send notifications for failed workflows only*.
6. Scroll down to **"Watching"**:
   - Set **Participating, @mentions and custom** → keep Web + Email
   - Set **All Activity** → Web only (no Email)
7. Click **Save** at each section that has a save button (most save inline).

### Verification

- Open a recent Dependabot alert in any repo → the **"Notify me about"** state on `https://github.com/settings/notifications` should now show Email **off** for Dependabot rows.
- Wait 24h. Inbox should drop from ~30 Dependabot mails/day → ~0–2/week (only batched-grouped PR creation if you ever flip it back on).

### Rollback

Re-check the boxes. No data loss; only routing changes.

---

## Phase 2 — Per-repo `dependabot.yml` (automated sweep)

Template (also at `templates/.github/dependabot.yml` at master root):

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 5
    groups:
      production-minor-patch:
        update-types: ["minor", "patch"]
      dev-dependencies:
        dependency-type: "development"
        update-types: ["minor", "patch", "major"]
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "monthly"
```

### What this changes vs default

| Default (no config) | With this config |
|---|---|
| Daily checks, 1 PR per outdated dep | Weekly Monday, grouped into 2 PRs (prod minor/patch + all dev) |
| Unlimited open PRs per ecosystem | Cap at 5 npm + monthly GH Actions |
| Email per PR open | One batch → max 2 emails/week/repo |

### Sweep procedure

Run the agent loop in [`apply-per-site-ci.md`](./apply-per-site-ci.md) — same pattern, different file. Skip any repo where `.github/dependabot.yml` already exists with custom config (a single `version: 2` placeholder is NOT custom — overwrite).

Submodule commit message:

```
chore(deps): batch Dependabot to weekly + grouped updates (kill email noise)
```

Master commit message after pointer-bump sweep:

```
chore(deps): sweep dependabot.yml across N submodules (email noise kill)
```

### Edge cases

- **Python repos** (`-py-pkg-cli` family) — add a third entry `package-ecosystem: "pip"` with same weekly cadence.
- **Repos with no manifest yet** (slug-reservation stubs) — STILL add the file; Dependabot will no-op until a manifest lands.
- **Renovate-managed repos** — see [`install-github-apps.md`](./install-github-apps.md). Renovate config takes precedence; Dependabot.yml becomes redundant but does not conflict. Leave both for defence-in-depth.

---

## Phase 3 — Audit installed GH Apps

See companion runbook [`install-github-apps.md`](./install-github-apps.md) for the install matrix and audit cadence. The latest one-shot audit lives at [`github-apps-audit-2026-06-22.md`](./github-apps-audit-2026-06-22.md). Re-run quarterly:

```bash
gh api 'users/chirag127/installations' --jq '.installations[] | {slug: .app_slug, id: .id, perms: .permissions}'
```

Cross-reference with email volume per app — anything sending >5 mails/week without value gets removed.

---

## Related

- [`apply-per-site-ci.md`](./apply-per-site-ci.md) — sweep pattern for any per-repo config
- [`install-github-apps.md`](./install-github-apps.md) — which GH apps we install + why
- [`rotate-leaked-secret.md`](./rotate-leaked-secret.md) — adjacent security runbook
- Rule [`knowledge/rules/auto-only-tracking.md`](../rules/auto-only-tracking.md) — why we keep alerts visible (auto-capture) while killing emails (noise)
