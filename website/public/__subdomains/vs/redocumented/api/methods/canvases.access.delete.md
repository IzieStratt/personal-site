# canvases.access.delete

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/canvases.access.delete

Remove access to a canvas for specified entities

## Params

| name | required | type | description |
|---|---|---|---|
| `canvas_id` | yes | string | Encoded ID of the canvas. |
| `channel_ids` | no | array | List of channels you wish to update access for. |
| `user_ids` | no | array | List of users you wish to update access for. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/canvases.access.delete.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
