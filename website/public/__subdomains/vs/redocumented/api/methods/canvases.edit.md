# canvases.edit

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/canvases.edit

Update an existing canvas

## Params

| name | required | type | description |
|---|---|---|---|
| `canvas_id` | yes | string | Encoded ID of the canvas. |
| `changes` | yes | array | List of changes to apply on the specified canvas. The markdown content of each change is limited to 1 MiB (1,048,576 characters). |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/canvases.edit.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
