<#
.SYNOPSIS
  Install RTK + Ponytail. Idempotent. PS 5.1 + 7 compatible.

.DESCRIPTION
  Headroom is already running on :8787 (verified separately).
  This installs the two remaining speed-stack layers:
    - RTK (Rust Token Killer) - compresses shell-tool output
    - Ponytail - Claude Code plugin for output-side discipline

  Bootstraps winget if missing, then rustup, then cargo install rtk.
  Wires Ponytail by direct settings.json edit (idempotent).
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
# Suppress Invoke-WebRequest's progress bar - it streams hundreds of MB of
# progress-update text to the console and obscures real errors. Without this,
# downloading a 135 MB MSIX produces 100k+ lines of "Writing request stream..."
$ProgressPreference = 'SilentlyContinue'

function Step($m) { Write-Host "`n=== $m ===" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "  [ok] $m"   -ForegroundColor Green }
function Warn($m) { Write-Host "  [!]  $m"   -ForegroundColor Yellow }
function Have($cmd) { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }

# ── 0. winget bootstrap (needed for rustup on systems without it) ─────────
Step '0. Ensure winget'
if (-not (Have winget)) {
  Warn 'winget missing. Installing App Installer (Microsoft.DesktopAppInstaller)...'
  $msix = Join-Path $env:TEMP 'AppInstaller.msixbundle'

  # Cache the MSIX. Don't redownload 135 MB if a prior run already fetched it.
  $needDownload = $true
  if (Test-Path $msix) {
    $sizeMB = [math]::Round((Get-Item $msix).Length / 1MB, 1)
    if ($sizeMB -gt 50) {
      Ok ("Reusing cached MSIX at $msix ($sizeMB MB)")
      $needDownload = $false
    } else {
      Warn ("Cached MSIX too small ($sizeMB MB); re-downloading")
      Remove-Item $msix -Force
    }
  }
  if ($needDownload) {
    Write-Host '  Downloading App Installer (~135 MB)...' -ForegroundColor DarkGray
    try {
      Invoke-WebRequest -UseBasicParsing -Uri 'https://aka.ms/getwinget' -OutFile $msix
    } catch {
      throw "MSIX download failed: $($_.Exception.Message). Check your internet, or download manually from https://aka.ms/getwinget and place at $msix"
    }
    $sizeMB = [math]::Round((Get-Item $msix).Length / 1MB, 1)
    Ok ("Downloaded $sizeMB MB")
  }

  Write-Host '  Installing MSIX (may take 30-60 s)...' -ForegroundColor DarkGray
  try {
    Add-AppxPackage -Path $msix -ForceApplicationShutdown -ErrorAction Stop
  } catch {
    throw "Add-AppxPackage failed: $($_.Exception.Message). This usually means corporate policy blocks AppX install. Try: open https://www.microsoft.com/store/productId/9NBLGGH4NNS1 in browser and install App Installer from Microsoft Store manually."
  }
  $env:PATH = "$env:LOCALAPPDATA\Microsoft\WindowsApps;$env:PATH"
  if (-not (Have winget)) {
    throw 'winget install ran but command still not found. Close this shell and open a NEW cmd window, then re-run the .cmd.'
  }
}
Ok ('winget: ' + ((winget --version 2>&1) | Out-String).Trim())

# ── 1. Rust + cargo (for RTK) ─────────────────────────────────────────────
Step '1. Rust toolchain'
if (-not (Have cargo)) {
  Warn 'cargo missing. Installing Rustup via winget...'
  & winget install --id Rustlang.Rustup -e --silent `
      --accept-source-agreements --accept-package-agreements `
      --disable-interactivity 2>&1 | Out-Host
  $cargoBin = Join-Path $env:USERPROFILE '.cargo\bin'
  if (Test-Path $cargoBin) { $env:PATH = "$cargoBin;$env:PATH" }
  if (-not (Have cargo)) {
    throw 'Rustup installed but cargo not on PATH. Close this shell and re-run.'
  }
}
Ok ('cargo: ' + ((cargo --version 2>&1) | Out-String).Trim())

