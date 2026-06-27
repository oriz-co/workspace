<#
.SYNOPSIS
  Install 4 coding agents wired to this workspace. WORKSPACE-ONLY.
  Touches NO global config files (no ~/.claude/, no ~/.config/, no ~/.gemini/).
  All rules live in C:\D\oriz\AGENTS.md.
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
# Suppress the noisy IWR progress bar (135 MB MSIX download streams 100k+
# lines otherwise and hides real errors).
$ProgressPreference = 'SilentlyContinue'

function Step($m) { Write-Host "`n=== $m ===" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "  [ok] $m"   -ForegroundColor Green }
function Warn($m) { Write-Host "  [!]  $m"   -ForegroundColor Yellow }
function Have($cmd) { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }

$Workspace = 'C:\D\oriz'

# ── 0. winget ─────────────────────────────────────────────────────────────
Step '0. winget'
if (-not (Have winget)) {
  Warn 'winget missing. Installing App Installer (Microsoft.DesktopAppInstaller)...'
  $msix = Join-Path $env:TEMP 'AppInstaller.msixbundle'

  # Cache: skip 135 MB redownload if previously fetched.
  $needDownload = $true
  if (Test-Path $msix) {
    $sizeMB = [math]::Round((Get-Item $msix).Length / 1MB, 1)
    if ($sizeMB -gt 50) {
      Ok ("Reusing cached MSIX at $msix ($sizeMB MB)")
      $needDownload = $false
    } else {
      Remove-Item $msix -Force
    }
  }
  if ($needDownload) {
    Write-Host '  Downloading App Installer (~135 MB)...' -ForegroundColor DarkGray
    try {
      Invoke-WebRequest -UseBasicParsing -Uri 'https://aka.ms/getwinget' -OutFile $msix
    } catch {
      throw "MSIX download failed: $($_.Exception.Message). Check internet, or download manually from https://aka.ms/getwinget and place at $msix"
    }
  }

  Write-Host '  Installing MSIX...' -ForegroundColor DarkGray
  try {
    Add-AppxPackage -Path $msix -ForceApplicationShutdown -ErrorAction Stop
  } catch {
    throw "Add-AppxPackage failed: $($_.Exception.Message). Corporate policy may block AppX install. Try installing 'App Installer' from Microsoft Store manually: https://www.microsoft.com/store/productId/9NBLGGH4NNS1"
  }
  $env:PATH = "$env:LOCALAPPDATA\Microsoft\WindowsApps;$env:PATH"
  if (-not (Have winget)) { throw 'winget install ran but command still not on PATH. Open a new cmd window and re-run.' }
}
Ok 'winget present'

# Helper: run a native cmd that prints progress to stderr without
# tripping PS's RemoteException-on-stderr behavior under strict mode.
function Invoke-Native($cmdline) {
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    & cmd /c "$cmdline 2>&1" | Out-Host
    return $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $prev
  }
}

# ── 1. Node (for OpenCode) ────────────────────────────────────────────────
Step '1. Node.js'
if (-not (Have node)) {
  Invoke-Native 'winget install --id OpenJS.NodeJS.LTS -e --silent --accept-source-agreements --accept-package-agreements --disable-interactivity' | Out-Null
  $env:PATH = "$env:ProgramFiles\nodejs;$env:PATH"
}
Ok ('node: ' + ((node --version 2>&1) | Out-String).Trim())

# ── 2. Claude Code (verify only) ──────────────────────────────────────────
Step '2. Claude Code'
if (Have claude) {
  Ok ('claude: ' + ((claude --version 2>&1) | Out-String).Trim())
} else {
  Warn 'claude CLI not on PATH. (Already installed per session context; no install attempted.)'
}

# ── 3. OpenCode ───────────────────────────────────────────────────────────
Step '3. OpenCode'
if (-not (Have opencode)) {
  Invoke-Native 'npm install -g opencode-ai' | Out-Null
  # npm global bin (%APPDATA%\npm) often isn't on PATH for a fresh shell.
  # Refresh in-process so the Have-check below sees it.
  $npmBin = Join-Path $env:APPDATA 'npm'
  if (Test-Path $npmBin) { $env:PATH = "$npmBin;$env:PATH" }
}
if (Have opencode) {
  Ok ('opencode: ' + ((opencode --version 2>&1) | Select-Object -First 1 | Out-String).Trim())
} else {
  # Last-ditch: check the path directly even if PATH refresh didn't help.
  $opencodeCmd = Join-Path $env:APPDATA 'npm\opencode.cmd'
  if (Test-Path $opencodeCmd) {
    Ok ("opencode installed at $opencodeCmd (PATH refresh needed - open new cmd window)")
  } else {
    Warn 'opencode install failed'
  }
}

