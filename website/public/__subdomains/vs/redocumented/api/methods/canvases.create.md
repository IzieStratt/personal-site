# canvases.create

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/canvases.create

Create canvas for a user

## Params

| name | required | type | description |
|---|---|---|---|
| `title` | no | string | Title of the newly created canvas. |
| `document_content` | no | string | Structure describing the type and value of the content to create. The markdown content is limited to 1 MiB (1,048,576 characters). |
| `channel_id` | no | string | Channel ID of the channel the canvas will be tabbed in. This is a required field for free teams. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "canvas_id": "F1234ABCD"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/canvases.create.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
