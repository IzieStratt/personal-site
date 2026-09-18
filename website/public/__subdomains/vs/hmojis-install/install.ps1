# Installs the HiddenEmojis Taut plugin (Windows).
#
# Usage:
#   $env:HMOJI_TOKEN="<your token>"; iwr -useb https://vs.izie.top/hmojis-install/install.ps1 | iex
#
# This only ever touches your own machine, and only your user-plugins
# folder: it downloads the plugin build there. It does not touch
# config.jsonc - Taut's own JSONC parser handles inserting plugin config
# correctly (with comments intact), so enabling the plugin happens through
# Taut's Preferences UI, not this script. Nothing is uploaded anywhere. The
# group key and the list of secret emojis live on the server; this script
# never sees or stores them.

param(
  [string]$Token = $env:HMOJI_TOKEN
)

$ErrorActionPreference = "Stop"
$Server = "https://vs.izie.top/hmojis"

if ([string]::IsNullOrEmpty($Token)) {
  Write-Error 'no token given. set $env:HMOJI_TOKEN before running this, or pass -Token <your token>.'
  exit 1
}

$ConfigDir = Join-Path $env:APPDATA "taut"
$PluginDir = Join-Path $ConfigDir "user-plugins"

New-Item -ItemType Directory -Force -Path $PluginDir | Out-Null

Write-Host "fetching plugin build..."
Invoke-WebRequest -UseBasicParsing -Uri "$Server/plugin.js" `
  -Headers @{ Authorization = "Bearer $Token" } `
  -OutFile (Join-Path $PluginDir "HiddenEmojis.js")
Write-Host "saved to $PluginDir\HiddenEmojis.js"

Write-Host ""
Write-Host "now open Slack, go to Preferences > Taut, and enable 'Hidden Emojis'."
Write-Host "then edit its config and set:"
Write-Host ""
Write-Host "  `"authToken`": `"$Token`""
Write-Host ""
Write-Host "(serverUrl already defaults to $Server)"