# ── 4. VS Code + Cline + Kilo Code ────────────────────────────────────────
Step '4. VS Code + extensions'

# VS Code installs go to either system-wide or user-local. Check both.
$vsCodeBins = @(
  (Join-Path $env:LOCALAPPDATA 'Programs\Microsoft VS Code\bin'),
  (Join-Path $env:ProgramFiles  'Microsoft VS Code\bin')
)
foreach ($p in $vsCodeBins) {
  if (Test-Path $p) { $env:PATH = "$p;$env:PATH" }
}

if (-not (Have code)) {
  Invoke-Native 'winget install --id Microsoft.VisualStudioCode -e --silent --accept-source-agreements --accept-package-agreements --disable-interactivity' | Out-Null
  # Re-scan both possible install locations after winget.
  foreach ($p in $vsCodeBins) {
    if (Test-Path $p) { $env:PATH = "$p;$env:PATH" }
  }
}

if (Have code) {
  Ok ('code: ' + ((code --version 2>&1) | Select-Object -First 1 | Out-String).Trim())
  Invoke-Native 'code --install-extension saoudrizwan.claude-dev --force' | Out-Null
  Invoke-Native 'code --install-extension kilocode.Kilo-Code --force'     | Out-Null
  Ok 'Cline + Kilo Code installed via VS Code'
} else {
  Warn ("code CLI not on PATH. Looked in:`n     " + ($vsCodeBins -join "`n     ") + "`n  Open a new cmd window (PATH refresh) and re-run if VS Code was just installed.")
}

# ── 5. Wire .kilocode/rules -> .agents/kilocode/rules ─────────────────────
# Kilo Code reads <repo>/.kilocode/rules/ - symlink that to .agents/kilocode/rules/
# so the pointer file is picked up.
Step '5. Workspace symlink for Kilo Code'
$kilocodeDir = Join-Path $Workspace '.kilocode'
$kilocodeRules = Join-Path $kilocodeDir 'rules'
$agentsKiloRules = Join-Path $Workspace '.agents\kilocode\rules'

if (-not (Test-Path $kilocodeDir)) {
  New-Item -ItemType Directory -Path $kilocodeDir -Force | Out-Null
}
if (Test-Path $kilocodeRules) {
  # If it's already a symlink to the right target, leave it.
  $item = Get-Item $kilocodeRules -Force
  if ($item.LinkType -eq 'SymbolicLink' -and $item.Target -eq $agentsKiloRules) {
    Ok 'Symlink already correct'
  } else {
    Warn ".kilocode\rules exists and is not the expected symlink. Leaving in place; please remove manually if you want it symlinked."
  }
} else {
  try {
    New-Item -ItemType SymbolicLink -Path $kilocodeRules -Target $agentsKiloRules -ErrorAction Stop | Out-Null
    Ok ('symlinked .kilocode\rules -> .agents\kilocode\rules')
  } catch {
    # Symlinks need admin or developer mode; we self-elevated, so this should work.
    # If it still fails, fall back to a directory junction (works without dev mode).
    & cmd /c mklink /J "$kilocodeRules" "$agentsKiloRules" 2>&1 | Out-Host
    if (Test-Path $kilocodeRules) {
      Ok ('directory junction created .kilocode\rules -> .agents\kilocode\rules')
    } else {
      Warn 'Could not create symlink or junction. Kilo Code will not see the pointer until this is fixed.'
    }
  }
}

# ── 6. Summary ────────────────────────────────────────────────────────────
Step '6. Done'
Write-Host ''
Write-Host '  Workspace source of truth: C:\D\oriz\AGENTS.md' -ForegroundColor Green
Write-Host ''
Write-Host '  Agents wired:'
Write-Host '    - Claude Code (reads C:\D\oriz\CLAUDE.md + AGENTS.md)' -ForegroundColor Green
Write-Host '    - OpenCode    (reads C:\D\oriz\AGENTS.md)'             -ForegroundColor Green
Write-Host '    - Cline       (reads C:\D\oriz\AGENTS.md)'             -ForegroundColor Green
Write-Host '    - Kilo Code   (reads C:\D\oriz\.kilocode\rules\)'      -ForegroundColor Green
Write-Host ''
Write-Host '  No global files were modified.' -ForegroundColor DarkGray
Write-Host ''
