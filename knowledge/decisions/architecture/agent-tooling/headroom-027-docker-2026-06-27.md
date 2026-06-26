---
type: decision
title: 'Headroom 0.27 via Docker — chain Hr → hai → Bedrock'
description: Hr 0.27 native build blocked by ASR (Access Denied on Rust build-scripts). Docker image ghcr.io/chopratejas/headroom:latest bypasses the build. Backend=anthropic passthrough forwards to hai at host.docker.internal:6655.
tags: [headroom, hai, docker, compression, sap, bedrock, asr]
timestamp: 2026-06-27
format_version: okf-v0.1
status: active
supersedes:
  - decisions/architecture/agent-tooling/hr-out-of-path-hai-direct-2026-06-27.md
  - decisions/architecture/agent-tooling/headroom-install-all-paths-2026-06-26.md
related:
  - rules/agent/single-claude-config-always-hr
  - decisions/architecture/agent-tooling/headroom-always-on-proxy-2026-06-26
---

# Headroom 0.27 via Docker — Hr → hai → Bedrock chain

## Decision

Run Hr 0.27 as a Docker container. Claude Code → Hr :8787 → hai :6655 → Bedrock.

## Why Docker, not pipx

Hr 0.27 source build needs Rust + MSVC + working linker. All three present after VS 2026 Community + "Desktop C++" workload + rustup. BUT Rust build-scripts execute compiled .exe binaries from `%TEMP%\pip-install-*` directories — corporate ASR (Defender) **silently blocks the execution** with `Access is denied (os error 5)`. Build fails on `portable-atomic`, `httparse`, `rustls`, `av-scenechange`, `rustversion`. Cannot upgrade pipx Hr from 0.19 → 0.27 on this machine.

Docker image ships pre-built binaries. Skip the build. Confirmed working.

## Config

```bash
docker run -d \
  --name headroom-proxy \
  --restart unless-stopped \
  -p 8787:8787 \
  -e ANTHROPIC_TARGET_API_URL=http://host.docker.internal:6655/anthropic \
  ghcr.io/chopratejas/headroom:latest \
  --port 8787 --host 0.0.0.0 --backend anthropic
```

Key flags:
- `--backend anthropic` (NOT `bedrock`) — passthrough mode. hai already does SigV4 signing.
- `ANTHROPIC_TARGET_API_URL` — sends `/v1/messages` to hai instead of api.anthropic.com.
- `host.docker.internal` — Docker Desktop's host-loopback alias on Windows. Required because hai runs on the host, not in the container.
- `--restart unless-stopped` — auto-start on Docker Desktop boot. Replaces the old Win Task Scheduler entry for pipx (now disabled).

## Claude Code wiring

`~/.claude/settings.json`:
```json
"ANTHROPIC_BASE_URL": "http://localhost:8787",
"ANTHROPIC_AUTH_TOKEN": "<hai api key from Desktop App tray>",
"ANTHROPIC_MODEL": "claude-opus-latest"
```

## E2E verified 2026-06-27

```bash
$ claude --print "reply only OK"
OK
```

Model resolved: `claude-opus-4-7` via Bedrock. Hr container PID inside Docker. Health endpoint shows `upstream: healthy, url: http://host.docker.internal:6655/anthropic`.

## What this supersedes

- `hr-out-of-path-hai-direct-2026-06-27.md` — was a workaround when Hr couldn't reach hai. Now Hr 0.27 has the correct flags.
- `headroom-install-all-paths-2026-06-26.md` — said "try pipx + npm + Docker". Now: Docker is the canonical path on this machine due to ASR.

## What stays

- pipx Hr 0.19 installed (still works as standalone proxy if Docker unavailable). Win Task Scheduler entry for it: disabled but not removed.
- npm `headroom-ai@0.22.4` (SDK only) still available for in-process compress() use.

## When to revisit

- ASR exclusion granted for `%TEMP%\pip-install-*` and `~/.cargo/` — pipx native build becomes feasible
- Hr ships prebuilt Windows wheels on PyPI (currently only macos-arm64 + manylinux)
- Hr's source-build doesn't need to execute build-scripts (unlikely)

## Cross-refs

- Hr image: `ghcr.io/chopratejas/headroom:latest`
- Hr docs: https://headroom-docs.vercel.app/docs
- hai Desktop App: shows API key + base URL in tray menu
- Earlier ASR finding: pipx-installed `headroom.exe` direct-call also blocked (different shape, same Defender policy)
