#!/usr/bin/env python3
"""Un-nest all submodules from repos/<category>/<slug>/ back to repos/<slug>/.

Reverses the nest-by-category move. Locks the flat-always rule.
"""
import re
import subprocess
import sys
from pathlib import Path

UMBRELLA = Path("c:/D/oriz")


def list_submodules():
    r = subprocess.run(
        "git submodule status",
        cwd=UMBRELLA, shell=True, capture_output=True, text=True,
    )
    paths = []
    for line in r.stdout.splitlines():
        parts = line.strip().split(maxsplit=2)
        if len(parts) >= 2:
            paths.append(parts[1])
    return paths


def main():
    apply = "--apply" in sys.argv
    paths = list_submodules()
    plan = []
    skipped = []
    for p in paths:
        # Match repos/<category>/<slug>/ -> repos/<slug>/
        m = re.match(r"^repos/([^/]+)/([^/]+)$", p)
        if not m:
            # Already flat (repos/<slug>/) or malformed
            if re.match(r"^repos/[^/]+$", p):
                skipped.append((p, "already flat"))
            else:
                skipped.append((p, "unrecognized shape"))
            continue
        category, slug = m.groups()
        new_path = f"repos/{slug}"
        # Special case: userscripts/bundle → userscripts (rename)
        if category == "userscripts" and slug == "bundle":
            new_path = "repos/userscripts"
        plan.append((p, new_path, category))

    print(f"=== PLAN: un-nest {len(plan)} submodules; {len(skipped)} skipped ===\n")
    if skipped:
        for p, why in skipped:
            print(f"  [skip] {p}  -- {why}")
        print()

    # Group by category for readable output
    by_cat = {}
    for old, new, cat in plan:
        by_cat.setdefault(cat, []).append((old, new))
    for cat, moves in sorted(by_cat.items()):
        print(f"  [{cat}] ({len(moves)} repos)")
        for old, new in moves:
            print(f"    {old}  ->  {new}")
        print()

    if not apply:
        print("(dry run; pass --apply to execute)")
        return

    print("=== APPLYING ===\n")
    failed = []
    for i, (old, new, cat) in enumerate(plan, 1):
        r = subprocess.run(
            f'git mv "{old}" "{new}"',
            cwd=UMBRELLA, shell=True, capture_output=True, text=True,
        )
        ok = r.returncode == 0
        marker = "OK" if ok else "FAIL"
        print(f"  [{i:2d}/{len(plan)}] {marker} {old} -> {new}")
        if not ok:
            err = r.stderr.strip()[:200]
            print(f"          stderr: {err}")
            failed.append((old, new, err))

    print(f"\nDone. {len(plan)-len(failed)} ok, {len(failed)} failed.")
    if failed:
        for old, new, err in failed:
            print(f"  {old} -> {new}: {err}")
        sys.exit(1)


if __name__ == "__main__":
    main()
