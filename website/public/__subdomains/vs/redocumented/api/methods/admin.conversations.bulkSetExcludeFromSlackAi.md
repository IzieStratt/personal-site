# admin.conversations.bulkSetExcludeFromSlackAi

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.conversations.bulkSetExcludeFromSlackAi

Exclude channels from Slack AI in bulk

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_ids` | yes | array | An array of channel IDs to exclude from Slack AI. |
| `exclude` | yes | boolean | Whether the channels should be excluded from Slack AI. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "bulk_action_id": "Ab123456",
    "not_added": [
        {
            "channel_id": "C12346",
            "error": "invalid_channel"
        }
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.conversations.bulkSetExcludeFromSlackAi.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
