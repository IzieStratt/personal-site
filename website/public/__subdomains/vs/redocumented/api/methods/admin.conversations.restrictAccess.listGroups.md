# admin.conversations.restrictAccess.listGroups

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.conversations.restrictAccess.listGroups

List all IDP Groups linked to a channel

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | yes | string |  |
| `team_id` | no | string | The workspace where the channel exists. This argument is required for channels only tied to one workspace, and optional for channels that are shared across an organization. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "group_ids": [
        "YOUR_GROUP_ID"
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.conversations.restrictAccess.listGroups.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
