# apps.connections.open

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/apps.connections.open

Generate a temporary Socket Mode WebSocket URL that your app can connect to in order to receive events and interactive payloads over.

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

```json
{
    "ok": true,
    "url": "wss://wss-somethiing.slack.com/link/?ticket=12348&app_id=5678"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.connections.open.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
