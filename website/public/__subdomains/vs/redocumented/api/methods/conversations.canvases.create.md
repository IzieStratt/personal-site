# conversations.canvases.create

- status: documented
- verified: live-verified
- tokens: Live-verified 2026-09-25 with an xoxb: on a channel that already has canvas tabs it just adds another tab (no channel_canvas_already_exists). See methods/grid-admin-sandbox-2026-09.md.
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/conversations.canvases.create

Create a channel canvas for a channel

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | yes | string | Channel ID of the channel the canvas will be tabbed in. |
| `document_content` | no | string | Structure describing the type and value of the content to create. The markdown content is limited to 1 MiB (1,048,576 characters). |
| `title` | no | string | Title of the newly created canvas. |

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
JSON: https://vs.izie.top/redocumented/api/methods/conversations.canvases.create.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
