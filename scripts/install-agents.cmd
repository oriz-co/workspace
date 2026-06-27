@echo off
REM ============================================================
REM  install-agents.cmd
REM
REM  Installs the 4 free coding agents wired to this workspace:
REM    - Claude Code   (already installed; verifies only)
REM    - OpenCode      (npm i -g opencode-ai)
REM    - Cline         (VS Code ext saoudrizwan.claude-dev)
REM    - Kilo Code     (VS Code ext kilocode.Kilo-Code)
REM
REM  Workspace-only. Touches NO global config files.
REM  All stubs are inside C:\D\oriz\.agents\
REM  All rules live in C:\D\oriz\AGENTS.md (workspace source of truth)
REM
REM  Idempotent. Self-elevates.
REM
REM  After completion: window stays open 30 s so you can read the
REM  output. Press any key to close immediately, or wait for the
REM  timeout. No beep on completion.
REM ============================================================
setlocal

net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo [bootstrap] re-launching as admin...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd -ArgumentList '/c %~f0 %*' -Verb RunAs"
  exit /b
)

where pwsh >nul 2>&1
if %ERRORLEVEL% EQU 0 (set "PS=pwsh") else (set "PS=powershell")

%PS% -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-agents.ps1" %*
set "RC=%ERRORLEVEL%"

echo.
echo ============================================================
if "%RC%"=="0" (
  echo  DONE. Exit code: 0
) else (
  echo  FAILED. Exit code: %RC%
)
echo  Window auto-closes in 30 s. Press any key to close now.
echo ============================================================
REM /NOBREAK = ignore Ctrl-C as "skip" (any other key still skips).
REM No "beep" or bell character anywhere, so Windows alert sound stays silent.
timeout /T 30 /NOBREAK >nul

exit /b %RC%

