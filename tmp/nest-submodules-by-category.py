#!/usr/bin/env python3
"""Phase H1 — nest 77 submodules under repos/<category>/<slug>/ via `git mv`.

Reverses the flat-over-nested rule per user 2nd-choice signal 2026-06-25.
`git mv` on a submodule path auto-updates `.gitmodules` so we don't need
deinit/re-add. Single category per repo (the categorization agent locked
this earlier this session).
"""
import subprocess
import sys
from pathlib import Path

UMBRELLA = Path("c:/D/oriz")

# Single-category map: slug -> category. From the categorization agent's output.
CATEGORY = {
    # apps (18) — user-facing web apps on subdomains
    "blog": "apps", "cards": "apps", "finance": "apps", "health": "apps",
    "journal": "apps", "me": "apps", "packages": "apps", "tools": "apps",
    "oriz-cipher-crypto-tools-app": "apps",
    "oriz-forge-dev-tools-app": "apps",
    "oriz-janaushdhi-app": "apps",
    "oriz-lore-app": "apps",
    "oriz-ncert-app": "apps",
    "oriz-omni-post-app": "apps",

    # apis (20) — HTTP services / CF Workers
    "oriz-air-quality-india-api": "apis",
    "oriz-currency-rates-api": "apis",
    "oriz-flow-fii-dii-activity-api": "apis",
    "oriz-gold-silver-rates-api": "apis",
    "oriz-ifsc-api": "apis",
    "oriz-india-budget-numbers-api": "apis",
    "oriz-india-holidays-api": "apis",
    "oriz-india-petrol-diesel-api": "apis",
    "oriz-india-train-schedules-api": "apis",
    "oriz-india-weather-api": "apis",
    "oriz-mf-nav-api": "apis",
    "oriz-mmi-tickertape-mmi-api": "apis",
    "oriz-nse-bse-tickers-api": "apis",
    "oriz-pincode-api": "apis",
    "oriz-rbi-rates-api": "apis",
    "freellmapi": "apis",
    "omniroute": "apis",
    "openmodel-shim-api": "apis",

    # packages (24) — npm packages
    "astro-billing-npm-pkg": "packages",
    "astro-chrome-npm-pkg": "packages",
    "astro-content-npm-pkg": "packages",
    "astro-data-npm-pkg": "packages",
    "astro-distribute-npm-pkg": "packages",
    "astro-forms-npm-pkg": "packages",
    "astro-pwa-npm-pkg": "packages",
    "astro-shell-npm-pkg": "packages",
    "astro-test-utils-npm-pkg": "packages",
    "astro-tools-npm-pkg": "packages",
    "astro-widgets-npm-pkg": "packages",
    "auth-cli-npm-pkg": "packages",
    "auth-core-npm-pkg": "packages",
    "auth-vsc-npm-pkg": "packages",
    "auth-wxt-npm-pkg": "packages",
    "omni-publish-npm-pkg": "packages",
    "oriz-ai-providers-npm-pkg": "packages",
    "oriz-analytics-npm-pkg": "packages",
    "oriz-book-build-npm-pkg": "packages",
    "oriz-consent-npm-pkg": "packages",
    "oriz-rate-limit-npm-pkg": "packages",
    "oriz-seo-npm-pkg": "packages",
    "oriz-ui-npm-pkg": "packages",

    # browser-extensions (5)
    "ai-rewrite-bs-ext": "browser-extensions",
    "bookmark-mind-bs-ext": "browser-extensions",
    "chathub-bs-ext": "browser-extensions",
    "dearrow-plus-bs-ext": "browser-extensions",

    # ide-extensions (1)
    "sops-lens-vsc-ext": "ide-extensions",

    # cli-tools (1)
    "claude-notifications-cli": "cli-tools",

    # mcp-servers (1)
    "clear-thought-mcp-server": "mcp-servers",

    # userscripts (1)
    "userscripts": "userscripts",

    # books (6)
    "oriz-janaushdhi-book": "books",
    "oriz-me-book": "books",
    "oriz-paisa-book": "books",
    "oriz-pdf-book": "books",
    "oriz-stack-book": "books",

    # data (1)
    "oriz-ai-providers-data": "data",

    # templates (2)
    "template": "templates",
    "oriz-api-docs-template": "templates",

    # infra (5)
    "auth": "infra", "backup": "infra", "home": "infra",
    "secrets": "infra", "status": "infra",

    # meta (1) — agent-skills is the only real meta repo; `oriz` is leftover empty dirs
    "agent-skills": "meta",
}


def run(cmd, check=True):
    print(f"  $ {cmd}")
    r = subprocess.run(cmd, cwd=UMBRELLA, shell=True, capture_output=True, text=True)
    if r.returncode != 0:
        if check:
            print(r.stderr.strip()[:500])
            sys.exit(f"FAIL: {cmd}")
    return r


def list_submodules():
    """Return list of current submodule paths."""
    r = subprocess.run(
        "git submodule status",
        cwd=UMBRELLA, shell=True, capture_output=True, text=True,
    )
    paths = []
    for line in r.stdout.splitlines():
        # Format: " <sha> path (ref)"
        parts = line.strip().split(maxsplit=2)
        if len(parts) >= 2:
            paths.append(parts[1])
    return paths


def main():
    apply = "--apply" in sys.argv
    paths = list_submodules()
    plan = []
    unmapped = []
    for path in paths:
        # Strip "repos/" prefix → slug
        if not path.startswith("repos/"):
            unmapped.append((path, "not under repos/"))
            continue
        slug = path[len("repos/"):]
        cat = CATEGORY.get(slug)
        if cat is None:
            unmapped.append((path, f"slug '{slug}' has no category"))
            continue
        new_path = f"repos/{cat}/{slug}"
        if new_path == path:
            continue  # already nested
        plan.append((path, new_path))

    print(f"=== PLAN: nest {len(plan)} submodules; {len(unmapped)} unmapped ===\n")
    if unmapped:
        print("--- UNMAPPED (will be left as-is) ---")
        for p, why in unmapped:
            print(f"  {p}  [{why}]")
        print()

    print("--- Moves ---")
    by_cat = {}
    for old, new in plan:
        by_cat.setdefault(new.split("/")[1], []).append((old, new))
    for cat, moves in sorted(by_cat.items()):
        print(f"\n  [{cat}] ({len(moves)} repos)")
        for old, new in moves:
            print(f"    {old}  ->  {new}")

    if not apply:
        print("\n(dry run; pass --apply to execute)")
        return

    print("\n=== APPLYING ===\n")
    failed = []
    for i, (old, new) in enumerate(plan, 1):
        # Ensure parent dir exists
        parent = "/".join(new.split("/")[:-1])
        Path(UMBRELLA / parent).mkdir(parents=True, exist_ok=True)
        r = run(f'git mv "{old}" "{new}"', check=False)
        marker = "OK" if r.returncode == 0 else "FAIL"
        print(f"  [{i:2d}/{len(plan)}] {marker} {old} -> {new}")
        if r.returncode != 0:
            failed.append((old, new, r.stderr.strip()[:200]))

    print(f"\nDone. {len(plan)-len(failed)} ok, {len(failed)} failed.")
    if failed:
        print("\nFailures:")
        for old, new, err in failed:
            print(f"  {old} -> {new}: {err}")
        sys.exit(1)


if __name__ == "__main__":
    main()
