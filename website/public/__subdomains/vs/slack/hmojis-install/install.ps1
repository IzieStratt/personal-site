# Installs the HMojis Taut plugin (Windows).
#
# Usage:
#   $env:HMOJI_TOKEN="<your token>"; iwr -useb https://vs.izie.top/slack/hmojis-install/install.ps1 | iex
#
# The token comes from an invite (a DM from a friend who already uses Hidden
# Emojis) or from whoever runs the server. It does nothing until you verify:
# the first time the plugin starts it asks to post a one-time code from your
# Slack account in a DM with the HMojis bot, and ties the token to this
# computer. It works on one computer.
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
$Server = "https://vs.izie.top/slack/hmojis"

if ([string]::IsNullOrEmpty($Token)) {
  Write-Error 'no token given. set $env:HMOJI_TOKEN before running this, or pass -Token <your token>.'
  exit 1
}

$ConfigDir = Join-Path $env:APPDATA "Taut"  # Taut's own folder name (case matters on case-sensitive setups)
$PluginDir = Join-Path $ConfigDir "user-plugins"

New-Item -ItemType Directory -Force -Path $PluginDir | Out-Null

Write-Host "fetching plugin build..."
Invoke-WebRequest -UseBasicParsing -Uri "$Server/plugin.js" `
  -OutFile (Join-Path $PluginDir "HMojis.js")
Write-Host "saved to $PluginDir\HMojis.js"

Write-Host ""
Write-Host "now open Slack, go to Preferences > Taut, and enable 'HMojis'."
Write-Host "it finds your invite in your DMs (or asks you to paste the token) and"
Write-Host "saves it for you. if it ever can't, edit its config and add:"
Write-Host ""
Write-Host "  `"authToken`": `"$Token`""
Write-Host ""
Write-Host "the first time it starts, HMojis asks you to verify your Slack account:"
Write-Host "click 'Verify now' and it posts a one-time code for you in a DM with the"
Write-Host "HMojis bot. the token then works on this computer only."
