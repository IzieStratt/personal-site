# canvases.access.set

- status: documented
- verified: live-verified
- tokens: Live-verified 2026-09-25 with an xoxb: access_level=comment is accepted although docs only list read/write/owner; made-up values get invalid_arguments (must be a valid enum value). See methods/grid-admin-sandbox-2026-09.md.
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/canvases.access.set

Sets the access level to a canvas for specified entities

## Params

| name | required | type | description |
|---|---|---|---|
| `canvas_id` | yes | string | Encoded ID of the canvas. |
| `access_level` | yes | enum | Desired level of access. |
| `channel_ids` | no | array | List of channels you wish to update access for. Can only be used if user_ids is not provided. |
| `user_ids` | no | array | List of users you wish to update access for. Can only be used if channel_ids is not provided. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/canvases.access.set.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
