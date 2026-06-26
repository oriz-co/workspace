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
exit /b %ERRORLEVEL%