# ── 2. RTK ─────────────────────────────────────────────────────────────────
Step '2. RTK (Rust Token Killer)'
if (-not (Have rtk)) {
  Warn 'Installing RTK from source (cargo install --locked --git github.com/rtk-ai/rtk)...'
  & cargo install --locked --git https://github.com/rtk-ai/rtk rtk 2>&1 | Out-Host
  if ($LASTEXITCODE -ne 0) {
    Warn 'cargo install --git failed. Retrying via crates.io...'
    & cargo install --locked rtk 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) { throw 'RTK install failed via both git + crates.io.' }
  }
}
Ok ('rtk: ' + ((rtk --version 2>&1) | Out-String).Trim())

# rtk init -g writes hooks under ~/.claude. Safe to re-run.
& rtk init -g --yes 2>&1 | Out-Host
Ok 'RTK global hooks installed in ~/.claude/'

# ── 3. Ponytail (Claude Code plugin via settings.json) ────────────────────
Step '3. Ponytail'
$settingsPath = Join-Path $env:USERPROFILE '.claude\settings.json'
if (-not (Test-Path $settingsPath)) {
  throw "Claude Code settings.json not found at $settingsPath"
}

# Read as a hashtable, not a PSCustomObject - Add-Member on PSCustomObjects
# with empty hashtable property values trips PS 5.1's parser in some shells.
# Hashtable manipulation is unambiguous.
$json = Get-Content $settingsPath -Raw
# PS 5.1 ConvertFrom-Json does NOT have -AsHashtable; use a manual walk.
$obj = $json | ConvertFrom-Json

# Step 3a: ensure extraKnownMarketplaces.ponytail
if (-not ($obj.PSObject.Properties.Name -contains 'extraKnownMarketplaces')) {
  $obj | Add-Member -MemberType NoteProperty -Name 'extraKnownMarketplaces' -Value (New-Object PSObject)
}
$mkts = $obj.extraKnownMarketplaces
if (-not ($mkts.PSObject.Properties.Name -contains 'ponytail')) {
  $src = New-Object PSObject
  $src | Add-Member -MemberType NoteProperty -Name 'source' -Value 'github'
  $src | Add-Member -MemberType NoteProperty -Name 'repo'   -Value 'DietrichGebert/ponytail'
  $mkt = New-Object PSObject
  $mkt | Add-Member -MemberType NoteProperty -Name 'source' -Value $src
  $mkts | Add-Member -MemberType NoteProperty -Name 'ponytail' -Value $mkt
}

# Step 3b: ensure enabledPlugins["ponytail@ponytail"] = $true
if (-not ($obj.PSObject.Properties.Name -contains 'enabledPlugins')) {
  $obj | Add-Member -MemberType NoteProperty -Name 'enabledPlugins' -Value (New-Object PSObject)
}
$plugins = $obj.enabledPlugins
if (-not ($plugins.PSObject.Properties.Name -contains 'ponytail@ponytail')) {
  $plugins | Add-Member -MemberType NoteProperty -Name 'ponytail@ponytail' -Value $true
}

$obj | ConvertTo-Json -Depth 20 | Set-Content $settingsPath -Encoding utf8
Ok 'Ponytail wired into ~/.claude/settings.json (activates on next Claude Code launch)'

# ── 4. Headroom - verify the existing chain still works ───────────────────
Step '4. Headroom (verify only)'
try {
  $r = Invoke-RestMethod -Uri 'http://localhost:8787/health' -TimeoutSec 3
  Ok ("Headroom v{0} - ready={1}, uptime={2}s" -f $r.version, $r.ready, [int]$r.uptime_seconds)
} catch {
  Warn 'Headroom not reachable at :8787 - start it via Task Scheduler (existing setup).'
}

# ── 5. Summary ────────────────────────────────────────────────────────────
Step '5. Done'
Write-Host ''
Write-Host '  Layer 1 (Headroom) : http://localhost:8787  (Hr -> hai -> Bedrock)' -ForegroundColor Green
Write-Host '  Layer 2 (RTK)      : shell-output compression active'              -ForegroundColor Green
Write-Host '  Layer 3 (Ponytail) : settings.json updated (restart Claude Code)'  -ForegroundColor Green
Write-Host ''
Write-Host '  Restart Claude Code to activate Ponytail.' -ForegroundColor Yellow
Write-Host ''
