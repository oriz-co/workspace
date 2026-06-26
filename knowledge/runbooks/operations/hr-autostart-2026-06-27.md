# Hr auto-start chain (Windows reboot → ready)

**Created:** 2026-06-27
**Status:** Active

## Boot sequence

1. User logs into Windows.
2. `DockerDesktop.lnk` in Startup folder → Docker Desktop launches.
   - Path: `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\DockerDesktop.lnk`
3. Container `headroom-proxy` has `--restart unless-stopped` → auto-starts when daemon is ready.
4. Safety net: Task Scheduler `DockerHeadroomEnsure` fires at logon+60s, then every 10min for 1h, running `docker start headroom-proxy` (idempotent). Catches slow daemon boot.

## Recovery (manual)

```cmd
"C:\Program Files\Docker\Docker\resources\bin\docker.exe" start headroom-proxy
```

Or trigger the safety net:

```bash
schtasks.exe -Run -TN DockerHeadroomEnsure
```

## Disable

```bash
# Remove startup shortcut
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\DockerDesktop.lnk"

# Remove safety-net task
schtasks.exe -Delete -TN DockerHeadroomEnsure -F
```

## Notes

- Old `HeadroomProxyAtLogin` task (pipx Hr) is disabled; superseded by Docker.
- XML source: `c:\D\oriz\.staging\docker-headroom-ensure.xml` (UTF-16 LE).
- SID baked into task XML: `S-1-5-21-74642-3284969411-2123768488-2802703`.
