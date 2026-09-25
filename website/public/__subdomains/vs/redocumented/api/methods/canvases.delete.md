# canvases.delete

- status: documented
- verified: live-verified
- tokens: Live-verified 2026-09-25 with an xoxb: ok, but a channel tab for the canvas stays behind in conversations.info properties.tabs. See methods/grid-admin-sandbox-2026-09.md.
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/canvases.delete

Deletes a canvas

## Params

| name | required | type | description |
|---|---|---|---|
| `canvas_id` | yes | string | Encoded ID of the canvas. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/canvases.delete.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
