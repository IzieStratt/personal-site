#!/usr/bin/env bash
# Checks vs.izie.top's agent-facing endpoints (what Is Agentic probes).
# Usage: scripts/agent-smoke.sh [base]   default https://vs.izie.top; for `wrangler dev --local-upstream vs.izie.top` pass http://localhost:8787
set -u
B=${1:-https://vs.izie.top}
fail=0
check() { # name, expected status, header regex (or -), body regex (or -), curl args...
  local name=$1 want=$2 hre=$3 bre=$4; shift 4
  local out; out=$(curl -sS -i "$@")
  local status; status=$(printf '%s' "$out" | head -1 | awk '{print $2}')
  local ok=1
  [ "$status" = "$want" ] || ok=0
  [ "$hre" = - ] || printf '%s' "$out" | grep -qiE "$hre" || ok=0
  [ "$bre" = - ] || printf '%s' "$out" | grep -qE "$bre" || ok=0
  if [ $ok = 1 ]; then echo "ok   $name"; else echo "FAIL $name (status $status)"; fail=1; fi
}
check 'home as markdown'        200 '^content-type: text/markdown' '^# vs.izie.top' -H 'Accept: text/markdown' "$B/"
check 'home Vary: Accept'       200 '^vary: .*accept' - -H 'Accept: text/markdown' "$B/"
check 'home as html'            200 '^content-type: text/html' 'application/ld\+json' -H 'Accept: text/html' "$B/"
check 'markdown 404'            404 '^content-type: text/markdown' 'llms.txt' -H 'Accept: text/markdown' "$B/__smoke-404"
check 'json 404'                404 '^content-type: application/json' '"error":"not_found"' -H 'Accept: application/json' "$B/__smoke-404"
check 'api json 404'            404 '^content-type: application/json' 'method_not_in_catalog' "$B/redocumented/api/v1/methods/no.such.json"
check 'api 405'                 405 '^content-type: application/json' 'method_not_allowed' -X POST "$B/redocumented/api/v1/index.json"
check 'api rate-limit headers'  200 '^ratelimit-policy: ' '"name":"chat.postMessage"' "$B/redocumented/api/v1/methods/chat.postMessage.json"
check 'method markdown'         200 '^content-type: text/markdown' '^# chat.postMessage' "$B/redocumented/api/v1/methods/chat.postMessage.md"
check 'redoc as markdown'       200 '^content-type: text/markdown' '^# ReDocumented' -H 'Accept: text/markdown' "$B/redocumented/"
check 'llms.txt when-to-use'    200 - '## When to use' "$B/llms.txt"
check 'agents.txt'              200 '^content-type: text/markdown' '^# vs.izie.top' "$B/agents.txt"
check 'AGENTS.md'               200 '^content-type: text/markdown' '^# vs.izie.top' "$B/AGENTS.md"
check 'redoc agents.txt'        200 '^content-type: text/markdown' '^# ReDocumented' "$B/redocumented/agents.txt"
check 'well-known llms.txt'     200 '^content-type: text/markdown' '^# vs.izie.top' "$B/.well-known/llms.txt"
check 'api-catalog'             200 '^content-type: application/linkset\+json' 'openapi-catalog.json' "$B/.well-known/api-catalog"
check 'openapi alias'           302 '^location: .*openapi-catalog.json' - "$B/openapi.json"
check 'catalog spec'            200 '^content-type: application/json' '"openapi": "3.1.0"' "$B/redocumented/openapi-catalog.json"
check 'sitemap'                 200 '^content-type: application/xml' '<urlset' "$B/sitemap.xml"
check 'robots sitemap line'     200 - 'Sitemap: https://vs.izie.top/sitemap.xml' "$B/robots.txt"
for p in about contact privacy; do check "/$p/"  200 '^content-type: text/html' '<h1>' "$B/$p/"; done
check 'dgd no-JS text'          200 - 'About DeGoogledDict' "$B/dgd/"
exit $fail
