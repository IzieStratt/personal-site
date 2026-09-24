#!/usr/bin/env bash
# Installs the HMojis Taut plugin (macOS/Linux).
#
# Usage:
#   HMOJI_TOKEN=<your token> bash -c "$(curl -fsSL https://vs.izie.top/slack/hmojis-install/install.sh)"
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

set -euo pipefail

SERVER="https://vs.izie.top/slack/hmojis"
TOKEN="${HMOJI_TOKEN:-${1:-}}"

if [ -z "$TOKEN" ]; then
  echo "no token given. set HMOJI_TOKEN or pass it as the first argument." >&2
  exit 1
fi

case "$(uname -s)" in
  Darwin)
    CONFIG_DIR="$HOME/Library/Application Support/Taut"
    ;;
  Linux)
    CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/Taut"
    ;;
  *)
    echo "unrecognized OS: $(uname -s). this script supports macOS and Linux; use install.ps1 on Windows." >&2
    exit 1
    ;;
esac

# Taut's folder is "Taut" with a capital T (app.getPath('appData')/Taut). On a
# case-sensitive disk (Linux, or a case-sensitive APFS volume) a lowercase
# "taut" folder is a different folder that Taut never reads - older versions
# of this script used that name.
LEGACY_DIR="$(dirname "$CONFIG_DIR")/taut"
if [ -d "$LEGACY_DIR" ] && ! [ "$LEGACY_DIR" -ef "$CONFIG_DIR" ]; then
  echo "note: found an old lowercase folder, $LEGACY_DIR - Taut ignores it."
  echo "      installing into $CONFIG_DIR instead (you can delete the old one)."
fi

PLUGIN_DIR="$CONFIG_DIR/user-plugins"
mkdir -p "$PLUGIN_DIR"

echo "fetching plugin build..."
curl -fsSL "$SERVER/plugin.js" -o "$PLUGIN_DIR/HMojis.js"
echo "saved to $PLUGIN_DIR/HMojis.js"

echo ""
echo "now open Slack, go to Preferences > Taut, and enable 'HMojis'."
echo "then edit its config and set:"
echo ""
echo "  \"authToken\": \"$TOKEN\""
echo ""
echo "(serverUrl already defaults to $SERVER)"
echo ""
echo "the first time it starts, HMojis asks you to verify your Slack account:"
echo "click 'Verify now' and it posts a one-time code for you in a DM with the"
echo "HMojis bot. the token then works on this computer only."
