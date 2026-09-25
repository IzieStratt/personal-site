# client.getWebSocketURL

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/client.getWebSocketURL

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `primary_websocket_url` | string |
| `fallback_websocket_url` | string |
| `ttl_seconds` | number |
| `routing_context` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/client.getWebSocketURL.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
